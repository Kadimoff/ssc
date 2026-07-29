import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { founderCards } from './founder-card.data'

describe('compact founder profile cards', () => {
  it('keeps the three existing founder profiles and adds complete presentation data', () => {
    expect(founderCards).toHaveLength(3)
    expect(founderCards.map((profile) => profile.name)).toEqual([
      'Aysel Məmmədova',
      'Rəşad Quliyev',
      'Leyla Əliyeva',
    ])

    founderCards.forEach((profile) => {
      expect(profile.metrics).toHaveLength(3)
      expect(profile.skills.length).toBeLessThanOrEqual(3)
      expect(profile.tractionBadge.length).toBeGreaterThan(3)
      expect(profile.lookingFor.eyebrow).toContain('Looking for')
      expect(profile.lookingFor.title.length).toBeGreaterThan(5)
      expect(profile.portrait.alt).toContain('Illustrative')
      expect(existsSync(new URL(`../../../../public/${profile.portrait.src}`, import.meta.url))).toBe(true)
    })
  })

  it('uses reusable typed sections without flip-card behavior', () => {
    const source = readFileSync(new URL('./founder-card.tsx', import.meta.url), 'utf8')
    expect(source).toContain('<FounderCardHeader profile={profile} />')
    expect(source).toContain('<FounderMetric key={metric.label} metric={metric} />')
    expect(source).toContain('<StartupStage stage={profile.stage} />')
    expect(source).toContain('<FounderTags tags={profile.skills} />')
    expect(source).toContain('<FounderNeedCTA')
    expect(source).not.toMatch(/flip|rotateY|Tap to flip/i)
  })

  it('keeps equal-height cards and the required responsive grid', () => {
    const styles = readFileSync(new URL('./founder-cards.css', import.meta.url), 'utf8')
    expect(styles).toContain('border-radius: 24px')
    expect(styles).toContain('min-height: 640px')
    expect(styles).toContain('transform: translateY(-4px)')
    expect(styles).toContain('@media (min-width: 768px)')
    expect(styles).toContain('@media (min-width: 1280px)')
    expect(styles).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
    expect(styles).toContain('.dark .founder-card')
    expect(styles).toContain('.dark .founder-need-cta')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('provides accessible profile links and meaningful image alternatives', () => {
    const headerSource = readFileSync(new URL('./founder-card-header.tsx', import.meta.url), 'utf8')
    const ctaSource = readFileSync(new URL('./founder-need-cta.tsx', import.meta.url), 'utf8')
    expect(headerSource).toContain('alt={profile.portrait.alt}')
    expect(headerSource).toContain("aria-label='Verified founder'")
    expect(ctaSource).toContain('aria-label={`Connect with ${founderName} about ${need.title}`}')
    expect(ctaSource).toContain("className='founder-need-cta'")
  })
})
