import { BadgeCheck, GraduationCap, TrendingUp } from 'lucide-react'
import type { FounderProfile } from './founder-card.types'

export function FounderCardHeader({ profile }: { profile: FounderProfile }) {
  const portraitSrc = `${import.meta.env.BASE_URL}${profile.portrait.src}`

  return (
    <header className='founder-card-header'>
      <div className='founder-header-pattern' aria-hidden='true' />

      <div className='founder-header-badges'>
        <span className='founder-header-badge founder-header-verified' aria-label='Verified founder'>
          <BadgeCheck aria-hidden='true' />
          Verified Founder
        </span>
        <span className='founder-header-badge founder-header-traction' aria-label={`Traction: ${profile.tractionBadge}`}>
          <TrendingUp aria-hidden='true' />
          {profile.tractionBadge}
        </span>
      </div>

      <div className='founder-header-content'>
        <div className='founder-header-portrait'>
          <img
            src={portraitSrc}
            alt={profile.portrait.alt}
            loading='lazy'
            decoding='async'
            style={{ objectPosition: profile.portrait.position }}
          />
        </div>

        <div className='founder-header-identity'>
          <p className='founder-header-university'>
            <GraduationCap aria-hidden='true' />
            <span>{profile.university}</span>
          </p>
          <h3 id={`founder-${profile.id}-name`}>{profile.name}</h3>
          <p className='founder-header-role'>{profile.role}</p>
          <p className='founder-header-startup'>{profile.startup}</p>
        </div>
      </div>
    </header>
  )
}
