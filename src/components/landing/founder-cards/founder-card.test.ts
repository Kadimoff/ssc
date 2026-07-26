import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { founderCards } from './founder-card.data'

describe('premium founder profile cards', () => {
  it('provides complete written back-face content and project-local portraits', () => {
    expect(founderCards).toHaveLength(3)
    founderCards.forEach((profile) => {
      expect(profile.founderStory.length).toBeGreaterThan(60)
      expect(profile.mission.length).toBeGreaterThan(60)
      expect(profile.currentFocus.length).toBeGreaterThan(60)
      expect(profile.progress.length).toBeGreaterThan(60)
      expect(profile.portrait.alt).toContain('Illustrative')
      expect(existsSync(new URL(`../../../../public/${profile.portrait.src}`, import.meta.url))).toBe(true)
    })
  })

  it('supports pointer and keyboard flipping without hiding the reverse action from keyboard users', () => {
    const source = readFileSync(new URL('./founder-card.tsx', import.meta.url), 'utf8')
    expect(source).toContain("event.key !== 'Enter'")
    expect(source).toContain("event.key !== ' '")
    expect(source).toContain("aria-roledescription='flippable founder card'")
    expect(source).toContain("tabIndex={flipped ? 0 : -1}")
    expect(source).toContain("event.target as HTMLElement).closest('a, button')")
  })

  it('keeps equal-height 3D faces and reduced-motion safeguards', () => {
    const styles = readFileSync(new URL('./founder-cards.css', import.meta.url), 'utf8')
    expect(styles).toContain('border-radius: 34px')
    expect(styles).toContain('backface-visibility: hidden')
    expect(styles).toContain('.founder-card-inner.is-flipped { transform: rotateY(180deg); }')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('@media (hover: none), (pointer: coarse)')
  })
})
