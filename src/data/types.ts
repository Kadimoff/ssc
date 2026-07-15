export type Role = 'admin' | 'member'

export interface User {
  id: number
  username: string
  name: string
  email: string
  title: string
  company: string
  industry: string
  location: string
  skills: string
  about: string
  availability: string
  website: string
  role: Role
}

export type PostKind = 'update' | 'milestone' | 'raise' | 'hiring' | 'launch' | 'question'

export interface Comment {
  id: number
  authorId: number
  text: string
  createdAt: string
}

export interface PostLink {
  title: string
  subtitle: string
  url: string
}

export interface Post {
  id: number
  authorId: number
  content: string
  type: string
  /** Typed kind drives the badge / color / icon. Falls back to `type` for legacy data. */
  kind?: PostKind
  previewTitle?: string
  previewSubtitle?: string
  /** Rich link preview (preferred over previewTitle/Subtitle). */
  link?: PostLink
  tags?: string[]
  media?: string[]
  commentsList?: Comment[]
  createdAt: string
  reactions: number
  comments: number
  reposts: number
  liked: boolean
  saved: boolean
}

export interface Community {
  id: number
  name: string
  category: string
  description: string
  members: number
  activity: string
  joined: boolean
}

export interface CommunityDetail extends Community {
  coverUrl: string
  descriptionFull: string
  rules: string[]
  organizers: number[]
  memberList: Array<{ userId: number; role: 'admin' | 'moderator' | 'member'; joinedAt: string }>
  createdAt: string
}

export interface Job {
  id: number
  role: string
  company: string
  location: string
  type: string
  skills: string
  description: string
  featured: boolean
  applied: boolean
  saved: boolean
}

export interface Conversation {
  id: number
  participantIds: number[]
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  text: string
  createdAt: string
}

export interface DemoState {
  version: 2
  users: User[]
  passwords: Record<number, string>
  posts: Post[]
  communities: Community[]
  jobs: Job[]
  conversations: Conversation[]
  messages: Message[]
  connections: number[][]
  nextIds: Record<'user' | 'post' | 'job' | 'conversation' | 'message', number>
}

export interface Snapshot extends DemoState {
  currentUser: User | null
}

export interface Credentials { username: string; password: string }
export type Registration = Credentials & Partial<Omit<User, 'id' | 'username' | 'role'>>

export interface ApiClient {
  snapshot(): Promise<Snapshot>
  login(credentials: Credentials): Promise<User>
  register(input: Registration): Promise<User>
  logout(): Promise<void>
  createPost(content: string, opts?: { kind?: PostKind; tags?: string[]; link?: PostLink }): Promise<void>
  togglePost(id: number, action: 'liked' | 'saved'): Promise<void>
  repost(id: number): Promise<void>
  comment(id: number): Promise<void>
  addComment(postId: number, text: string): Promise<void>
  deletePost(id: number): Promise<void>
  updateProfile(input: Partial<User>): Promise<User>
  connect(userId: number): Promise<void>
  toggleCommunity(id: number): Promise<void>
  deleteCommunity(id: number): Promise<void>
  sendMessage(conversationId: number, text: string): Promise<void>
  ensureConversation(userId: number): Promise<number>
  toggleJob(id: number, action: 'applied' | 'saved'): Promise<void>
  createJob(input: Omit<Job, 'id' | 'applied' | 'saved'>): Promise<void>
}
