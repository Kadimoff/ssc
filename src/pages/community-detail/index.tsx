import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CalendarDays, Check, Globe, Plus, Share2, Shield, Sparkles, UserPlus, Users,
} from 'lucide-react'
import { apiClient } from '@/data/client'
import { communityDetails } from '@/data/landing-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { localAsset } from '@/config/demo-assets'

const snapshotKey = ['snapshot'] as const

function useSnapshot() {
  return useQuery({ queryKey: snapshotKey, queryFn: () => apiClient.snapshot() })
}

function UserAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(/\s+/).map((p) => p[0]).join('').slice(0, 3).toUpperCase()
  return <Avatar className={cn('size-10 border border-primary/15', className)}><AvatarFallback className='bg-primary/10 font-semibold text-primary'>{initials}</AvatarFallback></Avatar>
}

export function CommunityDetailPage() {
  const { communityId } = useParams({ from: '/app/communities/$communityId' })
  const { data } = useSnapshot()
  const queryClient = useQueryClient()
  const detail = communityDetails.find((c) => c.id === communityId)
  const toggle = useMutation({
    mutationFn: () => apiClient.toggleCommunity(communityId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: snapshotKey })
      toast.success('Community membership updated')
    },
  })

  if (!detail) return <PageContainer><div className='py-20 text-center text-muted-foreground'>Community not found</div></PageContainer>

  const orgUsers = detail.organizers.map((oid) => data?.users.find((u) => u.id === oid)).filter(Boolean)
  const memberCount = detail.members.toLocaleString()
  const joined = data?.communities.find((community) => community.id === communityId)?.joined ?? detail.joined

  return (
    <PageContainer>
      <Card className='overflow-hidden p-0'>
        <div className='relative h-48 sm:h-56 bg-muted'>
          <img src={localAsset(detail.coverUrl)} alt='' className='size-full object-cover' loading='lazy' />
          <div className='absolute inset-0 bg-gradient-to-t from-background/80 to-transparent' />
        </div>
        <div className='relative -mt-10 flex flex-col gap-5 px-6 pb-7 sm:flex-row sm:items-end'>
          <div className='grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-background bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-extrabold text-primary shadow-lg sm:size-24 sm:text-3xl'>
            {detail.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className='flex flex-1 flex-col gap-1 sm:pb-1'>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{detail.name}</h1>
            <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
              <Badge variant='secondary' className='text-[10px]'>{detail.category}</Badge>
              <span className='flex items-center gap-1'><Users size={14} />{memberCount} members</span>
              <span>{detail.activity}</span>
            </div>
          </div>
          <Button size='lg' variant={joined ? 'outline' : 'default'} className='shrink-0' disabled={toggle.isPending} onClick={() => toggle.mutate()}>
            {joined && <Check size={16} />}
            {joined ? 'Joined' : 'Join community'}
          </Button>
        </div>
      </Card>

      <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_300px]'>
        <Tabs defaultValue='posts'>
          <TabsList>
            <TabsTrigger value='posts'><Sparkles size={14} />Posts</TabsTrigger>
            <TabsTrigger value='members'><Users size={14} />Members</TabsTrigger>
            <TabsTrigger value='events'><CalendarDays size={14} />Events</TabsTrigger>
            <TabsTrigger value='about'><Shield size={14} />About</TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='mt-6'>
            <div className='space-y-3'>{data?.posts.slice(0, 4).map((post) => { const author = data.users.find((user) => user.id === post.authorId); return <Card key={post.id}><CardContent className='p-4'><div className='flex items-center gap-2'><UserAvatar name={author?.name ?? 'Member'} /><div><b className='text-sm'>{author?.name}</b><p className='text-xs text-muted-foreground'>{post.type}</p></div></div><p className='mt-3 text-sm leading-6'>{post.content}</p></CardContent></Card> })}</div>
          </TabsContent>

          <TabsContent value='members' className='mt-6'>
            <div className='space-y-3'>
              {data?.users.slice(0, 6).map((user) => {
                const isOrg = detail.organizers.includes(user.id)
                return (
                  <Card key={user.id}>
                    <CardContent className='flex items-center gap-4 p-4'>
                      <UserAvatar name={user.name} className='size-12' />
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold'>{user.name}</p>
                        <p className='text-sm text-muted-foreground'>{user.title}</p>
                      </div>
                      {isOrg && <Badge variant='secondary'><Shield size={12} />Organizer</Badge>}
                      <Button variant='ghost' size='icon' aria-label={`View ${user.name}'s profile`} asChild><Link to='/people/$username' params={{ username: user.username }}><UserPlus size={16} /></Link></Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value='events' className='mt-6'>
            <Card><CardContent className='py-12 text-center text-muted-foreground'>
              <CalendarDays className='mx-auto mb-3 size-8' />
              <p>Browse community workshops and showcases.</p>
              <Button variant='outline' size='sm' className='mt-4' asChild><Link to='/events'><Plus size={14} />View events</Link></Button>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value='about' className='mt-6 space-y-4'>
            <Card><CardHeader><CardTitle>About</CardTitle><CardDescription className='leading-7 text-sm'>{detail.descriptionFull}</CardDescription></CardHeader></Card>
            {detail.rules.length > 0 && (
              <Card><CardHeader><CardTitle>Community rules</CardTitle></CardHeader><CardContent>
                <ol className='list-inside list-decimal space-y-2 text-sm text-muted-foreground'>
                  {detail.rules.map((rule) => <li key={rule}>{rule}</li>)}
                </ol>
              </CardContent></Card>
            )}
            <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent className='grid gap-3 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'><Globe size={14} />Created {new Date(detail.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              <div className='flex items-center gap-2 text-muted-foreground'><Users size={14} />{memberCount} members</div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <aside className='space-y-4'>
          {orgUsers.length > 0 && (
            <Card><CardHeader><CardTitle className='text-base'>Organizers</CardTitle></CardHeader><CardContent className='space-y-3'>
              {orgUsers.map((user) => user && (
                <div key={user.id} className='flex items-center gap-3'>
                  <UserAvatar name={user.name} className='size-10' />
                  <div className='min-w-0 text-sm'><b className='block truncate'>{user.name}</b><span className='text-muted-foreground'>{user.title}</span></div>
                </div>
              ))}
            </CardContent></Card>
          )}
          <Card><CardHeader><CardTitle className='text-base'>Stats</CardTitle></CardHeader><CardContent className='grid grid-cols-2 gap-3 text-sm'>
            <div className='rounded-lg bg-muted/50 p-3 text-center'><b className='block text-lg font-bold'>{memberCount}</b><span className='text-xs text-muted-foreground'>Members</span></div>
            <div className='rounded-lg bg-muted/50 p-3 text-center'><b className='block text-lg font-bold'>{data?.posts.length ?? 0}</b><span className='text-xs text-muted-foreground'>Posts</span></div>
            <div className='rounded-lg bg-muted/50 p-3 text-center'><b className='block text-lg font-bold'>2</b><span className='text-xs text-muted-foreground'>Events</span></div>
            <div className='rounded-lg bg-muted/50 p-3 text-center'><b className='block text-lg font-bold'>{orgUsers.length}</b><span className='text-xs text-muted-foreground'>Organizers</span></div>
          </CardContent></Card>
          <Button variant='outline' className='w-full' onClick={async () => { await navigator.clipboard.writeText(window.location.href); toast.success('Community link copied') }}>
            <Share2 size={14} /> Share community
          </Button>
        </aside>
      </div>
    </PageContainer>
  )
}

function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('app-container py-8 lg:py-10', className)}>{children}</div>
}
