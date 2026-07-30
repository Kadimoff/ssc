import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useStaggerCards, useLikeAnimation, useBookmarkAnimation } from '@/hooks/use-animations'
import { AlertTriangle, ArrowRight, BadgeCheck, Bookmark, BriefcaseBusiness, Building2, CalendarDays, Check, CircleDollarSign, CircleHelp, ClipboardCheck, Clock3, FileUp, GraduationCap, Handshake, Hash, Heart, Link2, MapPin, MessageCircle, MessagesSquare, MoreHorizontal, Rocket, Search, Send, Share2, Sparkles, Target, TrendingUp, Trophy, UserPlus, Users, Video } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { PostKind, PostLink, Snapshot, User } from '@/data/types'
import {
  dashboardActivity,
  dashboardEvents,
  dashboardNextSteps,
  dashboardPeopleToMeet,
  mediaForPost,
  type DashboardEvent,
  type SuggestedPerson,
} from '@/data/feed-dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PageContainer, PageLoading, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'
import { DemoDataBadge, FormField, ResponsiveDialog, StatusBadge } from '@/components/execution-primitives'
import { useExecutionStore } from '@/features/execution/store'
import type { ExecutionDemoState } from '@/features/execution/types'

/* ------------------------------------------------------------------ */
/*  Feed — kind metadata, composer, post card, rails                  */
/* ------------------------------------------------------------------ */

type FeedFilter = 'all' | 'following' | 'saved' | 'milestone' | 'hiring' | 'launch' | 'update'

