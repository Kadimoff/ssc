import { beforeEach, describe, expect, it } from 'vitest'
import {
  BACKUP_KEY, DATA_KEY, DemoApiClient, SESSION_KEY, V1_BACKUP_KEY, V1_KEY,
  V2_KEY, V2_SESSION_KEY, hydrateDemoState, loadState, seedState,
} from './demo-client'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('DemoApiClient', () => {
  let storage: MemoryStorage
  beforeEach(() => { storage = new MemoryStorage() })

  it('seeds a versioned demo and authenticates the demo user', async () => {
    const client = new DemoApiClient(storage)
    const user = await client.login({ username: 'demo', password: 'demo123' })
    expect(user.role).toBe('admin')
    expect(storage.getItem(SESSION_KEY)).toBe('usr_1')
    expect(JSON.parse(storage.getItem(DATA_KEY)!).version).toBe(3)
  })

  it('persists post mutations across client instances', async () => {
    const first = new DemoApiClient(storage)
    await first.login({ username: 'demo', password: 'demo123' })
    await first.createPost('Typed React demo post')
    const post = (await first.snapshot()).posts[0]
    await first.togglePost(post.id, 'liked')

    const second = new DemoApiClient(storage)
    const snapshot = await second.snapshot()
    expect(snapshot.posts[0].content).toBe('Typed React demo post')
    expect(snapshot.posts[0].liked).toBe(true)
  })

  it('migrates legacy state once and preserves a backup', () => {
    storage.setItem(V1_KEY, JSON.stringify({
      users: [{ id: 9, username: 'legacy', name: 'Legacy User', role: 'member' }],
      posts: [{ id: 8, author_id: 9, content: 'Legacy post', reaction_count: 2 }],
    }))
    const migrated = loadState(storage)
    expect(migrated.version).toBe(3)
    expect(migrated.users[0].username).toBe('legacy')
    expect(migrated.posts[0].authorId).toBe('usr_9')
    expect(storage.getItem(V1_BACKUP_KEY)).not.toBeNull()
    expect(storage.getItem(DATA_KEY)).not.toBeNull()
  })

  it('migrates v2 stringlessly without losing the active session', () => {
    storage.setItem(V2_KEY, JSON.stringify({
      version: 2,
      users: [{ id: 4, username: 'founder', name: 'Founder', title: 'Founder · Demo', role: 'member' }],
      passwords: { 4: 'secret' },
      posts: [{ id: 3, authorId: 4, content: 'v2 post', type: 'Update', createdAt: '2026-01-01', reactions: 0, comments: 0, reposts: 0, liked: false, saved: false }],
      communities: [], jobs: [], conversations: [], messages: [], connections: [], nextIds: { user: 5, post: 4 },
    }))
    storage.setItem(V2_SESSION_KEY, '4')
    const migrated = loadState(storage)
    expect(migrated.users[0].id).toBe('usr_4')
    expect(migrated.posts[0].id).toBe('pst_3')
    expect(migrated.users[0].roles).toContain('founder')
    expect(storage.getItem(SESSION_KEY)).toBe('usr_4')
    expect(storage.getItem(BACKUP_KEY)).not.toBeNull()
  })

  it('records auditable partnership actions', async () => {
    const client = new DemoApiClient(storage)
    await client.login({ username: 'demo', password: 'demo123' })
    const organizationId = await client.createOrganization({
      type: 'company', legalName: 'Illustrative Partner', displayName: 'Illustrative Partner',
      slug: 'illustrative-partner', summary: 'Demo only', countryCode: 'AZ', websiteUrl: '',
      verificationStatus: 'pending', partnershipStatus: 'prospect', contributionAreas: ['Mentors'], contacts: [],
    })
    await client.verifyOrganization(organizationId, 'verified')
    const snapshot = await client.snapshot()
    expect(snapshot.organizations.find((item) => item.id === organizationId)?.verificationStatus).toBe('verified')
    expect(snapshot.auditLogs.some((item) => item.targetId === organizationId && item.action === 'organization.verification_changed')).toBe(true)
  })

  it('seeds a complete illustrative ecosystem with valid cross-record references', () => {
    const state = seedState()
    expect(state.users.length).toBeGreaterThanOrEqual(16)
    expect(state.startups.length).toBeGreaterThanOrEqual(8)
    expect(state.jobs.length).toBeGreaterThanOrEqual(8)
    expect(state.communities.length).toBeGreaterThanOrEqual(6)
    expect(state.conversations.length).toBeGreaterThanOrEqual(5)
    expect(state.programs.length).toBeGreaterThanOrEqual(3)
    expect(state.evidenceArtifacts.length).toBeGreaterThanOrEqual(6)
    expect(state.outcomes.length).toBeGreaterThanOrEqual(4)
    expect(state.messages.every((message) => state.conversations.some((conversation) => conversation.id === message.conversationId))).toBe(true)
    expect(state.outcomes.every((outcome) => state.programs.some((program) => program.id === outcome.programId))).toBe(true)
  })

  it('additively hydrates existing demo state without replacing user mutations', () => {
    const legacyDemo = seedState()
    legacyDemo.users = legacyDemo.users.slice(0, 8)
    legacyDemo.startups = legacyDemo.startups.slice(0, 3)
    legacyDemo.posts[0].content = 'Preserve my local mutation'
    const hydrated = hydrateDemoState(legacyDemo)
    expect(hydrated.users.length).toBeGreaterThanOrEqual(16)
    expect(hydrated.startups.length).toBeGreaterThanOrEqual(8)
    expect(hydrated.posts[0].content).toBe('Preserve my local mutation')
    expect(hydrated.passwords.usr_16).toBe('demo123')
  })
})
