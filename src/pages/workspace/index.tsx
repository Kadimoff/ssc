import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Handshake,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { DemoDataBadge, EmptyState, ResponsiveDialog, StatusBadge } from '@/components/execution-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { runtimeMode } from '@/data/client'
import { useExecutionStore } from '@/features/execution/store'
import { workspaceKindFor, type WorkspaceKind } from '@/features/execution/workspace'
import type { DetailedMilestone, ExecutionEvidence } from '@/features/execution/types'

const workspaceMeta: Record<WorkspaceKind, { eyebrow: string; title: string; description: string }> = {
  student: { eyebrow: 'Student workspace', title: 'Turn an idea into the next credible action.', description: 'Create or join a team, verify your student status, and apply to a program when you have enough evidence.' },
  startup: { eyebrow: 'Startup workspace', title: 'Move the venture forward from one operating view.', description: 'Keep the team, milestones, evidence, mentorship, and program work connected.' },
  mentor: { eyebrow: 'Mentor workspace', title: 'Make every founder session produce a next action.', description: 'Prepare for sessions, capture structured feedback, and follow linked milestones.' },
  investor: { eyebrow: 'Investor workspace', title: 'Review opportunities through evidence, not attention.', description: 'Triage missing signals, compare ventures, and track introduction requests.' },
  institution: { eyebrow: 'Institution workspace', title: 'Operate programs and student outcomes.', description: 'Review applications, authority, commitments, evidence, and outcome progress.' },
  platform: { eyebrow: 'Platform workspace', title: 'Keep SSC trustworthy and operational.', description: 'Monitor pending decisions, audit workflow health, and support every role.' },
}

export function WorkspacePage({ milestonesOnly = false }: { milestonesOnly?: boolean }) {
  const { data } = useSnapshot()
  const { state } = useExecutionStore()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to open your workspace' />
  const persona = runtimeMode === 'demo' ? state.selectedPersona : undefined
  const kind = workspaceKindFor(data.currentUser.activeRole, persona)
  const meta = workspaceMeta[kind]

  return <PageContainer>
    <div className='mb-3 flex items-center gap-2'><DemoDataBadge /><Badge variant='secondary' className='capitalize'>{kind} view</Badge></div>
    <PageHeading
      eyebrow={milestonesOnly ? 'Startup milestones' : meta.eyebrow}
      title={milestonesOnly ? 'Goals now live where execution happens.' : meta.title}
      description={milestonesOnly ? 'This backward-compatible goals route now uses the same persisted milestone records as your startup workspace.' : meta.description}
    />
    {milestonesOnly ? <StartupWorkspace userId={data.currentUser.id} milestonesOnly /> :
      kind === 'student' ? <StudentWorkspace /> :
      kind === 'startup' ? <StartupWorkspace userId={data.currentUser.id} /> :
      kind === 'mentor' ? <MentorWorkspace userId={data.currentUser.id} /> :
      kind === 'investor' ? <InvestorWorkspace /> :
      kind === 'institution' ? <InstitutionWorkspace /> :
      <PlatformWorkspace />}
  </PageContainer>
}

function StudentWorkspace() {
  const { state } = useExecutionStore()
  const openPrograms = 3
  const pendingVerification = state.verificationRequests.some((item) => item.userId === 'usr_3' && item.status === 'pending')
  return <div className='space-y-6'>
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <ActionCard icon={Rocket} title='Create a startup' text='Start with the problem and current evidence.' to='/startups/new' action='Create profile' />
      <ActionCard icon={Users} title='Join a team' text={`${state.openRoles.filter((item) => item.status === 'open').length} sample roles need collaborators.`} to='/startups' action='Review roles' />
      <ActionCard icon={CalendarCheck} title='Join a program' text={`${openPrograms} sample programs have application workflows.`} to='/programs' action='Discover programs' />
      <ActionCard icon={BadgeCheck} title='Verify student status' text={pendingVerification ? 'Your submission is pending review.' : 'Unlock trusted student workflows.'} to='/verification' action={pendingVerification ? 'View submission' : 'Start verification'} />
    </section>
    <Card><CardHeader><CardTitle>Your startup path</CardTitle><CardDescription>Complete only what helps the next decision.</CardDescription></CardHeader><CardContent className='grid gap-3 md:grid-cols-3'><Step number='1' title='Choose a problem' text='Document who has it and what you know.' /><Step number='2' title='Find collaborators' text='Publish a clear role with commitment.' /><Step number='3' title='Prove movement' text='Complete a milestone and attach evidence.' /></CardContent></Card>
  </div>
}

