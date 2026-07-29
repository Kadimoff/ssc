import type { EntityId, PlatformRole } from '@/data/types'

export type PersonaId =
  | 'student'
  | 'founder'
  | 'member'
  | 'mentor'
  | 'investor'
  | 'program_admin'
  | 'partner'
  | 'platform_admin'

export interface PersonaPreset {
  id: PersonaId
  label: string
  description: string
  userId: EntityId
  role: PlatformRole
}

export type WorkflowStatus = 'draft' | 'pending' | 'needs_changes' | 'approved' | 'rejected' | 'complete'

export interface StartupMembership {
  id: EntityId
  startupSlug: string
  userId: EntityId
  name: string
  title: string
  kind: 'founder' | 'member' | 'advisor'
}

export interface OpenRole {
  id: EntityId
  startupSlug: string
  title: string
  department: string
  commitment: string
  skills: string[]
  status: 'open' | 'paused' | 'filled'
}

export interface DetailedMilestone {
  id: EntityId
  startupSlug: string
  title: string
  description: string
  ownerId: EntityId
  dueAt: string
  evidenceDefinition: string
  progress: number
  status: 'planned' | 'in_progress' | 'blocked' | 'complete'
}

export interface ExecutionEvidence {
  id: EntityId
  startupSlug: string
  milestoneId?: EntityId
  title: string
  kind: 'document' | 'metric' | 'interview' | 'prototype' | 'pilot'
  file?: { name: string; size: number; type: string }
  note: string
  status: 'draft' | 'pending' | 'verified' | 'rejected' | 'needs_changes'
  reviewerNote?: string
  submittedAt: string
}

export interface VerificationRequest {
  id: EntityId
  userId: EntityId
  institution: string
  studentId: string
  document?: { name: string; size: number; type: string }
  status: 'draft' | 'pending' | 'verified' | 'rejected' | 'needs_changes'
  reviewerNote?: string
  submittedAt?: string
}

export interface MentorActionItem {
  id: EntityId
  text: string
  milestoneId?: EntityId
  complete: boolean
}

export interface MentorSession {
  id: EntityId
  mentorId: EntityId
  mentorName: string
  founderId: EntityId
  startupSlug: string
  topic: string
  goal: string
  scheduledAt: string
  durationMinutes: number
  format: 'video' | 'in_person'
  status: 'scheduled' | 'complete' | 'cancelled'
  rating?: number
  feedback?: string
  followUpAt?: string
  actionItems: MentorActionItem[]
}

export interface ProgramApplication {
  id: EntityId
  programId: EntityId
  programName: string
  startupSlug: string
  applicantId: EntityId
  answer: string
  status: WorkflowStatus
  reviewerNote?: string
  submittedAt: string
}

export interface ExecutionNotification {
  id: EntityId
  userId: EntityId | 'all'
  title: string
  body: string
  href: string
  kind: 'milestone' | 'evidence' | 'session' | 'application' | 'verification' | 'intro'
  createdAt: string
  read: boolean
}

export interface IntroRequest {
  id: EntityId
  investorId: EntityId
  startupSlug: string
  reason: string
  status: 'requested' | 'accepted' | 'declined' | 'connected'
  createdAt: string
}

export interface ExecutionDemoState {
  version: 2
  selectedPersona: PersonaId
  memberships: StartupMembership[]
  openRoles: OpenRole[]
  milestones: DetailedMilestone[]
  evidence: ExecutionEvidence[]
  verificationRequests: VerificationRequest[]
  mentorSessions: MentorSession[]
  programApplications: ProgramApplication[]
  notifications: ExecutionNotification[]
  watchlist: string[]
  comparison: string[]
  investorPipeline: Record<string, string>
  investorNotes: Record<string, string>
  introRequests: IntroRequest[]
  startupDrafts: Array<{ name: string; sector: string; problem: string; stage: string; createdAt: string }>
  migration: { completedAt: string; recoveredCorruptData: boolean }
}
