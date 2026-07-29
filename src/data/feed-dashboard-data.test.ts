import { describe, expect, it } from 'vitest'
import { seedState } from '@/data/demo-client'
import {
  avatarForUser,
  dashboardActivity,
  dashboardEvents,
  dashboardMetrics,
  dashboardPeopleToMeet,
  mediaForPost,
} from '@/data/feed-dashboard-data'

describe('Home dashboard presentation data', () => {
  it('uses unique local portraits and lets unmapped identities use initials', () => {
    const state = seedState()
    const urls = state.users.map((user) => avatarForUser(user)).filter((url): url is string => Boolean(url))

    expect(urls.length).toBeGreaterThanOrEqual(7)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every((url) => /images\/(?:avatars|founders)\/.+\.webp$/.test(url))).toBe(true)
    expect(state.users.some((user) => !avatarForUser(user))).toBe(true)
  })

  it('provides varied, media-backed startup activity', () => {
    const state = seedState()
    const kinds = new Set(state.posts.map((post) => post.kind))
    const postsWithMedia = state.posts.filter((post) => mediaForPost(post).length > 0)

    expect(state.posts.length).toBeGreaterThanOrEqual(5)
    for (const kind of ['milestone', 'launch', 'hiring', 'partnership', 'event'] as const) {
      expect(kinds.has(kind)).toBe(true)
    }
    expect(postsWithMedia.length).toBeGreaterThanOrEqual(3)
    expect(postsWithMedia.flatMap((post) => mediaForPost(post)).every((asset) => asset.alt.length > 20)).toBe(true)
  })

  it('keeps recommendations, events, and pulse labels decision-ready', () => {
    expect(new Set(dashboardPeopleToMeet.map((person) => person.userId)).size).toBe(dashboardPeopleToMeet.length)
    expect(dashboardPeopleToMeet.every((person) => person.reason.length > 30 && person.matchLabel.length > 3)).toBe(true)
    expect(dashboardEvents.length).toBeGreaterThanOrEqual(3)
    expect(dashboardEvents.every((event) => event.attendeeCount > 0 && event.attendeeUserIds.length > 0)).toBe(true)
    expect(dashboardActivity.userIds.length).toBeGreaterThanOrEqual(3)
    expect(dashboardMetrics.every((metric) => !/live/i.test(`${metric.label} ${metric.detail}`))).toBe(true)
  })
})
