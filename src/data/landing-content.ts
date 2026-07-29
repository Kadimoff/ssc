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
  { value: 'Verify', label: 'participant eligibility' },
  { value: 'Build', label: 'teams and milestones' },
  { value: 'Prove', label: 'evidence and progress' },
  { value: 'Operate', label: 'programs and mentors' },
  { value: 'Report', label: 'verified outcomes' },
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
  { name: 'Aylin Mammadova', avatarUrl: 'images/founders/aysel-mammadova.webp', role: 'Program Operator', university: 'Sample ecosystem', skills: ['Operations', 'Strategy'], focus: 'Program delivery', stage: 'Demo profile' },
  { name: 'Reshad Guliyev', avatarUrl: 'images/founders/reshad-quliyev.webp', role: 'Student Founder', university: 'Sample ecosystem', skills: ['Climate', 'Product'], focus: 'Climate intelligence', stage: 'Demo profile' },
  { name: 'Leyla Aliyeva', avatarUrl: 'images/founders/leyla-aliyeva.webp', role: 'Student Builder', university: 'Sample ecosystem', skills: ['Research', 'Design'], focus: 'Future of work', stage: 'Demo profile' },
  { name: 'Kamran Vali', avatarUrl: 'images/avatars/kamran-vali.webp', role: 'Technical Teammate', university: 'Sample ecosystem', skills: ['APIs', 'Data'], focus: 'Industrial SaaS', stage: 'Demo profile' },
  { name: 'Tarlan Yusifzade', avatarUrl: 'images/avatars/tarlan-yusifzade.webp', role: 'Product Mentor', university: 'Sample mentor pool', skills: ['Validation', 'GTM'], focus: 'Product strategy', stage: 'Demo profile' },
  { name: 'Nargiz Rahim', avatarUrl: 'images/avatars/nargiz-rahim.webp', role: 'Health Founder', university: 'Sample ecosystem', skills: ['Operations', 'Health'], focus: 'HealthTech', stage: 'Demo profile' },
  { name: 'Elvin Safar', avatarUrl: 'images/avatars/elvin-safar.webp', role: 'Education Founder', university: 'Sample ecosystem', skills: ['Learning', 'Growth'], focus: 'EdTech', stage: 'Demo profile' },
  { name: 'Nihat Abbasov', avatarUrl: 'images/avatars/nihat-abbasov.webp', role: 'Program Reviewer', university: 'Sample operator', skills: ['Evidence', 'Cohorts'], focus: 'Program operations', stage: 'Demo profile' },
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

export const universityWordmarks = [
  'University innovation office',
  'Entrepreneurship centre',
  'Campus incubator',
  'Program operator',
  'Regional consortium',
]

