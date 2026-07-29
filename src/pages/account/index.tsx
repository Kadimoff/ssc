import { useState } from 'react'
import { BadgeCheck, Bell, Eye, FileCheck2, LockKeyhole, Save, ShieldCheck, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/data/client'
import type { User } from '@/data/types'
import { useAction, useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DemoDataBadge, EmptyState, StatusBadge } from '@/components/execution-primitives'
import { useExecutionStore } from '@/features/execution/store'
import type { VerificationRequest } from '@/features/execution/types'
import { WorkspacePage } from '@/pages/workspace'

export function SettingsPage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to manage settings' />
  return <SettingsForm key={data.currentUser.id} user={data.currentUser} />
}

function SettingsForm({ user }: { user: User }) {
  const [email, setEmail] = useState(user.email), [availability, setAvailability] = useState(user.availability)
  const update = useAction(() => apiClient.updateProfile({ email, availability }), 'Settings saved')
  return <PageContainer><PageHeading eyebrow='Account' title='Settings' description='Control your account context, privacy defaults, and notification preferences.' /><div className='grid gap-5 lg:grid-cols-2'><Card><CardHeader><CardTitle>Account details</CardTitle><CardDescription>Information used for account and program communication.</CardDescription></CardHeader><CardContent className='space-y-4'><Label>Email<Input className='mt-2' type='email' value={email} onChange={(event) => setEmail(event.target.value)} /></Label><Label>Availability<Input className='mt-2' value={availability} onChange={(event) => setAvailability(event.target.value)} /></Label></CardContent><CardFooter><Button onClick={() => update.mutate()}><Save />Save changes</Button></CardFooter></Card><Card><CardHeader><CardTitle>Privacy defaults</CardTitle></CardHeader><CardContent className='space-y-3'><Setting icon={Eye} title='Profile visibility' text='Visible to authenticated community members.' /><Setting icon={Bell} title='Program notifications' text='Operational updates and direct invitations enabled.' /><Setting icon={LockKeyhole} title='Evidence visibility' text='Evidence remains scoped to authorized program roles.' /></CardContent></Card></div></PageContainer>
}

export function VerificationPage() {
  const { data } = useSnapshot()
  const { state } = useExecutionStore()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view verification' />
  const user = data.currentUser
  const reviewer = ['program_admin', 'partner', 'platform_admin'].includes(state.selectedPersona)
  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Safe metadata only' /></div>
    <PageHeading eyebrow='Trust and identity' title={reviewer ? 'Verification review queue' : 'Student verification'} description={reviewer ? 'Review student submissions, inspect safe document metadata, and record a reasoned decision.' : 'Confirm your institution with a guided submission. Uploaded document contents are never persisted in demo mode.'} />
    {reviewer ? <VerificationQueue /> : <VerificationWizard userId={user.id} />}
    <Card className='mt-6'><CardHeader><CardTitle>Correction and appeal</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>Every rejected or needs-changes decision includes a review note. Applicants can correct their details and resubmit without losing the prior local record.</p></CardContent></Card>
  </PageContainer>
}

