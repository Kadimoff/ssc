

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
  bio: string
  status: 'active' | 'pending' | 'suspended'
}

export const mentors: MentorData[] = [
  { id: 'mnt_1', name: 'Tarlan Yusifzade', title: 'Mentor · ex-VC', expertise: ['Fundraising', 'Go-to-market', 'Strategy'], company: 'Independent', rating: 4.9, sessions: 64, availability: 'Office hours weekly', focusStage: 'Pre-seed → Seed', bio: 'Operator-turned-investor. Mentors founders on validation and raise readiness.', status: 'active' },
  { id: 'mnt_2', name: 'Dr. Leyla Mammad', title: 'Mentor · AI/ML', expertise: ['AI', 'LLM Apps', 'MLOps'], company: 'ModelWorks (ex)', rating: 4.8, sessions: 41, availability: 'Bi-weekly', focusStage: 'MVP → Scale', bio: 'Applied AI lead. Workshops on evaluations, inference cost, and shipping.', status: 'active' },
  { id: 'mnt_3', name: 'Rashad Aliyev', title: 'Mentor · Product & Design', expertise: ['Product', 'UX Research', 'Design Systems'], company: 'North Studio', rating: 4.7, sessions: 38, availability: 'Weekly', focusStage: 'Idea → Validation', bio: 'Product designer coaching founders on trustworthy onboarding and research.', status: 'active' },
  { id: 'mnt_4', name: 'Nigar Veliyeva', title: 'Mentor · Climate', expertise: ['Climate', 'Operations', 'Impact'], company: 'GreenStack (advisor)', rating: 4.9, sessions: 27, availability: 'Monthly', focusStage: 'Pilot → MVP', bio: 'Climate operator. Helps teams design pilots and measure real impact.', status: 'pending' },
  { id: 'mnt_5', name: 'Dr. Elvin Huseyn', title: 'Mentor · Health', expertise: ['Health', 'Regulatory', 'Operations'], company: 'MediMatch (advisor)', rating: 4.6, sessions: 19, availability: 'Monthly', focusStage: 'Validation → Revenue', bio: 'Healthcare operator guiding provider onboarding and compliance.', status: 'pending' },
  { id: 'mnt_6', name: 'Aysu Qasimova', title: 'Mentor · Growth', expertise: ['Growth', 'Content', 'Community'], company: 'Orbit Labs', rating: 4.5, sessions: 52, availability: 'Weekly', focusStage: 'Launch → Scale', bio: 'Growth practitioner for early consumer and community products.', status: 'suspended' },
]
import type { EntityId } from './types'
