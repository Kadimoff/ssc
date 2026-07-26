import type {
  AgreementStatus, ApiClient, AssistantFeedback, AssistantServiceResponse, Credentials, EntityId, Job, Organization, OutcomeRecord,
  PartnerContribution, PartnershipAgreement, Program, ProgramPartner, Registration, Snapshot, StartupCreateInput,
  User, VerificationStatus,
} from './types'

export class HttpApiClient implements ApiClient {
  constructor(private baseUrl = localStorage.getItem('studentStartupCommunityApiBase') || 'http://127.0.0.1:3443') {}
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('studentStartupCommunityToken')
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } })
    const data = response.status === 204 ? undefined : await response.json()
    if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)
    return data as T
  }
  snapshot() { return this.request<Snapshot>('/snapshot') }
  async login(input: Credentials) { const data = await this.request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); localStorage.setItem('studentStartupCommunityToken', data.token); return data.user }
  async register(input: Registration) { const data = await this.request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }); localStorage.setItem('studentStartupCommunityToken', data.token); return data.user }
  async logout() { localStorage.removeItem('studentStartupCommunityToken') }
  createPost(content: string, opts?: { kind?: import('./types').PostKind; tags?: string[]; link?: import('./types').PostLink }) { return this.request<void>('/posts', { method: 'POST', body: JSON.stringify({ content, kind: opts?.kind ?? 'update', tags: opts?.tags ?? [], link: opts?.link }) }) }
  togglePost(id: EntityId, action: 'liked' | 'saved') { return this.request<void>(`/posts/${id}/${action === 'liked' ? 'like' : 'save'}`, { method: 'POST' }) }
  repost(id: EntityId) { return this.request<void>(`/posts/${id}/repost`, { method: 'POST' }) }
  comment(id: EntityId) { return this.request<void>(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ text: 'Comment' }) }) }
  addComment(postId: EntityId, text: string) { return this.request<void>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }) }
  deletePost(id: EntityId) { return this.request<void>(`/admin/posts/${id}`, { method: 'DELETE' }) }
  async updateProfile(input: Partial<User>) { const data = await this.request<{ user: User }>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }); return data.user }
  connect(userId: EntityId) { return this.request<void>('/connections', { method: 'POST', body: JSON.stringify({ user_id: userId }) }) }
  toggleCommunity(id: EntityId) { return this.request<void>(`/communities/${id}/join`, { method: 'POST', body: JSON.stringify({ join: true }) }) }
  deleteCommunity(id: EntityId) { return this.request<void>(`/admin/communities/${id}`, { method: 'DELETE' }) }
  sendMessage(id: EntityId, text: string) { return this.request<void>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }) }
  async ensureConversation(userId: EntityId) { const data = await this.request<{ id: EntityId }>('/conversations', { method: 'POST', body: JSON.stringify({ user_id: userId }) }); return data.id }
  toggleJob(id: EntityId, action: 'applied' | 'saved') { return this.request<void>(`/jobs/${id}/${action === 'applied' ? 'apply' : 'save'}`, { method: 'POST' }) }
  createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>) { return this.request<void>('/admin/jobs', { method: 'POST', body: JSON.stringify(input) }) }
  async createOrganization(input: Omit<Organization, 'id' | 'createdAt'>) { const data = await this.request<{ id: EntityId }>('/organizations', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  updateOrganization(id: EntityId, input: Partial<Organization>) { return this.request<void>(`/organizations/${id}`, { method: 'PATCH', body: JSON.stringify(input) }) }
  verifyOrganization(id: EntityId, status: VerificationStatus) { return this.request<void>(`/organizations/${id}/verification`, { method: 'POST', body: JSON.stringify({ status }) }) }
  async createAgreement(input: Omit<PartnershipAgreement, 'id' | 'createdAt' | 'createdBy'>, partyOrganizationIds: EntityId[]) { const data = await this.request<{ id: EntityId }>('/agreements', { method: 'POST', body: JSON.stringify({ ...input, partyOrganizationIds }) }); return data.id }
  transitionAgreement(id: EntityId, status: AgreementStatus) { return this.request<void>(`/agreements/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }) }
  async createProgram(input: Omit<Program, 'id' | 'createdAt'>) { const data = await this.request<{ id: EntityId }>('/programs', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  async addProgramPartner(input: Omit<ProgramPartner, 'id'>) { const data = await this.request<{ id: EntityId }>('/program-partners', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  async recordContribution(input: Omit<PartnerContribution, 'id' | 'createdAt' | 'verificationStatus'>) { const data = await this.request<{ id: EntityId }>('/contributions', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  verifyContribution(id: EntityId, status: VerificationStatus) { return this.request<void>(`/contributions/${id}/verification`, { method: 'POST', body: JSON.stringify({ status }) }) }
  async recordOutcome(input: Omit<OutcomeRecord, 'id' | 'createdAt' | 'verificationStatus'>) { const data = await this.request<{ id: EntityId }>('/outcomes', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  async createStartup(input: StartupCreateInput) { const data = await this.request<{ id: EntityId }>('/startups', { method: 'POST', body: JSON.stringify(input) }); return data.id }
  assistantQuery(prompt: string, limit = 10) { return this.request<AssistantServiceResponse>('/assistant/query', { method: 'POST', body: JSON.stringify({ prompt, limit }) }) }
  assistantFeedback(input: AssistantFeedback) { return this.request<void>('/assistant/feedback', { method: 'POST', body: JSON.stringify(input) }) }
  investorDiscovery(prompt: string, limit = 10) { return this.request<AssistantServiceResponse>('/investor/discovery', { method: 'POST', body: JSON.stringify({ prompt, limit }) }) }
}
