import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Info,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { DemoDataBadge, EmptyState, ResponsiveDialog, StatusBadge } from '@/components/execution-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnapshot } from '@/app/app-data'
import { startups as staticStartups } from '@/data/platform-content'
import { MatchWorkbench } from '@/features/assistant/match-workbench'
import { useExecutionStore } from '@/features/execution/store'
import type { OpenRole } from '@/features/execution/types'
import { StartupWorkspace } from '@/pages/workspace'
import { cn } from '@/lib/utils'

export function StartupsPage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const { state, store } = useExecutionStore()
  const [savedOnly, setSavedOnly] = useState(false)
  if (!data) return <PageLoading />
  const startups = data.startups?.length ? data.startups : staticStartups
  const visible = savedOnly ? startups.filter((startup) => state.watchlist.includes(startup.slug)) : startups
  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Sample startup records' /></div>
    <PageHeading eyebrow='Startups' title='Find a team—or operate the one you joined.' description='Review teams, open roles, milestones, evidence, mentorship, and program activity in one execution model.' />
    <MatchWorkbench snapshot={data} mode='teammate' />
    <div className='mb-6 flex flex-wrap gap-2'><Button asChild><Link to='/startups/new'><Plus />Create startup</Link></Button><Button variant='outline' asChild><Link to='/jobs'><Search />Browse roles</Link></Button><Button variant={savedOnly ? 'default' : 'outline'} onClick={() => setSavedOnly((value) => !value)}><Bookmark className={savedOnly ? 'fill-current' : ''} />Watchlist ({state.watchlist.length})</Button></div>
    {state.startupDrafts.length > 0 && !savedOnly && <section className='mb-8'><h2 className='text-lg font-bold'>Your migrated drafts</h2><p className='mb-3 text-sm text-muted-foreground'>Preserved from the previous browser workspace.</p><div className='grid gap-3 md:grid-cols-2'>{state.startupDrafts.map((draft) => <Card key={`${draft.name}-${draft.createdAt}`} className='border-dashed'><CardHeader><DemoDataBadge label='Local draft' /><CardTitle>{draft.name}</CardTitle><CardDescription>{draft.sector} · {draft.stage}</CardDescription></CardHeader><CardContent><p className='text-sm text-muted-foreground'>{draft.problem}</p></CardContent></Card>)}</div></section>}
    {visible.length ? <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{visible.map((startup) => {
      const watched = state.watchlist.includes(startup.slug)
      const milestones = state.milestones.filter((item) => item.startupSlug === startup.slug)
      const verified = state.evidence.filter((item) => item.startupSlug === startup.slug && item.status === 'verified').length
      return <Card key={startup.slug} className='overflow-hidden'><CardHeader><div className='flex items-center justify-between gap-2'><Badge>{startup.stage}</Badge><Button variant='ghost' size='icon' aria-label={watched ? `Remove ${startup.name} from watchlist` : `Watch ${startup.name}`} onClick={() => store.toggleWatch(startup.slug)}><Bookmark className={watched ? 'fill-current text-primary' : ''} /></Button></div><CardTitle className='pt-2'>{startup.name}</CardTitle><CardDescription>{startup.sector} · {startup.location}</CardDescription></CardHeader><CardContent><p className='line-clamp-3 text-sm leading-6 text-muted-foreground'>{startup.summary}</p><div className='mt-4 grid grid-cols-3 gap-2 text-center'><MiniSignal label='Readiness' value={`${Math.max(0, Math.min(100, startup.score))}%`} /><MiniSignal label='Milestones' value={String(milestones.length || startup.milestones.length)} /><MiniSignal label='Evidence' value={String(verified)} /></div></CardContent><CardFooter className='border-t'><Button className='w-full justify-between' variant='ghost' onClick={() => navigate({ to: '/startups/$slug', params: { slug: startup.slug } })}>Open workspace <ChevronRight /></Button></CardFooter></Card>
    })}</div> : <EmptyState title='No watched startups yet' description='Return to all startups and save the teams you want to review.' action={<Button variant='outline' onClick={() => setSavedOnly(false)}>Show all startups</Button>} icon={Bookmark} />}
  </PageContainer>
}

