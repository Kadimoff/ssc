import type { EntityId, Post, User } from '@/data/types'
import { demoAvatarUrl, localAsset } from '@/config/demo-assets'

export type DashboardEvent = {
  id: string
  title: string
  dateLabel: string
  dayLabel: string
  timeLabel: string
  host: string
  format: 'Online' | 'In person'
  attendeeCount: number
  attendeeUserIds: EntityId[]
  availabilityLabel: string
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
  detail: string
}

export type SuggestedPerson = {
  userId: EntityId
  matchLabel: string
  reason: string
  mutualConnections: number
}

export type DashboardActivity = {
  eyebrow: string
  headline: string
  detail: string
  userIds: EntityId[]
}

export type FeedMediaAsset = {
  src: string
  alt: string
  fit?: 'cover' | 'contain'
}

export type StartupSummary = {
  name: string
  slug: string
  stage: 'idea' | 'validation' | 'mvp' | 'revenue'
  profileCompletion: number
  activeUsers: string
  lookingFor: string
  nextMilestone: string
}

export type QuickActionIcon = 'publish' | 'milestone' | 'cofounder' | 'mentor'

export type QuickAction = {
  id: string
  label: string
  icon: QuickActionIcon
  href: '#feed-composer' | '/goals' | '/network' | '/mentorship'
}

export type MentorSession = {
  id: string
  title: string
  mentor: string
  dateLabel: string
  duration: string
  location: string
  note?: string
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
    attendeeCount: 28,
    attendeeUserIds: ['usr_5', 'usr_2', 'usr_7'],
    availabilityLabel: '6 slots left',
  },
  {
    id: 'feed-event-2',
    title: 'Demo Day Prep Workshop',
    dateLabel: '01 Aug',
    dayLabel: 'Sat',
    timeLabel: '11:00–13:00',
    host: 'SSC Programs',
    format: 'In person',
    attendeeCount: 46,
    attendeeUserIds: ['usr_1', 'usr_9', 'usr_14'],
    availabilityLabel: 'Registration open',
  },
  {
    id: 'feed-event-3',
    title: 'Mentor Match Session',
    dateLabel: '04 Aug',
    dayLabel: 'Tue',
    timeLabel: '17:30–18:30',
    host: 'SSC Mentorship',
    format: 'Online',
    attendeeCount: 18,
    attendeeUserIds: ['usr_5', 'usr_16', 'usr_6'],
    availabilityLabel: '4 matches open',
  },
  {
    id: 'feed-event-4',
    title: 'Climate Tech Meetup',
    dateLabel: '07 Aug',
    dayLabel: 'Fri',
    timeLabel: '19:00–21:00',
    host: 'GreenStack',
    format: 'In person',
    attendeeCount: 64,
    attendeeUserIds: ['usr_2', 'usr_11', 'usr_14'],
    availabilityLabel: 'Community event',
  },
]

export const dashboardPeopleToMeet: SuggestedPerson[] = [
  {
    userId: 'usr_4',
    matchLabel: 'AI product match',
    reason: 'Your product strategy background complements Kamran’s applied AI delivery experience.',
    mutualConnections: 3,
  },
  {
    userId: 'usr_5',
    matchLabel: 'Mentor match · 94%',
    reason: 'Tarlan’s validation and go-to-market expertise matches your next startup milestone.',
    mutualConnections: 5,
  },
  {
    userId: 'usr_6',
    matchLabel: 'Founder peer',
    reason: 'MediMatch is working through provider growth and a new hiring cycle.',
    mutualConnections: 2,
  },
  {
    userId: 'usr_7',
    matchLabel: 'Collaboration fit',
    reason: 'EduFlow is looking for product feedback after a strong first beta week.',
    mutualConnections: 4,
  },
  {
    userId: 'usr_11',
    matchLabel: 'Impact founder',
    reason: 'Sabina is building an evidence-led pilot in climate-adjacent AgriTech.',
    mutualConnections: 2,
  },
  {
    userId: 'usr_12',
    matchLabel: 'Early-stage founder',
    reason: 'LegalLens is looking for product and technical collaborators before its next validation sprint.',
    mutualConnections: 1,
  },
]

export const dashboardActivity: DashboardActivity = {
  eyebrow: 'Ecosystem pulse',
  headline: '18 builders moved work forward today',
  detail: '12 updates · 4 milestones · 2 launch notes',
  userIds: ['usr_2', 'usr_6', 'usr_7', 'usr_14'],
}

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
  { value: '142', label: 'Active builders', detail: 'Illustrative weekly activity' },
  { value: '9', label: 'Startup updates', detail: 'Published this sample week' },
  { value: '45', label: 'Mentor slots', detail: 'Available across programs' },
]

export const startupSummary: StartupSummary = {
  name: 'GreenStack',
  slug: 'greenstack',
  stage: 'mvp',
  profileCompletion: 82,
  activeUsers: '1,000+',
  lookingFor: 'Technical co-founder',
  nextMilestone: 'Third faculty pilot',
}

export const dashboardQuickActions: QuickAction[] = [
  { id: 'publish-update', label: 'Publish an update', icon: 'publish', href: '#feed-composer' },
  { id: 'add-milestone', label: 'Add a milestone', icon: 'milestone', href: '/goals' },
  { id: 'find-cofounder', label: 'Find a co-founder', icon: 'cofounder', href: '/network' },
  { id: 'book-mentor', label: 'Book a mentor', icon: 'mentor', href: '/mentorship' },
]

export const nextMentorSession: MentorSession = {
  id: 'mentor-session-1',
  title: 'Product validation',
  mentor: 'Tarlan Yusifzade',
  dateLabel: 'Tomorrow · 15:00',
  duration: '30 min',
  location: 'Google Meet',
  note: 'Prepare your traction questions',
}

export function assetUrl(path: string) {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path
  return localAsset(path)
}

export function avatarForUser(user?: Pick<User, 'id' | 'avatar'> | null) {
  return demoAvatarUrl(user?.id, user?.avatar)
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
