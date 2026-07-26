import { describe, expect, it } from 'vitest'
import type { EvidenceArtifact } from '@/data/types'
import { startups } from '@/data/platform-content'
import { computeInvestorAnalytics } from './analytics'

describe('investor analytics', () => {
  it('derives every metric from current venture and evidence records', () => {
    const evidence: EvidenceArtifact[] = [{
      id: 'ev_1', type: 'milestone', title: 'Pilot evidence', description: '', ownerType: 'startup',
      ownerId: startups[0].slug, url: '', contentHash: 'hash', verificationStatus: 'verified',
      submittedBy: 'usr_1', verifiedBy: 'usr_1', createdAt: new Date().toISOString(),
    }]
    const analytics = computeInvestorAnalytics(startups, evidence, new Set([startups[0].slug]))
    expect(analytics.totalVentures).toBe(startups.length)
    expect(analytics.averageReadiness).toBe(84)
    expect(analytics.investorReady).toBe(2)
    expect(analytics.evidenceCoverage).toBe(33)
    expect(analytics.watchedCount).toBe(1)
    expect(analytics.openRoles).toBe(startups.reduce((sum, startup) => sum + startup.openRoles.length, 0))
  })

  it('returns safe zero-like percentages for an empty pipeline', () => {
    const analytics = computeInvestorAnalytics([])
    expect(analytics.totalVentures).toBe(0)
    expect(analytics.averageReadiness).toBe(0)
    expect(analytics.evidenceCoverage).toBe(0)
  })
})
