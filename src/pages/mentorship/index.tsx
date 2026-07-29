import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, CalendarDays, CheckCircle2, Clock3, GraduationCap, Search, Sparkles, Star, Video } from 'lucide-react'
import { toast } from 'sonner'
import { useSnapshot } from '@/app/app-data'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { DemoDataBadge, EmptyState, ResponsiveDialog, StatusBadge } from '@/components/execution-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mentors as staticMentors, type MentorData } from '@/data/platform-content'
import { useExecutionStore } from '@/features/execution/store'
import type { MentorSession } from '@/features/execution/types'
import { cn } from '@/lib/utils'
import { MatchWorkbench } from '@/features/assistant/match-workbench'

export function MentorshipPage() {
  const { data } = useSnapshot()
  const { state } = useExecutionStore()
  const [query, setQuery] = useState('')
  const [expertise, setExpertise] = useState('All')
  const [booking, setBooking] = useState<MentorData | null>(null)
  const [feedbackSession, setFeedbackSession] = useState<MentorSession | null>(null)
  if (!data) return <PageLoading />
  const mentors = (data.mentors?.length ? data.mentors : staticMentors).filter((mentor) => mentor.status !== 'suspended')
  const expertiseOptions = ['All', ...new Set(mentors.flatMap((mentor) => mentor.expertise))]
  const filtered = mentors.filter((mentor) => (expertise === 'All' || mentor.expertise.includes(expertise)) && `${mentor.name} ${mentor.title} ${mentor.bio} ${mentor.expertise.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const sessions = state.mentorSessions.filter((session) => session.founderId === data.currentUser?.id || session.mentorId === data.currentUser?.id || state.selectedPersona === 'founder')

  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Sample mentor availability' /></div>
    <PageHeading eyebrow='Mentorship' title='Book around a decision, leave with an action.' description='See why each mentor matches, prepare a complete session brief, and keep feedback and follow-ups tied to startup milestones.' />
    <MatchWorkbench snapshot={data} mode='mentor' />

    <section className='mb-8'>
      <div className='mb-3 flex items-center justify-between'><div><h2 className='text-xl font-bold'>Your sessions</h2><p className='text-sm text-muted-foreground'>Upcoming and completed founder work.</p></div></div>
      {sessions.length ? <div className='grid min-w-0 gap-4 lg:grid-cols-2'>{sessions.map((session) => <Card key={session.id} className='min-w-0 overflow-hidden'><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><Badge><CalendarDays className='size-3' />{new Date(session.scheduledAt).toLocaleString()}</Badge><StatusBadge status={session.status} /></div><CardTitle className='pt-2'>{session.topic}</CardTitle><CardDescription>{session.mentorName} · {session.durationMinutes} minutes · {session.format.replace('_', ' ')}</CardDescription></CardHeader><CardContent className='space-y-3'><p className='text-sm'><b>Session goal:</b> {session.goal}</p>{session.challenge && <p className='rounded-xl border bg-muted/20 p-3 text-sm'><b>Current challenge:</b> <span className='text-muted-foreground'>{session.challenge}</span></p>}{session.actionItems.length > 0 && <div className='space-y-2'>{session.actionItems.map((item) => <div key={item.id} className='flex items-start gap-2 rounded-lg border p-3 text-sm'><CheckCircle2 className={item.complete ? 'fill-primary/15 text-primary' : 'text-muted-foreground'} /><div><p>{item.text}</p>{(item.ownerName || item.dueAt) && <p className='mt-1 text-xs text-muted-foreground'>{item.ownerName || 'Founder'}{item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ''}</p>}</div></div>)}</div>}</CardContent><CardFooter className='flex-wrap gap-2 border-t'><Button variant='outline' asChild><Link to='/live'><Video />Open session room</Link></Button><Button onClick={() => setFeedbackSession(session)}>{session.rating ? 'View feedback' : 'Complete & reflect'}</Button></CardFooter></Card>)}</div> : <EmptyState title='No mentor sessions booked' description='Choose a mentor below and book around one concrete decision.' icon={GraduationCap} />}
    </section>

    <div className='mb-5 flex flex-col gap-3 md:flex-row'><div className='relative min-w-0 flex-1'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='h-11 pl-10' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search expertise, industry, or mentor' /></div><div className='no-scrollbar flex gap-2 overflow-x-auto'>{expertiseOptions.map((item) => <button key={item} type='button' onClick={() => setExpertise(item)} className={cn('min-h-11 shrink-0 rounded-full border px-3 text-xs font-semibold', expertise === item ? 'border-primary/35 bg-primary/10 text-primary' : 'text-muted-foreground')}>{item}</button>)}</div></div>

    <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{filtered.map((mentor, index) => {
      const reason = matchReason(mentor, index)
      const languages = 'languages' in mentor && Array.isArray(mentor.languages) ? mentor.languages : ['Azerbaijani', 'English']
      const sectors = 'sectors' in mentor && Array.isArray(mentor.sectors) ? mentor.sectors : [mentor.company]
      return <Card key={mentor.id} className='flex flex-col'><CardHeader><div className='flex items-start gap-3'><span className='grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 font-bold text-primary'>{mentor.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className='min-w-0'><div className='flex items-center gap-2'><CardTitle className='text-base'>{mentor.name}</CardTitle><BadgeCheck className='size-4 text-primary' aria-label='Verified mentor' /></div><CardDescription>{mentor.title}</CardDescription></div></div></CardHeader><CardContent className='flex-1'><div className='flex flex-wrap gap-1'>{mentor.expertise.slice(0, 4).map((item) => <Badge key={item} variant='secondary'>{item}</Badge>)}</div><div className='mt-3 grid grid-cols-2 gap-2 text-xs'><div className='rounded-lg border p-2'><span className='text-muted-foreground'>Stage</span><b className='mt-1 block'>{mentor.focusStage}</b></div><div className='rounded-lg border p-2'><span className='text-muted-foreground'>Languages</span><b className='mt-1 block'>{languages.join(', ')}</b></div><div className='col-span-2 rounded-lg border p-2'><span className='text-muted-foreground'>Sectors</span><b className='mt-1 block'>{sectors.join(' · ')}</b></div></div><p className='mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground'>{mentor.bio}</p><div className='mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3'><p className='flex items-center gap-2 text-xs font-bold text-primary'><Sparkles className='size-3.5' />Why this match</p><p className='mt-1 text-xs leading-5 text-muted-foreground'>{reason}</p></div><div className='mt-4 flex items-center justify-between text-xs text-muted-foreground'><span className='flex items-center gap-1'><Star className='size-3.5 fill-amber-400 text-amber-400' />{Math.max(0, Math.min(5, mentor.rating)).toFixed(1)} · {Math.max(0, mentor.sessions)} sessions</span><span className='flex items-center gap-1'><Clock3 className='size-3.5' />{mentor.availability}</span></div></CardContent><CardFooter className='border-t'><Button className='w-full' onClick={() => setBooking(mentor)}><CalendarDays />Book goal-led session</Button></CardFooter></Card>
    })}</div>

    <BookingDialog mentor={booking} onClose={() => setBooking(null)} founderId={data.currentUser?.id ?? 'usr_9'} />
    <FeedbackDialog session={feedbackSession} onClose={() => setFeedbackSession(null)} />
  </PageContainer>
}

function BookingDialog({ mentor, onClose, founderId }: { mentor: MentorData | null; onClose: () => void; founderId: string }) {
  const { state, store } = useExecutionStore()
  const [topic, setTopic] = useState('')
  const [goal, setGoal] = useState('')
  const [startupContext, setStartupContext] = useState('')
  const [challenge, setChallenge] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [expectedOutcome, setExpectedOutcome] = useState('')
  const [scheduledAt, setScheduledAt] = useState('2026-08-06T14:00')
  const [duration, setDuration] = useState('45')
  const [format, setFormat] = useState<MentorSession['format']>('video')
  const startupSlug = state.memberships.find((item) => item.userId === founderId)?.startupSlug ?? 'campus-cart'
  const valid = topic.trim().length >= 3 && goal.trim().length >= 10 && startupContext.trim().length >= 10 && challenge.trim().length >= 10 && expectedOutcome.trim().length >= 10 && Boolean(scheduledAt)
  return <ResponsiveDialog open={Boolean(mentor)} onOpenChange={(open) => !open && onClose()} title={`Book ${mentor?.name ?? 'mentor'}`} description='Prepare enough context for the mentor to help with one concrete decision.' footer={<><Button variant='outline' onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { if (!mentor) return; store.addSession({ mentorId: mentor.id, mentorName: mentor.name, founderId, startupSlug, topic: topic.trim(), goal: goal.trim(), startupContext: startupContext.trim(), challenge: challenge.trim(), materialUrl: materialUrl.trim() || undefined, expectedOutcome: expectedOutcome.trim(), scheduledAt: new Date(scheduledAt).toISOString(), durationMinutes: Number(duration), format }); toast.success('Mentor session booked in demo workspace'); onClose() }}>Confirm booking</Button></>}><div className='grid gap-4'>
    <Label>Session topic<Input className='mt-2' value={topic} onChange={(event) => setTopic(event.target.value)} placeholder='Marketplace trust model' /></Label>
    <Label>Session goal<Textarea className='mt-2' value={goal} onChange={(event) => setGoal(event.target.value)} placeholder='By the end of the session, I need to decide…' /></Label>
    <Label>Startup context<Textarea className='mt-2' value={startupContext} onChange={(event) => setStartupContext(event.target.value)} placeholder='Stage, user, product and the progress already made.' /></Label>
    <Label>Current challenge<Textarea className='mt-2' value={challenge} onChange={(event) => setChallenge(event.target.value)} placeholder='What is blocked, uncertain or competing for attention?' /></Label>
    <Label>Expected outcome<Textarea className='mt-2' value={expectedOutcome} onChange={(event) => setExpectedOutcome(event.target.value)} placeholder='A decision, test, owner and next checkpoint.' /></Label>
    <Label>Preparation material (optional)<Input className='mt-2' type='url' value={materialUrl} onChange={(event) => setMaterialUrl(event.target.value)} placeholder='https://…' /></Label>
    <div className='grid gap-4 sm:grid-cols-2'><Label>Date and time<Input className='mt-2' type='datetime-local' value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></Label><Label>Duration<select className='mt-2 h-11 w-full rounded-lg border bg-background/55 px-3' value={duration} onChange={(event) => setDuration(event.target.value)}><option value='30'>30 minutes</option><option value='45'>45 minutes</option><option value='60'>60 minutes</option></select></Label></div>
    <Label>Format<select className='mt-2 h-11 w-full rounded-lg border bg-background/55 px-3' value={format} onChange={(event) => setFormat(event.target.value as MentorSession['format'])}><option value='video'>Video</option><option value='in_person'>In person</option></select></Label>
    <div className='rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground'>Linked startup: <b className='text-foreground'>{startupSlug}</b>. No calendar invitation or external message is sent in demo mode.</div>
  </div></ResponsiveDialog>
}

function FeedbackDialog({ session, onClose }: { session: MentorSession | null; onClose: () => void }) {
  const { state, store } = useExecutionStore()
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [action, setAction] = useState('')
  const [milestoneId, setMilestoneId] = useState('')
  const [followUpAt, setFollowUpAt] = useState('2026-08-20')
  const [ownerName, setOwnerName] = useState('Founder')
  const [dueAt, setDueAt] = useState('2026-08-12')
  const milestones = state.milestones.filter((item) => item.startupSlug === session?.startupSlug)
  return <ResponsiveDialog open={Boolean(session)} onOpenChange={(open) => !open && onClose()} title='Complete session and reflect' description='Capture structured feedback, an owned action, and an optional follow-up.' footer={<><Button variant='outline' onClick={onClose}>Cancel</Button><Button disabled={feedback.trim().length < 5 || action.trim().length < 3 || ownerName.trim().length < 2} onClick={() => { if (!session) return; store.updateSession(session.id, { status: 'complete', rating, feedback: feedback.trim(), followUpAt: new Date(followUpAt).toISOString(), actionItems: [...session.actionItems, { id: `action_${Date.now()}`, text: action.trim(), milestoneId: milestoneId || undefined, ownerName: ownerName.trim(), dueAt, complete: false }] }); toast.success('Structured session feedback saved'); onClose() }}>Save feedback</Button></>}><div className='grid gap-4'><fieldset><legend className='text-sm font-medium'>Session value</legend><div className='mt-2 flex gap-2'>{[1, 2, 3, 4, 5].map((value) => <button type='button' key={value} onClick={() => setRating(value)} aria-label={`${value} stars`} aria-pressed={rating === value} className={cn('grid size-11 place-items-center rounded-xl border', rating >= value && 'border-amber-400 bg-amber-400/10 text-amber-500')}><Star className={cn('size-5', rating >= value && 'fill-current')} /></button>)}</div></fieldset><Label>What changed?<Textarea className='mt-2' value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder='The decision, assumption, or plan that became clearer…' /></Label><Label>Founder action item<Input className='mt-2' value={action} onChange={(event) => setAction(event.target.value)} placeholder='One observable next action' /></Label><div className='grid gap-4 sm:grid-cols-2'><Label>Owner<Input className='mt-2' value={ownerName} onChange={(event) => setOwnerName(event.target.value)} /></Label><Label>Action deadline<Input className='mt-2' type='date' value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></Label></div><Label>Linked milestone<select className='mt-2 h-11 w-full rounded-lg border bg-background/55 px-3' value={milestoneId} onChange={(event) => setMilestoneId(event.target.value)}><option value=''>No linked milestone</option>{milestones.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Label><Label>Follow-up date<Input className='mt-2' type='date' value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></Label>{session?.feedback && <div className='rounded-xl bg-muted p-3 text-sm'><b>Saved feedback:</b> {session.feedback}</div>}</div></ResponsiveDialog>
}

function matchReason(mentor: MentorData, index: number) {
  const reasons = [
    `Your active validation milestone overlaps with ${mentor.expertise.slice(0, 2).join(' and ')}.`,
    `Your startup stage matches this mentor’s ${mentor.focusStage} focus and current office hours.`,
    `Your open team and evidence gaps benefit from ${mentor.expertise[0] ?? 'operator'} experience.`,
  ]
  return reasons[index % reasons.length]
}
