import type { Job, Organization, Program, Snapshot, User } from '@/data/types'
import type { MentorData, StartupData } from '@/data/platform-content'

export type AssistantIntent =
  | 'find_teammate'
  | 'find_mentor'
  | 'find_job'
  | 'find_startup'
  | 'find_program'
  | 'find_partner'
  | 'investor_discovery'
  | 'platform_guidance'

export type AssistantEntityType = 'person' | 'mentor' | 'job' | 'startup' | 'program' | 'organization' | 'guide'
export type MatchConfidence = 'low' | 'medium' | 'high'

export interface AssistantCriteria {
  skills: string[]
  sectors: string[]
  stages: string[]
  location?: string
  minReadiness?: number
  completeTeam: boolean
  keywords: string[]
}

export interface MatchExplanation {
  totalScore: number
  confidence: MatchConfidence
  matchedSignals: string[]
  missingSignals: string[]
  scoreBreakdown: Record<string, number>
}

export interface AssistantResult {
  entityType: AssistantEntityType
  entityId: string
  title: string
  subtitle: string
  description: string
  href: string
  tags: string[]
  explanation: MatchExplanation
}

export interface AssistantResponse {
  intent: AssistantIntent
  criteria: AssistantCriteria
  summary: string
  results: AssistantResult[]
}

export interface AssistantContext {
  currentUser?: User | null
  users: User[]
  jobs: Job[]
  startups: StartupData[]
  mentors: MentorData[]
  programs: Program[]
  organizations: Organization[]
  includeOrganizations: boolean
}

export function assistantContextFromSnapshot(
  snapshot: Snapshot,
  startups: StartupData[],
  mentors: MentorData[],
  includeOrganizations: boolean,
): AssistantContext {
  return {
    currentUser: snapshot.currentUser,
    users: snapshot.users,
    jobs: snapshot.jobs,
    startups,
    mentors,
    programs: snapshot.programs,
    organizations: snapshot.organizations,
    includeOrganizations,
  }
}
