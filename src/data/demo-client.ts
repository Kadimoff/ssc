import type {
  AgreementStatus, ApiClient, AssistantFeedback, AssistantServiceResponse, Community, DemoState, EntityId, Job, Organization,
  OutcomeRecord, PartnerContribution, PartnershipAgreement, Post, Program, ProgramPartner,
  Registration, Snapshot, StartupCreateInput, User, VerificationStatus,
} from './types'
import { mentors, startups } from './platform-content'
import { runAssistant } from '@/features/assistant/engine'

export const DATA_KEY = 'studentStartupCommunityDemoData.v3'
export const V2_KEY = 'studentStartupCommunityDemoData.v2'
export const V1_KEY = 'studentStartupCommunityDemoData.v1'
export const BACKUP_KEY = 'studentStartupCommunityDemoData.v2.backup'
export const V1_BACKUP_KEY = 'studentStartupCommunityDemoData.v1.backup'
export const SESSION_KEY = 'studentStartupCommunitySession.v3'
export const V2_SESSION_KEY = 'studentStartupCommunitySession.v2'

const now = new Date().toISOString()

export function seedState(): DemoState {
  const ago = (minutes: number) => new Date(Date.parse(now) - minutes * 60000).toISOString()
  return {
    version: 3,
    users: [
      { id: 'usr_1', username: 'demo', name: 'Aylin Mammadova', email: 'demo@studentstartupcommunity.local', title: 'Product Strategist', company: 'Orbit Labs', industry: 'Technology', location: 'Baku, Azerbaijan', skills: 'Product Strategy, Community Growth, Research', about: 'I help ambitious teams turn community insight into focused products and durable growth.', availability: 'Open to collaborate', website: 'https://example.com', role: 'admin', roles: ['student', 'founder', 'platform_admin'], activeRole: 'platform_admin', verificationStatus: 'verified' },
      { id: 'usr_2', username: 'nihat', name: 'Nihat Abbasov', email: 'nihat@studentstartupcommunity.local', title: 'Founder · GreenStack', company: 'GreenStack', industry: 'Climate', location: 'Baku, Azerbaijan', skills: 'Python, APIs, Climate Data', about: 'Building useful climate data products.', availability: 'Mentoring', website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified' },
      { id: 'usr_3', username: 'leyla', name: 'Leyla Karim', email: 'leyla@studentstartupcommunity.local', title: 'Product Designer', company: 'North Studio', industry: 'Design', location: 'Remote', skills: 'Design Systems, UX Research, Prototyping', about: 'Designing calm and trustworthy product experiences.', availability: 'Open to projects', website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified' },
      { id: 'usr_4', username: 'kamran', name: 'Kamran Vali', email: 'kamran@studentstartupcommunity.local', title: 'AI Engineer', company: 'ModelWorks', industry: 'AI', location: 'Remote', skills: 'Python, LLM Apps, MLOps', about: 'Applied AI engineer shipping production systems.', availability: 'Open to collaborate', website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified' },
      { id: 'usr_5', username: 'tarlan', name: 'Tarlan Yusifzade', email: 'tarlan@studentstartupcommunity.local', title: 'Mentor · ex-VC', company: 'Independent', industry: 'Venture', location: 'Baku, Azerbaijan', skills: 'Fundraising, Go-to-market, Strategy', about: 'Operator-turned-investor. I mentor founders on validation and raise readiness.', availability: 'Office hours weekly', website: '', role: 'member', roles: ['mentor'], activeRole: 'mentor', verificationStatus: 'verified' },
      { id: 'usr_6', username: 'nargiz', name: 'Nargiz Rahim', email: 'nargiz@studentstartupcommunity.local', title: 'Founder · MediMatch', company: 'MediMatch', industry: 'Health', location: 'Baku, Azerbaijan', skills: 'Operations, Health, Strategy', about: 'Connecting students with affordable verified medical professionals.', availability: 'Open to collaborate', website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified' },
      { id: 'usr_7', username: 'elvin', name: 'Elvin Safar', email: 'elvin@studentstartupcommunity.local', title: 'Founder · EduFlow', company: 'EduFlow', industry: 'EdTech', location: 'Remote', skills: 'ML, Product, Pedagogy', about: 'Turning lecture recordings into adaptive practice questions.', availability: 'Looking for a designer', website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified' },
      { id: 'usr_8', username: 'investor', name: 'Leyla Aslan', email: 'investor@studentstartupcommunity.local', title: 'Investor · Frontier Ventures', company: 'Frontier Ventures', industry: 'Venture', location: 'Baku, Azerbaijan', skills: 'Seed investing, Marketplaces, Climate, B2B SaaS', about: 'Backing mission-driven student founders at pre-seed and seed.', availability: 'Reviewing ventures', website: 'https://frontier.vc', role: 'member', roles: ['investor'], activeRole: 'investor', verificationStatus: 'verified' },
    ],
    passwords: { usr_1: 'demo123', usr_2: 'demo123', usr_3: 'demo123', usr_4: 'demo123', usr_5: 'demo123', usr_6: 'demo123', usr_7: 'demo123', usr_8: 'demo123' },
    posts: [
      { id: 'pst_1', authorId: 'usr_2', content: 'GreenStack crossed 1,000 active users on our campus energy tracker this week. Two faculties piloting, 18% energy reduction on average. On to the next milestone.', type: 'Milestone', kind: 'milestone', tags: ['climate', 'growth', 'mvp'], link: { title: 'GreenStack — Q2 campus impact report', subtitle: '1,000+ active users · 18% avg energy reduction · 2 faculties', url: 'greenstack.io/impact' }, commentsList: [{ id: 'cmt_1', authorId: 'usr_5', text: 'Strong traction. Let’s talk raise-readiness — book office hours.', createdAt: ago(40) }], createdAt: ago(60), reactions: 312, comments: 18, reposts: 24, liked: true, saved: false },
      { id: 'pst_2', authorId: 'usr_6', content: 'MediMatch closed a $120k pre-seed from regional angels to expand provider onboarding. Hiring two ops leads — referrals welcome.', type: 'Raise', kind: 'raise', tags: ['healthtech', 'fundraising'], link: { title: 'MediMatch raises $120k pre-seed', subtitle: 'Regional angels · provider expansion · hiring', url: 'medimatch.app/news' }, commentsList: [{ id: 'cmt_2', authorId: 'usr_1', text: 'Congratulations Nargiz! Posted the roles to the jobs board.', createdAt: ago(180) }, { id: 'cmt_3', authorId: 'usr_2', text: 'Happy to intro climate-clinic partners.', createdAt: ago(150) }], createdAt: ago(200), reactions: 540, comments: 33, reposts: 41, liked: false, saved: true },
      { id: 'pst_3', authorId: 'usr_4', content: 'ModelWorks is hiring an ML engineer to own evaluations and inference cost. Python, LLM apps, MLOps. Equity + stipend, remote-friendly. Drop a comment or apply via the jobs board.', type: 'Hiring', kind: 'hiring', tags: ['hiring', 'ai', 'ml'], link: { title: 'ML Engineer · ModelWorks', subtitle: 'Remote · Python · LLM evals · equity', url: 'modelworks.io/careers' }, commentsList: [], createdAt: ago(320), reactions: 198, comments: 27, reposts: 12, liked: false, saved: false },
      { id: 'pst_4', authorId: 'usr_7', content: 'EduFlow beta is live — adaptive practice questions generated from your lecture recordings. 340 students signed up in week one. Looking for a product designer to partner with.', type: 'Launch', kind: 'launch', tags: ['edtech', 'launch', 'design'], link: { title: 'EduFlow beta', subtitle: 'Lecture recordings → adaptive practice · 340 sign-ups', url: 'eduflow.app' }, commentsList: [{ id: 'cmt_4', authorId: 'usr_3', text: 'Sent you a DM — would love to scope the design role.', createdAt: ago(500) }], createdAt: ago(540), reactions: 421, comments: 29, reposts: 36, liked: true, saved: false },
      { id: 'pst_5', authorId: 'usr_3', content: 'Onboarding redesign field note: trust went up when we removed screens, not when we added reassurances. Fewer decisions, clearer next action.', type: 'Update', kind: 'update', tags: ['design', 'ux', 'trust'], commentsList: [], createdAt: ago(720), reactions: 517, comments: 48, reposts: 22, liked: false, saved: false },
      { id: 'pst_6', authorId: 'usr_5', content: 'Quick pulse for founders: what is the single biggest thing blocking your MVP right now — technical, market, or team? I’ll pick three to workshop in this week’s office hours.', type: 'Question', kind: 'question', tags: ['mentorship', 'mvp', 'feedback'], commentsList: [{ id: 'cmt_5', authorId: 'usr_7', text: 'Team — finding a designer who gets edtech.', createdAt: ago(800) }], createdAt: ago(840), reactions: 156, comments: 52, reposts: 9, liked: false, saved: true },
      { id: 'pst_7', authorId: 'usr_2', content: 'Opening a backend guild for engineers interested in climate data tooling. Two project lead spots open, mentors welcome. Six-week collaboration, remote.', type: 'Update', kind: 'update', tags: ['climate', 'community', 'guild'], link: { title: 'Climate Data Platform Sprint', subtitle: 'Remote · Python · APIs · 6-week guild', url: 'greenstack.io/guild' }, commentsList: [], createdAt: ago(1200), reactions: 284, comments: 42, reposts: 18, liked: false, saved: false },
      { id: 'pst_8', authorId: 'usr_6', content: 'First revenue milestone: MediMatch hit $2.1k MRR across 18 providers. Validating that students will pay for faster verified access. Iterating on provider onboarding next.', type: 'Milestone', kind: 'milestone', tags: ['healthtech', 'revenue', 'traction'], commentsList: [], createdAt: ago(1600), reactions: 372, comments: 24, reposts: 19, liked: false, saved: false },
      { id: 'pst_9', authorId: 'usr_4', content: 'Honest lesson from shipping LLM features: your eval set matters more than your model choice. We cut hallucinations 60% by tightening evals before touching the prompt.', type: 'Update', kind: 'update', tags: ['ai', 'evals', 'lessons'], commentsList: [], createdAt: ago(2200), reactions: 489, comments: 61, reposts: 28, liked: true, saved: false },
      { id: 'pst_10', authorId: 'usr_1', content: 'Welcome to SSC — this feed is for execution updates, not noise. Share milestones, raises, launches, and what you need next. Verified students only; let’s build denser, faster.', type: 'Update', kind: 'update', tags: ['community', 'welcome'], commentsList: [], createdAt: ago(3000), reactions: 205, comments: 14, reposts: 7, liked: false, saved: false },
    ],
    communities: [
      { id: 'com_1', name: 'Applied AI Builders', category: 'AI', description: 'Practical AI products, evaluations and production lessons.', members: 22100, activity: '34 new discussions', joined: true },
      { id: 'com_2', name: 'Founders & Early Teams', category: 'Startups', description: 'A focused space for founders and early operators.', members: 18400, activity: '12 events this month', joined: false },
      { id: 'com_3', name: 'Product Design Leaders', category: 'Design', description: 'Design systems, research and product leadership.', members: 9700, activity: '8 featured critiques', joined: false },
    ],
    jobs: [
      { id: 'job_1', role: 'Senior Product Engineer', company: 'GreenStack', location: 'Remote', type: 'Full-time', skills: 'Python, APIs, PostgreSQL', description: 'Build climate data products used by operational teams.', featured: true, applied: false, saved: false },
      { id: 'job_2', role: 'Product Designer', company: 'Orbit Labs', location: 'Baku', type: 'Contract', skills: 'UX, Research, Design Systems', description: 'Shape a new professional community experience.', featured: false, applied: false, saved: true },
      { id: 'job_3', role: 'ML Engineer', company: 'ModelWorks', location: 'Remote', type: 'Full-time', skills: 'Python, LLM Apps, MLOps', description: 'Own evaluations and inference cost for production LLM apps.', featured: true, applied: false, saved: false },
    ],
    startups: structuredClone(startups),
    mentors: structuredClone(mentors),
    conversations: [{ id: 'cnv_1', participantIds: ['usr_1', 'usr_3'] }],
    messages: [{ id: 'msg_1', conversationId: 'cnv_1', senderId: 'usr_3', text: 'Hi Aylin, would you like to review our onboarding study?', createdAt: now }],
    connections: [['usr_1', 'usr_2'], ['usr_1', 'usr_3']],
    organizations: [
      {
        id: 'org_1', type: 'student_community', legalName: 'Student Startup Community', displayName: 'SSC',
        slug: 'ssc', summary: 'Illustrative operator organization for the offline partnership demo.', countryCode: 'AZ',
        websiteUrl: '', verificationStatus: 'verified', partnershipStatus: 'active',
        contributionAreas: ['Program operations', 'Founder community', 'Evidence reporting'],
        contacts: [{ id: 'org_contact_1', name: 'Aylin Mammadova', title: 'Platform administrator', email: 'demo@studentstartupcommunity.local', primary: true }],
        createdAt: now,
      },
      {
        id: 'org_2', type: 'university', legalName: 'Baku Innovation University', displayName: 'Baku Innovation University',
        slug: 'baku-innovation-university', summary: 'Illustrative university partner used only for product demonstration.', countryCode: 'AZ',
        websiteUrl: '', verificationStatus: 'pending', partnershipStatus: 'onboarding',
        contributionAreas: ['Student recruitment', 'Campus space', 'Faculty mentors'],
        contacts: [{ id: 'org_contact_2', name: 'Demo Partner Contact', title: 'Entrepreneurship center lead', email: 'partner@example.com', primary: true }],
        createdAt: now,
      },
      {
        id: 'org_3', type: 'company', legalName: 'Caspian Future Labs', displayName: 'Caspian Future Labs',
        slug: 'caspian-future-labs', summary: 'Illustrative corporate challenge partner used only for product demonstration.', countryCode: 'AZ',
        websiteUrl: '', verificationStatus: 'pending', partnershipStatus: 'prospect',
        contributionAreas: ['Challenge briefs', 'Industry mentors', 'Pilot access'], contacts: [], createdAt: now,
      },
      {
        id: 'org_4', type: 'accelerator', legalName: 'Founder Bridge Accelerator', displayName: 'Founder Bridge',
        slug: 'founder-bridge', summary: 'Illustrative accelerator partner used only for product demonstration.', countryCode: 'AZ',
        websiteUrl: '', verificationStatus: 'pending', partnershipStatus: 'prospect',
        contributionAreas: ['Mentor network', 'Demo day', 'Investor readiness'], contacts: [], createdAt: now,
      },
    ],
    orgMemberships: [
      { id: 'mem_1', organizationId: 'org_1', userId: 'usr_1', title: 'Platform administrator', roles: ['platform_admin', 'program_manager'], status: 'active', createdAt: now },
    ],
    agreements: [
      {
        id: 'agr_1', type: 'pilot', title: 'Cross-Campus Founder Sprint Pilot', status: 'draft',
        startsAt: '2026-09-01', endsAt: '2026-11-10', reviewAt: '2026-08-15',
        intendedOutcomes: ['Cross-campus team formation', 'Mentor-supported MVP evidence', 'Partner outcome report'],
        resourceCommitments: ['Student recruitment', 'Mentor hours', 'Challenge briefs'],
        dataTerms: 'Minimum necessary participant and evidence data; no raw national identifiers retained.',
        brandingTerms: 'Partner marks require written approval.', programScope: 'Illustrative ten-week founder sprint.',
        documentName: '', documentUrl: '', createdBy: 'usr_1', createdAt: now,
      },
    ],
    agreementParties: [
      { id: 'agp_1', agreementId: 'agr_1', organizationId: 'org_1', role: 'program operator', responsibilitySummary: 'Operate the platform and evidence workflow.' },
      { id: 'agp_2', agreementId: 'agr_1', organizationId: 'org_2', role: 'university partner', responsibilitySummary: 'Recruit eligible students and provide scoped program support.' },
    ],
    programs: [
      {
        id: 'prg_1', name: 'Cross-Campus Founder Sprint', type: 'sprint', status: 'draft',
        hostOrganizationId: 'org_1', description: 'Illustrative joint program configuration; not live impact data.',
        startsAt: '2026-09-01', endsAt: '2026-11-10',
        eligibilityRules: ['Verified student status', 'Commitment to evidence-based weekly progress'],
        milestoneLabels: ['Team formed', 'Problem validated', 'Prototype evidenced', 'Demo day ready'],
        outcomesFramework: ['team_formed', 'mentor_session_completed', 'mvp_completed', 'demo_day_completion'],
        createdAt: now,
      },
    ],
    programPartners: [
      { id: 'ppn_1', programId: 'prg_1', organizationId: 'org_1', role: 'host', commitmentSummary: 'Program operations and evidence infrastructure.' },
      { id: 'ppn_2', programId: 'prg_1', organizationId: 'org_2', role: 'community', commitmentSummary: 'Student recruitment and campus support.' },
    ],
    cohorts: [
      { id: 'coh_1', programId: 'prg_1', name: 'Pilot Cohort', status: 'draft', startsAt: '2026-09-01', endsAt: '2026-11-10', capacity: 120 },
    ],
    cohortParticipants: [],
    contributions: [
      {
        id: 'ctr_1', programId: 'prg_1', organizationId: 'org_2', type: 'students', quantity: 40,
        unit: 'eligible seats', description: 'Illustrative commitment pending partner verification.',
        evidenceIds: [], verificationStatus: 'pending', createdAt: now,
      },
    ],
    evidenceArtifacts: [],
    outcomes: [],
    consents: [
      { id: 'cns_1', userId: 'usr_1', purpose: 'analytics', policyVersion: 'v1', grantedAt: now },
      { id: 'cns_2', userId: 'usr_1', purpose: 'evidence_visibility', policyVersion: 'v1', grantedAt: now },
    ],
    auditLogs: [
      { id: 'aud_1', actorId: 'usr_1', organizationId: 'org_1', action: 'demo.seeded', targetType: 'system', targetId: 'org_1', summary: 'Illustrative partnership demo data created.', createdAt: now },
    ],
    nextIds: {
      user: 9, post: 11, comment: 6, job: 4, conversation: 2, message: 2,
      organization: 5, membership: 2, agreement: 2, agreementParty: 3, program: 2,
      programPartner: 3, cohort: 2, participant: 1, contribution: 2, evidence: 1,
      outcome: 1, consent: 3, audit: 2,
    },
  }
}

type LooseRecord = Record<string, unknown>
type LegacyState = LooseRecord & {
  users?: LooseRecord[]
  posts?: LooseRecord[]
  communities?: LooseRecord[]
  jobs?: LooseRecord[]
  conversations?: LooseRecord[]
  messages?: LooseRecord[]
  connections?: unknown[][]
  passwords?: Record<string, string>
  nextIds?: Record<string, number>
}

const entityId = (prefix: string, value: unknown) => {
  const text = String(value ?? '').trim()
  if (text.startsWith(`${prefix}_`)) return text
  return `${prefix}_${text || '0'}`
}

const roleProfile = (item: LooseRecord) => {
  const title = String(item.title ?? '').toLowerCase()
  const legacyAdmin = item.role === 'admin'
  if (legacyAdmin) return { roles: ['student', 'founder', 'platform_admin'] as User['roles'], activeRole: 'platform_admin' as const }
  if (title.includes('mentor')) return { roles: ['mentor'] as User['roles'], activeRole: 'mentor' as const }
  if (title.includes('investor')) return { roles: ['investor'] as User['roles'], activeRole: 'investor' as const }
  if (title.includes('founder')) return { roles: ['student', 'founder'] as User['roles'], activeRole: 'founder' as const }
  return { roles: ['student'] as User['roles'], activeRole: 'student' as const }
}

function migrateUsers(items: LooseRecord[], prefix = 'usr'): User[] {
  return items.map((item) => {
    const profile = roleProfile(item)
    return {
      id: entityId(prefix, item.id),
      username: String(item.username ?? ''),
      name: String(item.name ?? item.username ?? 'Member'),
      email: String(item.email ?? ''),
      title: String(item.title ?? ''),
      company: String(item.company ?? ''),
      industry: String(item.industry ?? ''),
      location: String(item.location ?? ''),
      skills: String(item.skills ?? ''),
      about: String(item.about ?? ''),
      availability: String(item.availability ?? 'Open to collaborate'),
      website: String(item.website ?? ''),
      role: item.role === 'admin' ? 'admin' : 'member',
      roles: Array.isArray(item.roles) ? item.roles as User['roles'] : profile.roles,
      activeRole: typeof item.activeRole === 'string' ? item.activeRole as User['activeRole'] : profile.activeRole,
      verificationStatus: typeof item.verificationStatus === 'string' ? item.verificationStatus as VerificationStatus : 'verified',
    }
  })
}

export function migrateV2(raw: string): DemoState {
  const legacy = JSON.parse(raw) as LegacyState
  const fallback = seedState()
  const users = migrateUsers(legacy.users ?? [])
  const userId = (value: unknown) => entityId('usr', value)
  const postId = (value: unknown) => entityId('pst', value)
  const conversationId = (value: unknown) => entityId('cnv', value)
  const posts: Post[] = (legacy.posts ?? []).map((item) => ({
    ...item,
    id: postId(item.id),
    authorId: userId(item.authorId),
    commentsList: Array.isArray(item.commentsList)
      ? (item.commentsList as LooseRecord[]).map((comment) => ({ ...comment, id: entityId('cmt', comment.id), authorId: userId(comment.authorId) })) as Post['commentsList']
      : [],
  })) as Post[]
  const communities = (legacy.communities ?? []).map((item) => ({ ...item, id: entityId('com', item.id) })) as Community[]
  const jobs = (legacy.jobs ?? []).map((item) => ({ ...item, id: entityId('job', item.id) })) as Job[]
  const conversations = (legacy.conversations ?? []).map((item) => ({
    ...item,
    id: conversationId(item.id),
    participantIds: Array.isArray(item.participantIds) ? item.participantIds.map(userId) : [],
  })) as DemoState['conversations']
  const messages = (legacy.messages ?? []).map((item) => ({
    ...item,
    id: entityId('msg', item.id),
    conversationId: conversationId(item.conversationId),
    senderId: userId(item.senderId),
  })) as DemoState['messages']
  const connections = (legacy.connections ?? []).map((pair) => pair.map(userId))
  const passwords = Object.fromEntries(
    Object.entries(legacy.passwords ?? {}).map(([id, password]) => [userId(id), password]),
  )
  return {
    ...fallback,
    users: users.length ? users : fallback.users,
    posts: posts.length ? posts : fallback.posts,
    communities: communities.length ? communities : fallback.communities,
    jobs: jobs.length ? jobs : fallback.jobs,
    conversations,
    messages,
    connections,
    passwords: Object.keys(passwords).length ? passwords : fallback.passwords,
    nextIds: { ...fallback.nextIds, ...(legacy.nextIds ?? {}) },
  }
}

export function migrateLegacy(raw: string): DemoState {
  const legacy = JSON.parse(raw) as LegacyState
  const fallback = seedState()
  const users = migrateUsers(legacy.users ?? [])
  const posts: Post[] = (legacy.posts ?? []).map((item) => ({
    id: entityId('pst', item.id),
    authorId: entityId('usr', item.author_id),
    content: String(item.content ?? ''),
    type: String(item.post_type ?? 'Post'),
    previewTitle: String(item.preview_title ?? ''),
    previewSubtitle: String(item.preview_subtitle ?? ''),
    createdAt: String(item.created_at ?? now),
    reactions: Number(item.reaction_count ?? 0),
    comments: Number(item.comment_count ?? 0),
    reposts: Number(item.repost_count ?? 0),
    liked: Boolean(item.liked),
    saved: Boolean(item.saved),
  }))
  const communities: Community[] = (legacy.communities ?? []).map((item) => ({
    id: entityId('com', item.id), name: String(item.name ?? ''), category: String(item.category ?? ''),
    description: String(item.description ?? ''), members: Number(item.member_count ?? 0),
    activity: String(item.activity_preview ?? ''), joined: Boolean(item.joined),
  }))
  const jobs: Job[] = (legacy.jobs ?? []).filter((item) => !item.hidden).map((item) => ({
    id: entityId('job', item.id), role: String(item.role ?? ''), company: String(item.company ?? ''),
    location: String(item.location ?? ''), type: String(item.job_type ?? ''), skills: String(item.skills ?? ''),
    description: String(item.description ?? ''), featured: Boolean(item.featured),
    applied: Boolean(item.applied), saved: Boolean(item.saved),
  }))
  const migratedUsers = users.length ? users : fallback.users
  return {
    ...fallback,
    users: migratedUsers,
    posts: posts.length ? posts : fallback.posts,
    communities: communities.length ? communities : fallback.communities,
    jobs: jobs.length ? jobs : fallback.jobs,
    passwords: Object.fromEntries(migratedUsers.map((user) => [user.id, 'demo123'])),
  }
}

function migrateSession(storage: Storage) {
  if (storage.getItem(SESSION_KEY)) return
  const legacySession = storage.getItem(V2_SESSION_KEY)
  if (legacySession) storage.setItem(SESSION_KEY, entityId('usr', legacySession))
}

export function loadState(storage: Storage): DemoState {
  const current = storage.getItem(DATA_KEY)
  if (current) {
    try {
      const parsed = JSON.parse(current) as DemoState
      if (parsed.version === 3) {
        parsed.startups ??= structuredClone(startups)
        parsed.mentors ??= structuredClone(mentors)
        return parsed
      }
      storage.setItem(`${DATA_KEY}.invalid`, current)
    } catch {
      storage.setItem(`${DATA_KEY}.corrupt`, current)
    }
  }
  const v2 = storage.getItem(V2_KEY)
  if (v2) {
    try {
      const migrated = migrateV2(v2)
      storage.setItem(BACKUP_KEY, v2)
      storage.setItem(DATA_KEY, JSON.stringify(migrated))
      migrateSession(storage)
      return migrated
    } catch {
      storage.setItem(BACKUP_KEY, v2)
    }
  }
  const legacy = storage.getItem(V1_KEY)
  if (legacy) {
    try {
      const migrated = migrateLegacy(legacy)
      storage.setItem(V1_BACKUP_KEY, legacy)
      storage.setItem(DATA_KEY, JSON.stringify(migrated))
      migrateSession(storage)
      return migrated
    } catch {
      storage.setItem(V1_BACKUP_KEY, legacy)
    }
  }
  const seeded = seedState()
  storage.setItem(DATA_KEY, JSON.stringify(seeded))
  return seeded
}

export class DemoApiClient implements ApiClient {
  private state: DemoState
  constructor(private storage: Storage) { this.state = loadState(storage) }
  private next(key: keyof DemoState['nextIds'], prefix: string) { return `${prefix}_${this.state.nextIds[key]++}` }
  private save() { this.storage.setItem(DATA_KEY, JSON.stringify(this.state)) }
  private user() {
    const id = this.storage.getItem(SESSION_KEY)
    return this.state.users.find((user) => user.id === id) ?? null
  }
  private auth() { const user = this.user(); if (!user) throw new Error('Sign in to continue'); return user }
  private audit(actorId: EntityId, action: string, targetType: string, targetId: EntityId, summary: string, organizationId?: EntityId) {
    this.state.auditLogs.unshift({
      id: this.next('audit', 'aud'), actorId, organizationId, action, targetType, targetId, summary,
      createdAt: new Date().toISOString(),
    })
  }
  async snapshot(): Promise<Snapshot> { return { ...structuredClone(this.state), currentUser: this.user() } }
  async login(input: { username: string; password: string }) {
    const user = this.state.users.find((item) => item.username === input.username && this.state.passwords[item.id] === input.password)
    if (!user) throw new Error('Invalid demo credentials')
    this.storage.setItem(SESSION_KEY, user.id)
    return user
  }
  async register(input: Registration) {
    if (!input.username || !input.password || this.state.users.some((user) => user.username === input.username)) throw new Error('Choose a unique username and password')
    const id = this.next('user', 'usr')
    const user: User = {
      id, username: input.username, name: input.name || input.username, email: input.email || '',
      title: input.title || 'Community member', company: input.company || '', industry: input.industry || '',
      location: input.location || '', skills: input.skills || '', about: input.about || '',
      availability: input.availability || 'Open to collaborate', website: input.website || '', role: 'member',
      roles: input.roles?.length ? input.roles : ['student'], activeRole: input.activeRole ?? 'student',
      verificationStatus: 'unverified',
    }
    this.state.users.push(user)
    this.state.passwords[id] = input.password
    this.storage.setItem(SESSION_KEY, id)
    this.audit(id, 'user.registered', 'user', id, 'User created a demo account.')
    this.save()
    return user
  }
  async logout() { this.storage.removeItem(SESSION_KEY) }
  async createPost(content: string, opts?: { kind?: Post['kind']; tags?: string[]; link?: Post['link'] }) {
    const user = this.auth()
    this.state.posts.unshift({
      id: this.next('post', 'pst'), authorId: user.id, content,
      type: opts?.kind ? opts.kind[0].toUpperCase() + opts.kind.slice(1) : 'Update',
      kind: opts?.kind ?? 'update', tags: opts?.tags ?? [], link: opts?.link,
      previewTitle: opts?.link?.title ?? '', previewSubtitle: opts?.link?.subtitle ?? '',
      commentsList: [], createdAt: new Date().toISOString(), reactions: 0, comments: 0,
      reposts: 0, liked: false, saved: false,
    })
    this.save()
  }
  async togglePost(id: EntityId, action: 'liked' | 'saved') { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (!post) return; post[action] = !post[action]; if (action === 'liked') post.reactions += post.liked ? 1 : -1; this.save() }
  async repost(id: EntityId) { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (post) post.reposts++; this.save() }
  async comment(id: EntityId) { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (post) post.comments++; this.save() }
  async addComment(postId: EntityId, text: string) {
    const user = this.auth()
    const post = this.state.posts.find((item) => item.id === postId)
    if (!post || !text.trim()) return
    post.commentsList ??= []
    post.commentsList.push({ id: this.next('comment', 'cmt'), authorId: user.id, text: text.trim(), createdAt: new Date().toISOString() })
    post.comments = post.commentsList.length
    this.save()
  }
  async deletePost(id: EntityId) { this.auth(); this.state.posts = this.state.posts.filter((item) => item.id !== id); this.save() }
  async updateProfile(input: Partial<User>) {
    const user = this.auth()
    Object.assign(user, input, { id: user.id, username: user.username, role: user.role })
    this.save()
    return user
  }
  async connect(userId: EntityId) {
    const user = this.auth()
    const pair = [user.id, userId].sort((a, b) => a.localeCompare(b))
    if (!this.state.connections.some((item) => item[0] === pair[0] && item[1] === pair[1])) this.state.connections.push(pair)
    this.save()
  }
  async toggleCommunity(id: EntityId) { this.auth(); const item = this.state.communities.find((community) => community.id === id); if (item) item.joined = !item.joined; this.save() }
  async deleteCommunity(id: EntityId) { this.auth(); this.state.communities = this.state.communities.filter((item) => item.id !== id); this.save() }
  async sendMessage(conversationId: EntityId, text: string) {
    const user = this.auth()
    this.state.messages.push({ id: this.next('message', 'msg'), conversationId, senderId: user.id, text, createdAt: new Date().toISOString() })
    this.save()
  }
  async ensureConversation(userId: EntityId) {
    const user = this.auth()
    let item = this.state.conversations.find((conversation) => conversation.participantIds.includes(user.id) && conversation.participantIds.includes(userId))
    if (!item) {
      item = { id: this.next('conversation', 'cnv'), participantIds: [user.id, userId] }
      this.state.conversations.push(item)
      this.save()
    }
    return item.id
  }
  async toggleJob(id: EntityId, action: 'applied' | 'saved') { this.auth(); const job = this.state.jobs.find((item) => item.id === id); if (job) job[action] = !job[action]; this.save() }
  async createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>) { this.auth(); this.state.jobs.push({ ...input, id: this.next('job', 'job'), applied: false, saved: false }); this.save() }
  async createOrganization(input: Omit<Organization, 'id' | 'createdAt'>) {
    const actor = this.auth()
    const id = this.next('organization', 'org')
    this.state.organizations.push({ ...input, id, createdAt: new Date().toISOString() })
    this.audit(actor.id, 'organization.created', 'organization', id, `Created organization ${input.displayName}.`, id)
    this.save()
    return id
  }
  async updateOrganization(id: EntityId, input: Partial<Organization>) {
    const actor = this.auth()
    const organization = this.state.organizations.find((item) => item.id === id)
    if (!organization) throw new Error('Organization not found')
    Object.assign(organization, input, { id: organization.id, createdAt: organization.createdAt })
    this.audit(actor.id, 'organization.updated', 'organization', id, `Updated organization ${organization.displayName}.`, id)
    this.save()
  }
  async verifyOrganization(id: EntityId, status: VerificationStatus) {
    const actor = this.auth()
    const organization = this.state.organizations.find((item) => item.id === id)
    if (!organization) throw new Error('Organization not found')
    organization.verificationStatus = status
    this.audit(actor.id, 'organization.verification_changed', 'organization', id, `Set verification to ${status}.`, id)
    this.save()
  }
  async createAgreement(input: Omit<PartnershipAgreement, 'id' | 'createdAt' | 'createdBy'>, partyOrganizationIds: EntityId[]) {
    const actor = this.auth()
    const id = this.next('agreement', 'agr')
    this.state.agreements.push({ ...input, id, createdBy: actor.id, createdAt: new Date().toISOString() })
    partyOrganizationIds.forEach((organizationId) => this.state.agreementParties.push({
      id: this.next('agreementParty', 'agp'), agreementId: id, organizationId,
      role: organizationId === partyOrganizationIds[0] ? 'lead party' : 'partner',
      responsibilitySummary: 'Responsibilities to be confirmed in the agreement.',
    }))
    this.audit(actor.id, 'agreement.created', 'agreement', id, `Created agreement ${input.title}.`)
    this.save()
    return id
  }
  async transitionAgreement(id: EntityId, status: AgreementStatus) {
    const actor = this.auth()
    const agreement = this.state.agreements.find((item) => item.id === id)
    if (!agreement) throw new Error('Agreement not found')
    const transitions: Record<AgreementStatus, AgreementStatus[]> = {
      draft: ['pending_signature', 'terminated'],
      pending_signature: ['draft', 'active', 'terminated'],
      active: ['expired', 'terminated'],
      expired: [],
      terminated: [],
    }
    if (!transitions[agreement.status].includes(status)) throw new Error(`Cannot move agreement from ${agreement.status} to ${status}`)
    agreement.status = status
    this.audit(actor.id, 'agreement.status_changed', 'agreement', id, `Moved agreement to ${status}.`)
    this.save()
  }
  async createProgram(input: Omit<Program, 'id' | 'createdAt'>) {
    const actor = this.auth()
    const id = this.next('program', 'prg')
    this.state.programs.push({ ...input, id, createdAt: new Date().toISOString() })
    this.audit(actor.id, 'program.created', 'program', id, `Created program ${input.name}.`, input.hostOrganizationId)
    this.save()
    return id
  }
  async addProgramPartner(input: Omit<ProgramPartner, 'id'>) {
    const actor = this.auth()
    const id = this.next('programPartner', 'ppn')
    this.state.programPartners.push({ ...input, id })
    this.audit(actor.id, 'program.partner_added', 'program', input.programId, `Added partner ${input.organizationId}.`, input.organizationId)
    this.save()
    return id
  }
  async recordContribution(input: Omit<PartnerContribution, 'id' | 'createdAt' | 'verificationStatus'>) {
    const actor = this.auth()
    const id = this.next('contribution', 'ctr')
    this.state.contributions.push({ ...input, id, verificationStatus: 'pending', createdAt: new Date().toISOString() })
    this.audit(actor.id, 'contribution.recorded', 'contribution', id, `Recorded ${input.type} contribution.`, input.organizationId)
    this.save()
    return id
  }
  async verifyContribution(id: EntityId, status: VerificationStatus) {
    const actor = this.auth()
    const contribution = this.state.contributions.find((item) => item.id === id)
    if (!contribution) throw new Error('Contribution not found')
    contribution.verificationStatus = status
    contribution.verifiedBy = actor.id
    contribution.verifiedAt = new Date().toISOString()
    this.audit(actor.id, 'contribution.verification_changed', 'contribution', id, `Set contribution verification to ${status}.`, contribution.organizationId)
    this.save()
  }
  async recordOutcome(input: Omit<OutcomeRecord, 'id' | 'createdAt' | 'verificationStatus'>) {
    const actor = this.auth()
    const id = this.next('outcome', 'out')
    this.state.outcomes.push({ ...input, id, verificationStatus: 'pending', createdAt: new Date().toISOString() })
    this.audit(actor.id, 'outcome.recorded', 'outcome', id, `Recorded ${input.type} outcome.`, input.primaryPartnerId)
    this.save()
    return id
  }
  async createStartup(input: StartupCreateInput) {
    const actor = this.auth()
    if (this.state.startups.some((item) => item.slug === input.slug)) throw new Error('Choose a unique startup name')
    const id = `stp_${crypto.randomUUID().replace(/-/g, '')}`
    this.state.startups.push({
      id, slug: input.slug, name: input.name, sector: input.sector, stage: input.stage,
      score: input.readinessScore, roles: '0 open roles', summary: input.summary,
      fullDesc: input.fullDescription, founded: input.founded, location: input.location,
      backedBy: [], team: [{ name: actor.name, title: 'Founder' }], milestones: [], openRoles: [],
    })
    this.save()
    return id
  }
  async assistantQuery(prompt: string, _limit = 10): Promise<AssistantServiceResponse> {
    const actor = this.auth()
    const response = runAssistant(prompt, {
      currentUser: actor, users: this.state.users, jobs: this.state.jobs,
      startups: this.state.startups, mentors: this.state.mentors, programs: this.state.programs,
      organizations: this.state.organizations,
      includeOrganizations: actor.roles.some((role) => ['partner_admin', 'program_manager', 'platform_admin'].includes(role)),
    })
    return { ...response, queryId: `demo_${crypto.randomUUID()}`, engine: 'deterministic' }
  }
  async assistantFeedback(_input: AssistantFeedback) { this.auth() }
  async investorDiscovery(prompt: string, _limit = 10): Promise<AssistantServiceResponse> {
    const actor = this.auth()
    if (!actor.roles.some((role) => ['investor', 'platform_admin'].includes(role))) throw new Error('Investor access required')
    const response = runAssistant(prompt, {
      currentUser: actor, users: this.state.users, jobs: this.state.jobs,
      startups: this.state.startups, mentors: this.state.mentors, programs: this.state.programs,
      organizations: this.state.organizations, includeOrganizations: false,
    }, 'investor_discovery')
    return { ...response, queryId: `demo_${crypto.randomUUID()}`, engine: 'deterministic' }
  }
}
