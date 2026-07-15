import { beforeEach, describe, expect, it } from 'vitest'
import { BACKUP_KEY, DATA_KEY, DemoApiClient, SESSION_KEY, V1_KEY, loadState } from './demo-client'

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
    expect(storage.getItem(SESSION_KEY)).toBe('1')
    expect(JSON.parse(storage.getItem(DATA_KEY)!).version).toBe(2)
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
    expect(migrated.version).toBe(2)
    expect(migrated.users[0].username).toBe('legacy')
    expect(migrated.posts[0].authorId).toBe(9)
    expect(storage.getItem(BACKUP_KEY)).not.toBeNull()
    expect(storage.getItem(DATA_KEY)).not.toBeNull()
  })
})