function VerificationWizard({ userId }: { userId: string }) {
  const { state, store } = useExecutionStore()
  const existing = state.verificationRequests.find((item) => item.userId === userId) ?? { id: `ver_${userId}`, userId, institution: '', studentId: '', status: 'draft' as const }
  const [step, setStep] = useState(1)
  const [institution, setInstitution] = useState(existing.institution)
  const [institutionalEmail, setInstitutionalEmail] = useState(existing.institutionalEmail ?? '')
  const [applicantRole, setApplicantRole] = useState<NonNullable<VerificationRequest['applicantRole']>>(existing.applicantRole ?? 'student')
  const [studentId, setStudentId] = useState(existing.studentId)
  const [supportingNote, setSupportingNote] = useState(existing.supportingNote ?? '')
  const [consentAccepted, setConsentAccepted] = useState(existing.consentAccepted ?? false)
  const [document, setDocument] = useState(existing.document)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (existing.status !== 'draft' && step === 1) {
    return <Card><CardHeader><div className='flex items-center justify-between gap-3'><div><CardTitle>Your verification request</CardTitle><CardDescription>Submitted {existing.submittedAt ? new Date(existing.submittedAt).toLocaleString() : 'in this browser'}</CardDescription></div><StatusBadge status={existing.status} /></div></CardHeader><CardContent><div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'><VerificationFact label='Institution' value={existing.institution} /><VerificationFact label='Institutional email' value={existing.institutionalEmail ?? ''} /><VerificationFact label='Role' value={existing.applicantRole?.replace('_', ' ') ?? ''} /><VerificationFact label='Document' value={existing.document?.name ?? 'Not attached'} /></div>{existing.reviewerNote && <div className='mt-4 rounded-xl border bg-muted/30 p-4 text-sm'><b>Reviewer note</b><p className='mt-1 text-muted-foreground'>{existing.reviewerNote}</p></div>}{['rejected', 'needs_changes'].includes(existing.status) && <Button className='mt-4' onClick={() => { store.upsertVerification({ ...existing, status: 'draft' }); setStep(1) }}>Correct and resubmit</Button>}</CardContent></Card>
  }

  const next = () => {
    setError('')
    if (step === 1 && (institution.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(institutionalEmail.trim()))) return setError('Add your institution and a valid institutional email before continuing.')
    if (step === 2 && studentId.trim().length < 3) return setError('Add your institution-issued identifier before continuing.')
    setStep((current) => Math.min(3, current + 1))
  }

  const submit = () => {
    setError('')
    if (!consentAccepted) return setError('Review and accept the verification consent before submitting.')
    setSubmitting(true)
    const request: VerificationRequest = { ...existing, institution: institution.trim(), institutionalEmail: institutionalEmail.trim(), applicantRole, supportingNote: supportingNote.trim(), consentAccepted, studentId: studentId.trim(), document, status: 'pending', submittedAt: new Date().toISOString() }
    window.setTimeout(() => { store.upsertVerification(request); setSubmitting(false); setStep(1); toast.success('Verification submitted for demo review') }, 350)
  }

  return <Card className='mx-auto max-w-3xl'><CardHeader><div className='flex items-center justify-between'><CardTitle>Student submission</CardTitle><Badge variant='outline'>Step {step} of 3</Badge></div><div className='mt-3 grid grid-cols-3 gap-2'>{[1, 2, 3].map((item) => <div key={item} className={`h-1.5 rounded-full ${item <= step ? 'bg-primary' : 'bg-muted'}`} />)}</div></CardHeader><CardContent className='space-y-5'>
    {step === 1 && <div className='grid gap-4'><Label>Institution<Input className='mt-2' value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder='University or college' /></Label><Label>Institutional email<Input className='mt-2' type='email' value={institutionalEmail} onChange={(event) => setInstitutionalEmail(event.target.value)} placeholder='name@university.edu' /></Label><Label>Role<select className='mt-2 h-11 w-full rounded-lg border bg-background/55 px-3 text-sm' value={applicantRole} onChange={(event) => setApplicantRole(event.target.value as NonNullable<VerificationRequest['applicantRole']>)}><option value='student'>Student</option><option value='founder'>Student founder</option><option value='team_member'>Startup team member</option><option value='other'>Other eligible participant</option></select></Label></div>}
    {step === 2 && <div className='space-y-4'><Label>Institution-issued identifier<Input className='mt-2' value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder='Student or participant ID' /></Label><Label>Supporting context (optional)<Textarea className='mt-2' value={supportingNote} onChange={(event) => setSupportingNote(event.target.value)} placeholder='Program, faculty, cohort or other useful reviewer context.' /></Label><Label>Supporting document (optional)<Input className='mt-2' type='file' accept='.pdf,.png,.jpg,.jpeg' onChange={(event) => { const file = event.target.files?.[0]; setDocument(file ? { name: file.name, size: file.size, type: file.type } : undefined) }} /></Label><div className='flex gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4'><Upload className='size-5 shrink-0 text-primary' /><p className='text-sm leading-6 text-muted-foreground'>This frontend demonstration stores only file name, size, and MIME type. It does not persist or upload document contents.</p></div>{document && <p className='text-sm'><b>Selected:</b> {document.name} · {Math.ceil(document.size / 1024)} KB</p>}</div>}
    {step === 3 && <div className='space-y-4'><div className='grid gap-3 sm:grid-cols-2'><VerificationFact label='Institution' value={institution} /><VerificationFact label='Institutional email' value={institutionalEmail} /><VerificationFact label='Role' value={applicantRole.replace('_', ' ')} /><VerificationFact label='Document' value={document?.name ?? 'Not attached'} /></div><label className='flex cursor-pointer items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.035] p-4'><input type='checkbox' className='mt-1 size-4 accent-primary' checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /><span className='text-sm leading-6'><b className='block'>Verification consent</b><span className='text-muted-foreground'>I consent to an authorized program or university reviewer using this information only to assess eligibility in this demo workflow.</span></span></label></div>}
    {error && <p role='alert' className='rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-600'>{error}</p>}
    <div className='flex justify-between border-t pt-4'><Button variant='outline' disabled={step === 1 || submitting} onClick={() => setStep((current) => Math.max(1, current - 1))}>Back</Button>{step < 3 ? <Button onClick={next}>Continue</Button> : <Button disabled={submitting} onClick={submit}>{submitting ? 'Submitting…' : 'Submit for review'}</Button>}</div>
  </CardContent></Card>
}

