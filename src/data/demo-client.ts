import type { ApiClient, Community, DemoState, Job, Post, Registration, Snapshot, User } from './types'

export const DATA_KEY = 'studentStartupCommunityDemoData.v2'
export const V1_KEY = 'studentStartupCommunityDemoData.v1'
export const BACKUP_KEY = 'studentStartupCommunityDemoData.v1.backup'
export const SESSION_KEY = 'studentStartupCommunitySession.v2'

const now = new Date().toISOString()

export function seedState(): DemoState {
  const ago = (minutes: number) => new Date(Date.parse(now) - minutes * 60000).toISOString()
  return {
    version: 2,
    users: [
      { id: 1, username: 'demo', name: 'Aylin Mammadova', email: 'demo@studentstartupcommunity.local', title: 'Product Strategist', company: 'Orbit Labs', industry: 'Technology', location: 'Baku, Azerbaijan', skills: 'Product Strategy, Community Growth, Research', about: 'I help ambitious teams turn community insight into focused products and durable growth.', availability: 'Open to collaborate', website: 'https://example.com', role: 'admin' },
      { id: 2, username: 'nihat', name: 'Nihat Abbasov', email: 'nihat@studentstartupcommunity.local', title: 'Founder · GreenStack', company: 'GreenStack', industry: 'Climate', location: 'Baku, Azerbaijan', skills: 'Python, APIs, Climate Data', about: 'Building useful climate data products.', availability: 'Mentoring', website: '', role: 'member' },
      { id: 3, username: 'leyla', name: 'Leyla Karim', email: 'leyla@studentstartupcommunity.local', title: 'Product Designer', company: 'North Studio', industry: 'Design', location: 'Remote', skills: 'Design Systems, UX Research, Prototyping', about: 'Designing calm and trustworthy product experiences.', availability: 'Open to projects', website: '', role: 'member' },
      { id: 4, username: 'kamran', name: 'Kamran Vali', email: 'kamran@studentstartupcommunity.local', title: 'AI Engineer', company: 'ModelWorks', industry: 'AI', location: 'Remote', skills: 'Python, LLM Apps, MLOps', about: 'Applied AI engineer shipping production systems.', availability: 'Open to collaborate', website: '', role: 'member' },
      { id: 5, username: 'tarlan', name: 'Tarlan Yusifzade', email: 'tarlan@studentstartupcommunity.local', title: 'Mentor · ex-VC', company: 'Independent', industry: 'Venture', location: 'Baku, Azerbaijan', skills: 'Fundraising, Go-to-market, Strategy', about: 'Operator-turned-investor. I mentor founders on validation and raise readiness.', availability: 'Office hours weekly', website: '', role: 'member' },
      { id: 6, username: 'nargiz', name: 'Nargiz Rahim', email: 'nargiz@studentstartupcommunity.local', title: 'Founder · MediMatch', company: 'MediMatch', industry: 'Health', location: 'Baku, Azerbaijan', skills: 'Operations, Health, Strategy', about: 'Connecting students with affordable verified medical professionals.', availability: 'Open to collaborate', website: '', role: 'member' },
      { id: 7, username: 'elvin', name: 'Elvin Safar', email: 'elvin@studentstartupcommunity.local', title: 'Founder · EduFlow', company: 'EduFlow', industry: 'EdTech', location: 'Remote', skills: 'ML, Product, Pedagogy', about: 'Turning lecture recordings into adaptive practice questions.', availability: 'Looking for a designer', website: '', role: 'member' },
      { id: 8, username: 'investor', name: 'Leyla Aslan', email: 'investor@studentstartupcommunity.local', title: 'Investor · Frontier Ventures', company: 'Frontier Ventures', industry: 'Venture', location: 'Baku, Azerbaijan', skills: 'Seed investing, Marketplaces, Climate, B2B SaaS', about: 'Backing mission-driven student founders at pre-seed and seed.', availability: 'Reviewing ventures', website: 'https://frontier.vc', role: 'member' },
    ],
    passwords: { 1: 'demo123', 2: 'demo123', 3: 'demo123', 4: 'demo123', 5: 'demo123', 6: 'demo123', 7: 'demo123', 8: 'demo123' },
    posts: [
      { id: 1, authorId: 2, content: 'GreenStack crossed 1,000 active users on our campus energy tracker this week. Two faculties piloting, 18% energy reduction on average. On to the next milestone.', type: 'Milestone', kind: 'milestone', tags: ['climate', 'growth', 'mvp'], link: { title: 'GreenStack — Q2 campus impact report', subtitle: '1,000+ active users · 18% avg energy reduction · 2 faculties', url: 'greenstack.io/impact' }, commentsList: [{ id: 1, authorId: 5, text: 'Strong traction. Let’s talk raise-readiness — book office hours.', createdAt: ago(40) }], createdAt: ago(60), reactions: 312, comments: 18, reposts: 24, liked: true, saved: false },
      { id: 2, authorId: 6, content: 'MediMatch closed a $120k pre-seed from regional angels to expand provider onboarding. Hiring two ops leads — referrals welcome.', type: 'Raise', kind: 'raise', tags: ['healthtech', 'fundraising'], link: { title: 'MediMatch raises $120k pre-seed', subtitle: 'Regional angels · provider expansion · hiring', url: 'medimatch.app/news' }, commentsList: [{ id: 2, authorId: 1, text: 'Congratulations Nargiz! Posted the roles to the jobs board.', createdAt: ago(180) }, { id: 3, authorId: 2, text: 'Happy to intro climate-clinic partners.', createdAt: ago(150) }], createdAt: ago(200), reactions: 540, comments: 33, reposts: 41, liked: false, saved: true },
      { id: 3, authorId: 4, content: 'ModelWorks is hiring an ML engineer to own evaluations and inference cost. Python, LLM apps, MLOps. Equity + stipend, remote-friendly. Drop a comment or apply via the jobs board.', type: 'Hiring', kind: 'hiring', tags: ['hiring', 'ai', 'ml'], link: { title: 'ML Engineer · ModelWorks', subtitle: 'Remote · Python · LLM evals · equity', url: 'modelworks.io/careers' }, commentsList: [], createdAt: ago(320), reactions: 198, comments: 27, reposts: 12, liked: false, saved: false },
      { id: 4, authorId: 7, content: 'EduFlow beta is live — adaptive practice questions generated from your lecture recordings. 340 students signed up in week one. Looking for a product designer to partner with.', type: 'Launch', kind: 'launch', tags: ['edtech', 'launch', 'design'], link: { title: 'EduFlow beta', subtitle: 'Lecture recordings → adaptive practice · 340 sign-ups', url: 'eduflow.app' }, commentsList: [{ id: 4, authorId: 3, text: 'Sent you a DM — would love to scope the design role.', createdAt: ago(500) }], createdAt: ago(540), reactions: 421, comments: 29, reposts: 36, liked: true, saved: false },
      { id: 5, authorId: 3, content: 'Onboarding redesign field note: trust went up when we removed screens, not when we added reassurances. Fewer decisions, clearer next action.', type: 'Update', kind: 'update', tags: ['design', 'ux', 'trust'], commentsList: [], createdAt: ago(720), reactions: 517, comments: 48, reposts: 22, liked: false, saved: false },
      { id: 6, authorId: 5, content: 'Quick pulse for founders: what is the single biggest thing blocking your MVP right now — technical, market, or team? I’ll pick three to workshop in this week’s office hours.', type: 'Question', kind: 'question', tags: ['mentorship', 'mvp', 'feedback'], commentsList: [{ id: 5, authorId: 7, text: 'Team — finding a designer who gets edtech.', createdAt: ago(800) }], createdAt: ago(840), reactions: 156, comments: 52, reposts: 9, liked: false, saved: true },
      { id: 7, authorId: 2, content: 'Opening a backend guild for engineers interested in climate data tooling. Two project lead spots open, mentors welcome. Six-week collaboration, remote.', type: 'Update', kind: 'update', tags: ['climate', 'community', 'guild'], link: { title: 'Climate Data Platform Sprint', subtitle: 'Remote · Python · APIs · 6-week guild', url: 'greenstack.io/guild' }, commentsList: [], createdAt: ago(1200), reactions: 284, comments: 42, reposts: 18, liked: false, saved: false },
      { id: 8, authorId: 6, content: 'First revenue milestone: MediMatch hit $2.1k MRR across 18 providers. Validating that students will pay for faster verified access. Iterating on provider onboarding next.', type: 'Milestone', kind: 'milestone', tags: ['healthtech', 'revenue', 'traction'], commentsList: [], createdAt: ago(1600), reactions: 372, comments: 24, reposts: 19, liked: false, saved: false },
      { id: 9, authorId: 4, content: 'Honest lesson from shipping LLM features: your eval set matters more than your model choice. We cut hallucinations 60% by tightening evals before touching the prompt.', type: 'Update', kind: 'update', tags: ['ai', 'evals', 'lessons'], commentsList: [], createdAt: ago(2200), reactions: 489, comments: 61, reposts: 28, liked: true, saved: false },
      { id: 10, authorId: 1, content: 'Welcome to SSC — this feed is for execution updates, not noise. Share milestones, raises, launches, and what you need next. Verified students only; let’s build denser, faster.', type: 'Update', kind: 'update', tags: ['community', 'welcome'], commentsList: [], createdAt: ago(3000), reactions: 205, comments: 14, reposts: 7, liked: false, saved: false },
    ],
    communities: [
      { id: 1, name: 'Applied AI Builders', category: 'AI', description: 'Practical AI products, evaluations and production lessons.', members: 22100, activity: '34 new discussions', joined: true },
      { id: 2, name: 'Founders & Early Teams', category: 'Startups', description: 'A focused space for founders and early operators.', members: 18400, activity: '12 events this month', joined: false },
      { id: 3, name: 'Product Design Leaders', category: 'Design', description: 'Design systems, research and product leadership.', members: 9700, activity: '8 featured critiques', joined: false },
    ],
    jobs: [
      { id: 1, role: 'Senior Product Engineer', company: 'GreenStack', location: 'Remote', type: 'Full-time', skills: 'Python, APIs, PostgreSQL', description: 'Build climate data products used by operational teams.', featured: true, applied: false, saved: false },
      { id: 2, role: 'Product Designer', company: 'Orbit Labs', location: 'Baku', type: 'Contract', skills: 'UX, Research, Design Systems', description: 'Shape a new professional community experience.', featured: false, applied: false, saved: true },
      { id: 3, role: 'ML Engineer', company: 'ModelWorks', location: 'Remote', type: 'Full-time', skills: 'Python, LLM Apps, MLOps', description: 'Own evaluations and inference cost for production LLM apps.', featured: true, applied: false, saved: false },
    ],
    conversations: [{ id: 1, participantIds: [1, 3] }],
    messages: [{ id: 1, conversationId: 1, senderId: 3, text: 'Hi Aylin, would you like to review our onboarding study?', createdAt: now }],
    connections: [[1, 2], [1, 3]],
    nextIds: { user: 9, post: 11, job: 4, conversation: 2, message: 6 },
  }
}

