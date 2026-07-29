import type { PlatformRole } from '@/data/types'
import type { PersonaId } from './types'

export type WorkspaceKind = 'student' | 'startup' | 'mentor' | 'investor' | 'institution' | 'platform'

export function workspaceKindFor(role: PlatformRole | undefined, persona?: PersonaId): WorkspaceKind {
  if (persona === 'member') return 'startup'
  if (role === 'founder') return 'startup'
  if (role === 'mentor') return 'mentor'
  if (role === 'investor') return 'investor'
  if (role === 'partner_admin' || role === 'program_manager') return 'institution'
  if (role === 'platform_admin' || role === 'moderator') return 'platform'
  return 'student'
}
