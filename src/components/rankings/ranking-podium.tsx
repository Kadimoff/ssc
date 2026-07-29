import { ArrowDown, ArrowUp, Minus, Trophy } from 'lucide-react'
import type { RankingEntry } from '@/data/rankings-data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function RankingPodium({ entries, onSelect }: { entries: RankingEntry[]; onSelect: (entry: RankingEntry) => void }) {
  return (
    <div className='grid gap-3 md:grid-cols-3'>
      {entries.slice(0, 3).map((entry, index) => {
        const rank = index + 1
        return <Card key={entry.slug} className='gap-0 overflow-hidden border-primary/10 bg-card/85 py-0 shadow-sm'><div className={rank === 1 ? 'h-1 bg-gradient-to-r from-amber-400 via-primary to-emerald-300' : 'h-1 bg-gradient-to-r from-muted via-primary/50 to-transparent'} /><CardContent className='p-4'><button type='button' onClick={() => onSelect(entry)} className='w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50'><div className='flex items-start gap-3'><span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Trophy className='size-4.5' /></span><div className='min-w-0 flex-1'><div className='flex items-center justify-between gap-2'><p className='truncate text-sm font-bold'>#{rank} {entry.name}</p><span className='inline-flex items-center gap-0.5 text-xs font-semibold'>{entry.change > 0 ? <ArrowUp className='size-3 text-emerald-500' /> : entry.change < 0 ? <ArrowDown className='size-3 text-rose-500' /> : <Minus className='size-3 text-muted-foreground' />}{Math.abs(entry.change)}</span></div><p className='mt-0.5 truncate text-[11px] text-muted-foreground'>{entry.university}</p></div></div><div className='mt-4 flex items-end justify-between'><div><p className='text-2xl font-extrabold'>{entry.score}</p><p className='text-[10px] text-muted-foreground'>overall points</p></div><Badge variant='outline'>{entry.stage}</Badge></div><p className='mt-3 line-clamp-2 text-[11px] leading-4 text-muted-foreground'>{entry.strongestSignal}</p></button></CardContent></Card>
      })}
    </div>
  )
}
