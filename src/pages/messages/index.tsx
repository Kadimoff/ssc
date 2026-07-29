import { useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, BadgeCheck, MessagesSquare, Plus, Search, Send } from 'lucide-react'
import { useBubbleEntrance } from '@/hooks/use-animations'
import { apiClient } from '@/data/client'
import type { EntityId, User } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AuthRequired, PageContainer, PageLoading, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'

export type InboxMobileView = 'list' | 'conversation'

function messageTime(createdAt?: string) {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function MessagesPage() {
  const { data } = useSnapshot()
  const [selected, setSelected] = useState<EntityId | null>(null)
  const [mobileView, setMobileView] = useState<InboxMobileView>('list')
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const conversations = useMemo(
    () => data?.conversations.filter((item) => data.currentUser && item.participantIds.includes(data.currentUser.id)) ?? [],
    [data],
  )
  const activeId = selected ?? conversations[0]?.id ?? null
  const active = conversations.find((item) => item.id === activeId)
  const otherId = active?.participantIds.find((id) => id !== data?.currentUser?.id)
  const other = data?.users.find((user) => user.id === otherId)
  const messages = data?.messages.filter((message) => message.conversationId === activeId) ?? []
  const send = useAction(() => activeId ? apiClient.sendMessage(activeId, text.trim()) : Promise.resolve(), 'Message sent')
  useBubbleEntrance(messagesContainerRef, messages.length)

  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to open your messages' />

  const filtered = conversations.filter((item) => {
    const id = item.participantIds.find((value) => value !== data.currentUser?.id)
    const user = data.users.find((value) => value.id === id)
    const matchesSearch = `${user?.name ?? ''} ${user?.title ?? ''}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (filter === 'All' || user?.title.toLowerCase().includes(filter.toLowerCase()))
  })

  const openConversation = (conversationId: EntityId) => {
    setSelected(conversationId)
    setMobileView('conversation')
  }

  return <PageContainer className='min-w-0 py-3 md:py-5'>
    <Card className='inbox-shell h-[calc(100svh-9rem-env(safe-area-inset-bottom))] min-h-[520px] min-w-0 overflow-hidden p-0 md:h-[calc(100svh-7.5rem)] md:min-h-[600px]'>
      <div className='grid h-full min-w-0 md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]'>
        <aside className={cn('min-h-0 min-w-0 flex-col border-r bg-card', mobileView === 'conversation' ? 'hidden md:flex' : 'flex')}>
          <div className='border-b p-4 sm:p-5'>
            <div className='flex min-w-0 items-center justify-between gap-3'>
              <div className='min-w-0'><p className='text-[10px] font-bold uppercase tracking-[.14em] text-primary'>Private workspace</p><h1 className='truncate text-2xl font-bold'>Messages</h1></div>
              <NewConversationDialog
                users={data.users.filter((user) => user.id !== data.currentUser?.id)}
                onSelect={async (userId) => {
                  const id = await apiClient.ensureConversation(userId)
                  openConversation(id)
                }}
              />
            </div>
            <label className='relative mt-4 block min-w-0'>
              <span className='sr-only'>Search conversations</span>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input className='w-full pl-10' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search conversations…' />
            </label>
          </div>
          <div className='no-scrollbar flex min-w-0 gap-2 overflow-x-auto border-b p-3' aria-label='Conversation filters'>
            {['All', 'Mentor', 'Founder', 'Investor'].map((item) => <Button key={item} size='sm' className='shrink-0 rounded-full' variant={filter === item ? 'default' : 'outline'} onClick={() => setFilter(item)}>{item}</Button>)}
          </div>
          <div className='min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain'>
            {filtered.map((item) => {
              const id = item.participantIds.find((value) => value !== data.currentUser?.id)
              const user = data.users.find((value) => value.id === id)
              const threadMessages = data.messages.filter((message) => message.conversationId === item.id)
              const preview = threadMessages[threadMessages.length - 1]
              return <button
                key={item.id}
                type='button'
                onClick={() => openConversation(item.id)}
                className={cn(
                  'relative grid w-full min-w-0 grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-3 border-b p-4 text-left transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  item.id === activeId && 'bg-muted/70 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500',
                )}
                aria-current={item.id === activeId ? 'true' : undefined}
              >
                <span className='relative'>
                  <UserAvatar user={user} className='size-12 shrink-0' />
                  <span className='absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500' aria-label='Available' />
                </span>
                <span className='min-w-0'>
                  <span className='flex min-w-0 items-center gap-1'><b className='truncate text-sm'>{user?.name ?? 'SSC member'}</b>{user?.verificationStatus === 'verified' && <BadgeCheck className='size-3.5 shrink-0 text-primary' aria-label='Verified member' />}</span>
                  <span className='mt-0.5 block truncate text-[11px] font-medium text-primary'>{user?.title || 'Founder'}</span>
                  <span className='mt-1 line-clamp-2 break-words text-xs leading-4 text-muted-foreground [overflow-wrap:anywhere]'>{preview?.text || 'Start the conversation'}</span>
                </span>
                <span className='shrink-0 pt-0.5 text-[10px] text-muted-foreground'>{messageTime(preview?.createdAt)}</span>
              </button>
            })}
            {filtered.length === 0 && <InboxEmpty
              hasConversations={conversations.length > 0}
              onClear={() => { setSearch(''); setFilter('All') }}
            />}
          </div>
        </aside>

        <section className={cn('min-h-0 min-w-0 flex-col bg-muted/20', mobileView === 'list' ? 'hidden md:flex' : 'flex')}>
          {other ? <>
            <header className='flex min-h-[72px] min-w-0 items-center gap-3 border-b bg-card/95 p-3 sm:p-4'>
              <Button variant='ghost' size='icon' className='shrink-0 md:hidden' aria-label='Back to conversations' onClick={() => setMobileView('list')}><ArrowLeft /></Button>
              <UserAvatar user={other} className='size-10 shrink-0 sm:size-11' />
              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 items-center gap-1.5'><b className='truncate'>{other.name}</b>{other.verificationStatus === 'verified' && <BadgeCheck className='size-4 shrink-0 text-emerald-500' aria-label='Verified member' />}</div>
                <p className='truncate text-xs text-muted-foreground'>{other.title}</p>
              </div>
              <Badge variant='outline' className='hidden shrink-0 text-[9px] sm:inline-flex'>Private workspace</Badge>
            </header>
            <div ref={messagesContainerRef} className='min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6'>
              <div className='mx-auto w-fit rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground'>Conversation</div>
              {messages.map((message) => {
                const mine = message.senderId === data.currentUser?.id
                return <div key={message.id} className={cn('flex min-w-0 max-w-[92%] gap-2 sm:max-w-[82%]', mine && 'ml-auto flex-row-reverse')}>
                  <UserAvatar user={mine ? data.currentUser : other} className='mt-auto size-8 shrink-0' />
                  <div className='min-w-0'>
                    <small className={cn('mb-1 block truncate text-muted-foreground', mine && 'text-right')}>{mine ? 'You' : other.name}</small>
                    <div className={cn('break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm [overflow-wrap:anywhere]', mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border bg-card')}>{message.text}</div>
                  </div>
                </div>
              })}
              {messages.length === 0 && <div className='grid min-h-48 place-items-center text-center'><div><MessagesSquare className='mx-auto size-9 text-muted-foreground' /><p className='mt-3 text-sm font-medium'>No messages yet</p><p className='mt-1 text-xs text-muted-foreground'>Start with useful context or a specific question.</p></div></div>}
            </div>
            <form
              className='border-t bg-card p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] sm:p-4'
              onSubmit={(event) => {
                event.preventDefault()
                if (!text.trim()) return
                send.mutate(undefined, { onSuccess: () => setText('') })
              }}
            >
              <div className='no-scrollbar mb-2 flex min-w-0 items-center gap-2 overflow-x-auto'>
                <span className='shrink-0 text-[10px] font-semibold uppercase text-muted-foreground'>Quick:</span>
                <Button type='button' size='sm' variant='outline' className='h-8 shrink-0 rounded-full text-[10px]' onClick={() => setText('Could we schedule a 15-minute sync?')}>Schedule sync</Button>
                <Button type='button' size='sm' variant='outline' className='h-8 shrink-0 rounded-full text-[10px]' onClick={() => setText('Could you share the evidence behind the latest milestone?')}>Request evidence</Button>
              </div>
              <div className='flex min-w-0 items-end gap-2 rounded-xl border bg-muted/30 p-2 focus-within:ring-2 focus-within:ring-ring'>
                <Textarea
                  className='max-h-32 min-h-11 min-w-0 flex-1 resize-none border-0 bg-transparent [overflow-wrap:anywhere]'
                  rows={1}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => { if (event.ctrlKey && event.key === 'Enter') event.currentTarget.form?.requestSubmit() }}
                  placeholder='Write a message…'
                />
                <Button size='icon' className='shrink-0' disabled={!text.trim() || send.isPending} aria-label={send.isPending ? 'Sending message' : 'Send message'}><Send /></Button>
              </div>
            </form>
          </> : <div className='grid flex-1 place-items-center p-6 text-center text-muted-foreground'><div><MessagesSquare className='mx-auto mb-3 size-10' /><p className='font-medium'>Choose a conversation</p><p className='mt-1 text-sm'>Or meet someone relevant in the network.</p><Button className='mt-4' variant='outline' asChild><Link to='/network'>Open network</Link></Button></div></div>}
        </section>
      </div>
    </Card>
  </PageContainer>
}

function InboxEmpty({ hasConversations, onClear }: { hasConversations: boolean; onClear: () => void }) {
  return <div className='grid min-h-80 place-items-center p-6 text-center'>
    <div>
      <span className='mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary'><MessagesSquare /></span>
      <h2 className='mt-4 font-semibold'>{hasConversations ? 'No matching conversations' : 'No conversations yet'}</h2>
      <p className='mt-2 text-sm leading-6 text-muted-foreground'>{hasConversations ? 'Try another name, role, or filter.' : 'Meet a relevant founder, mentor, or operator and start with useful context.'}</p>
      {hasConversations ? <Button className='mt-4' variant='outline' onClick={onClear}>Clear filters</Button> : <Button className='mt-4' asChild><Link to='/network'>Find people to meet</Link></Button>}
    </div>
  </div>
}

function NewConversationDialog({ users, onSelect }: { users: User[]; onSelect: (userId: EntityId) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = users.filter((user) => `${user.name} ${user.title}`.toLowerCase().includes(search.toLowerCase()))
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant='ghost' size='icon' className='shrink-0' aria-label='New conversation'><Plus /></Button></DialogTrigger>
    <DialogContent className='max-h-[min(90svh,620px)] min-w-0 overflow-hidden'>
      <DialogHeader><DialogTitle>New conversation</DialogTitle><DialogDescription>Select a demo community member to message.</DialogDescription></DialogHeader>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search members…' />
      <div className='min-h-0 max-h-80 space-y-1 overflow-y-auto'>
        {filtered.map((user) => <button key={user.id} type='button' onClick={() => { onSelect(user.id); setOpen(false); setSearch('') }} className='flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'><UserAvatar user={user} className='shrink-0' /><div className='min-w-0'><b className='block truncate text-sm'>{user.name}</b><p className='truncate text-xs text-muted-foreground'>{user.title}</p></div></button>)}
        {filtered.length === 0 && <p className='py-8 text-center text-sm text-muted-foreground'>No matching members.</p>}
      </div>
    </DialogContent>
  </Dialog>
}
