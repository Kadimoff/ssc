import { useMemo, useState } from 'react'
import { BadgeCheck, BarChart3, Building2, Network, Search, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainer } from '@/app/app-shared'
import { RankingFilters, RankingMethodology, RankingPodium, RankingRow, RankingScoreBreakdown } from '@/components/rankings'
import {
  categoryRankings,
  startupRankings,
  type RankingCategory,
  type RankingEntry,
  type RankingPeriod,
  type RankingSort,
} from '@/data/rankings-data'
import { cn } from '@/lib/utils'

const categories: Array<{ key: RankingCategory; label: string; icon: typeof BarChart3 }> = [
  { key: 'startups', label: 'Startups', icon: BarChart3 },
  { key: 'founders', label: 'Founders', icon: UserRound },
  { key: 'universities', label: 'Universities', icon: Building2 },
  { key: 'communities', label: 'Communities', icon: Network },
]

export function RankingsPage() {
  const [category, setCategory] = useState<RankingCategory>('startups')
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')
  const [stage, setStage] = useState('All')
  const [university, setUniversity] = useState('All')
  const [period, setPeriod] = useState<RankingPeriod>('30d')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState<RankingSort>('overall')
  const [selected, setSelected] = useState<RankingEntry | null>(null)

  const sectors = useMemo(() => ['All', ...new Set(startupRankings.map((entry) => entry.sector))], [])
  const stages = useMemo(() => ['All', ...new Set(startupRankings.map((entry) => entry.stage))], [])
  const universities = useMemo(() => ['All', ...new Set(startupRankings.map((entry) => entry.university))], [])

  const ranked = useMemo(() => startupRankings
    .map((entry) => ({ ...entry, score: entry.periodScores[period] }))
    .filter((entry) => {
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || `${entry.name} ${entry.university} ${entry.sector}`.toLowerCase().includes(query)
      return matchesSearch &&
        (sector === 'All' || entry.sector === sector) &&
        (stage === 'All' || entry.stage === stage) &&
        (university === 'All' || entry.university === university) &&
        (!verifiedOnly || entry.verifiedEvidence)
    })
    .sort((left, right) => {
      if (sort === 'growth') return right.growth - left.growth
      if (sort === 'milestones') return right.milestoneProgress - left.milestoneProgress
      if (sort === 'community') return right.communityContribution - left.communityContribution
      if (sort === 'activity') return right.activityRecency - left.activityRecency
      return right.score - left.score
    }), [period, search, sector, stage, university, verifiedOnly, sort])

  const resetFilters = () => {
    setSearch('')
    setSector('All')
    setStage('All')
    setUniversity('All')
    setPeriod('30d')
    setVerifiedOnly(false)
    setSort('overall')
  }

  return (
    <PageContainer>
      <header className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='max-w-3xl'>
          <Badge variant='secondary' className='gap-1.5'><BarChart3 className='size-3.5' />Ecosystem visibility</Badge>
          <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-4xl'>Startup Rankings</h1>
          <p className='mt-3 text-base leading-7 text-muted-foreground sm:text-lg'>Verified progress, execution and ecosystem contribution signals.</p>
          <p className='mt-2 text-xs text-muted-foreground'>Updated from current illustrative workspace records. Scores support discovery and are not outcome predictions.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline' className='h-9 gap-1.5 px-3'><ShieldCheck className='size-3.5' />Illustrative ranking</Badge>
          <RankingMethodology />
        </div>
      </header>

      <nav aria-label='Ranking categories' className='no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1'>
        {categories.map((item) => <button key={item.key} type='button' onClick={() => setCategory(item.key)} className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50', category === item.key ? 'border-primary/35 bg-primary/10 text-primary' : 'bg-card/70 text-muted-foreground hover:text-foreground')} aria-pressed={category === item.key}><item.icon className='size-3.5' />{item.label}</button>)}
      </nav>

      {category === 'startups' ? (
        <section aria-labelledby='startup-ranking-title' className='space-y-5'>
          <RankingFilters
            search={search} setSearch={setSearch}
            sector={sector} setSector={setSector} sectors={sectors}
            stage={stage} setStage={setStage} stages={stages}
            university={university} setUniversity={setUniversity} universities={universities}
            period={period} setPeriod={setPeriod}
            verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
            sort={sort} setSort={setSort} onReset={resetFilters}
          />

          {ranked.length > 0 && <RankingPodium entries={ranked} onSelect={setSelected} />}

          <Card className='gap-0 overflow-hidden border-primary/10 bg-card/80 py-0 shadow-sm'>
            <div className='flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
              <div><h2 id='startup-ranking-title' className='text-base font-semibold'>Current ranking</h2><p className='mt-0.5 text-xs text-muted-foreground'>{ranked.length} venture{ranked.length === 1 ? '' : 's'} match the active view.</p></div>
              <Badge variant='outline' className='w-fit gap-1'><BadgeCheck className='size-3 text-primary' />Decision-support signals</Badge>
            </div>
            {ranked.length > 0 ? <>
              <div className='hidden grid-cols-[44px_minmax(180px,1fr)_minmax(220px,2fr)_72px_64px_40px] gap-3 border-b bg-muted/25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:grid'>
                <span>Rank</span><span>Venture identity</span><span>Signal strength</span><span className='text-right'>Score</span><span className='text-right'>Change</span><span />
              </div>
              <div className='space-y-2 p-3 lg:space-y-0 lg:p-0'>{ranked.map((entry, index) => <RankingRow key={entry.slug} entry={entry} rank={index + 1} onDetails={setSelected} />)}</div>
            </> : <EmptyRanking />}
          </Card>

          <Card className='border-amber-500/15 bg-amber-500/[0.045]'><CardContent className='flex gap-3 p-4'><ShieldCheck className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400' /><div><p className='text-sm font-semibold'>Discovery support, not an investment ranking</p><p className='mt-1 text-xs leading-5 text-muted-foreground'>Scores combine available execution, evidence, milestones, team, community and activity records. They do not estimate investment return, funding probability or venture success.</p></div></CardContent></Card>
        </section>
      ) : <CategoryRanking category={category} />}

      <RankingScoreBreakdown entry={selected} onClose={() => setSelected(null)} />
    </PageContainer>
  )
}

function EmptyRanking() {
  return <div className='px-6 py-16 text-center'><Search className='mx-auto size-9 text-muted-foreground' /><h3 className='mt-4 font-semibold'>No ranked ventures yet</h3><p className='mt-1 text-sm text-muted-foreground'>Complete milestones and add verified evidence to appear here.</p></div>
}

function CategoryRanking({ category }: { category: Exclude<RankingCategory, 'startups'> }) {
  const entries = categoryRankings[category] ?? []
  return (
    <Card className='gap-0 overflow-hidden border-primary/10 bg-card/80 py-0'>
      <div className='border-b px-5 py-4'><h2 className='text-base font-semibold capitalize'>{category} ranking</h2><p className='mt-1 text-xs text-muted-foreground'>Illustrative ecosystem contribution and verified activity signals. Startup ranking filters do not apply to this preview.</p></div>
      {entries.length ? <div className='space-y-2 p-3'>{entries.map((entry, index) => <div key={entry.id} className='grid gap-3 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-[44px_minmax(0,1fr)_90px_60px] sm:items-center'><span className='grid size-9 place-items-center rounded-xl bg-primary/10 font-extrabold text-primary'>{index + 1}</span><div className='min-w-0'><p className='font-semibold'>{entry.name}</p><p className='mt-0.5 text-xs text-muted-foreground'>{entry.meta}</p><p className='mt-2 text-[11px] text-muted-foreground'>{entry.signal}</p></div><div><b className='text-xl'>{entry.score}</b><span className='ml-1 text-[10px] text-muted-foreground'>points</span></div><Badge variant='outline' className={entry.change > 0 ? 'text-emerald-600' : ''}>{entry.change > 0 ? `Up ${entry.change}` : 'No change'}</Badge></div>)}</div> : <EmptyRanking />}
    </Card>
  )
}
