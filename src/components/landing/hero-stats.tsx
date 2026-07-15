import { cn } from '@/lib/utils'
import { IconBuilders, IconUniversities, IconMentors, IconPartners } from './hero-icons'

type Stat = { icon: React.ReactNode; value: string; label: string; pos: string }

const STATS: Stat[] = [
  { icon: <IconBuilders />, value: '1,200+', label: 'builders', pos: 'lg:col-start-1 lg:row-start-1' },
  { icon: <IconUniversities />, value: '18', label: 'universities', pos: 'lg:col-start-3 lg:row-start-1' },
  { icon: <IconMentors />, value: '45+', label: 'mentors', pos: 'lg:col-start-1 lg:row-start-3' },
  { icon: <IconPartners />, value: '30+', label: 'partners', pos: 'lg:col-start-3 lg:row-start-3' },
]

function StatCard({ icon, value, label, pos }: Stat) {
  return (
    <div
      className={cn(
        'group relative z-10 flex min-w-[160px] items-center gap-3 whitespace-nowrap rounded-2xl',
        'border border-primary/15 bg-background/70 px-4 py-3 backdrop-blur-md',
        'shadow-[0_12px_34px_-16px_rgba(0,0,0,0.55)]',
        'transition-all duration-300 hover:border-primary/35 hover:-translate-y-0.5',
        'hover:shadow-[0_18px_40px_-18px_color-mix(in_oklch,var(--primary)_55%,transparent)]',
        'md:col-span-2 lg:col-span-1',
        pos,
      )}
    >
      <span className='relative grid size-11 shrink-0 place-items-center'>{icon}</span>
      <span className='flex flex-col leading-tight'>
        <span className='text-lg font-extrabold tracking-tight text-foreground'>{value}</span>
        <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      </span>
    </div>
  )
}

/**
 * Hero statistics cluster.
 * - lg+: 3×3 diamond — 4 cards in corners, SSC badge in the center safe cell.
 * - md: stacked — badge spans the top, cards flow 2-per-row below.
 *
 * Stable grid gaps, controlled z-index, nowrap text, min-widths — no overlap.
 */
export function HeroStats() {
  return (
    <div
      className={cn(
        'grid w-full max-w-[560px] grid-cols-1 content-center items-center gap-4',
        'md:grid-cols-2',
        'lg:min-h-[440px] lg:grid-cols-3 lg:grid-rows-[1fr_auto_1fr] lg:gap-7',
      )}
    >
      {/* Center badge — first in DOM so it sits on top in the md stack; placed
          in the center cell for the lg diamond via explicit column/row. */}
      <div className='relative z-20 flex justify-center md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2'>
        <div className='flex items-center gap-3 whitespace-nowrap rounded-2xl border border-primary/25 bg-background/80 px-5 py-3 text-center shadow-lg backdrop-blur-xl'>
          <span className='relative flex size-2.5'>
            <span className='absolute inline-flex size-2.5 animate-ping rounded-full bg-primary opacity-70' />
            <span className='relative inline-flex size-2.5 rounded-full bg-primary' />
          </span>
          <span className='flex flex-col leading-tight'>
            <span className='text-sm font-bold tracking-tight text-foreground'>Student Startup Community</span>
            <span className='text-[11px] text-muted-foreground'>Connected · Collaborative · Building</span>
          </span>
        </div>
      </div>

      {STATS.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  )
}
