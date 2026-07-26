import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useStaggerCards } from '@/hooks/use-animations'
import { Check, Users, X } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { Snapshot } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'

export function CommunitiesPage() {
  const { data } = useSnapshot(); const commRef = useRef<HTMLDivElement>(null)
  useStaggerCards(commRef, [data])
  if (!data) return <PageLoading />
  return <PageContainer>
    <PageHeading eyebrow='Communities' title='Find your people. Build momentum.' description='Smaller circles for deeper professional conversations.' />
    <div ref={commRef} className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{data.communities.map((community) => <div key={community.id} data-card><CommunityCard community={community} admin={data.currentUser?.role === 'admin'} /></div>)}</div>
  </PageContainer>
}

function CommunityCard({ community, admin }: { community: Snapshot['communities'][number]; admin: boolean }) {
  const toggle = useAction(() => apiClient.toggleCommunity(community.id))
  const remove = useAction(() => apiClient.deleteCommunity(community.id))
  const categoryColors: Record<string, string> = {
    'AI': 'from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Startups': 'from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Design': 'from-violet-500/20 via-violet-500/10 to-transparent text-violet-600 dark:text-violet-400 border-violet-500/30',
    'Tech': 'from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Business': 'from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Science': 'from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  }
  const headerColors: Record<string, string> = {
    'AI': 'from-blue-600/40 via-blue-400/20 to-transparent',
    'Startups': 'from-emerald-600/40 via-emerald-400/20 to-transparent',
    'Design': 'from-violet-600/40 via-violet-400/20 to-transparent',
    'Tech': 'from-primary/40 via-primary/20 to-transparent',
    'Business': 'from-amber-600/40 via-amber-400/20 to-transparent',
    'Science': 'from-emerald-600/40 via-emerald-400/20 to-transparent',
  }
  const colorClass = categoryColors[community.category] || categoryColors['Tech']
  const headerClass = headerColors[community.category] || headerColors['Tech']
  return (
    <Link to='/communities/$communityId' params={{ communityId: String(community.id) }} className='block'>
      <Card className='group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 border-primary/5'>
        <div className={`h-1.5 bg-gradient-to-r ${headerClass}`} />
        <CardHeader>
          <Badge className={`mb-3 w-fit border bg-gradient-to-br ${colorClass}`} variant='secondary'>
            {community.category}
          </Badge>
          <CardTitle className='tracking-tight text-lg'>{community.name}</CardTitle>
          <CardDescription className='leading-relaxed text-balance line-clamp-2'>{community.description}</CardDescription>
        </CardHeader>
        <CardContent className='pb-4'>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='size-4 text-muted-foreground' />
              <b className='text-foreground'>{community.members.toLocaleString()}</b>
              <span className='text-muted-foreground'>members</span>
            </div>
            {community.activity && (
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='relative'>
                  <span className='size-1.5 rounded-full bg-green-500 block' />
                  <span className='absolute inset-0 size-1.5 rounded-full bg-green-500 animate-ping opacity-40' />
                </span>
                {community.activity}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className='gap-2 border-t pt-4' onClick={(e) => e.preventDefault()}>
          <Button
            className='flex-1 transition-all duration-200 group-hover:shadow-sm'
            variant={community.joined ? 'outline' : 'default'}
            onClick={(e) => { e.preventDefault(); toggle.mutate() }}
          >
            {community.joined && <Check className='size-4' />}
            {community.joined ? 'Joined' : 'Join community'}
          </Button>
          {admin && (
            <Button variant='ghost' size='icon' onClick={(e) => { e.preventDefault(); remove.mutate() }} aria-label='Remove community'>
              <X className='size-4' />
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
