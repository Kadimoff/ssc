import type { CommunityDetail } from './types'

export type EcosystemIcon = 'investors' | 'incubation' | 'mentors' | 'ecosystem' | 'students' | 'universities'

export interface EcosystemPillar {
  title: string
  description: string
  icon: EcosystemIcon
}

export interface FeaturedMember {
  name: string
  avatarUrl: string
  role: string
  university: string
  skills: string[]
  focus: string
  stage: string
}

export interface NewsItem {
  category: string
  date: string
  title: string
  summary: string
}

export interface EventItem {
  day: string
  month: string
  time: string
  location: string
  title: string
  format: string
}

export const ecosystemMetrics = [
  { value: '1,200+', label: 'student builders' },
  { value: '18', label: 'university communities' },
  { value: '45+', label: 'active mentors' },
  { value: '8', label: 'incubation tracks' },
  { value: '30+', label: 'ecosystem partners' },
]

export const ecosystemPillars: EcosystemPillar[] = [
  { icon: 'investors', title: 'Investor Connections', description: 'Warm introductions, pitch feedback and investor-readiness sessions for emerging student ventures.' },
  { icon: 'incubation', title: 'Incubation Programs', description: 'Structured tracks that move ideas from early validation to a focused and testable business model.' },
  { icon: 'mentors', title: 'Mentor Network', description: 'Operators, founders and domain experts who help students make stronger product and market decisions.' },
  { icon: 'ecosystem', title: 'Startup Ecosystem', description: 'A shared space connecting student teams with accelerators, communities and industry opportunities.' },
  { icon: 'students', title: 'Student Founders', description: 'Ambitious builders from different disciplines finding teammates and shipping their first real products.' },
  { icon: 'universities', title: 'University Partners', description: 'Campus communities that make entrepreneurship visible, accessible and collaborative for more students.' },
]

export const featuredMembers: FeaturedMember[] = [
  { name: 'Aylin Mammadova', avatarUrl: 'https://i.pravatar.cc/240?img=47', role: 'Product Lead', university: 'Baku Engineering University', skills: ['Discovery', 'Strategy'], focus: 'EdTech', stage: 'Validating' },
  { name: 'Murad Aliyev', avatarUrl: 'https://i.pravatar.cc/240?img=12', role: 'Student Founder', university: 'ADA University', skills: ['AI', 'Python'], focus: 'Climate intelligence', stage: 'MVP' },
  { name: 'Leyla Karim', avatarUrl: 'https://i.pravatar.cc/240?img=32', role: 'UX Researcher', university: 'Azerbaijan State University of Economics', skills: ['Research', 'Design'], focus: 'Future of work', stage: 'Exploring' },
  { name: 'Nihat Abbasov', avatarUrl: 'https://i.pravatar.cc/240?img=11', role: 'Technical Co-founder', university: 'Baku Higher Oil School', skills: ['APIs', 'Data'], focus: 'Industrial SaaS', stage: 'Piloting' },
  { name: 'Zahra Hasanli', avatarUrl: 'https://i.pravatar.cc/240?img=45', role: 'Community Builder', university: 'Khazar University', skills: ['Growth', 'Events'], focus: 'Creator economy', stage: 'Building' },
  { name: 'Kamran Vali', avatarUrl: 'https://i.pravatar.cc/240?img=68', role: 'AI Engineer', university: 'Azerbaijan Technical University', skills: ['LLMs', 'MLOps'], focus: 'HealthTech', stage: 'MVP' },
  { name: 'Farid Rahimli', avatarUrl: 'https://i.pravatar.cc/240?img=14', role: 'Growth Lead', university: 'Baku State University', skills: ['Go-to-market', 'Sales'], focus: 'FinTech', stage: 'Testing' },
  { name: 'Nigar Safarova', avatarUrl: 'https://i.pravatar.cc/240?img=44', role: 'Impact Founder', university: 'French-Azerbaijani University', skills: ['Impact', 'Operations'], focus: 'Circular economy', stage: 'Validating' },
]

export const newsItems: NewsItem[] = [
  { category: 'Community', date: 'July 2026', title: 'The next student founder cohort is taking shape', summary: 'Applications open for multidisciplinary teams ready to validate a meaningful problem.' },
  { category: 'Ecosystem', date: 'July 2026', title: 'Mentor office hours expand across six product domains', summary: 'New sessions cover AI, climate, fintech, health, education and go-to-market strategy.' },
  { category: 'Opportunity', date: 'August 2026', title: 'University teams prepare for the SSC demo showcase', summary: 'Selected teams will present progress, customer evidence and their next milestone.' },
]

export const eventItems: EventItem[] = [
  { day: '12', month: 'JUL', time: '18:30', location: 'Baku · Hybrid', title: 'From idea to a testable problem', format: 'Founder workshop' },
  { day: '19', month: 'JUL', time: '12:00', location: 'Online', title: 'Investor readiness for student teams', format: 'Open session' },
  { day: '03', month: 'AUG', time: '17:00', location: 'Baku', title: 'SSC community demo evening', format: 'Showcase' },
]

export const universityWordmarks = ['ADA University', 'BEU', 'BHOS', 'UNEC', 'Khazar University', 'BSU', 'AzTU', 'UFAZ']

export const communityDetails: CommunityDetail[] = [
  {
    id: 1,
    name: 'Applied AI Builders',
    category: 'AI',
    description: 'Practical AI products, evaluations and production lessons.',
    descriptionFull: 'A community of engineers, researchers and product builders shipping real AI systems. We share production patterns, evaluation strategies and lessons learned from deploying models in the wild.',
    coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    members: 22100,
    activity: '34 new discussions',
    joined: true,
    rules: ['Be constructive', 'No self-promotion without context', 'Cite sources for claims', 'Respect confidentiality'],
    organizers: [1, 2],
    memberList: [
      { userId: 1, role: 'admin', joinedAt: '2025-09-01' },
      { userId: 2, role: 'moderator', joinedAt: '2025-09-15' },
    ],
    createdAt: '2025-09-01',
  },
  {
    id: 2,
    name: 'Founders & Early Teams',
    category: 'Startups',
    description: 'A focused space for founders and early operators.',
    descriptionFull: 'For student founders and early-stage operators navigating the journey from idea to traction. We discuss fundraising, team-building, product-market fit, and the emotional reality of building something new.',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    members: 18400,
    activity: '12 events this month',
    joined: false,
    rules: ['Founders only', 'No generic pitch decks', 'Give more than you take'],
    organizers: [1],
    memberList: [
      { userId: 1, role: 'admin', joinedAt: '2025-10-01' },
    ],
    createdAt: '2025-10-01',
  },
  {
    id: 3,
    name: 'Product Design Leaders',
    category: 'Design',
    description: 'Design systems, research and product leadership.',
    descriptionFull: 'For designers and design leaders building systems, shaping research practices and driving product decisions. We share case studies, critique processes and frameworks for design leadership.',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    members: 9700,
    activity: '8 featured critiques',
    joined: false,
    rules: ['Portfolio critiques welcome', 'Credit other designers', 'No spec work requests'],
    organizers: [3],
    memberList: [
      { userId: 3, role: 'admin', joinedAt: '2025-11-01' },
    ],
    createdAt: '2025-11-01',
  },
]
