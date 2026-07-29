import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useStaggerCards, useLikeAnimation, useBookmarkAnimation } from '@/hooks/use-animations'
import { ArrowRight, BadgeCheck, Bookmark, BriefcaseBusiness, CalendarDays, Check, CircleDollarSign, CircleHelp, ClipboardCheck, Clock3, Hash, Heart, Link2, MapPin, MessageCircle, MessagesSquare, MoreHorizontal, Rocket, Send, Share2, Sparkles, TrendingUp, Trophy, UserPlus, Users, Video } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { PostKind, PostLink, Snapshot, User } from '@/data/types'
import { dashboardEvents, dashboardMetrics, dashboardNextSteps, dashboardQuickActions, mediaForPost, nextMentorSession, startupSummary } from '@/data/feed-dashboard-data'
import { MentorSessionCard, QuickActionsCard, StartupSummaryCard } from '@/components/feed'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PageContainer, PageLoading, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'

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
      <PageContainer className='relative z-10 grid items-start gap-5 xl:grid-cols-[250px_minmax(0,680px)_300px] 2xl:gap-6'>
        <FeedLeftRail data={data} onFilter={selectFilter} />
        <section ref={feedRef} className='min-w-0 space-y-4'>
          <MobileDashboardSummary data={data} />
          <div className='grid gap-3 md:grid-cols-2 xl:hidden'>
            <StartupSummaryCard startup={startupSummary} compact className='md:row-span-2' />
            <QuickActionsCard actions={dashboardQuickActions} compact />
            <MentorSessionCard session={nextMentorSession} />
          </div>
      <div className='flex items-end justify-between gap-4 px-1'>
        <div>
          <div className='mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary'>
            <span className='relative flex size-2'>
              <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-55' />
              <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
            </span>
            SSC community live
          </div>
          <h1 className='text-2xl font-bold tracking-tight sm:text-[28px]'>Founder activity</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Launches, traction and useful asks from the ecosystem.</p>
        </div>
        <Badge variant='outline' className='hidden shrink-0 border-primary/20 bg-primary/5 text-primary sm:inline-flex'>142 builders active</Badge>
      </div>
      <FeedComposer me={me} />
      <div className='flex flex-wrap gap-2'>
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => selectFilter(chip.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              filter === chip.key
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/25',
            )}
          >
            {chip.label}
            <span className={cn('rounded-full px-1.5 text-[10px]', filter === chip.key ? 'bg-primary/20' : 'bg-muted')}>{chip.count}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card className='border-dashed border-muted-foreground/25 py-16 text-center'>
          <CardContent><MessagesSquare className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No posts in this view</p><p className='mt-1 text-sm text-muted-foreground'>Try another filter or publish an update.</p></CardContent>
        </Card>
      ) : visiblePosts.map((post) => <div key={post.id} data-card><PostCard post={post} data={data} /></div>)}
      {visibleCount < filtered.length && (
        <Button variant='outline' className='h-11 w-full gap-2 border-primary/15 bg-card/70' onClick={() => setVisibleCount((count) => count + 4)}>
          Load more ecosystem updates <ArrowRight className='size-4' />
        </Button>
      )}
        </section>
        <FeedRightRail data={data} />
      </PageContainer>
    </div>
  )
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
  const Icon = KIND_META[kind].icon
  const quickActions: Array<{ kind: PostKind; label: string }> = [
    { kind: 'update', label: 'Update' },
    { kind: 'milestone', label: 'Milestone' },
    { kind: 'launch', label: 'Launch' },
    { kind: 'hiring', label: 'Hiring' },
    { kind: 'question', label: 'Feedback' },
  ]
  return (
    <Card id='feed-composer' className='glass-card scroll-mt-32 overflow-hidden border-primary/10 p-0 shadow-sm'>
      <div className={cn('h-1 bg-gradient-to-r', KIND_META[kind].grad)} />
      <CardContent className='p-4 sm:p-5'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div>
            <p className='text-sm font-semibold tracking-tight'>Share what moved forward</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>Updates are visible to verified SSC members.</p>
          </div>
          <Badge variant='secondary' className='hidden gap-1 text-[10px] sm:inline-flex'><Users className='size-3' /> Community</Badge>
        </div>
        <div className='flex items-start gap-3'>
          <UserAvatar user={me} className='size-11 ring-2 ring-primary/10' />
          <div className='min-w-0 flex-1'>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={me ? 'Share a launch, hiring need, milestone, pilot result or ask the community for feedback…' : 'Sign in to share with the community'}
              disabled={!me}
              className='min-h-[76px] resize-none rounded-xl border-border/70 bg-background/55 px-3 py-2.5 text-[15px] leading-relaxed shadow-none focus-visible:border-primary/30 focus-visible:ring-primary/10'
            />
            <div className='mt-2 flex flex-wrap gap-1.5' aria-label='Post type quick actions'>
              {quickActions.map((action) => {
                const M = KIND_META[action.kind]
                const active = kind === action.kind
                return (
                  <button
                    key={action.kind}
                    type='button'
                    onClick={() => { setKind(action.kind); setExpanded(true) }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      active ? M.badge : 'border-border/80 bg-card/70 text-muted-foreground hover:border-primary/20 hover:text-foreground',
                    )}
                  >
                    <M.icon className='size-3.5' /> {action.label}
                  </button>
                )
              })}
            </div>
            {expanded && (
              <div className='mt-3 space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3'>
                <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>Post details</p>
                <div className='flex flex-wrap gap-1.5'>
                  {(Object.keys(KIND_META) as PostKind[]).map((k) => {
                    const M = KIND_META[k]
                    const active = kind === k
                    return (
                      <button key={k} type='button' onClick={() => setKind(k)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all', active ? M.badge : 'border-border text-muted-foreground hover:text-foreground')}>
                        <M.icon className='size-3.5' /> {M.label}
                      </button>
                    )
                  })}
                </div>
                <div className='grid gap-2 sm:grid-cols-2'>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder='Tags: climate, mvp' className='h-9 bg-background/80 text-sm' />
                  <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder='Link URL (optional)' className='h-9 bg-background/80 text-sm' />
                </div>
                <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder='Link preview title (optional)' className='h-9 bg-background/80 text-sm' />
              </div>
            )}
          </div>
        </div>
        <div className='mt-3 flex items-center gap-2 border-t pt-3'>
          <Badge variant='outline' className={cn('gap-1', KIND_META[kind].badge)}><Icon className='size-3.5' /> {KIND_META[kind].label}</Badge>
          {parsedTags.length > 0 && parsedTags.slice(0, 3).map((t) => <Badge key={t} variant='secondary' className='gap-1 text-[10px]'><Hash className='size-3' />{t}</Badge>)}
          <Button className='ml-auto gap-1.5 px-4 shadow-sm' size='sm' disabled={!me || !content.trim() || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: reset })}>
            <Send className='size-4' /> Publish
          </Button>
        </div>
      </CardContent>
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

