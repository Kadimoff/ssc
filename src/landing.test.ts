import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ecosystemMetrics, ecosystemPillars, eventItems, featuredMembers, newsItems,
  universityWordmarks,
} from './data/landing-content'

describe('landing page content', () => {
  it('keeps the planned scroll sections in order', () => {
    const source = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8')
    const sections = ['hero', 'ecosystem', 'founder-cards', 'members', 'updates', 'universities', 'cta', 'footer']
    const positions = sections.map((section) => source.indexOf(`data-landing-section='${section}'`))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('includes the three interactive founder access cards', () => {
    const sectionSource = readFileSync(new URL('./components/landing/founder-cards/founder-cards-section.tsx', import.meta.url), 'utf8')
    const dataSource = readFileSync(new URL('./components/landing/founder-cards/founder-card.data.ts', import.meta.url), 'utf8')
    expect(sectionSource).toContain("id='founder-cards'")
    expect(sectionSource).not.toMatch(/from ['"]\//)
    expect(sectionSource).not.toContain('preview (2).html')
    expect(dataSource).toContain("stage: 'mvp'")
    expect(dataSource).toContain("stage: 'validation'")
    expect(dataSource).toContain("stage: 'revenue'")
    expect(dataSource).toContain('No tiers, no trust scores.')
  })

  it('provides complete ecosystem and editorial mock content', () => {
    expect(ecosystemMetrics).toHaveLength(5)
    expect(ecosystemPillars).toHaveLength(6)
    expect(featuredMembers).toHaveLength(8)
    expect(newsItems).toHaveLength(3)
    expect(eventItems).toHaveLength(3)
    expect(universityWordmarks.length).toBeGreaterThanOrEqual(6)
  })

  it('keeps member names and ecosystem pillars unique', () => {
    expect(new Set(featuredMembers.map((member) => member.name)).size).toBe(featuredMembers.length)
    expect(new Set(ecosystemPillars.map((pillar) => pillar.title)).size).toBe(ecosystemPillars.length)
  })

  it('includes draggable member discovery and individual member profiles', () => {
    const source = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8')
    expect(source).not.toContain("window.setInterval")
    expect(source).not.toContain("View all members")
    expect(source).toContain("[...featuredMembers, ...featuredMembers]")
    expect(source).toContain("onPointerMove={handlePointerMove}")
    expect(source).toContain("className='landing-carousel mt-12 flex w-full")
    expect(source).toContain("event.currentTarget.scrollLeft = drag.current.startScroll - distance")
    expect(source).toContain("className='w-[190px] shrink-0")
    expect(source).toContain("View profile")
    expect(source).toContain("Member profile")
  })

  it('rotates two latest news cards every five seconds', () => {
    const source = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8')
    expect(source).toContain("const visibleNews = [newsItems[newsStart], newsItems[(newsStart + 1) % newsItems.length]]")
    expect(source).toContain("window.setTimeout")
    expect(source).toContain("4_600")
    expect(source).toContain("setNewsFading(true)")
  })

  it('includes the accessible animated hero treatment', () => {
    const appSource = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8')
    const styleSource = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
    expect(appSource).toContain("className='animated-gradient-text block'>student builders")
    expect(styleSource).toContain('@keyframes gradient-text-flow')
    expect(styleSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styleSource).toContain('animation-duration: .01ms !important')
    expect(styleSource).not.toContain('[data-animate] { opacity: 0; }')
  })

  it('keeps one continuous background across landing sections', () => {
    const source = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8')
    expect(source).not.toContain("scroll-mt-20 border-y bg-muted/55")
    expect(source).not.toContain("data-landing-section='footer' className='relative z-10 border-t")
    expect(source).not.toContain("ref={bgRef}")
    expect(source).not.toContain("data-hero-blob")
    expect(source).toContain("<header className='glass-header fixed inset-x-0 top-0 z-50'>")
    expect(source).toContain("<Metric value='45+' label='Active mentors' />")
    expect(source).toContain("bg-linear-to-br from-primary via-[oklch(.53_.17_165)]")
    expect(source).not.toMatch(/Yeni Hub|New Hub|Startou(?!pla)/i)
  })
})
