export type FounderStage = 'idea' | 'validation' | 'mvp' | 'revenue'

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
  lookingFor: string
  /** Optional real traction signal (users, MRR, raised) — empty string hides it. */
  traction?: string
}
