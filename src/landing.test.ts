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
    const heroStats = readFileSync(new URL('./components/landing/hero-stats.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Free for students. Built for the entire university startup ecosystem.')
    expect(source).toContain('From campus ideas to')
    expect(source).toContain('verified startup outcomes.')
    expect(source).toContain('SSC connects founders, universities, mentors, programs and investors in one execution workflow—from team formation and milestones to verified evidence, mentorship, program access and investor introductions.')
    expect(source).toContain('Start building free')
    expect(source).toContain('Run a university pilot')
    expect(heroStats).toContain("value: 'Verify', label: 'participants'")
    expect(heroStats).toContain("value: 'Build', label: 'teams'")
    expect(heroStats).toContain("value: 'Guide with', label: 'mentors'")
    expect(heroStats).toContain("value: 'Connect investors', label: 'Report outcomes'")
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
    expect(ecosystemMetrics.map((metric) => metric.value)).toEqual(['Verify', 'Build', 'Prove', 'Operate', 'Report'])
    expect(source).not.toContain('data-counter')
  })

  it('uses a unique local portrait for every featured member', () => {
    const urls = featuredMembers.map((member) => member.avatarUrl)

    expect(urls.every(Boolean)).toBe(true)
    expect(urls.every((url) => !/^https?:/i.test(url))).toBe(true)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('keeps the responsive mobile menu and reduced-motion styling', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

    expect(source).toContain("title='Explore SSC'")
    expect(source).toContain("aria-label='Mobile landing navigation'")
    expect(source).toContain("className='responsive-landing-navigation sm:max-w-md'")
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
    const memberAvatars = featuredMembers.map((member) => member.avatarUrl)

    expect(source).toContain('aria-hidden={clone || undefined}')
    expect(source).toContain('tabIndex={clone ? -1 : 0}')
    expect(new Set(featuredMembers.map((member) => member.name)).size).toBe(featuredMembers.length)
    expect(memberAvatars.every(Boolean)).toBe(true)
    expect(new Set(memberAvatars).size).toBe(memberAvatars.length)
  })

  it('restores the open People of SSC rail from the reference without external portraits', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Students from different universities and disciplines')
    expect(source).toContain("className='landing-member-card w-[160px] shrink-0 px-2 py-3 text-center sm:w-[190px]'")
    expect(source).toContain("className='landing-carousel landing-members-rail mt-12 flex w-full gap-6")
    expect(source).not.toContain("<DemoDataBadge label='Demo' />")
  })

  it('uses the reference WebGL shader behind transparent landing sections', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
    const shader = readFileSync(new URL('./components/shader-background.tsx', import.meta.url), 'utf8')

    expect(source).toContain("className='landing-page-shell")
    expect(source).not.toContain("className='landing-ambient-background'")
    expect(styles).not.toContain('.landing-ambient-background')
    expect(styles).toMatch(/\.landing-hero\s*\{\s*background:\s*transparent;/)
    expect(styles).toMatch(/\.landing-section-mint\s*\{\s*background:\s*transparent;/)
    expect(shader).toContain("canvas.getContext('webgl')")
    expect(shader).toContain('jelly/rubber mouse interaction')
    expect(shader).not.toContain("matchMedia('(max-width: 767px)')")
  })

  it('lets the university marquee animate across the full viewport', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

    expect(source).toContain("className='landing-university-marquee relative mt-10 w-full overflow-hidden'")
    expect(source).toContain("className='landing-university-track flex w-max gap-4 px-2'")
    expect(styles).toContain('max-width: 100vw')
    expect(styles).toContain('.landing-university-track')
  })
})
