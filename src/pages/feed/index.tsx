import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useStaggerCards, useLikeAnimation, useBookmarkAnimation } from '@/hooks/use-animations'
import { BadgeCheck, Bookmark, BriefcaseBusiness, CalendarDays, Check, CircleDollarSign, CircleHelp, ClipboardCheck, Hash, Heart, Link2, MessageCircle, MessagesSquare, MoreHorizontal, Plus, Rocket, Send, Share2, Sparkles, TrendingUp, Trophy, Users } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { PostKind, PostLink, Snapshot, User } from '@/data/types'
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
}

function postKind(post: Snapshot['posts'][number]): PostKind {
  const fromType = post.type?.toLowerCase()
  const map: Record<string, PostKind> = { update: 'update', milestone: 'milestone', raise: 'raise', hiring: 'hiring', launch: 'launch', question: 'question' }
  return post.kind ?? map[fromType ?? ''] ?? 'update'
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FeedPage() {
  const { data } = useSnapshot()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const feedRef = useRef<HTMLDivElement>(null)
  useStaggerCards(feedRef, [data, filter])
  if (!data) return <PageLoading />
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const kinds: PostKind[] = ['update', 'milestone', 'hiring', 'launch']

  const filtered = data.posts.filter((post) => {
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

  return <PageContainer className='grid gap-6 xl:grid-cols-[260px_minmax(0,650px)_300px]'>
    <FeedLeftRail data={data} onFilter={setFilter} />
    <section ref={feedRef} className='min-w-0 space-y-4'>
      <FeedComposer me={me} />
      <div className='flex flex-wrap gap-2'>
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
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
      ) : filtered.map((post) => <div key={post.id} data-card><PostCard post={post} data={data} /></div>)}
    </section>
    <FeedRightRail data={data} />
  </PageContainer>
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
  return (
    <Card className='glass-card overflow-hidden p-0'>
      <div className={cn('h-0.5 bg-gradient-to-r', KIND_META[kind].grad)} />
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          <UserAvatar user={me} />
          <div className='min-w-0 flex-1'>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={me ? 'Share a milestone, raise, launch, hiring note, or ask for feedback…' : 'Sign in to share with the community'}
              disabled={!me}
              className='min-h-[56px] resize-none bg-transparent shadow-none focus-visible:ring-0 border-0 px-0 text-[15px]'
            />
            {expanded && (
              <div className='mt-2 space-y-2'>
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
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder='Tags, comma-separated (climate, mvp)' className='h-9 bg-muted/40 text-sm' />
                  <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder='Link URL (optional)' className='h-9 bg-muted/40 text-sm' />
                </div>
                <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder='Link preview title (optional)' className='h-9 bg-muted/40 text-sm' />
              </div>
            )}
          </div>
        </div>
        <div className='mt-3 flex items-center gap-2 border-t pt-3'>
          <Badge variant='outline' className={cn('gap-1', KIND_META[kind].badge)}><Icon className='size-3.5' /> {KIND_META[kind].label}</Badge>
          {parsedTags.length > 0 && parsedTags.slice(0, 3).map((t) => <Badge key={t} variant='secondary' className='gap-1 text-[10px]'><Hash className='size-3' />{t}</Badge>)}
          <Button className='ml-auto gap-1.5' size='sm' disabled={!me || !content.trim() || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: reset })}>
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
  return (
    <Card className='group overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 hover:shadow-md'>
      <div className={cn('h-0.5 bg-gradient-to-r opacity-70 transition-opacity duration-300 group-hover:opacity-100', meta.grad)} />
      <CardHeader className='flex-row items-start gap-3 pb-2'>
        <UserAvatar user={author} className='ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/15' />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <CardTitle className='text-[15px] tracking-tight'>{author?.name}</CardTitle>
            <Badge variant='outline' className={cn('gap-1 border text-[10px] font-semibold uppercase tracking-wider', meta.badge)}><Icon className='size-3' />{meta.label}</Badge>
          </div>
          <CardDescription className='flex items-center gap-1.5 text-xs'>
            <span className='truncate'>{author?.title}</span>
            <span className='text-[10px]'>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </CardDescription>
        </div>
        {data.currentUser?.role === 'admin' && <Button className='ml-auto' variant='ghost' size='icon' onClick={() => remove.mutate()} aria-label='Delete post'><MoreHorizontal /></Button>}
      </CardHeader>
      <CardContent>
        <p className='whitespace-pre-wrap text-[15px] leading-relaxed text-balance'>{post.content}</p>
        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {tags.map((tag) => <span key={tag} className='inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground'><Hash className='size-2.5' />{tag}</span>)}
          </div>
        )}
        {post.link?.url && /^https?:\/\//i.test(post.link.url) ? (
          <a href={post.link.url} target='_blank' rel='noreferrer' className='mt-4 block overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-sm'>
            <div className={cn('mb-3 h-1 w-12 rounded-full bg-gradient-to-r', meta.grad)} />
            <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'><Link2 className='size-3.5' />{post.link.url}</div>
            <h3 className='mt-2 font-semibold tracking-tight'>{post.link.title}</h3>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{post.link.subtitle}</p>
          </a>
        ) : (post.link || post.previewTitle) && (
          <div className='mt-4 overflow-hidden rounded-xl border bg-gradient-to-br p-4'>
            <div className={cn('mb-3 h-1 w-12 rounded-full bg-gradient-to-r', meta.grad)} />
            <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'><Link2 className='size-3.5' />Shared context</div>
            <h3 className='mt-2 font-semibold tracking-tight'>{post.link?.title ?? post.previewTitle}</h3>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{post.link?.subtitle ?? post.previewSubtitle}</p>
          </div>
        )}
        <div className='mt-4 flex gap-5 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1.5'><Heart className={cn('size-3.5', post.liked && 'text-primary')} /> {post.reactions}</span>
          <span className='flex items-center gap-1.5'><MessageCircle className='size-3.5' /> {post.comments}</span>
          <span className='flex items-center gap-1.5'><Share2 className='size-3.5' /> {post.reposts}</span>
        </div>
      </CardContent>
      <CardFooter className='grid grid-cols-4 border-t px-1 pt-1'>
        <PostAction active={post.liked} icon={Heart} label='Like' onClick={() => react.mutate()} />
        <PostAction icon={MessageCircle} label='Comment' onClick={() => setShowThread((v) => !v)} />
        <PostAction icon={Share2} label='Repost' onClick={() => repost.mutate()} />
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

