import { db, sql } from './db/client'
import {
  agreementParties, agreements, auditLogs, cohorts, communities, contributions, jobs, organizations,
  mentorProfiles, posts, programPartners, programs, startupMembers, startupMilestones, startupRoles,
  startups, users,
} from './db/schema'

const now = new Date()
const passwordHash = await Bun.password.hash('demo123', { algorithm: 'argon2id' })

await db.insert(users).values({
  id: 'usr_1', username: 'demo', email: 'demo@studentstartupcommunity.local', passwordHash,
  name: 'Aylin Mammadova', title: 'Platform administrator', company: 'Student Startup Community',
  industry: 'Entrepreneurship', location: 'Baku, Azerbaijan', skills: 'Partnerships, Programs, Evidence',
  about: 'Illustrative local administrator account.', availability: 'Operating pilots', website: '',
  role: 'admin', roles: ['student', 'founder', 'partner_admin', 'program_manager', 'platform_admin'],
  activeRole: 'platform_admin', verificationStatus: 'verified',
}).onConflictDoNothing()

await db.insert(users).values([
  {
    id: 'usr_2', username: 'nihat', email: 'nihat@studentstartupcommunity.local', passwordHash,
    name: 'Nihat Abbasov', title: 'Founder · GreenStack', company: 'GreenStack', industry: 'Climate',
    location: 'Baku, Azerbaijan', skills: 'Python, APIs, Climate Data', about: 'Building useful climate data products.',
    availability: 'Open to collaborate', website: '', role: 'member', roles: ['student', 'founder'],
    activeRole: 'founder', verificationStatus: 'verified',
  },
  {
    id: 'usr_3', username: 'leyla', email: 'leyla@studentstartupcommunity.local', passwordHash,
    name: 'Leyla Karim', title: 'Product Designer', company: 'North Studio', industry: 'Design',
    location: 'Remote', skills: 'Design Systems, UX Research, Prototyping',
    about: 'Designing calm and trustworthy product experiences.', availability: 'Open to projects',
    website: '', role: 'member', roles: ['student'], activeRole: 'student', verificationStatus: 'verified',
  },
  {
    id: 'usr_4', username: 'kamran', email: 'kamran@studentstartupcommunity.local', passwordHash,
    name: 'Kamran Vali', title: 'AI Engineer', company: 'ModelWorks', industry: 'AI', location: 'Remote',
    skills: 'Python, LLM Apps, MLOps', about: 'Applied AI engineer shipping production systems.',
    availability: 'Open to collaborate', website: '', role: 'member', roles: ['student'],
    activeRole: 'student', verificationStatus: 'verified',
  },
  {
    id: 'usr_5', username: 'tarlan', email: 'tarlan@studentstartupcommunity.local', passwordHash,
    name: 'Tarlan Yusifzade', title: 'Mentor · ex-VC', company: 'Independent', industry: 'Venture',
    location: 'Baku, Azerbaijan', skills: 'Fundraising, Go-to-market, Strategy',
    about: 'Operator-turned-investor mentoring founders on validation and raise readiness.',
    availability: 'Office hours weekly', website: '', role: 'member', roles: ['mentor'],
    activeRole: 'mentor', verificationStatus: 'verified',
  },
  {
    id: 'usr_6', username: 'nargiz', email: 'nargiz@studentstartupcommunity.local', passwordHash,
    name: 'Nargiz Rahim', title: 'Founder · MediRoute', company: 'MediRoute', industry: 'Health',
    location: 'Baku, Azerbaijan', skills: 'Operations, Health, Strategy',
    about: 'Building faster, more reliable medical referral workflows.', availability: 'Open to collaborate',
    website: '', role: 'member', roles: ['student', 'founder'], activeRole: 'founder', verificationStatus: 'verified',
  },
  {
    id: 'usr_7', username: 'elvin', email: 'elvin@studentstartupcommunity.local', passwordHash,
    name: 'Elvin Safar', title: 'Founder · SkillBridge AI', company: 'SkillBridge AI', industry: 'EdTech',
    location: 'Remote', skills: 'ML, Product, Pedagogy', about: 'Turning student work into verified skill evidence.',
    availability: 'Looking for a designer', website: '', role: 'member', roles: ['student', 'founder'],
    activeRole: 'founder', verificationStatus: 'verified',
  },
]).onConflictDoNothing()

await db.insert(users).values({
  id: 'usr_8', username: 'investor', email: 'investor@studentstartupcommunity.local', passwordHash,
  name: 'Leyla Aslan', title: 'Investor · Frontier Ventures', company: 'Frontier Ventures',
  industry: 'Venture', location: 'Baku, Azerbaijan', skills: 'Seed investing, Marketplaces, Climate, B2B SaaS',
  about: 'Illustrative investor account for testing role-restricted workflows.', availability: 'Reviewing ventures', website: '',
  role: 'member', roles: ['investor'], activeRole: 'investor', verificationStatus: 'verified',
}).onConflictDoNothing()

