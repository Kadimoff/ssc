export type RankingCategory = 'startups' | 'founders' | 'universities' | 'communities'
export type RankingPeriod = '30d' | 'quarter' | 'all'
export type RankingSort = 'overall' | 'growth' | 'milestones' | 'community' | 'activity'

export type RankingBreakdown = {
  execution: number
  evidence: number
  milestones: number
  team: number
  community: number
  activity: number
}

export type RankingEntry = {
  slug: string
  name: string
  university: string
  sector: string
  stage: string
  score: number
  change: number
  verifiedEvidence: boolean
  strongestSignal: string
  lastActivity: string
  activityRecency: number
  milestoneProgress: number
  communityContribution: number
  growth: number
  periodScores: Record<RankingPeriod, number>
  breakdown: RankingBreakdown
}

type RawRankingEntry = Partial<RankingEntry> & Pick<RankingEntry, 'slug' | 'name'>

const clampScore = (value: unknown) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return Math.min(100, Math.max(0, Math.round(numeric)))
}

export function normalizeRankingEntry(entry: RawRankingEntry): RankingEntry | null {
  if (!entry.slug.trim() || !entry.name.trim()) return null
  const score = clampScore(entry.score)
  const fallbackBreakdown: RankingBreakdown = {
    execution: score,
    evidence: score,
    milestones: score,
    team: score,
    community: score,
    activity: score,
  }
  return {
    slug: entry.slug,
    name: entry.name,
    university: entry.university?.trim() || 'University not recorded',
    sector: entry.sector?.trim() || 'Uncategorized',
    stage: entry.stage?.trim() || 'Not recorded',
    score,
    change: Number.isFinite(entry.change) ? Math.trunc(entry.change ?? 0) : 0,
    verifiedEvidence: Boolean(entry.verifiedEvidence),
    strongestSignal: entry.strongestSignal?.trim() || 'No verified signal recorded',
    lastActivity: entry.lastActivity?.trim() || 'No recent activity',
    activityRecency: clampScore(entry.activityRecency),
    milestoneProgress: clampScore(entry.milestoneProgress),
    communityContribution: clampScore(entry.communityContribution),
    growth: clampScore(entry.growth),
    periodScores: {
      '30d': clampScore(entry.periodScores?.['30d'] ?? score),
      quarter: clampScore(entry.periodScores?.quarter ?? score),
      all: clampScore(entry.periodScores?.all ?? score),
    },
    breakdown: {
      execution: clampScore(entry.breakdown?.execution ?? fallbackBreakdown.execution),
      evidence: clampScore(entry.breakdown?.evidence ?? fallbackBreakdown.evidence),
      milestones: clampScore(entry.breakdown?.milestones ?? fallbackBreakdown.milestones),
      team: clampScore(entry.breakdown?.team ?? fallbackBreakdown.team),
      community: clampScore(entry.breakdown?.community ?? fallbackBreakdown.community),
      activity: clampScore(entry.breakdown?.activity ?? fallbackBreakdown.activity),
    },
  }
}

