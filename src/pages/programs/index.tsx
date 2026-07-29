import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, Handshake, Plus, Rocket, Search, Users } from 'lucide-react'
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
import { useExecutionStore } from '@/features/execution/store'
import type { ProgramApplication } from '@/features/execution/types'
import { cn } from '@/lib/utils'

type ProgramView = 'discover' | 'applications' | 'cohort' | 'operator'
const readable = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export function ProgramsPage() {
  const { data } = useSnapshot()
  const { state } = useExecutionStore()
  const [query, setQuery] = useState('')
  const operator = ['program_admin', 'partner', 'platform_admin'].includes(state.selectedPersona)
  const member = state.programApplications.some((item) => item.status === 'approved' || item.status === 'complete')
  const [view, setView] = useState<ProgramView>(operator ? 'operator' : 'discover')
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to open programs' />
  const programs = data.programs.filter((program) => `${program.name} ${program.description}`.toLowerCase().includes(query.toLowerCase()))
  const views: Array<{ id: ProgramView; label: string }> = [
    { id: 'discover', label: 'Discover' },
    { id: 'applications', label: `My applications (${state.programApplications.filter((item) => item.applicantId === data.currentUser?.id || state.selectedPersona === 'founder').length})` },
    ...(member ? [{ id: 'cohort' as const, label: 'Cohort progress' }] : []),
    ...(operator ? [{ id: 'operator' as const, label: `Operator review (${state.programApplications.filter((item) => item.status === 'pending').length})` }] : []),
  ]

  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Illustrative programs' /></div>
    <PageHeading eyebrow='Programs' title='Apply, participate, and review from one workflow.' description='Founders submit current evidence, cohort members track progress, and operators make reasoned application decisions.' />
    <nav className='no-scrollbar mb-6 flex gap-2 overflow-x-auto' aria-label='Program workspace sections'>{views.map((item) => <button type='button' key={item.id} onClick={() => setView(item.id)} className={cn('min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold', view === item.id ? 'border-primary/35 bg-primary/10 text-primary' : 'text-muted-foreground')}>{item.label}</button>)}</nav>

    {view === 'discover' && <><div className='relative mb-5 max-w-lg'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='h-11 pl-10' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search programs by stage or outcome' /></div><div className='space-y-5'>{programs.map((program) => {
      const host = data.organizations.find((item) => item.id === program.hostOrganizationId)
      const partners = data.programPartners.filter((item) => item.programId === program.id)
      const applied = state.programApplications.find((item) => item.programId === program.id && (item.applicantId === data.currentUser?.id || state.selectedPersona === 'founder'))
      return <Card key={program.id}><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><div className='flex gap-2'><Badge><Rocket className='size-3' />{readable(program.type)}</Badge><StatusBadge status={program.status} /></div><span className='text-xs font-medium text-muted-foreground'>Timeline {program.startsAt} → {program.endsAt}</span></div><CardTitle className='pt-2'>{program.name}</CardTitle><CardDescription className='leading-6'>{program.description}</CardDescription></CardHeader><CardContent className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]'><div><div className='grid gap-3 sm:grid-cols-3'><ProgramSignal icon={Handshake} label='Host' value={host?.displayName ?? 'SSC'} /><ProgramSignal icon={Users} label='Partners' value={String(partners.length)} /><ProgramSignal icon={FileCheck2} label='Evidence points' value={String(program.milestoneLabels.length)} /></div><div className='mt-4 rounded-xl border bg-muted/20 p-4 text-sm'><p><b>Eligibility:</b> student-led or university-connected early-stage team</p><p className='mt-2 text-muted-foreground'><b className='text-foreground'>Evidence requirement:</b> one defined milestone and its current supporting record.</p></div><div className='mt-4 flex flex-wrap gap-1.5'>{program.milestoneLabels.map((item) => <Badge key={item} variant='outline'>{item}</Badge>)}</div></div><div className='rounded-xl border bg-muted/20 p-4'><b className='text-sm'>Why this fits</b><p className='mt-2 text-xs leading-5 text-muted-foreground'>Your startup is validating, has a defined next milestone, and can submit an evidence bundle. Fit is illustrative, not an acceptance prediction.</p>{applied ? <div className='mt-4 flex flex-wrap items-center gap-2'><StatusBadge status={applied.status} /><Button size='sm' variant='outline' onClick={() => setView('applications')}>View application</Button></div> : <ApplicationDialog programId={program.id} programName={program.name} applicantId={data.currentUser?.id ?? 'usr_9'} />}</div></CardContent></Card>
    })}{!programs.length && <EmptyState title='No programs match' description='Try a broader search term.' icon={CalendarDays} />}</div></>}

    {view === 'applications' && <ApplicationList applicantId={data.currentUser.id} />}
    {view === 'cohort' && <CohortProgress />}
    {view === 'operator' && <OperatorQueue />}
  </PageContainer>
}

