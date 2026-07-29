import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Rocket, Target, UserRoundSearch, UsersRound } from 'lucide-react'
import type { StartupSummary } from '@/data/feed-dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StartupSummaryCard({ startup, compact = false, className }: { startup: StartupSummary; compact?: boolean; className?: string }) {
  return (
    <Card className={cn('h-full gap-0 overflow-hidden border-primary/10 bg-card/95 py-0 shadow-sm', className)}>
      <div className='h-1 bg-gradient-to-r from-emerald-700 via-primary to-emerald-300' />
      <CardHeader className={cn('!flex flex-row items-center gap-3 px-4 pb-3', compact ? 'pt-4' : 'pt-5')}>
        <span className='grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary'>
          <Rocket className='size-4.5' aria-hidden='true' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>My startup</p>
          <CardTitle className='mt-1 truncate text-base tracking-tight'>{startup.name}</CardTitle>
        </div>
        <Badge className='border-primary/20 bg-primary/10 text-[10px] font-bold uppercase text-primary hover:bg-primary/10'>{startup.stage}</Badge>
      </CardHeader>
      <CardContent className={cn('flex flex-1 flex-col gap-3 px-4 pb-4', compact && 'justify-between')}>
        <div className='rounded-xl border border-border/70 bg-muted/25 p-3'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='font-medium text-muted-foreground'>Profile completion</span>
            <span className='font-bold text-primary'>{startup.profileCompletion}%</span>
          </div>
          <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-muted'>
            <div className='h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400' style={{ width: `${startup.profileCompletion}%` }} />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='rounded-xl border border-border/65 bg-card p-2.5'>
            <UsersRound className='size-3.5 text-primary' aria-hidden='true' />
            <p className='mt-1.5 text-base font-extrabold tracking-tight'>{startup.activeUsers}</p>
            <p className='text-[10px] text-muted-foreground'>Active users</p>
          </div>
          <div className='rounded-xl border border-border/65 bg-card p-2.5'>
            <Target className='size-3.5 text-primary' aria-hidden='true' />
            <p className='mt-1.5 line-clamp-2 text-[11px] font-semibold leading-4'>{startup.nextMilestone}</p>
            <p className='mt-0.5 text-[10px] text-muted-foreground'>Next milestone</p>
          </div>
        </div>
        <div className='flex items-start gap-2.5 rounded-xl border border-primary/10 bg-primary/[0.045] p-3'>
          <UserRoundSearch className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'><p className='text-[10px] font-medium text-muted-foreground'>Looking for</p><p className='mt-0.5 text-[12px] font-semibold leading-4'>{startup.lookingFor}</p></div>
        </div>
        <Button variant='outline' size='sm' className='w-full justify-between border-primary/15' asChild>
          <Link to='/startups/$slug' params={{ slug: startup.slug }}>
            Open startup dashboard <ArrowUpRight className='size-3.5' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
