

export interface StartupData {
  slug: string; name: string; sector: string; stage: string; score: number; roles: string; summary: string;
  fullDesc: string; founded: string; location: string; backedBy: string[]; team: Array<{ name: string; title: string; avatar?: string }>;
  milestones: Array<{ date: string; title: string; desc: string; status: 'done' | 'current' | 'future' }>;
  openRoles: Array<{ title: string; dept: string; type: string; skills: string[] }>;
}

export const startups: StartupData[] = [
  { slug: 'greenstack', name: 'GreenStack', sector: 'ClimateTech', stage: 'MVP', score: 86, roles: '2 open roles', summary: 'Operational carbon intelligence for growing manufacturers.',
    fullDesc: 'Building next-generation carbon tracking infrastructure using distributed ledger tech and IoT sensor arrays for real-time emissions data.',
    founded: '2023', location: 'Seattle, WA', backedBy: ['Techstars', 'Climate Fund'],
    team: [
      { name: 'Sarah Jenkins', title: 'CEO & Co-founder' },
      { name: 'David Chen', title: 'CTO' },
      { name: 'Alex Rivera', title: 'Head of Product' },
    ],
    milestones: [
      { date: 'Q3 2023', title: 'MVP Deployment', desc: 'Deployed pilot in 3 partner facilities.', status: 'done' },
      { date: 'Q1 2024 (Current)', title: 'Seed Fundraising', desc: 'Raising $1.5M to scale go-to-market.', status: 'current' },
      { date: 'Q4 2024', title: 'Enterprise API Launch', desc: 'Opening platform for third-party ERP integrations.', status: 'future' },
    ],
    openRoles: [
      { title: 'Senior Data Engineer', dept: 'Engineering', type: 'Full-time · Remote', skills: ['Python', 'AWS'] },
      { title: 'Product Marketing Lead', dept: 'Marketing', type: 'Full-time · Seattle, WA', skills: ['B2B SaaS', 'GTM'] },
    ],
  },
  { slug: 'skillbridge-ai', name: 'SkillBridge AI', sector: 'EdTech', stage: 'Validating', score: 74, roles: '3 open roles', summary: 'Turns student projects into verified, employer-ready skill evidence.',
    fullDesc: 'AI-powered platform that evaluates student project output against industry competency frameworks.',
    founded: '2024', location: 'San Francisco, CA', backedBy: ['EdVentures'],
    team: [{ name: 'Maya Lin', title: 'CEO' }, { name: 'James Park', title: 'CTO & Co-founder' }],
    milestones: [
      { date: 'Jan 2024', title: 'Beta Launch', desc: 'Launched with 3 university partners.', status: 'done' },
      { date: 'Current', title: 'Pilot Expansion', desc: '10 universities in pilot program.', status: 'current' },
    ],
    openRoles: [
      { title: 'Full-Stack Engineer', dept: 'Engineering', type: 'Full-time · SF', skills: ['React', 'Python', 'Postgres'] },
    ],
  },
  { slug: 'mediroute', name: 'MediRoute', sector: 'HealthTech', stage: 'Pilot', score: 91, roles: '1 open role', summary: 'Coordinates faster referrals between clinics and diagnostic centers.',
    fullDesc: 'Streamlining healthcare referrals with intelligent routing and automated follow-ups.',
    founded: '2023', location: 'Boston, MA', backedBy: ['HealthX', 'MassChallenge'],
    team: [{ name: 'Dr. Priya Sharma', title: 'CEO & Founder' }, { name: 'Tom Mueller', title: 'CTO' }],
    milestones: [
      { date: 'Q2 2023', title: 'Pilot Launch', desc: 'Deployed in 2 hospital networks.', status: 'done' },
      { date: 'Current', title: 'Series A Prep', desc: 'Building enterprise sales pipeline.', status: 'current' },
    ],
    openRoles: [
      { title: 'Clinical Operations Lead', dept: 'Operations', type: 'Full-time · Boston', skills: ['Healthcare', 'HIPAA'] },
    ],
  },
  { slug: 'campus-cart', name: 'CampusCart', sector: 'Marketplace', stage: 'Revenue', score: 88, roles: '1 open role', summary: 'A verified student marketplace for affordable campus essentials and services.',
    fullDesc: 'CampusCart helps students buy, sell, rent, and exchange verified goods and services inside trusted university communities.',
    founded: '2024', location: 'Baku, Azerbaijan', backedBy: ['Founder Bridge', 'Caspian Angels'],
    team: [{ name: 'Aysel Mammadova', title: 'CEO & Co-founder' }, { name: 'Murad Hasanli', title: 'Mobile Engineer' }, { name: 'Zahra Ali', title: 'Community Lead' }],
    milestones: [
      { date: 'Sep 2025', title: 'Campus beta', desc: 'Opened the marketplace to two university communities.', status: 'done' },
      { date: 'Current', title: 'Trust and payments', desc: 'Validating escrow and verified seller workflows.', status: 'current' },
      { date: 'Q4 2026', title: 'Five-campus expansion', desc: 'Launch ambassador-led growth across five campuses.', status: 'future' },
    ],
    openRoles: [{ title: 'Backend Engineer', dept: 'Engineering', type: 'Part-time · Baku/Remote', skills: ['Node.js', 'PostgreSQL', 'Payments'] }],
  },
  { slug: 'agrivision', name: 'AgriVision', sector: 'AgriTech', stage: 'MVP', score: 79, roles: '2 open roles', summary: 'Low-cost crop monitoring and irrigation guidance for small regional farms.',
    fullDesc: 'AgriVision combines field imagery, weather data, and practical agronomy workflows to help small farms act earlier with fewer inputs.',
    founded: '2025', location: 'Ganja, Azerbaijan', backedBy: ['Regional Innovation Lab'],
    team: [{ name: 'Rauf Hajiyev', title: 'Founder & Agronomy Lead' }, { name: 'Sabina Karimova', title: 'Data Scientist' }],
    milestones: [
      { date: 'Mar 2026', title: 'Field prototype', desc: 'Completed the first monitored irrigation cycle.', status: 'done' },
      { date: 'Current', title: 'Farm pilot', desc: 'Collecting decision and yield evidence with 12 farms.', status: 'current' },
      { date: 'Q1 2027', title: 'Cooperative rollout', desc: 'Package the service for agricultural cooperatives.', status: 'future' },
    ],
    openRoles: [
      { title: 'IoT Engineer', dept: 'Engineering', type: 'Project · Hybrid', skills: ['IoT', 'Python', 'LoRaWAN'] },
      { title: 'Partnerships Lead', dept: 'Growth', type: 'Part-time · Ganja', skills: ['Agriculture', 'Partnerships'] },
    ],
  },
  { slug: 'legal-lens', name: 'LegalLens', sector: 'LegalTech', stage: 'Validating', score: 68, roles: '2 open roles', summary: 'Plain-language contract review for freelancers and early startup teams.',
    fullDesc: 'LegalLens highlights obligations, deadlines, and risky clauses while keeping a human legal-review path visible.',
    founded: '2026', location: 'Baku, Azerbaijan', backedBy: [],
    team: [{ name: 'Fidan Ahmadli', title: 'Founder & Legal Researcher' }],
    milestones: [
      { date: 'Apr 2026', title: 'Problem interviews', desc: 'Completed 42 structured freelancer interviews.', status: 'done' },
      { date: 'Current', title: 'Review prototype', desc: 'Testing clause explanations with supervised examples.', status: 'current' },
      { date: 'Q4 2026', title: 'Closed beta', desc: 'Release to an invited freelancer cohort.', status: 'future' },
    ],
    openRoles: [
      { title: 'NLP Engineer', dept: 'Engineering', type: 'Co-founder · Remote', skills: ['Python', 'NLP', 'Evaluations'] },
      { title: 'Product Designer', dept: 'Product', type: 'Project · Remote', skills: ['UX Research', 'Prototyping'] },
    ],
  },
  { slug: 'mindharbor', name: 'MindHarbor', sector: 'Wellbeing', stage: 'Pilot', score: 82, roles: '0 open roles', summary: 'A privacy-conscious wellbeing navigation service built for university students.',
    fullDesc: 'MindHarbor helps students find the right support pathway, prepare for appointments, and follow through without diagnosing or replacing clinicians.',
    founded: '2025', location: 'Baku, Azerbaijan', backedBy: ['Campus Wellbeing Fund'],
    team: [{ name: 'Laman Aliyeva', title: 'CEO & Psychology Lead' }, { name: 'Orkhan Nabiyev', title: 'Full-stack Engineer' }, { name: 'Gunel Rahimova', title: 'Student Partnerships' }],
    milestones: [
      { date: 'Nov 2025', title: 'Safety review', desc: 'Completed clinical and privacy workflow review.', status: 'done' },
      { date: 'Current', title: 'Faculty pilot', desc: 'Piloting guided navigation with two student services teams.', status: 'current' },
      { date: 'Q1 2027', title: 'Referral network', desc: 'Expand verified support-provider coverage.', status: 'future' },
    ],
    openRoles: [],
  },
  { slug: 'routewise', name: 'RouteWise', sector: 'Mobility', stage: 'Idea', score: 61, roles: '3 open roles', summary: 'Crowdsourced accessibility intelligence for everyday urban routes.',
    fullDesc: 'RouteWise captures structured accessibility observations and turns them into more useful routing context for people with mobility needs.',
    founded: '2026', location: 'Baku, Azerbaijan', backedBy: [],
    team: [{ name: 'Emil Safarov', title: 'Founder & Urban Researcher' }],
    milestones: [
      { date: 'Jun 2026', title: 'Route research', desc: 'Mapped the first 120 accessibility observations.', status: 'done' },
      { date: 'Current', title: 'Prototype scope', desc: 'Defining contribution trust and moderation rules.', status: 'current' },
      { date: 'Q4 2026', title: 'Community mapping day', desc: 'Run the first verified mapping event.', status: 'future' },
    ],
    openRoles: [
      { title: 'React Native Engineer', dept: 'Engineering', type: 'Co-founder · Remote', skills: ['React Native', 'Maps'] },
      { title: 'Accessibility Researcher', dept: 'Research', type: 'Part-time · Baku', skills: ['Accessibility', 'Research'] },
      { title: 'Community Operator', dept: 'Community', type: 'Volunteer lead · Baku', skills: ['Community', 'Operations'] },
    ],
  },
]

