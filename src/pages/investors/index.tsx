import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Bookmark, CalendarCheck2, Columns3, Compass, GraduationCap, Handshake,
  ListTodo, MessagesSquare, Search, Workflow,
} from 'lucide-react'
import { mentors as staticMentors, startups as staticStartups, type StartupData } from '@/data/platform-content'
import {
  investorActivities,
  investorAlerts,
  investorMeetings,
  investorOpportunities,
  savedInvestorTheses,
  type InvestorPipelineStage,
} from '@/data/investor-workspace-data'
import { assistantContextFromSnapshot, type AssistantResponse } from '@/features/assistant/types'
import { runAssistant } from '@/features/assistant/engine'
import {
  InvestorActionKpi,
  InvestorTasksCard,
  InvestorWorkspaceHeader,
  OpportunityInbox,
  PipelinePreview,
  RecentAlertsCard,
  SavedThesisCard,
  UpcomingMeetingsCard,
  WatchlistActivityCard,
  type OpportunityInboxItem,
} from '@/components/investor'
import {
  InvestorCompare,
  InvestorDiscovery,
  InvestorExpertNetwork,
  InvestorPipeline,
} from '@/components/investor/workspace-views'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PageContainer, PageLoading } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { apiClient } from '@/data/client'
import { DemoDataBadge, ResponsiveDialog } from '@/components/execution-primitives'
import { useExecutionStore } from '@/features/execution/store'

type InvestorTab = 'overview' | 'discover' | 'pipeline' | 'compare' | 'mentors'

