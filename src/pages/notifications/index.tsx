import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, Bell, Check, ClipboardCheck, Settings, Target } from 'lucide-react'
import { useSnapshot } from '@/app/app-data'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { EmptyState } from '@/components/execution-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExecutionStore } from '@/features/execution/store'

export function NotificationsPage() {
  const { data } = useSnapshot()
  const { state, store } = useExecutionStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  if (!data) return <PageLoading />
  const userId = data.currentUser?.id
  const source = state.notifications.filter((item) => item.userId === 'all' || item.userId === userId || state.selectedPersona === 'platform_admin')
  const notifications = source.filter((item) => filter === 'all' || !item.read)
  return <PageContainer>
    <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'><PageHeading eyebrow='Activity center' title='Notifications' description='Persisted milestone, evidence, session, application, verification, and introduction updates.' /><div className='flex gap-2'><Button variant='outline' onClick={() => source.forEach((item) => store.markNotification(item.id))}>Mark all as read</Button><Button variant='outline' size='icon' aria-label='Notification settings' asChild><Link to='/settings'><Settings /></Link></Button></div></div>
    <div className='grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]'><main>{notifications.length ? <div className='space-y-3'>{notifications.map((item) => <Card key={item.id} className={!item.read ? 'border-primary/30' : ''}><CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'><span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>{item.kind === 'milestone' ? <Target /> : item.kind === 'session' ? <ClipboardCheck /> : <Bell />}</span><div className='min-w-0 flex-1'><div className='flex items-center gap-2'><h2 className='font-semibold'>{item.title}</h2>{!item.read && <Badge>New</Badge>}</div><p className='mt-1 text-sm text-muted-foreground'>{item.body}</p><time className='mt-2 block text-xs text-muted-foreground'>{new Date(item.createdAt).toLocaleString()}</time></div><Button size='sm' asChild onClick={() => store.markNotification(item.id)}><Link to={item.href}>Open</Link></Button></CardContent></Card>)}</div> : <EmptyState title='You are all caught up' description='Meaningful workflow changes will appear here.' icon={Check} />}</main><aside className='space-y-5'><Card><CardHeader><CardTitle className='text-base'>Filter view</CardTitle></CardHeader><CardContent className='flex gap-2'><Button size='sm' variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button><Button size='sm' variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Unread ({source.filter((item) => !item.read).length})</Button></CardContent></Card><div className='rounded-xl border p-4'><BadgeCheck className='size-5 text-primary' /><b className='mt-3 block text-sm'>Shared persistence</b><p className='mt-1 text-xs leading-5 text-muted-foreground'>Read status is saved with the same local execution state as milestones and reviews.</p></div></aside></div>
  </PageContainer>
}
