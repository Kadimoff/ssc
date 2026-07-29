import { ArrowUpRight, Code2, HandCoins, Palette, type LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { FounderNeed, FounderNeedIcon } from './founder-card.types'

const NEED_ICONS: Record<FounderNeedIcon, LucideIcon> = {
  code: Code2,
  design: Palette,
  funding: HandCoins,
}

export function FounderNeedCTA({
  need,
  profileHref,
  founderName,
}: {
  need: FounderNeed
  profileHref: string
  founderName: string
}) {
  const Icon = NEED_ICONS[need.icon]

  return (
    <Link
      to={profileHref}
      className='founder-need-cta'
      aria-label={`Connect with ${founderName} about ${need.title}`}
    >
      <span className='founder-need-icon' aria-hidden='true'><Icon /></span>
      <span className='founder-need-copy'>
        <small>{need.eyebrow}</small>
        <strong>{need.title}</strong>
      </span>
      <span className='founder-need-arrow' aria-hidden='true'><ArrowUpRight /></span>
    </Link>
  )
}