const KIND_META: Record<PostKind, { label: string; icon: typeof Heart; badge: string; grad: string; dot: string }> = {
  update: { label: 'Update', icon: Sparkles, badge: 'bg-primary/10 text-primary border-primary/25', grad: 'from-primary/20 via-primary/5 to-transparent', dot: 'bg-primary' },
  milestone: { label: 'Milestone', icon: Trophy, badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', grad: 'from-emerald-500/25 via-emerald-500/5 to-transparent', dot: 'bg-emerald-500' },
  raise: { label: 'Raise', icon: CircleDollarSign, badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30', grad: 'from-amber-500/25 via-amber-500/5 to-transparent', dot: 'bg-amber-500' },
  hiring: { label: 'Hiring', icon: BriefcaseBusiness, badge: 'bg-sky-500/15 text-sky-500 border-sky-500/30', grad: 'from-sky-500/25 via-sky-500/5 to-transparent', dot: 'bg-sky-500' },
  launch: { label: 'Launch', icon: Rocket, badge: 'bg-violet-500/15 text-violet-500 border-violet-500/30', grad: 'from-violet-500/25 via-violet-500/5 to-transparent', dot: 'bg-violet-500' },
  question: { label: 'Question', icon: CircleHelp, badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30', grad: 'from-amber-500/20 via-amber-500/5 to-transparent', dot: 'bg-amber-500' },
  event: { label: 'Event', icon: CalendarDays, badge: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30 dark:text-cyan-400', grad: 'from-cyan-500/20 via-cyan-500/5 to-transparent', dot: 'bg-cyan-500' },
  partnership: { label: 'Partnership', icon: Users, badge: 'bg-teal-500/15 text-teal-600 border-teal-500/30 dark:text-teal-400', grad: 'from-teal-500/20 via-teal-500/5 to-transparent', dot: 'bg-teal-500' },
}

function postKind(post: Snapshot['posts'][number]): PostKind {
  const fromType = post.type?.toLowerCase()
  const map: Record<string, PostKind> = { update: 'update', milestone: 'milestone', raise: 'raise', hiring: 'hiring', launch: 'launch', question: 'question', event: 'event', partnership: 'partnership' }
  return post.kind ?? map[fromType ?? ''] ?? 'update'
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days === 1) return `Yesterday at ${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FeedPage() {
  const { data } = useSnapshot()
  const { state } = useExecutionStore()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [visibleCount, setVisibleCount] = useState(6)
  const feedRef = useRef<HTMLDivElement>(null)
  useStaggerCards(feedRef, [data, filter])
  if (!data) return <PageLoading />
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const kinds: PostKind[] = ['update', 'milestone', 'hiring', 'launch']

  const filtered = [...data.posts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).filter((post) => {
    const k = postKind(post)
    if (filter === 'all') return true
    if (filter === 'following') return me ? connectedIds.has(post.authorId) || post.authorId === me.id : false
    if (filter === 'saved') return post.saved
    return k === filter
  })

  const chips: { key: FeedFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: data.posts.length },
    { key: 'following', label: 'Following', count: me ? data.posts.filter((p) => connectedIds.has(p.authorId) || p.authorId === me.id).length : 0 },
    { key: 'saved', label: 'Saved', count: data.posts.filter((post) => post.saved).length },
    ...kinds.map((k) => ({ key: k as FeedFilter, label: KIND_META[k].label + 's', count: data.posts.filter((p) => postKind(p) === k).length })),
  ]

  const visiblePosts = filtered.slice(0, visibleCount)
  const selectFilter = (next: FeedFilter) => {
    setFilter(next)
    setVisibleCount(6)
  }

  return (
    <div className='feed-workspace-surface'>
      <PageContainer className='relative z-10 grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[240px_minmax(0,1fr)_300px] 2xl:gap-6'>
        <FeedLeftRail data={data} state={state} onFilter={selectFilter} />
        <section ref={feedRef} className='min-w-0 space-y-4'>
          <FeedComposer me={me} />
          <div className='no-scrollbar flex gap-2 overflow-x-auto px-0.5 pb-1' aria-label='Filter community updates'>
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => selectFilter(chip.key)}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  filter === chip.key
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-primary/25 hover:text-foreground',
                )}
              >
                {chip.label}
                <span className={cn('rounded-full px-1.5 text-[10px]', filter === chip.key ? 'bg-primary/20' : 'bg-muted')}>{chip.count}</span>
              </button>
            ))}
            <DemoDataBadge label='Illustrative feed' />
          </div>
          {filtered.length === 0 ? (
            <>
              <Card className='border-dashed border-muted-foreground/25 py-16 text-center'>
                <CardContent><MessagesSquare className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No posts in this view</p><p className='mt-1 text-sm text-muted-foreground'>Try another filter or publish an update.</p></CardContent>
              </Card>
              <MobileFeedContext data={data} state={state} />
            </>
          ) : visiblePosts.map((post, index) => <div key={post.id} data-card className='space-y-4'>
            <PostCard post={post} data={data} />
            {index === Math.min(1, visiblePosts.length - 1) && <MobileFeedContext data={data} state={state} />}
          </div>)}
          {visibleCount < filtered.length && (
            <Button variant='outline' className='h-11 w-full gap-2 border-primary/15 bg-card/70' onClick={() => setVisibleCount((count) => count + 4)}>
              Load more ecosystem updates <ArrowRight className='size-4' />
            </Button>
          )}
        </section>
        <TabletFeedRail data={data} state={state} onFilter={selectFilter} />
        <FeedRightRail data={data} />
      </PageContainer>
    </div>
  )
}

/** Kept as a composable legacy execution surface for Workspace; Home now uses compact rail cards. */
export function ExecutionHome({ state, data }: { state: ExecutionDemoState; data: Snapshot }) {
  const next = state.milestones.find((item) => item.status !== 'complete')
  const name = data.currentUser?.name ?? 'Builder'
  const context = homeContext(state, next)
  const activeBuilders = dashboardActivity.userIds
    .map((id) => data.users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
  return <section className='overflow-hidden rounded-2xl border border-primary/20 bg-card/90 shadow-sm'>
    <div className='h-1 bg-gradient-to-r from-primary via-emerald-400 to-amber-300' />
    <div className='p-4 sm:p-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'><div><div className='flex items-center gap-2'><Badge variant='secondary'>Continue working</Badge><StatusBadge status={context.status} /></div><h1 className='mt-3 text-2xl font-bold tracking-tight'>Welcome back, {name.split(' ')[0]}.</h1><p className='mt-1 text-sm text-muted-foreground'>The next useful action comes before community updates.</p></div><Button asChild><Link to={context.primary.to}>{context.primary.label} <ArrowRight /></Link></Button></div>
      <div className='mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
        <div className='rounded-xl border bg-muted/25 p-4'><div className='flex items-start justify-between gap-3'><div><p className='text-xs font-bold uppercase tracking-wide text-primary'>{context.eyebrow}</p><b className='mt-1 block'>{context.title}</b><p className='mt-1 text-xs text-muted-foreground'>{context.detail}</p></div><span className='text-xl font-bold text-primary'>{context.value}</span></div><div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${context.progress}%` }} /></div></div>
        <div className='grid grid-cols-2 gap-2 sm:w-52'>{context.actions.map(({ label, to, icon: Icon }) => <Button key={label} variant='outline' size='sm' asChild><Link to={to}><Icon />{label}</Link></Button>)}</div>
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-3 border-t border-primary/10 pt-4'>
        <div className='flex -space-x-2' aria-label='Sample of active SSC builders'>
          {activeBuilders.map((user) => <UserAvatar key={user.id} user={user} className='size-8 border-2 border-card ring-0' />)}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-[10px] font-bold uppercase tracking-[0.13em] text-primary'>{dashboardActivity.eyebrow}</p>
          <p className='truncate text-sm font-semibold'>{dashboardActivity.headline}</p>
        </div>
        <span className='rounded-full border border-primary/10 bg-primary/[0.05] px-3 py-1 text-[11px] font-medium text-muted-foreground'>{dashboardActivity.detail}</span>
      </div>
    </div>
  </section>
}

type HomeActionRoute = '/workspace' | '/mentorship' | '/programs' | '/verification' | '/admin' | '/partnerships' | '/investors' | '/network' | '/jobs' | '/startups'

function homeContext(state: ExecutionDemoState, next: ExecutionDemoState['milestones'][number] | undefined): {
  eyebrow: string
  title: string
  detail: string
  value: string
  progress: number
  status: string
  primary: { label: string; to: HomeActionRoute }
  actions: Array<{ label: string; to: HomeActionRoute; icon: typeof Target }>
} {
  const pendingEvidence = state.evidence.filter((item) => item.status === 'pending').length
  const pendingVerification = state.verificationRequests.filter((item) => item.status === 'pending').length
  const pendingApplications = state.programApplications.filter((item) => item.status === 'pending').length
  const scheduledSessions = state.mentorSessions.filter((item) => item.status === 'scheduled').length
  const openMentorActions = state.mentorSessions.flatMap((item) => item.actionItems).filter((item) => !item.complete).length

  if (state.selectedPersona === 'student') return {
    eyebrow: 'Verification step',
    title: 'Complete your verified student profile',
    detail: 'Confirm your institution before joining trusted startup workflows.',
    value: '1/3',
    progress: 33,
    status: 'draft',
    primary: { label: 'Continue verification', to: '/verification' },
    actions: [
      { label: 'Verify', to: '/verification', icon: BadgeCheck },
      { label: 'Find roles', to: '/jobs', icon: Search },
      { label: 'Programs', to: '/programs', icon: CalendarDays },
      { label: 'Startups', to: '/startups', icon: Rocket },
    ],
  }
  if (state.selectedPersona === 'mentor') return {
    eyebrow: 'Next founder session',
    title: state.mentorSessions.find((item) => item.status === 'scheduled')?.topic ?? 'Review founder context',
    detail: `${openMentorActions} open founder action item${openMentorActions === 1 ? '' : 's'} across your sample sessions.`,
    value: String(scheduledSessions),
    progress: scheduledSessions ? 65 : 15,
    status: scheduledSessions ? 'scheduled' : 'planned',
    primary: { label: 'Open mentor workspace', to: '/workspace' },
    actions: [
      { label: 'Sessions', to: '/mentorship', icon: CalendarDays },
      { label: 'Actions', to: '/workspace', icon: ClipboardCheck },
      { label: 'Founders', to: '/network', icon: Users },
      { label: 'Programs', to: '/programs', icon: GraduationCap },
    ],
  }
  if (state.selectedPersona === 'investor') return {
    eyebrow: 'Opportunity review',
    title: `${pendingEvidence} evidence signal${pendingEvidence === 1 ? '' : 's'} need review`,
    detail: 'Review missing signals before requesting a consent-based introduction.',
    value: String(state.watchlist.length),
    progress: Math.min(100, state.watchlist.length * 20),
    status: pendingEvidence ? 'pending' : 'complete',
    primary: { label: 'Review opportunities', to: '/investors' },
    actions: [
      { label: 'Matches', to: '/investors', icon: Search },
      { label: 'Evidence', to: '/investors', icon: ClipboardCheck },
      { label: 'Watchlist', to: '/investors', icon: Bookmark },
      { label: 'Introductions', to: '/investors', icon: Handshake },
    ],
  }
  if (state.selectedPersona === 'program_admin' || state.selectedPersona === 'partner' || state.selectedPersona === 'platform_admin') {
    const pending = pendingEvidence + pendingVerification + pendingApplications
    const partner = state.selectedPersona === 'partner'
    const platform = state.selectedPersona === 'platform_admin'
    return {
      eyebrow: partner ? 'Partner commitment' : platform ? 'Governance queue' : 'Program operations',
      title: partner ? 'Review commitments and outcome evidence' : `${pending} workflow decision${pending === 1 ? '' : 's'} need attention`,
      detail: partner ? 'Keep contributions, agreements and outcome records connected.' : 'Applications, verification and evidence remain reasoned and auditable.',
      value: partner ? 'Demo' : String(pending),
      progress: pending ? 55 : 100,
      status: pending ? 'pending' : 'complete',
      primary: { label: partner ? 'Open partner workspace' : 'Open operations', to: '/workspace' },
      actions: [
        { label: 'Workspace', to: '/workspace', icon: Building2 },
        { label: 'Programs', to: '/programs', icon: CalendarDays },
        { label: 'Verification', to: '/verification', icon: BadgeCheck },
        { label: partner ? 'Outcomes' : platform ? 'Admin' : 'Partners', to: partner ? '/partnerships' : platform ? '/admin' : '/partnerships', icon: partner ? TrendingUp : platform ? Target : Handshake },
      ],
    }
  }
  return {
    eyebrow: 'Next milestone',
    title: next?.title ?? 'Create your first startup milestone',
    detail: next?.evidenceDefinition ?? 'Define the evidence that will count as complete.',
    value: `${next?.progress ?? 0}%`,
    progress: next?.progress ?? 0,
    status: next?.status ?? 'planned',
    primary: { label: 'Open workspace', to: '/workspace' },
    actions: [
      { label: 'Milestones', to: '/workspace', icon: Target },
      { label: 'Mentor', to: '/mentorship', icon: GraduationCap },
      { label: 'Programs', to: '/programs', icon: CalendarDays },
      { label: `Evidence ${pendingEvidence}`, to: '/workspace', icon: ClipboardCheck },
    ],
  }
}

/** Full execution detail belongs in Workspace and is no longer mounted above the feed. */
export function HomeOperations({ state }: { state: ExecutionDemoState }) {
  if (['mentor', 'investor', 'program_admin', 'partner', 'platform_admin'].includes(state.selectedPersona)) {
    return <StakeholderHomeOperations state={state} />
  }
  const startupSlug = 'campus-cart'
  const startupMilestones = state.milestones.filter((item) => item.startupSlug === startupSlug)
  const currentMilestone = startupMilestones.find((item) => item.status !== 'complete')
  const startupEvidence = state.evidence.filter((item) => item.startupSlug === startupSlug)
  const verifiedEvidence = startupEvidence.filter((item) => item.status === 'verified').length
  const evidenceCoverage = startupEvidence.length ? Math.round((verifiedEvidence / startupEvidence.length) * 100) : 0
  const members = state.memberships.filter((item) => item.startupSlug === startupSlug)
  const openRoles = state.openRoles.filter((item) => item.startupSlug === startupSlug && item.status === 'open')
  const application = state.programApplications.find((item) => item.startupSlug === startupSlug)
  const session = state.mentorSessions.find((item) => item.startupSlug === startupSlug && item.status === 'scheduled')
  const noStartup = state.selectedPersona === 'student'

  const workflow = [
    { label: 'Team', complete: members.length >= 2 },
    { label: 'Milestone', complete: startupMilestones.length > 0 },
    { label: 'Evidence', complete: startupEvidence.length > 0 },
    { label: 'Mentor', complete: state.mentorSessions.some((item) => item.startupSlug === startupSlug) },
    { label: 'Program', complete: Boolean(application) },
    { label: 'Investor', complete: state.introRequests.some((item) => item.startupSlug === startupSlug) },
  ]

  const actions = [
    { label: 'Add milestone', to: '/workspace' as const, icon: Target },
    { label: 'Upload evidence', to: '/workspace' as const, icon: FileUp },
    { label: 'Find teammate', to: '/network' as const, icon: UserPlus },
    { label: 'Book mentor', to: '/mentorship' as const, icon: GraduationCap },
    { label: 'Apply to program', to: '/programs' as const, icon: CalendarDays },
  ]

  const attention = [
    startupEvidence.some((item) => item.status === 'needs_changes') ? { text: 'Evidence needs revision', to: '/workspace' as const, status: 'needs_changes' } : { text: 'Seller interview evidence awaits review', to: '/workspace' as const, status: 'pending' },
    session ? { text: `Mentor session · ${new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`, to: '/mentorship' as const, status: 'scheduled' } : { text: 'Book a validation mentor', to: '/mentorship' as const, status: 'planned' },
    application ? { text: `${application.programName} · ${application.status.replace('_', ' ')}`, to: '/programs' as const, status: application.status } : { text: 'Program application not started', to: '/programs' as const, status: 'draft' },
  ]

  return <section className='space-y-3' aria-labelledby='home-operations-title'>
    <div className='flex items-center justify-between gap-3 px-1'><div><p className='text-[10px] font-bold uppercase tracking-[.14em] text-primary'>Execution overview</p><h2 id='home-operations-title' className='mt-1 text-lg font-bold tracking-tight'>Your operating picture</h2></div><DemoDataBadge /></div>

    <Card className='overflow-hidden border-primary/15 bg-card/90'>
      <CardHeader className='pb-3'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div><CardTitle className='flex items-center gap-2'><Building2 className='size-5 text-primary' />{noStartup ? 'Start your first workspace' : 'CampusCart snapshot'}</CardTitle><CardDescription className='mt-1'>{noStartup ? 'Create a startup or join a team to begin the execution loop.' : 'Sample university ecosystem · validation stage'}</CardDescription></div>
          <StatusBadge status={noStartup ? 'draft' : application?.status ?? 'planned'} />
        </div>
      </CardHeader>
      <CardContent>
        {noStartup ? <div className='flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between'><p className='text-sm leading-6 text-muted-foreground'>Verification, startup creation, open roles and programs are ready in the demo workspace.</p><div className='flex gap-2'><Button asChild><Link to='/startups/new'>Create startup</Link></Button><Button variant='outline' asChild><Link to='/jobs'>Find roles</Link></Button></div></div> : <>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
            {[['Team', `${members.length} active`], ['Evidence', `${evidenceCoverage}% verified`], ['Open roles', String(openRoles.length)], ['Application', application?.status.replace('_', ' ') ?? 'Not started']].map(([label, value]) => <div key={label} className='rounded-xl border bg-muted/20 p-3'><p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>{label}</p><p className='mt-1 truncate text-sm font-semibold capitalize'>{value}</p></div>)}
          </div>
          <div className='mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center'>
            <div><p className='text-xs text-muted-foreground'>Current ask</p><p className='mt-1 text-sm font-semibold'>Backend co-founder for a safe checkout pilot</p><p className='mt-1 text-xs text-muted-foreground'>Next best action: finish three seller interviews and submit the decision summary.</p></div>
            <Button variant='outline' asChild><Link to='/startups/$slug' params={{ slug: startupSlug }}>Open startup <ArrowRight /></Link></Button>
          </div>
        </>}
      </CardContent>
    </Card>

    <div className='grid gap-3 md:grid-cols-3'>
      <Card className='border-primary/10'><CardHeader className='pb-2'><CardDescription>Current milestone</CardDescription><CardTitle className='text-base'>{currentMilestone?.title ?? 'Define a milestone'}</CardTitle></CardHeader><CardContent><div className='flex items-center justify-between text-xs text-muted-foreground'><span>Progress</span><b className='text-primary'>{currentMilestone?.progress ?? 0}%</b></div><div className='mt-2 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${currentMilestone?.progress ?? 0}%` }} /></div><Button variant='ghost' size='sm' className='mt-3 px-0' asChild><Link to='/workspace'>Update milestone <ArrowRight /></Link></Button></CardContent></Card>
      <Card className='border-primary/10'><CardHeader className='pb-2'><CardDescription>Evidence status</CardDescription><CardTitle className='text-base'>{startupEvidence.length} record{startupEvidence.length === 1 ? '' : 's'} · {verifiedEvidence} verified</CardTitle></CardHeader><CardContent><p className='text-xs leading-5 text-muted-foreground'>{startupEvidence.some((item) => item.status === 'pending') ? 'One evidence record is waiting for an authorized review.' : 'Add the proof that supports your next decision.'}</p><Button variant='ghost' size='sm' className='mt-3 px-0' asChild><Link to='/workspace'>Upload evidence <ArrowRight /></Link></Button></CardContent></Card>
      <Card className='border-primary/10'><CardHeader className='pb-2'><CardDescription>{session ? 'Mentor session' : 'Program deadline'}</CardDescription><CardTitle className='text-base'>{session?.topic ?? 'Continue your application'}</CardTitle></CardHeader><CardContent><p className='text-xs leading-5 text-muted-foreground'>{session ? `${session.mentorName} · ${new Date(session.scheduledAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Review eligibility and evidence requirements.'}</p><Button variant='ghost' size='sm' className='mt-3 px-0' asChild><Link to={session ? '/mentorship' : '/programs'}>Review details <ArrowRight /></Link></Button></CardContent></Card>
    </div>

    <Card className='border-primary/10'>
      <CardHeader className='pb-3'><CardTitle className='text-base'>Quick actions</CardTitle><CardDescription>Five execution actions before publishing an update.</CardDescription></CardHeader>
      <CardContent className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'>
        {actions.map(({ label, to, icon: Icon }) => <Button key={label} variant='outline' className='h-auto min-h-16 flex-col whitespace-normal px-2 text-center' asChild><Link to={to}><Icon className='size-5 text-primary' />{label}</Link></Button>)}
        <Button variant='outline' className='h-auto min-h-16 flex-col whitespace-normal px-2 text-center' asChild><a href='#feed-composer'><Sparkles className='size-5 text-primary' />Publish update</a></Button>
      </CardContent>
    </Card>

    <Card className='border-primary/10'>
      <CardHeader className='pb-3'><CardTitle className='text-base'>Workflow progress</CardTitle><CardDescription>Team → Milestone → Evidence → Mentor → Program → Investor</CardDescription></CardHeader>
      <CardContent>
        <ol className='grid gap-2 sm:grid-cols-3 lg:grid-cols-6'>
          {workflow.map((step, index) => <li key={step.label} className={cn('flex min-h-12 items-center gap-2 rounded-xl border px-3 text-xs font-semibold', step.complete ? 'border-primary/20 bg-primary/[0.06] text-foreground' : 'border-border bg-muted/20 text-muted-foreground')}><span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold', step.complete ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{step.complete ? <Check className='size-3.5' /> : index + 1}</span>{step.label}</li>)}
        </ol>
      </CardContent>
    </Card>

    <Card className='border-amber-500/20 bg-amber-500/[0.025]'>
      <CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><AlertTriangle className='size-4 text-amber-600' /> Items requiring attention</CardTitle></CardHeader>
      <CardContent className='grid gap-2 md:grid-cols-3'>
        {attention.map((item) => <Link key={item.text} to={item.to} className='flex min-h-12 items-center justify-between gap-2 rounded-xl border bg-background/55 px-3 text-sm font-medium outline-none hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary'><span className='min-w-0 truncate'>{item.text}</span><StatusBadge status={item.status} className='shrink-0 text-[10px]' /></Link>)}
      </CardContent>
    </Card>
  </section>
}

function StakeholderHomeOperations({ state }: { state: ExecutionDemoState }) {
  const persona = state.selectedPersona
  const pendingEvidence = state.evidence.filter((item) => item.status === 'pending').length
  const pendingVerification = state.verificationRequests.filter((item) => item.status === 'pending').length
  const pendingApplications = state.programApplications.filter((item) => item.status === 'pending').length
  const sessions = state.mentorSessions.filter((item) => item.status === 'scheduled')
  const openActions = state.mentorSessions.flatMap((item) => item.actionItems).filter((item) => !item.complete)
  const metrics = persona === 'mentor'
    ? [
        { label: 'Scheduled sessions', value: sessions.length, detail: 'Founder context available', icon: CalendarDays },
        { label: 'Open actions', value: openActions.length, detail: 'Owned follow-ups', icon: ClipboardCheck },
        { label: 'Linked milestones', value: new Set(openActions.map((item) => item.milestoneId).filter(Boolean)).size, detail: 'Execution context', icon: Target },
      ]
    : persona === 'investor'
      ? [
          { label: 'Watchlist', value: state.watchlist.length, detail: 'Relevant ventures', icon: Bookmark },
          { label: 'Evidence to review', value: pendingEvidence, detail: 'Missing or pending signals', icon: ClipboardCheck },
          { label: 'Intro requests', value: state.introRequests.length, detail: 'Consent-based handoffs', icon: Handshake },
        ]
      : persona === 'partner'
        ? [
            { label: 'Program records', value: state.programApplications.length, detail: 'Illustrative participation', icon: CalendarDays },
            { label: 'Evidence records', value: state.evidence.length, detail: 'Outcome support', icon: ClipboardCheck },
            { label: 'Attention items', value: state.notifications.filter((item) => !item.read).length, detail: 'Sample operator queue', icon: AlertTriangle },
          ]
        : [
            { label: 'Applications', value: state.programApplications.length, detail: `${pendingApplications} pending review`, icon: CalendarDays },
            { label: 'Verification queue', value: pendingVerification, detail: 'Reasoned decisions', icon: BadgeCheck },
            { label: 'Evidence review', value: pendingEvidence, detail: 'Safe demo metadata', icon: ClipboardCheck },
          ]
  const actions: Array<{ label: string; to: HomeActionRoute; icon: typeof Target }> = persona === 'mentor'
    ? [
        { label: 'Prepare session', to: '/mentorship', icon: CalendarDays },
        { label: 'Review actions', to: '/workspace', icon: ClipboardCheck },
        { label: 'Find founders', to: '/network', icon: Users },
        { label: 'View programs', to: '/programs', icon: GraduationCap },
        { label: 'Open workspace', to: '/workspace', icon: Target },
      ]
    : persona === 'investor'
      ? [
          { label: 'Review matches', to: '/investors', icon: Search },
          { label: 'Inspect evidence', to: '/investors', icon: ClipboardCheck },
          { label: 'Open watchlist', to: '/investors', icon: Bookmark },
          { label: 'Compare ventures', to: '/investors', icon: TrendingUp },
          { label: 'Track introductions', to: '/investors', icon: Handshake },
        ]
      : persona === 'partner'
        ? [
            { label: 'Review commitments', to: '/partnerships', icon: Handshake },
            { label: 'Record contribution', to: '/partnerships', icon: ClipboardCheck },
            { label: 'Inspect outcomes', to: '/partnerships', icon: TrendingUp },
            { label: 'Plan a program', to: '/programs', icon: CalendarDays },
            { label: 'Request pilot', to: '/partnerships', icon: Building2 },
          ]
        : [
            { label: 'Review applications', to: '/programs', icon: CalendarDays },
            { label: 'Review verification', to: '/verification', icon: BadgeCheck },
            { label: 'Review evidence', to: '/workspace', icon: ClipboardCheck },
            { label: 'Track outcomes', to: '/partnerships', icon: TrendingUp },
            { label: persona === 'platform_admin' ? 'Open admin' : 'Manage programs', to: persona === 'platform_admin' ? '/admin' : '/programs', icon: Building2 },
          ]
  const attention = persona === 'mentor'
    ? [
        { title: sessions[0]?.topic ?? 'No session scheduled', detail: sessions[0] ? `With ${sessions[0].mentorName}` : 'Review mentor availability', status: sessions[0]?.status ?? 'planned', to: '/mentorship' as HomeActionRoute },
        { title: `${openActions.length} open action item${openActions.length === 1 ? '' : 's'}`, detail: 'Confirm owners and deadlines', status: openActions.length ? 'pending' : 'complete', to: '/workspace' as HomeActionRoute },
      ]
    : persona === 'investor'
      ? [
          { title: `${pendingEvidence} evidence signal${pendingEvidence === 1 ? '' : 's'} pending`, detail: 'Separate relevance from readiness', status: pendingEvidence ? 'pending' : 'complete', to: '/investors' as HomeActionRoute },
          { title: `${state.introRequests.length} tracked introduction request${state.introRequests.length === 1 ? '' : 's'}`, detail: 'No transaction or success fee', status: state.introRequests.length ? 'requested' : 'planned', to: '/investors' as HomeActionRoute },
        ]
      : [
          { title: `${pendingVerification} verification request${pendingVerification === 1 ? '' : 's'}`, detail: 'Review consent and supporting metadata', status: pendingVerification ? 'pending' : 'complete', to: '/verification' as HomeActionRoute },
          { title: `${pendingApplications} application${pendingApplications === 1 ? '' : 's'} awaiting decision`, detail: 'Record a reasoned program outcome', status: pendingApplications ? 'pending' : 'complete', to: '/programs' as HomeActionRoute },
          { title: `${pendingEvidence} evidence record${pendingEvidence === 1 ? '' : 's'} pending`, detail: 'Inspect before reporting outcomes', status: pendingEvidence ? 'pending' : 'complete', to: '/workspace' as HomeActionRoute },
        ]

  return <section className='space-y-3' aria-labelledby='stakeholder-operations-title'>
    <div className='flex items-center justify-between gap-3 px-1'><div><p className='text-[10px] font-bold uppercase tracking-[.14em] text-primary'>Role-aware operations</p><h2 id='stakeholder-operations-title' className='mt-1 text-lg font-bold tracking-tight'>Your operating picture</h2></div><DemoDataBadge /></div>
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
      {metrics.map(({ label, value, detail, icon: Icon }) => <Card key={label} className='border-primary/10'><CardContent className='flex items-center gap-3 p-4'><span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span><div className='min-w-0'><p className='text-[10px] font-bold uppercase tracking-wide text-muted-foreground'>{label}</p><b className='text-xl'>{value}</b><p className='truncate text-xs text-muted-foreground'>{detail}</p></div></CardContent></Card>)}
    </div>
    <Card className='border-primary/10'><CardHeader className='pb-3'><CardTitle className='text-base'>Quick actions</CardTitle><CardDescription>Operational actions matched to the active demo persona.</CardDescription></CardHeader><CardContent className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>{actions.map(({ label, to, icon: Icon }) => <Button key={label} variant='outline' className='h-auto min-h-16 flex-col whitespace-normal px-2 text-center' asChild><Link to={to}><Icon className='size-5 text-primary' />{label}</Link></Button>)}</CardContent></Card>
    <Card className='border-amber-500/20 bg-amber-500/[0.025]'><CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><AlertTriangle className='size-4 text-amber-600' />Items requiring attention</CardTitle></CardHeader><CardContent className='grid gap-2 md:grid-cols-3'>{attention.map((item) => <Link key={item.title} to={item.to} className='rounded-xl border bg-background/55 p-3 outline-none hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary'><div className='flex items-center justify-between gap-2'><b className='text-sm'>{item.title}</b><StatusBadge status={item.status} className='shrink-0 text-[10px]' /></div><p className='mt-1 text-xs text-muted-foreground'>{item.detail}</p></Link>)}</CardContent></Card>
  </section>
}

function FeedComposer({ me }: { me: Snapshot['currentUser'] }) {
  const [content, setContent] = useState('')
  const [kind, setKind] = useState<PostKind>('update')
  const [tags, setTags] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [expanded, setExpanded] = useState(false)
  const parsedTags = tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
  const link: PostLink | undefined = linkTitle.trim() && /^https?:\/\//i.test(linkUrl.trim()) ? { title: linkTitle.trim(), subtitle: 'External link', url: linkUrl.trim() } : undefined
  const create = useAction(() => apiClient.createPost(content, { kind, tags: parsedTags, link }), 'Update published')
  const reset = () => { setContent(''); setTags(''); setLinkTitle(''); setLinkUrl(''); setKind('update'); setExpanded(false) }
  const quickActions: Array<{ kind: PostKind; label: string }> = [
    { kind: 'update', label: 'Update' },
    { kind: 'milestone', label: 'Milestone' },
    { kind: 'launch', label: 'Launch' },
    { kind: 'hiring', label: 'Hiring' },
    { kind: 'question', label: 'Feedback' },
  ]
  return (
    <Card id='feed-composer' className='glass-card scroll-mt-32 overflow-hidden border-primary/10 p-0 shadow-sm'>
      <div className='h-1 bg-gradient-to-r from-primary/30 via-emerald-400/25 to-amber-400/15' />
      <CardContent className='p-3.5 sm:p-4'>
        <div className='flex items-center gap-3'>
          <UserAvatar user={me} className='size-11 ring-2 ring-primary/10' />
          <button
            type='button'
            disabled={!me}
            onClick={() => setExpanded(true)}
            className='min-h-12 min-w-0 flex-1 rounded-full border border-border/80 bg-background/60 px-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60'
          >
            <span className='line-clamp-1'>{me ? 'Share a milestone, launch, hiring need, result, or ask…' : 'Sign in to share with the community'}</span>
          </button>
        </div>
        <div className='mt-3 grid grid-cols-4 gap-1 border-t pt-3 sm:grid-cols-5' aria-label='Choose a post type'>
          {quickActions.map((action, index) => {
            const Meta = KIND_META[action.kind]
            return <button
              key={action.kind}
              type='button'
              disabled={!me}
              onClick={() => { setKind(action.kind); setExpanded(true) }}
              className={cn('flex min-h-10 items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-primary/[0.05] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 sm:text-xs', (index === 2 || index === 4) && 'hidden sm:flex')}
            >
              <Meta.icon className='size-4 shrink-0' />{action.label}
            </button>
          })}
          <button type='button' disabled={!me} onClick={() => setExpanded(true)} className='flex min-h-10 items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold text-muted-foreground hover:bg-primary/[0.05] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 sm:hidden'><MoreHorizontal className='size-4' />More</button>
        </div>
      </CardContent>
      <ResponsiveDialog
        open={expanded}
        onOpenChange={setExpanded}
        title='Share with SSC'
        description='Connect the update to useful execution context. Sample posts remain local in demo mode.'
        className='responsive-update-dialog sm:max-w-2xl'
        footer={<div className='flex w-full items-center justify-end gap-2'>
          <Button variant='outline' onClick={() => setExpanded(false)}>Cancel</Button>
          <Button disabled={!me || !content.trim() || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: reset })}><Send />{create.isPending ? 'Publishing…' : 'Publish update'}</Button>
        </div>}
      >
        <div className='space-y-5'>
          <div>
            <p className='mb-2 text-sm font-semibold'>Post type</p>
            <div className='flex flex-wrap gap-2'>
              {(Object.keys(KIND_META) as PostKind[]).map((postType) => {
                const Meta = KIND_META[postType]
                return <button key={postType} type='button' onClick={() => setKind(postType)} className={cn('inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', kind === postType ? Meta.badge : 'border-border text-muted-foreground hover:text-foreground')}><Meta.icon className='size-4' />{Meta.label}</button>
              })}
            </div>
          </div>
          <FormField label='Update' htmlFor='composer-content' required helper='Share the result, evidence, role, program, or specific ask.' count={{ current: content.length, max: 1_200 }}>
            <Textarea id='composer-content' autoFocus value={content} onChange={(event) => setContent(event.target.value.slice(0, 1_200))} placeholder='What moved forward, what did you learn, and what do you need next?' className='min-h-36 resize-y' />
          </FormField>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField label='Tags' htmlFor='composer-tags' helper='Comma-separated, for example: marketplace, validation.'>
              <Input id='composer-tags' value={tags} onChange={(event) => setTags(event.target.value)} placeholder='marketplace, validation' />
            </FormField>
            <FormField label='Context URL' htmlFor='composer-url' helper='Use a complete http:// or https:// URL.'>
              <Input id='composer-url' inputMode='url' value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder='https://…' />
            </FormField>
          </div>
          <FormField label='Context title' htmlFor='composer-link-title' helper='Shown only when a valid URL is provided.'>
            <Input id='composer-link-title' value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} placeholder='Milestone, program, role, or evidence bundle' />
          </FormField>
        </div>
      </ResponsiveDialog>
    </Card>
  )
}

function PostCard({ post, data }: { post: Snapshot['posts'][number]; data: Snapshot }) {
  const author = data.users.find((user) => user.id === post.authorId)
  const react = useAction(() => apiClient.togglePost(post.id, 'liked'))
  const save = useAction(() => apiClient.togglePost(post.id, 'saved'))
  const repost = useAction(() => apiClient.repost(post.id))
  const remove = useAction(() => apiClient.deletePost(post.id), 'Post removed')
  const [showThread, setShowThread] = useState(false)
  const kind = postKind(post)
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const tags = post.tags ?? []
  const media = mediaForPost(post)
  const saveCount = Math.max(4, Math.round((post.reactions + post.comments) / 35))
  return (
    <Card className='group overflow-hidden border-primary/10 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg'>
      <div className={cn('h-1 bg-gradient-to-r opacity-75 transition-opacity duration-300 group-hover:opacity-100', meta.grad)} />
      <CardHeader className='!flex flex-row items-start gap-3 p-4 pb-2 sm:p-5 sm:pb-2'>
        <UserAvatar user={author} className='size-11 ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20' />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <CardTitle className='text-[15px] tracking-tight'>{author?.name}</CardTitle>
            {author?.verificationStatus === 'verified' && <BadgeCheck className='size-4 text-primary' aria-label='Verified SSC member' />}
            <Badge variant='outline' className={cn('gap-1 border text-[10px] font-semibold uppercase tracking-wider', meta.badge)}><Icon className='size-3' />{meta.label}</Badge>
            <DemoDataBadge label='Sample post' />
          </div>
          <CardDescription className='mt-0.5 flex flex-wrap items-center gap-1.5 text-xs'>
            <span className='truncate'>{author?.title}</span>
            <span className='text-[10px]'>·</span>
            <span className='inline-flex items-center gap-1'><Clock3 className='size-3' />{timeAgo(post.createdAt)}</span>
          </CardDescription>
        </div>
        {data.currentUser?.role === 'admin' && <Button className='ml-auto size-8 text-muted-foreground' variant='ghost' size='icon' onClick={() => remove.mutate()} aria-label='Delete post'><MoreHorizontal /></Button>}
      </CardHeader>
      <CardContent className='px-4 pb-4 sm:px-5'>
        <p className='whitespace-pre-wrap text-pretty text-[15px] leading-relaxed'>{post.content}</p>
        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {tags.slice(0, 4).map((tag) => <span key={tag} className='inline-flex items-center gap-0.5 rounded-full border border-primary/10 bg-primary/[0.045] px-2 py-1 text-[11px] font-medium text-muted-foreground'><Hash className='size-2.5 text-primary/70' />{tag}</span>)}
          </div>
        )}
        {media.length > 0 && (
          <div className={cn('mt-4 grid overflow-hidden rounded-2xl border border-border/80 bg-muted/30', media.length > 1 && 'sm:grid-cols-2')}>
            {media.slice(0, 2).map((asset) => (
              <figure key={asset.src} className='aspect-video min-w-0 overflow-hidden bg-muted/40'>
                <img
                  src={asset.src}
                  alt={asset.alt}
                  loading='lazy'
                  className={cn('size-full transition-transform duration-500 group-hover:scale-[1.01]', asset.fit === 'contain' ? 'object-contain' : 'object-cover')}
                />
              </figure>
            ))}
          </div>
        )}
        {media.length === 0 && post.link?.url && /^https?:\/\//i.test(post.link.url) ? (
          <a href={post.link.url} target='_blank' rel='noreferrer' className='mt-4 block overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-sm'>
            <div className={cn('mb-3 h-1 w-12 rounded-full bg-gradient-to-r', meta.grad)} />
            <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'><Link2 className='size-3.5' />{post.link.url}</div>
            <h3 className='mt-2 font-semibold tracking-tight'>{post.link.title}</h3>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{post.link.subtitle}</p>
          </a>
        ) : media.length === 0 && (post.link || post.previewTitle) ? (
          <div className='mt-4 overflow-hidden rounded-xl border bg-gradient-to-br p-4'>
            <div className={cn('mb-3 h-1 w-12 rounded-full bg-gradient-to-r', meta.grad)} />
            <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'><Link2 className='size-3.5' />Shared context</div>
            <h3 className='mt-2 font-semibold tracking-tight'>{post.link?.title ?? post.previewTitle}</h3>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{post.link?.subtitle ?? post.previewSubtitle}</p>
          </div>
        ) : (post.link || post.previewTitle) && (
          <div className='mt-3 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5'>
            <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br', meta.grad)}><Link2 className='size-3.5 text-primary' /></span>
            <div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold'>{post.link?.title ?? post.previewTitle}</p><p className='truncate text-xs text-muted-foreground'>{post.link?.subtitle ?? post.previewSubtitle}</p></div>
          </div>
        )}
        <div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground' aria-label='Post engagement'>
          <span className='flex items-center gap-1.5'><Heart className={cn('size-3.5', post.liked && 'fill-current text-primary')} /> {post.reactions} likes</span>
          <span className='flex items-center gap-1.5'><MessageCircle className='size-3.5' /> {post.comments} comments</span>
          <span className='flex items-center gap-1.5'><Bookmark className={cn('size-3.5', post.saved && 'fill-current text-primary')} /> {saveCount} saves</span>
          <span className='flex items-center gap-1.5'><Share2 className='size-3.5' /> {post.reposts} shares</span>
        </div>
      </CardContent>
      <CardFooter className='grid grid-cols-4 border-t bg-muted/[0.12] px-2 py-1.5'>
        <PostAction active={post.liked} icon={Heart} label='Like' onClick={() => react.mutate()} />
        <PostAction icon={MessageCircle} label='Comment' onClick={() => setShowThread((v) => !v)} />
        <PostAction icon={Share2} label='Share' onClick={() => repost.mutate()} />
        <PostAction active={post.saved} icon={Bookmark} label='Save' onClick={() => save.mutate()} />
      </CardFooter>
      {showThread && <CommentThread post={post} data={data} />}
    </Card>
  )
}

function CommentThread({ post, data }: { post: Snapshot['posts'][number]; data: Snapshot }) {
  const me = data.currentUser
  const [text, setText] = useState('')
  const add = useAction(() => apiClient.addComment(post.id, text), undefined)
  const comments = post.commentsList ?? []
  return (
    <div className='space-y-3 border-t bg-muted/20 p-4'>
      {comments.map((c) => {
        const author = data.users.find((u) => u.id === c.authorId)
        return (
          <div key={c.id} className='flex gap-2.5'>
            <UserAvatar user={author} className='size-8' />
            <div className='min-w-0 flex-1 rounded-xl bg-card px-3 py-2 shadow-sm'>
              <div className='flex items-center gap-1.5 text-xs'><b className='truncate'>{author?.name ?? 'Member'}</b><span className='text-muted-foreground'>· {timeAgo(c.createdAt)}</span></div>
              <p className='mt-0.5 text-sm text-foreground'>{c.text}</p>
            </div>
          </div>
        )
      })}
      {me ? (
        <form className='flex items-center gap-2' onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; add.mutate(undefined, { onSuccess: () => setText('') }) }}>
          <UserAvatar user={me} className='size-8' />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='Add a constructive reply…' className='h-9 bg-card' />
          <Button type='submit' size='icon' disabled={!text.trim() || add.isPending} aria-label='Send comment'><Send className='size-4' /></Button>
        </form>
      ) : <p className='text-xs text-muted-foreground'>Sign in to reply.</p>}
    </div>
  )
}

function nextStepsForPersona(state: ExecutionDemoState) {
  if (state.selectedPersona === 'mentor') return [
    { id: 'mentor-prepare', title: 'Prepare the next founder session', description: 'Review the goal, challenge, and linked milestone.', completed: true },
    { id: 'mentor-evidence', title: 'Review founder evidence', description: 'Separate observations from assumptions.', completed: false },
    { id: 'mentor-action', title: 'Assign an owned action item', description: 'Add one owner and a clear deadline.', completed: false },
    { id: 'mentor-followup', title: 'Schedule a follow-up', description: 'Keep the decision loop moving.', completed: false },
  ]
  if (state.selectedPersona === 'investor') return [
    { id: 'investor-thesis', title: 'Confirm the saved thesis', description: 'Keep sector, stage, and geography explicit.', completed: true },
    { id: 'investor-evidence', title: 'Review missing evidence', description: 'Inspect readiness signals without predicting returns.', completed: false },
    { id: 'investor-watch', title: 'Prioritize the watchlist', description: 'Record the next review action.', completed: true },
    { id: 'investor-intro', title: 'Track an introduction', description: 'Use a consent-based request with context.', completed: false },
  ]
  if (state.selectedPersona === 'partner') return [
    { id: 'partner-commitment', title: 'Review partner commitments', description: 'Confirm owners, dates, and delivery status.', completed: true },
    { id: 'partner-contribution', title: 'Record a contribution', description: 'Link support to a program or outcome.', completed: false },
    { id: 'partner-evidence', title: 'Inspect outcome evidence', description: 'Report only supported results.', completed: false },
    { id: 'partner-program', title: 'Plan the next program action', description: 'Coordinate operator and expert capacity.', completed: false },
  ]
  if (state.selectedPersona === 'program_admin' || state.selectedPersona === 'platform_admin') return [
    { id: 'operator-verification', title: 'Review pending verification', description: 'Inspect consent and safe supporting metadata.', completed: false },
    { id: 'operator-application', title: 'Decide a program application', description: 'Record a transparent review note.', completed: false },
    { id: 'operator-evidence', title: 'Review submitted evidence', description: 'Approve, reject, or request changes.', completed: false },
    { id: 'operator-audit', title: 'Inspect the audit trail', description: 'Confirm that operational decisions are attributable.', completed: true },
  ]
  return dashboardNextSteps
}

function ProfileSummaryCard({ data, compact = false }: { data: Snapshot; compact?: boolean }) {
  const me = data.currentUser
  const completion = me ? Math.min(100, 45 + (me.skills ? 15 : 0) + (me.about ? 15 : 0) + (me.website ? 10 : 0) + (me.company ? 15 : 0)) : 0
  return <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-primary/75 to-[#0f766e]', compact ? 'h-14' : 'h-16')}>
      <div className='absolute -right-6 -top-10 size-28 rounded-full border border-white/10' />
      <div className='absolute left-5 top-5 h-px w-28 bg-gradient-to-r from-white/35 to-transparent' />
    </div>
    <CardContent className='px-4 pb-4 text-center'>
      <UserAvatar user={me} className={cn('mx-auto border-4 border-card shadow-md', compact ? '-mt-7 size-14' : '-mt-8 size-16')} />
      <div className='mt-2 flex min-w-0 items-center justify-center gap-1.5'>
        <h3 className='truncate text-sm font-semibold tracking-tight'>{me?.name ?? 'Join SSC'}</h3>
        {me?.verificationStatus === 'verified' && <BadgeCheck className='size-4 shrink-0 text-primary' aria-label='Verified member' />}
      </div>
      <p className='mt-1 truncate text-xs font-medium text-muted-foreground'>{me?.title ?? 'Build your founder identity'}</p>
      {me?.company && <p className='mt-1 truncate text-[10px] text-muted-foreground'>{me.company}</p>}
      <div className='mt-3'>
        <div className='flex items-center justify-between text-[10px] text-muted-foreground'><span>Profile completion</span><span className='font-bold text-primary'>{completion}%</span></div>
        <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-500' style={{ width: `${completion}%` }} /></div>
      </div>
      {me && <Button variant='ghost' size='sm' className='mt-2 w-full' asChild><Link to='/profile'>View profile <ArrowRight className='size-3.5' /></Link></Button>}
    </CardContent>
  </Card>
}

function ContinueWorkingCard({ state }: { state: ExecutionDemoState }) {
  const next = state.milestones.find((item) => item.status !== 'complete')
  const context = homeContext(state, next)
  const openItems = nextStepsForPersona(state).filter((step) => !step.completed).length
  const secondary = context.actions.find((action) => action.to !== context.primary.to) ?? context.actions[0]
  return <Card className='border-primary/15 bg-card/85 p-0 shadow-sm'>
    <CardContent className='p-4'>
      <div className='flex items-start justify-between gap-2'><p className='text-[10px] font-bold uppercase tracking-[.13em] text-primary'>Continue working</p><Badge variant='secondary' className='text-[9px]'>{openItems} open</Badge></div>
      <h3 className='mt-2 line-clamp-2 text-sm font-semibold leading-5'>{context.title}</h3>
      <p className='mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground'>{context.detail}</p>
      <div className='mt-3 grid w-full grid-cols-2 gap-2'>
        <Button size='sm' className='box-border w-full min-w-0 px-2 text-[11px]' asChild><Link to={context.primary.to}>{context.primary.label}</Link></Button>
        {secondary && <Button size='sm' variant='outline' className='box-border w-full min-w-0 px-2 text-[11px]' asChild><Link to={secondary.to}>{secondary.label}</Link></Button>}
      </div>
    </CardContent>
  </Card>
}

function CurrentMilestoneCard({ state }: { state: ExecutionDemoState }) {
  const milestone = state.milestones.find((item) => item.status !== 'complete')
  return <Card className='border-primary/10 p-0 shadow-sm'>
    <CardContent className='p-4'>
      <div className='flex items-center justify-between gap-2'><p className='text-xs font-semibold'>Current milestone</p>{milestone && <StatusBadge status={milestone.status} className='text-[9px]' />}</div>
      {milestone ? <>
        <p className='mt-2 line-clamp-2 text-sm font-semibold leading-5'>{milestone.title}</p>
        <div className='mt-2 flex items-center justify-between text-[10px] text-muted-foreground'><span>Progress</span><b className='text-primary'>{milestone.progress}%</b></div>
        <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${Math.min(100, Math.max(0, milestone.progress))}%` }} /></div>
        <Button variant='ghost' size='sm' className='mt-2 h-8 px-0 text-xs' asChild><Link to='/workspace'>Update milestone <ArrowRight /></Link></Button>
      </> : <div className='mt-2'><p className='text-xs leading-5 text-muted-foreground'>No active milestone yet.</p><Button variant='ghost' size='sm' className='mt-1 h-8 px-0 text-xs' asChild><Link to='/workspace'>Add milestone <ArrowRight /></Link></Button></div>}
    </CardContent>
  </Card>
}

