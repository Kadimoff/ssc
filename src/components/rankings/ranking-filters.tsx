import { useState } from 'react'
import { Filter, RotateCcw, Search, ShieldCheck } from 'lucide-react'
import type { RankingPeriod, RankingSort } from '@/data/rankings-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type RankingFiltersProps = {
  search: string
  setSearch: (value: string) => void
  sector: string
  setSector: (value: string) => void
  sectors: string[]
  stage: string
  setStage: (value: string) => void
  stages: string[]
  university: string
  setUniversity: (value: string) => void
  universities: string[]
  period: RankingPeriod
  setPeriod: (value: RankingPeriod) => void
  verifiedOnly: boolean
  setVerifiedOnly: (value: boolean) => void
  sort: RankingSort
  setSort: (value: RankingSort) => void
  onReset: () => void
}

const selectClassName = 'h-10 min-w-0 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50'

export function RankingFilters(props: RankingFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className='rounded-2xl border border-border/80 bg-card/75 p-3 shadow-sm'>
      <div className='flex items-center gap-2'>
        <div className='relative min-w-0 flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' />
          <Input value={props.search} onChange={(event) => props.setSearch(event.target.value)} placeholder='Search ventures or universities' className='h-10 pl-9' aria-label='Search rankings' />
        </div>
        <Button variant='outline' size='sm' className='md:hidden' onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen}><Filter className='size-4' />Filters</Button>
        <Button variant='ghost' size='sm' className='hidden md:inline-flex' onClick={props.onReset}><RotateCcw className='size-3.5' />Reset</Button>
      </div>
      <div className={cn('mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2 md:grid md:grid-cols-3 xl:grid-cols-[1fr_1fr_1.35fr_1fr_1.2fr_auto_auto]', !mobileOpen && 'hidden')}>
        <label className='grid gap-1 text-[10px] font-semibold text-muted-foreground'>Sector<select className={selectClassName} value={props.sector} onChange={(event) => props.setSector(event.target.value)}>{props.sectors.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className='grid gap-1 text-[10px] font-semibold text-muted-foreground'>Stage<select className={selectClassName} value={props.stage} onChange={(event) => props.setStage(event.target.value)}>{props.stages.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className='grid gap-1 text-[10px] font-semibold text-muted-foreground'>University<select className={selectClassName} value={props.university} onChange={(event) => props.setUniversity(event.target.value)}>{props.universities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className='grid gap-1 text-[10px] font-semibold text-muted-foreground'>Time period<select className={selectClassName} value={props.period} onChange={(event) => props.setPeriod(event.target.value as RankingPeriod)}><option value='30d'>Last 30 days</option><option value='quarter'>This quarter</option><option value='all'>All records</option></select></label>
        <label className='grid gap-1 text-[10px] font-semibold text-muted-foreground'>Sort by<select className={selectClassName} value={props.sort} onChange={(event) => props.setSort(event.target.value as RankingSort)}><option value='overall'>Overall score</option><option value='growth'>Fastest growth</option><option value='milestones'>Milestone progress</option><option value='community'>Community contribution</option><option value='activity'>Newest activity</option></select></label>
        <button type='button' onClick={() => props.setVerifiedOnly(!props.verifiedOnly)} className={cn('mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/50', props.verifiedOnly ? 'border-primary/35 bg-primary/10 text-primary' : 'text-muted-foreground')} aria-pressed={props.verifiedOnly}><ShieldCheck className='size-3.5' />Verified only</button>
        <Button variant='ghost' size='sm' className='mt-auto h-10 md:hidden xl:inline-flex' onClick={props.onReset}><RotateCcw className='size-3.5' />Reset</Button>
      </div>
    </div>
  )
}