export function StartupWorkspace({ userId, milestonesOnly = false, startupSlug = 'campus-cart' }: { userId: string; milestonesOnly?: boolean; startupSlug?: string }) {
  const { state, store } = useExecutionStore()
  const milestones = state.milestones.filter((item) => item.startupSlug === startupSlug)
  const evidence = state.evidence.filter((item) => item.startupSlug === startupSlug)
  const members = state.memberships.filter((item) => item.startupSlug === startupSlug)
  const roles = state.openRoles.filter((item) => item.startupSlug === startupSlug)
  const next = milestones.find((item) => item.status !== 'complete')
  const completion = milestones.length ? Math.round(milestones.reduce((sum, item) => sum + item.progress, 0) / milestones.length) : 0

  return <div className='space-y-6'>
    {!milestonesOnly && <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <Signal icon={Target} label='Workflow progress' value={`${completion}%`} detail={`${milestones.filter((item) => item.status === 'complete').length}/${milestones.length} milestones complete`} />
      <Signal icon={Users} label='Core team' value={String(members.length)} detail={`${roles.filter((item) => item.status === 'open').length} open role`} />
      <Signal icon={FileCheck2} label='Evidence' value={String(evidence.length)} detail={`${evidence.filter((item) => item.status === 'verified').length} verified`} />
      <Signal icon={GraduationCap} label='Mentor sessions' value={String(state.mentorSessions.filter((item) => item.startupSlug === startupSlug).length)} detail='Linked to founder actions' />
    </section>}

    {next && !milestonesOnly && <Card className='overflow-hidden border-primary/25 bg-primary/[0.035]'><div className='h-1 bg-gradient-to-r from-primary to-emerald-400' /><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><div><Badge variant='outline'>Continue working</Badge><CardTitle className='mt-3'>{next.title}</CardTitle><CardDescription className='mt-1'>{next.evidenceDefinition}</CardDescription></div><span className='text-3xl font-bold text-primary'>{next.progress}%</span></div></CardHeader><CardContent><div className='h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${next.progress}%` }} /></div><div className='mt-4 flex flex-wrap gap-2'><Button onClick={() => store.updateMilestone(next.id, { progress: Math.min(100, next.progress + 25), status: next.progress >= 75 ? 'complete' : 'in_progress' })}>Record progress</Button><EvidenceDialog startupSlug={startupSlug} milestone={next} /><Button variant='outline' asChild><Link to='/mentorship'>Ask a mentor</Link></Button></div></CardContent></Card>}

    <section>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'><div><h2 className='text-xl font-bold'>Milestones</h2><p className='text-sm text-muted-foreground'>Every milestone defines what evidence counts.</p></div><MilestoneDialog startupSlug={startupSlug} ownerId={userId} /></div>
      {milestones.length ? <div className='space-y-3'>{milestones.map((item) => <MilestoneRow key={item.id} milestone={item} />)}</div> : <EmptyState title='No milestones yet' description='Create the smallest measurable outcome that advances the venture.' action={<MilestoneDialog startupSlug={startupSlug} ownerId={userId} />} icon={Target} />}
    </section>

    {!milestonesOnly && <div className='grid min-w-0 gap-6 lg:grid-cols-2'>
      <Card className='min-w-0 overflow-hidden'><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><div><CardTitle>Team and roles</CardTitle><CardDescription>Membership and open commitments.</CardDescription></div><TeamDialog startupSlug={startupSlug} /></div></CardHeader><CardContent className='space-y-3'>{members.map((member) => <div key={member.id} className='flex min-h-14 items-center gap-3 rounded-xl border p-3'><span className='grid size-9 place-items-center rounded-lg bg-primary/10 font-semibold text-primary'>{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className='min-w-0 flex-1'><b className='block truncate text-sm'>{member.name}</b><span className='text-xs text-muted-foreground'>{member.title} · {member.kind}</span></div>{member.kind !== 'founder' && <Button variant='ghost' size='sm' onClick={() => store.removeMembership(member.id)}>Remove</Button>}</div>)}{roles.map((role) => <div key={role.id} className='flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-dashed p-3'><BriefcaseBusiness className='size-5 text-primary' /><div className='min-w-0 flex-1'><b className='text-sm'>{role.title}</b><p className='break-words text-xs text-muted-foreground'>{role.commitment} · {role.skills.join(', ')}</p></div><StatusBadge status={role.status} /></div>)}</CardContent></Card>
      <Card className='min-w-0 overflow-hidden'><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><div><CardTitle>Evidence review</CardTitle><CardDescription>Metadata only; demo files never leave this browser.</CardDescription></div>{next && <EvidenceDialog startupSlug={startupSlug} milestone={next} />}</div></CardHeader><CardContent className='space-y-3'>{evidence.map((item) => <EvidenceRow key={item.id} evidence={item} />)}{!evidence.length && <EmptyState title='No evidence submitted' description='Attach a metric, interview synthesis, prototype, or pilot record.' icon={FileCheck2} />}</CardContent></Card>
    </div>}
  </div>
}

function MilestoneRow({ milestone }: { milestone: DetailedMilestone }) {
  const { store } = useExecutionStore()
  return <Card><CardContent className='grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-center'><div><div className='flex flex-wrap items-center gap-2'><b>{milestone.title}</b><StatusBadge status={milestone.status} /></div><p className='mt-1 text-sm text-muted-foreground'>{milestone.description}</p><p className='mt-2 text-xs'><span className='font-semibold text-primary'>Evidence:</span> {milestone.evidenceDefinition}</p></div><div><div className='flex justify-between text-xs text-muted-foreground'><span>Progress</span><b>{milestone.progress}%</b></div><div className='mt-2 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${milestone.progress}%` }} /></div></div><div className='flex gap-2'><Button size='sm' variant='outline' disabled={milestone.status === 'complete'} onClick={() => store.updateMilestone(milestone.id, { progress: Math.min(100, milestone.progress + 25), status: milestone.progress >= 75 ? 'complete' : 'in_progress' })}>{milestone.progress >= 75 ? 'Complete' : 'Progress'}</Button></div></CardContent></Card>
}

function EvidenceRow({ evidence }: { evidence: ExecutionEvidence }) {
  const { store } = useExecutionStore()
  const [note, setNote] = useState('')
  return <div className='rounded-xl border p-3'><div className='flex flex-wrap items-start justify-between gap-2'><div><b className='text-sm'>{evidence.title}</b><p className='mt-1 text-xs text-muted-foreground'>{evidence.kind} · {evidence.file?.name ?? 'No file attached'}</p></div><StatusBadge status={evidence.status} /></div><p className='mt-2 text-sm text-muted-foreground'>{evidence.note}</p>{evidence.status === 'pending' && <div className='mt-3 flex flex-wrap gap-2'><Input value={note} onChange={(event) => setNote(event.target.value)} className='h-9 min-w-48 flex-1' placeholder='Reviewer note' /><Button size='sm' onClick={() => store.reviewEvidence(evidence.id, 'verified', note || 'Evidence definition met.')}>Verify</Button><Button size='sm' variant='outline' onClick={() => store.reviewEvidence(evidence.id, 'needs_changes', note || 'Add the missing source and decision summary.')}>Needs changes</Button></div>}{evidence.reviewerNote && <p className='mt-2 rounded-lg bg-muted p-2 text-xs'>Review: {evidence.reviewerNote}</p>}</div>
}

function MilestoneDialog({ startupSlug, ownerId }: { startupSlug: string; ownerId: string }) {
  const { store } = useExecutionStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [evidence, setEvidence] = useState('')
  const [dueAt, setDueAt] = useState('2026-08-31')
  const submit = () => {
    store.addMilestone({ startupSlug, title: title.trim(), description: 'New founder-defined execution milestone.', ownerId, dueAt, evidenceDefinition: evidence.trim(), progress: 0, status: 'planned' })
    setOpen(false); setTitle(''); setEvidence(''); toast.success('Milestone created')
  }
  return <ResponsiveDialog open={open} onOpenChange={setOpen} title='Create milestone' description='Define the outcome and the evidence that will count as complete.' trigger={<Button><Plus />New milestone</Button>} footer={<><Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button><Button disabled={title.trim().length < 3 || evidence.trim().length < 5} onClick={submit}>Create milestone</Button></>}><div className='grid gap-4'><Label>Outcome<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Confirm one campus pilot' /></Label><Label>Evidence definition<Textarea className='mt-2' value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder='Named partner, success metric, owner, and target dates' /></Label><Label>Target date<Input className='mt-2' type='date' value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></Label></div></ResponsiveDialog>
}

function EvidenceDialog({ startupSlug, milestone }: { startupSlug: string; milestone: DetailedMilestone }) {
  const { store } = useExecutionStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [kind, setKind] = useState<ExecutionEvidence['kind']>('document')
  const [file, setFile] = useState<ExecutionEvidence['file']>()
  return <ResponsiveDialog open={open} onOpenChange={setOpen} title='Submit evidence' description='Only safe file metadata is stored in this demo; file contents are not persisted.' trigger={<Button variant='outline'><FileCheck2 />Add evidence</Button>} footer={<><Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button><Button disabled={title.trim().length < 3 || note.trim().length < 3} onClick={() => { store.addEvidence({ startupSlug, milestoneId: milestone.id, title: title.trim(), kind, file, note: note.trim(), status: 'pending' }); setOpen(false); toast.success('Evidence submitted for review') }}>Submit for review</Button></>}><div className='grid gap-4'><Label>Evidence title<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} /></Label><Label>Type<select className='mt-2 h-10 w-full rounded-md border bg-background px-3' value={kind} onChange={(event) => setKind(event.target.value as ExecutionEvidence['kind'])}>{['document', 'metric', 'interview', 'prototype', 'pilot'].map((item) => <option key={item}>{item}</option>)}</select></Label><Label>Supporting file (optional)<Input className='mt-2' type='file' onChange={(event) => { const selected = event.target.files?.[0]; setFile(selected ? { name: selected.name, size: selected.size, type: selected.type } : undefined) }} /></Label><Label>What does this prove?<Textarea className='mt-2' value={note} onChange={(event) => setNote(event.target.value)} /></Label></div></ResponsiveDialog>
}

function TeamDialog({ startupSlug }: { startupSlug: string }) {
  const { store } = useExecutionStore()
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  return <ResponsiveDialog title='Invite team member' description='Add an illustrative member to this local startup workspace.' trigger={<Button variant='outline' size='sm'><Plus />Invite</Button>} footer={<Button disabled={name.trim().length < 2 || title.trim().length < 2} onClick={() => { store.addMembership({ startupSlug, userId: `local_${Date.now()}`, name: name.trim(), title: title.trim(), kind: 'member' }); setName(''); setTitle(''); toast.success('Team member invited') }}>Send invite</Button>}><div className='grid gap-4'><Label>Name<Input className='mt-2' value={name} onChange={(event) => setName(event.target.value)} /></Label><Label>Role<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} /></Label></div></ResponsiveDialog>
}

