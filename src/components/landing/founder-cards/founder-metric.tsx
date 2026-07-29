import {
  Activity, BadgeDollarSign, Building2, FlaskConical, Leaf, Star, Stethoscope,
  TrendingUp, Users, type LucideIcon,
} from 'lucide-react'
import type { FounderMetricData, FounderMetricIcon } from './founder-card.types'

const METRIC_ICONS: Record<FounderMetricIcon, LucideIcon> = {
  pilot: FlaskConical,
  campus: Building2,
  impact: Leaf,
  users: Users,
  activity: Activity,
  rating: Star,
  revenue: BadgeDollarSign,
  providers: Stethoscope,
  growth: TrendingUp,
}

export function FounderMetric({ metric }: { metric: FounderMetricData }) {
  const Icon = METRIC_ICONS[metric.icon]

  return (
    <div className='founder-metric'>
      <Icon aria-hidden='true' />
      <strong>{metric.value}</strong>
      <span>{metric.label}</span>
    </div>
  )
}