type LegacyState = Record<string, unknown> & { users?: Array<Record<string, unknown>>; posts?: Array<Record<string, unknown>>; communities?: Array<Record<string, unknown>>; jobs?: Array<Record<string, unknown>> }

export function migrateLegacy(raw: string): DemoState {
  const legacy = JSON.parse(raw) as LegacyState
  const fallback = seedState()
  const users = (legacy.users ?? []).map((item) => ({
    id: Number(item.id), username: String(item.username ?? ''), name: String(item.name ?? item.username ?? 'Member'), email: String(item.email ?? ''), title: String(item.title ?? ''), company: String(item.company ?? ''), industry: String(item.industry ?? ''), location: String(item.location ?? ''), skills: String(item.skills ?? ''), about: String(item.about ?? ''), availability: String(item.availability ?? 'Open to collaborate'), website: String(item.website ?? ''), role: item.role === 'admin' ? 'admin' as const : 'member' as const,
  }))
  const posts: Post[] = (legacy.posts ?? []).map((item) => ({
    id: Number(item.id), authorId: Number(item.author_id), content: String(item.content ?? ''), type: String(item.post_type ?? 'Post'), previewTitle: String(item.preview_title ?? ''), previewSubtitle: String(item.preview_subtitle ?? ''), createdAt: String(item.created_at ?? now), reactions: Number(item.reaction_count ?? 0), comments: Number(item.comment_count ?? 0), reposts: Number(item.repost_count ?? 0), liked: Boolean(item.liked), saved: Boolean(item.saved),
  }))
  const communities: Community[] = (legacy.communities ?? []).map((item) => ({ id: Number(item.id), name: String(item.name ?? ''), category: String(item.category ?? ''), description: String(item.description ?? ''), members: Number(item.member_count ?? 0), activity: String(item.activity_preview ?? ''), joined: Boolean(item.joined) }))
  const jobs: Job[] = (legacy.jobs ?? []).filter((item) => !item.hidden).map((item) => ({ id: Number(item.id), role: String(item.role ?? ''), company: String(item.company ?? ''), location: String(item.location ?? ''), type: String(item.job_type ?? ''), skills: String(item.skills ?? ''), description: String(item.description ?? ''), featured: Boolean(item.featured), applied: Boolean(item.applied), saved: Boolean(item.saved) }))
  return { ...fallback, users: users.length ? users : fallback.users, posts: posts.length ? posts : fallback.posts, communities: communities.length ? communities : fallback.communities, jobs: jobs.length ? jobs : fallback.jobs, passwords: Object.fromEntries((users.length ? users : fallback.users).map((user) => [user.id, user.username === 'demo' ? 'demo123' : 'demo123'])) }
}