function EvidenceStatusCard({ state }: { state: ExecutionDemoState }) {
  const records = state.evidence
  const verified = records.filter((item) => item.status === 'verified').length
  const priority = records.find((item) => item.status === 'needs_changes') ?? records.find((item) => item.status === 'pending') ?? records[0]
  return <Card className='border-primary/10 p-0 shadow-sm'>
    <CardContent className='p-4'>
      <div className='flex items-center justify-between gap-2'><p className='text-xs font-semibold'>Evidence status</p>{priority && <StatusBadge status={priority.status} className='text-[9px]' />}</div>
      <p className='mt-2 text-sm font-semibold'>{records.length} record{records.length === 1 ? '' : 's'} · {verified} verified</p>
      <p className='mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground'>{priority?.status === 'needs_changes' ? 'A record needs revision before it can support the milestone.' : priority?.status === 'pending' ? 'One record is waiting for an authorized review.' : 'Add evidence that supports the next decision.'}</p>
      <Button variant='ghost' size='sm' className='mt-2 h-8 px-0 text-xs' asChild><Link to='/workspace'>Upload evidence <ArrowRight /></Link></Button>
    </CardContent>
  </Card>
}

function FeedShortcutsCard({ data, onFilter }: { data: Snapshot; onFilter: (filter: FeedFilter) => void }) {
  return <Card className='overflow-hidden border-primary/10 bg-card/80 p-0 shadow-sm'>
    <CardContent className='grid gap-0.5 p-2'>
      <Button variant='ghost' size='sm' className='justify-start' onClick={() => onFilter('saved')}><Bookmark />Saved posts <Badge variant='secondary' className='ml-auto'>{data.posts.filter((post) => post.saved).length}</Badge></Button>
      <Button variant='ghost' size='sm' className='justify-start' asChild><Link to='/communities'><Users />My communities <Badge variant='secondary' className='ml-auto'>{data.communities.filter((community) => community.joined).length}</Badge></Link></Button>
      <Button variant='ghost' size='sm' className='justify-start' asChild><Link to='/events'><CalendarDays />Events</Link></Button>
    </CardContent>
  </Card>
}