export function InvestorsPage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const { state: execution, store: executionStore } = useExecutionStore()
  const [tab, setTab] = useState<InvestorTab>('overview')
  const [activeThesisId, setActiveThesisId] = useState(savedInvestorTheses[0].id)
  const [draftThesis, setDraftThesis] = useState('')
  const [thesis, setThesis] = useState('')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All')
  const [location, setLocation] = useState('All')
  const [minReadiness, setMinReadiness] = useState(0)
  const [verifiedEvidenceOnly, setVerifiedEvidenceOnly] = useState(false)
  const [completeTeamOnly, setCompleteTeamOnly] = useState(false)
  const [sort, setSort] = useState<'match' | 'readiness' | 'team'>('match')
  const [introTarget, setIntroTarget] = useState<StartupData | null>(null)
  const [remoteResponse, setRemoteResponse] = useState<AssistantResponse | null>(null)
  const [matching, setMatching] = useState(false)

  if (!data) return <PageLoading />

  const watched = new Set(execution.watchlist)
  const compared = new Set(execution.comparison)
  const intros = new Set(execution.introRequests.map((item) => item.startupSlug))
  const pipeline = execution.investorPipeline as Record<string, InvestorPipelineStage>
  const notes = execution.investorNotes
  const startups = data.startups?.length ? data.startups : staticStartups
  const mentors = data.mentors?.length ? data.mentors : staticMentors
  const context = assistantContextFromSnapshot(data, startups, mentors, false)
  const thesisResponse = remoteResponse ?? runAssistant(thesis || 'Show the strongest available ventures', context, 'investor_discovery')
  const stages = ['All', ...new Set(startups.map((startup) => startup.stage))]
  const sectors = ['All', ...new Set(startups.map((startup) => startup.sector))]
  const locations = ['All', ...new Set(startups.map((startup) => startup.location))]
  const verifiedStartupEvidence = new Set(
    data.evidenceArtifacts
      .filter((item) => item.ownerType === 'startup' && item.verificationStatus === 'verified')
      .map((item) => item.ownerId),
  )
  const ranked = thesisResponse.results
    .filter((result) => {
      const startup = startups.find((item) => item.slug === result.entityId)
      return startup &&
        (stage === 'All' || startup.stage === stage) &&
        (sector === 'All' || startup.sector === sector) &&
        (location === 'All' || startup.location === location) &&
        startup.score >= minReadiness &&
        (!verifiedEvidenceOnly || verifiedStartupEvidence.has(startup.slug) || investorOpportunities[startup.slug]?.evidenceStatus === 'verified') &&
        (!completeTeamOnly || startup.openRoles.length === 0)
    })
    .sort((left, right) => {
      const leftStartup = startups.find((item) => item.slug === left.entityId)
      const rightStartup = startups.find((item) => item.slug === right.entityId)
      if (sort === 'readiness') return (rightStartup?.score ?? 0) - (leftStartup?.score ?? 0)
      if (sort === 'team') return (leftStartup?.openRoles.length ?? 0) - (rightStartup?.openRoles.length ?? 0)
      return right.explanation.totalScore - left.explanation.totalScore
    })

  const comparedStartups = startups.filter((startup) => compared.has(startup.slug))
  const activeThesis = savedInvestorTheses.find((item) => item.id === activeThesisId) ?? savedInvestorTheses[0]
  const tabs: { key: InvestorTab; label: string; icon: typeof Compass }[] = [
    { key: 'overview', label: 'Overview', icon: Search },
    { key: 'discover', label: 'Thesis discovery', icon: Compass },
    { key: 'pipeline', label: 'Deal pipeline', icon: Workflow },
    { key: 'compare', label: `Compare${compared.size ? ` (${compared.size})` : ''}`, icon: Columns3 },
    { key: 'mentors', label: 'Expert network', icon: GraduationCap },
  ]

  const toggleWatch = (startup: StartupData) => {
    executionStore.toggleWatch(startup.slug)
    toast.success(watched.has(startup.slug) ? 'Removed from watchlist' : 'Added to watchlist')
  }
  const toggleCompare = (startup: StartupData) => {
    if (!compared.has(startup.slug) && compared.size >= 3) return toast.error('Compare up to three ventures at a time.')
    executionStore.toggleCompare(startup.slug)
  }
  const requestIntro = (startup: StartupData) => setIntroTarget(startup)
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
  const selectThesis = (id: string) => {
    const selected = savedInvestorTheses.find((item) => item.id === id)
    setActiveThesisId(id)
    if (selected) setDraftThesis(`${selected.sectors.join(', ')} ventures at ${selected.stages.join(' or ')} stage, minimum readiness ${selected.minimumReadiness}, ${selected.evidenceRequirement}.`)
  }
  const openStartup = (slug: string) => navigate({ to: '/startups/$slug', params: { slug } })
  const setPipelineStage = (slug: string, value: InvestorPipelineStage) => {
    executionStore.update((current) => ({ ...current, investorPipeline: { ...current.investorPipeline, [slug]: value } }))
  }
  const setInvestorNote = (slug: string, value: string) => {
    executionStore.update((current) => ({ ...current, investorNotes: { ...current.investorNotes, [slug]: value } }))
  }

  return (
    <PageContainer>
      <div className='mb-3'><DemoDataBadge label='Illustrative investor signals' /></div>
      <InvestorWorkspaceHeader
        theses={savedInvestorTheses}
        activeThesisId={activeThesisId}
        onThesisChange={selectThesis}
        onSettings={() => navigate({ to: '/settings' })}
        onNewSearch={() => setTab('discover')}
      />

      <nav className='no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1' aria-label='Investor workspace sections'>
        {tabs.map((item) => (
          <button
            type='button'
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              tab === item.key ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:border-primary/25 hover:text-foreground',
            )}
          >
            <item.icon className='size-3.5' />{item.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <InvestorOverview
          startups={startups}
          activeThesis={activeThesis}
          watched={watched}
          compared={compared}
          intros={intros}
          pipeline={pipeline}
          onWatch={toggleWatch}
          onCompare={toggleCompare}
          onIntro={requestIntro}
          onOpen={openStartup}
          onDiscover={() => setTab('discover')}
          onPipeline={() => setTab('pipeline')}
        />
      )}
      {tab === 'discover' && (
        <InvestorDiscovery
          draftThesis={draftThesis}
          setDraftThesis={setDraftThesis}
          applyThesis={() => void applyThesis()}
          matching={matching}
          response={thesisResponse}
          ranked={ranked}
          stage={stage}
          setStage={setStage}
          stages={stages}
          sector={sector}
          setSector={setSector}
          sectors={sectors}
          minReadiness={minReadiness}
          setMinReadiness={setMinReadiness}
          location={location}
          setLocation={setLocation}
          locations={locations}
          verifiedEvidenceOnly={verifiedEvidenceOnly}
          setVerifiedEvidenceOnly={setVerifiedEvidenceOnly}
          completeTeamOnly={completeTeamOnly}
          setCompleteTeamOnly={setCompleteTeamOnly}
          sort={sort}
          setSort={setSort}
          verifiedStartupEvidence={verifiedStartupEvidence}
          startups={startups}
          watched={watched}
          compared={compared}
          intros={intros}
          onWatch={toggleWatch}
          onCompare={toggleCompare}
          onIntro={requestIntro}
          onOpen={openStartup}
        />
      )}
      {tab === 'pipeline' && (
        <InvestorPipeline
          startups={startups}
          ranked={thesisResponse.results}
          pipeline={pipeline}
          notes={notes}
          onStage={setPipelineStage}
          onNote={setInvestorNote}
          onIntro={requestIntro}
          onOpen={openStartup}
        />
      )}
      {tab === 'compare' && <InvestorCompare selected={comparedStartups} response={thesisResponse} onRemove={toggleCompare} onDiscover={() => setTab('discover')} />}
      {tab === 'mentors' && <InvestorExpertNetwork mentors={mentors} onOpen={() => navigate({ to: '/mentorship' })} />}
      <IntroRequestDialog startup={introTarget} investorId={data.currentUser?.id ?? 'usr_8'} onClose={() => setIntroTarget(null)} />
    </PageContainer>
  )
}