export function loadState(storage: Storage): DemoState {
  const current = storage.getItem(DATA_KEY)
  if (current) {
    try { return JSON.parse(current) as DemoState } catch { storage.setItem(`${DATA_KEY}.corrupt`, current) }
  }
  const legacy = storage.getItem(V1_KEY)
  if (legacy) {
    try {
      const migrated = migrateLegacy(legacy)
      storage.setItem(BACKUP_KEY, legacy)
      storage.setItem(DATA_KEY, JSON.stringify(migrated))
      return migrated
    } catch { storage.setItem(BACKUP_KEY, legacy) }
  }
  const seeded = seedState()
  storage.setItem(DATA_KEY, JSON.stringify(seeded))
  return seeded
}

export class DemoApiClient implements ApiClient {
  private state: DemoState
  constructor(private storage: Storage) { this.state = loadState(storage) }
  private save() { this.storage.setItem(DATA_KEY, JSON.stringify(this.state)) }
  private user() { const id = Number(this.storage.getItem(SESSION_KEY)); return this.state.users.find((user) => user.id === id) ?? null }
  async snapshot(): Promise<Snapshot> { return { ...structuredClone(this.state), currentUser: this.user() } }
  async login(input: { username: string; password: string }) { const user = this.state.users.find((item) => item.username === input.username && this.state.passwords[item.id] === input.password); if (!user) throw new Error('Invalid demo credentials'); this.storage.setItem(SESSION_KEY, String(user.id)); return user }
  async register(input: Registration) { if (!input.username || !input.password || this.state.users.some((user) => user.username === input.username)) throw new Error('Choose a unique username and password'); const id = this.state.nextIds.user++; const user: User = { id, username: input.username, name: input.name || input.username, email: input.email || '', title: input.title || 'Community member', company: input.company || '', industry: input.industry || '', location: input.location || '', skills: input.skills || '', about: input.about || '', availability: input.availability || 'Open to collaborate', website: input.website || '', role: 'member' }; this.state.users.push(user); this.state.passwords[id] = input.password; this.storage.setItem(SESSION_KEY, String(id)); this.save(); return user }
  async logout() { this.storage.removeItem(SESSION_KEY) }
  private auth() { const user = this.user(); if (!user) throw new Error('Sign in to continue'); return user }
  async createPost(content: string, opts?: { kind?: Post['kind']; tags?: string[]; link?: Post['link'] }) { const user = this.auth(); this.state.posts.unshift({ id: this.state.nextIds.post++, authorId: user.id, content, type: opts?.kind ? opts.kind[0].toUpperCase() + opts.kind.slice(1) : 'Update', kind: opts?.kind ?? 'update', tags: opts?.tags ?? [], link: opts?.link, previewTitle: opts?.link?.title ?? '', previewSubtitle: opts?.link?.subtitle ?? '', commentsList: [], createdAt: new Date().toISOString(), reactions: 0, comments: 0, reposts: 0, liked: false, saved: false }); this.save() }
  async togglePost(id: number, action: 'liked' | 'saved') { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (!post) return; post[action] = !post[action]; if (action === 'liked') post.reactions += post.liked ? 1 : -1; this.save() }
  async repost(id: number) { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (post) post.reposts++; this.save() }
  async comment(id: number) { this.auth(); const post = this.state.posts.find((item) => item.id === id); if (post) post.comments++; this.save() }
  async addComment(postId: number, text: string) { const user = this.auth(); const post = this.state.posts.find((item) => item.id === postId); if (!post || !text.trim()) return; post.commentsList ??= []; post.commentsList.push({ id: this.state.nextIds.message++, authorId: user.id, text: text.trim(), createdAt: new Date().toISOString() }); post.comments = post.commentsList.length; this.save() }
  async deletePost(id: number) { this.auth(); this.state.posts = this.state.posts.filter((item) => item.id !== id); this.save() }
  async updateProfile(input: Partial<User>) { const user = this.auth(); Object.assign(user, input, { id: user.id, username: user.username, role: user.role }); this.save(); return user }
  async connect(userId: number) { const user = this.auth(); const pair = [user.id, userId].sort((a, b) => a - b); if (!this.state.connections.some((item) => item[0] === pair[0] && item[1] === pair[1])) this.state.connections.push(pair); this.save() }
  async toggleCommunity(id: number) { this.auth(); const item = this.state.communities.find((community) => community.id === id); if (item) item.joined = !item.joined; this.save() }
  async deleteCommunity(id: number) { this.auth(); this.state.communities = this.state.communities.filter((item) => item.id !== id); this.save() }
  async sendMessage(conversationId: number, text: string) { const user = this.auth(); this.state.messages.push({ id: this.state.nextIds.message++, conversationId, senderId: user.id, text, createdAt: new Date().toISOString() }); this.save() }
  async ensureConversation(userId: number) { const user = this.auth(); let item = this.state.conversations.find((conversation) => conversation.participantIds.includes(user.id) && conversation.participantIds.includes(userId)); if (!item) { item = { id: this.state.nextIds.conversation++, participantIds: [user.id, userId] }; this.state.conversations.push(item); this.save() } return item.id }
  async toggleJob(id: number, action: 'applied' | 'saved') { this.auth(); const job = this.state.jobs.find((item) => item.id === id); if (job) job[action] = !job[action]; this.save() }
  async createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>) { this.auth(); this.state.jobs.push({ ...input, id: this.state.nextIds.job++, applied: false, saved: false }); this.save() }
}
