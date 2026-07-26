import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/client'
import { evidenceArtifacts, jobs, outcomes, posts, users } from '../db/schema'
import { runAssistantQuery } from '../lib/assistant'
import { assistantRateLimit, auth, requireRoles, type Variables } from '../lib/platform'
import { assistantQuery } from '../lib/schemas'

export const investorRoutes = new Hono<{ Variables: Variables }>()
investorRoutes.use('*', auth, requireRoles('investor', 'platform_admin'))
investorRoutes.get('/dashboard', async (context) => {
  const [userRows, postRows, jobRows, evidenceRows, outcomeRows] = await Promise.all([
    db.select().from(users), db.select().from(posts), db.select().from(jobs),
    db.select().from(evidenceArtifacts), db.select().from(outcomes),
  ])
  return context.json({
    generatedAt: new Date().toISOString(),
    access: 'investor',
    signals: {
      builders: userRows.length,
      updates: postRows.length,
      opportunities: jobRows.length,
      verifiedEvidence: evidenceRows.filter((item) => item.verificationStatus === 'verified').length,
      verifiedOutcomes: outcomeRows.filter((item) => item.verificationStatus === 'verified').length,
    },
    caveat: 'Demo and aggregate operating signals are not investment advice or verified financial performance.',
  })
})

investorRoutes.post('/discovery', assistantRateLimit, zValidator('json', assistantQuery), async (context) => {
  const response = await runAssistantQuery({
    ...context.req.valid('json'),
    actor: context.get('user'),
    forcedIntent: 'investor_discovery',
  })
  if (response.denied) return context.json({ error: 'Investor access required' }, 403)
  return context.json(response)
})
