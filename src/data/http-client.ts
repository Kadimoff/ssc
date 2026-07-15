import type { ApiClient, Credentials, Job, Registration, Snapshot, User } from './types'

export class HttpApiClient implements ApiClient {
  constructor(private baseUrl = localStorage.getItem('studentStartupCommunityApiBase') || 'http://127.0.0.1:3443') {}
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('studentStartupCommunityToken')
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`)
    return data as T
  }
  snapshot() { return this.request<Snapshot>('/snapshot') }
  async login(input: Credentials) { const data = await this.request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); localStorage.setItem('studentStartupCommunityToken', data.token); return data.user }
  async register(input: Registration) { const data = await this.request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }); localStorage.setItem('studentStartupCommunityToken', data.token); return data.user }
  async logout() { localStorage.removeItem('studentStartupCommunityToken') }
  createPost(content: string, opts?: { kind?: import('./types').PostKind; tags?: string[]; link?: import('./types').PostLink }) { return this.request<void>('/posts', { method: 'POST', body: JSON.stringify({ content, kind: opts?.kind ?? 'update', tags: opts?.tags ?? [], link: opts?.link }) }) }
  togglePost(id: number, action: 'liked' | 'saved') { return this.request<void>(`/posts/${id}/${action === 'liked' ? 'like' : 'save'}`, { method: 'POST' }) }
  repost(id: number) { return this.request<void>(`/posts/${id}/repost`, { method: 'POST' }) }
  comment(id: number) { return this.request<void>(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ text: 'Comment' }) }) }
  addComment(postId: number, text: string) { return this.request<void>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }) }
  deletePost(id: number) { return this.request<void>(`/admin/posts/${id}`, { method: 'DELETE' }) }
  async updateProfile(input: Partial<User>) { const data = await this.request<{ user: User }>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }); return data.user }
  connect(userId: number) { return this.request<void>('/connections', { method: 'POST', body: JSON.stringify({ user_id: userId }) }) }
  toggleCommunity(id: number) { return this.request<void>(`/communities/${id}/join`, { method: 'POST', body: JSON.stringify({ join: true }) }) }
  deleteCommunity(id: number) { return this.request<void>(`/admin/communities/${id}`, { method: 'DELETE' }) }
  sendMessage(id: number, text: string) { return this.request<void>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }) }
  async ensureConversation(userId: number) { const data = await this.request<{ id: number }>('/conversations', { method: 'POST', body: JSON.stringify({ user_id: userId }) }); return data.id }
  toggleJob(id: number, action: 'applied' | 'saved') { return this.request<void>(`/jobs/${id}/${action === 'applied' ? 'apply' : 'save'}`, { method: 'POST' }) }
  createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>) { return this.request<void>('/admin/jobs', { method: 'POST', body: JSON.stringify(input) }) }
}
