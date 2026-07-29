import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarClock, Clock3, Video } from 'lucide-react'
import type { MentorSession } from '@/data/feed-dashboard-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function MentorSessionCard({ session, className }: { session: MentorSession; className?: string }) {
  return (
    <Card className={cn('gap-0 overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-emerald-50/80 py-0 shadow-sm dark:to-emerald-950/25', className)}>
      <CardHeader className='!flex flex-row items-center gap-3 px-4 pb-3 pt-4'>
        <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
          <CalendarClock className='size-4' aria-hidden='true' />
        </span>
        <div className='min-w-0'>
          <p className='text-[10px] font-bold uppercase tracking-[0.13em] text-primary'>Next mentor session</p>
          <CardTitle className='mt-1 text-sm leading-5'>{session.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <p className='text-[12px] font-semibold'>with {session.mentor}</p>
        <div className='mt-3 grid grid-cols-2 gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/70 px-2 py-1.5 text-[10px] font-medium'><Clock3 className='size-3 text-primary' />{session.dateLabel}</span>
          <span className='inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/70 px-2 py-1.5 text-[10px] font-medium'><Video className='size-3 text-primary' />{session.duration} · {session.location}</span>
        </div>
        {session.note && <p className='mt-3 rounded-lg border-l-2 border-primary/40 bg-primary/[0.045] px-2.5 py-2 text-[10px] leading-4 text-muted-foreground'>{session.note}</p>}
        <Button variant='ghost' size='sm' className='mt-2 w-full justify-between px-2 text-primary hover:bg-primary/[0.06] hover:text-primary' asChild>
          <Link to='/mentorship'>View session <ArrowRight className='size-3.5' /></Link>
        </Button>
      </CardContent>
    </Card>
  )
}
