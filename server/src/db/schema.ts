import {
  boolean, index, integer, jsonb, pgTable, primaryKey, real, text, timestamp, uniqueIndex,
} from 'drizzle-orm/pg-core'

const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  title: text('title').notNull().default('Community member'),
  company: text('company').notNull().default(''),
  industry: text('industry').notNull().default(''),
  location: text('location').notNull().default(''),
  skills: text('skills').notNull().default(''),
  about: text('about').notNull().default(''),
  availability: text('availability').notNull().default('Open to collaborate'),
  website: text('website').notNull().default(''),
  role: text('role').notNull().default('member'),
  roles: jsonb('roles').$type<string[]>().notNull().default(['student']),
  activeRole: text('active_role').notNull().default('student'),
  verificationStatus: text('verification_status').notNull().default('unverified'),
  createdAt,
}, (table) => [
  uniqueIndex('users_username_unique').on(table.username),
  uniqueIndex('users_email_unique').on(table.email),
])

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: text('type').notNull().default('Update'),
  kind: text('kind').notNull().default('update'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  link: jsonb('link').$type<{ title: string; subtitle: string; url: string } | null>(),
  reactions: integer('reactions').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  reposts: integer('reposts').notNull().default(0),
  createdAt,
}, (table) => [index('posts_created_idx').on(table.createdAt)])

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  createdAt,
})

export const postActions = pgTable('post_actions', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.postId, table.kind] })])

export const communities = pgTable('communities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  members: integer('members').notNull().default(0),
  activity: text('activity').notNull().default(''),
  createdAt,
})

export const communityMemberships = pgTable('community_memberships', {
  communityId: text('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.communityId, table.userId] })])

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(),
  skills: text('skills').notNull(),
  description: text('description').notNull(),
  featured: boolean('featured').notNull().default(false),
  createdAt,
})

export const jobActions = pgTable('job_actions', {
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
}, (table) => [primaryKey({ columns: [table.jobId, table.userId, table.kind] })])

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  createdAt,
})

export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.conversationId, table.userId] })])

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  createdAt,
})

export const connections = pgTable('connections', {
  userAId: text('user_a_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userBId: text('user_b_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt,
}, (table) => [primaryKey({ columns: [table.userAId, table.userBId] })])

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  legalName: text('legal_name').notNull(),
  displayName: text('display_name').notNull(),
  slug: text('slug').notNull(),
  summary: text('summary').notNull().default(''),
  countryCode: text('country_code').notNull(),
  websiteUrl: text('website_url').notNull().default(''),
  verificationStatus: text('verification_status').notNull().default('pending'),
  partnershipStatus: text('partnership_status').notNull().default('prospect'),
  contributionAreas: jsonb('contribution_areas').$type<string[]>().notNull().default([]),
  contacts: jsonb('contacts').$type<Array<{ id: string; name: string; title: string; email: string; primary: boolean }>>().notNull().default([]),
  createdAt,
}, (table) => [uniqueIndex('organizations_slug_unique').on(table.slug)])

export const organizationMemberships = pgTable('organization_memberships', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  roles: jsonb('roles').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('invited'),
  createdAt,
}, (table) => [uniqueIndex('memberships_org_user_unique').on(table.organizationId, table.userId)])

export const agreements = pgTable('agreements', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'),
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at').notNull(),
  reviewAt: text('review_at').notNull(),
  intendedOutcomes: jsonb('intended_outcomes').$type<string[]>().notNull().default([]),
  resourceCommitments: jsonb('resource_commitments').$type<string[]>().notNull().default([]),
  dataTerms: text('data_terms').notNull().default(''),
  brandingTerms: text('branding_terms').notNull().default(''),
  programScope: text('program_scope').notNull().default(''),
  documentName: text('document_name').notNull().default(''),
  documentUrl: text('document_url').notNull().default(''),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt,
})

export const agreementParties = pgTable('agreement_parties', {
  id: text('id').primaryKey(),
  agreementId: text('agreement_id').notNull().references(() => agreements.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  role: text('role').notNull(),
  responsibilitySummary: text('responsibility_summary').notNull().default(''),
}, (table) => [uniqueIndex('agreement_party_unique').on(table.agreementId, table.organizationId)])

export const programs = pgTable('programs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('draft'),
  hostOrganizationId: text('host_organization_id').notNull().references(() => organizations.id),
  description: text('description').notNull().default(''),
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at').notNull(),
  eligibilityRules: jsonb('eligibility_rules').$type<string[]>().notNull().default([]),
  milestoneLabels: jsonb('milestone_labels').$type<string[]>().notNull().default([]),
  outcomesFramework: jsonb('outcomes_framework').$type<string[]>().notNull().default([]),
  createdAt,
})

export const programPartners = pgTable('program_partners', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  role: text('role').notNull(),
  commitmentSummary: text('commitment_summary').notNull().default(''),
}, (table) => [uniqueIndex('program_partner_unique').on(table.programId, table.organizationId, table.role)])

export const cohorts = pgTable('cohorts', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at').notNull(),
  capacity: integer('capacity').notNull().default(0),
})

export const cohortParticipants = pgTable('cohort_participants', {
  id: text('id').primaryKey(),
  cohortId: text('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  startupSlug: text('startup_slug'),
  status: text('status').notNull().default('invited'),
  joinedAt: text('joined_at').notNull(),
})

export const evidenceArtifacts = pgTable('evidence_artifacts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  ownerType: text('owner_type').notNull(),
  ownerId: text('owner_id').notNull(),
  url: text('url').notNull().default(''),
  contentHash: text('content_hash').notNull().default(''),
  verificationStatus: text('verification_status').notNull().default('pending'),
  submittedBy: text('submitted_by').notNull().references(() => users.id),
  verifiedBy: text('verified_by').references(() => users.id),
  createdAt,
}, (table) => [index('evidence_owner_idx').on(table.ownerType, table.ownerId)])

