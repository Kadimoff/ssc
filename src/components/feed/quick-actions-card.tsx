import { Link } from '@tanstack/react-router'
import { CalendarCheck2, ChevronRight, Send, Trophy, UserRoundSearch, type LucideIcon } from 'lucide-react'
import type { QuickAction, QuickActionIcon } from '@/data/feed-dashboard-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const actionIcons: Record<QuickActionIcon, LucideIcon> = {
  publish: Send,
  milestone: Trophy,
  cofounder: UserRoundSearch,
  mentor: CalendarCheck2,
}

function ActionContent({ action }: { action: QuickAction }) {
  const Icon = actionIcons[action.icon]
  return (
    <>
      <span className='grid size-8 shrink-0 place-items-center rounded-lg border border-primary/10 bg-primary/[0.07] text-primary transition-colors group-hover:bg-primary/12'>
        <Icon className='size-3.5' aria-hidden='true' />
      </span>
      <span className='min-w-0 flex-1 truncate text-[12px] font-semibold'>{action.label}</span>
      <ChevronRight className='size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary' aria-hidden='true' />
    </>
  )
}

export function QuickActionsCard({ actions, compact = false, className }: { actions: QuickAction[]; compact?: boolean; className?: string }) {
  const actionClassName = 'group flex min-h-11 items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-1.5 outline-none transition-all hover:border-primary/10 hover:bg-primary/[0.045] focus-visible:ring-2 focus-visible:ring-primary/50'
  return (
    <Card className={cn('gap-0 border-primary/10 bg-card/95 py-0 shadow-sm', className)}>
      <CardHeader className='px-4 pb-2 pt-4'>
        <CardTitle className='text-sm tracking-tight'>Quick actions</CardTitle>
        <p className='text-[10px] leading-4 text-muted-foreground'>Keep execution moving.</p>
      </CardHeader>
      <CardContent className={cn('grid gap-0.5 px-2.5 pb-3', compact && 'sm:grid-cols-2')}>
        {actions.map((action) => action.href === '#feed-composer' ? (
          <a key={action.id} href={action.href} className={actionClassName} aria-label={action.label}><ActionContent action={action} /></a>
        ) : (
          <Link key={action.id} to={action.href} className={actionClassName} aria-label={action.label}><ActionContent action={action} /></Link>
        ))}
      </CardContent>
    </Card>
  )
}
