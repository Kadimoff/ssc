import { BadgeCheck, Lightbulb, Search, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FounderProfile, FounderStage } from './founder-card.types'

const STAGES: { key: FounderStage; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'validation', label: 'Validation' },
  { key: 'mvp', label: 'MVP' },
  { key: 'revenue', label: 'Revenue' },
]
const STAGE_ORDER: FounderStage[] = ['idea', 'validation', 'mvp', 'revenue']

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function FounderCard({ profile }: { profile: FounderProfile }) {
  const currentIdx = STAGE_ORDER.indexOf(profile.stage)
  return (
    <article className='founder-card' data-founder-id={profile.id}>
      <div className='founder-card-top'>
        <span className='founder-verified'><BadgeCheck aria-hidden='true' /> Verified student</span>
        {profile.traction && <span className='founder-traction'><TrendingUp aria-hidden='true' /> {profile.traction}</span>}
      </div>

      <div className='founder-card-head'>
        <span className='founder-avatar' aria-hidden='true'>{initials(profile.name)}</span>
        <div className='founder-card-id'>
          <h3>{profile.name}</h3>
          <p className='founder-role'>{profile.role} · <span className='founder-startup'>{profile.startup}</span></p>
          <p className='founder-uni'>{profile.university} · {profile.program}</p>
        </div>
      </div>

      <div className='founder-building'>
        <Lightbulb aria-hidden='true' />
        <p>{profile.building}</p>
      </div>

      <div className='founder-stage'>
        <span className='founder-stage-label'>Stage</span>
        <div className='founder-stage-track'>
          {STAGES.map((s, i) => (
            <span
              key={s.key}
              className={cn('founder-stage-dot', i <= currentIdx && 'is-active', i === currentIdx && 'is-current')}
            >
              <i aria-hidden='true' />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className='founder-skills'>
        {profile.skills.map((skill) => <span key={skill}>{skill}</span>)}
      </div>

      <div className='founder-looking'>
        <Search aria-hidden='true' />
        <span>Looking for <strong>{profile.lookingFor}</strong></span>
      </div>
    </article>
  )
}
