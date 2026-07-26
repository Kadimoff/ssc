import type { User } from '@/data/types'

export function roleQuickPrompts(user: User) {
  if (user.activeRole === 'investor') return ['Find MVP ClimateTech ventures above 80% readiness', 'Show ventures with complete teams', 'Find active fundraising mentors']
  if (user.activeRole === 'mentor') return ['Find founders who need fundraising help', 'Show active startup programs', 'Find teams with open product roles']
  if (['partner_admin', 'program_manager', 'platform_admin'].includes(user.activeRole)) return ['Find a university program partner', 'Show active joint programs', 'Find mentors for an MVP cohort']
  return ['Find a backend teammate for my startup', 'Find a fundraising mentor', 'Show remote roles matching AI skills']
}