const rawStartupRankings: RawRankingEntry[] = [
  {
    slug: 'mediroute', name: 'MediRoute', university: 'Azerbaijan Medical University', sector: 'HealthTech', stage: 'Pilot',
    score: 91, change: 1, verifiedEvidence: true, strongestSignal: 'Two hospital-network pilots', lastActivity: 'Evidence verified 3h ago',
    activityRecency: 94, milestoneProgress: 90, communityContribution: 68, growth: 83,
    periodScores: { '30d': 91, quarter: 89, all: 87 },
    breakdown: { execution: 94, evidence: 96, milestones: 90, team: 86, community: 68, activity: 94 },
  },
  {
    slug: 'campus-cart', name: 'CampusCart', university: 'ADA University', sector: 'Marketplace', stage: 'Revenue',
    score: 88, change: 2, verifiedEvidence: true, strongestSignal: 'Repeat transactions across two campuses', lastActivity: 'Traction updated 5h ago',
    activityRecency: 92, milestoneProgress: 86, communityContribution: 91, growth: 89,
    periodScores: { '30d': 88, quarter: 85, all: 82 },
    breakdown: { execution: 90, evidence: 86, milestones: 86, team: 84, community: 91, activity: 92 },
  },
  {
    slug: 'greenstack', name: 'GreenStack', university: 'Baku State University', sector: 'ClimateTech', stage: 'MVP',
    score: 86, change: -1, verifiedEvidence: true, strongestSignal: '1,000+ users and two faculty pilots', lastActivity: 'Milestone completed 2h ago',
    activityRecency: 96, milestoneProgress: 88, communityContribution: 76, growth: 94,
    periodScores: { '30d': 86, quarter: 84, all: 80 },
    breakdown: { execution: 92, evidence: 88, milestones: 88, team: 78, community: 76, activity: 96 },
  },
  {
    slug: 'mindharbor', name: 'MindHarbor', university: 'Khazar University', sector: 'Wellbeing', stage: 'Pilot',
    score: 82, change: 3, verifiedEvidence: true, strongestSignal: 'Privacy workflow independently reviewed', lastActivity: 'Pilot note added yesterday',
    activityRecency: 82, milestoneProgress: 84, communityContribution: 80, growth: 74,
    periodScores: { '30d': 82, quarter: 78, all: 75 },
    breakdown: { execution: 84, evidence: 92, milestones: 84, team: 90, community: 80, activity: 82 },
  },
  {
    slug: 'agrivision', name: 'AgriVision', university: 'Ganja State University', sector: 'AgriTech', stage: 'MVP',
    score: 79, change: 0, verifiedEvidence: false, strongestSignal: 'Active field pilot with 12 farms', lastActivity: 'Field dataset submitted 1d ago',
    activityRecency: 80, milestoneProgress: 81, communityContribution: 72, growth: 78,
    periodScores: { '30d': 79, quarter: 77, all: 73 },
    breakdown: { execution: 84, evidence: 66, milestones: 81, team: 72, community: 72, activity: 80 },
  },
  {
    slug: 'skillbridge-ai', name: 'SkillBridge AI', university: 'Baku Engineering University', sector: 'EdTech', stage: 'Validation',
    score: 74, change: 2, verifiedEvidence: false, strongestSignal: 'Three university beta partners', lastActivity: 'Beta feedback added 2d ago',
    activityRecency: 76, milestoneProgress: 72, communityContribution: 79, growth: 81,
    periodScores: { '30d': 74, quarter: 71, all: 68 },
    breakdown: { execution: 76, evidence: 62, milestones: 72, team: 78, community: 79, activity: 76 },
  },
  {
    slug: 'legal-lens', name: 'LegalLens', university: 'UNEC', sector: 'LegalTech', stage: 'Validation',
    score: 68, change: 1, verifiedEvidence: false, strongestSignal: '42 structured customer interviews', lastActivity: 'Prototype note added 4d ago',
    activityRecency: 65, milestoneProgress: 70, communityContribution: 66, growth: 72,
    periodScores: { '30d': 68, quarter: 65, all: 61 },
    breakdown: { execution: 72, evidence: 58, milestones: 70, team: 54, community: 66, activity: 65 },
  },
  {
    slug: 'routewise', name: 'RouteWise', university: 'ASOIU', sector: 'Mobility', stage: 'Idea',
    score: 61, change: -1, verifiedEvidence: false, strongestSignal: '120 structured accessibility observations', lastActivity: 'Research log added 6d ago',
    activityRecency: 58, milestoneProgress: 64, communityContribution: 74, growth: 60,
    periodScores: { '30d': 61, quarter: 60, all: 57 },
    breakdown: { execution: 62, evidence: 52, milestones: 64, team: 44, community: 74, activity: 58 },
  },
]

export const startupRankings = rawStartupRankings
  .map(normalizeRankingEntry)
  .filter((entry): entry is RankingEntry => entry !== null)

export type CategoryRankingEntry = {
  id: string
  name: string
  meta: string
  score: number
  change: number
  signal: string
}

export const categoryRankings: Record<Exclude<RankingCategory, 'startups'>, CategoryRankingEntry[]> = {
  founders: [
    { id: 'founder-1', name: 'Aysel Mammadova', meta: 'CampusCart · ADA University', score: 89, change: 2, signal: 'Marketplace traction and community contribution' },
    { id: 'founder-2', name: 'Nihat Abbasov', meta: 'GreenStack · Baku State University', score: 86, change: 1, signal: 'Verified pilot execution' },
    { id: 'founder-3', name: 'Rauf Hajiyev', meta: 'AgriVision · Ganja State University', score: 78, change: 3, signal: 'Regional field evidence' },
  ],
  universities: [
    { id: 'university-1', name: 'ADA University', meta: '14 active ventures', score: 88, change: 1, signal: 'Founder activity and verified milestones' },
    { id: 'university-2', name: 'Baku State University', meta: '19 active ventures', score: 85, change: 0, signal: 'Climate and research-led pilots' },
    { id: 'university-3', name: 'Baku Engineering University', meta: '11 active ventures', score: 81, change: 2, signal: 'Technical team participation' },
  ],
  communities: [
    { id: 'community-1', name: 'Applied AI Builders', meta: '22,100 members', score: 91, change: 1, signal: 'High evidence-sharing activity' },
    { id: 'community-2', name: 'Climate & AgriTech Lab', meta: '6,800 members', score: 84, change: 3, signal: 'Five active pilot reviews' },
    { id: 'community-3', name: 'Backend & Data Guild', meta: '11,500 members', score: 80, change: 0, signal: 'Seven open collaboration requests' },
  ],
}
