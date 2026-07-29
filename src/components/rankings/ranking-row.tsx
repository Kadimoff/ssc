import { useNavigate } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, BadgeCheck, ChevronRight, Minus, Rocket } from 'lucide-react'
import type { RankingEntry } from '@/data/rankings-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const scoreTone = (rank: number) => rank === 1 ? 'from-amber-500 to-emerald-500' : rank === 2 ? 'from-slate-400 to-emerald-500' : rank === 3 ? 'from-amber-700 to-emerald-500' : 'from-emerald-700 to-emerald-400'

function RankChange({ change }: { change: number }) {
  if (change > 0) return <span className='inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400' aria-label={`Up ${change} places`}><ArrowUp className='size-3.5' />{change}</span>
  if (change < 0) return <span className='inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400' aria-label={`Down ${Math.abs(change)} places`}><ArrowDown className='size-3.5' />{Math.abs(change)}</span>
  return <span className='inline-flex items-center gap-1 text-xs text-muted-foreground' aria-label='No rank change'><Minus className='size-3.5' />0</span>
}

function ScoreBar({ entry, rank }: { entry: RankingEntry; rank: number }) {
  return (
    <div className='min-w-0'>
      <div className='relative h-2.5 w-full overflow-hidden rounded-full bg-muted' role='progressbar' aria-label={`${entry.name} ranking score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={entry.score}>
        <div className={cn('flex h-full items-center justify-end rounded-full bg-gradient-to-r transition-[width] duration-300', scoreTone(rank))} style={{ width: `${entry.score}%` }}>
          {entry.score >= 30 && <Rocket className='mr-1 size-2.5 text-white/90' aria-hidden='true' />}
        </div>
      </div>
      <p className='mt-1 truncate text-[10px] text-muted-foreground'>{entry.strongestSignal}</p>
    </div>
  )
}

export function RankingRow({ entry, rank, onDetails }: { entry: RankingEntry; rank: number; onDetails: (entry: RankingEntry) => void }) {
  const navigate = useNavigate()
  const openVenture = () => navigate({ to: '/startups/$slug', params: { slug: entry.slug } })
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openVenture()
    }
  }
  return (
    <div
      role='link'
      tabIndex={0}
      onClick={openVenture}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${entry.name} venture profile`}
      className='group rounded-xl border border-border/70 bg-card/75 p-3 outline-none transition-all hover:border-primary/25 hover:bg-card hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 lg:grid lg:grid-cols-[44px_minmax(180px,1fr)_minmax(220px,2fr)_72px_64px_40px] lg:items-center lg:gap-3 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:px-4 lg:py-3 lg:last:border-b-0'
    >
      <div className='flex items-start gap-3 lg:contents'>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold lg:size-10', rank <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{rank}</span>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <span className='grid size-10 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/[0.07] text-xs font-extrabold text-primary'>{entry.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span>
          <div className='min-w-0'>
            <div className='flex min-w-0 items-center gap-1.5'><p className='truncate text-sm font-semibold group-hover:text-primary'>{entry.name}</p>{entry.verifiedEvidence && <BadgeCheck className='size-4 shrink-0 text-primary' aria-label='Verified evidence' />}</div>
            <p className='mt-0.5 line-clamp-1 text-[11px] text-muted-foreground'>{entry.university}</p>
            <div className='mt-1 flex flex-wrap gap-1'><Badge variant='secondary' className='px-1.5 py-0 text-[9px]'>{entry.sector}</Badge><Badge variant='outline' className='px-1.5 py-0 text-[9px]'>{entry.stage}</Badge></div>
          </div>
        </div>
        <div className='ml-auto flex items-center gap-2 lg:hidden'><RankChange change={entry.change} /><Button variant='ghost' size='icon' className='size-8' onClick={(event) => { event.stopPropagation(); onDetails(entry) }} aria-label={`View ${entry.name} score breakdown`}><ChevronRight className='size-4' /></Button></div>
      </div>
      <div className='mt-3 lg:mt-0'><ScoreBar entry={entry} rank={rank} /></div>
      <div className='mt-2 flex items-center justify-between lg:mt-0 lg:block lg:text-right'>
        <span className='text-xs text-muted-foreground lg:hidden'>Overall score</span>
        <div><span className='text-lg font-extrabold tracking-tight'>{entry.score}</span><span className='ml-1 text-[10px] text-muted-foreground lg:block lg:ml-0'>points</span></div>
      </div>
      <div className='hidden justify-end lg:flex'><RankChange change={entry.change} /></div>
      <Button variant='ghost' size='icon' className='hidden size-8 lg:inline-flex' onClick={(event) => { event.stopPropagation(); onDetails(entry) }} aria-label={`View ${entry.name} score breakdown`}><ChevronRight className='size-4' /></Button>
    </div>
  )
}
