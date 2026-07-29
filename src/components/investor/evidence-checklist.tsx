import { AlertCircle, CheckCircle2, Clock3, FileQuestion } from 'lucide-react'
import type { EvidenceItemStatus, InvestorEvidenceItem } from '@/data/investor-workspace-data'
import { cn } from '@/lib/utils'

const statusMeta: Record<EvidenceItemStatus, {
  label: string
  icon: typeof CheckCircle2
  className: string
}> = {
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  submitted: {
    label: 'Submitted',
    icon: Clock3,
    className: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  needs_review: {
    label: 'Needs review',
    icon: FileQuestion,
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  missing: {
    label: 'Missing',
    icon: AlertCircle,
    className: 'border-border bg-muted/50 text-muted-foreground',
  },
}

export function EvidenceChecklist({
  items,
  compact = false,
}: {
  items: InvestorEvidenceItem[]
  compact?: boolean
}) {
  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
      {items.map((item) => {
        const meta = statusMeta[item.status]
        const Icon = meta.icon
        return (
          <div key={item.label} className='flex min-w-0 items-center justify-between gap-2 rounded-lg border bg-background/60 px-2.5 py-2'>
            <span className='min-w-0 truncate text-xs font-medium'>{item.label}</span>
            <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold', meta.className)}>
              <Icon className='size-3' aria-hidden='true' />
              {meta.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function RiskSignals({ signals }: { signals: string[] }) {
  if (!signals.length) {
    return (
      <div className='flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300'>
        <CheckCircle2 className='size-3.5' aria-hidden='true' />
        No concrete review gaps recorded
      </div>
    )
  }
  return (
    <ul className='space-y-1.5'>
      {signals.map((signal) => (
        <li key={signal} className='flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300'>
          <AlertCircle className='mt-0.5 size-3.5 shrink-0' aria-hidden='true' />
          <span>{signal}</span>
        </li>
      ))}
    </ul>
  )
}
