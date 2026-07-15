/* Investor dashboard chart primitives — dependency-free, themed (emerald/gold/navy).
 *  Numbers always shown as text alongside marks (no color-only encoding). */

import { cn } from '@/lib/utils'

const CHART_COLORS = ['#10b981', '#f5b840', '#38bdf8', '#a78bfa', '#fbbf24', '#14b8a6', '#f87171']

/* ------------------------------------------------------------------ */
/*  Donut — stroke-dasharray segments                                  */
/* ------------------------------------------------------------------ */
export function Donut({ segments, size = 160, thickness = 18, centerLabel, centerSub }: {
  segments: { label: string; value: number; color?: string }[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerSub?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const r = (size - thickness) / 2
  const circ = 2 * Math.PI * r
  const segs = segments.map((s, i, arr) => {
    const dash = (s.value / total) * circ
    const offset = arr.slice(0, i).reduce((sum, x) => sum + (x.value / total) * circ, 0)
    return { dash, offset, color: s.color ?? CHART_COLORS[i % CHART_COLORS.length] }
  })
  return (
    <div className='flex items-center gap-5'>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='shrink-0' role='img' aria-label={`Donut chart, total ${total}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke='color-mix(in oklch, var(--foreground) 12%, transparent)' strokeWidth={thickness} />
        {segs.map((sg, i) => (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill='none'
            stroke={sg.color} strokeWidth={thickness}
            strokeDasharray={`${sg.dash} ${circ - sg.dash}`} strokeDashoffset={-sg.offset} strokeLinecap='butt'
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        ))}
        {centerLabel && (
          <text x='50%' y='47%' textAnchor='middle' dominantBaseline='middle' className='fill-foreground' style={{ fontSize: 26, fontWeight: 800 }}>
            {centerLabel}
          </text>
        )}
        {centerSub && (
          <text x='50%' y='60%' textAnchor='middle' dominantBaseline='middle' className='fill-muted-foreground' style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {centerSub}
          </text>
        )}
      </svg>
      <ul className='space-y-1.5 text-sm'>
        {segments.map((s, i) => (
          <li key={i} className='flex items-center gap-2'>
            <span className='size-2.5 rounded-sm' style={{ background: s.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className='text-muted-foreground'>{s.label}</span>
            <span className='ml-auto font-semibold text-foreground'>{s.value}</span>
            <span className='w-10 text-right text-xs text-muted-foreground'>{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Funnel — centered stacked bars                                     */
/* ------------------------------------------------------------------ */
export function Funnel({ steps }: { steps: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1)
  return (
    <div className='space-y-2'>
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100
        return (
          <div key={i} className='flex items-center gap-3'>
            <span className='w-24 shrink-0 text-xs text-muted-foreground'>{s.label}</span>
            <div className='relative h-7 flex-1 rounded-md bg-muted/40'>
              <div className='absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-md'
                   style={{ width: `${Math.max(pct, 14)}%`, background: s.color ?? CHART_COLORS[i % CHART_COLORS.length] }}>
                <span className='text-xs font-bold text-white drop-shadow-sm'>{s.value}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sparkline — polyline                                               */
/* ------------------------------------------------------------------ */
export function Sparkline({ points, width = 200, height = 48, color = '#10b981', value, label }: {
  points: number[]; width?: number; height?: number; color?: string; value?: string; label?: string
}) {
  const max = Math.max(...points, 1); const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = points.length > 1 ? width / (points.length - 1) : width
  const coords = points.map((p, i) => `${(i * step).toFixed(1)},${(height - ((p - min) / span) * (height - 6) - 3).toFixed(1)}`).join(' ')
  const area = `0,${height} ${coords} ${width},${height}`
  const gid = `spark-${color.replace('#', '')}`
  return (
    <div className='flex items-center gap-3'>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role='img' aria-label={label ?? 'Trend'}>
        <defs><linearGradient id={gid} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor={color} stopOpacity='0.35' /><stop offset='1' stopColor={color} stopOpacity='0' /></linearGradient></defs>
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={coords} fill='none' stroke={color} strokeWidth={2} strokeLinejoin='round' strokeLinecap='round' />
      </svg>
      {value && <div><div className='text-lg font-extrabold leading-none text-foreground'>{value}</div>{label && <div className='text-[10px] uppercase tracking-wide text-muted-foreground'>{label}</div>}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BarList — horizontal bars (div-based)                              */
/* ------------------------------------------------------------------ */
export function BarList({ items, max, suffix }: { items: { label: string; value: number; tone?: string }[]; max?: number; suffix?: string }) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-2.5'>
      {items.map((it, i) => (
        <li key={i}>
          <div className='mb-1 flex items-center justify-between text-xs'><span className='truncate text-muted-foreground'>{it.label}</span><span className='font-semibold text-foreground'>{it.value}{suffix}</span></div>
          <div className='h-2 overflow-hidden rounded-full bg-muted/50'>
            <div className={cn('h-full rounded-full', it.tone ?? 'bg-primary')} style={{ width: `${(it.value / top) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
