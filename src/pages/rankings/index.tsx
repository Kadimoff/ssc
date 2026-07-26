import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { BriefcaseBusiness, TrendingUp, ArrowDown, ArrowUp, Gauge, Pause, Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MotionRocket } from '@/components/motion-rocket'
import { PageContainer, PageHeading } from '@/app/app-shared'

/* ------------------------------------------------------------------ */
/*  Startup Hiring Rankings — animated racing leaderboard             */
/* ------------------------------------------------------------------ */

interface RankingStartup {
  slug: string; name: string; sector: string; color: string; openRoles: number; weeks: number[]
}

// Hiring-momentum over 12 weeks (composite of open roles × growth signals).
// Series cross over on purpose so ranks race.
const startupRankings: RankingStartup[] = [
  { slug: 'greenstack', name: 'GreenStack', sector: 'Climate', color: '#10b981', openRoles: 5, weeks: [40, 42, 45, 50, 55, 60, 68, 72, 70, 75, 82, 88] },
  { slug: 'edflow', name: 'EduFlow', sector: 'EdTech', color: '#a78bfa', openRoles: 3, weeks: [70, 72, 75, 73, 70, 65, 62, 60, 58, 55, 60, 62] },
  { slug: 'medimatch', name: 'MediMatch', sector: 'Health', color: '#f5b840', openRoles: 2, weeks: [50, 55, 58, 60, 62, 65, 64, 66, 70, 72, 74, 78] },
  { slug: 'mediroute', name: 'MediRoute', sector: 'Health', color: '#38bdf8', openRoles: 1, weeks: [85, 84, 82, 80, 78, 75, 72, 70, 68, 66, 64, 60] },
  { slug: 'skillbridge', name: 'SkillBridge AI', sector: 'EdTech', color: '#f87171', openRoles: 4, weeks: [35, 38, 42, 48, 52, 58, 62, 65, 68, 72, 76, 80] },
  { slug: 'modelworks', name: 'ModelWorks', sector: 'AI', color: '#14b8a6', openRoles: 3, weeks: [60, 62, 60, 58, 60, 62, 65, 68, 66, 64, 66, 68] },
  { slug: 'orbitlabs', name: 'Orbit Labs', sector: 'SaaS', color: '#fb923c', openRoles: 2, weeks: [45, 44, 42, 40, 38, 40, 42, 45, 48, 50, 52, 54] },
  { slug: 'northstudio', name: 'North Studio', sector: 'Design', color: '#c084fc', openRoles: 1, weeks: [30, 32, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60] },
]

const RANK_WEEKS = 12

const RANK_ROW_H = 74

