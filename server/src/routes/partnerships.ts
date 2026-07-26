import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client'
import {
  agreementParties, agreements, contributions, organizations, outcomes, programPartners, programs,
} from '../db/schema'
import { audit, auth, newId, requireRoles, type Variables } from '../lib/platform'
import {
  agreement, agreementStatus, contribution, organization, outcome, program, programPartner, verificationStatus,
} from '../lib/schemas'
import { dispatchIntegrationEvent } from '../lib/integrations'

export const partnershipRoutes = new Hono<{ Variables: Variables }>()
partnershipRoutes.use('*', auth)

partnershipRoutes.post('/organizations', requireRoles('partner_admin', 'program_manager'), zValidator('json', organization), async (context) => {
  const input = context.req.valid('json'), id = newId('org'), actor = context.get('user')
  await db.transaction(async (tx) => {
    await tx.insert(organizations).values({ ...input, id })
    await tx.insert((await import('../db/schema')).auditLogs).values({
      id: newId('aud'), actorId: actor.id, organizationId: id, action: 'organization.created',
      targetType: 'organization', targetId: id, summary: `Created organization ${input.displayName}.`,
    })
  })
  return context.json({ id }, 201)
})
partnershipRoutes.patch('/organizations/:id', requireRoles('partner_admin'), async (context) => {
  const id = context.req.param('id'), parsed = organization.partial().safeParse(await context.req.json())
  if (!parsed.success) return context.json({ error: 'Invalid organization update', issues: parsed.error.issues }, 400)
  await db.update(organizations).set(parsed.data).where(eq(organizations.id, id))
  await audit(context.get('user').id, 'organization.updated', 'organization', id, 'Updated organization.', id)
  return context.body(null, 204)
})
partnershipRoutes.post('/organizations/:id/verification', requireRoles('platform_admin'), zValidator('json', z.object({ status: verificationStatus })), async (context) => {
  const id = context.req.param('id'), status = context.req.valid('json').status
  await db.update(organizations).set({ verificationStatus: status }).where(eq(organizations.id, id))
  await audit(context.get('user').id, 'organization.verification_changed', 'organization', id, `Set verification to ${status}.`, id)
  return context.body(null, 204)
})

partnershipRoutes.post('/agreements', requireRoles('partner_admin', 'program_manager'), zValidator('json', agreement), async (context) => {
  const { partyOrganizationIds, ...input } = context.req.valid('json'), id = newId('agr'), actor = context.get('user')
  await db.transaction(async (tx) => {
    await tx.insert(agreements).values({ ...input, id, createdBy: actor.id })
    await tx.insert(agreementParties).values(partyOrganizationIds.map((organizationId, index) => ({
      id: newId('agp'), agreementId: id, organizationId, role: index === 0 ? 'lead party' : 'partner',
      responsibilitySummary: 'Responsibilities pending confirmation.',
    })))
  })
  await audit(actor.id, 'agreement.created', 'agreement', id, `Created agreement ${input.title}.`)
  return context.json({ id }, 201)
})
partnershipRoutes.post('/agreements/:id/status', requireRoles('partner_admin'), zValidator('json', z.object({ status: agreementStatus })), async (context) => {
  const id = context.req.param('id'), target = context.req.valid('json').status
  const [current] = await db.select().from(agreements).where(eq(agreements.id, id)).limit(1)
  if (!current) return context.json({ error: 'Agreement not found' }, 404)
  const transitions: Record<string, string[]> = {
    draft: ['pending_signature', 'terminated'], pending_signature: ['draft', 'active', 'terminated'],
    active: ['expired', 'terminated'], expired: [], terminated: [],
  }
  if (!transitions[current.status]?.includes(target)) return context.json({ error: `Cannot move agreement from ${current.status} to ${target}` }, 409)
  await db.update(agreements).set({ status: target }).where(eq(agreements.id, id))
  await audit(context.get('user').id, 'agreement.status_changed', 'agreement', id, `Moved agreement to ${target}.`)
  if (target === 'active') {
    const [party] = await db.select().from(agreementParties).where(eq(agreementParties.agreementId, id)).limit(1)
    if (party) await dispatchIntegrationEvent(party.organizationId, 'agreement.activated', { agreementId: id })
  }
  return context.body(null, 204)
})

partnershipRoutes.post('/programs', requireRoles('program_manager'), zValidator('json', program), async (context) => {
  const input = context.req.valid('json'), id = newId('prg')
  await db.insert(programs).values({ ...input, id })
  await audit(context.get('user').id, 'program.created', 'program', id, `Created program ${input.name}.`, input.hostOrganizationId)
  return context.json({ id }, 201)
})
partnershipRoutes.post('/program-partners', requireRoles('program_manager', 'partner_admin'), zValidator('json', programPartner), async (context) => {
  const input = context.req.valid('json'), id = newId('ppn')
  await db.insert(programPartners).values({ ...input, id })
  await audit(context.get('user').id, 'program.partner_added', 'program', input.programId, `Added ${input.organizationId} as ${input.role}.`, input.organizationId)
  return context.json({ id }, 201)
})

partnershipRoutes.post('/contributions', requireRoles('program_manager', 'partner_admin'), zValidator('json', contribution), async (context) => {
  const input = context.req.valid('json'), id = newId('ctr')
  await db.insert(contributions).values({ ...input, id, verificationStatus: 'pending' })
  await audit(context.get('user').id, 'contribution.recorded', 'contribution', id, `Recorded ${input.type}.`, input.organizationId)
  return context.json({ id }, 201)
})
partnershipRoutes.post('/contributions/:id/verification', requireRoles('program_manager'), zValidator('json', z.object({ status: verificationStatus })), async (context) => {
  const id = context.req.param('id'), actor = context.get('user'), status = context.req.valid('json').status
  const [row] = await db.update(contributions).set({ verificationStatus: status, verifiedBy: actor.id, verifiedAt: new Date() }).where(eq(contributions.id, id)).returning()
  if (!row) return context.json({ error: 'Contribution not found' }, 404)
  await audit(actor.id, 'contribution.verification_changed', 'contribution', id, `Set contribution verification to ${status}.`, row.organizationId)
  await dispatchIntegrationEvent(row.organizationId, 'contribution.verification_changed', { contributionId: id, status })
  return context.body(null, 204)
})

partnershipRoutes.post('/outcomes', requireRoles('program_manager'), zValidator('json', outcome), async (context) => {
  const input = context.req.valid('json'), id = newId('out')
  await db.insert(outcomes).values({ ...input, id, verificationStatus: 'pending' })
  await audit(context.get('user').id, 'outcome.recorded', 'outcome', id, `Recorded ${input.type}.`, input.primaryPartnerId)
  return context.json({ id }, 201)
})