function MobileDashboardSummary({ data }: { data: Snapshot }) {
  const me = data.currentUser
  const event = dashboardEvents[0]
  return (
    <Card className='overflow-hidden border-primary/10 bg-card/85 p-0 shadow-sm xl:hidden'>
      <CardContent className='grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <UserAvatar user={me} className='size-12 ring-2 ring-primary/10' />
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'><p className='truncate text-sm font-semibold'>{me?.name ?? 'SSC member'}</p><BadgeCheck className='size-4 shrink-0 text-primary' aria-label='Verified member' /></div>
            <p className='truncate text-xs text-muted-foreground'>{me?.title ?? 'Student founder'}</p>
          </div>
          <Button variant='outline' size='sm' className='ml-auto shrink-0 sm:hidden' asChild><Link to='/profile'>Profile</Link></Button>
        </div>
        <Link to='/events' className='group flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/[0.045] px-3 py-2 outline-none transition-colors hover:bg-primary/[0.075] focus-visible:ring-2 focus-visible:ring-primary/50'>
          <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'><CalendarDays className='size-4' /></span>
          <span className='min-w-0'><span className='block text-[10px] font-bold uppercase tracking-wider text-primary'>Up next · {event.timeLabel}</span><span className='block truncate text-xs font-semibold'>{event.title}</span></span>
          <ArrowRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
        </Link>
      </CardContent>
    </Card>
  )
}

