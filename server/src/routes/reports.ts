import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { contributions, evidenceArtifacts, organizations, outcomes, programs } from '../db/schema'
import { auth, requireRoles, type Variables } from '../lib/platform'

export const reportRoutes = new Hono<{ Variables: Variables }>()
reportRoutes.use('*', auth, requireRoles('program_manager', 'partner_admin'))

reportRoutes.get('/partnership-readiness', async (context) => {
  const [orgRows, programRows, contributionRows, outcomeRows, evidenceRows] = await Promise.all([
    db.select().from(organizations), db.select().from(programs), db.select().from(contributions),
    db.select().from(outcomes), db.select().from(evidenceArtifacts),
  ])
  const verifiedContributions = contributionRows.filter((row) => row.verificationStatus === 'verified')
  const verifiedOutcomes = outcomeRows.filter((row) => row.verificationStatus === 'verified')
  const verifiedEvidence = evidenceRows.filter((row) => row.verificationStatus === 'verified')
  const dimensions = {
    partnerGovernance: Math.min(100, orgRows.filter((row) => row.verificationStatus === 'verified').length * 20),
    jointDelivery: Math.min(100, programRows.filter((row) => ['active', 'completed'].includes(row.status)).length * 25),
    contributionIntegrity: contributionRows.length ? Math.round(100 * verifiedContributions.length / contributionRows.length) : 0,
    evidenceIntegrity: evidenceRows.length ? Math.round(100 * verifiedEvidence.length / evidenceRows.length) : 0,
    outcomeIntegrity: outcomeRows.length ? Math.round(100 * verifiedOutcomes.length / outcomeRows.length) : 0,
  }
  const score = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 5)
  return context.json({
    methodologyVersion: 'ssc-partnership-readiness-v1.0', generatedAt: new Date().toISOString(),
    score, dimensions,
    counts: { organizations: orgRows.length, programs: programRows.length, verifiedContributions: verifiedContributions.length, verifiedOutcomes: verifiedOutcomes.length, verifiedEvidence: verifiedEvidence.length },
    caveat: 'This operational readiness score is not a QS score and must not be presented as independent validation.',
  })
})

reportRoutes.get('/programs/:id/verified.csv', async (context) => {
  const programId = context.req.param('id')
  const [program] = await db.select().from(programs).where(eq(programs.id, programId)).limit(1)
  if (!program) return context.json({ error: 'Program not found' }, 404)
  const contributionRows = await db.select().from(contributions).where(and(eq(contributions.programId, programId), eq(contributions.verificationStatus, 'verified')))
  const outcomeRows = await db.select().from(outcomes).where(and(eq(outcomes.programId, programId), eq(outcomes.verificationStatus, 'verified')))
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['record_type', 'record_id', 'category', 'quantity_or_confidence', 'unit_or_attribution', 'achieved_or_verified_at'],
    ...contributionRows.map((row) => ['contribution', row.id, row.type, row.quantity, row.unit, row.verifiedAt?.toISOString() ?? '']),
    ...outcomeRows.map((row) => ['outcome', row.id, row.type, row.confidenceScore, row.attributionMode, row.achievedAt]),
  ]
  context.header('Content-Type', 'text/csv; charset=utf-8')
  context.header('Content-Disposition', `attachment; filename="${program.id}-verified-evidence.csv"`)
  return context.body(rows.map((row) => row.map(escape).join(',')).join('\n'))
})
