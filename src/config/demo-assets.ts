import type { EntityId } from '@/data/types'

export interface DemoProfileAsset {
  name: string
  role: string
  organization: string
  image?: string
  alt: string
}

export function localAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

/**
 * One portrait is assigned to one seeded identity only. Unmapped identities use
 * the initials fallback so the demo never implies that one person has several roles.
 */
export const demoAvatarPathByUserId: Partial<Record<EntityId, string>> = {
  usr_1: 'images/founders/aysel-mammadova.webp',
  usr_2: 'images/founders/reshad-quliyev.webp',
  usr_3: 'images/founders/leyla-aliyeva.webp',
  usr_4: 'images/avatars/kamran-vali.webp',
  usr_5: 'images/avatars/tarlan-yusifzade.webp',
  usr_6: 'images/avatars/nargiz-rahim.webp',
  usr_7: 'images/avatars/elvin-safar.webp',
}

export const demoProfiles: DemoProfileAsset[] = [
  { name: 'Aylin Mammadova', role: 'Program operator', organization: 'SSC demo workspace', image: 'images/founders/aysel-mammadova.webp', alt: 'Demo profile portrait for Aylin Mammadova' },
  { name: 'Reshad Guliyev', role: 'Climate founder', organization: 'Sample startup', image: 'images/founders/reshad-quliyev.webp', alt: 'Demo profile portrait for Reshad Guliyev' },
  { name: 'Leyla Aliyeva', role: 'Student builder', organization: 'Sample university ecosystem', image: 'images/founders/leyla-aliyeva.webp', alt: 'Demo profile portrait for Leyla Aliyeva' },
  { name: 'Kamran Vali', role: 'Technical teammate', organization: 'Sample startup', image: 'images/avatars/kamran-vali.webp', alt: 'Demo profile portrait for Kamran Vali' },
  { name: 'Tarlan Yusifzade', role: 'Product mentor', organization: 'SSC demo mentor pool', image: 'images/avatars/tarlan-yusifzade.webp', alt: 'Demo profile portrait for Tarlan Yusifzade' },
  { name: 'Nargiz Rahim', role: 'Health founder', organization: 'Sample startup', image: 'images/avatars/nargiz-rahim.webp', alt: 'Demo profile portrait for Nargiz Rahim' },
  { name: 'Elvin Safar', role: 'Education founder', organization: 'Sample startup', image: 'images/avatars/elvin-safar.webp', alt: 'Demo profile portrait for Elvin Safar' },
]

export function demoAvatarUrl(userId?: EntityId, directPath?: string) {
  const path = directPath || (userId ? demoAvatarPathByUserId[userId] : undefined)
  return path ? localAsset(path) : undefined
}