function FeedLeftRail({ data, onFilter }: { data: Snapshot; onFilter: (filter: FeedFilter) => void }) {
  const me = data.currentUser
  const completion = me ? Math.min(100, 45 + (me.skills ? 15 : 0) + (me.about ? 15 : 0) + (me.website ? 10 : 0) + (me.company ? 15 : 0)) : 0
  const [done, setDone] = useState<boolean[]>(dashboardNextSteps.map((step) => step.completed))
  const completedSteps = done.filter(Boolean).length
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <div className='relative h-20 overflow-hidden bg-gradient-to-br from-[#064e3b] via-primary/75 to-[#0f766e]'>
          <div className='absolute -right-6 -top-10 size-28 rounded-full border border-white/10' />
          <div className='absolute left-5 top-5 h-px w-28 bg-gradient-to-r from-white/35 to-transparent' />
        </div>
        <CardContent className='px-5 pb-5 text-center'>
          <UserAvatar user={me} className='mx-auto -mt-10 size-20 border-4 border-card shadow-md' />
          <div className='mt-3 flex items-center justify-center gap-1.5'>
            <h3 className='font-semibold tracking-tight'>{me?.name ?? 'Join SSC'}</h3>
            {me?.verificationStatus === 'verified' && <BadgeCheck className='size-4 text-primary' aria-label='Verified member' />}
          </div>
          <p className='mt-1 text-xs font-medium text-muted-foreground'>{me?.title ?? 'Build your founder identity'}</p>
          {me?.company && <Badge variant='secondary' className='mt-2 text-[10px]'>{me.company} · {me.location.split(',')[0]}</Badge>}
          <div className='mt-4 rounded-xl border border-border/70 bg-muted/25 p-3'>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground'><span>Profile completion</span><span className='font-bold text-primary'>{completion}%</span></div>
            <div className='mt-2 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-500' style={{ width: `${completion}%` }} /></div>
          </div>
          {me && <Button variant='outline' size='sm' className='mt-3 w-full border-primary/15' asChild><Link to='/profile'>View profile <ArrowRight className='size-3.5' /></Link></Button>}
        </CardContent>
      </Card>
      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <CardContent className='p-4'>
          <div className='mb-3 flex items-start justify-between gap-2'>
            <div><div className='flex items-center gap-2 text-sm font-semibold'><ClipboardCheck className='size-4 text-primary' /> Next steps</div><p className='mt-1 text-[11px] text-muted-foreground'>Build your founder momentum.</p></div>
            <Badge variant='secondary' className='text-[10px]'>{completedSteps}/{done.length}</Badge>
          </div>
          <div className='mb-3 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary transition-[width] duration-300' style={{ width: `${(completedSteps / done.length) * 100}%` }} /></div>
          <ul className='space-y-1'>
            {dashboardNextSteps.map((step, i) => (
              <li key={step.id}>
                <button
                  onClick={() => setDone((prev) => prev.map((value, index) => (index === i ? !value : value)))}
                  className='group flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                >
                  <span className={cn('mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors', done[i] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 group-hover:border-primary/50')}>
                    {done[i] && <Check className='size-3' />}
                  </span>
                  <span className='min-w-0'><span className={cn('block text-[12px] font-medium leading-4', done[i] && 'text-muted-foreground line-through')}>{step.title}</span><span className='mt-0.5 block text-[10px] leading-4 text-muted-foreground'>{step.description}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className='overflow-hidden border-primary/10 bg-card/80 p-0 shadow-sm'>
        <CardContent className='grid gap-1 p-3'>
          <Button variant='ghost' className='justify-start' onClick={() => onFilter('saved')}><Bookmark />Saved posts <Badge variant='secondary' className='ml-auto'>{data.posts.filter((post) => post.saved).length}</Badge></Button>
          <Button variant='ghost' className='justify-start' asChild><Link to='/communities'><Users />My communities <Badge variant='secondary' className='ml-auto'>{data.communities.filter((community) => community.joined).length}</Badge></Link></Button>
          <Button variant='ghost' className='justify-start' asChild><Link to='/events'><CalendarDays />Events <span className='ml-auto size-2 rounded-full bg-emerald-500' aria-label='New events available' /></Link></Button>
        </CardContent>
      </Card>
      <StartupSummaryCard startup={startupSummary} />
      <QuickActionsCard actions={dashboardQuickActions} />
      <MentorSessionCard session={nextMentorSession} />
    </aside>
  )
}

function FeedRightRail({ data }: { data: Snapshot }) {
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const people = data.users.filter((u) => u.id !== me?.id && !connectedIds.has(u.id)).slice(0, 4)
  const tagCounts = new Map<string, number>()
  data.posts.forEach((p) => (p.tags ?? []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)))
  const trending = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const trendColors = ['from-emerald-500/20 via-emerald-500/5 to-transparent', 'from-amber-500/20 via-amber-500/5 to-transparent', 'from-sky-500/20 via-sky-500/5 to-transparent', 'from-violet-500/20 via-violet-500/5 to-transparent']
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <div className='h-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent' />
        <CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><Users className='size-4 text-primary' /> People to meet</CardTitle><CardDescription>Curated for your stage and interests.</CardDescription></CardHeader>
        <CardContent className='space-y-1 px-3 pb-4'>{people.map((u) => <PersonRow key={u.id} user={u} />)}</CardContent>
      </Card>

      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <div className='h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent' />
        <CardHeader className='pb-2'><div className='flex items-center justify-between gap-2'><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-amber-500' /> Upcoming events</CardTitle><Button variant='ghost' size='sm' className='h-7 px-2 text-[11px]' asChild><Link to='/events'>View all</Link></Button></div></CardHeader>
        <CardContent className='space-y-2 px-4 pb-4'>
          {dashboardEvents.slice(0, 3).map((event) => (
            <Link key={event.id} to='/events' className='group flex gap-3 rounded-xl border border-border/70 bg-card/55 p-3 outline-none transition-all hover:border-primary/20 hover:bg-primary/[0.025] focus-visible:ring-2 focus-visible:ring-primary/50'>
              <div className='grid size-11 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/[0.06] text-center'>
                <span className='block text-[9px] font-bold uppercase leading-none tracking-wider text-primary'>{event.dateLabel.split(' ')[1]}</span>
                <span className='mt-0.5 block text-base font-extrabold leading-none'>{event.dateLabel.split(' ')[0]}</span>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-[13px] font-semibold transition-colors group-hover:text-primary'>{event.title}</p>
                <p className='mt-1 flex items-center gap-1 text-[10px] text-muted-foreground'><Clock3 className='size-3' />{event.dayLabel} · {event.timeLabel}</p>
                <p className='mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground'>{event.format === 'Online' ? <Video className='size-3' /> : <MapPin className='size-3' />}{event.host} · {event.format}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <div className='h-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><Sparkles className='size-4 text-primary' /> Trending topics</CardTitle></CardHeader>
        <CardContent className='space-y-1 text-sm'>
          {trending.length === 0 && <p className='px-2 py-3 text-xs text-muted-foreground'>No tags yet — publish a tagged update.</p>}
          {trending.map(([tag, count], i) => (
            <div key={tag}>
              <Trend icon={<Hash className='size-3.5 text-primary' />} title={tag} posts={`${count} post${count === 1 ? '' : 's'}`} color={trendColors[i % trendColors.length]} />
              {i < trending.length - 1 && <div className='mx-2 h-px bg-gradient-to-r from-primary/10 to-transparent' />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='glass-card overflow-hidden border-primary/10 p-0 shadow-sm'>
        <div className='h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent' />
        <CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><TrendingUp className='size-4 text-emerald-500' /> Ecosystem pulse</CardTitle><CardDescription className='flex items-center gap-1 text-[11px]'><span className='relative flex size-1.5'><span className='absolute inline-flex size-1.5 animate-ping rounded-full bg-emerald-500 opacity-70' /><span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' /></span> Live this week</CardDescription></CardHeader>
        <CardContent className='grid grid-cols-3 gap-2 pt-1 text-center'>
          {dashboardMetrics.map((metric) => (
            <div key={metric.label} className='rounded-xl border border-border/60 bg-card/55 p-2.5'><div className='text-lg font-extrabold tracking-tight text-foreground'>{metric.value}</div><div className='text-[10px] leading-4 text-muted-foreground'>{metric.label}</div></div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
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

function Trend({ icon, title, posts, color }: { icon?: React.ReactNode; title: string; posts: string; color?: string }) {
  return (
    <div className='group cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-muted/50'>
      <div className='flex items-center gap-2'>
        {icon && (
          <span className={cn(
            'grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br',
            color || 'from-primary/20 to-primary/5'
          )}>
            {icon}
          </span>
        )}
        <p className='font-medium text-sm group-hover:text-primary transition-colors'>{title}</p>
      </div>
      <p className='text-xs text-muted-foreground mt-1 ml-9'>{posts}</p>
    </div>
  )
}

function PersonRow({ user }: { user: User }) {
  const connect = useAction(() => apiClient.connect(user.id))
  return (
    <div className='group flex items-center gap-2.5 rounded-xl p-2.5 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/[0.045] hover:to-transparent'>
      <UserAvatar user={user} className='size-11 ring-2 ring-transparent transition-all duration-200 group-hover:ring-primary/15' />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1'><b className='block truncate text-[13px]'>{user.name}</b>{user.verificationStatus === 'verified' && <BadgeCheck className='size-3.5 shrink-0 text-primary' aria-label='Verified member' />}</div>
        <span className='block truncate text-[11px] text-muted-foreground'>{user.title}</span>
        <span className='mt-0.5 block truncate text-[10px] font-medium text-primary/80'>{user.company || user.industry}</span>
      </div>
      <Button variant='outline' size='sm' className='h-8 shrink-0 gap-1 border-primary/15 px-2 text-[10px]' onClick={() => connect.mutate()} disabled={connect.isPending} aria-label={`Connect with ${user.name}`}>
        <UserPlus className='size-3.5' /> Connect
      </Button>
    </div>
  )
}