function VerificationQueue() {
  const { state, store } = useExecutionStore()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const queue = state.verificationRequests.filter((item) => item.status !== 'draft')
  return queue.length ? <div className='space-y-4'>{queue.map((request) => <Card key={request.id}><CardContent className='grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_380px]'><div><div className='flex flex-wrap items-center gap-2'><span className='grid size-10 place-items-center rounded-xl bg-primary/10 text-primary'><ShieldCheck /></span><b>{request.institution}</b><StatusBadge status={request.status} /></div><div className='mt-4 grid gap-3 sm:grid-cols-2'><VerificationFact label='Institutional email' value={request.institutionalEmail ?? 'Legacy demo request'} /><VerificationFact label='Applicant role' value={request.applicantRole?.replace('_', ' ') ?? 'Not recorded'} /><VerificationFact label='Student ID' value={request.studentId} /><VerificationFact label='Document metadata' value={request.document ? `${request.document.name} · ${Math.ceil(request.document.size / 1024)} KB · ${request.document.type || 'unknown type'}` : 'Not attached'} /><VerificationFact label='Consent' value={request.consentAccepted ? 'Accepted' : 'Legacy record · not recorded'} /><VerificationFact label='Supporting context' value={request.supportingNote ?? 'Not provided'} /></div></div><div className='rounded-xl border bg-muted/20 p-3'><Label>Decision note<Textarea className='mt-2 min-h-24 bg-background' value={notes[request.id] ?? request.reviewerNote ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder='Record the reason for this decision.' /></Label><div className='mt-3 flex flex-wrap gap-2'><Button size='sm' onClick={() => { store.upsertVerification({ ...request, status: 'verified', reviewerNote: notes[request.id] || 'Institution and supporting metadata reviewed.' }); toast.success('Student verified in demo queue') }}><BadgeCheck />Verify</Button><Button size='sm' variant='outline' disabled={!notes[request.id]?.trim()} onClick={() => { store.upsertVerification({ ...request, status: 'needs_changes', reviewerNote: notes[request.id] }); toast.success('Change request recorded') }}>Needs changes</Button><Button size='sm' variant='outline' disabled={!notes[request.id]?.trim()} onClick={() => { store.upsertVerification({ ...request, status: 'rejected', reviewerNote: notes[request.id] }); toast.success('Rejection recorded') }}>Reject</Button></div><p className='mt-3 text-xs leading-5 text-muted-foreground'>Every decision is persisted in the local demo state with its reviewer note.</p></div></CardContent></Card>)}</div> : <EmptyState title='Verification queue is clear' description='New student submissions will appear here for authorized reviewers.' icon={FileCheck2} />
}

function VerificationFact({ label, value }: { label: string; value: string }) { return <div className='rounded-xl border bg-muted/20 p-3'><p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p><b className='mt-1 block break-words text-sm'>{value || 'Not provided'}</b></div> }

export function GoalsPage() {
  return <WorkspacePage milestonesOnly />
}

function Setting({ icon: Icon, title, text }: { icon: typeof Eye; title: string; text: string }) { return <div className='flex gap-3 rounded-xl border p-4'><Icon className='mt-0.5 size-5 text-primary' /><div><b className='text-sm'>{title}</b><p className='mt-1 text-xs text-muted-foreground'>{text}</p></div></div> }
