import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  AlertTriangle, BarChart3, Bookmark, CheckCircle2, ChevronRight, Columns3,
  Compass, FileCheck2, GraduationCap, MapPin, MessagesSquare, Rocket, Search, ShieldCheck, Sparkles, StickyNote, Target,
  TrendingUp, Trophy, Users, Workflow,
} from 'lucide-react'
import { mentors as staticMentors, startups as staticStartups, type MentorData, type StartupData } from '@/data/platform-content'
import { assistantContextFromSnapshot, type AssistantResponse, type AssistantResult } from '@/features/assistant/types'
import { runAssistant, startupSignalBreakdown } from '@/features/assistant/engine'
import { AssistantCriteriaChips } from '@/features/assistant/result-cards'
import { computeInvestorAnalytics } from '@/features/investor/analytics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { BarList, Donut, Funnel } from '@/components/investor/charts'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { apiClient } from '@/data/client'

type InvestorTab = 'overview' | 'discover' | 'pipeline' | 'compare' | 'mentors'
type PipelineStage = 'sourced' | 'screening' | 'meeting' | 'diligence' | 'passed'

const WATCHLIST_KEY = 'ssc.investorWatchlist.v1'
const COMPARE_KEY = 'ssc.investorCompare.v1'
const PIPELINE_KEY = 'ssc.investorPipeline.v1'
const NOTES_KEY = 'ssc.investorNotes.v1'
const pipelineStages: PipelineStage[] = ['sourced', 'screening', 'meeting', 'diligence', 'passed']

function readRecord<T extends string>(key: string, fallback: Record<string, T> = {}) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, T> : fallback
  } catch {
    return fallback
  }
}

function readStringSet(key: string, fallback: string[] = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    return new Set<string>(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback)
  } catch {
    return new Set<string>(fallback)
  }
}

function persistSet(key: string, value: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...value]))
}

function recordIntro(slug: string, name: string) {
  const key = 'ssc.investorIntros.v1'
  const current = readStringSet(key)
  current.add(slug)
  persistSet(key, current)
  toast.success(`Intro request recorded for ${name}.`)
}