function ApplicationDialog({ programId, programName, applicantId }: { programId: string; programName: string; applicantId: string }) {
  const { store } = useExecutionStore()
  const [open, setOpen] = useState(false)
  const [startupSlug, setStartupSlug] = useState('campus-cart')
  const [answer, setAnswer] = useState('')
  return <ResponsiveDialog open={open} onOpenChange={setOpen} title={`Apply to ${programName}`} description='Explain the decision this program will help you make and reference current evidence.' trigger={<Button className='mt-4 w-full'><Plus />Start application</Button>} footer={<><Button variant='outline' disabled={answer.trim().length < 3} onClick={() => { store.saveApplicationDraft({ programId, programName, startupSlug, applicantId, answer: answer.trim() }); toast.success('Application draft saved locally'); setOpen(false) }}>Save draft</Button><Button disabled={answer.trim().length < 20} onClick={() => { store.addApplication({ programId, programName, startupSlug, applicantId, answer: answer.trim() }); toast.success('Application submitted for demo review'); setOpen(false) }}>Submit application</Button></>}><div className='grid gap-4'><Label>Startup slug<Input className='mt-2' value={startupSlug} onChange={(event) => setStartupSlug(event.target.value)} /></Label><Label>Why now?<Textarea className='mt-2 min-h-32' value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder='The milestone, decision, evidence, and program support you need…' /></Label><div className='rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground'>Your shared milestone and evidence metadata remain in the local execution store. File contents are never uploaded in demo mode.</div></div></ResponsiveDialog>
}

function ApplicationList({ applicantId }: { applicantId: string }) {
  const { state } = useExecutionStore()
  const applications = state.programApplications.filter((item) => item.applicantId === applicantId || state.selectedPersona === 'founder')
  return applications.length ? <div className='space-y-3'>{applications.map((application) => <Card key={application.id}><CardContent className='grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'><div><div className='flex flex-wrap items-center gap-2'><b>{application.programName}</b><StatusBadge status={application.status} /></div><p className='mt-2 text-sm text-muted-foreground'>{application.answer}</p>{application.reviewerNote && <p className='mt-3 rounded-lg bg-muted p-3 text-xs'><b>Reviewer note:</b> {application.reviewerNote}</p>}</div><div className='flex flex-wrap gap-2'>{['draft', 'needs_changes'].includes(application.status) && <ApplicationEditDialog application={application} />}<Button variant='outline' asChild><Link to='/startups/$slug' params={{ slug: application.startupSlug }}>Open evidence</Link></Button></div></CardContent></Card>)}</div> : <EmptyState title='No program applications' description='Discover an aligned program and submit a milestone-led application.' icon={ClipboardCheck} />
}

function ApplicationEditDialog({ application }: { application: ProgramApplication }) {
  const { store } = useExecutionStore()
  const [answer, setAnswer] = useState(application.answer)
  const [open, setOpen] = useState(false)
  return <ResponsiveDialog open={open} onOpenChange={setOpen} title='Update application' description='Respond to the reviewer note and keep the linked execution context current.' trigger={<Button>Edit application</Button>} footer={<><Button variant='outline' onClick={() => { store.updateApplication(application.id, { answer: answer.trim(), status: 'draft' }); toast.success('Application changes saved'); setOpen(false) }}>Save draft</Button><Button disabled={answer.trim().length < 20} onClick={() => { store.updateApplication(application.id, { answer: answer.trim(), status: 'pending', submittedAt: new Date().toISOString() }); toast.success('Application resubmitted'); setOpen(false) }}>Submit for review</Button></>}><Label>Updated response<Textarea className='mt-2 min-h-40' value={answer} onChange={(event) => setAnswer(event.target.value)} /></Label></ResponsiveDialog>
}

