import { useState } from 'react'
import {
  Bookmark, CheckCircle2, ChevronDown, ChevronRight, Columns3, FileCheck2,
  GraduationCap, MessagesSquare, Rocket, ShieldAlert, Users,
} from 'lucide-react'
import type { StartupData } from '@/data/platform-content'
import {
  investorEvidenceByStartup,
  type InvestorOpportunity,
} from '@/data/investor-workspace-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EvidenceChecklist, RiskSignals } from './evidence-checklist'
import { cn } from '@/lib/utils'

export type OpportunityInboxItem = {
  startup: StartupData
  opportunity: InvestorOpportunity
  match: number
}

const evidenceMeta = {
  verified: { label: 'Verified evidence', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  partial: { label: 'Partial evidence', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', icon: FileCheck2 },
  missing: { label: 'Evidence missing', className: 'bg-muted text-muted-foreground', icon: ShieldAlert },
}

export function OpportunityInbox({
  items,
  watched,
  compared,
  intros,
  onWatch,
  onCompare,
  onIntro,
  onReview,
  onViewAll,
}: {
  items: OpportunityInboxItem[]
  watched: Set<string>
  compared: Set<string>
  intros: Set<string>
  onWatch: (startup: StartupData) => void
  onCompare: (startup: StartupData) => void
  onIntro: (startup: StartupData) => void
  onReview: (startup: StartupData) => void
  onViewAll: () => void
}) {
  return (
    <Card id='opportunity-inbox' className='gap-0 overflow-hidden border-primary/20 py-0 shadow-sm'>
      <CardHeader className='border-b bg-primary/[0.035] px-4 py-4 sm:px-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base'><Rocket className='size-4 text-primary' />Opportunity inbox</CardTitle>
            <CardDescription className='mt-1'>Ventures that best match the active thesis and current evidence requirements.</CardDescription>
          </div>
          <Button size='sm' variant='outline' onClick={onViewAll}>Open discovery<ChevronRight /></Button>
        </div>
      </CardHeader>
      <CardContent className='divide-y px-0'>
        {items.map((item) => (
          <OpportunityRow
            key={item.startup.slug}
            item={item}
            watched={watched.has(item.startup.slug)}
            compared={compared.has(item.startup.slug)}
            introRequested={intros.has(item.startup.slug)}
            onWatch={() => onWatch(item.startup)}
            onCompare={() => onCompare(item.startup)}
            onIntro={() => onIntro(item.startup)}
            onReview={() => onReview(item.startup)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

export function OpportunityRow({
  item,
  watched,
  compared,
  introRequested,
  onWatch,
  onCompare,
  onIntro,
  onReview,
}: {
  item: OpportunityInboxItem
  watched: boolean
  compared: boolean
  introRequested: boolean
  onWatch: () => void
  onCompare: () => void
  onIntro: () => void
  onReview: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { startup, opportunity, match } = item
  const evidence = evidenceMeta[opportunity.evidenceStatus]
  const EvidenceIcon = evidence.icon
  const reviewSignals = [
    ...opportunity.teamGaps,
    ...opportunity.missingEvidence.slice(0, 2),
  ]
  return (
    <article className='p-4 transition-colors hover:bg-muted/20 sm:p-5'>
      <div className='flex flex-col gap-4'>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='grid size-11 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-sm font-extrabold text-primary'>
            {startup.name.slice(0, 2).toUpperCase()}
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <button type='button' onClick={onReview} className='truncate font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{startup.name}</button>
              <Badge variant='secondary'>{startup.sector}</Badge>
              <Badge variant='outline'>{startup.stage}</Badge>
            </div>
            <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <GraduationCap className='size-3.5 shrink-0' aria-hidden='true' />
              <span className='truncate'>{opportunity.university}</span>
            </p>
          </div>
          <div className='shrink-0 text-right'>
            <div className='text-xl font-bold text-primary'>{match}%</div>
            <div className='text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>thesis match</div>
          </div>
        </div>

        <div className='grid gap-2 sm:grid-cols-3'>
          <Signal label='Traction' value={opportunity.tractionHighlight || 'No traction update'} />
          <Signal label='Current ask' value={opportunity.currentAsk || 'No ask recorded'} />
          <Signal label='Last activity' value={opportunity.lastActivityLabel} />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Badge className={cn('gap-1 border-0', evidence.className)}>
            <EvidenceIcon className='size-3' aria-hidden='true' />{evidence.label}
          </Badge>
          <Badge variant='outline' className='gap-1'><Rocket className='size-3' />{opportunity.readiness}% readiness signal</Badge>
          <Badge variant='outline' className='gap-1'><Users className='size-3' />{opportunity.teamGaps.length ? `${opportunity.teamGaps.length} team gap` : 'Core team present'}</Badge>
          <button
            type='button'
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className='ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {expanded ? 'Hide evidence' : 'Inspect evidence'}
            <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>

        {expanded && (
          <div className='grid gap-4 rounded-xl border bg-muted/20 p-3 lg:grid-cols-[1.25fr_.75fr]'>
            <div>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>Due diligence evidence</p>
              <EvidenceChecklist items={investorEvidenceByStartup[startup.slug] ?? []} />
            </div>
            <div>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>Concrete gaps</p>
              <RiskSignals signals={reviewSignals} />
            </div>
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2'>
          <Button size='sm' variant={watched ? 'default' : 'outline'} onClick={onWatch}>
            <Bookmark className={watched ? 'fill-current' : ''} />{watched ? 'Watching' : 'Watch'}
          </Button>
          <Button size='sm' variant={compared ? 'default' : 'outline'} onClick={onCompare}><Columns3 />{compared ? 'Compared' : 'Compare'}</Button>
          <Button size='sm' variant='outline' disabled={introRequested} onClick={onIntro}><MessagesSquare />{introRequested ? 'Intro requested' : 'Request intro'}</Button>
          <Button size='sm' className='sm:ml-auto' onClick={onReview}>Review venture<ChevronRight /></Button>
        </div>
      </div>
    </article>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0 rounded-lg border bg-background/60 p-2.5'>
      <div className='text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</div>
      <div className='mt-1 text-xs font-medium leading-5'>{value}</div>
    </div>
  )
}