function MentorWorkspace({ userId }: { userId: string }) {
  const { state, store } = useExecutionStore()
  const sessions = state.mentorSessions.filter((item) => item.mentorId === userId)
  return <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'><section className='space-y-3'><h2 className='text-xl font-bold'>Founder sessions</h2>{sessions.map((session) => <Card key={session.id}><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><Badge>{new Date(session.scheduledAt).toLocaleString()}</Badge><StatusBadge status={session.status} /></div><CardTitle className='mt-2'>{session.topic}</CardTitle><CardDescription>{session.startupSlug} · {session.goal}</CardDescription></CardHeader><CardContent><p className='text-sm font-semibold'>Action items</p><div className='mt-2 space-y-2'>{session.actionItems.map((action) => <button key={action.id} onClick={() => store.updateSession(session.id, { actionItems: session.actionItems.map((item) => item.id === action.id ? { ...item, complete: !item.complete } : item) })} className='flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm'><CheckCircle2 className={action.complete ? 'fill-primary/20 text-primary' : 'text-muted-foreground'} />{action.text}</button>)}</div><Button className='mt-4' variant='outline' asChild><Link to='/mentorship'>Open session details</Link></Button></CardContent></Card>)}{!sessions.length && <EmptyState title='No upcoming sessions' description='Your booked founder sessions will appear here.' icon={GraduationCap} />}</section><aside className='space-y-4'><Signal icon={CalendarCheck} label='Scheduled' value={String(sessions.filter((item) => item.status === 'scheduled').length)} detail='Upcoming sessions' /><Signal icon={ClipboardCheck} label='Open actions' value={String(sessions.flatMap((item) => item.actionItems).filter((item) => !item.complete).length)} detail='Founder follow-ups' /><ActionCard icon={Search} title='Mentor discovery' text='Review how founders are matched to your expertise.' to='/mentorship' action='Open mentorship' /></aside></div>
}

