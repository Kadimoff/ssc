import { useState } from 'react'
import {
  AlertCircle, AlertTriangle, Bookmark, CheckCircle2, ChevronDown, ChevronRight,
  Columns3, Compass, FileCheck2, GraduationCap, LayoutGrid, List,
  MessagesSquare, Rocket, Search, Star, StickyNote, Users,
} from 'lucide-react'
import type { AssistantResponse, AssistantResult } from '@/features/assistant/types'
import { startupSignalBreakdown } from '@/features/assistant/engine'
import type { MentorData, StartupData } from '@/data/platform-content'
import {
  investorEvidenceByStartup,
  investorOpportunities,
  type InvestorPipelineStage,
} from '@/data/investor-workspace-data'
import { AssistantCriteriaChips } from '@/features/assistant/result-cards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EvidenceChecklist, RiskSignals } from './evidence-checklist'
import { cn } from '@/lib/utils'

const pipelineStages: InvestorPipelineStage[] = ['sourced', 'screening', 'meeting', 'diligence', 'passed']
const pipelineLabels: Record<InvestorPipelineStage, string> = {
  sourced: 'Sourced',
  screening: 'Screening',
  meeting: 'Meeting',
  diligence: 'Diligence',
  passed: 'Passed',
}

export type DiscoveryProps = {
  draftThesis: string
  setDraftThesis: (value: string) => void
  applyThesis: () => void
  response: AssistantResponse
  startups: StartupData[]
  matching: boolean
  ranked: AssistantResult[]
  stage: string
  setStage: (value: string) => void
  stages: string[]
  sector: string
  setSector: (value: string) => void
  sectors: string[]
  location: string
  setLocation: (value: string) => void
  locations: string[]
  minReadiness: number
  setMinReadiness: (value: number) => void
  verifiedEvidenceOnly: boolean
  setVerifiedEvidenceOnly: (value: boolean) => void
  completeTeamOnly: boolean
  setCompleteTeamOnly: (value: boolean) => void
  sort: 'match' | 'readiness' | 'team'
  setSort: (value: 'match' | 'readiness' | 'team') => void
  verifiedStartupEvidence: Set<string>
  watched: Set<string>
  compared: Set<string>
  intros: Set<string>
  onWatch: (startup: StartupData) => void
  onCompare: (startup: StartupData) => void
  onIntro: (startup: StartupData) => void
  onOpen: (slug: string) => void
}