function CohortProgress() {
  const { state } = useExecutionStore()
  const milestones = state.milestones.filter((item) => item.startupSlug === 'campus-cart')
  return <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'><Card><CardHeader><CardTitle>Validation sprint progress</CardTitle><CardDescription>Startup work stays linked to cohort checkpoints.</CardDescription></CardHeader><CardContent className='space-y-3'>{milestones.map((item) => <div key={item.id} className='rounded-xl border p-4'><div className='flex justify-between gap-2'><b>{item.title}</b><StatusBadge status={item.status} /></div><div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${item.progress}%` }} /></div><p className='mt-2 text-xs text-muted-foreground'>{item.evidenceDefinition}</p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Next cohort checkpoint</CardTitle></CardHeader><CardContent><Badge><CalendarDays className='size-3' />August 8 · 14:00</Badge><h3 className='mt-4 font-semibold'>Evidence review clinic</h3><p className='mt-2 text-sm leading-6 text-muted-foreground'>Bring one milestone decision and the source material that supports it.</p><Button className='mt-4 w-full' asChild><Link to='/workspace'>Prepare evidence</Link></Button></CardContent></Card></div>
}

function OperatorQueue() {
  const { state, store } = useExecutionStore()
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const applications = state.programApplications
  return <div className='space-y-3'>{applications.map((application) => <Card key={application.id}><CardContent className='grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_360px]'><div><div className='flex flex-wrap items-center gap-2'><b>{application.programName}</b><StatusBadge status={application.status} /></div><p className='mt-1 text-xs text-muted-foreground'>{application.startupSlug} · submitted {new Date(application.submittedAt).toLocaleString()}</p><p className='mt-3 text-sm leading-6'>{application.answer}</p><div className='mt-3 flex gap-2'><Badge variant='outline'><CheckCircle2 className='size-3' />Milestones linked</Badge><Badge variant='outline'><FileCheck2 className='size-3' />Evidence available</Badge></div></div><div className='rounded-xl border bg-muted/20 p-3'><Label>Decision note<Textarea className='mt-2 min-h-20 bg-background' value={noteById[application.id] ?? application.reviewerNote ?? ''} onChange={(event) => setNoteById((current) => ({ ...current, [application.id]: event.target.value }))} /></Label><div className='mt-3 flex flex-wrap gap-2'><ReviewButton application={application} status='approved' note={noteById[application.id]} onReview={store.reviewApplication.bind(store)} /><ReviewButton application={application} status='needs_changes' note={noteById[application.id]} onReview={store.reviewApplication.bind(store)} /><ReviewButton application={application} status='rejected' note={noteById[application.id]} onReview={store.reviewApplication.bind(store)} /></div></div></CardContent></Card>)}</div>
}

function ReviewButton({ application, status, note, onReview }: { application: ProgramApplication; status: ProgramApplication['status']; note?: string; onReview: (id: string, status: ProgramApplication['status'], note: string) => void }) {
  return <Button size='sm' variant={status === 'approved' ? 'default' : 'outline'} disabled={(status === 'needs_changes' || status === 'rejected') && !note?.trim()} onClick={() => { onReview(application.id, status, note?.trim() || 'Application meets the sample program criteria.'); toast.success(`Application marked ${status.replace('_', ' ')}`) }}>{readable(status)}</Button>
}

function ProgramSignal({ icon: Icon, label, value }: { icon: typeof Rocket; label: string; value: string }) { return <div className='rounded-xl border p-3'><Icon className='size-4 text-primary' /><p className='mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p><b className='mt-1 block text-sm'>{value}</b></div> }
