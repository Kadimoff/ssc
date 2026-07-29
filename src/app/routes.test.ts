import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('execution route registration', () => {
  const source = readFileSync(new URL('../main.tsx', import.meta.url), 'utf8')

  it('registers workspace and discovery without removing legacy goals', () => {
    expect(source).toContain("path: '/workspace'")
    expect(source).toContain("path: '/discover'")
    expect(source).toContain("path: '/goals'")
    expect(source).toContain('<WorkspacePage milestonesOnly />')
  })

  it('preserves the GitHub Pages router base path', () => {
    expect(source).toContain("basepath: '/ssc'")
  })
})
