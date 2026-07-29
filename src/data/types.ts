export type EntityId = string
export type Role = 'admin' | 'member'
export type PlatformRole =
  | 'student'
  | 'founder'
  | 'mentor'
  | 'investor'
  | 'partner_admin'
  | 'program_manager'
  | 'moderator'
  | 'platform_admin'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'

export interface User {
  id: EntityId
  username: string
  name: string
  avatar?: string
  email: string
  title: string
  company: string
  industry: string
  location: string
  skills: string
  about: string
  availability: string
  website: string
  role: Role
  roles: PlatformRole[]
  activeRole: PlatformRole
  verificationStatus: VerificationStatus
}

export type PostKind = 'update' | 'milestone' | 'raise' | 'hiring' | 'launch' | 'question' | 'event' | 'partnership'

export interface Comment {
  id: EntityId
  authorId: EntityId
  text: string
  createdAt: string
}

export interface PostLink {
  title: string
  subtitle: string
  url: string
}

export interface Post {
  id: EntityId
  authorId: EntityId
  content: string
  type: string
  /** Typed kind drives the badge / color / icon. Falls back to `type` for legacy data. */
  kind?: PostKind
  previewTitle?: string
  previewSubtitle?: string
  /** Rich link preview (preferred over previewTitle/Subtitle). */
  link?: PostLink
  tags?: string[]
  media?: string[]
  commentsList?: Comment[]
  createdAt: string
  reactions: number
  comments: number
  reposts: number
  liked: boolean
  saved: boolean
}

export interface Community {
  id: EntityId
  name: string
  category: string
  description: string
  members: number
  activity: string
  joined: boolean
}

export interface CommunityDetail extends Community {
  coverUrl: string
  descriptionFull: string
  rules: string[]
  organizers: EntityId[]
  memberList: Array<{ userId: EntityId; role: 'admin' | 'moderator' | 'member'; joinedAt: string }>
  createdAt: string
}

export interface Job {
  id: EntityId
  role: string
  company: string
  location: string
  type: string
  skills: string
  description: string
  featured: boolean
  applied: boolean
  saved: boolean
}

export interface StartupRecord {
  id?: EntityId
  slug: string
  name: string
  sector: string
  stage: string
  score: number
  roles: string
  summary: string
  fullDesc: string
  founded: string
  location: string
  backedBy: string[]
  team: Array<{ name: string; title: string; avatar?: string }>
  milestones: Array<{ date: string; title: string; desc: string; status: 'done' | 'current' | 'future' }>
  openRoles: Array<{ title: string; dept: string; type: string; skills: string[] }>
}

