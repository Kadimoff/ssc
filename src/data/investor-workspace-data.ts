export type InvestorEvidenceStatus = 'verified' | 'partial' | 'missing'
export type EvidenceItemStatus = 'verified' | 'submitted' | 'missing' | 'needs_review'
export type InvestorPipelineStage = 'sourced' | 'screening' | 'meeting' | 'diligence' | 'passed'

export type InvestorOpportunity = {
  startupId: string
  university: string
  thesisMatch: number
  readiness: number
  tractionHighlight?: string
  currentAsk?: string
  evidenceStatus: InvestorEvidenceStatus
  teamGaps: string[]
  lastActivityAt: string
  lastActivityLabel: string
  nextAction?: string
  revenueStatus: string
  pilotCount: number
  keyStrengths: string[]
  missingEvidence: string[]
}

export type InvestorActivity = {
  id: string
  startupId: string
  type: 'milestone' | 'evidence' | 'traction' | 'team' | 'intro' | 'stage'
  message: string
  timestamp: string
}

export type InvestorMeeting = {
  id: string
  startupId: string
  title: string
  dateLabel: string
  meetingType: string
  agenda?: string
}

export type InvestorTask = {
  id: string
  title: string
  startupId?: string
  completed: boolean
  dueLabel?: string
}

export type InvestorAlert = {
  id: string
  title: string
  detail: string
  timestamp: string
  tone: 'signal' | 'evidence' | 'intro' | 'program'
}

export type InvestorEvidenceItem = {
  label: string
  status: EvidenceItemStatus
}

export type SavedInvestorThesis = {
  id: string
  name: string
  sectors: string[]
  stages: string[]
  geography: string
  minimumReadiness: number
  evidenceRequirement: string
  teamRequirement: string
  ticketRange?: string
}