function InvestorWorkspace() {
  const { state } = useExecutionStore()
  return <div className='space-y-6'><section className='grid gap-4 sm:grid-cols-3'><Signal icon={Search} label='Watchlist' value={String(state.watchlist.length)} detail='Evidence-based opportunities' /><Signal icon={FileCheck2} label='Pending evidence' value={String(state.evidence.filter((item) => item.status === 'pending').length)} detail='Requires signal review' /><Signal icon={Handshake} label='Intro requests' value={String(state.introRequests.length)} detail='Tracked through connection' /></section><Card><CardHeader><CardTitle>Opportunity review queue</CardTitle><CardDescription>Start with missing signals before narrative strength.</CardDescription></CardHeader><CardContent className='grid gap-3 md:grid-cols-3'><ReviewSignal title='CampusCart' status='Evidence pending' text='Seller synthesis lacks the final three interviews.' /><ReviewSignal title='GreenStack' status='Verified pilot' text='Campus pilot summary is available.' /><ReviewSignal title='MediRoute' status='Missing signal' text='No recent team-commitment record.' /></CardContent></Card><Button asChild><Link to='/investors'>Open full investor workspace <ArrowRight /></Link></Button></div>
}

function InstitutionWorkspace() {
  const { state } = useExecutionStore()
  return <div className='space-y-6'><section className='grid gap-4 sm:grid-cols-3'><Signal icon={ClipboardCheck} label='Applications' value={String(state.programApplications.length)} detail={`${state.programApplications.filter((item) => item.status === 'pending').length} pending review`} /><Signal icon={ShieldCheck} label='Verification queue' value={String(state.verificationRequests.filter((item) => item.status === 'pending').length)} detail='Student and authority checks' /><Signal icon={Building2} label='Outcome confidence' value='82%' detail='Sample evidence coverage' /></section><div className='grid gap-4 md:grid-cols-3'><ActionCard icon={ClipboardCheck} title='Review applications' text='Move startup applications through a transparent decision queue.' to='/programs' action='Open queue' /><ActionCard icon={BadgeCheck} title='Review verification' text='Inspect safe document metadata and leave a reasoned decision.' to='/verification' action='Open queue' /><ActionCard icon={Handshake} title='Partner outcomes' text='Track agreements, commitments, contributions, and audit history.' to='/partnerships' action='View operations' /></div></div>
}

