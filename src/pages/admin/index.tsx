import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BadgeCheck, Check, Flag, GraduationCap, MessageCircle, LayoutDashboard, Rocket, Search, ShieldCheck, Trophy, Users, X } from 'lucide-react'
import { apiClient } from '@/data/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeading, ProfileInfo } from '@/app/app-shared'
import { snapshotKey, useSnapshot } from '@/app/app-data'
import { mentors, startups, type MentorData } from '@/data/platform-content'
import type { EntityId } from '@/data/types'

type AdminTab = 'overview' | 'startups' | 'mentors' | 'verification' | 'moderation'

const ADMIN_TABS: { key: AdminTab; label: string; icon: typeof ShieldCheck }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'startups', label: 'Startups', icon: Rocket },
  { key: 'mentors', label: 'Mentors', icon: GraduationCap },
  { key: 'verification', label: 'Verification', icon: ShieldCheck },
  { key: 'moderation', label: 'Moderation', icon: Flag },
]

export function AdminPage() {
  const { data } = useSnapshot()
  const [tab, setTab] = useState<AdminTab>('overview')

  const [verified, setVerified] = useState<Set<string>>(new Set(['greenstack', 'mediroute']))
  const [featured, setFeatured] = useState<Set<string>>(new Set(['greenstack']))
  const [suspended, setSuspended] = useState<Set<string>>(new Set())
  const [startupQuery, setStartupQuery] = useState('')
  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, slug: string, label: string) => {
    setter((prev) => {
      const next = new Set(prev)
      const on = !next.has(slug)
      if (on) next.add(slug); else next.delete(slug)
      toast.success(`${label} ${on ? 'enabled' : 'disabled'}`)
      return next
    })
  }

  const [mentorStatus, setMentorStatus] = useState<Record<EntityId, MentorData['status']>>(() => Object.fromEntries(mentors.map((m) => [m.id, m.status])))
  const setMentor = (id: EntityId, status: MentorData['status']) => { setMentorStatus((p) => ({ ...p, [id]: status })); toast.success(`Mentor ${status}`) }

  const pendingVerifications = [
    { id: 101, name: 'Emin Qarayev', uni: 'Baku State University', program: 'Computer Science', method: '.edu email' },
    { id: 102, name: 'Sona Ibrahimli', uni: 'ADA University', program: 'Economics', method: 'Student ID' },
    { id: 103, name: 'Ramin Sadigli', uni: 'UNEC', program: 'Business', method: 'FIN-based' },
    { id: 104, name: 'Lala Mammadli', uni: 'Khazar University', program: 'Design', method: '.edu email' },
  ]
  const [decided, setDecided] = useState<Record<number, 'approved' | 'rejected'>>({})

  const [flagged, setFlagged] = useState<Set<EntityId>>(new Set(['pst_2', 'pst_6']))
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: (id: EntityId) => apiClient.deletePost(id),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: snapshotKey }); toast.success('Post removed') },
  })

  const stats = data
    ? [
        { label: 'Verified users', value: data.users.length, icon: Users, tone: 'text-primary' },
        { label: 'Active startups', value: startups.length, icon: Rocket, tone: 'text-emerald-500' },
        { label: 'Mentors', value: mentors.length, icon: GraduationCap, tone: 'text-amber-500' },
        { label: 'Posts', value: data.posts.length, icon: MessageCircle, tone: 'text-sky-500' },
      ]
    : []

  return <PageContainer>
    <PageHeading eyebrow='Admin control tower' title='Operate a trusted, measurable ecosystem.' description='Manage verification, startup quality, mentor capacity, and moderation — every action is auditable.' />
    <div className='mb-6 flex flex-wrap gap-2'>
      {ADMIN_TABS.map((t) => (
        <button key={t.key} onClick={() => setTab(t.key)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all', tab === t.key ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/25')}>
          <t.icon className='size-3.5' /> {t.label}
        </button>
      ))}
    </div>

    {tab === 'overview' && (
      <>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>{stats.map((s) => (
          <Card key={s.label} className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'>
            <span className={cn('grid size-10 place-items-center rounded-xl bg-muted/60', s.tone)}><s.icon className='size-5' /></span>
            <div><CardDescription>{s.label}</CardDescription><CardTitle className='text-2xl'>{s.value}</CardTitle></div>
          </CardHeader></Card>
        ))}</div>
        <div className='mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]'>
          <Card className='glass-card'><CardHeader><CardTitle>Ecosystem health</CardTitle><CardDescription>Current cohort operating signals.</CardDescription></CardHeader>
            <CardContent className='space-y-4'>
              <ProfileInfo label='Mentor utilization' value='72%' />
              <ProfileInfo label='Application conversion' value='34%' />
              <ProfileInfo label='Flagged incidents' value={String(flagged.size)} />
              <ProfileInfo label='Pending verifications' value={String(Object.values(decided).filter((d) => d).length ? pendingVerifications.length - Object.keys(decided).length : pendingVerifications.length)} />
            </CardContent>
          </Card>
          <Card className='glass-card'><CardHeader><CardTitle>Priority queues</CardTitle><CardDescription>High-frequency approvals.</CardDescription></CardHeader>
            <CardContent className='space-y-2'>
              {[{ label: 'Student verifications', value: pendingVerifications.length - Object.keys(decided).length }, { label: 'Startup approvals', value: startups.filter((s) => !verified.has(s.slug)).length }, { label: 'Mentor applications', value: mentors.filter((m) => mentorStatus[m.id] === 'pending').length }, { label: 'Moderation alerts', value: flagged.size }].map((q) => (
                <button key={q.label} onClick={() => setTab(q.label.includes('Student') ? 'verification' : q.label.includes('Startup') ? 'startups' : q.label.includes('Mentor') ? 'mentors' : 'moderation')} className='flex w-full items-center rounded-xl border p-3 text-left transition-colors hover:bg-muted/50'>
                  <span className='grid size-8 place-items-center rounded-lg bg-primary/10 text-primary'><ShieldCheck className='size-4' /></span>
                  <b className='ml-3 block text-sm'>{q.label}</b><Badge variant='secondary' className='ml-auto'>{q.value}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </>
    )}

    {tab === 'startups' && (
      <>
        <div className='mb-4'><div className='relative max-w-md'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-9' value={startupQuery} onChange={(e) => setStartupQuery(e.target.value)} placeholder='Search startups by name, sector, stage' /></div></div>
        <div className='space-y-3'>
          {startups.filter((s) => `${s.name} ${s.sector} ${s.stage}`.toLowerCase().includes(startupQuery.toLowerCase())).map((s) => {
            const isVerified = verified.has(s.slug), isFeatured = featured.has(s.slug), isSuspended = suspended.has(s.slug)
            return (
              <Card key={s.slug} className={cn('glass-card', isSuspended && 'opacity-60')}>
                <CardContent className='flex flex-col gap-3 p-4 md:flex-row md:items-center'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Rocket className='size-5' /></span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{s.name}</b><Badge variant='outline'>{s.sector}</Badge><Badge variant='secondary'>{s.stage}</Badge>{isVerified && <Badge className='gap-1 bg-emerald-500/15 text-emerald-500 border-emerald-500/30'><BadgeCheck className='size-3' />Verified</Badge>}{isFeatured && <Badge className='gap-1 bg-amber-500/15 text-amber-500 border-amber-500/30'><Trophy className='size-3' />Featured</Badge>}{isSuspended && <Badge variant='destructive'>Suspended</Badge>}</div>
                    <div className='mt-2 flex items-center gap-2'><div className='h-1.5 w-32 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${s.score}%` }} /></div><span className='text-xs text-muted-foreground'>{s.score}% ready · {s.roles}</span></div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm' variant={isVerified ? 'outline' : 'default'} onClick={() => toggleSet(setVerified, s.slug, 'Verification')}><BadgeCheck className='size-3.5' />{isVerified ? 'Verified' : 'Verify'}</Button>
                    <Button size='sm' variant={isFeatured ? 'outline' : 'secondary'} onClick={() => toggleSet(setFeatured, s.slug, 'Featured')}><Trophy className='size-3.5' />{isFeatured ? 'Featured' : 'Feature'}</Button>
                    <Button size='sm' variant={isSuspended ? 'destructive' : 'ghost'} onClick={() => toggleSet(setSuspended, s.slug, 'Suspend')}><X className='size-3.5' />{isSuspended ? 'Unsuspend' : 'Suspend'}</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </>
    )}

    {tab === 'mentors' && (
      <div className='grid gap-4 md:grid-cols-2'>
        {mentors.map((m) => {
          const status = mentorStatus[m.id] ?? m.status
          return (
            <Card key={m.id} className={cn('glass-card', status === 'suspended' && 'opacity-60')}>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500'><GraduationCap className='size-5' /></span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{m.name}</b><Badge variant='outline'>{m.focusStage}</Badge></div>
                    <p className='text-xs text-muted-foreground'>{m.title}</p>
                    <div className='mt-2 flex flex-wrap gap-1'>{m.expertise.map((e) => <Badge key={e} variant='secondary' className='text-[10px]'>{e}</Badge>)}</div>
                    <p className='mt-2 text-[11px] text-muted-foreground'>★ {m.rating.toFixed(1)} · {m.sessions} sessions · {m.availability}</p>
                  </div>
                  <Badge variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>{status}</Badge>
                </div>
                <div className='mt-3 flex gap-2'>
                  {status !== 'active' && <Button size='sm' onClick={() => setMentor(m.id, 'active')}><Check className='size-3.5' />Approve</Button>}
                  {status === 'active' && <Button size='sm' variant='outline' onClick={() => setMentor(m.id, 'suspended')}><X className='size-3.5' />Suspend</Button>}
                  {status === 'suspended' && <Button size='sm' variant='outline' onClick={() => setMentor(m.id, 'active')}><Check className='size-3.5' />Reactivate</Button>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {tab === 'verification' && (
      <div className='space-y-3'>
        {pendingVerifications.map((v) => {
          const d = decided[v.id]
          return (
            <Card key={v.id} className={cn('glass-card', d && 'opacity-60')}>
              <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'>
                <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><ShieldCheck className='size-5' /></span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{v.name}</b>{d && <Badge variant={d === 'approved' ? 'default' : 'destructive'}>{d}</Badge>}</div>
                  <p className='text-xs text-muted-foreground'>{v.uni} · {v.program} · verified via {v.method}</p>
                </div>
                {!d ? (
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={() => { setDecided((p) => ({ ...p, [v.id]: 'approved' })); toast.success(`${v.name} verified`) }}><Check className='size-3.5' />Approve</Button>
                    <Button size='sm' variant='outline' onClick={() => { setDecided((p) => ({ ...p, [v.id]: 'rejected' })); toast.info(`${v.name} rejected`) }}><X className='size-3.5' />Reject</Button>
                  </div>
                ) : <span className='text-xs text-muted-foreground'>Decided</span>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {tab === 'moderation' && data && (
      <div className='space-y-3'>
        {data.posts.filter((p) => flagged.has(p.id)).map((p) => {
          const author = data.users.find((u) => u.id === p.authorId)
          return (
            <Card key={p.id} className='glass-card border-amber-500/30'>
              <CardContent className='flex flex-col gap-3 p-4'>
                <div className='flex items-center gap-2'><Badge variant='outline' className='gap-1 border-amber-500/40 text-amber-500'><Flag className='size-3' />Flagged</Badge><b className='text-sm'>{author?.name}</b><span className='text-xs text-muted-foreground'>· {p.type}</span></div>
                <p className='line-clamp-2 text-sm text-muted-foreground'>{p.content}</p>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline' onClick={() => { setFlagged((prev) => { const n = new Set(prev); n.delete(p.id); return n }); toast.info('Flag dismissed') }}><Check className='size-3.5' />Dismiss flag</Button>
                  <Button size='sm' variant='destructive' onClick={() => { remove.mutate(p.id); setFlagged((prev) => { const n = new Set(prev); n.delete(p.id); return n }) }}><X className='size-3.5' />Remove post</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {data.posts.filter((p) => flagged.has(p.id)).length === 0 && <Card className='border-dashed'><CardContent className='py-16 text-center'><Check className='mx-auto mb-3 size-10 text-emerald-500' /><p className='font-medium'>No flagged posts</p><p className='text-sm text-muted-foreground'>Moderation queue is clear.</p></CardContent></Card>}
      </div>
    )}
  </PageContainer>
}
