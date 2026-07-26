export interface EditorialArticle {
  slug: string
  category: 'Announcement' | 'Community' | 'Events' | 'Startups' | 'Research'
  date: string
  title: string
  summary: string
  body: string[]
  takeaways: string[]
}

export const articles: EditorialArticle[] = [
  { slug: 'cross-campus-founder-sprint', category: 'Announcement', date: 'Jul 21, 2026', title: 'Designing the Cross-Campus Founder Sprint', summary: 'How SSC is structuring a partnership-led pilot around explicit roles, evidence, and correction rights.', body: ['The pilot is being configured as an illustrative program until participating organizations formally approve their involvement.', 'Every contribution begins as pending. Program managers can report it only after evidence review and a separate verification action.', 'The design separates activity, output, outcome, and long-term impact so that useful operating signals do not become inflated public claims.'], takeaways: ['Roles are agreed before recruitment', 'Evidence is attached to reportable outcomes', 'Partners receive a correction window'] },
  { slug: 'mentor-network-operating-model', category: 'Community', date: 'Jul 16, 2026', title: 'A More Accountable Mentor Network', summary: 'Goal-led bookings and scoped notes make mentor support more useful without exposing confidential founder conversations.', body: ['Mentorship works best when each session starts with a concrete decision or obstacle.', 'SSC records scheduling context and a completion signal while keeping private discussion details outside general partner reporting.'], takeaways: ['Goals before sessions', 'Minimum necessary notes', 'Completion and feedback remain distinct'] },
  { slug: 'evidence-first-founder-reporting', category: 'Research', date: 'Jul 9, 2026', title: 'Evidence-First Founder Reporting', summary: 'A practical framework for distinguishing progress signals from verified outcomes.', body: ['A milestone is not automatically an outcome, and an outcome is not automatically impact.', 'The platform therefore records evidence type, owner, verifier, attribution mode, and methodology version alongside reported results.'], takeaways: ['Define the denominator', 'Keep methodology versioned', 'Exclude unsupported claims'] },
  { slug: 'community-demo-evening', category: 'Events', date: 'Jul 3, 2026', title: 'Community Demo Evening', summary: 'An illustrative event format focused on evidence, learning, and next milestones rather than polished storytelling.', body: ['Teams present the problem, evidence gathered, what changed, and the next decision.', 'The event record remains illustrative until a real venue, date, and participating organizations are confirmed.'], takeaways: ['Evidence over theatre', 'Specific next decisions', 'No unapproved partner logos'] },
]

export interface CommunityEvent {
  slug: string
  title: string
  format: string
  date: string
  time: string
  location: string
  capacity: number
  registered: number
  description: string
  agenda: string[]
  host: string
}

export const communityEvents: CommunityEvent[] = [
  { slug: 'problem-validation-clinic', title: 'Problem Validation Clinic', format: 'Workshop', date: '2026-08-12', time: '18:30', location: 'Baku · Hybrid', capacity: 60, registered: 34, description: 'Turn assumptions into a focused interview and evidence plan.', agenda: ['Problem framing', 'Interview design', 'Evidence review'], host: 'SSC Program Team' },
  { slug: 'investor-readiness-office-hours', title: 'Investor Readiness Office Hours', format: 'Office hours', date: '2026-08-19', time: '12:00', location: 'Online', capacity: 24, registered: 18, description: 'Small-group review of traction, readiness, and fundraising assumptions.', agenda: ['Readiness baseline', 'Evidence gaps', 'Next investor milestone'], host: 'Illustrative Mentor Network' },
  { slug: 'community-demo-evening', title: 'Community Demo Evening', format: 'Showcase', date: '2026-09-03', time: '17:00', location: 'Baku', capacity: 120, registered: 51, description: 'Teams share verified progress, learning, and the next decision they need to make.', agenda: ['Team demonstrations', 'Partner feedback', 'Next-step matching'], host: 'SSC' },
]