function FeedLeftRail({ data, state, onFilter }: { data: Snapshot; state: ExecutionDemoState; onFilter: (filter: FeedFilter) => void }) {
  return <aside className='sticky top-20 hidden min-w-0 space-y-3 self-start xl:block'>
    <ProfileSummaryCard data={data} />
    <ContinueWorkingCard state={state} />
    <CurrentMilestoneCard state={state} />
    <EvidenceStatusCard state={state} />
    <FeedShortcutsCard data={data} onFilter={onFilter} />
  </aside>
}

type PersonRecommendation = {
  user: User
  suggestion?: SuggestedPerson
}

function peopleToMeet(data: Snapshot, limit = 4): PersonRecommendation[] {
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const available = data.users.filter((user) => user.id !== me?.id && !connectedIds.has(user.id))
  const curated: PersonRecommendation[] = dashboardPeopleToMeet
    .flatMap((suggestion) => {
      const user = available.find((candidate) => candidate.id === suggestion.userId)
      return user ? [{ user, suggestion }] : []
    })
  const curatedIds = new Set(curated.map((item) => item.user.id))
  const fallback = available.filter((user) => !curatedIds.has(user.id)).map((user) => ({ user }))
  return [...curated, ...fallback].slice(0, limit)
}

function PeopleToMeetCard({ data, compact = false }: { data: Snapshot; compact?: boolean }) {
  const people = peopleToMeet(data, compact ? 3 : 4)
  return (
    <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
      <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-3'>
          <div><CardTitle className='flex items-center gap-2 text-base'><Users className='size-4 text-primary' /> People to meet</CardTitle><CardDescription className='mt-1'>Curated for your stage and interests.</CardDescription></div>
          <Badge variant='secondary' className='text-[10px]'>For you</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-1 px-3 pb-4'>
        {people.map(({ user, suggestion }) => <PersonRow key={user.id} user={user} suggestion={suggestion} />)}
        {people.length === 0 && <p className='px-2 py-4 text-xs text-muted-foreground'>You are connected with every current recommendation.</p>}
      </CardContent>
    </Card>
  )
}

