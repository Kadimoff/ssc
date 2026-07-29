import { useState } from 'react'
import {
  BellRing, CalendarClock, Check, CheckCircle2, ChevronRight, Circle,
  FileCheck2, ListChecks, MapPin, SlidersHorizontal, Sparkles, Workflow,
} from 'lucide-react'
import type { StartupData } from '@/data/platform-content'
import {
  initialInvestorTasks,
  type InvestorActivity,
  type InvestorAlert,
  type InvestorMeeting,
  type InvestorPipelineStage,
  type InvestorTask,
  type SavedInvestorThesis,
} from '@/data/investor-workspace-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TASKS_KEY = 'ssc.investorTasks.v1'
const stageLabels = {
  sourced: 'Sourced',
  screening: 'Screening',
  meeting: 'Meeting',
  diligence: 'Diligence',
  passed: 'Passed',
}

export function SavedThesisCard({ thesis, onEdit }: { thesis: SavedInvestorThesis; onEdit: () => void }) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2 text-sm'><SlidersHorizontal className='size-4 text-primary' />My investment thesis</CardTitle>
            <CardDescription className='mt-1'>{thesis.name}</CardDescription>
          </div>
          <Button size='sm' variant='ghost' onClick={onEdit}>Edit</Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 p-4 text-xs'>
        <ThesisField label='Sectors' value={thesis.sectors.join(', ')} />
        <ThesisField label='Stages' value={thesis.stages.join(', ')} />
        <ThesisField label='Geography' value={thesis.geography} />
        <div className='grid grid-cols-2 gap-2'>
          <ThesisField label='Minimum readiness' value={`${thesis.minimumReadiness}% signal`} />
          <ThesisField label='Ticket range' value={thesis.ticketRange || 'Not set'} />
        </div>
        <ThesisField label='Evidence' value={thesis.evidenceRequirement} />
        <ThesisField label='Team' value={thesis.teamRequirement} />
      </CardContent>
    </Card>
  )
}

export function WatchlistActivityCard({
  activities,
  startups,
  watched,
  onOpen,
}: {
  activities: InvestorActivity[]
  startups: StartupData[]
  watched: Set<string>
  onOpen: (slug: string) => void
}) {
  const visible = activities.filter((item) => watched.has(item.startupId)).slice(0, 4)
  return (
    <Card id='watchlist-updates' className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4 sm:px-5'>
        <CardTitle className='flex items-center gap-2 text-base'><FileCheck2 className='size-4 text-primary' />Watchlist updates</CardTitle>
        <CardDescription>New evidence, milestones and team signals from watched ventures.</CardDescription>
      </CardHeader>
      <CardContent className='divide-y px-4 sm:px-5'>
        {visible.length ? visible.map((activity) => {
          const startup = startups.find((item) => item.slug === activity.startupId)
          if (!startup) return null
          return (
            <button
              type='button'
              key={activity.id}
              onClick={() => onOpen(activity.startupId)}
              className='group flex w-full items-start gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              <span className='mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 font-bold text-primary'>{startup.name.slice(0, 1)}</span>
              <span className='min-w-0 flex-1 text-xs leading-5'><b>{startup.name}</b> {activity.message}<span className='block text-[10px] text-muted-foreground'>{activity.timestamp}</span></span>
              <ChevronRight className='mt-2 size-4 text-muted-foreground group-hover:text-primary' />
            </button>
          )
        }) : <div className='py-7 text-center text-xs text-muted-foreground'>Watch a venture to receive its latest workspace signals.</div>}
      </CardContent>
    </Card>
  )
}

