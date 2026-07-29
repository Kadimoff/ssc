import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InvestorActionKpi({
  label,
  value,
  change,
  context,
  icon: Icon,
  onClick,
}: {
  label: string
  value: string | number
  change: string
  context: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group min-w-0 rounded-xl border bg-card p-4 text-left shadow-sm transition-all duration-200 last:col-span-2 sm:last:col-span-1',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <span className='grid size-9 place-items-center rounded-lg bg-primary/10 text-primary'><Icon className='size-4' aria-hidden='true' /></span>
        <ArrowUpRight className='size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' aria-hidden='true' />
      </div>
      <div className='mt-4 text-2xl font-bold tracking-tight'>{value}</div>
      <div className='mt-0.5 text-xs font-semibold'>{label}</div>
      <div className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground'>
        <span className='font-semibold text-emerald-700 dark:text-emerald-300'>{change}</span>
        <span>{context}</span>
      </div>
    </button>
  )
}
