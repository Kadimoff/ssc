import type { Context, MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { jwtVerify, SignJWT } from 'jose'
import Redis from 'ioredis'
import { db } from '../db/client'
import { auditLogs, users } from '../db/schema'

export type AuthUser = typeof users.$inferSelect
export type Variables = { user: AuthUser }

const secretText = process.env.JWT_SECRET
if (!secretText || secretText.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
const secret = new TextEncoder().encode(secretText)
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null

export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`
export const publicUser = ({ passwordHash: _passwordHash, ...user }: AuthUser) => user

export async function signToken(user: AuthUser) {
  return new SignJWT({ roles: user.roles, activeRole: user.activeRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('12h')
    .setIssuer('ssc-partnership-os')
    .sign(secret)
}

export const auth = createMiddleware<{ Variables: Variables }>(async (context, next) => {
  const authorization = context.req.header('authorization')
  if (!authorization?.startsWith('Bearer ')) return context.json({ error: 'Authentication required' }, 401)
  try {
    const { payload } = await jwtVerify(authorization.slice(7), secret, { issuer: 'ssc-partnership-os' })
    if (!payload.sub) throw new Error('Missing subject')
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1)
    if (!user) return context.json({ error: 'Account not found' }, 401)
    context.set('user', user)
    await next()
  } catch {
    return context.json({ error: 'Invalid or expired token' }, 401)
  }
})

export const optionalAuth = createMiddleware<{ Variables: Variables }>(async (context, next) => {
  const authorization = context.req.header('authorization')
  if (authorization?.startsWith('Bearer ')) {
    try {
      const { payload } = await jwtVerify(authorization.slice(7), secret, { issuer: 'ssc-partnership-os' })
      if (payload.sub) {
        const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1)
        if (user) context.set('user', user)
      }
    } catch { /* Anonymous snapshots remain available. */ }
  }
  await next()
})

export function requireRoles(...allowed: string[]): MiddlewareHandler<{ Variables: Variables }> {
  return async (context, next) => {
    const user = context.get('user')
    if (!user || (!user.roles.some((role) => allowed.includes(role)) && !user.roles.includes('platform_admin'))) {
      return context.json({ error: 'Insufficient role' }, 403)
    }
    await next()
  }
}

export async function audit(
  actorId: string, action: string, targetType: string, targetId: string, summary: string,
  organizationId?: string, metadata: Record<string, unknown> = {},
) {
  await db.insert(auditLogs).values({
    id: newId('aud'), actorId, action, targetType, targetId, summary, organizationId, metadata,
  })
}

export const rateLimit = createMiddleware(async (context, next) => {
  if (!redis) return next()
  try {
    if (redis.status === 'wait') await redis.connect()
    const source = context.req.header('x-forwarded-for')?.split(',')[0] ?? 'local'
    const minute = Math.floor(Date.now() / 60_000)
    const key = `rate:${source}:${minute}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 70)
    context.header('X-RateLimit-Limit', '120')
    context.header('X-RateLimit-Remaining', String(Math.max(0, 120 - count)))
    if (count > 120) return context.json({ error: 'Rate limit exceeded' }, 429)
  } catch {
    context.header('X-RateLimit-Status', 'degraded')
  }
  await next()
})

export const assistantRateLimit = createMiddleware<{ Variables: Variables }>(async (context, next) => {
  if (!redis) return next()
  try {
    if (redis.status === 'wait') await redis.connect()
    const user = context.get('user')
    const minute = Math.floor(Date.now() / 60_000)
    const key = `assistant-rate:${user.id}:${minute}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 70)
    context.header('X-RateLimit-Limit', '20')
    context.header('X-RateLimit-Remaining', String(Math.max(0, 20 - count)))
    if (count > 20) return context.json({ error: 'Assistant rate limit exceeded' }, 429)
  } catch {
    context.header('X-RateLimit-Status', 'degraded')
  }
  await next()
})

export function validated<T>(context: Context, value: T) { return value }