type StartupTab = 'overview' | 'team' | 'milestones' | 'evidence' | 'mentorship' | 'applications' | 'activity'

const detailTabs = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'milestones', label: 'Milestones', icon: Target },
  { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
  { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
  { id: 'applications', label: 'Applications', icon: CalendarCheck },
  { id: 'activity', label: 'Activity', icon: Activity },
] as const

export function StartupDetailPage() {
  const { slug } = useParams({ from: '/app/startups/$slug' })
  const { data } = useSnapshot()
  const { state, store } = useExecutionStore()
  const [tab, setTab] = useState<StartupTab>('overview')
  const [moreOpen, setMoreOpen] = useState(false)
  if (!data) return <PageLoading />
  const startups = data.startups?.length ? data.startups : staticStartups
  const startup = startups.find((item) => item.slug === slug)
  if (!startup) return <PageContainer><EmptyState title='Startup not found' description='This venture may have moved or the URL is incorrect.' action={<Button asChild><Link to='/startups'>Back to startups</Link></Button>} icon={Rocket} /></PageContainer>
  const watched = state.watchlist.includes(slug)
  const currentUserId = data.currentUser?.id ?? 'anonymous'
  const canManage = state.memberships.some((item) => item.startupSlug === slug && item.userId === currentUserId) || state.selectedPersona === 'founder' || state.selectedPersona === 'member' || state.selectedPersona === 'platform_admin'
  const desktopTabs = detailTabs
  const mobileTabs = detailTabs.slice(0, 4)

  return <PageContainer>
    <section className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
      <div className='flex min-w-0 items-start gap-4'><span className='grid size-16 shrink-0 place-items-center rounded-2xl border bg-primary/10 text-primary sm:size-20'><Rocket className='size-8' /></span><div className='min-w-0'><div className='flex flex-wrap items-center gap-2'><DemoDataBadge /><Badge>{startup.stage}</Badge><Badge variant='outline'>{startup.sector}</Badge></div><h1 className='mt-3 text-3xl font-bold tracking-tight sm:text-4xl'>{startup.name}</h1><p className='mt-2 max-w-2xl text-muted-foreground'>{startup.summary}</p></div></div>
      <div className='flex gap-2'><Button variant='outline' asChild><Link to='/messages'><MessageCircle />Contact</Link></Button><Button variant={watched ? 'outline' : 'default'} onClick={() => store.toggleWatch(slug)}><Bookmark className={watched ? 'fill-current' : ''} />{watched ? 'Watching' : 'Watch'}</Button></div>
    </section>

    <nav aria-label='Startup workspace sections' className='no-scrollbar mt-7 flex gap-2 overflow-x-auto border-b pb-3'>
      <div className='hidden gap-2 md:flex'>{desktopTabs.map(({ id, label, icon: Icon }) => <TabButton key={id} active={tab === id} onClick={() => setTab(id)} icon={Icon} label={label} />)}</div>
      <div className='flex gap-2 md:hidden'>{mobileTabs.map(({ id, label, icon: Icon }) => <TabButton key={id} active={tab === id} onClick={() => setTab(id)} icon={Icon} label={label} />)}<TabButton active={['mentorship', 'applications', 'activity'].includes(tab)} onClick={() => setMoreOpen(true)} icon={MoreHorizontal} label='More' /></div>
    </nav>

    <div className='mt-6'>
      {tab === 'overview' && <Overview startup={startup} state={state} slug={slug} />}
      {tab === 'team' && <TeamPanel slug={slug} canManage={canManage} />}
      {tab === 'milestones' && <StartupWorkspace userId={currentUserId} startupSlug={slug} milestonesOnly />}
      {tab === 'evidence' && <EvidencePanel slug={slug} canManage={canManage} />}
      {tab === 'mentorship' && <MentorshipPanel slug={slug} />}
      {tab === 'applications' && <ApplicationsPanel slug={slug} />}
      {tab === 'activity' && <ActivityPanel slug={slug} />}
    </div>

    <ResponsiveDialog open={moreOpen} onOpenChange={setMoreOpen} title='More startup sections' description='Mentorship, applications, and activity.'>{detailTabs.slice(4).map(({ id, label, icon: Icon }) => <button key={id} type='button' className='mb-2 flex min-h-14 w-full items-center gap-3 rounded-xl border p-3 text-left' onClick={() => { setTab(id); setMoreOpen(false) }}><Icon className='size-5 text-primary' /><span className='font-semibold'>{label}</span><ArrowRight className='ml-auto size-4' /></button>)}</ResponsiveDialog>
  </PageContainer>
}

function Overview({ startup, state, slug }: { startup: (typeof staticStartups)[number]; state: ReturnType<typeof useExecutionStore>['state']; slug: string }) {
  const milestones = state.milestones.filter((item) => item.startupSlug === slug)
  const evidence = state.evidence.filter((item) => item.startupSlug === slug)
  const members = state.memberships.filter((item) => item.startupSlug === slug)
  return <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'><div className='space-y-6'><Card><CardHeader><CardTitle>Mission and current evidence</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>{startup.fullDesc}</p></CardContent></Card><Card><CardHeader><CardTitle>Workflow progress</CardTitle><CardDescription>Execution records shared across the workspace.</CardDescription></CardHeader><CardContent className='grid gap-3 sm:grid-cols-3'><MiniSignal label='Team' value={String(members.length || startup.team.length)} /><MiniSignal label='Milestones' value={String(milestones.length || startup.milestones.length)} /><MiniSignal label='Verified evidence' value={String(evidence.filter((item) => item.status === 'verified').length)} /></CardContent></Card></div><aside className='space-y-4'><Card><CardHeader><div className='flex items-center justify-between'><Badge>{startup.stage}</Badge><b className='text-primary'>{Math.max(0, Math.min(100, startup.score))}% ready</b></div></CardHeader><CardContent><div className='h-2 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${Math.max(0, Math.min(100, startup.score))}%` }} /></div><div className='mt-5 space-y-3 text-sm'><p className='flex items-center gap-2'><MapPin className='size-4 text-primary' />{startup.location}</p><p className='flex items-center gap-2'><CalendarCheck className='size-4 text-primary' />Founded {startup.founded}</p><p className='flex items-center gap-2'><ShieldCheck className='size-4 text-primary' />Sample readiness signal</p></div></CardContent></Card><Card><CardHeader><CardTitle className='text-base'>Open needs</CardTitle></CardHeader><CardContent>{startup.openRoles.length ? startup.openRoles.map((role) => <div key={role.title} className='mb-2 rounded-lg border p-3'><b className='text-sm'>{role.title}</b><p className='text-xs text-muted-foreground'>{role.skills.join(', ')}</p></div>) : <p className='text-sm text-muted-foreground'>No static open roles.</p>}</CardContent></Card></aside></div>
}

function TeamPanel({ slug, canManage }: { slug: string; canManage: boolean }) {
  const { state, store } = useExecutionStore()
  const members = state.memberships.filter((item) => item.startupSlug === slug)
  const roles = state.openRoles.filter((item) => item.startupSlug === slug)
  return <div className='grid gap-6 lg:grid-cols-2'><Card><CardHeader><div className='flex items-center justify-between gap-2'><div><CardTitle>Core team</CardTitle><CardDescription>Named owners and current responsibilities.</CardDescription></div>{canManage && <MemberDialog slug={slug} />}</div></CardHeader><CardContent className='space-y-3'>{members.map((member) => <div key={member.id} className='flex min-h-14 items-center gap-3 rounded-xl border p-3'><span className='grid size-10 place-items-center rounded-xl bg-primary/10 font-semibold text-primary'>{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className='flex-1'><b className='text-sm'>{member.name}</b><p className='text-xs text-muted-foreground'>{member.title} · {member.kind}</p></div>{canManage && member.kind !== 'founder' && <Button size='sm' variant='ghost' onClick={() => store.removeMembership(member.id)}>Remove</Button>}</div>)}{!members.length && <EmptyState title='No local team records' description='Invite the first member to this execution workspace.' icon={Users} />}</CardContent></Card><Card><CardHeader><div className='flex items-center justify-between gap-2'><div><CardTitle>Open roles</CardTitle><CardDescription>Commitment is as important as craft.</CardDescription></div>{canManage && <RoleDialog slug={slug} />}</div></CardHeader><CardContent className='space-y-3'>{roles.map((role) => <div key={role.id} className='rounded-xl border p-4'><div className='flex justify-between gap-2'><div><b>{role.title}</b><p className='text-xs text-muted-foreground'>{role.department} · {role.commitment}</p></div><StatusBadge status={role.status} /></div><div className='mt-3 flex flex-wrap gap-1'>{role.skills.map((skill) => <Badge key={skill} variant='secondary'>{skill}</Badge>)}</div>{canManage && <Button className='mt-3' size='sm' variant='outline' onClick={() => store.updateRole(role.id, { status: role.status === 'open' ? 'paused' : 'open' })}>{role.status === 'open' ? 'Pause role' : 'Reopen role'}</Button>}</div>)}{!roles.length && <EmptyState title='No open roles' description='Add a specific need, expected commitment, and required skills.' icon={BriefcaseBusiness} />}</CardContent></Card></div>
}

function EvidencePanel({ slug, canManage }: { slug: string; canManage: boolean }) {
  const { state, store } = useExecutionStore()
  const evidence = state.evidence.filter((item) => item.startupSlug === slug)
  return <Card><CardHeader><CardTitle>Evidence bundle</CardTitle><CardDescription>Review what each record proves and what signal is still missing.</CardDescription></CardHeader><CardContent className='space-y-3'>{evidence.map((item) => <div key={item.id} className='rounded-xl border p-4'><div className='flex flex-wrap items-start justify-between gap-3'><div><b>{item.title}</b><p className='mt-1 text-xs text-muted-foreground'>{item.kind} · {item.file?.name ?? 'metadata record'}</p></div><StatusBadge status={item.status} /></div><p className='mt-3 text-sm text-muted-foreground'>{item.note}</p>{item.reviewerNote && <p className='mt-2 rounded-lg bg-muted p-2 text-xs'>Reviewer: {item.reviewerNote}</p>}{canManage && item.status === 'pending' && <div className='mt-3 flex gap-2'><Button size='sm' onClick={() => store.reviewEvidence(item.id, 'verified', 'Evidence definition met for this sample record.')}>Verify</Button><Button size='sm' variant='outline' onClick={() => store.reviewEvidence(item.id, 'needs_changes', 'Add the missing source and a written decision summary.')}>Needs changes</Button></div>}</div>)}{!evidence.length && <EmptyState title='No evidence records' description='Create a milestone first, then submit a document, metric, interview synthesis, prototype, or pilot record.' action={<Button asChild><Link to='/workspace'>Open milestones</Link></Button>} icon={FileCheck2} />}</CardContent></Card>
}

function MentorshipPanel({ slug }: { slug: string }) {
  const { state } = useExecutionStore()
  const sessions = state.mentorSessions.filter((item) => item.startupSlug === slug)
  return <div className='space-y-3'>{sessions.map((session) => <Card key={session.id}><CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><GraduationCap /></span><div className='flex-1'><div className='flex flex-wrap items-center gap-2'><b>{session.topic}</b><StatusBadge status={session.status} /></div><p className='mt-1 text-sm text-muted-foreground'>{session.mentorName} · {new Date(session.scheduledAt).toLocaleString()}</p><p className='mt-2 text-sm'>{session.goal}</p></div><Button variant='outline' asChild><Link to='/mentorship'>Open session</Link></Button></CardContent></Card>)}{!sessions.length && <EmptyState title='No mentor sessions' description='Book a goal-led session and connect it to the startup.' action={<Button asChild><Link to='/mentorship'>Find a mentor</Link></Button>} icon={GraduationCap} />}</div>
}

function ApplicationsPanel({ slug }: { slug: string }) {
  const { state } = useExecutionStore()
  const applications = state.programApplications.filter((item) => item.startupSlug === slug)
  return <div className='space-y-3'>{applications.map((application) => <Card key={application.id}><CardContent className='flex flex-col gap-3 p-5 sm:flex-row sm:items-center'><div className='flex-1'><div className='flex flex-wrap items-center gap-2'><b>{application.programName}</b><StatusBadge status={application.status} /></div><p className='mt-2 text-sm text-muted-foreground'>{application.answer}</p>{application.reviewerNote && <p className='mt-2 text-xs'>Reviewer: {application.reviewerNote}</p>}</div><Button variant='outline' asChild><Link to='/programs'>Manage application</Link></Button></CardContent></Card>)}{!applications.length && <EmptyState title='No program applications' description='Discover a program aligned with this stage and submit the current evidence.' action={<Button asChild><Link to='/programs'>Discover programs</Link></Button>} icon={CalendarCheck} />}</div>
}

function ActivityPanel({ slug }: { slug: string }) {
  const { state } = useExecutionStore()
  const rows = [
    ...state.evidence.filter((item) => item.startupSlug === slug).map((item) => ({ id: item.id, title: `Evidence: ${item.title}`, text: item.status, at: item.submittedAt })),
    ...state.programApplications.filter((item) => item.startupSlug === slug).map((item) => ({ id: item.id, title: `Application: ${item.programName}`, text: item.status, at: item.submittedAt })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
  return <Card><CardHeader><CardTitle>Startup activity</CardTitle><CardDescription>Workflow events, not popularity metrics.</CardDescription></CardHeader><CardContent className='space-y-1'>{rows.map((row) => <div key={row.id} className='grid gap-1 border-b py-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_180px]'><b>{row.title}</b><StatusBadge status={row.text} /><time className='text-muted-foreground'>{new Date(row.at).toLocaleString()}</time></div>)}{!rows.length && <EmptyState title='No operational activity yet' description='Milestone and workflow transitions will appear here.' icon={Activity} />}</CardContent></Card>
}

function MemberDialog({ slug }: { slug: string }) {
  const { store } = useExecutionStore()
  const [name, setName] = useState(''), [title, setTitle] = useState('')
  return <ResponsiveDialog title='Invite team member' description='This creates a local demo membership record.' trigger={<Button size='sm'><Plus />Invite</Button>} footer={<Button disabled={name.trim().length < 2 || title.trim().length < 2} onClick={() => { store.addMembership({ startupSlug: slug, userId: `local_${Date.now()}`, name: name.trim(), title: title.trim(), kind: 'member' }); setName(''); setTitle(''); toast.success('Member added') }}>Add member</Button>}><div className='grid gap-4'><Label>Name<Input className='mt-2' value={name} onChange={(event) => setName(event.target.value)} /></Label><Label>Responsibility<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} /></Label></div></ResponsiveDialog>
}

function RoleDialog({ slug }: { slug: string }) {
  const { store } = useExecutionStore()
  const [title, setTitle] = useState(''), [commitment, setCommitment] = useState('8 hrs/week'), [skills, setSkills] = useState('')
  return <ResponsiveDialog title='Add open role' description='Make the responsibility, time commitment, and required craft clear.' trigger={<Button size='sm' variant='outline'><Plus />Add role</Button>} footer={<Button disabled={title.trim().length < 3} onClick={() => { const role: Omit<OpenRole, 'id'> = { startupSlug: slug, title: title.trim(), department: 'Startup team', commitment, skills: skills.split(',').map((item) => item.trim()).filter(Boolean), status: 'open' }; store.addRole(role); setTitle(''); setSkills(''); toast.success('Open role created') }}>Publish role</Button>}><div className='grid gap-4'><Label>Role title<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} /></Label><Label>Commitment<Input className='mt-2' value={commitment} onChange={(event) => setCommitment(event.target.value)} /></Label><Label>Skills<Input className='mt-2' value={skills} onChange={(event) => setSkills(event.target.value)} placeholder='Node.js, PostgreSQL, payments' /></Label></div></ResponsiveDialog>
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Info; label: string }) { return <button type='button' onClick={onClick} className={cn('inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', active ? 'border-primary/35 bg-primary/10 text-primary' : 'text-muted-foreground')}><Icon className='size-3.5' />{label}</button> }
function MiniSignal({ label, value }: { label: string; value: string }) { return <div className='rounded-xl border bg-muted/20 p-3'><b className='block text-xl'>{value}</b><span className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</span></div> }