export function PipelinePreview({
  startups,
  pipeline,
  onOpenPipeline,
  onOpenVenture,
}: {
  startups: StartupData[]
  pipeline: Record<string, InvestorPipelineStage>
  onOpenPipeline: () => void
  onOpenVenture: (slug: string) => void
}) {
  return (
    <Card id='pipeline-preview' className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4 sm:px-5'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base'><Workflow className='size-4 text-primary' />Pipeline preview</CardTitle>
            <CardDescription>Current browser-persisted review workflow.</CardDescription>
          </div>
          <Button size='sm' variant='outline' onClick={onOpenPipeline}>Open full pipeline<ChevronRight /></Button>
        </div>
      </CardHeader>
      <CardContent className='grid gap-2 p-4 sm:grid-cols-5'>
        {(Object.keys(stageLabels) as InvestorPipelineStage[]).map((stage) => {
          const entries = startups.filter((startup) => (pipeline[startup.slug] ?? 'sourced') === stage)
          return (
            <div key={stage} className='min-w-0 rounded-lg border bg-muted/20 p-2.5'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>{stageLabels[stage]}</span>
                <Badge variant='outline' className='px-1.5 text-[9px]'>{entries.length}</Badge>
              </div>
              <div className='mt-2 space-y-1'>
                {entries.slice(0, 2).map((startup) => (
                  <button key={startup.slug} type='button' onClick={() => onOpenVenture(startup.slug)} className='block w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{startup.name}</button>
                ))}
                {!entries.length && <span className='block py-0.5 text-[10px] text-muted-foreground'>No ventures</span>}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function UpcomingMeetingsCard({
  meetings,
  startups,
  onOpen,
}: {
  meetings: InvestorMeeting[]
  startups: StartupData[]
  onOpen: (slug: string) => void
}) {
  return (
    <Card id='upcoming-meetings' className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4'>
        <CardTitle className='flex items-center gap-2 text-sm'><CalendarClock className='size-4 text-primary' />Upcoming meetings</CardTitle>
        <CardDescription>Scheduled founder and evidence reviews.</CardDescription>
      </CardHeader>
      <CardContent className='divide-y px-4'>
        {meetings.map((meeting) => {
          const startup = startups.find((item) => item.slug === meeting.startupId)
          return (
            <div key={meeting.id} className='py-3'>
              <div className='flex items-start gap-2.5'>
                <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary'>{startup?.team[0]?.name.slice(0, 1) ?? 'S'}</span>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-semibold'>{meeting.title}</p>
                  <p className='mt-1 text-[10px] font-medium text-primary'>{meeting.dateLabel} · {meeting.meetingType}</p>
                  {meeting.agenda && <p className='mt-1 text-[10px] leading-4 text-muted-foreground'>Agenda: {meeting.agenda}</p>}
                </div>
              </div>
              <Button size='sm' variant='ghost' className='mt-1 h-7 w-full justify-between px-2 text-[11px]' onClick={() => onOpen(meeting.startupId)}>View details<ChevronRight /></Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function InvestorTasksCard() {
  const [tasks, setTasks] = useState<InvestorTask[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(TASKS_KEY) ?? 'null')
      return Array.isArray(stored) ? stored : initialInvestorTasks
    } catch {
      return initialInvestorTasks
    }
  })
  const toggle = (id: string) => {
    setTasks((current) => {
      const next = current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)
      localStorage.setItem(TASKS_KEY, JSON.stringify(next))
      return next
    })
  }
  return (
    <Card id='investor-tasks' className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4'>
        <CardTitle className='flex items-center gap-2 text-sm'><ListChecks className='size-4 text-primary' />Tasks and follow-ups</CardTitle>
        <CardDescription>{tasks.filter((task) => !task.completed).length} actions still open.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-1 p-3'>
        {tasks.map((task) => (
          <button
            type='button'
            key={task.id}
            onClick={() => toggle(task.id)}
            className='flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {task.completed ? <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-primary' /> : <Circle className='mt-0.5 size-4 shrink-0 text-muted-foreground' />}
            <span className={cn('min-w-0 flex-1 text-xs leading-5', task.completed && 'text-muted-foreground line-through')}>{task.title}</span>
            <span className='shrink-0 text-[9px] font-medium text-muted-foreground'>{task.dueLabel}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentAlertsCard({ alerts }: { alerts: InvestorAlert[] }) {
  const icons = {
    signal: Sparkles,
    evidence: FileCheck2,
    intro: Check,
    program: MapPin,
  }
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='border-b px-4 py-4'>
        <CardTitle className='flex items-center gap-2 text-sm'><BellRing className='size-4 text-primary' />Recent alerts</CardTitle>
        <CardDescription>Signals that may change your next review action.</CardDescription>
      </CardHeader>
      <CardContent className='divide-y px-4'>
        {alerts.map((alert) => {
          const Icon = icons[alert.tone]
          return (
            <div key={alert.id} className='flex items-start gap-2.5 py-3'>
              <span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'><Icon className='size-3.5' /></span>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold'>{alert.title}</p>
                <p className='mt-0.5 text-[10px] leading-4 text-muted-foreground'>{alert.detail}</p>
                <p className='mt-1 text-[9px] font-medium text-muted-foreground'>{alert.timestamp}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ThesisField({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg bg-muted/35 p-2.5'>
      <div className='text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</div>
      <div className='mt-1 leading-5 text-foreground'>{value}</div>
    </div>
  )
}