export const investorOpportunities: Record<string, InvestorOpportunity> = {
  greenstack: {
    startupId: 'greenstack', university: 'Baku State University', thesisMatch: 94, readiness: 86,
    tractionHighlight: '1,000+ active users · pilot at 2 faculties', currentAsk: 'Seeking a strategic third-faculty pilot',
    evidenceStatus: 'verified', teamGaps: ['Technical co-founder role still open'], lastActivityAt: '2026-07-29T08:00:00.000Z', lastActivityLabel: '2h ago',
    nextAction: 'Review faculty pilot evidence', revenueStatus: 'Pre-revenue pilot', pilotCount: 2,
    keyStrengths: ['Verified campus adoption', 'Measurable energy-savings signal', 'Frequent founder updates'],
    missingEvidence: ['Independent verification for third pilot'],
  },
  mediroute: {
    startupId: 'mediroute', university: 'Azerbaijan Medical University', thesisMatch: 91, readiness: 91,
    tractionHighlight: 'Two hospital-network pilots', currentAsk: 'Looking for hospital network introductions',
    evidenceStatus: 'verified', teamGaps: [], lastActivityAt: '2026-07-29T06:30:00.000Z', lastActivityLabel: '3h ago',
    nextAction: 'Prepare diligence call questions', revenueStatus: 'Pilot contracts', pilotCount: 2,
    keyStrengths: ['Verified clinical workflow', 'Complete core team', 'Clear enterprise user'],
    missingEvidence: ['Updated sales-cycle evidence'],
  },
  'campus-cart': {
    startupId: 'campus-cart', university: 'ADA University', thesisMatch: 88, readiness: 88,
    tractionHighlight: 'Repeat transactions across 2 campuses', currentAsk: 'Looking for a backend co-founder and payments pilot',
    evidenceStatus: 'verified', teamGaps: ['Backend engineering ownership'], lastActivityAt: '2026-07-28T15:20:00.000Z', lastActivityLabel: 'Yesterday',
    nextAction: 'Review trust and payments workflow', revenueStatus: 'Early revenue', pilotCount: 2,
    keyStrengths: ['Active marketplace liquidity', 'Verified campus communities', 'Clear expansion milestone'],
    missingEvidence: ['Payment reconciliation report'],
  },
  mindharbor: {
    startupId: 'mindharbor', university: 'Khazar University', thesisMatch: 84, readiness: 82,
    tractionHighlight: 'Pilot with 2 student services teams', currentAsk: 'Seeking university wellbeing partners',
    evidenceStatus: 'verified', teamGaps: [], lastActivityAt: '2026-07-28T11:10:00.000Z', lastActivityLabel: 'Yesterday',
    nextAction: 'Inspect privacy and safety review', revenueStatus: 'Pre-revenue pilot', pilotCount: 2,
    keyStrengths: ['Privacy workflow reviewed', 'Complete founding team', 'Clear referral boundaries'],
    missingEvidence: ['Longitudinal engagement data'],
  },
  agrivision: {
    startupId: 'agrivision', university: 'Ganja State University', thesisMatch: 82, readiness: 79,
    tractionHighlight: 'Active field pilot with 12 farms', currentAsk: 'Looking for an IoT engineer and cooperative partners',
    evidenceStatus: 'partial', teamGaps: ['IoT engineering', 'Partnerships lead'], lastActivityAt: '2026-07-27T13:00:00.000Z', lastActivityLabel: '2d ago',
    nextAction: 'Review submitted field dataset', revenueStatus: 'Pre-revenue pilot', pilotCount: 1,
    keyStrengths: ['Regional field access', 'Practical agronomy workflow', 'Structured pilot data'],
    missingEvidence: ['Independent yield evidence', 'Sensor reliability report'],
  },
  'skillbridge-ai': {
    startupId: 'skillbridge-ai', university: 'Baku Engineering University', thesisMatch: 80, readiness: 74,
    tractionHighlight: 'Beta active with 3 university partners', currentAsk: 'Seeking employer validation partners',
    evidenceStatus: 'partial', teamGaps: ['Full-stack engineering capacity'], lastActivityAt: '2026-07-26T09:00:00.000Z', lastActivityLabel: '3d ago',
    nextAction: 'Inspect beta validation notes', revenueStatus: 'Pre-revenue beta', pilotCount: 3,
    keyStrengths: ['University distribution', 'Clear competency framework', 'Active beta cohort'],
    missingEvidence: ['Employer outcome evidence', 'Model evaluation report'],
  },
  'legal-lens': {
    startupId: 'legal-lens', university: 'UNEC', thesisMatch: 72, readiness: 68,
    tractionHighlight: '42 structured customer interviews', currentAsk: 'Looking for an NLP technical co-founder',
    evidenceStatus: 'partial', teamGaps: ['NLP technical co-founder', 'Product design'], lastActivityAt: '2026-07-24T12:00:00.000Z', lastActivityLabel: '5d ago',
    nextAction: 'Review prototype evaluation boundary', revenueStatus: 'Pre-revenue validation', pilotCount: 0,
    keyStrengths: ['Focused user segment', 'Strong problem discovery', 'Human review path'],
    missingEvidence: ['Product demo', 'Evaluation benchmark', 'Legal entity status'],
  },
  routewise: {
    startupId: 'routewise', university: 'ASOIU', thesisMatch: 66, readiness: 61,
    tractionHighlight: '120 accessibility observations mapped', currentAsk: 'Forming the founding product team',
    evidenceStatus: 'missing', teamGaps: ['Mobile engineer', 'Accessibility researcher', 'Community operator'], lastActivityAt: '2026-07-22T10:00:00.000Z', lastActivityLabel: '7d ago',
    nextAction: 'Confirm contribution trust model', revenueStatus: 'Idea stage', pilotCount: 0,
    keyStrengths: ['Clear civic problem', 'Initial structured research', 'Community-led approach'],
    missingEvidence: ['Product demo', 'Customer validation', 'Team records', 'Legal status'],
  },
}

export const investorActivities: InvestorActivity[] = [
  { id: 'activity-1', startupId: 'greenstack', type: 'milestone', message: 'completed “Third faculty pilot preparation”', timestamp: '2h ago' },
  { id: 'activity-2', startupId: 'mediroute', type: 'evidence', message: 'uploaded a verified provider workflow report', timestamp: 'Yesterday' },
  { id: 'activity-3', startupId: 'campus-cart', type: 'traction', message: 'updated repeat-transaction metrics', timestamp: 'Yesterday' },
  { id: 'activity-4', startupId: 'mindharbor', type: 'team', message: 'added a student partnerships lead', timestamp: '2d ago' },
  { id: 'activity-5', startupId: 'agrivision', type: 'evidence', message: 'submitted a field pilot dataset for review', timestamp: '2d ago' },
]

export const investorMeetings: InvestorMeeting[] = [
  { id: 'meeting-1', startupId: 'greenstack', title: 'GreenStack founder intro', dateLabel: 'Tomorrow · 10:30', meetingType: 'Founder introduction', agenda: 'Third pilot scope and technical team gap' },
  { id: 'meeting-2', startupId: 'mediroute', title: 'MediRoute diligence call', dateLabel: 'Fri · 14:00', meetingType: 'Evidence review', agenda: 'Hospital workflow and sales cycle' },
  { id: 'meeting-3', startupId: 'skillbridge-ai', title: 'SkillBridge product demo', dateLabel: 'Mon · 16:30', meetingType: 'Product demo', agenda: 'Evaluation framework and employer validation' },
]

