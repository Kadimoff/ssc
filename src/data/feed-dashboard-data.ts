import type { EntityId, Post, User } from '@/data/types'

export type DashboardEvent = {
  id: string
  title: string
  dateLabel: string
  dayLabel: string
  timeLabel: string
  host: string
  format: 'Online' | 'In person'
}

export type DashboardNextStep = {
  id: string
  title: string
  description: string
  completed: boolean
}

export type DashboardMetric = {
  value: string
  label: string
}

export type FeedMediaAsset = {
  src: string
  alt: string
  fit?: 'cover' | 'contain'
}

const avatarByUserId: Partial<Record<EntityId, string>> = {
  usr_1: 'images/founders/aysel-mammadova.webp',
  usr_2: 'images/founders/reshad-quliyev.webp',
  usr_3: 'images/founders/leyla-aliyeva.webp',
  usr_4: 'images/avatars/kamran-vali.webp',
  usr_5: 'images/avatars/tarlan-yusifzade.webp',
  usr_6: 'images/avatars/nargiz-rahim.webp',
  usr_7: 'images/avatars/elvin-safar.webp',
  usr_8: 'images/founders/leyla-aliyeva.webp',
  usr_9: 'images/founders/aysel-mammadova.webp',
  usr_10: 'images/avatars/kamran-vali.webp',
  usr_11: 'images/avatars/nargiz-rahim.webp',
  usr_12: 'images/founders/leyla-aliyeva.webp',
  usr_13: 'images/avatars/elvin-safar.webp',
  usr_14: 'images/founders/reshad-quliyev.webp',
  usr_15: 'images/avatars/kamran-vali.webp',
  usr_16: 'images/avatars/tarlan-yusifzade.webp',
}

const mediaByPostId: Partial<Record<EntityId, FeedMediaAsset[]>> = {
  pst_1: [{
    src: 'images/feed/greenstack-dashboard.webp',
    alt: 'GreenStack campus energy analytics dashboard showing usage and savings metrics',
    fit: 'contain',
  }],
  pst_4: [{
    src: 'images/feed/eduflow-product.webp',
    alt: 'EduFlow adaptive learning product dashboard with progress and mastery views',
    fit: 'contain',
  }],
  pst_12: [{
    src: 'images/feed/ssc-founder-workshop.webp',
    alt: 'SSC student founders collaborating around a laptop during a product workshop',
    fit: 'cover',
  }],
}

export const dashboardEvents: DashboardEvent[] = [
  {
    id: 'feed-event-1',
    title: 'Founder Office Hours',
    dateLabel: '30 Jul',
    dayLabel: 'Thu',
    timeLabel: '18:00–19:00',
    host: 'Tarlan Yusifzade',
    format: 'Online',
  },
  {
    id: 'feed-event-2',
    title: 'Demo Day Prep Workshop',
    dateLabel: '01 Aug',
    dayLabel: 'Sat',
    timeLabel: '11:00–13:00',
    host: 'SSC Programs',
    format: 'In person',
  },
  {
    id: 'feed-event-3',
    title: 'Mentor Match Session',
    dateLabel: '04 Aug',
    dayLabel: 'Tue',
    timeLabel: '17:30–18:30',
    host: 'SSC Mentorship',
    format: 'Online',
  },
  {
    id: 'feed-event-4',
    title: 'Climate Tech Meetup',
    dateLabel: '07 Aug',
    dayLabel: 'Fri',
    timeLabel: '19:00–21:00',
    host: 'GreenStack',
    format: 'In person',
  },
]

export const dashboardNextSteps: DashboardNextStep[] = [
  {
    id: 'profile',
    title: 'Complete your startup profile',
    description: 'Make your traction and current ask visible.',
    completed: true,
  },
  {
    id: 'mentor',
    title: 'Book your first mentor session',
    description: 'Choose an operator for a focused 30-minute review.',
    completed: false,
  },
  {
    id: 'milestone',
    title: 'Publish your first milestone',
    description: 'Share one measurable signal with the ecosystem.',
    completed: true,
  },
  {
    id: 'community',
    title: 'Join a founder community',
    description: 'Meet builders working through the same stage.',
    completed: true,
  },
]

export const dashboardMetrics: DashboardMetric[] = [
  { value: '142', label: 'Active builders' },
  { value: '9', label: 'New startups' },
  { value: '45', label: 'Mentors online' },
]

export function assetUrl(path: string) {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export function avatarForUser(user?: Pick<User, 'id' | 'avatar'> | null) {
  const path = user?.avatar || (user?.id ? avatarByUserId[user.id] : undefined)
  return path ? assetUrl(path) : undefined
}

export function mediaForPost(post: Pick<Post, 'id' | 'media'>): FeedMediaAsset[] {
  const curated = mediaByPostId[post.id]
  if (curated?.length) return curated.map((asset) => ({ ...asset, src: assetUrl(asset.src) }))
  if (post.media?.length) {
    return post.media.map((src, index) => ({
      src: assetUrl(src),
      alt: `Attached visual ${index + 1} for this SSC community update`,
      fit: 'cover',
    }))
  }
  return []
}