export interface MentorRecord {
  id: EntityId
  userId?: EntityId
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

export interface Conversation {
  id: EntityId
  participantIds: EntityId[]
}

export interface Message {
  id: EntityId
  conversationId: EntityId
  senderId: EntityId
  text: string
  createdAt: string
}

export type OrganizationType =
  | 'university'
  | 'student_community'
  | 'company'
  | 'accelerator'
  | 'sponsor'
  | 'investor_network'
  | 'ngo'
  | 'public_body'

export interface OrganizationContact {
  id: EntityId
  name: string
  title: string
  email: string
  primary: boolean
}

export interface Organization {
  id: EntityId
  type: OrganizationType
  legalName: string
  displayName: string
  slug: string
  summary: string
  countryCode: string
  websiteUrl: string
  verificationStatus: VerificationStatus
  partnershipStatus: 'prospect' | 'onboarding' | 'active' | 'paused' | 'ended'
  contributionAreas: string[]
  contacts: OrganizationContact[]
  createdAt: string
}

export interface OrgMembership {
  id: EntityId
  organizationId: EntityId
  userId: EntityId
  title: string
  roles: PlatformRole[]
  status: 'invited' | 'active' | 'suspended'
  createdAt: string
}

export type AgreementType = 'mou' | 'sponsorship' | 'challenge' | 'mentor_network' | 'data_sharing' | 'pilot'
export type AgreementStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated'

export interface AgreementParty {
  id: EntityId
  agreementId: EntityId
  organizationId: EntityId
  role: string
  responsibilitySummary: string
}

export interface PartnershipAgreement {
  id: EntityId
  type: AgreementType
  title: string
  status: AgreementStatus
  startsAt: string
  endsAt: string
  reviewAt: string
  intendedOutcomes: string[]
  resourceCommitments: string[]
  dataTerms: string
  brandingTerms: string
  programScope: string
  documentName: string
  documentUrl: string
  createdBy: EntityId
  createdAt: string
}

export type ProgramType = 'accelerator' | 'challenge' | 'sprint' | 'demo_day' | 'mentor_series' | 'incubator_prep'
export type ProgramStatus = 'draft' | 'open' | 'active' | 'completed' | 'archived'
export type ProgramPartnerRole = 'host' | 'delivery' | 'mentor' | 'challenge_owner' | 'sponsor' | 'judge' | 'investor_access' | 'community'

export interface Program {
  id: EntityId
  name: string
  type: ProgramType
  status: ProgramStatus
  hostOrganizationId: EntityId
  description: string
  startsAt: string
  endsAt: string
  eligibilityRules: string[]
  milestoneLabels: string[]
  outcomesFramework: string[]
  createdAt: string
}

export interface ProgramPartner {
  id: EntityId
  programId: EntityId
  organizationId: EntityId
  role: ProgramPartnerRole
  commitmentSummary: string
}

export interface Cohort {
  id: EntityId
  programId: EntityId
  name: string
  status: 'draft' | 'recruiting' | 'active' | 'completed'
  startsAt: string
  endsAt: string
  capacity: number
}

export interface CohortParticipant {
  id: EntityId
  cohortId: EntityId
  userId?: EntityId
  startupSlug?: string
  status: 'invited' | 'applied' | 'accepted' | 'active' | 'completed' | 'withdrawn'
  joinedAt: string
}

export type ContributionType = 'mentors' | 'students' | 'challenge' | 'funding' | 'credits' | 'space' | 'judging' | 'pilot_access' | 'marketing'

export interface PartnerContribution {
  id: EntityId
  programId: EntityId
  organizationId: EntityId
  type: ContributionType
  quantity: number
  unit: string
  description: string
  evidenceIds: EntityId[]
  verificationStatus: VerificationStatus
  verifiedBy?: EntityId
  verifiedAt?: string
  createdAt: string
}

export type EvidenceType = 'task' | 'milestone' | 'mentor_note' | 'contribution' | 'attendance' | 'submission' | 'review' | 'introduction' | 'agreement' | 'file' | 'link'

export interface EvidenceArtifact {
  id: EntityId
  type: EvidenceType
  title: string
  description: string
  ownerType: 'user' | 'startup' | 'organization' | 'program' | 'outcome'
  ownerId: EntityId | string
  url: string
  contentHash: string
  verificationStatus: VerificationStatus
  submittedBy: EntityId
  verifiedBy?: EntityId
  createdAt: string
}

export type AttributionMode = 'direct' | 'shared' | 'influenced' | 'ambient'
export type OutcomeType = 'team_formed' | 'mvp_completed' | 'mentor_session_completed' | 'pilot_introduction' | 'internship' | 'investment_meeting' | 'award_submission' | 'demo_day_completion'

export interface OutcomeRecord {
  id: EntityId
  programId: EntityId
  startupSlug?: string
  type: OutcomeType
  attributionMode: AttributionMode
  primaryPartnerId?: EntityId
  supportingPartnerIds: EntityId[]
  confidenceScore: number
  evidenceIds: EntityId[]
  verificationStatus: VerificationStatus
  achievedAt: string
  createdAt: string
}

export interface ConsentRecord {
  id: EntityId
  userId: EntityId
  purpose: 'profile_visibility' | 'partner_sharing' | 'messaging' | 'analytics' | 'evidence_visibility'
  policyVersion: string
  grantedAt: string
  withdrawnAt?: string
}

export interface AuditLog {
  id: EntityId
  actorId: EntityId
  organizationId?: EntityId
  action: string
  targetType: string
  targetId: EntityId
  summary: string
  createdAt: string
}

export interface DemoState {
  version: 3
  users: User[]
  passwords: Record<EntityId, string>
  posts: Post[]
  communities: Community[]
  jobs: Job[]
  startups: StartupRecord[]
  mentors: MentorRecord[]
  conversations: Conversation[]
  messages: Message[]
  connections: EntityId[][]
  organizations: Organization[]
  orgMemberships: OrgMembership[]
  agreements: PartnershipAgreement[]
  agreementParties: AgreementParty[]
  programs: Program[]
  programPartners: ProgramPartner[]
  cohorts: Cohort[]
  cohortParticipants: CohortParticipant[]
  contributions: PartnerContribution[]
  evidenceArtifacts: EvidenceArtifact[]
  outcomes: OutcomeRecord[]
  consents: ConsentRecord[]
  auditLogs: AuditLog[]
  nextIds: Record<
    | 'user'
    | 'post'
    | 'comment'
    | 'job'
    | 'conversation'
    | 'message'
    | 'organization'
    | 'membership'
    | 'agreement'
    | 'agreementParty'
    | 'program'
    | 'programPartner'
    | 'cohort'
    | 'participant'
    | 'contribution'
    | 'evidence'
    | 'outcome'
    | 'consent'
    | 'audit',
    number
  >
}

export interface Snapshot extends DemoState {
  currentUser: User | null
}

export interface Credentials { username: string; password: string }
export type Registration = Credentials & Partial<Omit<User, 'id' | 'username' | 'role'>>
export type AssistantServiceResponse = import('@/features/assistant/types').AssistantResponse & {
  queryId?: string
  engine: 'deterministic' | 'hybrid'
  degradedReason?: string
}
export interface AssistantFeedback {
  queryId: string
  resultType: import('@/features/assistant/types').AssistantEntityType
  resultId: string
  action: 'viewed' | 'saved' | 'connected' | 'messaged' | 'applied' | 'requested_intro' | 'helpful' | 'not_helpful'
  value?: -1 | 0 | 1
  reason?: string
}
export interface StartupCreateInput {
  slug: string
  name: string
  sector: string
  stage: 'Idea' | 'Validating' | 'MVP' | 'Pilot' | 'Revenue' | 'Seed'
  readinessScore: number
  summary: string
  fullDescription: string
  founded: string
  location: string
  verificationStatus: VerificationStatus
  status: 'draft' | 'active' | 'paused' | 'archived'
}

export interface ApiClient {
  snapshot(): Promise<Snapshot>
  login(credentials: Credentials): Promise<User>
  register(input: Registration): Promise<User>
  logout(): Promise<void>
  createPost(content: string, opts?: { kind?: PostKind; tags?: string[]; link?: PostLink }): Promise<void>
  togglePost(id: EntityId, action: 'liked' | 'saved'): Promise<void>
  repost(id: EntityId): Promise<void>
  comment(id: EntityId): Promise<void>
  addComment(postId: EntityId, text: string): Promise<void>
  deletePost(id: EntityId): Promise<void>
  updateProfile(input: Partial<User>): Promise<User>
  connect(userId: EntityId): Promise<void>
  toggleCommunity(id: EntityId): Promise<void>
  deleteCommunity(id: EntityId): Promise<void>
  sendMessage(conversationId: EntityId, text: string): Promise<void>
  ensureConversation(userId: EntityId): Promise<EntityId>
  toggleJob(id: EntityId, action: 'applied' | 'saved'): Promise<void>
  createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>): Promise<void>
  createOrganization(input: Omit<Organization, 'id' | 'createdAt'>): Promise<EntityId>
  updateOrganization(id: EntityId, input: Partial<Organization>): Promise<void>
  verifyOrganization(id: EntityId, status: VerificationStatus): Promise<void>
  createAgreement(input: Omit<PartnershipAgreement, 'id' | 'createdAt' | 'createdBy'>, partyOrganizationIds: EntityId[]): Promise<EntityId>
  transitionAgreement(id: EntityId, status: AgreementStatus): Promise<void>
  createProgram(input: Omit<Program, 'id' | 'createdAt'>): Promise<EntityId>
  addProgramPartner(input: Omit<ProgramPartner, 'id'>): Promise<EntityId>
  recordContribution(input: Omit<PartnerContribution, 'id' | 'createdAt' | 'verificationStatus'>): Promise<EntityId>
  verifyContribution(id: EntityId, status: VerificationStatus): Promise<void>
  recordOutcome(input: Omit<OutcomeRecord, 'id' | 'createdAt' | 'verificationStatus'>): Promise<EntityId>
  createStartup(input: StartupCreateInput): Promise<EntityId>
  assistantQuery(prompt: string, limit?: number): Promise<AssistantServiceResponse>
  assistantFeedback(input: AssistantFeedback): Promise<void>
  investorDiscovery(prompt: string, limit?: number): Promise<AssistantServiceResponse>
}
