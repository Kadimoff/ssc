import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('contact page', () => {
  it('publishes the approved SSC contact destinations', () => {
    const source = readFileSync(new URL('./index.tsx', import.meta.url), 'utf8')
    expect(source).toContain("href: 'mailto:startupandtto@asoiu.edu.az'")
    expect(source).toContain("href: 'tel:+994706069876'")
    expect(source).toContain("<Link to='/'>View SSC Demo")
    expect(source).not.toContain('orbit')
  })

  it('registers the public contact slug', () => {
    const source = readFileSync(new URL('../../main.tsx', import.meta.url), 'utf8')
    expect(source).toContain("path: '/contact'")
    expect(source).toContain('contactRoute')
  })
})
