import type { PlatformRole, User } from '@/data/types'

export type AccessArea = 'investor' | 'partnerships' | 'admin'

const areaRoles: Record<AccessArea, PlatformRole[]> = {
  investor: ['investor', 'platform_admin'],
  partnerships: ['partner_admin', 'program_manager', 'platform_admin'],
  admin: ['moderator', 'platform_admin'],
}

export function canAccess(user: User | null | undefined, area: AccessArea) {
  return Boolean(user?.roles.some((role) => areaRoles[area].includes(role)))
}

export function defaultRouteFor(user: User) {
  if (canAccess(user, 'investor') && user.activeRole === 'investor') return '/investors' as const
  if (canAccess(user, 'partnerships') && ['partner_admin', 'program_manager'].includes(user.activeRole)) return '/partnerships' as const
  if (canAccess(user, 'admin') && ['moderator', 'platform_admin'].includes(user.activeRole)) return '/admin' as const
  return '/feed' as const
}