export const communityDetails: CommunityDetail[] = [
  {
    id: 'com_1',
    name: 'Applied AI Builders',
    category: 'AI',
    description: 'Practical AI products, evaluations and production lessons.',
    descriptionFull: 'A community of engineers, researchers and product builders shipping real AI systems. We share production patterns, evaluation strategies and lessons learned from deploying models in the wild.',
    coverUrl: 'images/feed/greenstack-dashboard.webp',
    members: 22100,
    activity: '34 new discussions',
    joined: true,
    rules: ['Be constructive', 'No self-promotion without context', 'Cite sources for claims', 'Respect confidentiality'],
    organizers: ['usr_1', 'usr_2'],
    memberList: [
      { userId: 'usr_1', role: 'admin', joinedAt: '2025-09-01' },
      { userId: 'usr_2', role: 'moderator', joinedAt: '2025-09-15' },
    ],
    createdAt: '2025-09-01',
  },
  {
    id: 'com_2',
    name: 'Founders & Early Teams',
    category: 'Startups',
    description: 'A focused space for founders and early operators.',
    descriptionFull: 'For student founders and early-stage operators navigating the journey from idea to traction. We discuss fundraising, team-building, product-market fit, and the emotional reality of building something new.',
    coverUrl: 'images/feed/ssc-founder-workshop.webp',
    members: 18400,
    activity: '12 events this month',
    joined: false,
    rules: ['Founders only', 'No generic pitch decks', 'Give more than you take'],
    organizers: ['usr_1'],
    memberList: [
      { userId: 'usr_1', role: 'admin', joinedAt: '2025-10-01' },
    ],
    createdAt: '2025-10-01',
  },
  {
    id: 'com_3',
    name: 'Product Design Leaders',
    category: 'Design',
    description: 'Design systems, research and product leadership.',
    descriptionFull: 'For designers and design leaders building systems, shaping research practices and driving product decisions. We share case studies, critique processes and frameworks for design leadership.',
    coverUrl: 'images/feed/eduflow-product.webp',
    members: 9700,
    activity: '8 featured critiques',
    joined: false,
    rules: ['Portfolio critiques welcome', 'Credit other designers', 'No spec work requests'],
    organizers: ['usr_3'],
    memberList: [
      { userId: 'usr_3', role: 'admin', joinedAt: '2025-11-01' },
    ],
    createdAt: '2025-11-01',
  },
  {
    id: 'com_4',
    name: 'Climate & AgriTech Lab',
    category: 'Impact',
    description: 'Field pilots, climate measurement, agriculture and operational evidence.',
    descriptionFull: 'A practical working group for teams testing climate and agriculture products. Members review pilot design, field evidence, operational constraints, and responsible impact claims.',
    coverUrl: 'images/feed/greenstack-dashboard.webp',
    members: 6800,
    activity: '5 pilot reviews this week',
    joined: false,
    rules: ['Separate measured results from assumptions', 'Protect farmer and partner data', 'Share actionable field notes'],
    organizers: ['usr_11', 'usr_14'],
    memberList: [
      { userId: 'usr_14', role: 'admin', joinedAt: '2026-02-01' },
      { userId: 'usr_11', role: 'moderator', joinedAt: '2026-02-03' },
    ],
    createdAt: '2026-02-01',
  },
  {
    id: 'com_5',
    name: 'Student Marketplace Operators',
    category: 'Marketplaces',
    description: 'Liquidity, campus launches, trust and safety for marketplace builders.',
    descriptionFull: 'Marketplace founders and operators share experiments around campus density, supply activation, trusted transactions, moderation, and repeat usage.',
    coverUrl: 'images/feed/ssc-founder-workshop.webp',
    members: 4200,
    activity: '19 operator notes',
    joined: true,
    rules: ['Share the metric behind the lesson', 'No unverified growth claims', 'Treat trust and safety as product work'],
    organizers: ['usr_9'],
    memberList: [
      { userId: 'usr_9', role: 'admin', joinedAt: '2026-03-10' },
      { userId: 'usr_10', role: 'member', joinedAt: '2026-03-12' },
    ],
    createdAt: '2026-03-10',
  },
  {
    id: 'com_6',
    name: 'Backend & Data Guild',
    category: 'Engineering',
    description: 'Architecture reviews, API design, data systems and practical pairing.',
    descriptionFull: 'A hands-on engineering guild for backend, data, and platform builders. Members exchange architecture reviews, pairing requests, reliability lessons, and scoped startup collaboration opportunities.',
    coverUrl: 'images/feed/eduflow-product.webp',
    members: 11500,
    activity: '7 open collaboration requests',
    joined: true,
    rules: ['Provide context with code questions', 'Do not expose credentials or private data', 'Prefer reproducible examples'],
    organizers: ['usr_4', 'usr_16'],
    memberList: [
      { userId: 'usr_16', role: 'admin', joinedAt: '2026-01-15' },
      { userId: 'usr_4', role: 'moderator', joinedAt: '2026-01-18' },
      { userId: 'usr_13', role: 'member', joinedAt: '2026-02-02' },
    ],
    createdAt: '2026-01-15',
  },
]