function EventRow({ event, data }: { event: DashboardEvent; data: Snapshot }) {
  const attendees = event.attendeeUserIds
    .map((id) => data.users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
  return (
    <Link to='/events' className='group flex gap-3 rounded-xl border border-border/70 bg-card/55 p-3 outline-none transition-all hover:border-primary/20 hover:bg-primary/[0.025] focus-visible:ring-2 focus-visible:ring-primary/50'>
      <div className='grid size-11 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/[0.06] text-center shadow-sm'>
        <span className='block text-[9px] font-bold uppercase leading-none tracking-wider text-primary'>{event.dateLabel.split(' ')[1]}</span>
        <span className='mt-0.5 block text-base font-extrabold leading-none'>{event.dateLabel.split(' ')[0]}</span>
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-[13px] font-semibold transition-colors group-hover:text-primary'>{event.title}</p>
        <p className='mt-1 flex items-center gap-1 text-[10px] text-muted-foreground'><Clock3 className='size-3' />{event.dayLabel} · {event.timeLabel}</p>
        <p className='mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground'>{event.format === 'Online' ? <Video className='size-3' /> : <MapPin className='size-3' />}{event.host} · {event.format}</p>
        <div className='mt-2 flex items-center gap-1.5'>
          <div className='flex -space-x-1.5' aria-hidden='true'>
            {attendees.slice(0, 3).map((user) => <UserAvatar key={user.id} user={user} className='size-5 border-2 border-card ring-0' />)}
          </div>
          <span className='text-[9px] font-medium text-muted-foreground'>{event.attendeeCount} attending</span>
          <span className='ml-auto truncate text-[9px] font-semibold text-primary'>{event.availabilityLabel}</span>
        </div>
      </div>
    </Link>
  )
}

function UpcomingEventsCard({ data }: { data: Snapshot }) {
  return (
    <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
      <div className='h-0.5 bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-transparent' />
      <CardHeader className='pb-2'><div className='flex items-center justify-between gap-2'><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-amber-500' /> Upcoming events</CardTitle><Button variant='ghost' size='sm' className='h-7 px-2 text-[11px]' asChild><Link to='/events'>View all</Link></Button></div></CardHeader>
      <CardContent className='space-y-2 px-4 pb-4'>
        {dashboardEvents.slice(0, 3).map((event) => <EventRow key={event.id} event={event} data={data} />)}
      </CardContent>
    </Card>
  )
}

function MentorSessionCompact({ state }: { state: ExecutionDemoState }) {
  const session = state.mentorSessions.find((item) => item.status === 'scheduled')
  return <Card className='border-primary/10 p-0 shadow-sm'>
    <CardContent className='p-4'>
      <div className='flex items-center justify-between gap-2'><p className='flex items-center gap-2 text-xs font-semibold'><GraduationCap className='size-4 text-primary' />Mentor session</p><StatusBadge status={session?.status ?? 'planned'} className='text-[9px]' /></div>
      {session ? <>
        <p className='mt-2 line-clamp-1 text-sm font-semibold'>{session.topic}</p>
        <div className='mt-2 flex items-center gap-2'>
          <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary'>{session.mentorName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <div className='min-w-0'><p className='truncate text-xs font-medium'>{session.mentorName}</p><p className='truncate text-[10px] text-muted-foreground'>{new Date(session.scheduledAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div>
        </div>
        <Button variant='ghost' size='sm' className='mt-2 h-8 px-0 text-xs' asChild><Link to='/mentorship'>Review details <ArrowRight /></Link></Button>
      </> : <div className='mt-2'><p className='text-xs leading-5 text-muted-foreground'>No mentor session is scheduled.</p><Button variant='ghost' size='sm' className='mt-1 h-8 px-0 text-xs' asChild><Link to='/mentorship'>Book mentor <ArrowRight /></Link></Button></div>}
    </CardContent>
  </Card>
}

const quickExecutionActions = [
  { label: 'Add milestone', to: '/workspace' as const, icon: Target },
  { label: 'Upload evidence', to: '/workspace' as const, icon: FileUp },
  { label: 'Find teammate', to: '/network' as const, icon: UserPlus },
  { label: 'Book mentor', to: '/mentorship' as const, icon: GraduationCap },
  { label: 'Apply to program', to: '/programs' as const, icon: CalendarDays },
] as const

function QuickActionsCompact() {
  return <Card className='border-primary/10 p-0 shadow-sm'>
    <CardHeader className='px-4 pb-2 pt-4'><CardTitle className='text-sm'>Quick actions</CardTitle></CardHeader>
    <CardContent className='grid grid-cols-2 gap-2 px-4 pb-4'>
      {quickExecutionActions.map(({ label, to, icon: Icon }) => <Button key={label} variant='outline' className='h-auto min-h-14 flex-col gap-1 whitespace-normal px-2 py-2 text-center text-[10px] leading-3' asChild><Link to={to}><Icon className='size-4 text-primary' />{label}</Link></Button>)}
      <Button variant='outline' className='h-auto min-h-14 flex-col gap-1 whitespace-normal px-2 py-2 text-center text-[10px] leading-3' asChild><a href='#feed-composer'><Sparkles className='size-4 text-primary' />Publish update</a></Button>
    </CardContent>
  </Card>
}

function WorkflowProgressCompact({ state }: { state: ExecutionDemoState }) {
  const workflow = [
    { label: 'Team', complete: state.memberships.length > 1 },
    { label: 'Milestone', complete: state.milestones.length > 0 },
    { label: 'Evidence', complete: state.evidence.length > 0 },
    { label: 'Mentor', complete: state.mentorSessions.length > 0 },
    { label: 'Program', complete: state.programApplications.length > 0 },
    { label: 'Investor', complete: state.introRequests.length > 0 },
  ]
  const active = workflow.filter((step) => step.complete).length
  return <Card className='border-primary/10 p-0 shadow-sm'>
    <CardHeader className='px-4 pb-2 pt-4'><div className='flex items-center justify-between gap-2'><CardTitle className='text-sm'>Workflow progress</CardTitle><Badge variant='secondary' className='text-[9px]'>{active} of 6 active</Badge></div></CardHeader>
    <CardContent className='px-4 pb-4'>
      <ol className='space-y-1'>
        {workflow.map((step, index) => <li key={step.label}><Link to='/workspace' className={cn('flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary', step.complete ? 'text-foreground' : 'text-muted-foreground')}><span className={cn('grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold', step.complete ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{step.complete ? <Check className='size-3' /> : index + 1}</span><span className='min-w-0 flex-1'>{step.label}</span><span className='text-[9px]'>{step.complete ? 'Active' : 'Next'}</span></Link></li>)}
      </ol>
    </CardContent>
  </Card>
}

function MobileWorkspaceSummary({ state }: { state: ExecutionDemoState }) {
  const milestone = state.milestones.find((item) => item.status !== 'complete')
  const pendingEvidence = state.evidence.filter((item) => item.status === 'pending' || item.status === 'needs_changes').length
  const nextSession = state.mentorSessions.find((item) => item.status === 'scheduled')
  return <details className='group scroll-mt-20 rounded-2xl border border-primary/15 bg-card/90 shadow-sm'>
    <summary className='flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
      <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Target className='size-4' /></span>
      <span className='min-w-0 flex-1'><span className='block text-sm font-semibold'>Your workspace</span><span className='block truncate text-xs text-muted-foreground'>{milestone ? `${milestone.title} · ${milestone.progress}%` : 'Create your first milestone'} · {pendingEvidence} evidence item{pendingEvidence === 1 ? '' : 's'} need attention</span></span>
      <ArrowRight className='size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90' />
    </summary>
    <div className='border-t px-4 py-4'>
      <div className='grid grid-cols-2 gap-2 text-xs'>
        <div className='rounded-xl bg-muted/35 p-3'><span className='text-muted-foreground'>Milestone</span><b className='mt-1 block'>{milestone?.progress ?? 0}% complete</b></div>
        <div className='rounded-xl bg-muted/35 p-3'><span className='text-muted-foreground'>Evidence</span><b className='mt-1 block'>{pendingEvidence} need attention</b></div>
      </div>
      <p className='mt-3 text-xs text-muted-foreground'>{nextSession ? `Next: ${nextSession.topic} with ${nextSession.mentorName}` : 'Next: review programs or book a mentor session.'}</p>
      <div className='mt-3 grid grid-cols-2 gap-2'>
        {quickExecutionActions.map(({ label, to, icon: Icon }) => <Button key={label} variant='outline' size='sm' className='justify-start px-2 text-[10px]' asChild><Link to={to}><Icon className='size-3.5' />{label}</Link></Button>)}
        <Button variant='outline' size='sm' className='justify-start px-2 text-[10px]' asChild>
          <Link to={state.selectedPersona === 'student' ? '/startups/new' : '/workspace'}><Rocket className='size-3.5' />{state.selectedPersona === 'student' ? 'Create startup' : 'Open workspace'}</Link>
        </Button>
      </div>
    </div>
  </details>
}

function MobileFeedContext({ data, state }: { data: Snapshot; state: ExecutionDemoState }) {
  return <div className='space-y-4 lg:hidden'>
    <MobileWorkspaceSummary state={state} />
    <section aria-labelledby='mobile-people-title'>
      <div className='mb-2 flex items-center justify-between gap-3 px-1'><h2 id='mobile-people-title' className='text-base font-bold'>People to meet</h2><Button variant='ghost' size='sm' asChild><Link to='/discover'>View all</Link></Button></div>
      <PeopleToMeetCard data={data} compact />
    </section>
    <UpcomingEventsCard data={data} />
  </div>
}

function TabletFeedRail({ data, state, onFilter }: { data: Snapshot; state: ExecutionDemoState; onFilter: (filter: FeedFilter) => void }) {
  return <aside className='sticky top-20 hidden min-w-0 space-y-3 self-start lg:block xl:hidden'>
    <ProfileSummaryCard data={data} compact />
    <ContinueWorkingCard state={state} />
    <PeopleToMeetCard data={data} compact />
    <CurrentMilestoneCard state={state} />
    <MentorSessionCompact state={state} />
    <QuickActionsCompact />
    <UpcomingEventsCard data={data} />
    <FeedShortcutsCard data={data} onFilter={onFilter} />
  </aside>
}

function FeedRightRail({ data }: { data: Snapshot }) {
  const { state } = useExecutionStore()
  return <aside className='sticky top-20 hidden min-w-0 space-y-3 self-start xl:block'>
    <PeopleToMeetCard data={data} />
    <MentorSessionCompact state={state} />
    <QuickActionsCompact />
    <WorkflowProgressCompact state={state} />
    <UpcomingEventsCard data={data} />
  </aside>
}

function PostAction({ icon: Icon, label, active, onClick }: { icon: typeof Heart; label: string; active?: boolean; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const likeAnim = useLikeAnimation()
  const bookmarkAnim = useBookmarkAnimation()
  const handleClick = () => {
    if (label === 'Like' && ref.current) likeAnim(ref.current)
    if (label === 'Save' && ref.current) bookmarkAnim(ref.current)
    onClick()
  }
  return (
    <Button
      ref={ref}
      variant='ghost'
      aria-label={label}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[13px] text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50',
        active && 'text-primary hover:text-primary'
      )}
      onClick={handleClick}
    >
      <Icon className={cn('size-4', active && 'fill-current')} />
      <span>{label}</span>
    </Button>
  )
}

function PersonRow({ user, suggestion }: { user: User; suggestion?: SuggestedPerson }) {
  const connect = useAction(() => apiClient.connect(user.id))
  return (
    <div className='group flex items-start gap-2.5 rounded-xl p-2.5 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/[0.045] hover:to-transparent'>
      <UserAvatar user={user} className='mt-0.5 size-11 ring-2 ring-transparent transition-all duration-200 group-hover:ring-primary/15' />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1'><b className='block truncate text-[13px]'>{user.name}</b>{user.verificationStatus === 'verified' && <BadgeCheck className='size-3.5 shrink-0 text-primary' aria-label='Verified member' />}</div>
        <span className='block truncate text-[11px] text-muted-foreground'>{user.title}</span>
        <span className='mt-0.5 block truncate text-[10px] font-semibold text-primary/90'>{suggestion?.matchLabel ?? (user.company || user.industry)}</span>
        {suggestion && <p className='mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground' title={suggestion.reason}>{suggestion.reason} · {suggestion.mutualConnections} mutual</p>}
      </div>
      <Button variant='outline' size='sm' className='mt-0.5 h-8 shrink-0 gap-1 border-primary/15 px-2 text-[10px]' onClick={() => connect.mutate()} disabled={connect.isPending} aria-label={`Connect with ${user.name}`}>
        <UserPlus className='size-3.5' /> Connect
      </Button>
    </div>
  )
}
