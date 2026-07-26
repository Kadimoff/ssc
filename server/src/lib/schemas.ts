import { z } from 'zod'

export const id = z.string().min(3).max(96)
export const verificationStatus = z.enum(['unverified', 'pending', 'verified', 'rejected', 'suspended'])
export const organization = z.object({
  type: z.enum(['university', 'student_community', 'company', 'accelerator', 'sponsor', 'investor_network', 'ngo', 'public_body']),
  legalName: z.string().min(2).max(200), displayName: z.string().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), summary: z.string().max(2000),
  countryCode: z.string().length(2), websiteUrl: z.string().max(500),
  verificationStatus: verificationStatus.default('pending'),
  partnershipStatus: z.enum(['prospect', 'onboarding', 'active', 'paused', 'ended']).default('prospect'),
  contributionAreas: z.array(z.string().max(100)).max(30), contacts: z.array(z.object({
    id: id, name: z.string().min(2), title: z.string(), email: z.string().email(), primary: z.boolean(),
  })).max(20),
})
export const agreementStatus = z.enum(['draft', 'pending_signature', 'active', 'expired', 'terminated'])
export const agreement = z.object({
  type: z.enum(['mou', 'sponsorship', 'challenge', 'mentor_network', 'data_sharing', 'pilot']),
  title: z.string().min(3).max(200), status: agreementStatus.default('draft'),
  startsAt: z.string(), endsAt: z.string(), reviewAt: z.string(),
  intendedOutcomes: z.array(z.string()).max(50), resourceCommitments: z.array(z.string()).max(50),
  dataTerms: z.string().max(5000), brandingTerms: z.string().max(5000), programScope: z.string().max(5000),
  documentName: z.string().max(255), documentUrl: z.string().max(1000),
  partyOrganizationIds: z.array(id).min(2).max(20),
})
export const program = z.object({
  name: z.string().min(3).max(200),
  type: z.enum(['accelerator', 'challenge', 'sprint', 'demo_day', 'mentor_series', 'incubator_prep']),
  status: z.enum(['draft', 'open', 'active', 'completed', 'archived']).default('draft'),
  hostOrganizationId: id, description: z.string().max(5000), startsAt: z.string(), endsAt: z.string(),
  eligibilityRules: z.array(z.string()).max(50), milestoneLabels: z.array(z.string()).max(50),
  outcomesFramework: z.array(z.string()).max(50),
})
export const programPartner = z.object({
  programId: id, organizationId: id,
  role: z.enum(['host', 'delivery', 'mentor', 'challenge_owner', 'sponsor', 'judge', 'investor_access', 'community']),
  commitmentSummary: z.string().max(3000),
})
export const contribution = z.object({
  programId: id, organizationId: id,
  type: z.enum(['mentors', 'students', 'challenge', 'funding', 'credits', 'space', 'judging', 'pilot_access', 'marketing']),
  quantity: z.number().nonnegative(), unit: z.string().min(1).max(80), description: z.string().max(3000),
  evidenceIds: z.array(id).max(100),
})
export const outcome = z.object({
  programId: id, startupSlug: z.string().optional(),
  type: z.enum(['team_formed', 'mvp_completed', 'mentor_session_completed', 'pilot_introduction', 'internship', 'investment_meeting', 'award_submission', 'demo_day_completion']),
  attributionMode: z.enum(['direct', 'shared', 'influenced', 'ambient']),
  primaryPartnerId: id.optional(), supportingPartnerIds: z.array(id).max(20),
  confidenceScore: z.number().min(0).max(1), evidenceIds: z.array(id).min(1).max(100), achievedAt: z.string(),
})

export const startup = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(160),
  sector: z.string().min(2).max(100),
  stage: z.enum(['Idea', 'Validating', 'MVP', 'Pilot', 'Revenue', 'Seed']),
  readinessScore: z.number().int().min(0).max(100).default(0),
  summary: z.string().max(1000),
  fullDescription: z.string().max(5000),
  founded: z.string().max(20),
  location: z.string().max(160),
  verificationStatus: verificationStatus.default('pending'),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('active'),
})

export const startupMember = z.object({
  userId: id,
  title: z.string().min(2).max(160),
  status: z.enum(['invited', 'active', 'inactive']).default('active'),
})

export const startupRole = z.object({
  title: z.string().min(2).max(160),
  department: z.string().max(100),
  type: z.string().min(2).max(100),
  skills: z.array(z.string().min(1).max(80)).max(30),
  location: z.string().max(160),
  status: z.enum(['open', 'paused', 'filled', 'closed']).default('open'),
})

export const startupMilestone = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(3000),
  dateLabel: z.string().max(100),
  status: z.enum(['done', 'current', 'future']),
  evidenceIds: z.array(id).max(100),
})

export const mentorProfile = z.object({
  expertise: z.array(z.string().min(1).max(80)).min(1).max(30),
  company: z.string().max(160),
  rating: z.number().min(0).max(5).default(0),
  sessions: z.number().int().nonnegative().default(0),
  availability: z.string().max(200),
  focusStage: z.string().max(120),
  bio: z.string().max(3000),
  status: z.enum(['active', 'pending', 'suspended']).default('pending'),
})

export const assistantIntent = z.enum([
  'find_teammate', 'find_mentor', 'find_job', 'find_startup', 'find_program',
  'find_partner', 'investor_discovery', 'platform_guidance',
])

export const assistantCriteria = z.object({
  skills: z.array(z.string().max(80)).max(20).default([]),
  sectors: z.array(z.string().max(80)).max(20).default([]),
  stages: z.array(z.string().max(80)).max(20).default([]),
  location: z.string().max(120).optional(),
  minReadiness: z.number().int().min(0).max(100).optional(),
  completeTeam: z.boolean().default(false),
  keywords: z.array(z.string().max(80)).max(40).default([]),
})

export const assistantQuery = z.object({
  prompt: z.string().min(3).max(2000),
  limit: z.number().int().min(1).max(20).default(10),
})

export const matchingFeedbackInput = z.object({
  queryId: id,
  resultType: z.enum(['person', 'mentor', 'job', 'startup', 'program', 'organization', 'guide']),
  resultId: id,
  action: z.enum(['viewed', 'saved', 'connected', 'messaged', 'applied', 'requested_intro', 'helpful', 'not_helpful']),
  value: z.number().int().min(-1).max(1).default(0),
  reason: z.string().max(500).default(''),
})