await db.insert(startups).values([
  {
    id: 'stp_1', slug: 'greenstack', name: 'GreenStack', sector: 'ClimateTech', stage: 'MVP', readinessScore: 86,
    summary: 'Operational carbon intelligence for growing manufacturers.',
    fullDescription: 'A climate data platform using sensor inputs for actionable emissions reporting.',
    founded: '2023', location: 'Baku, Azerbaijan', verificationStatus: 'verified', status: 'active', createdBy: 'usr_2',
  },
  {
    id: 'stp_2', slug: 'skillbridge-ai', name: 'SkillBridge AI', sector: 'EdTech', stage: 'Validating', readinessScore: 74,
    summary: 'Turns student projects into verified, employer-ready skill evidence.',
    fullDescription: 'Evaluates student project output against practical competency frameworks.',
    founded: '2024', location: 'Remote', verificationStatus: 'pending', status: 'active', createdBy: 'usr_7',
  },
  {
    id: 'stp_3', slug: 'mediroute', name: 'MediRoute', sector: 'HealthTech', stage: 'Pilot', readinessScore: 91,
    summary: 'Coordinates faster referrals between clinics and diagnostic centers.',
    fullDescription: 'Streamlines healthcare referrals with intelligent routing and automated follow-ups.',
    founded: '2023', location: 'Baku, Azerbaijan', verificationStatus: 'verified', status: 'active', createdBy: 'usr_6',
  },
]).onConflictDoNothing()

await db.insert(startupMembers).values([
  { id: 'stm_1', startupId: 'stp_1', userId: 'usr_2', title: 'Founder', status: 'active' },
  { id: 'stm_2', startupId: 'stp_1', userId: 'usr_4', title: 'AI & Data Engineer', status: 'active' },
  { id: 'stm_3', startupId: 'stp_2', userId: 'usr_7', title: 'Founder', status: 'active' },
  { id: 'stm_4', startupId: 'stp_2', userId: 'usr_3', title: 'Product Designer', status: 'active' },
  { id: 'stm_5', startupId: 'stp_3', userId: 'usr_6', title: 'Founder', status: 'active' },
]).onConflictDoNothing()

await db.insert(startupRoles).values([
  { id: 'str_1', startupId: 'stp_1', title: 'Backend Engineer', department: 'Engineering', type: 'Project · Remote', skills: ['Python', 'APIs', 'PostgreSQL'], location: 'Remote', status: 'open' },
  { id: 'str_2', startupId: 'stp_1', title: 'Product Marketing Lead', department: 'Marketing', type: 'Part-time', skills: ['B2B SaaS', 'GTM'], location: 'Baku', status: 'open' },
  { id: 'str_3', startupId: 'stp_2', title: 'Full-Stack Engineer', department: 'Engineering', type: 'Project · Remote', skills: ['React', 'Python', 'PostgreSQL'], location: 'Remote', status: 'open' },
  { id: 'str_4', startupId: 'stp_3', title: 'Clinical Operations Lead', department: 'Operations', type: 'Part-time', skills: ['Health', 'Operations'], location: 'Baku', status: 'open' },
]).onConflictDoNothing()

await db.insert(startupMilestones).values([
  { id: 'sml_1', startupId: 'stp_1', title: 'MVP deployment', description: 'Deployed an illustrative pilot in three partner facilities.', dateLabel: 'Q3 2025', status: 'done', evidenceIds: [] },
  { id: 'sml_2', startupId: 'stp_1', title: 'Seed readiness', description: 'Preparing repeatable go-to-market evidence.', dateLabel: 'Current', status: 'current', evidenceIds: [] },
  { id: 'sml_3', startupId: 'stp_2', title: 'Beta launch', description: 'Launched an illustrative university beta.', dateLabel: 'Q1 2026', status: 'done', evidenceIds: [] },
  { id: 'sml_4', startupId: 'stp_2', title: 'Pilot expansion', description: 'Testing the workflow with additional programs.', dateLabel: 'Current', status: 'current', evidenceIds: [] },
  { id: 'sml_5', startupId: 'stp_3', title: 'Clinic pilot', description: 'Started an illustrative referral workflow pilot.', dateLabel: 'Q2 2026', status: 'done', evidenceIds: [] },
  { id: 'sml_6', startupId: 'stp_3', title: 'Provider onboarding', description: 'Improving the operational onboarding process.', dateLabel: 'Current', status: 'current', evidenceIds: [] },
]).onConflictDoNothing()

await db.insert(mentorProfiles).values({
  id: 'mtr_1', userId: 'usr_5', expertise: ['Fundraising', 'Go-to-market', 'Strategy'],
  company: 'Independent', rating: 4.9, sessions: 64, availability: 'Office hours weekly',
  focusStage: 'Pre-seed → Seed', bio: 'Operator-turned-investor mentoring founders on validation and raise readiness.',
  status: 'active',
}).onConflictDoNothing()