export interface MentorData {
  id: EntityId
  name: string
  title: string
  expertise: string[]
  company: string
  rating: number
  sessions: number
  availability: string
  focusStage: string
  sectors?: string[]
  languages?: string[]
  bio: string
  status: 'active' | 'pending' | 'suspended'
}

export const mentors: MentorData[] = [
  { id: 'mnt_1', name: 'Tarlan Yusifzade', title: 'Mentor · ex-VC', expertise: ['Fundraising', 'Go-to-market', 'Strategy'], company: 'Independent', rating: 4.9, sessions: 64, availability: 'Office hours weekly', focusStage: 'Pre-seed → Seed', sectors: ['B2B SaaS', 'Marketplaces'], languages: ['Azerbaijani', 'English'], bio: 'Operator-turned-investor. Mentors founders on validation and raise readiness.', status: 'active' },
  { id: 'mnt_2', name: 'Dr. Leyla Mammad', title: 'Mentor · AI/ML', expertise: ['AI', 'LLM Apps', 'MLOps'], company: 'ModelWorks (ex)', rating: 4.8, sessions: 41, availability: 'Bi-weekly', focusStage: 'MVP → Scale', sectors: ['Applied AI', 'Developer tools'], languages: ['English', 'Azerbaijani'], bio: 'Applied AI lead. Workshops on evaluations, inference cost, and shipping.', status: 'active' },
  { id: 'mnt_3', name: 'Rashad Aliyev', title: 'Mentor · Product & Design', expertise: ['Product', 'UX Research', 'Design Systems'], company: 'North Studio', rating: 4.7, sessions: 38, availability: 'Weekly', focusStage: 'Idea → Validation', sectors: ['Consumer', 'Education'], languages: ['Azerbaijani', 'English'], bio: 'Product designer coaching founders on trustworthy onboarding and research.', status: 'active' },
  { id: 'mnt_4', name: 'Nigar Veliyeva', title: 'Mentor · Climate', expertise: ['Climate', 'Operations', 'Impact'], company: 'GreenStack (advisor)', rating: 4.9, sessions: 27, availability: 'Monthly', focusStage: 'Pilot → MVP', sectors: ['Climate', 'AgriTech'], languages: ['Azerbaijani', 'English'], bio: 'Climate operator. Helps teams design pilots and measure real impact.', status: 'pending' },
  { id: 'mnt_5', name: 'Dr. Elvin Huseyn', title: 'Mentor · Health', expertise: ['Health', 'Regulatory', 'Operations'], company: 'MediMatch (advisor)', rating: 4.6, sessions: 19, availability: 'Monthly', focusStage: 'Validation → Revenue', sectors: ['HealthTech', 'Care operations'], languages: ['Azerbaijani', 'English', 'Russian'], bio: 'Healthcare operator guiding provider onboarding and compliance.', status: 'pending' },
  { id: 'mnt_6', name: 'Aysu Qasimova', title: 'Mentor · Growth', expertise: ['Growth', 'Content', 'Community'], company: 'Orbit Labs', rating: 4.5, sessions: 52, availability: 'Weekly', focusStage: 'Launch → Scale', sectors: ['Consumer', 'Communities'], languages: ['Azerbaijani', 'English'], bio: 'Growth practitioner for early consumer and community products.', status: 'suspended' },
  { id: 'mnt_7', name: 'Samir Rustamli', title: 'Mentor · Engineering Leadership', expertise: ['Backend', 'Architecture', 'Hiring'], company: 'Caspian Cloud', rating: 4.8, sessions: 33, availability: 'Bi-weekly', focusStage: 'MVP → Pilot', sectors: ['B2B SaaS', 'Infrastructure'], languages: ['Azerbaijani', 'English', 'Russian'], bio: 'Engineering leader helping student teams scope reliable systems and make their first technical hires.', status: 'active' },
  { id: 'mnt_8', name: 'Nermin Jafarova', title: 'Mentor · Marketplaces', expertise: ['Marketplaces', 'Growth', 'Trust & Safety'], company: 'Independent', rating: 4.7, sessions: 29, availability: 'Weekly', focusStage: 'Validation → Revenue', sectors: ['Marketplaces', 'FinTech'], languages: ['Azerbaijani', 'English'], bio: 'Marketplace operator focused on liquidity, trusted transactions, and repeatable campus growth.', status: 'active' },
]
import type { EntityId } from './types'
