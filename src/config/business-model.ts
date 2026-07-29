export type PublicPrice = 'Free' | 'Contact us' | 'Custom' | 'Custom project scope'

export type BusinessPackageId =
  | 'students-founders'
  | 'institutional-pilot'
  | 'campus-platform'
  | 'multi-campus'
  | 'program-operations'

export interface BusinessPackage {
  id: BusinessPackageId
  audience: string[]
  publicLabel: string
  billingModel: 'free' | 'institutional-license' | 'custom-agreement' | 'project-scope'
  publicPrice: PublicPrice
  description: string
  features: string[]
  cta: string
  active: boolean
  public: boolean
  assumption: boolean
}

export const businessPackages: BusinessPackage[] = [
  {
    id: 'students-founders',
    audience: ['Students', 'Builders', 'Founders', 'Startup team members'],
    publicLabel: 'Students & Founders',
    billingModel: 'free',
    publicPrice: 'Free',
    description: 'The core individual startup-building experience remains free.',
    features: ['Verified profile workflow', 'Startup workspace', 'Team and role discovery', 'Milestones and evidence', 'Mentorship discovery', 'Program applications', 'Community participation', 'Basic investor visibility'],
    cta: 'Start building free',
    active: true,
    public: true,
    assumption: false,
  },
  {
    id: 'institutional-pilot',
    audience: ['One university', 'One innovation office', 'One accelerator', 'One pilot program'],
    publicLabel: 'Institutional Pilot',
    billingModel: 'institutional-license',
    publicPrice: 'Contact us',
    description: 'A controlled 8–12 week pilot for one program and a defined stakeholder group.',
    features: ['Initial setup', 'Verification workflow', 'One program or cohort', 'Milestone and evidence tracking', 'Mentor operations', 'Outcome snapshot', 'Pilot review'],
    cta: 'Request a pilot',
    active: true,
    public: true,
    assumption: false,
  },
  {
    id: 'campus-platform',
    audience: ['Universities', 'Innovation offices', 'Entrepreneurship centers'],
    publicLabel: 'Campus Platform',
    billingModel: 'institutional-license',
    publicPrice: 'Contact us',
    description: 'Ongoing infrastructure for coordinated university entrepreneurship operations.',
    features: ['Multiple startup workspaces', 'University administration', 'Mentor management', 'Program discovery and applications', 'Cohort tracking', 'Reporting and exports', 'Verified outcomes', 'Partner coordination'],
    cta: 'Talk to SSC',
    active: true,
    public: true,
    assumption: false,
  },
  {
    id: 'multi-campus',
    audience: ['Multi-university consortiums', 'Regional ecosystem operators', 'Foundations'],
    publicLabel: 'Multi-campus / Consortium',
    billingModel: 'custom-agreement',
    publicPrice: 'Custom',
    description: 'Shared infrastructure with configurable governance across several institutions.',
    features: ['Multiple institutions', 'Cross-campus programs', 'Shared ecosystem visibility', 'Custom reporting', 'Integrations', 'Configurable governance'],
    cta: 'Discuss a partnership',
    active: true,
    public: true,
    assumption: false,
  },
  {
    id: 'program-operations',
    audience: ['Accelerators', 'Program operators', 'Corporate challenge teams'],
    publicLabel: 'Program Operations',
    billingModel: 'project-scope',
    publicPrice: 'Custom project scope',
    description: 'Hands-on configuration and operations support for a defined program.',
    features: ['Program setup', 'Application workflow', 'Cohort operations', 'Mentor coordination', 'Evidence collection', 'Demo-day preparation', 'Outcome report'],
    cta: 'Plan a program',
    active: true,
    public: true,
    assumption: false,
  },
]

export const primaryRevenueStreams = [
  { title: 'Institutional platform licenses', description: 'Role-based administration, verification, portfolios, programs, evidence, outcomes, audit and reporting.' },
  { title: 'Program operations and implementation', description: 'Pilot setup, onboarding, cohort configuration, mentor operations, training, migration and outcome-report configuration.' },
  { title: 'Multi-campus and consortium agreements', description: 'Cross-campus discovery, shared programs, ecosystem reporting, configurable access and integration support.' },
  { title: 'Corporate and ecosystem partner programs', description: 'Challenges, sponsored cohorts, expert contributions, scouting workflows and consent-based introductions.' },
  { title: 'Optional institutional add-ons', description: 'Advanced analytics, custom reports, API access, integrations, migration, branded pages and priority onboarding.' },
] as const

export const trustCommitments = [
  'No sale of student or founder personal data',
  'No paid ranking placement or paid verification',
  'No mandatory founder subscription',
  'No default founder equity or investment commission',
] as const
