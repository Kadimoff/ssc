import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { and, eq, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client'
import {
  comments, communityMemberships, connections, conversationParticipants, conversations,
  jobActions, jobs, messages, postActions, posts, users,
} from '../db/schema'
import { auth, newId, requireRoles, type Variables } from '../lib/platform'

export const socialRoutes = new Hono<{ Variables: Variables }>()
socialRoutes.use('*', auth)
socialRoutes.post('/posts', zValidator('json', z.object({
  content: z.string().min(1).max(5000), kind: z.string().max(30).default('update'),
  tags: z.array(z.string()).max(20).default([]), link: z.object({ title: z.string(), subtitle: z.string(), url: z.string() }).optional(),
})), async (context) => {
  const input = context.req.valid('json'), user = context.get('user')
  await db.insert(posts).values({ id: newId('pst'), authorId: user.id, content: input.content, kind: input.kind, type: input.kind[0].toUpperCase() + input.kind.slice(1), tags: input.tags, link: input.link })
  return context.body(null, 204)
})
socialRoutes.post('/posts/:id/:action', async (context) => {
  const kind = context.req.param('action') === 'like' ? 'liked' : 'saved'
  const userId = context.get('user').id, postId = context.req.param('id')
  const [existing] = await db.select().from(postActions).where(and(eq(postActions.userId, userId), eq(postActions.postId, postId), eq(postActions.kind, kind))).limit(1)
  if (existing) await db.delete(postActions).where(and(eq(postActions.userId, userId), eq(postActions.postId, postId), eq(postActions.kind, kind)))
  else await db.insert(postActions).values({ userId, postId, kind })
  return context.body(null, 204)
})
socialRoutes.post('/posts/:id/repost', async (context) => {
  const [post] = await db.select().from(posts).where(eq(posts.id, context.req.param('id'))).limit(1)
  if (post) await db.update(posts).set({ reposts: post.reposts + 1 }).where(eq(posts.id, post.id))
  return context.body(null, 204)
})
socialRoutes.post('/posts/:id/comments', zValidator('json', z.object({ text: z.string().min(1).max(2000) })), async (context) => {
  const postId = context.req.param('id')
  await db.transaction(async (tx) => {
    await tx.insert(comments).values({ id: newId('cmt'), postId, authorId: context.get('user').id, text: context.req.valid('json').text })
    const [post] = await tx.select().from(posts).where(eq(posts.id, postId)).limit(1)
    if (post) await tx.update(posts).set({ comments: post.comments + 1 }).where(eq(posts.id, postId))
  })
  return context.body(null, 204)
})
socialRoutes.delete('/admin/posts/:id', requireRoles('moderator'), async (context) => {
  await db.delete(posts).where(eq(posts.id, context.req.param('id')))
  return context.body(null, 204)
})
socialRoutes.patch('/users/me', async (context) => {
  const protectedFields = new Set(['id', 'username', 'passwordHash', 'role', 'roles', 'verificationStatus', 'createdAt'])
  const raw = await context.req.json<Record<string, unknown>>()
  const update = Object.fromEntries(Object.entries(raw).filter(([key]) => !protectedFields.has(key)))
  const [user] = await db.update(users).set(update).where(eq(users.id, context.get('user').id)).returning()
  const { passwordHash: _, ...safe } = user
  return context.json({ user: safe })
})
socialRoutes.post('/connections', zValidator('json', z.object({ user_id: z.string() })), async (context) => {
  const values = [context.get('user').id, context.req.valid('json').user_id].sort()
  await db.insert(connections).values({ userAId: values[0], userBId: values[1] }).onConflictDoNothing()
  return context.body(null, 204)
})
socialRoutes.post('/communities/:id/join', async (context) => {
  const row = { communityId: context.req.param('id'), userId: context.get('user').id }
  const [existing] = await db.select().from(communityMemberships).where(and(eq(communityMemberships.communityId, row.communityId), eq(communityMemberships.userId, row.userId))).limit(1)
  if (existing) await db.delete(communityMemberships).where(and(eq(communityMemberships.communityId, row.communityId), eq(communityMemberships.userId, row.userId)))
  else await db.insert(communityMemberships).values(row)
  return context.body(null, 204)
})
socialRoutes.post('/conversations', zValidator('json', z.object({ user_id: z.string() })), async (context) => {
  const me = context.get('user').id, other = context.req.valid('json').user_id
  const mine = await db.select().from(conversationParticipants).where(eq(conversationParticipants.userId, me))
  const theirs = new Set((await db.select().from(conversationParticipants).where(eq(conversationParticipants.userId, other))).map((row) => row.conversationId))
  const existing = mine.find((row) => theirs.has(row.conversationId))
  if (existing) return context.json({ id: existing.conversationId })
  const id = newId('cnv')
  await db.transaction(async (tx) => {
    await tx.insert(conversations).values({ id })
    await tx.insert(conversationParticipants).values([{ conversationId: id, userId: me }, { conversationId: id, userId: other }])
  })
  return context.json({ id }, 201)
})
socialRoutes.post('/conversations/:id/messages', zValidator('json', z.object({ text: z.string().min(1).max(5000) })), async (context) => {
  const conversationId = context.req.param('id'), senderId = context.get('user').id
  const [membership] = await db.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, senderId))).limit(1)
  if (!membership) return context.json({ error: 'Not a participant' }, 403)
  await db.insert(messages).values({ id: newId('msg'), conversationId, senderId, text: context.req.valid('json').text })
  return context.body(null, 204)
})
socialRoutes.post('/jobs/:id/:action', async (context) => {
  const kind = context.req.param('action') === 'apply' ? 'applied' : 'saved'
  const row = { jobId: context.req.param('id'), userId: context.get('user').id, kind }
  const where = and(eq(jobActions.jobId, row.jobId), eq(jobActions.userId, row.userId), eq(jobActions.kind, kind))
  if ((await db.select().from(jobActions).where(where).limit(1))[0]) await db.delete(jobActions).where(where)
  else await db.insert(jobActions).values(row)
  return context.body(null, 204)
})
socialRoutes.post('/admin/jobs', requireRoles('platform_admin'), async (context) => {
  const input = await context.req.json<typeof jobs.$inferInsert>()
  await db.insert(jobs).values({ ...input, id: newId('job') })
  return context.body(null, 204)
})
