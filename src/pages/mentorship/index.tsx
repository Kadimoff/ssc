import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { BadgeCheck, CalendarDays, Check, GraduationCap, MessagesSquare, Search, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { mentors as staticMentors, type MentorData } from '@/data/platform-content'
import type { EntityId } from '@/data/types'
import { PageContainer, PageHeading } from '@/app/app-shared'
import { apiClient } from '@/data/client'
import { useSnapshot } from '@/app/app-data'
import { MatchWorkbench } from '@/features/assistant/match-workbench'

export function MentorshipPage() {
  const { data } = useSnapshot()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [expertise, setExpertise] = useState('All')
  const [stage, setStage] = useState('All')
  const [booked, setBooked] = useState<Set<EntityId>>(() => new Set(JSON.parse(localStorage.getItem('ssc.mentorBookings.v1') ?? '[]')))
  const [booking, setBooking] = useState<MentorData | null>(null)

  const mentors = data?.mentors?.length ? data.mentors : staticMentors
  const activeMentors = mentors.filter((m) => m.status !== 'suspended')
  const expertiseList = ['All', ...Array.from(new Set(activeMentors.flatMap((m) => m.expertise)))]
  const stageList = ['All', ...Array.from(new Set(activeMentors.map((m) => m.focusStage)))]
  const filtered = activeMentors.filter((m) =>
    (expertise === 'All' || m.expertise.includes(expertise)) &&
    (stage === 'All' || m.focusStage === stage) &&
    `${m.name} ${m.title} ${m.expertise.join(' ')} ${m.bio}`.toLowerCase().includes(query.toLowerCase()),
  )
  const bookedMentors = activeMentors.filter((m) => booked.has(m.id))
  const rateMentor = (mentor: MentorData) => {
    const value = window.prompt(`Rate your session with ${mentor.name} from 1 to 5`)
    if (!value) return
    const rating = Number(value)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return toast.error('Enter a whole number from 1 to 5.')
    const key = 'ssc.mentorRatings.v1'
    const ratings = JSON.parse(localStorage.getItem(key) ?? '{}')
    localStorage.setItem(key, JSON.stringify({ ...ratings, [mentor.id]: rating }))
    toast.success('Session feedback saved')
  }

  return <PageContainer>
    <PageHeading eyebrow='Mentorship' title='Mentors who shorten your path.' description='Discover operators by expertise, book goal-led sessions, and keep structured feedback tied to your startup — not vague impressions.' />
    {data && <MatchWorkbench snapshot={data} mode='mentor' />}

    {bookedMentors.length > 0 && (
      <Card className='glass-card mb-6 overflow-hidden p-0'><CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-primary' /> Your sessions</CardTitle><CardDescription>{bookedMentors.length} booked</CardDescription></CardHeader>
        <CardContent className='flex gap-3 overflow-x-auto pb-3'>{bookedMentors.map((m) => (
          <div key={m.id} className='flex w-56 shrink-0 flex-col gap-1 rounded-xl border bg-card/60 p-3'>
            <div className='flex items-center gap-2'><span className='grid size-8 place-items-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-500'>{m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span><b className='truncate text-sm'>{m.name}</b></div>
            <span className='text-xs text-muted-foreground'>{m.focusStage}</span>
            <div className='mt-1 flex gap-1'><Badge variant='secondary' className='gap-1 text-[10px]'><Video className='size-2.5' />Video · Thu</Badge></div>
            <Button size='sm' variant='outline' className='mt-2' onClick={() => rateMentor(m)}>Rate session</Button>
          </div>
        ))}</CardContent>
      </Card>
    )}

    <div className='mb-4 relative max-w-xl'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-9' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search expertise, industry or mentor' /></div>
    <div className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>Expertise</div>
    <div className='mb-4 flex flex-wrap gap-1.5'>{expertiseList.map((e) => <button key={e} onClick={() => setExpertise(e)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-all', expertise === e ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{e}</button>)}</div>
    <div className='mb-6 flex flex-wrap gap-1.5'>{stageList.map((s) => <button key={s} onClick={() => setStage(s)} className={cn('rounded-full border px-3 py-1 text-[11px] font-medium transition-all', stage === s ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : 'border-border text-muted-foreground hover:text-foreground')}>{s}</button>)}</div>

    <div className='grid gap-5 lg:grid-cols-2 xl:grid-cols-3'>{filtered.map((m) => (
      <Card key={m.id} className='glass-card flex flex-col'>
        <CardHeader className='flex-row items-start gap-3 space-y-0'>
          <span className='grid size-12 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-500'>{m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'><CardTitle className='text-base'>{m.name}</CardTitle>{m.status === 'active' && <BadgeCheck className='size-4 text-primary' aria-label='Verified mentor' />}</div>
            <CardDescription className='truncate'>{m.title}</CardDescription>
          </div>
          <Badge variant='outline' className='gap-1 text-[10px]'><span className='text-amber-500'>★</span>{m.rating.toFixed(1)}</Badge>
        </CardHeader>
        <CardContent className='flex-1 space-y-3'>
          <p className='text-sm leading-relaxed text-muted-foreground'>{m.bio}</p>
          <div className='flex flex-wrap gap-1'>{m.expertise.map((e) => <Badge key={e} variant='secondary' className='text-[10px]'>{e}</Badge>)}</div>
          <div className='flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground'>
            <span className='inline-flex items-center gap-1'><BadgeCheck className='size-3 text-primary' />{m.focusStage}</span>
            <span className='inline-flex items-center gap-1'><CalendarDays className='size-3' />{m.sessions} sessions</span>
            <span className='inline-flex items-center gap-1'><Video className='size-3' />{m.availability}</span>
          </div>
        </CardContent>
        <CardFooter className='gap-2 border-t'>
          {booked.has(m.id)
            ? <Button size='sm' variant='outline' className='flex-1' disabled><Check className='size-3.5' />Session booked</Button>
            : <Button size='sm' className='flex-1' onClick={() => setBooking(m)}><CalendarDays className='size-3.5' />Book session</Button>}
          <Button size='sm' variant='ghost' onClick={async () => { const user = data?.users.find((item) => item.name === m.name); if (!user) return toast.error('This mentor does not have a messaging account yet.'); await apiClient.ensureConversation(user.id); navigate({ to: '/messages' }) }}><MessagesSquare className='size-4' /></Button>
        </CardFooter>
      </Card>
    ))}
      {filtered.length === 0 && <Card className='border-dashed lg:col-span-2 xl:col-span-3'><CardContent className='py-16 text-center'><GraduationCap className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='font-medium'>No mentors match</p><p className='text-sm text-muted-foreground'>Adjust expertise or stage filters.</p></CardContent></Card>}
    </div>

    <BookingDialog key={booking?.id ?? 'closed'} mentor={booking} onClose={() => setBooking(null)} onConfirm={() => { if (booking) { setBooked((prev) => { const next = new Set(prev).add(booking.id); localStorage.setItem('ssc.mentorBookings.v1', JSON.stringify([...next])); return next }); toast.success(`Session booked with ${booking.name}.`) }; setBooking(null) }} />
  </PageContainer>
}

function BookingDialog({ mentor, onClose, onConfirm }: { mentor: MentorData | null; onClose: () => void; onConfirm: () => void }) {
  const [goal, setGoal] = useState('')
  const [focus, setFocus] = useState('')
  const [stagePick, setStagePick] = useState('Validation')
  const [format, setFormat] = useState<'video' | 'async'>('video')
  const [when, setWhen] = useState('')
  const valid = goal.trim().length > 8
  return <Dialog open={!!mentor} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className='max-w-lg'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'><GraduationCap className='size-5 text-amber-500' /> Book a session with {mentor?.name}</DialogTitle>
        <DialogDescription>{mentor?.title} · {mentor?.focusStage}. Define your goal so the mentor can prepare — expectations first.</DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <div>
          <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Your goal for this session</Label>
          <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder='e.g. Pressure-test our pricing model and prep for a pre-seed raise conversation.' className='min-h-[80px]' />
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Your startup stage</Label>
            <div className='flex flex-wrap gap-1'>{['Idea', 'Validation', 'MVP', 'Revenue'].map((s) => <button key={s} onClick={() => setStagePick(s)} className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all', stagePick === s ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{s}</button>)}</div>
          </div>
          <div>
            <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Format</Label>
            <div className='flex gap-1'>{[{ k: 'video', l: 'Video call', I: Video }, { k: 'async', l: 'Async review', I: MessagesSquare }].map((o) => <button key={o.k} onClick={() => setFormat(o.k as 'video' | 'async')} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all', format === o.k ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : 'border-border text-muted-foreground hover:text-foreground')}><o.I className='size-3' />{o.l}</button>)}</div>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div><Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Focus area</Label><Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder='Fundraising, GTM…' /></div>
          <div><Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Preferred time</Label><Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder='Thu afternoon' /></div>
        </div>
      </div>
      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={onConfirm}><Check className='size-4' />Confirm booking</Button>
      </div>
    </DialogContent>
  </Dialog>
}