export const initialInvestorTasks: InvestorTask[] = [
  { id: 'task-1', title: 'Review GreenStack pilot evidence', startupId: 'greenstack', completed: false, dueLabel: 'Today' },
  { id: 'task-2', title: 'Prepare questions for MediRoute', startupId: 'mediroute', completed: false, dueLabel: 'Tomorrow' },
  { id: 'task-3', title: 'Follow up after SkillBridge demo', startupId: 'skillbridge-ai', completed: false, dueLabel: 'Mon' },
  { id: 'task-4', title: 'Compare top ClimateTech matches', completed: true, dueLabel: 'Done' },
]

export const investorAlerts: InvestorAlert[] = [
  { id: 'alert-1', title: 'New venture matches your thesis', detail: 'GreenStack now meets the verified-evidence requirement.', timestamp: '1h ago', tone: 'signal' },
  { id: 'alert-2', title: 'Watched venture uploaded evidence', detail: 'MediRoute added a provider workflow report.', timestamp: 'Yesterday', tone: 'evidence' },
  { id: 'alert-3', title: 'Founder responded to intro request', detail: 'CampusCart proposed two meeting slots.', timestamp: 'Yesterday', tone: 'intro' },
  { id: 'alert-4', title: 'New accelerator cohort announced', detail: 'Applications open for the Climate Evidence Sprint.', timestamp: '2d ago', tone: 'program' },
]

export const savedInvestorTheses: SavedInvestorThesis[] = [
  {
    id: 'thesis-1', name: 'Caspian early-stage impact', sectors: ['ClimateTech', 'HealthTech', 'AgriTech'],
    stages: ['MVP', 'Pilot', 'Revenue'], geography: 'Azerbaijan and regional teams', minimumReadiness: 75,
    evidenceRequirement: 'At least one verified execution artifact', teamRequirement: 'Technical ownership identified', ticketRange: '$50K–$250K',
  },
  {
    id: 'thesis-2', name: 'University B2B software', sectors: ['EdTech', 'SaaS', 'Marketplace'],
    stages: ['Validation', 'MVP', 'Revenue'], geography: 'University-linked ventures', minimumReadiness: 70,
    evidenceRequirement: 'Customer validation or pilot record', teamRequirement: 'Two or more active team members',
  },
]

const defaultEvidence: InvestorEvidenceItem[] = [
  { label: 'Founder identity', status: 'verified' },
  { label: 'University verification', status: 'verified' },
  { label: 'Product demo', status: 'submitted' },
  { label: 'Customer validation', status: 'submitted' },
  { label: 'Traction evidence', status: 'needs_review' },
  { label: 'Team records', status: 'verified' },
  { label: 'Financial evidence', status: 'missing' },
  { label: 'Legal/company status', status: 'missing' },
]

export const investorEvidenceByStartup: Record<string, InvestorEvidenceItem[]> = {
  greenstack: defaultEvidence.map((item) => ({ ...item, status: ['Founder identity', 'University verification', 'Product demo', 'Customer validation', 'Traction evidence', 'Team records'].includes(item.label) ? 'verified' : item.status })),
  mediroute: defaultEvidence.map((item) => ({ ...item, status: item.label === 'Financial evidence' ? 'submitted' : item.label === 'Legal/company status' ? 'needs_review' : 'verified' })),
  'campus-cart': defaultEvidence.map((item) => ({ ...item, status: item.label === 'Financial evidence' ? 'needs_review' : item.label === 'Legal/company status' ? 'submitted' : 'verified' })),
  mindharbor: defaultEvidence.map((item) => ({ ...item, status: item.label === 'Financial evidence' || item.label === 'Legal/company status' ? 'missing' : 'verified' })),
  agrivision: defaultEvidence,
  'skillbridge-ai': defaultEvidence,
  'legal-lens': defaultEvidence.map((item) => ({ ...item, status: ['Founder identity', 'University verification', 'Customer validation'].includes(item.label) ? 'verified' : item.status })),
  routewise: defaultEvidence.map((item) => ({ ...item, status: ['Founder identity', 'University verification'].includes(item.label) ? 'verified' : 'missing' })),
}
