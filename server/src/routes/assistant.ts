import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { assistantQueries, matchingFeedback } from '../db/schema'
import { ownsAssistantQuery, runAssistantQuery } from '../lib/assistant'
import { assistantRateLimit, audit, auth, newId, type Variables } from '../lib/platform'
import { assistantQuery, matchingFeedbackInput } from '../lib/schemas'

export const assistantRoutes = new Hono<{ Variables: Variables }>()
assistantRoutes.use('*', auth)

assistantRoutes.get('/capabilities', (context) => context.json({
  engine: process.env.AI_ENABLED === 'true' && process.env.AI_BASE_URL && process.env.AI_MODEL
    ? 'hybrid'
    : 'deterministic',
  providerConfigured: Boolean(process.env.AI_ENABLED === 'true' && process.env.AI_BASE_URL && process.env.AI_MODEL),
  deterministicFallback: true,
  rawPromptStored: false,
  maxPromptLength: 2000,
  supportedLanguages: ['az', 'tr', 'en'],
  intents: [
    'find_teammate', 'find_mentor', 'find_job', 'find_startup', 'find_program',
    'find_partner', 'investor_discovery', 'platform_guidance',
  ],
}))

assistantRoutes.post('/query', assistantRateLimit, zValidator('json', assistantQuery), async (context) => {
  const response = await runAssistantQuery({ ...context.req.valid('json'), actor: context.get('user') })
  if (response.denied) return context.json({ error: 'This assistant workflow is not available for the active account role' }, 403)
  return context.json(response)
})

assistantRoutes.post('/feedback', zValidator('json', matchingFeedbackInput), async (context) => {
  const input = context.req.valid('json')
  const actor = context.get('user')
  const ownsQuery = actor.roles.includes('platform_admin') || await ownsAssistantQuery(input.queryId, actor.id)
  if (!ownsQuery) return context.json({ error: 'Assistant query not found' }, 404)

  const [existing] = await db.select({ id: matchingFeedback.id }).from(matchingFeedback).where(and(
    eq(matchingFeedback.queryId, input.queryId),
    eq(matchingFeedback.userId, actor.id),
    eq(matchingFeedback.resultType, input.resultType),
    eq(matchingFeedback.resultId, input.resultId),
    eq(matchingFeedback.action, input.action),
  )).limit(1)
  if (existing) {
    await db.update(matchingFeedback).set({ value: input.value, reason: input.reason }).where(eq(matchingFeedback.id, existing.id))
  } else {
    await db.insert(matchingFeedback).values({ ...input, id: newId('mfb'), userId: actor.id })
  }
  await audit(actor.id, 'assistant.feedback_recorded', 'assistant_query', input.queryId, 'Recorded assistant result feedback.', undefined, {
    resultType: input.resultType, resultId: input.resultId, action: input.action, value: input.value,
  })
  return context.body(null, 204)
})

