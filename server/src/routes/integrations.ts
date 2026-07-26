import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client'
import { integrationConnections, integrationDeliveries, programs } from '../db/schema'
import { dispatchIntegrationEvent } from '../lib/integrations'
import { audit, auth, newId, requireRoles, type Variables } from '../lib/platform'

export const integrationRoutes = new Hono<{ Variables: Variables }>()
integrationRoutes.use('*', auth)
integrationRoutes.post('/', requireRoles('partner_admin'), zValidator('json', z.object({
  organizationId: z.string(), provider: z.enum(['slack', 'discord', 'webhook']), name: z.string().min(2).max(100),
  endpointUrl: z.string().url().refine((value) => value.startsWith('https://'), 'HTTPS is required'),
  eventTypes: z.array(z.string()).min(1).max(30),
})), async (context) => {
  const input = context.req.valid('json'), actor = context.get('user'), id = newId('int')
  const signingSecret = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  await db.insert(integrationConnections).values({ ...input, id, signingSecret, createdBy: actor.id })
  await audit(actor.id, 'integration.created', 'integration', id, `Created ${input.provider} integration.`, input.organizationId)
  return context.json({ id, signingSecret }, 201)
})
integrationRoutes.post('/:id/test', requireRoles('partner_admin'), async (context) => {
  const [connection] = await db.select().from(integrationConnections).where(eq(integrationConnections.id, context.req.param('id'))).limit(1)
  if (!connection) return context.json({ error: 'Integration not found' }, 404)
  await dispatchIntegrationEvent(connection.organizationId, 'integration.test', { integrationId: connection.id })
  return context.body(null, 202)
})
integrationRoutes.get('/:id/deliveries', requireRoles('partner_admin'), async (context) => {
  return context.json(await db.select().from(integrationDeliveries).where(eq(integrationDeliveries.integrationId, context.req.param('id'))))
})
integrationRoutes.get('/programs/:id/calendar.ics', async (context) => {
  const [program] = await db.select().from(programs).where(eq(programs.id, context.req.param('id'))).limit(1)
  if (!program) return context.json({ error: 'Program not found' }, 404)
  const compact = (value: string) => value.replace(/-/g, '')
  const safe = (value: string) => value.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, '\\n')
  const calendar = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SSC//Partnership OS//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${program.id}@ssc.local`, `DTSTART;VALUE=DATE:${compact(program.startsAt)}`,
    `DTEND;VALUE=DATE:${compact(program.endsAt)}`, `SUMMARY:${safe(program.name)}`,
    `DESCRIPTION:${safe(program.description)}`, 'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
  context.header('Content-Type', 'text/calendar; charset=utf-8')
  context.header('Content-Disposition', `attachment; filename="${program.id}.ics"`)
  return context.body(calendar)
})