export function InvestorDiscovery(props: DiscoveryProps) {
  const {
    draftThesis, setDraftThesis, applyThesis, response, ranked, stage, setStage, stages,
    sector, setSector, sectors, location, setLocation, locations, minReadiness,
    setMinReadiness, verifiedEvidenceOnly, setVerifiedEvidenceOnly, completeTeamOnly,
    setCompleteTeamOnly, sort, setSort, startups, matching,
  } = props
  return (
    <>
      <Card className='mb-6 gap-0 overflow-hidden border-primary/20 py-0'>
        <div className='h-1 bg-gradient-to-r from-primary via-primary/30 to-transparent' />
        <CardHeader className='px-4 py-5 sm:px-6'>
          <CardTitle className='flex items-center gap-2'><Rocket className='text-primary' />Describe your investment thesis</CardTitle>
          <CardDescription>Use natural language. Matching is explainable and based only on illustrative workspace fields.</CardDescription>
        </CardHeader>
        <CardContent className='px-4 pb-5 sm:px-6'>
          <form onSubmit={(event) => { event.preventDefault(); applyThesis() }} className='space-y-3'>
            <Textarea value={draftThesis} onChange={(event) => setDraftThesis(event.target.value)} className='min-h-24 text-base' placeholder='Example: B2B ClimateTech, MVP or pilot stage, readiness above 75, with verified execution evidence.' />
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap gap-2'>
                {['MVP ClimateTech above 80% readiness', 'HealthTech pilot ventures', 'Baku marketplaces with verified evidence'].map((example) => (
                  <Button key={example} type='button' variant='outline' size='sm' onClick={() => setDraftThesis(example)}>{example}</Button>
                ))}
              </div>
              <Button disabled={matching}><Search />{matching ? 'Matching…' : 'Analyze thesis'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className='mb-5 space-y-4 rounded-xl border bg-card/60 p-4'>
        <AssistantCriteriaChips response={response} />
        <div className='grid gap-4 xl:grid-cols-3'>
          <FilterGroup label='Stage' values={stages} selected={stage} onSelect={setStage} />
          <FilterGroup label='Sector' values={sectors} selected={sector} onSelect={setSector} />
          <FilterGroup label='Location' values={locations} selected={location} onSelect={setLocation} />
        </div>
        <div className='grid gap-4 border-t pt-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end'>
          <label className='text-xs font-semibold text-muted-foreground'>Minimum readiness: {minReadiness}%
            <input className='mt-3 w-full accent-primary' type='range' min='0' max='95' step='5' value={minReadiness} onChange={(event) => setMinReadiness(Number(event.target.value))} />
          </label>
          <FilterToggle active={verifiedEvidenceOnly} onClick={() => setVerifiedEvidenceOnly(!verifiedEvidenceOnly)} icon={FileCheck2}>Verified evidence</FilterToggle>
          <FilterToggle active={completeTeamOnly} onClick={() => setCompleteTeamOnly(!completeTeamOnly)} icon={Users}>Complete team</FilterToggle>
          <label className='text-xs font-semibold text-muted-foreground'>Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className='mt-1 block h-9 rounded-lg border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'>
              <option value='match'>Thesis match</option>
              <option value='readiness'>Readiness</option>
              <option value='team'>Fewest team gaps</option>
            </select>
          </label>
        </div>
      </div>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div><h2 className='text-xl font-bold'>Venture matches</h2><p className='text-sm text-muted-foreground'>{ranked.length} ventures meet the current thesis and filters.</p></div>
        <Badge variant='outline'>Thesis relevance, not prediction</Badge>
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        {ranked.map((result) => {
          const startup = startups.find((item) => item.slug === result.entityId)
          return startup ? <DiscoveryCard key={startup.slug} startup={startup} result={result} {...props} /> : null
        })}
        {!ranked.length && (
          <Card className='border-dashed lg:col-span-2'>
            <CardContent className='py-16 text-center'><Search className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='font-semibold'>No ventures meet every active constraint</p><p className='mt-1 text-sm text-muted-foreground'>Lower minimum readiness or remove a stage or sector filter.</p></CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

function DiscoveryCard({
  startup,
  result,
  verifiedStartupEvidence,
  watched,
  compared,
  intros,
  onWatch,
  onCompare,
  onIntro,
  onOpen,
}: DiscoveryProps & { startup: StartupData; result: AssistantResult }) {
  const [expanded, setExpanded] = useState(false)
  const profile = investorOpportunities[startup.slug]
  const evidenceLabel = profile?.evidenceStatus === 'verified' || verifiedStartupEvidence.has(startup.slug) ? 'Verified' : profile?.evidenceStatus === 'partial' ? 'Partial' : 'Missing'
  const teamCompleteness = startup.openRoles.length ? `${startup.team.length} members · ${startup.openRoles.length} gap` : `${startup.team.length} members · core team present`
  return (
    <Card className='glass-card gap-0 overflow-hidden py-0'>
      <div className='h-0.5 bg-gradient-to-r from-primary/50 via-primary/10 to-transparent' />
      <CardHeader className='!flex flex-row items-start gap-3 px-4 py-4 sm:px-5'>
        <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary'>{startup.name.slice(0, 2).toUpperCase()}</span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'><CardTitle className='text-base'>{startup.name}</CardTitle><Badge variant='secondary'>{startup.sector}</Badge><Badge variant='outline'>{startup.stage}</Badge></div>
          <CardDescription className='mt-1 flex items-center gap-1'><GraduationCap className='size-3.5' />{profile?.university || startup.location}</CardDescription>
        </div>
        <div className='shrink-0 text-right'><div className='text-xl font-extrabold text-primary'>{result.explanation.totalScore}%</div><div className='text-[9px] uppercase text-muted-foreground'>thesis match</div></div>
      </CardHeader>
      <CardContent className='flex-1 space-y-3 px-4 pb-4 sm:px-5'>
        <div className='grid gap-2 sm:grid-cols-2'>
          <DecisionSignal label='Traction' value={profile?.tractionHighlight || 'No traction update'} />
          <DecisionSignal label='Current ask' value={profile?.currentAsk || 'No ask recorded'} />
          <DecisionSignal label='Evidence' value={evidenceLabel} />
          <DecisionSignal label='Team completeness' value={teamCompleteness} />
        </div>
        <div className='grid gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-2'>
          <SignalList label='Matched signals' items={result.explanation.matchedSignals.slice(0, 3)} positive />
          <SignalList label='Missing signals' items={(profile?.missingEvidence || result.explanation.missingSignals).slice(0, 2)} />
        </div>
        <button
          type='button'
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className='flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          View match explanation
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
        </button>
        {expanded && (
          <div className='space-y-3 rounded-xl border bg-background/70 p-3'>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {Object.entries(result.explanation.scoreBreakdown).map(([label, value]) => <MiniMetric key={label} label={label} value={String(Math.round(value))} />)}
            </div>
            <EvidenceChecklist items={investorEvidenceByStartup[startup.slug] ?? []} />
            <p className='text-[10px] leading-4 text-muted-foreground'>Scores organize review priority and thesis relevance. They do not predict investment outcomes.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex-wrap gap-2 border-t px-4 py-3 sm:px-5'>
        <Button size='sm' variant={watched.has(startup.slug) ? 'default' : 'outline'} onClick={() => onWatch(startup)}><Bookmark className={watched.has(startup.slug) ? 'fill-current' : ''} />{watched.has(startup.slug) ? 'Watching' : 'Watch'}</Button>
        <Button size='sm' variant={compared.has(startup.slug) ? 'default' : 'outline'} onClick={() => onCompare(startup)}><Columns3 />{compared.has(startup.slug) ? 'Compared' : 'Compare'}</Button>
        <Button size='sm' variant='outline' disabled={intros.has(startup.slug)} onClick={() => onIntro(startup)}><MessagesSquare />{intros.has(startup.slug) ? 'Requested' : 'Request intro'}</Button>
        <Button size='sm' className='sm:ml-auto' onClick={() => onOpen(startup.slug)}>Review venture<ChevronRight /></Button>
      </CardFooter>
    </Card>
  )
}

export function InvestorPipeline({
  startups,
  ranked,
  pipeline,
  notes,
  onStage,
  onNote,
  onIntro,
  onOpen,
}: {
  startups: StartupData[]
  ranked: AssistantResult[]
  pipeline: Record<string, InvestorPipelineStage>
  notes: Record<string, string>
  onStage: (slug: string, value: InvestorPipelineStage) => void
  onNote: (slug: string, value: string) => void
  onIntro: (startup: StartupData) => void
  onOpen: (slug: string) => void
}) {
  const [view, setView] = useState<'board' | 'table'>('board')
  const count = (stage: InvestorPipelineStage) => startups.filter((startup) => (pipeline[startup.slug] ?? 'sourced') === stage).length
  return (
    <section>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-3'>
        <div><h2 className='text-2xl font-bold'>Investment review pipeline</h2><p className='mt-1 max-w-3xl text-sm text-muted-foreground'>Manage venture reviews, notes, evidence gaps and next actions. Pipeline data persists in this browser.</p></div>
        <div className='inline-flex rounded-lg border bg-card p-1' aria-label='Pipeline view'>
          <button type='button' onClick={() => setView('board')} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold', view === 'board' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><LayoutGrid className='size-3.5' />Board</button>
          <button type='button' onClick={() => setView('table')} className={cn('hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold md:inline-flex', view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><List className='size-3.5' />Table</button>
        </div>
      </div>

      {view === 'board' ? (
        <div className='-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3'>
          {pipelineStages.map((stage) => (
            <section key={stage} className='w-[260px] shrink-0 snap-start rounded-xl border bg-muted/20 p-3 sm:w-[285px] xl:w-[calc((100%-3rem)/5)]'>
              <div className='mb-3 flex items-center justify-between gap-2'><h3 className='text-xs font-bold uppercase tracking-wide'>{pipelineLabels[stage]}</h3><Badge variant='outline'>{count(stage)}</Badge></div>
              <div className='space-y-3'>
                {startups.filter((startup) => (pipeline[startup.slug] ?? 'sourced') === stage).map((startup) => (
                  <PipelineCard key={startup.slug} startup={startup} match={ranked.find((result) => result.entityId === startup.slug)?.explanation.totalScore ?? 0} note={notes[startup.slug] ?? ''} stage={stage} onStage={onStage} onNote={onNote} onIntro={onIntro} onOpen={onOpen} />
                ))}
                {!count(stage) && <div className='rounded-lg border border-dashed p-4 text-center text-[11px] text-muted-foreground'>No ventures in this stage</div>}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <PipelineTable startups={startups} ranked={ranked} pipeline={pipeline} notes={notes} onStage={onStage} onNote={onNote} onIntro={onIntro} onOpen={onOpen} />
      )}
      <Card className='mt-5 gap-0 py-0'><CardContent className='flex gap-3 p-4 text-sm text-muted-foreground'><AlertTriangle className='size-5 shrink-0 text-amber-500' /><p>Pipeline state, notes and scores are illustrative decision-support data. They do not estimate funding probability or investment return.</p></CardContent></Card>
    </section>
  )
}

function PipelineCard({
  startup, match, note, stage, onStage, onNote, onIntro, onOpen,
}: {
  startup: StartupData
  match: number
  note: string
  stage: InvestorPipelineStage
  onStage: (slug: string, value: InvestorPipelineStage) => void
  onNote: (slug: string, value: string) => void
  onIntro: (startup: StartupData) => void
  onOpen: (slug: string) => void
}) {
  const profile = investorOpportunities[startup.slug]
  const gaps = [...(profile?.teamGaps ?? []), ...(profile?.missingEvidence.slice(0, 1) ?? [])]
  const evidenceItems = investorEvidenceByStartup[startup.slug] ?? []
  const verifiedEvidenceCount = evidenceItems.filter((item) => item.status === 'verified').length
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardContent className='space-y-3 p-3'>
        <div className='flex items-start justify-between gap-2'><button type='button' onClick={() => onOpen(startup.slug)} className='text-left text-sm font-bold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{startup.name}</button><Badge variant='secondary'>{match}% match</Badge></div>
        <p className='text-[10px] text-muted-foreground'>{startup.sector} · {startup.stage}</p>
        <DecisionSignal label='Strongest traction' value={profile?.tractionHighlight || 'No update'} />
        <div className='flex flex-wrap gap-1'><Badge className={cn('border-0 text-[9px]', profile?.evidenceStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>{profile?.evidenceStatus === 'verified' ? 'Evidence verified' : 'Evidence review open'}</Badge>{gaps.slice(0, 1).map((gap) => <Badge key={gap} variant='outline' className='border-amber-500/30 text-[9px] text-amber-700 dark:text-amber-300'>{gap}</Badge>)}</div>
        <p className='text-[10px] leading-4 text-muted-foreground'><b className='text-foreground'>Next:</b> {profile?.nextAction || 'Review workspace record'}</p>
        <details className='group rounded-lg border bg-muted/20'>
          <summary className='flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring'>
            Evidence checklist · {verifiedEvidenceCount}/{evidenceItems.length} verified
            <ChevronDown className='size-3.5 transition-transform group-open:rotate-180' />
          </summary>
          <div className='border-t p-2'><EvidenceChecklist items={evidenceItems} compact /></div>
        </details>
        <select aria-label={`Pipeline stage for ${startup.name}`} value={stage} onChange={(event) => onStage(startup.slug, event.target.value as InvestorPipelineStage)} className='h-8 w-full rounded-lg border bg-background px-2 text-xs capitalize text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'>{pipelineStages.map((item) => <option key={item} value={item}>{pipelineLabels[item]}</option>)}</select>
        <div className='relative'><StickyNote className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground' /><Input aria-label={`Investor note for ${startup.name}`} value={note} onChange={(event) => onNote(startup.slug, event.target.value)} className='h-8 pl-8 text-xs' placeholder='Next question or note' /></div>
        <div className='flex gap-2'><Button size='sm' variant='outline' className='flex-1' onClick={() => onIntro(startup)}>Intro</Button><Button size='sm' className='flex-1' onClick={() => onOpen(startup.slug)}>Review</Button></div>
      </CardContent>
    </Card>
  )
}

function PipelineTable({
  startups, ranked, pipeline, notes, onStage, onNote, onIntro, onOpen,
}: {
  startups: StartupData[]
  ranked: AssistantResult[]
  pipeline: Record<string, InvestorPipelineStage>
  notes: Record<string, string>
  onStage: (slug: string, value: InvestorPipelineStage) => void
  onNote: (slug: string, value: string) => void
  onIntro: (startup: StartupData) => void
  onOpen: (slug: string) => void
}) {
  return (
    <div className='overflow-x-auto rounded-xl border bg-card/60'>
      <table className='w-full min-w-[1120px] text-sm'>
        <thead><tr className='border-b bg-muted/30 text-left text-xs text-muted-foreground'><th className='p-4'>Venture</th><th className='p-4'>Thesis match</th><th className='p-4'>Readiness signal</th><th className='p-4'>Evidence / gaps</th><th className='p-4'>Review stage</th><th className='p-4'>Investor note</th><th className='p-4'>Action</th></tr></thead>
        <tbody>{startups.map((startup) => {
          const profile = investorOpportunities[startup.slug]
          const match = ranked.find((result) => result.entityId === startup.slug)?.explanation.totalScore ?? 0
          return (
            <tr key={startup.slug} className='border-b align-top last:border-0'>
              <td className='p-4'><button type='button' onClick={() => onOpen(startup.slug)} className='font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{startup.name}</button><p className='mt-1 text-xs text-muted-foreground'>{startup.sector} · {startup.stage}</p></td>
              <td className='p-4 font-bold text-primary'>{match}%</td>
              <td className='p-4'><b>{profile?.readiness ?? startup.score}%</b><div className='mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${Math.max(0, Math.min(100, profile?.readiness ?? startup.score))}%` }} /></div></td>
              <td className='max-w-56 p-4'><Badge className={cn('border-0', profile?.evidenceStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>{profile?.evidenceStatus || 'Needs review'}</Badge><div className='mt-2'><RiskSignals signals={[...(profile?.teamGaps ?? []), ...(profile?.missingEvidence.slice(0, 1) ?? [])]} /></div></td>
              <td className='p-4'><select value={pipeline[startup.slug] ?? 'sourced'} onChange={(event) => onStage(startup.slug, event.target.value as InvestorPipelineStage)} className='h-9 rounded-lg border bg-background px-2 capitalize text-foreground'>{pipelineStages.map((item) => <option key={item} value={item}>{pipelineLabels[item]}</option>)}</select></td>
              <td className='p-4'><div className='relative'><StickyNote className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground' /><Input value={notes[startup.slug] ?? ''} onChange={(event) => onNote(startup.slug, event.target.value)} className='min-w-64 pl-8' placeholder='Decision note or next question' /></div></td>
              <td className='p-4'><div className='flex gap-2'><Button size='sm' variant='outline' onClick={() => onIntro(startup)}><MessagesSquare />Intro</Button><Button size='sm' onClick={() => onOpen(startup.slug)}>Review</Button></div></td>
            </tr>
          )
        })}</tbody>
      </table>
    </div>
  )
}

export function InvestorCompare({
  selected,
  response,
  onRemove,
  onDiscover,
}: {
  selected: StartupData[]
  response: AssistantResponse
  onRemove: (startup: StartupData) => void
  onDiscover: () => void
}) {
  if (!selected.length) return <Card className='border-dashed'><CardContent className='py-20 text-center'><Columns3 className='mx-auto mb-3 size-10 text-muted-foreground' /><h2 className='text-xl font-bold'>Select ventures to compare</h2><p className='mt-2 text-sm text-muted-foreground'>Add up to three ventures from thesis discovery.</p><Button className='mt-5' onClick={onDiscover}><Compass />Open discovery</Button></CardContent></Card>
  const rows: Array<{ label: string; render: (startup: StartupData) => string }> = [
    { label: 'University', render: (startup) => investorOpportunities[startup.slug]?.university || 'Not recorded' },
    { label: 'Sector', render: (startup) => startup.sector },
    { label: 'Stage', render: (startup) => startup.stage },
    { label: 'Thesis match', render: (startup) => `${response.results.find((item) => item.entityId === startup.slug)?.explanation.totalScore ?? 0}% relevance` },
    { label: 'Readiness signal', render: (startup) => `${investorOpportunities[startup.slug]?.readiness ?? startup.score}%` },
    { label: 'Traction', render: (startup) => investorOpportunities[startup.slug]?.tractionHighlight || 'Not recorded' },
    { label: 'Revenue status', render: (startup) => investorOpportunities[startup.slug]?.revenueStatus || 'Not recorded' },
    { label: 'Pilot count', render: (startup) => String(investorOpportunities[startup.slug]?.pilotCount ?? 0) },
    { label: 'Team size', render: (startup) => String(startup.team.length) },
    { label: 'Open roles', render: (startup) => startup.openRoles.length ? startup.openRoles.map((role) => role.title).join(', ') : 'No open role recorded' },
    { label: 'Verified evidence', render: (startup) => investorOpportunities[startup.slug]?.evidenceStatus || 'Missing' },
    { label: 'Current ask', render: (startup) => investorOpportunities[startup.slug]?.currentAsk || 'Not recorded' },
    { label: 'Last activity', render: (startup) => investorOpportunities[startup.slug]?.lastActivityLabel || 'Not recorded' },
    { label: 'Key strengths', render: (startup) => investorOpportunities[startup.slug]?.keyStrengths.join('; ') || 'Not recorded' },
    { label: 'Missing evidence', render: (startup) => investorOpportunities[startup.slug]?.missingEvidence.join('; ') || 'No missing evidence recorded' },
    { label: 'Evidence coverage', render: (startup) => `${Math.round(startupSignalBreakdown(startup, response.criteria).evidenceRaw)}% prototype coverage` },
  ]
  return (
    <div className='space-y-5'>
      <div><h2 className='text-2xl font-bold'>Side-by-side evidence comparison</h2><p className='mt-1 text-sm text-muted-foreground'>Compare current records without generating a "best startup" recommendation.</p></div>

      {/* Desktop: side-by-side table (hidden on mobile) */}
      <div className='hidden overflow-x-auto rounded-xl border bg-card md:block'>
        <table className='w-full min-w-[860px] text-sm'>
          <thead><tr className='border-b bg-muted/30'><th className='sticky left-0 z-10 bg-muted p-4 text-left'>Signal</th>{selected.map((startup) => <th key={startup.slug} className='min-w-64 p-4 text-left'><div className='flex items-center justify-between gap-2'><span>{startup.name}</span><Button variant='ghost' size='sm' onClick={() => onRemove(startup)}>Remove</Button></div></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label} className='border-b last:border-0'><th className='sticky left-0 bg-card p-4 text-left font-medium text-muted-foreground'>{row.label}</th>{selected.map((startup) => <td key={startup.slug} className='p-4 align-top leading-6'>{row.render(startup)}</td>)}</tr>)}</tbody>
        </table>
      </div>

      {/* Mobile: stacked card-based comparison */}
      <div className='space-y-4 md:hidden'>
        {selected.map((startup) => (
          <Card key={startup.slug} className='overflow-hidden py-0'>
            <div className='flex items-center justify-between gap-2 border-b bg-muted/30 p-4'>
              <h3 className='font-bold'>{startup.name}</h3>
              <Button variant='ghost' size='sm' onClick={() => onRemove(startup)}>Remove</Button>
            </div>
            <CardContent className='divide-y p-0'>
              {rows.map((row) => (
                <div key={row.label} className='flex min-w-0 items-start justify-between gap-3 px-4 py-3'>
                  <span className='shrink-0 text-xs font-medium text-muted-foreground'>{row.label}</span>
                  <span className='min-w-0 text-right text-sm font-medium leading-5 [overflow-wrap:anywhere]'>{row.render(startup)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='gap-0 py-0'><CardContent className='flex gap-3 p-4 text-sm text-muted-foreground'><AlertTriangle className='size-5 shrink-0 text-amber-500' /><p>Comparison supports review prioritization only. It does not model valuation, investment return, or funding probability.</p></CardContent></Card>
    </div>
  )
}

export function InvestorExpertNetwork({ mentors, onOpen }: { mentors: MentorData[]; onOpen: () => void }) {
  const active = mentors.filter((mentor) => mentor.status !== 'suspended')
  return (
    <section>
      <div className='mb-5'><div className='flex flex-wrap items-center gap-2'><GraduationCap className='size-5 text-primary' /><h2 className='text-2xl font-bold'>Expert network</h2><Badge variant='secondary'>{active.length} available</Badge></div><p className='mt-1 text-sm text-muted-foreground'>Domain experts who can support product, market and evidence diligence.</p></div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {active.map((mentor) => (
          <Card key={mentor.id} className='glass-card gap-0 py-0'>
            <CardContent className='p-4'>
              <div className='flex items-start gap-3'>
                <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-bold text-primary'>{mentor.name.slice(0, 1)}</span>
                <div className='min-w-0 flex-1'><b className='block text-sm'>{mentor.name}</b><p className='truncate text-xs text-muted-foreground'>{mentor.title} · {mentor.company}</p></div>
                <Badge variant='outline' className='text-[10px]'>{mentor.focusStage}</Badge>
              </div>
              <div className='mt-4 grid gap-2'>
                <DecisionSignal label='Relevant sectors & expertise' value={mentor.expertise.join(', ')} />
                <DecisionSignal label='Diligence support' value={`${mentor.expertise[0] || 'Domain'} review and founder questions`} />
                <DecisionSignal label='Availability / office hours' value={mentor.availability} />
              </div>
              <p className='mt-3 flex items-center gap-1 text-xs text-muted-foreground'><Star className='size-3.5 fill-amber-400 text-amber-500' />{mentor.rating.toFixed(1)} · {mentor.sessions} recorded sessions</p>
              <Button size='sm' variant='outline' className='mt-3 w-full' onClick={onOpen}>View expert office hours</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function FilterGroup({ label, values, selected, onSelect }: { label: string; values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <div><p className='mb-2 text-xs font-semibold text-muted-foreground'>{label}</p><div className='flex flex-wrap gap-1.5'>{values.map((value) => <button type='button' key={value} onClick={() => onSelect(value)} className={cn('rounded-full border px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected === value ? 'border-primary/40 bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground')}>{value}</button>)}</div></div>
}

function FilterToggle({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof FileCheck2; children: React.ReactNode }) {
  return <button type='button' aria-pressed={active} onClick={onClick} className={cn('rounded-xl border px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active && 'border-primary/40 bg-primary/10 text-primary')}><Icon className='mr-1 inline size-3.5' />{children}</button>
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className='rounded-lg bg-muted/40 p-2'><div className='text-[10px] capitalize text-muted-foreground'>{label}</div><div className='font-semibold'>{value}</div></div>
}

function DecisionSignal({ label, value }: { label: string; value: string }) {
  return <div className='min-w-0 rounded-lg border bg-background/60 p-2.5'><div className='text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</div><div className='mt-1 text-xs font-medium leading-5'>{value}</div></div>
}

function SignalList({ label, items, positive = false }: { label: string; items: string[]; positive?: boolean }) {
  return <div><div className='mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</div><ul className='space-y-1'>{items.length ? items.map((item) => <li key={item} className={cn('flex items-start gap-1.5 text-[11px] leading-4', positive ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300')}>{positive ? <CheckCircle2 className='mt-0.5 size-3 shrink-0' /> : <AlertCircle className='mt-0.5 size-3 shrink-0' />}{item}</li>) : <li className='text-[11px] text-muted-foreground'>No signal recorded</li>}</ul></div>
}
