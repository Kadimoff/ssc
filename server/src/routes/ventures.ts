import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { mentorProfiles, startupMembers, startupMilestones, startupRoles, startups, users } from '../db/schema'
import { audit, auth, newId, type AuthUser, type Variables } from '../lib/platform'
import { mentorProfile, startup, startupMember, startupMilestone, startupRole } from '../lib/schemas'

export const ventureRoutes = new Hono<{ Variables: Variables }>()
ventureRoutes.use('*', auth)

async function canManageStartup(startupId: string, actor: AuthUser) {
  if (actor.roles.includes('platform_admin')) return true
  const [membership] = await db.select({ id: startupMembers.id }).from(startupMembers)
    .where(and(eq(startupMembers.startupId, startupId), eq(startupMembers.userId, actor.id), eq(startupMembers.status, 'active'))).limit(1)
  return Boolean(membership)
}

ventureRoutes.get('/startups', async (context) => {
  const rows = await db.select().from(startups).where(eq(startups.status, 'active'))
  return context.json(rows)
})

ventureRoutes.post('/startups', zValidator('json', startup), async (context) => {
  const input = context.req.valid('json'), actor = context.get('user'), startupId = newId('stp')
  await db.transaction(async (tx) => {
    await tx.insert(startups).values({ ...input, id: startupId, createdBy: actor.id })
    await tx.insert(startupMembers).values({
      id: newId('stm'), startupId, userId: actor.id, title: 'Founder', status: 'active',
    })
  })
  await audit(actor.id, 'startup.created', 'startup', startupId, `Created startup ${input.name}.`)
  return context.json({ id: startupId }, 201)
})

ventureRoutes.patch('/startups/:id', async (context) => {
  const startupId = context.req.param('id'), actor = context.get('user')
  if (!await canManageStartup(startupId, actor)) return context.json({ error: 'Startup not found' }, 404)
  const parsed = startup.partial().safeParse(await context.req.json())
  if (!parsed.success) return context.json({ error: 'Invalid startup update', issues: parsed.error.issues }, 400)
  const [updated] = await db.update(startups).set({ ...parsed.data, updatedAt: new Date() }).where(eq(startups.id, startupId)).returning({ id: startups.id })
  if (!updated) return context.json({ error: 'Startup not found' }, 404)
  await audit(actor.id, 'startup.updated', 'startup', startupId, 'Updated startup profile.')
  return context.body(null, 204)
})

ventureRoutes.post('/startups/:id/members', zValidator('json', startupMember), async (context) => {
  const startupId = context.req.param('id'), actor = context.get('user'), input = context.req.valid('json')
  if (!await canManageStartup(startupId, actor)) return context.json({ error: 'Startup not found' }, 404)
  const [targetUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, input.userId)).limit(1)
  if (!targetUser) return context.json({ error: 'User not found' }, 404)
  const id = newId('stm')
  await db.insert(startupMembers).values({ ...input, id, startupId }).onConflictDoUpdate({
    target: [startupMembers.startupId, startupMembers.userId],
    set: { title: input.title, status: input.status },
  })
  await audit(actor.id, 'startup.member_added', 'startup', startupId, 'Added or updated a startup team member.', undefined, { memberUserId: input.userId })
  return context.json({ id }, 201)
})

ventureRoutes.post('/startups/:id/roles', zValidator('json', startupRole), async (context) => {
  const startupId = context.req.param('id'), actor = context.get('user')
  if (!await canManageStartup(startupId, actor)) return context.json({ error: 'Startup not found' }, 404)
  const id = newId('str'), input = context.req.valid('json')
  await db.insert(startupRoles).values({ ...input, id, startupId })
  await audit(actor.id, 'startup.role_created', 'startup', startupId, `Created startup role ${input.title}.`)
  return context.json({ id }, 201)
})

ventureRoutes.patch('/startup-roles/:id', async (context) => {
  const roleId = context.req.param('id'), actor = context.get('user')
  const [role] = await db.select().from(startupRoles).where(eq(startupRoles.id, roleId)).limit(1)
  if (!role || !await canManageStartup(role.startupId, actor)) return context.json({ error: 'Startup role not found' }, 404)
  const parsed = startupRole.partial().safeParse(await context.req.json())
  if (!parsed.success) return context.json({ error: 'Invalid startup role update', issues: parsed.error.issues }, 400)
  await db.update(startupRoles).set(parsed.data).where(eq(startupRoles.id, roleId))
  await audit(actor.id, 'startup.role_updated', 'startup_role', roleId, 'Updated startup role.')
  return context.body(null, 204)
})

ventureRoutes.post('/startups/:id/milestones', zValidator('json', startupMilestone), async (context) => {
  const startupId = context.req.param('id'), actor = context.get('user')
  if (!await canManageStartup(startupId, actor)) return context.json({ error: 'Startup not found' }, 404)
  const id = newId('sml'), input = context.req.valid('json')
  await db.insert(startupMilestones).values({ ...input, id, startupId })
  await audit(actor.id, 'startup.milestone_created', 'startup', startupId, `Created startup milestone ${input.title}.`)
  return context.json({ id }, 201)
})

ventureRoutes.patch('/startup-milestones/:id', async (context) => {
  const milestoneId = context.req.param('id'), actor = context.get('user')
  const [milestone] = await db.select().from(startupMilestones).where(eq(startupMilestones.id, milestoneId)).limit(1)
  if (!milestone || !await canManageStartup(milestone.startupId, actor)) return context.json({ error: 'Startup milestone not found' }, 404)
  const parsed = startupMilestone.partial().safeParse(await context.req.json())
  if (!parsed.success) return context.json({ error: 'Invalid startup milestone update', issues: parsed.error.issues }, 400)
  await db.update(startupMilestones).set(parsed.data).where(eq(startupMilestones.id, milestoneId))
  await audit(actor.id, 'startup.milestone_updated', 'startup_milestone', milestoneId, 'Updated startup milestone.')
  return context.body(null, 204)
})

ventureRoutes.get('/mentors', async (context) => {
  const rows = await db.select({
    id: mentorProfiles.id, userId: mentorProfiles.userId, name: users.name, title: users.title,
    expertise: mentorProfiles.expertise, company: mentorProfiles.company, rating: mentorProfiles.rating,
    sessions: mentorProfiles.sessions, availability: mentorProfiles.availability,
    focusStage: mentorProfiles.focusStage, bio: mentorProfiles.bio, status: mentorProfiles.status,
  }).from(mentorProfiles).innerJoin(users, eq(mentorProfiles.userId, users.id)).where(eq(mentorProfiles.status, 'active'))
  return context.json(rows)
})

ventureRoutes.put('/mentors/me', zValidator('json', mentorProfile), async (context) => {
  const actor = context.get('user'), input = context.req.valid('json')
  if (!actor.roles.some((role) => ['mentor', 'platform_admin'].includes(role))) {
    return context.json({ error: 'Mentor role required' }, 403)
  }
  const [existing] = await db.select({ id: mentorProfiles.id }).from(mentorProfiles).where(eq(mentorProfiles.userId, actor.id)).limit(1)
  const id = existing?.id ?? newId('mtr')
  if (existing) await db.update(mentorProfiles).set(input).where(eq(mentorProfiles.id, id))
  else await db.insert(mentorProfiles).values({ ...input, id, userId: actor.id })
  await audit(actor.id, existing ? 'mentor.updated' : 'mentor.created', 'mentor_profile', id, existing ? 'Updated mentor profile.' : 'Created mentor profile.')
  return context.json({ id }, existing ? 200 : 201)
})