export function InvestorsPage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const [tab, setTab] = useState<InvestorTab>('overview')
  const [draftThesis, setDraftThesis] = useState('')
  const [thesis, setThesis] = useState('')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All')
  const [location, setLocation] = useState('All')
  const [minReadiness, setMinReadiness] = useState(0)
  const [verifiedEvidenceOnly, setVerifiedEvidenceOnly] = useState(false)
  const [completeTeamOnly, setCompleteTeamOnly] = useState(false)
  const [sort, setSort] = useState<'match' | 'readiness' | 'team'>('match')
  const [watched, setWatched] = useState<Set<string>>(() => readStringSet(WATCHLIST_KEY, ['mediroute']))
  const [compared, setCompared] = useState<Set<string>>(() => readStringSet(COMPARE_KEY))
  const [pipeline, setPipeline] = useState<Record<string, PipelineStage>>(() => readRecord(PIPELINE_KEY, {
    mediroute: 'diligence', greenstack: 'meeting', 'campus-cart': 'screening', agrivision: 'sourced',
  }))
  const [notes, setNotes] = useState<Record<string, string>>(() => readRecord(NOTES_KEY))
  const [remoteResponse, setRemoteResponse] = useState<AssistantResponse | null>(null)
  const [matching, setMatching] = useState(false)
  if (!data) return <PageLoading />

  const startups = data.startups?.length ? data.startups : staticStartups
  const mentors = data.mentors?.length ? data.mentors : staticMentors
  const context = assistantContextFromSnapshot(data, startups, mentors, false)
  const thesisResponse = remoteResponse ?? runAssistant(thesis || 'Show the strongest available ventures', context, 'investor_discovery')
  const stages = ['All', ...new Set(startups.map((startup) => startup.stage))]
  const sectors = ['All', ...new Set(startups.map((startup) => startup.sector))]
  const locations = ['All', ...new Set(startups.map((startup) => startup.location))]
  const verifiedStartupEvidence = new Set(data.evidenceArtifacts.filter((item) => item.ownerType === 'startup' && item.verificationStatus === 'verified').map((item) => item.ownerId))
  const ranked = thesisResponse.results.filter((result) => {
    const startup = startups.find((item) => item.slug === result.entityId)
    return startup &&
      (stage === 'All' || startup.stage === stage) &&
      (sector === 'All' || startup.sector === sector) &&
      (location === 'All' || startup.location === location) &&
      startup.score >= minReadiness &&
      (!verifiedEvidenceOnly || verifiedStartupEvidence.has(startup.slug)) &&
      (!completeTeamOnly || startup.openRoles.length === 0)
  }).sort((left, right) => {
    const leftStartup = startups.find((item) => item.slug === left.entityId)
    const rightStartup = startups.find((item) => item.slug === right.entityId)
    if (sort === 'readiness') return (rightStartup?.score ?? 0) - (leftStartup?.score ?? 0)
    if (sort === 'team') return (leftStartup?.openRoles.length ?? 0) - (rightStartup?.openRoles.length ?? 0)
    return right.explanation.totalScore - left.explanation.totalScore
  })
  const analytics = computeInvestorAnalytics(startups, data.evidenceArtifacts, watched)
  const comparedStartups = startups.filter((startup) => compared.has(startup.slug))
  const watchlist = startups.filter((startup) => watched.has(startup.slug))
  const TABS: { key: InvestorTab; label: string; icon: typeof Compass }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'discover', label: 'Thesis discovery', icon: Compass },
    { key: 'pipeline', label: 'Deal pipeline', icon: Workflow },
    { key: 'compare', label: `Compare${compared.size ? ` (${compared.size})` : ''}`, icon: Columns3 },
    { key: 'mentors', label: 'Mentors', icon: GraduationCap },
  ]
  const toggleWatch = (startup: StartupData) => {
    setWatched((previous) => {
      const next = new Set(previous)
      if (next.has(startup.slug)) next.delete(startup.slug)
      else next.add(startup.slug)
      persistSet(WATCHLIST_KEY, next)
      toast.success(next.has(startup.slug) ? 'Added to watchlist' : 'Removed from watchlist')
      return next
    })
  }
  const toggleCompare = (startup: StartupData) => {
    setCompared((previous) => {
      const next = new Set(previous)
      if (next.has(startup.slug)) next.delete(startup.slug)
      else if (next.size >= 3) {
        toast.error('Compare up to three ventures at a time.')
        return previous
      } else next.add(startup.slug)
      persistSet(COMPARE_KEY, next)
      return next
    })
  }
  const applyThesis = async () => {
    const next = draftThesis.trim() || 'Show the strongest available ventures'
    setThesis(next)
    setMatching(true)
    try {
      setRemoteResponse(await apiClient.investorDiscovery(next))
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Investor discovery failed')
    } finally {
      setMatching(false)
    }
  }

  return <PageContainer>
    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <PageHeading eyebrow='Investor access' title='Find the venture that fits your thesis.' description='Rank ventures with transparent execution, evidence, stage, sector, and team signals—without pretending to predict investment outcomes.' />
      <div className='flex flex-wrap gap-2'><Badge variant='outline' className='h-9 gap-1.5 px-3'><ShieldCheck className='size-3.5' />Illustrative dataset</Badge><Button variant='outline' onClick={() => navigate({ to: '/settings' })}><ShieldCheck />Investor settings</Button></div>
    </div>

    <nav className='mb-6 flex flex-wrap gap-2'>{TABS.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all', tab === item.key ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:border-primary/25 hover:text-foreground')}><item.icon className='size-3.5' />{item.label}</button>)}</nav>

    {tab === 'overview' && <InvestorOverview analytics={analytics} ranked={ranked} watchlist={watchlist} onDiscover={() => setTab('discover')} onOpen={(slug) => navigate({ to: '/startups/$slug', params: { slug } })} />}
    {tab === 'discover' && <InvestorDiscovery
      draftThesis={draftThesis} setDraftThesis={setDraftThesis} applyThesis={() => void applyThesis()} matching={matching}
      response={thesisResponse} ranked={ranked} stage={stage} setStage={setStage} stages={stages}
      sector={sector} setSector={setSector} sectors={sectors} minReadiness={minReadiness} setMinReadiness={setMinReadiness}
      location={location} setLocation={setLocation} locations={locations}
      verifiedEvidenceOnly={verifiedEvidenceOnly} setVerifiedEvidenceOnly={setVerifiedEvidenceOnly}
      completeTeamOnly={completeTeamOnly} setCompleteTeamOnly={setCompleteTeamOnly}
      sort={sort} setSort={setSort} verifiedStartupEvidence={verifiedStartupEvidence}
      startups={startups}
      watched={watched} compared={compared} onWatch={toggleWatch} onCompare={toggleCompare}
      onOpen={(slug) => navigate({ to: '/startups/$slug', params: { slug } })}
    />}
    {tab === 'pipeline' && <InvestorPipeline
      startups={startups} ranked={thesisResponse.results} pipeline={pipeline} notes={notes}
      verifiedStartupEvidence={verifiedStartupEvidence}
      onStage={(slug, value) => setPipeline((current) => {
        const next = { ...current, [slug]: value }
        localStorage.setItem(PIPELINE_KEY, JSON.stringify(next))
        return next
      })}
      onNote={(slug, value) => setNotes((current) => {
        const next = { ...current, [slug]: value }
        localStorage.setItem(NOTES_KEY, JSON.stringify(next))
        return next
      })}
      onOpen={(slug) => navigate({ to: '/startups/$slug', params: { slug } })}
    />}
    {tab === 'compare' && <InvestorCompare startups={comparedStartups} response={thesisResponse} onRemove={toggleCompare} onDiscover={() => setTab('discover')} />}
    {tab === 'mentors' && <InvestorMentors mentors={mentors} onOpen={() => navigate({ to: '/mentorship' })} />}
  </PageContainer>
}

