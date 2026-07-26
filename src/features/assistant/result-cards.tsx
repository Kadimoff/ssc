import { Link } from '@tanstack/react-router'
import { Bot, BriefcaseBusiness, Building2, ChevronRight, GraduationCap, Rocket, Route, UserRound } from 'lucide-react'
import type { AssistantEntityType, AssistantResponse } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const entityIcons: Record<AssistantEntityType, typeof Bot> = {
  person: UserRound,
  mentor: GraduationCap,
  job: BriefcaseBusiness,
  startup: Rocket,
  program: Route,
  organization: Building2,
  guide: Bot,
}

const actionLabels: Record<AssistantEntityType, string> = {
  person: 'View profile',
  mentor: 'View office hours',
  job: 'View opportunity',
  startup: 'Review evidence',
  program: 'Open programs',
  organization: 'Open partnerships',
  guide: 'Open workspace',
}

const confidenceStyles = {
  high: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  low: 'border-muted-foreground/20 bg-muted text-muted-foreground',
}

export function AssistantCriteriaChips({ response }: { response: AssistantResponse }) {
  const values = [
    ...response.criteria.skills,
    ...response.criteria.sectors,
    ...response.criteria.stages,
    ...(response.criteria.location ? [response.criteria.location] : []),
    ...(response.criteria.minReadiness !== undefined ? [`${response.criteria.minReadiness}%+ readiness`] : []),
    ...(response.criteria.completeTeam ? ['Complete team preferred'] : []),
  ]
  return <div className='flex flex-wrap gap-1.5'>
    <Badge variant='outline' className='capitalize'>{response.intent.replace(/_/g, ' ')}</Badge>
    {values.map((value) => <Badge key={value} variant='secondary'>{value}</Badge>)}
    {values.length === 0 && <Badge variant='secondary'>Broad discovery</Badge>}
  </div>
}

export function AssistantResults({ response, compact = false, limit }: { response: AssistantResponse; compact?: boolean; limit?: number }) {
  const results = limit ? response.results.slice(0, limit) : response.results
  if (results.length === 0) return <Card className='border-dashed'><CardContent className='py-10 text-center'><Bot className='mx-auto mb-3 size-9 text-muted-foreground' /><p className='font-medium'>No confident matches yet</p><p className='mt-1 text-sm text-muted-foreground'>Try removing a location, stage, or skill constraint—or describe the outcome instead.</p></CardContent></Card>
  return <div className={cn('grid gap-3', !compact && 'xl:grid-cols-2')}>
    {results.map((item) => {
      const Icon = entityIcons[item.entityType]
      return <Card key={`${item.entityType}-${item.entityId}`} className='overflow-hidden border-primary/10'>
        <CardHeader className={cn('flex-row items-start gap-3', compact && 'p-4 pb-2')}>
          <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'><CardTitle className='text-base'>{item.title}</CardTitle><Badge variant='outline' className={confidenceStyles[item.explanation.confidence]}>{item.explanation.totalScore}% match</Badge></div>
            <CardDescription className='mt-1'>{item.subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-3', compact && 'px-4 pb-3')}>
          <p className={cn('text-sm leading-6 text-muted-foreground', compact && 'line-clamp-2')}>{item.description}</p>
          <div className='flex flex-wrap gap-1'>{item.tags.slice(0, compact ? 3 : 5).map((tag) => <Badge key={tag} variant='secondary' className='text-[10px]'>{tag}</Badge>)}</div>
          <div className='rounded-xl border bg-muted/25 p-3'>
            <div className='mb-2 flex items-center justify-between gap-2 text-[11px]'><b className='uppercase tracking-wide'>Why this matches</b><span className='capitalize text-muted-foreground'>{item.explanation.confidence} confidence</span></div>
            <ul className='space-y-1 text-xs text-muted-foreground'>
              {item.explanation.matchedSignals.slice(0, compact ? 2 : 4).map((signal) => <li key={signal} className='flex gap-2'><span className='text-emerald-500'>✓</span>{signal}</li>)}
              {!compact && item.explanation.missingSignals.slice(0, 3).map((signal) => <li key={signal} className='flex gap-2'><span className='text-amber-500'>△</span>{signal}</li>)}
            </ul>
          </div>
          {!compact && <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{Object.entries(item.explanation.scoreBreakdown).map(([label, value]) => <div key={label} className='rounded-lg bg-muted/40 p-2'><div className='text-[10px] capitalize text-muted-foreground'>{label}</div><div className='font-semibold'>{Math.round(value)}</div></div>)}</div>}
        </CardContent>
        <CardFooter className={cn('border-t', compact && 'px-4 py-3')}><Button size='sm' variant={compact ? 'ghost' : 'outline'} className='ml-auto' asChild><Link to={item.href}>{actionLabels[item.entityType]}<ChevronRight className='size-3.5' /></Link></Button></CardFooter>
      </Card>
    })}
  </div>
}
