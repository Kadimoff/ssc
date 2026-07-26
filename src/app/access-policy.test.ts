import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { User } from '@/data/types'
import { canAccess, defaultRouteFor } from './access-policy'

const user = (roles: User['roles'], activeRole: User['activeRole'], role: User['role'] = 'member'): User => ({
  id: 'usr_test', username: 'test', name: 'Test User', email: 'test@example.com', title: '',
  company: '', industry: '', location: '', skills: '', about: '', availability: '', website: '',
  role, roles, activeRole, verificationStatus: 'verified',
})

describe('workspace access policy', () => {
  it('keeps investor and administrative areas closed to normal members', () => {
    const member = user(['student'], 'student')
    expect(canAccess(member, 'investor')).toBe(false)
    expect(canAccess(member, 'partnerships')).toBe(false)
    expect(canAccess(member, 'admin')).toBe(false)
    expect(canAccess(user(['student'], 'student', 'admin'), 'admin')).toBe(false)
  })

  it('grants each privileged role only its intended workspace', () => {
    expect(canAccess(user(['investor'], 'investor'), 'investor')).toBe(true)
    expect(canAccess(user(['program_manager'], 'program_manager'), 'partnerships')).toBe(true)
    expect(canAccess(user(['moderator'], 'moderator'), 'admin')).toBe(true)
    expect(canAccess(user(['investor'], 'investor'), 'admin')).toBe(false)
  })

  it('selects the correct post-login destination', () => {
    expect(defaultRouteFor(user(['student'], 'student'))).toBe('/feed')
    expect(defaultRouteFor(user(['investor'], 'investor'))).toBe('/investors')
    expect(defaultRouteFor(user(['program_manager'], 'program_manager'))).toBe('/partnerships')
    expect(defaultRouteFor(user(['platform_admin'], 'platform_admin', 'admin'))).toBe('/admin')
  })

  it('registers every completed internal destination', () => {
    const source = readFileSync(new URL('../main.tsx', import.meta.url), 'utf8')
    for (const path of ['/assistant', '/search', '/people/$username', '/jobs/$jobId', '/news/$slug', '/events', '/events/$eventId', '/startups/new', '/settings', '/verification', '/goals', '/help', '/privacy', '/terms', '/access-denied']) {
      expect(source).toContain(`path: '${path}'`)
    }
    expect(source).toContain("<AccessGate area='investor'>")
    expect(source).toContain("<AccessGate area='partnerships'>")
    expect(source).toContain("<AccessGate area='admin'>")
  })
})
