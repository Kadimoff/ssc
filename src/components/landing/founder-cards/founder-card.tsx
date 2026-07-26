import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import {
  ArrowUpRight, BadgeCheck, BookOpenText, Lightbulb, RotateCcw, Search, Sparkles,
  Target, TrendingUp, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-animations'
import type { FounderProfile, FounderStage } from './founder-card.types'

const STAGES: { key: FounderStage; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'validation', label: 'Validation' },
  { key: 'mvp', label: 'MVP' },
  { key: 'revenue', label: 'Revenue' },
]
const STAGE_ORDER: FounderStage[] = ['idea', 'validation', 'mvp', 'revenue']

export function FounderCard({ profile }: { profile: FounderProfile }) {
  const currentIdx = STAGE_ORDER.indexOf(profile.stage)
  const portraitSrc = `${import.meta.env.BASE_URL}${profile.portrait.src}`
  const reducedMotion = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const shellRef = useRef<HTMLElement>(null)
  const pointerStart = useRef({ x: 0, y: 0 })
  const pointerMoved = useRef(false)

  function resetTilt() {
    if (!shellRef.current || reducedMotion) return
    gsap.to(shellRef.current, { rotateX: 0, rotateY: 0, duration: 0.45, ease: 'power3.out' })
  }

  function toggleFlip() {
    resetTilt()
    setFlipped((value) => !value)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const distance = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y)
    if (distance > 8) pointerMoved.current = true
    if (
      flipped ||
      reducedMotion ||
      event.pointerType !== 'mouse' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      !shellRef.current
    ) return
    const rect = shellRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    gsap.to(shellRef.current, {
      rotateX: y * -4,
      rotateY: x * 4,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1400,
    })
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>) {
    if (pointerMoved.current || (event.target as HTMLElement).closest('a, button')) return
    toggleFlip()
  }

  return (
    <article
      ref={shellRef}
      className='founder-card-shell'
      data-founder-id={profile.id}
      data-accent={profile.accent}
      data-flipped={flipped}
      tabIndex={0}
      aria-label={`${profile.name} founder profile. ${flipped ? 'Showing founder story. Press Enter to return to profile.' : 'Press Enter or tap to view founder story.'}`}
      aria-roledescription='flippable founder card'
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        toggleFlip()
      }}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
        pointerMoved.current = false
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className={cn('founder-card-inner', flipped && 'is-flipped')}>
        <section className='founder-card-face founder-card-front' aria-hidden={flipped}>
          <div className='founder-portrait'>
            <img
              src={portraitSrc}
              alt={profile.portrait.alt}
              loading='lazy'
              decoding='async'
              style={{ objectPosition: profile.portrait.position }}
            />
            <div className='founder-portrait-shade' />
            <div className='founder-card-top'>
              <span className='founder-verified'><BadgeCheck aria-hidden='true' />Verified student</span>
              {profile.traction && <span className='founder-traction'><TrendingUp aria-hidden='true' />{profile.traction}</span>}
            </div>
            <div className='founder-flip-hint'><Sparkles aria-hidden='true' />Tap to flip</div>
            <div className='founder-identity'>
              <p>{profile.university}</p>
              <h3>{profile.name}</h3>
              <span>{profile.role} · <strong>{profile.startup}</strong></span>
            </div>
          </div>

          <div className='founder-card-body'>
            <p className='founder-uni'>{profile.university} · {profile.program}</p>

            <div className='founder-building'>
              <Lightbulb aria-hidden='true' />
              <p>{profile.building}</p>
            </div>

            <div className='founder-stage'>
              <span className='founder-stage-label'>Stage</span>
              <div className='founder-stage-track'>
                {STAGES.map((stage, index) => (
                  <span
                    key={stage.key}
                    className={cn('founder-stage-dot', index <= currentIdx && 'is-active', index === currentIdx && 'is-current')}
                  >
                    <i aria-hidden='true' />
                    {stage.label}
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
          </div>
        </section>

        <section className='founder-card-face founder-card-back' aria-hidden={!flipped}>
          <div className='founder-back-orb founder-back-orb-one' />
          <div className='founder-back-orb founder-back-orb-two' />

          <div className='founder-back-top'>
            <span><BookOpenText aria-hidden='true' />Founder story</span>
            <button type='button' tabIndex={flipped ? 0 : -1} onClick={(event) => { event.stopPropagation(); toggleFlip() }}>
              <RotateCcw aria-hidden='true' />Back to profile
            </button>
          </div>

          <div className='founder-back-identity'>
            <img src={portraitSrc} alt='' aria-hidden='true' />
            <div>
              <p>{profile.startup}</p>
              <h3>{profile.name}</h3>
              <span>{profile.role}</span>
            </div>
          </div>

          <p className='founder-story'>{profile.founderStory}</p>

          <div className='founder-back-details'>
            <div>
              <span><Target aria-hidden='true' />Mission</span>
              <p>{profile.mission}</p>
            </div>
            <div>
              <span><TrendingUp aria-hidden='true' />Progress</span>
              <p>{profile.progress}</p>
            </div>
            <div>
              <span><Zap aria-hidden='true' />Current focus</span>
              <p>{profile.currentFocus}</p>
            </div>
          </div>

          <div className='founder-back-footer'>
            <div>
              <small>Open to</small>
              <strong>{profile.lookingFor}</strong>
            </div>
            <Link
              to={profile.profileHref}
              tabIndex={flipped ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
            >
              Meet through SSC<ArrowUpRight aria-hidden='true' />
            </Link>
          </div>
        </section>
      </div>
    </article>
  )
}
