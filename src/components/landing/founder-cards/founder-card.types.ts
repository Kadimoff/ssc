export type FounderStage = 'idea' | 'validation' | 'mvp' | 'revenue'
export type FounderMetricIcon =
  | 'pilot'
  | 'campus'
  | 'impact'
  | 'users'
  | 'activity'
  | 'rating'
  | 'revenue'
  | 'providers'
  | 'growth'
export type FounderNeedIcon = 'code' | 'design' | 'funding'

export interface FounderMetricData {
  value: string
  label: string
  icon: FounderMetricIcon
}

export interface FounderNeed {
  eyebrow: string
  title: string
  icon: FounderNeedIcon
}

/** A realistic founder profile — no membership tiers, trust scores, or ID cards.
 *  Shows who they are, what they're building, how far along it is, and what they need. */
export interface FounderProfile {
  id: string
  name: string
  role: string
  startup: string
  university: string
  program: string
  building: string
  stage: FounderStage
  skills: string[]
  metrics: FounderMetricData[]
  lookingFor: FounderNeed
  tractionBadge: string
  portrait: {
    src: string
    alt: string
    position?: string
  }
  accent: 'emerald' | 'blue' | 'gold'
  founderStory: string
  mission: string
  currentFocus: string
  progress: string
  profileHref: string
}