await db.insert(organizations).values([
  {
    id: 'org_1', type: 'student_community', legalName: 'Student Startup Community', displayName: 'SSC', slug: 'ssc',
    summary: 'Illustrative operator organization for the local partnership demo.', countryCode: 'AZ', websiteUrl: '',
    verificationStatus: 'verified', partnershipStatus: 'active',
    contributionAreas: ['Program operations', 'Founder community', 'Evidence reporting'],
    contacts: [{ id: 'org_contact_1', name: 'Aylin Mammadova', title: 'Platform administrator', email: 'demo@studentstartupcommunity.local', primary: true }],
  },
  {
    id: 'org_2', type: 'university', legalName: 'Baku Innovation University', displayName: 'Baku Innovation University',
    slug: 'baku-innovation-university', summary: 'Fictional university partner used only for product demonstration.',
    countryCode: 'AZ', websiteUrl: '', verificationStatus: 'pending', partnershipStatus: 'onboarding',
    contributionAreas: ['Student recruitment', 'Campus space', 'Faculty mentors'],
    contacts: [{ id: 'org_contact_2', name: 'Demo Partner Contact', title: 'Entrepreneurship center lead', email: 'partner@example.com', primary: true }],
  },
]).onConflictDoNothing()

await db.insert(agreements).values({
  id: 'agr_1', type: 'pilot', title: 'Cross-Campus Founder Sprint Pilot', status: 'draft',
  startsAt: '2026-09-01', endsAt: '2026-11-10', reviewAt: '2026-08-15',
  intendedOutcomes: ['Cross-campus team formation', 'Mentor-supported MVP evidence', 'Partner outcome report'],
  resourceCommitments: ['Student recruitment', 'Mentor hours', 'Challenge briefs'],
  dataTerms: 'Minimum necessary participant and evidence data.', brandingTerms: 'Partner marks require written approval.',
  programScope: 'Illustrative ten-week founder sprint.', documentName: '', documentUrl: '', createdBy: 'usr_1',
}).onConflictDoNothing()
await db.insert(agreementParties).values([
  { id: 'agp_1', agreementId: 'agr_1', organizationId: 'org_1', role: 'program operator', responsibilitySummary: 'Operate the platform and evidence workflow.' },
  { id: 'agp_2', agreementId: 'agr_1', organizationId: 'org_2', role: 'university partner', responsibilitySummary: 'Recruit eligible students and provide scoped support.' },
]).onConflictDoNothing()

await db.insert(programs).values({
  id: 'prg_1', name: 'Cross-Campus Founder Sprint', type: 'sprint', status: 'draft', hostOrganizationId: 'org_1',
  description: 'Illustrative joint program configuration; not live impact data.', startsAt: '2026-09-01', endsAt: '2026-11-10',
  eligibilityRules: ['Verified student status'], milestoneLabels: ['Team formed', 'Problem validated', 'Prototype evidenced', 'Demo day ready'],
  outcomesFramework: ['team_formed', 'mentor_session_completed', 'mvp_completed', 'demo_day_completion'],
}).onConflictDoNothing()
await db.insert(programPartners).values([
  { id: 'ppn_1', programId: 'prg_1', organizationId: 'org_1', role: 'host', commitmentSummary: 'Program operations and evidence infrastructure.' },
  { id: 'ppn_2', programId: 'prg_1', organizationId: 'org_2', role: 'community', commitmentSummary: 'Student recruitment and campus support.' },
]).onConflictDoNothing()
await db.insert(cohorts).values({ id: 'coh_1', programId: 'prg_1', name: 'Pilot Cohort', status: 'draft', startsAt: '2026-09-01', endsAt: '2026-11-10', capacity: 120 }).onConflictDoNothing()
await db.insert(contributions).values({
  id: 'ctr_1', programId: 'prg_1', organizationId: 'org_2', type: 'students', quantity: 40, unit: 'eligible seats',
  description: 'Illustrative commitment pending partner verification.', evidenceIds: [], verificationStatus: 'pending',
}).onConflictDoNothing()

await db.insert(communities).values([
  { id: 'com_1', name: 'Applied AI Builders', category: 'AI', description: 'Practical AI products and evaluations.', members: 22100, activity: '34 new discussions' },
  { id: 'com_2', name: 'Founders & Early Teams', category: 'Startups', description: 'A focused space for founders.', members: 18400, activity: '12 events this month' },
]).onConflictDoNothing()
await db.insert(jobs).values({ id: 'job_1', role: 'Program Operations Fellow', company: 'SSC Demo', location: 'Hybrid', type: 'Fellowship', skills: 'Operations, Evidence', description: 'Illustrative opportunity.', featured: true }).onConflictDoNothing()
await db.insert(posts).values({ id: 'pst_1', authorId: 'usr_1', content: 'Welcome to the illustrative SSC partnership workspace.', type: 'Update', kind: 'update', tags: ['partnerships'] }).onConflictDoNothing()
await db.insert(auditLogs).values({ id: 'aud_1', actorId: 'usr_1', organizationId: 'org_1', action: 'demo.seeded', targetType: 'system', targetId: 'org_1', summary: 'Illustrative backend data seeded.' }).onConflictDoNothing()

console.log('SSC illustrative seed is ready.')
await sql.end()