export const contributions = pgTable('contributions', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull().references(() => programs.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  description: text('description').notNull().default(''),
  evidenceIds: jsonb('evidence_ids').$type<string[]>().notNull().default([]),
  verificationStatus: text('verification_status').notNull().default('pending'),
  verifiedBy: text('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt,
})

export const outcomes = pgTable('outcomes', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull().references(() => programs.id),
  startupSlug: text('startup_slug'),
  type: text('type').notNull(),
  attributionMode: text('attribution_mode').notNull(),
  primaryPartnerId: text('primary_partner_id').references(() => organizations.id),
  supportingPartnerIds: jsonb('supporting_partner_ids').$type<string[]>().notNull().default([]),
  confidenceScore: real('confidence_score').notNull(),
  evidenceIds: jsonb('evidence_ids').$type<string[]>().notNull().default([]),
  verificationStatus: text('verification_status').notNull().default('pending'),
  achievedAt: text('achieved_at').notNull(),
  createdAt,
})

export const startups = pgTable('startups', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  stage: text('stage').notNull(),
  readinessScore: integer('readiness_score').notNull().default(0),
  summary: text('summary').notNull().default(''),
  fullDescription: text('full_description').notNull().default(''),
  founded: text('founded').notNull().default(''),
  location: text('location').notNull().default(''),
  verificationStatus: text('verification_status').notNull().default('pending'),
  status: text('status').notNull().default('active'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt,
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('startups_slug_unique').on(table.slug),
  index('startups_sector_stage_idx').on(table.sector, table.stage),
])

export const startupMembers = pgTable('startup_members', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: text('status').notNull().default('active'),
  createdAt,
}, (table) => [uniqueIndex('startup_member_unique').on(table.startupId, table.userId)])

export const startupRoles = pgTable('startup_roles', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  department: text('department').notNull().default(''),
  type: text('type').notNull().default('Project'),
  skills: jsonb('skills').$type<string[]>().notNull().default([]),
  location: text('location').notNull().default('Remote'),
  status: text('status').notNull().default('open'),
  createdAt,
}, (table) => [index('startup_roles_startup_status_idx').on(table.startupId, table.status)])

export const startupMilestones = pgTable('startup_milestones', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  dateLabel: text('date_label').notNull().default(''),
  status: text('status').notNull().default('future'),
  evidenceIds: jsonb('evidence_ids').$type<string[]>().notNull().default([]),
  createdAt,
}, (table) => [index('startup_milestones_startup_status_idx').on(table.startupId, table.status)])

export const mentorProfiles = pgTable('mentor_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expertise: jsonb('expertise').$type<string[]>().notNull().default([]),
  company: text('company').notNull().default(''),
  rating: real('rating').notNull().default(0),
  sessions: integer('sessions').notNull().default(0),
  availability: text('availability').notNull().default(''),
  focusStage: text('focus_stage').notNull().default(''),
  bio: text('bio').notNull().default(''),
  status: text('status').notNull().default('pending'),
  createdAt,
}, (table) => [uniqueIndex('mentor_profiles_user_unique').on(table.userId)])

export const assistantQueries = pgTable('assistant_queries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  intent: text('intent').notNull(),
  criteria: jsonb('criteria').$type<Record<string, unknown>>().notNull().default({}),
  resultIds: jsonb('result_ids').$type<string[]>().notNull().default([]),
  engine: text('engine').notNull(),
  status: text('status').notNull(),
  latencyMs: integer('latency_ms').notNull().default(0),
  promptFingerprint: text('prompt_fingerprint').notNull(),
  createdAt,
}, (table) => [
  index('assistant_queries_user_created_idx').on(table.userId, table.createdAt),
  index('assistant_queries_fingerprint_idx').on(table.promptFingerprint),
])

export const matchingFeedback = pgTable('matching_feedback', {
  id: text('id').primaryKey(),
  queryId: text('query_id').notNull().references(() => assistantQueries.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resultType: text('result_type').notNull(),
  resultId: text('result_id').notNull(),
  action: text('action').notNull(),
  value: integer('value').notNull().default(0),
  reason: text('reason').notNull().default(''),
  createdAt,
}, (table) => [
  index('matching_feedback_query_idx').on(table.queryId),
  uniqueIndex('matching_feedback_user_result_unique').on(table.queryId, table.userId, table.resultType, table.resultId, table.action),
])

export const consents = pgTable('consents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  purpose: text('purpose').notNull(),
  policyVersion: text('policy_version').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
})

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull().references(() => users.id),
  organizationId: text('organization_id').references(() => organizations.id),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  summary: text('summary').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt,
}, (table) => [index('audit_target_idx').on(table.targetType, table.targetId), index('audit_created_idx').on(table.createdAt)])

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: text('key').primaryKey(),
  actorId: text('actor_id').notNull(),
  response: jsonb('response').notNull(),
  createdAt,
})

export const integrationConnections = pgTable('integration_connections', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  provider: text('provider').notNull(),
  name: text('name').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  signingSecret: text('signing_secret').notNull(),
  eventTypes: jsonb('event_types').$type<string[]>().notNull().default([]),
  enabled: boolean('enabled').notNull().default(true),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt,
})

export const integrationDeliveries = pgTable('integration_deliveries', {
  id: text('id').primaryKey(),
  integrationId: text('integration_id').notNull().references(() => integrationConnections.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  status: text('status').notNull(),
  responseCode: integer('response_code'),
  error: text('error').notNull().default(''),
  createdAt,
}, (table) => [index('integration_delivery_idx').on(table.integrationId, table.createdAt)])