export function RankingsPage() {
  const [week, setWeek] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const trackRef = useRef<HTMLDivElement>(null)
  const rowEls = useRef<Map<string, HTMLDivElement>>(new Map())
  useGSAP(() => { gsap.set('[data-rank-row]', { y: 0 }) }, { scope: trackRef })

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => setWeek((w) => (w + 1) % RANK_WEEKS), 1500 / speed)
    return () => window.clearTimeout(id)
  }, [week, playing, speed])

  const ranked = useMemo(() => startupRankings
    .map((s) => ({ slug: s.slug, momentum: s.weeks[week] }))
    .sort((a, b) => b.momentum - a.momentum), [week])
  const rankOf = (slug: string) => ranked.findIndex((r) => r.slug === slug)
  const maxMomentum = Math.max(...ranked.map((r) => r.momentum), 1)

  useGSAP(() => {
    startupRankings.forEach((s) => {
      const el = rowEls.current.get(s.slug)
      if (!el) return
      gsap.to(el, { y: rankOf(s.slug) * RANK_ROW_H, duration: 0.85, ease: 'power3.inOut' })
    })
  }, { dependencies: [week] })

  const leader = ranked[0] ? startupRankings.find((s) => s.slug === ranked[0].slug) : null
  // biggest climber vs week 0
  const climber = [...startupRankings].map((s) => ({ s, delta: s.weeks[week] - s.weeks[Math.max(0, week - 1)] })).sort((a, b) => b.delta - a.delta)[0]
  const totalRoles = startupRankings.reduce((sum, s) => sum + s.openRoles, 0)

  return <PageContainer>
    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <PageHeading eyebrow='Hiring rankings' title='The race for talent, week by week.' description='Student startups compete by hiring momentum — open roles weighted by growth signals. Bars race as the quarter unfolds.' />
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}><Gauge className='size-4' />{speed}× speed</Button>
        <Button variant='outline' size='sm' onClick={() => { setWeek(0); setPlaying(true) }}><RefreshCw className='size-4' />Restart</Button>
        <Button size='sm' onClick={() => setPlaying((p) => !p)}>{playing ? <><Pause className='size-4' />Pause</> : <><Play className='size-4' />Play</>}</Button>
      </div>
    </div>

    {/* KPI row */}
    <div className='mb-6 grid gap-4 sm:grid-cols-3'>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-amber-500/15'><MotionRocket color='#f5b840' boost size={20} /></span><div><CardDescription>Current leader</CardDescription><CardTitle className='text-lg'>{leader?.name ?? '—'}</CardTitle></div></CardHeader></Card>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500'><TrendingUp className='size-5' /></span><div><CardDescription>Biggest climber</CardDescription><CardTitle className='text-lg'>{climber?.s.name ?? '—'} <span className='text-xs font-semibold text-emerald-500'>+{climber?.delta ?? 0}</span></CardTitle></div></CardHeader></Card>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-sky-500/15 text-sky-500'><BriefcaseBusiness className='size-5' /></span><div><CardDescription>Open roles tracked</CardDescription><CardTitle className='text-lg'>{totalRoles}</CardTitle></div></CardHeader></Card>
    </div>

    {/* Week scrubber */}
    <Card className='glass-card mb-5 p-4'><div className='flex items-center gap-4'>
      <div className='text-sm font-semibold whitespace-nowrap'>Week {week + 1}<span className='text-muted-foreground'> / {RANK_WEEKS}</span></div>
      <input type='range' min={0} max={RANK_WEEKS - 1} value={week} onChange={(e) => { setWeek(Number(e.target.value)); setPlaying(false) }} className='h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary' />
    </div></Card>

    {/* Racing track */}
    <Card className='glass-card overflow-hidden p-0'>
      <div className='flex items-center justify-between border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        <span>Hiring momentum</span><span>Live ranking</span>
      </div>
      <div className='relative px-3 py-3 sm:px-4' style={{ height: startupRankings.length * RANK_ROW_H + 8 }}>
        <div ref={trackRef} className='relative'>
          {startupRankings.map((s) => {
            const rank = rankOf(s.slug)
            const momentum = s.weeks[week]
            const prev = s.weeks[Math.max(0, week - 1)]
            const change = momentum - prev
            const widthPct = (momentum / maxMomentum) * 100
            const isLeader = rank === 0
            return (
              <div
                key={s.slug}
                data-rank-row={s.slug}
                ref={(el) => { if (el) rowEls.current.set(s.slug, el) }}
                className='absolute inset-x-0' style={{ top: 4, height: RANK_ROW_H - 8 }}
              >
                <div className='flex h-full items-center gap-3'>
                  <div className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold', isLeader ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground')}>{rank + 1}</div>
                  <div className='grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white' style={{ background: s.color }}>{s.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
                  <div className='w-28 shrink-0 truncate sm:w-36'><b className='block truncate text-sm'>{s.name}</b><span className='text-[10px] text-muted-foreground'>{s.sector} · {s.openRoles} open</span></div>
                  <div className='relative h-7 flex-1 rounded-md bg-muted/40'>
                    <div className='absolute inset-y-0 left-0 flex items-center overflow-hidden rounded-md px-2 transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]' style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${s.color}, color-mix(in srgb, ${s.color} 60%, #f5b840))`, boxShadow: isLeader ? `0 0 22px -4px ${s.color}` : 'none' }}>
                      <span className='truncate text-xs font-bold text-white drop-shadow-sm'>{momentum}</span>
                    </div>
                    {/* Rocket riding the leading edge — boosts on rank climb */}
                    <div className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]' style={{ left: `${widthPct}%` }}>
                      <MotionRocket color={s.color} boost={change > 0} size={17} />
                    </div>
                  </div>
                  <div className='w-12 shrink-0 text-right'>
                    {change > 0 && <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500'><ArrowUp className='size-3' />{change}</span>}
                    {change < 0 && <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-red-400'><ArrowDown className='size-3' />{Math.abs(change)}</span>}
                    {change === 0 && <span className='text-xs text-muted-foreground'>—</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>

    <p className='mt-4 text-xs text-muted-foreground'>Momentum = open roles weighted by recent growth and engagement signals. Series is illustrative for the demo; the real metric will be computed server-side when the backend lands.</p>
  </PageContainer>
}
