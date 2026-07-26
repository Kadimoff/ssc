import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client'
import { users } from '../db/schema'
import { audit, newId, publicUser, signToken, type Variables } from '../lib/platform'

const credentials = z.object({ username: z.string().min(2).max(40), password: z.string().min(1).max(200) })
const registration = credentials.extend({
  password: z.string().min(8).max(200),
  name: z.string().min(2).max(120), email: z.string().email().max(250), title: z.string().max(150).optional(),
  company: z.string().max(150).optional(), industry: z.string().max(100).optional(),
  location: z.string().max(120).optional(), skills: z.string().max(1000).optional(),
  about: z.string().max(3000).optional(), availability: z.string().max(150).optional(), website: z.string().max(500).optional(),
})

export const authRoutes = new Hono<{ Variables: Variables }>()
  .post('/register', zValidator('json', registration), async (context) => {
    const input = context.req.valid('json')
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, input.username.toLowerCase())).limit(1)
    if (existing) return context.json({ error: 'Username already exists' }, 409)
    const id = newId('usr')
    const [user] = await db.insert(users).values({
      id, username: input.username.toLowerCase(), email: input.email.toLowerCase(),
      passwordHash: await Bun.password.hash(input.password, { algorithm: 'argon2id' }),
      name: input.name, title: input.title, company: input.company, industry: input.industry,
      location: input.location, skills: input.skills, about: input.about,
      availability: input.availability, website: input.website,
    }).returning()
    await audit(id, 'user.registered', 'user', id, 'User registered.')
    return context.json({ token: await signToken(user), user: publicUser(user) }, 201)
  })
  .post('/login', zValidator('json', credentials), async (context) => {
    const input = context.req.valid('json')
    const [user] = await db.select().from(users).where(eq(users.username, input.username.toLowerCase())).limit(1)
    if (!user || !await Bun.password.verify(input.password, user.passwordHash)) return context.json({ error: 'Invalid credentials' }, 401)
    return context.json({ token: await signToken(user), user: publicUser(user) })
  })