function InvestorOverview({
  analytics, ranked, watchlist, onDiscover, onOpen,
}: {
  analytics: ReturnType<typeof computeInvestorAnalytics>
  ranked: AssistantResult[]
  watchlist: StartupData[]
  onDiscover: () => void
  onOpen: (slug: string) => void
}) {
  const kpis = [
    { label: 'Pipeline ventures', value: analytics.totalVentures, detail: 'current workspace records', icon: Rocket, tone: 'text-emerald-500' },
    { label: 'Average readiness', value: `${analytics.averageReadiness}%`, detail: 'execution summary', icon: TrendingUp, tone: 'text-primary' },
    { label: 'Investor-ready', value: analytics.investorReady, detail: 'readiness ≥ 85%', icon: Trophy, tone: 'text-amber-500' },
    { label: 'Verified evidence', value: `${analytics.evidenceCoverage}%`, detail: 'ventures with verified artifacts', icon: CheckCircle2, tone: 'text-sky-500' },
    { label: 'Milestones complete', value: `${analytics.milestoneCompletion}%`, detail: 'all listed milestones', icon: Target, tone: 'text-violet-500' },
    { label: 'Team completeness', value: `${analytics.teamCompleteness}%`, detail: `${analytics.openRoles} roles remain open`, icon: Users, tone: 'text-teal-500' },
  ]
  return <>
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>{kpis.map((kpi) => <Card key={kpi.label} className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className={cn('grid size-11 place-items-center rounded-xl bg-muted/60', kpi.tone)}><kpi.icon className='size-5' /></span><div><CardDescription>{kpi.label}</CardDescription><CardTitle className='text-2xl'>{kpi.value}</CardTitle><p className='text-[10px] text-muted-foreground'>{kpi.detail}</p></div></CardHeader></Card>)}</div>

    <div className='mt-6 grid gap-6 lg:grid-cols-3'>
      <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Readiness funnel</CardTitle><CardDescription>Transparent bands, not funding probability.</CardDescription></CardHeader><CardContent><Funnel steps={Object.entries(analytics.readinessBands).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }))} /></CardContent></Card>
      <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Sector concentration</CardTitle><CardDescription>Current illustrative pipeline mix.</CardDescription></CardHeader><CardContent><Donut centerLabel={String(analytics.totalVentures)} centerSub='ventures' segments={Object.entries(analytics.sectorCounts).map(([label, value], index) => ({ label, value, color: ['#10b981', '#f5b840', '#38bdf8', '#a78bfa'][index % 4] }))} /></CardContent></Card>
      <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Stage distribution</CardTitle><CardDescription>Where the current pipeline sits.</CardDescription></CardHeader><CardContent><BarList items={Object.entries(analytics.stageCounts).map(([label, value]) => ({ label, value }))} /></CardContent></Card>
    </div>

    <div className='mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]'>
      <Card className='glass-card'><CardHeader className='flex-row items-start justify-between'><div><CardTitle className='text-base'>Top thesis-neutral signals</CardTitle><CardDescription>Strongest current relevance scores before adding your thesis.</CardDescription></div><Button size='sm' variant='outline' onClick={onDiscover}><Sparkles />Describe thesis</Button></CardHeader><CardContent className='space-y-3'>{ranked.slice(0, 3).map((result) => <button key={result.entityId} onClick={() => onOpen(result.entityId)} className='flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/30'><span className='grid size-9 place-items-center rounded-lg bg-primary/10 text-primary'><Rocket className='size-4' /></span><div className='min-w-0 flex-1'><b className='text-sm'>{result.title}</b><p className='truncate text-xs text-muted-foreground'>{result.subtitle}</p></div><Badge variant='outline'>{result.explanation.totalScore}% relevance</Badge><ChevronRight className='size-4 text-muted-foreground' /></button>)}</CardContent></Card>
      <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Data-quality guardrails</CardTitle><CardDescription>What this dashboard can and cannot establish.</CardDescription></CardHeader><CardContent className='space-y-3 text-sm'><SignalRow ok={analytics.evidenceCoverage > 0} text={`${analytics.evidenceCoverage}% verified startup-evidence coverage`} /><SignalRow ok={analytics.openRoles === 0} text={`${analytics.openRoles} open roles indicate team gaps`} /><SignalRow ok text='All readiness values expose their component signals' /><div className='rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-amber-700 dark:text-amber-300'><AlertTriangle className='mr-1 inline size-3.5' />These prototype calculations support discovery; they are not investment advice or audited performance.</div></CardContent></Card>
    </div>

    {watchlist.length > 0 && <Card className='glass-card mt-6'><CardHeader><CardTitle className='flex items-center gap-2 text-base'><Bookmark className='size-4 text-amber-500' />Watchlist</CardTitle><CardDescription>{watchlist.length} saved venture{watchlist.length === 1 ? '' : 's'} persisted in this browser.</CardDescription></CardHeader><CardContent className='flex gap-3 overflow-x-auto'>{watchlist.map((startup) => <button key={startup.slug} onClick={() => onOpen(startup.slug)} className='w-52 shrink-0 rounded-xl border p-3 text-left hover:border-primary/30'><b className='text-sm'>{startup.name}</b><p className='mt-1 text-xs text-muted-foreground'>{startup.sector} · {startup.stage}</p><div className='mt-2 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${startup.score}%` }} /></div></button>)}</CardContent></Card>}
  </>
}

function InvestorDiscovery({
  draftThesis, setDraftThesis, applyThesis, response, ranked, stage, setStage, stages, sector, setSector, sectors,
  location, setLocation, locations, minReadiness, setMinReadiness, verifiedEvidenceOnly, setVerifiedEvidenceOnly,
  completeTeamOnly, setCompleteTeamOnly, sort, setSort, verifiedStartupEvidence,
  watched, compared, onWatch, onCompare, onOpen, startups, matching,
}: {
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
  onWatch: (startup: StartupData) => void
  onCompare: (startup: StartupData) => void
  onOpen: (slug: string) => void
}) {
  return <>
    <Card className='mb-6 overflow-hidden border-primary/20'><div className='h-1 bg-gradient-to-r from-primary via-primary/30 to-transparent' /><CardHeader><CardTitle className='flex items-center gap-2'><Sparkles className='text-primary' />Describe your investment thesis</CardTitle><CardDescription>Use natural language. Matching remains explainable and based only on available prototype fields.</CardDescription></CardHeader><CardContent>
      <form onSubmit={(event) => { event.preventDefault(); applyThesis() }} className='space-y-3'><Textarea value={draftThesis} onChange={(event) => setDraftThesis(event.target.value)} className='min-h-24 text-base' placeholder='Example: B2B ClimateTech, MVP or pilot stage, readiness above 75, with a complete technical team.' /><div className='flex flex-wrap items-center justify-between gap-3'><div className='flex flex-wrap gap-2'>{['MVP ClimateTech above 80% readiness', 'HealthTech pilot ventures', 'Baku marketplaces with verified evidence', 'AgriTech with technical teams'].map((example) => <Button key={example} type='button' variant='outline' size='sm' onClick={() => setDraftThesis(example)}>{example}</Button>)}</div><Button disabled={matching}><Search />{matching ? 'Matching…' : 'Analyze thesis'}</Button></div></form>
    </CardContent></Card>

    <div className='mb-5 space-y-4 rounded-xl border bg-card/50 p-4'>
      <AssistantCriteriaChips response={response} />
      <div className='grid gap-4 xl:grid-cols-3'><FilterGroup label='Stage' values={stages} selected={stage} onSelect={setStage} /><FilterGroup label='Sector' values={sectors} selected={sector} onSelect={setSector} /><FilterGroup label='Location' values={locations} selected={location} onSelect={setLocation} /></div>
      <div className='grid gap-4 border-t pt-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end'>
        <label className='text-xs font-semibold text-muted-foreground'>Minimum readiness: {minReadiness}%<input className='mt-3 w-full accent-primary' type='range' min='0' max='95' step='5' value={minReadiness} onChange={(event) => setMinReadiness(Number(event.target.value))} /></label>
        <button type='button' onClick={() => setVerifiedEvidenceOnly(!verifiedEvidenceOnly)} className={cn('rounded-xl border px-3 py-2 text-xs font-semibold', verifiedEvidenceOnly && 'border-primary/40 bg-primary/10 text-primary')}><FileCheck2 className='mr-1 inline size-3.5' />Verified evidence</button>
        <button type='button' onClick={() => setCompleteTeamOnly(!completeTeamOnly)} className={cn('rounded-xl border px-3 py-2 text-xs font-semibold', completeTeamOnly && 'border-primary/40 bg-primary/10 text-primary')}><Users className='mr-1 inline size-3.5' />Complete team</button>
        <label className='text-xs font-semibold text-muted-foreground'>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className='mt-1 block h-9 rounded-lg border bg-background px-2 text-foreground'><option value='match'>Thesis match</option><option value='readiness'>Readiness</option><option value='team'>Fewest team gaps</option></select></label>
      </div>
    </div>

    <div className='mb-4 flex items-center justify-between gap-3'><div><h2 className='text-xl font-bold'>Ranked venture matches</h2><p className='text-sm text-muted-foreground'>{ranked.length} ventures meet the current thesis and filters.</p></div><Badge variant='outline'>Relevance, not prediction</Badge></div>
    <div className='grid gap-5 lg:grid-cols-2'>{ranked.map((result) => {
      const startup = startups.find((item) => item.slug === result.entityId)
      if (!startup) return null
      const current = startup.milestones.find((item) => item.status === 'current')
      return <Card key={startup.slug} className='glass-card flex flex-col overflow-hidden'><div className='h-0.5 bg-gradient-to-r from-primary/40 via-primary/10 to-transparent' /><CardHeader className='flex-row items-start gap-3'><span className='grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Rocket /></span><div className='min-w-0 flex-1'><div className='flex flex-wrap items-center gap-2'><CardTitle className='text-base'>{startup.name}</CardTitle><Badge variant='secondary'>{startup.sector}</Badge><Badge variant='outline'>{startup.stage}</Badge>{verifiedStartupEvidence.has(startup.slug) && <Badge className='gap-1 bg-emerald-500/10 text-emerald-600'><FileCheck2 className='size-3' />Evidence</Badge>}</div><CardDescription className='mt-1 flex items-center gap-1'><MapPin className='size-3' />{startup.location}</CardDescription></div><div className='text-right'><div className='text-2xl font-extrabold text-primary'>{result.explanation.totalScore}%</div><div className='text-[10px] uppercase text-muted-foreground'>thesis match</div></div></CardHeader>
        <CardContent className='flex-1 space-y-4'><p className='text-sm leading-6 text-muted-foreground'>{startup.summary}</p><div className='grid grid-cols-3 gap-2 text-center'><MiniMetric label='Readiness' value={`${startup.score}%`} /><MiniMetric label='Team' value={String(startup.team.length)} /><MiniMetric label='Open roles' value={String(startup.openRoles.length)} /></div>{current && <div className='rounded-xl border bg-muted/25 p-3'><div className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>Current milestone</div><b className='mt-1 block text-sm'>{current.title}</b><p className='mt-1 text-xs text-muted-foreground'>{current.desc}</p></div>}<div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{Object.entries(result.explanation.scoreBreakdown).map(([label, value]) => <MiniMetric key={label} label={label} value={String(Math.round(value))} />)}</div><div className='rounded-xl border p-3 text-xs'><b>Why it matches</b><ul className='mt-2 space-y-1 text-muted-foreground'>{result.explanation.matchedSignals.slice(0, 4).map((signal) => <li key={signal}>✓ {signal}</li>)}{result.explanation.missingSignals.slice(0, 3).map((signal) => <li key={signal} className='text-amber-600'>△ {signal}</li>)}</ul></div></CardContent>
        <CardFooter className='flex-wrap gap-2 border-t'><Button size='sm' variant={watched.has(startup.slug) ? 'default' : 'outline'} onClick={() => onWatch(startup)}><Bookmark className={watched.has(startup.slug) ? 'fill-current' : ''} />{watched.has(startup.slug) ? 'Watching' : 'Watch'}</Button><Button size='sm' variant={compared.has(startup.slug) ? 'default' : 'outline'} onClick={() => onCompare(startup)}><Columns3 />{compared.has(startup.slug) ? 'Compared' : 'Compare'}</Button><Button size='sm' variant='outline' onClick={() => recordIntro(startup.slug, startup.name)}><MessagesSquare />Request intro</Button><Button size='sm' className='ml-auto' onClick={() => onOpen(startup.slug)}>Evidence<ChevronRight /></Button></CardFooter>
      </Card>
    })}{ranked.length === 0 && <Card className='border-dashed lg:col-span-2'><CardContent className='py-16 text-center'><Search className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='font-semibold'>No ventures meet every active constraint</p><p className='mt-1 text-sm text-muted-foreground'>Lower minimum readiness or remove a stage or sector filter.</p></CardContent></Card>}</div>
  </>
}

function InvestorPipeline({
  startups, ranked, pipeline, notes, verifiedStartupEvidence, onStage, onNote, onOpen,
}: {
  startups: StartupData[]
  ranked: AssistantResult[]
  pipeline: Record<string, PipelineStage>
  notes: Record<string, string>
  verifiedStartupEvidence: Set<string>
  onStage: (slug: string, value: PipelineStage) => void
  onNote: (slug: string, value: string) => void
  onOpen: (slug: string) => void
}) {
  const counts = Object.fromEntries(pipelineStages.map((stage) => [
    stage,
    startups.filter((startup) => (pipeline[startup.slug] ?? 'sourced') === stage).length,
  ])) as Record<PipelineStage, number>
  return <section>
    <div className='mb-5'>
      <h2 className='text-2xl font-bold'>Investment review pipeline</h2>
      <p className='mt-1 text-sm text-muted-foreground'>Move ventures through a browser-persisted review workflow, keep concise notes, and inspect missing evidence before requesting an introduction.</p>
    </div>
    <div className='mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>{pipelineStages.map((stage) => <Card key={stage} className='glass-card'><CardContent className='p-4'><div className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>{stage}</div><div className='mt-1 text-3xl font-extrabold'>{counts[stage]}</div></CardContent></Card>)}</div>
    <div className='overflow-x-auto rounded-xl border bg-card/60'>
      <table className='w-full min-w-[1100px] text-sm'>
        <thead><tr className='border-b bg-muted/30 text-left text-xs text-muted-foreground'><th className='p-4'>Venture</th><th className='p-4'>Thesis match</th><th className='p-4'>Readiness</th><th className='p-4'>Evidence</th><th className='p-4'>Review stage</th><th className='p-4'>Investor note</th><th className='p-4'>Action</th></tr></thead>
        <tbody>{startups.map((startup) => {
          const match = ranked.find((result) => result.entityId === startup.slug)
          const risks = [
            ...(!verifiedStartupEvidence.has(startup.slug) ? ['Evidence unverified'] : []),
            ...(startup.openRoles.length ? [`${startup.openRoles.length} team gap${startup.openRoles.length === 1 ? '' : 's'}`] : []),
            ...(startup.score < 70 ? ['Early readiness'] : []),
          ]
          return <tr key={startup.slug} className='border-b last:border-0 align-top'>
            <td className='p-4'><button type='button' onClick={() => onOpen(startup.slug)} className='font-semibold hover:text-primary'>{startup.name}</button><p className='mt-1 text-xs text-muted-foreground'>{startup.sector} · {startup.stage}</p><div className='mt-2 flex flex-wrap gap-1'>{risks.length ? risks.map((risk) => <Badge key={risk} variant='outline' className='border-amber-500/30 text-[9px] text-amber-600'>{risk}</Badge>) : <Badge className='bg-emerald-500/10 text-[9px] text-emerald-600'>No flagged gaps</Badge>}</div></td>
            <td className='p-4 font-bold text-primary'>{match?.explanation.totalScore ?? 0}%</td>
            <td className='p-4'><b>{startup.score}%</b><div className='mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${startup.score}%` }} /></div></td>
            <td className='p-4'>{verifiedStartupEvidence.has(startup.slug) ? <Badge className='gap-1 bg-emerald-500/10 text-emerald-600'><FileCheck2 className='size-3' />Verified</Badge> : <Badge variant='outline'>Needs review</Badge>}</td>
            <td className='p-4'><select value={pipeline[startup.slug] ?? 'sourced'} onChange={(event) => onStage(startup.slug, event.target.value as PipelineStage)} className='h-9 rounded-lg border bg-background px-2 capitalize text-foreground'>{pipelineStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></td>
            <td className='p-4'><div className='relative'><StickyNote className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground' /><Input value={notes[startup.slug] ?? ''} onChange={(event) => onNote(startup.slug, event.target.value)} className='min-w-64 pl-8' placeholder='Decision note or next question' /></div></td>
            <td className='p-4'><div className='flex gap-2'><Button size='sm' variant='outline' onClick={() => recordIntro(startup.slug, startup.name)}><MessagesSquare className='size-3.5' />Intro</Button><Button size='sm' onClick={() => onOpen(startup.slug)}>Review</Button></div></td>
          </tr>
        })}</tbody>
      </table>
    </div>
    <Card className='mt-5'><CardContent className='flex gap-3 p-4 text-sm text-muted-foreground'><AlertTriangle className='size-5 shrink-0 text-amber-500' /><p>Pipeline state and notes are illustrative browser data. Match and readiness scores prioritize review; they do not estimate funding probability or investment return.</p></CardContent></Card>
  </section>
}

function InvestorCompare({ startups: selected, response, onRemove, onDiscover }: { startups: StartupData[]; response: ReturnType<typeof runAssistant>; onRemove: (startup: StartupData) => void; onDiscover: () => void }) {
  if (selected.length === 0) return <Card className='border-dashed'><CardContent className='py-20 text-center'><Columns3 className='mx-auto mb-3 size-10 text-muted-foreground' /><h2 className='text-xl font-bold'>Select ventures to compare</h2><p className='mt-2 text-sm text-muted-foreground'>Add up to three ventures from thesis discovery.</p><Button className='mt-5' onClick={onDiscover}><Compass />Open discovery</Button></CardContent></Card>
  return <div className='space-y-5'><div><h2 className='text-2xl font-bold'>Side-by-side evidence comparison</h2><p className='mt-1 text-sm text-muted-foreground'>All values are derived from the current illustrative venture records.</p></div><div className='overflow-x-auto rounded-xl border'><table className='w-full min-w-[760px] text-sm'><thead><tr className='border-b bg-muted/30'><th className='p-4 text-left'>Signal</th>{selected.map((startup) => <th key={startup.slug} className='p-4 text-left'><div className='flex items-center justify-between gap-2'><span>{startup.name}</span><Button variant='ghost' size='sm' onClick={() => onRemove(startup)}>Remove</Button></div></th>)}</tr></thead><tbody>{[
    { label: 'Sector / stage', render: (startup: StartupData) => `${startup.sector} · ${startup.stage}` },
    { label: 'Readiness', render: (startup: StartupData) => `${startup.score}%` },
    { label: 'Thesis match', render: (startup: StartupData) => `${response.results.find((result) => result.entityId === startup.slug)?.explanation.totalScore ?? 0}%` },
    { label: 'Completed milestones', render: (startup: StartupData) => String(startup.milestones.filter((item) => item.status === 'done').length) },
    { label: 'Team / open roles', render: (startup: StartupData) => `${startup.team.length} / ${startup.openRoles.length}` },
    { label: 'Evidence strength', render: (startup: StartupData) => `${Math.round(startupSignalBreakdown(startup, response.criteria).evidenceRaw)}% prototype coverage` },
    { label: 'Team completeness', render: (startup: StartupData) => `${Math.round(startupSignalBreakdown(startup, response.criteria).teamRaw)}%` },
    { label: 'Current gap', render: (startup: StartupData) => startup.openRoles.length ? startup.openRoles.map((role) => role.title).join(', ') : 'No open role recorded' },
  ].map((row) => <tr key={row.label} className='border-b last:border-0'><th className='p-4 text-left font-medium text-muted-foreground'>{row.label}</th>{selected.map((startup) => <td key={startup.slug} className='p-4'>{row.render(startup)}</td>)}</tr>)}</tbody></table></div><Card><CardContent className='flex gap-3 p-4 text-sm text-muted-foreground'><AlertTriangle className='size-5 shrink-0 text-amber-500' /><p>Comparison supports review prioritization only. It does not model valuation, investment return, or funding probability.</p></CardContent></Card></div>
}

function InvestorMentors({ mentors, onOpen }: { mentors: MentorData[]; onOpen: () => void }) {
  const active = mentors.filter((mentor) => mentor.status !== 'suspended')
  return <section><div className='mb-4 flex items-center gap-2'><GraduationCap className='size-5 text-amber-500' /><h2 className='text-lg font-semibold'>Mentor capacity supporting the pipeline</h2><Badge variant='secondary'>{active.length} available</Badge></div><div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>{active.map((mentor) => <Card key={mentor.id} className='glass-card'><CardContent className='p-4'><div className='flex items-start gap-3'><span className='grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500'><GraduationCap className='size-5' /></span><div className='min-w-0 flex-1'><b className='block text-sm'>{mentor.name}</b><p className='truncate text-xs text-muted-foreground'>{mentor.title}</p></div><Badge variant='outline' className='text-[10px]'>{mentor.focusStage}</Badge></div><div className='mt-3 flex flex-wrap gap-1'>{mentor.expertise.map((expertise) => <Badge key={expertise} variant='secondary' className='text-[10px]'>{expertise}</Badge>)}</div><p className='mt-3 text-xs text-muted-foreground'>★ {mentor.rating.toFixed(1)} · {mentor.sessions} recorded sessions · {mentor.status}</p><Button size='sm' variant='outline' className='mt-3 w-full' onClick={onOpen}>View office hours</Button></CardContent></Card>)}</div></section>
}

function FilterGroup({ label, values, selected, onSelect }: { label: string; values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <div><p className='mb-2 text-xs font-semibold text-muted-foreground'>{label}</p><div className='flex flex-wrap gap-1.5'>{values.map((value) => <button key={value} onClick={() => onSelect(value)} className={cn('rounded-full border px-3 py-1 text-xs font-medium', selected === value ? 'border-primary/40 bg-primary/15 text-primary' : 'text-muted-foreground')}>{value}</button>)}</div></div>
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className='rounded-lg bg-muted/40 p-2'><div className='text-[10px] capitalize text-muted-foreground'>{label}</div><div className='font-semibold'>{value}</div></div>
}

function SignalRow({ ok, text }: { ok: boolean; text: string }) {
  return <div className='flex items-center gap-2'><span className={cn('grid size-5 place-items-center rounded-full', ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}>{ok ? <CheckCircle2 className='size-3.5' /> : <AlertTriangle className='size-3.5' />}</span><span>{text}</span></div>
}
