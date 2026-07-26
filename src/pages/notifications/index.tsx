import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, Bell, Check, ClipboardCheck, Settings, Target, UserPlus } from 'lucide-react'
import { canAccess } from '@/app/access-policy'
import { useSnapshot } from '@/app/app-data'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const notificationSeed = [
  { id: 1, group: 'Connection Requests', title: 'Nihat Abbasov', body: 'Requested to connect around climate-data infrastructure.', time: '2 hours ago', action: 'Accept' },
  { id: 2, group: 'Mentor Feedback', title: 'Goal Review Completed', body: 'A mentor left structured feedback on your next milestone.', time: 'Yesterday at 14:30', action: 'View goals' },
  { id: 3, group: 'Investment Interest', title: 'Venture Evidence Reviewed', body: 'An illustrative investor workflow recorded a venture review.', time: 'Today at 09:15', action: 'Open dashboard' },
]

export function NotificationsPage() {
  const { data } = useSnapshot()
  const [read, setRead] = useState<number[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  if (!data) return <PageLoading />
  const source = notificationSeed.filter((item) => item.group !== 'Investment Interest' || canAccess(data.currentUser, 'investor'))
  const notifications = source.filter((item) => filter === 'all' || !read.includes(item.id))
  const markRead = (id: number) => setRead((current) => [...new Set([...current, id])])
  return <PageContainer>
    <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'><PageHeading eyebrow='Activity center' title='Notifications' description='Role-aware alerts, feedback, and operational updates.' /><div className='flex gap-2'><Button variant='outline' onClick={() => setRead(source.map((item) => item.id))}>Mark all as read</Button><Button variant='outline' size='icon' aria-label='Notification settings' asChild><Link to='/settings'><Settings /></Link></Button></div></div>
    <div className='grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]'><main className='space-y-7'>{['Connection Requests', 'Mentor Feedback', 'Investment Interest'].map((group) => {
      const items = notifications.filter((item) => item.group === group)
      if (!items.length) return null
      return <section key={group}><div className='mb-3 flex items-center gap-2'><Bell className='size-4 text-muted-foreground' /><h2 className='font-semibold'>{group}</h2><Badge>{items.length}</Badge></div><div className='space-y-3'>{items.map((item) => <Card key={item.id} className={cn(!read.includes(item.id) && 'border-emerald-500/30')}><CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'><span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>{group === 'Connection Requests' ? <UserPlus /> : group === 'Mentor Feedback' ? <ClipboardCheck /> : <Target />}</span><div className='min-w-0 flex-1'><h3 className='font-semibold'>{item.title}</h3><p className='mt-1 text-sm text-muted-foreground'>{item.body}</p><small className='mt-2 block text-muted-foreground'>{item.time}</small></div><div className='flex gap-2'>{group === 'Mentor Feedback' ? <Button size='sm' asChild onClick={() => markRead(item.id)}><Link to='/goals'>{item.action}</Link></Button> : group === 'Investment Interest' ? <Button size='sm' asChild onClick={() => markRead(item.id)}><Link to='/investors'>{item.action}</Link></Button> : <Button size='sm' onClick={() => markRead(item.id)}>{item.action}</Button>}{group === 'Connection Requests' && <Button size='sm' variant='outline' onClick={() => markRead(item.id)}>Decline</Button>}</div></CardContent></Card>)}</div></section>
    })}{!notifications.length && <Card className='border-dashed'><CardContent className='py-16 text-center'><Check className='mx-auto size-10 text-emerald-500' /><h2 className='mt-4 text-lg font-semibold'>You are all caught up</h2></CardContent></Card>}</main>
      <aside className='space-y-6'><Card><CardHeader><CardTitle className='text-base'>Filter views</CardTitle></CardHeader><CardContent className='flex gap-2'><Button size='sm' variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button><Button size='sm' variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Unread ({source.filter((item) => !read.includes(item.id)).length})</Button></CardContent></Card><section><h3 className='border-b pb-3 font-semibold'>System status</h3><div className='mt-3 space-y-3'><Status icon={BadgeCheck} title='Verification center' text='Review your current identity and authority status.' /><Status icon={Target} title='Goal review' text='Keep milestone evidence definitions current.' /></div></section></aside>
    </div>
  </PageContainer>
}
function Status({ icon: Icon, title, text }: { icon: typeof BadgeCheck; title: string; text: string }) { return <div className='flex gap-3 rounded-xl p-3 hover:bg-muted/50'><Icon className='mt-0.5 size-5 text-primary' /><div><b className='text-sm'>{title}</b><p className='mt-1 text-xs text-muted-foreground'>{text}</p></div></div> }
