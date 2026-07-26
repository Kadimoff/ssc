import type { EvidenceArtifact } from '@/data/types'
import type { StartupData } from '@/data/platform-content'

export interface InvestorAnalytics {
  totalVentures: number
  averageReadiness: number
  investorReady: number
  evidenceCoverage: number
  milestoneCompletion: number
  teamCompleteness: number
  openRoles: number
  stageCounts: Record<string, number>
  sectorCounts: Record<string, number>
  readinessBands: Record<'emerging' | 'developing' | 'ready', number>
  watchedCount: number
}

export function computeInvestorAnalytics(startups: StartupData[], evidence: EvidenceArtifact[] = [], watched: ReadonlySet<string> = new Set()): InvestorAnalytics {
  const count = Math.max(1, startups.length)
  const stageCounts: Record<string, number> = {}
  const sectorCounts: Record<string, number> = {}
  let completed = 0
  let milestones = 0
  let teamTotal = 0
  let openRoles = 0
  for (const startup of startups) {
    stageCounts[startup.stage] = (stageCounts[startup.stage] ?? 0) + 1
    sectorCounts[startup.sector] = (sectorCounts[startup.sector] ?? 0) + 1
    completed += startup.milestones.filter((item) => item.status === 'done').length
    milestones += startup.milestones.length
    teamTotal += Math.min(100, Math.max(0, startup.team.length * 30 - startup.openRoles.length * 8 + 25))
    openRoles += startup.openRoles.length
  }
  const verifiedStartupEvidence = new Set(evidence.filter((item) => item.ownerType === 'startup' && item.verificationStatus === 'verified').map((item) => item.ownerId))
  return {
    totalVentures: startups.length,
    averageReadiness: Math.round(startups.reduce((sum, startup) => sum + startup.score, 0) / count),
    investorReady: startups.filter((startup) => startup.score >= 85).length,
    evidenceCoverage: Math.round(startups.filter((startup) => verifiedStartupEvidence.has(startup.slug)).length / count * 100),
    milestoneCompletion: Math.round(completed / Math.max(1, milestones) * 100),
    teamCompleteness: Math.round(teamTotal / count),
    openRoles,
    stageCounts,
    sectorCounts,
    readinessBands: {
      emerging: startups.filter((startup) => startup.score < 70).length,
      developing: startups.filter((startup) => startup.score >= 70 && startup.score < 85).length,
      ready: startups.filter((startup) => startup.score >= 85).length,
    },
    watchedCount: startups.filter((startup) => watched.has(startup.slug)).length,
  }
}
