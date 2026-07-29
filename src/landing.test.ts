import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ecosystemMetrics, featuredMembers } from './data/landing-content'

describe('restored SSC landing page', () => {
  it('renders the original landing rhythm with the business model before conversion', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const sections = [
      'hero',
      'ecosystem',
      'members',
      'updates',
      'universities',
      'business-model',
      'pilot',
      'final-cta',
      'demo-disclaimer',
      'footer',
    ]
    const positions = sections.map((section) => source.indexOf(`data-landing-section='${section}'`))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
  })

  it('restores the original hero while keeping the buyer and pilot path', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain('The network for')
    expect(source).toContain('student builders')
    expect(source).toContain('Professional momentum, without the noise')
    expect(source).toContain('A model that keeps SSC free for students.')
    expect(source).toContain('Institutions, program operators, consortiums and partner organizations')
    expect(source).toContain('Start with one program, not a platform-wide rollout.')
    expect(source).toContain('8–12 week')
    expect(source).toContain('saves locally and does not transmit data')
  })

  it('labels demo proof visibly and avoids unsupported public traction metrics', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain("label='Illustrative ecosystem'")
    expect(source).toContain("data-landing-section='demo-disclaimer'")
    expect(source).not.toMatch(/1,200\+|18 universities|45\+|trusted by/i)
    expect(ecosystemMetrics.every((metric) => !/^\d/.test(metric.value))).toBe(true)
  })

  it('uses only local portraits and an explicit initials fallback', () => {
    const urls = featuredMembers.map((member) => member.avatarUrl).filter(Boolean)

    expect(urls.every((url) => !/^https?:/i.test(url))).toBe(true)
    expect(new Set(urls).size).toBe(urls.length)
    expect(featuredMembers.some((member) => !member.avatarUrl)).toBe(true)
  })

  it('keeps the responsive mobile menu and reduced-motion styling', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

    expect(source).toContain("title='Explore SSC'")
    expect(source).toContain("aria-label='Mobile landing navigation'")
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('.responsive-dialog')
  })

  it('restores the premium landing system and keeps the requested business CTA', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain('<HeroStats />')
    expect(source).toContain('useHeroEntrance')
    expect(source).toContain('useScrollReveal')
    expect(source).toContain('useTiltCards')
    expect(source).toContain('useMarquee')
    expect(source).toContain('<MembersRail />')
    expect(source).toContain('<BusinessModelSection />')
    expect(source).toContain('<PilotSection />')
    expect(source).toContain('landing-final-cta')
    expect(source).toContain('Build free. Operate together. Prove progress.')
    expect(source).toContain('<HeartHandshake')
    expect(source).not.toContain('<FounderCardsSection')
  })

  it('keeps member-loop clones hidden from assistive technology and keyboard focus', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain('aria-hidden={clone || undefined}')
    expect(source).toContain('tabIndex={clone ? -1 : 0}')
    expect(new Set(featuredMembers.map((member) => member.name)).size).toBe(featuredMembers.length)
  })
})
