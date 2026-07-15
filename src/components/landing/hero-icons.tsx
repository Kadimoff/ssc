import { cn } from '@/lib/utils'

/**
 * Custom JS-generated 3D hero icons (inline SVG). Each uses a unique gradient
 * + radial shine for depth and a colored drop-shadow glow; a subtle CSS float
 * animation is applied to the icon group. On-brand: emerald / teal / gold.
 */

type IconProps = { className?: string }

export function IconBuilders({ className }: IconProps) {
  return (
    <svg viewBox='0 0 48 48' className={cn('size-11', className)} fill='none' aria-hidden='true'>
      <defs>
        <linearGradient id='hb-node' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#6ee7b7' />
          <stop offset='0.55' stopColor='#10b981' />
          <stop offset='1' stopColor='#0f766e' />
        </linearGradient>
        <radialGradient id='hb-shine' cx='0.34' cy='0.28' r='0.7'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.85' />
          <stop offset='0.4' stopColor='#ffffff' stopOpacity='0.12' />
          <stop offset='1' stopColor='#ffffff' stopOpacity='0' />
        </radialGradient>
      </defs>
      <g className='hero-icon-float' style={{ filter: 'drop-shadow(0 6px 9px rgba(16,185,129,.45))' }}>
        <g stroke='url(#hb-node)' strokeWidth='2' strokeOpacity='0.5' strokeLinecap='round'>
          <line x1='24' y1='11' x2='11' y2='30' />
          <line x1='24' y1='11' x2='37' y2='30' />
          <line x1='11' y1='30' x2='24' y2='38' />
          <line x1='37' y1='30' x2='24' y2='38' />
          <line x1='11' y1='30' x2='37' y2='30' />
        </g>
        {[[24, 11, 6], [11, 30, 5], [37, 30, 5], [24, 38, 6.5]].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill='url(#hb-node)' />
            <circle cx={cx} cy={cy} r={r} fill='url(#hb-shine)' />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function IconUniversities({ className }: IconProps) {
  return (
    <svg viewBox='0 0 48 48' className={cn('size-11', className)} fill='none' aria-hidden='true'>
      <defs>
        <linearGradient id='hu-top' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#fde68a' />
          <stop offset='1' stopColor='#d97706' />
        </linearGradient>
        <linearGradient id='hu-col' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#fcd34d' />
          <stop offset='1' stopColor='#b45309' />
        </linearGradient>
        <linearGradient id='hu-base' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#f59e0b' />
          <stop offset='1' stopColor='#92400e' />
        </linearGradient>
      </defs>
      <g className='hero-icon-float' style={{ filter: 'drop-shadow(0 6px 9px rgba(245,158,11,.45))' }}>
        <rect x='7' y='37' width='34' height='4' rx='1.5' fill='url(#hu-base)' />
        <rect x='5' y='33' width='38' height='4' rx='1.5' fill='url(#hu-base)' />
        {[10, 18, 26, 34].map((x) => (
          <rect key={x} x={x} y='19' width='4' height='14' rx='1.5' fill='url(#hu-col)' />
        ))}
        <path d='M4 19 L24 8 L44 19 Z' fill='url(#hu-top)' stroke='#fde68a' strokeWidth='0.8' strokeLinejoin='round' />
        <path d='M24 8 L24 19' stroke='#fff7e6' strokeWidth='0.8' strokeOpacity='0.6' />
      </g>
    </svg>
  )
}

export function IconMentors({ className }: IconProps) {
  return (
    <svg viewBox='0 0 48 48' className={cn('size-11', className)} fill='none' aria-hidden='true'>
      <defs>
        <linearGradient id='hm-board' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#6ee7b7' />
          <stop offset='1' stopColor='#047857' />
        </linearGradient>
        <linearGradient id='hm-cap' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#10b981' />
          <stop offset='1' stopColor='#064e3b' />
        </linearGradient>
        <linearGradient id='hm-tassel' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#fde68a' />
          <stop offset='1' stopColor='#d97706' />
        </linearGradient>
      </defs>
      <g className='hero-icon-float' style={{ filter: 'drop-shadow(0 7px 9px rgba(16,185,129,.45))' }}>
        {/* mortarboard top (rhombus) */}
        <path d='M6 19 L24 12 L42 19 L24 26 Z' fill='url(#hm-board)' stroke='#a7f3d0' strokeWidth='0.7' strokeLinejoin='round' />
        {/* cap depth (trapezoid under the board) */}
        <path d='M15 23.5 L15 31 Q24 35 33 31 L33 23.5 L24 26 Z' fill='url(#hm-cap)' />
        {/* tassel */}
        <path d='M42 19 L42 28' stroke='url(#hm-tassel)' strokeWidth='1.8' strokeLinecap='round' />
        <circle cx='42' cy='31' r='2.6' fill='url(#hm-tassel)' />
      </g>
    </svg>
  )
}

export function IconPartners({ className }: IconProps) {
  return (
    <svg viewBox='0 0 48 48' className={cn('size-11', className)} fill='none' aria-hidden='true'>
      <defs>
        <linearGradient id='hp-ring1' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#5eead4' />
          <stop offset='1' stopColor='#0f766e' />
        </linearGradient>
        <linearGradient id='hp-ring2' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#fde68a' />
          <stop offset='1' stopColor='#b45309' />
        </linearGradient>
      </defs>
      <g className='hero-icon-float' style={{ filter: 'drop-shadow(0 6px 9px rgba(20,184,166,.40))' }}>
        <circle cx='18' cy='24' r='11' fill='none' stroke='url(#hp-ring1)' strokeWidth='4' />
        <circle cx='30' cy='24' r='11' fill='none' stroke='url(#hp-ring2)' strokeWidth='4' />
        {/* tiny highlight ticks */}
        <path d='M11 18 A11 11 0 0 1 20 14' fill='none' stroke='#ffffff' strokeOpacity='0.5' strokeWidth='1.4' strokeLinecap='round' />
        <path d='M28 14 A11 11 0 0 1 37 18' fill='none' stroke='#ffffff' strokeOpacity='0.5' strokeWidth='1.4' strokeLinecap='round' />
      </g>
    </svg>
  )
}