function FeedLeftRail({ data, onFilter }: { data: Snapshot; onFilter: (filter: FeedFilter) => void }) {
  const me = data.currentUser
  const completion = me ? Math.min(100, 45 + (me.skills ? 15 : 0) + (me.about ? 15 : 0) + (me.website ? 10 : 0) + (me.company ? 15 : 0)) : 0
  const steps = ['Add your startup', 'Book a mentor session', 'Publish your first update']
  const [done, setDone] = useState<boolean[]>([false, false, false])
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-14 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
        <CardContent className='px-5 pb-5 text-center'>
          <UserAvatar user={me} className='mx-auto -mt-8 size-16 border-4 border-card' />
          <div className='mt-3 flex items-center justify-center gap-1.5'>
            <h3 className='font-semibold'>{me?.name ?? 'Join SSC'}</h3>
            {me?.verificationStatus === 'verified' && <BadgeCheck className='size-4 text-primary' aria-label='Verified member' />}
          </div>
          <p className='mt-0.5 text-xs text-muted-foreground'>{me?.title ?? 'Build your founder identity'}</p>
          <div className='mt-4'>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground'><span>Profile completion</span><span className='font-semibold text-foreground'>{completion}%</span></div>
            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--primary)_55%,var(--accent))]' style={{ width: `${completion}%` }} /></div>
          </div>
          {me && <Button variant='outline' size='sm' className='mt-4 w-full' asChild><Link to='/profile'>View profile</Link></Button>}
        </CardContent>
      </Card>
      <Card className='glass-card overflow-hidden p-0'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold'><ClipboardCheck className='size-4 text-primary' /> Next steps</div>
          <ul className='space-y-1'>
            {steps.map((step, i) => (
              <li key={step}>
                <button onClick={() => setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))} className='flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-muted/60'>
                  <span className={cn('grid size-4 shrink-0 place-items-center rounded-full border', done[i] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40')}>
                    {done[i] && <Check className='size-3' />}
                  </span>
                  <span className={cn(done[i] && 'text-muted-foreground line-through')}>{step}</span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className='overflow-hidden border-primary/5 p-0'>
        <CardContent className='grid gap-1 p-3'>
          <Button variant='ghost' className='justify-start' onClick={() => onFilter('saved')}><Bookmark />Saved posts</Button>
          <Button variant='ghost' className='justify-start' asChild><Link to='/communities'><Users />My communities</Link></Button>
          <Button variant='ghost' className='justify-start' asChild><Link to='/events'><CalendarDays />Events</Link></Button>
        </CardContent>
      </Card>
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
  const events = [
    { title: 'Founder Office Hours', date: 'Thu · 6:00 PM', host: 'Tarlan Y.' },
    { title: 'Demo Day Prep Workshop', date: 'Sat · 11:00 AM', host: 'SSC Programs' },
  ]
  const trendColors = ['from-emerald-500/20 via-emerald-500/5 to-transparent', 'from-amber-500/20 via-amber-500/5 to-transparent', 'from-sky-500/20 via-sky-500/5 to-transparent', 'from-violet-500/20 via-violet-500/5 to-transparent']
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><Users className='size-4 text-primary' /> People to meet</CardTitle></CardHeader>
        <CardContent className='space-y-1'>{people.map((u) => <PersonRow key={u.id} user={u} />)}</CardContent>
      </Card>

      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-amber-500' /> Upcoming events</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {events.map((ev) => (
            <div key={ev.title} className='rounded-xl border border-border/70 bg-card/50 p-3'>
              <div className='flex items-center justify-between gap-2'><b className='text-sm'>{ev.title}</b></div>
              <div className='mt-1 flex items-center justify-between text-[11px] text-muted-foreground'><span>{ev.date}</span><span>{ev.host}</span></div>
              <Button variant='outline' size='sm' className='mt-2 w-full' asChild><Link to='/events'>View event calendar</Link></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='glass-card overflow-hidden p-0'>
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

      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent' />
        <CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><TrendingUp className='size-4 text-emerald-500' /> Ecosystem pulse</CardTitle><CardDescription className='flex items-center gap-1 text-[11px]'><span className='relative flex size-1.5'><span className='absolute inline-flex size-1.5 animate-ping rounded-full bg-emerald-500 opacity-70' /><span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' /></span> Live this week</CardDescription></CardHeader>
        <CardContent className='grid grid-cols-3 gap-2 pt-1 text-center'>
          {[{ v: '142', l: 'Active builders' }, { v: '9', l: 'New startups' }, { v: '45', l: 'Mentors' }].map((s) => (
            <div key={s.l} className='rounded-xl bg-card/50 p-2.5'><div className='text-lg font-extrabold tracking-tight text-foreground'>{s.v}</div><div className='text-[10px] text-muted-foreground'>{s.l}</div></div>
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
    <div className='group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/[0.03] hover:to-transparent'>
      <UserAvatar user={user} className='size-10 ring-2 ring-transparent transition-all duration-200 group-hover:ring-primary/15' />
      <div className='min-w-0 flex-1 text-sm'>
        <b className='block truncate'>{user.name}</b>
        <span className='text-xs text-muted-foreground truncate block'>{user.title}</span>
      </div>
      <Button variant='ghost' size='icon' className='size-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100' onClick={() => connect.mutate()}>
        <Plus className='size-4' />
      </Button>
    </div>
  )
}