function IntroRequestDialog({ startup, investorId, onClose }: { startup: StartupData | null; investorId: string; onClose: () => void }) {
  const { store } = useExecutionStore()
  const [reason, setReason] = useState('')
  return <ResponsiveDialog
    open={Boolean(startup)}
    onOpenChange={(open) => !open && onClose()}
    title={`Request an introduction${startup ? ` to ${startup.name}` : ''}`}
    description='Explain why the introduction is relevant. The request will be tracked through its connection status.'
    footer={<><Button variant='outline' onClick={onClose}>Cancel</Button><Button disabled={reason.trim().length < 10} onClick={() => { if (!startup) return; store.requestIntro(investorId, startup.slug, reason.trim()); toast.success(`Intro request recorded for ${startup.name}`); setReason(''); onClose() }}>Send request</Button></>}
  >
    <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder='The thesis fit, signal you reviewed, and purpose of the conversation…' className='min-h-32' />
    <p className='mt-3 text-xs text-muted-foreground'>This is a local sample request. No message is sent outside the demo workspace.</p>
  </ResponsiveDialog>
}

function InvestorOverview({
  startups,
  activeThesis,
  watched,
  compared,
  intros,
  pipeline,
  onWatch,
  onCompare,
  onIntro,
  onOpen,
  onDiscover,
  onPipeline,
}: {
  startups: StartupData[]
  activeThesis: (typeof savedInvestorTheses)[number]
  watched: Set<string>
  compared: Set<string>
  intros: Set<string>
  pipeline: Record<string, InvestorPipelineStage>
  onWatch: (startup: StartupData) => void
  onCompare: (startup: StartupData) => void
  onIntro: (startup: StartupData) => void
  onOpen: (slug: string) => void
  onDiscover: () => void
  onPipeline: () => void
}) {
  const opportunities: OpportunityInboxItem[] = startups
    .map((startup) => {
      const opportunity = investorOpportunities[startup.slug]
      if (!opportunity) return null
      return { startup, opportunity, match: opportunity.thesisMatch }
    })
    .filter((item): item is OpportunityInboxItem => Boolean(item))
    .sort((left, right) => right.match - left.match)

  const newMatches = opportunities.filter((item) => item.match >= 80).length
  const diligenceCount = startups.filter((startup) => (pipeline[startup.slug] ?? 'sourced') === 'diligence').length
  const kpis = [
    { label: 'New thesis matches', value: newMatches, change: '+3 this week', context: 'review relevance', icon: Search, onClick: onDiscover },
    { label: 'Watchlist ventures', value: watched.size, change: '+2 updates', context: 'since yesterday', icon: Bookmark, onClick: () => document.getElementById('watchlist-updates')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Meetings scheduled', value: investorMeetings.length, change: 'Next tomorrow', context: 'founder intro', icon: CalendarCheck2, onClick: () => document.getElementById('upcoming-meetings')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'In diligence', value: diligenceCount, change: '1 evidence update', context: 'needs review', icon: ListTodo, onClick: onPipeline },
    { label: 'Intro requests', value: intros.size, change: intros.size ? 'Browser saved' : 'No requests yet', context: 'current workspace', icon: Handshake, onClick: onPipeline },
  ]

  return (
    <>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
        {kpis.map((kpi) => <InvestorActionKpi key={kpi.label} {...kpi} />)}
      </div>

      <div className='mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <main className='min-w-0 space-y-6'>
          <OpportunityInbox
            items={opportunities.slice(0, 5)}
            watched={watched}
            compared={compared}
            intros={intros}
            onWatch={onWatch}
            onCompare={onCompare}
            onIntro={onIntro}
            onReview={(startup) => onOpen(startup.slug)}
            onViewAll={onDiscover}
          />
          <WatchlistActivityCard activities={investorActivities} startups={startups} watched={watched} onOpen={onOpen} />
          <PipelinePreview startups={startups} pipeline={pipeline} onOpenPipeline={onPipeline} onOpenVenture={onOpen} />
        </main>
        <aside className='min-w-0 space-y-5'>
          <SavedThesisCard thesis={activeThesis} onEdit={onDiscover} />
          <UpcomingMeetingsCard meetings={investorMeetings} startups={startups} onOpen={onOpen} />
          <InvestorTasksCard />
          <RecentAlertsCard alerts={investorAlerts} />
        </aside>
      </div>

      <Card className='mt-6 gap-0 border-amber-500/20 bg-amber-500/[0.04] py-0'>
        <CardContent className='flex flex-col gap-3 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p>All venture, thesis, meeting and score records on this screen are illustrative. Signals support discovery and review; they do not predict investment outcomes.</p>
          <div className='flex shrink-0 items-center gap-2'><Badge variant='outline'>Decision support</Badge><Button size='sm' variant='ghost' onClick={onDiscover}><MessagesSquare />Inspect methodology</Button></div>
        </CardContent>
      </Card>
    </>
  )
}