function PlatformWorkspace() {
  const { state } = useExecutionStore()
  const pending = state.evidence.filter((item) => item.status === 'pending').length + state.verificationRequests.filter((item) => item.status === 'pending').length + state.programApplications.filter((item) => item.status === 'pending').length
  return <div className='space-y-6'><section className='grid gap-4 sm:grid-cols-3'><Signal icon={ShieldCheck} label='Pending decisions' value={String(pending)} detail='Across execution workflows' /><Signal icon={Users} label='Demo personas' value='8' detail='Role-aware acceptance views' /><Signal icon={FileCheck2} label='Verified evidence' value={String(state.evidence.filter((item) => item.status === 'verified').length)} detail='Frontend demonstration records' /></section><div className='grid gap-4 md:grid-cols-3'><ActionCard icon={ShieldCheck} title='Administration' text='Review platform authority and moderation.' to='/admin' action='Open admin' /><ActionCard icon={BadgeCheck} title='Verification' text='Review student submissions and change requests.' to='/verification' action='Open review queue' /><ActionCard icon={Handshake} title='Partnership audit' text='Inspect contribution and agreement mutations.' to='/partnerships' action='Open audit' /></div></div>
}

function ActionCard({ icon: Icon, title, text, to, action }: { icon: typeof Rocket; title: string; text: string; to: string; action: string }) {
  return <Card className='flex flex-col'><CardHeader><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Icon /></span><CardTitle className='pt-2 text-lg'>{title}</CardTitle><CardDescription>{text}</CardDescription></CardHeader><CardContent className='mt-auto'><Button variant='outline' className='w-full justify-between' asChild><Link to={to}>{action}<ArrowRight /></Link></Button></CardContent></Card>
}
function Signal({ icon: Icon, label, value, detail }: { icon: typeof Target; label: string; value: string; detail: string }) { return <Card><CardContent className='flex items-center gap-4 p-5'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Icon /></span><div><p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p><b className='text-2xl'>{value}</b><p className='text-xs text-muted-foreground'>{detail}</p></div></CardContent></Card> }
function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className='rounded-xl border p-4'><span className='grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground'>{number}</span><b className='mt-3 block'>{title}</b><p className='mt-1 text-sm text-muted-foreground'>{text}</p></div> }
function ReviewSignal({ title, status, text }: { title: string; status: string; text: string }) { return <div className='rounded-xl border p-4'><div className='flex items-center justify-between gap-2'><b>{title}</b><Badge variant='outline'>{status}</Badge></div><p className='mt-2 text-sm text-muted-foreground'>{text}</p></div> }
