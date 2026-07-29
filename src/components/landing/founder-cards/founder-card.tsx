import { Lightbulb } from 'lucide-react'
import type { FounderProfile } from './founder-card.types'
import { FounderCardHeader } from './founder-card-header'
import { FounderMetric } from './founder-metric'
import { FounderNeedCTA } from './founder-need-cta'
import { FounderTags } from './founder-tags'
import { StartupStage } from './startup-stage'

export function FounderCard({ profile }: { profile: FounderProfile }) {
  return (
    <article
      className='founder-card'
      data-founder-id={profile.id}
      aria-labelledby={`founder-${profile.id}-name`}
    >
      <FounderCardHeader profile={profile} />

      <div className='founder-card-body'>
        <div className='founder-description'>
          <span className='founder-description-icon' aria-hidden='true'>
            <Lightbulb />
          </span>
          <p>{profile.building}</p>
        </div>

        <div className='founder-metrics' aria-label={`${profile.startup} traction metrics`}>
          {profile.metrics.map((metric) => (
            <FounderMetric key={metric.label} metric={metric} />
          ))}
        </div>

        <StartupStage stage={profile.stage} />
        <FounderTags tags={profile.skills} />

        <FounderNeedCTA
          need={profile.lookingFor}
          profileHref={profile.profileHref}
          founderName={profile.name}
        />
      </div>
    </article>
  )
}
