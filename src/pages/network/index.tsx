import { useRef, useState } from 'react'
import { useStaggerCards } from '@/hooks/use-animations'
import { Link } from '@tanstack/react-router'
import { Search, UserPlus, Users } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { User } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeading, PageLoading, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'

export function NetworkPage() {
  const { data } = useSnapshot(); const [query, setQuery] = useState('')
  const netRef = useRef<HTMLDivElement>(null)
  useStaggerCards(netRef, [data, query])
  if (!data) return <PageLoading />
  const users = data.users.filter((user) => user.id !== data.currentUser?.id && `${user.name} ${user.title} ${user.skills}`.toLowerCase().includes(query.toLowerCase()))
  return <PageContainer>
    <PageHeading eyebrow='Network' title='Meet people with aligned goals.' description='Discover collaborators by craft, context and what they want to build next.' />
    <div className='mb-8 max-w-xl'>
      <div className='relative'>
        <Search className='absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search name, role or skill' className='h-12 pl-11 text-base bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200 rounded-xl' />
      </div>
    </div>
    {users.length === 0 ? (
      <Card className='border-dashed border-muted-foreground/20 py-16 text-center'>
        <CardContent><Users className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No members found</p><p className='mt-1 text-sm text-muted-foreground'>Try a different search term.</p></CardContent>
      </Card>
    ) : (
      <div ref={netRef} className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>{users.map((user) => <div key={user.id} data-card><PersonCard user={user} /></div>)}</div>
    )}
  </PageContainer>
}

function PersonCard({ user }: { user: User }) {
  const connect = useAction(() => apiClient.connect(user.id), `Connected with ${user.name}`)
  const skillList = user.skills.split(',').map(s => s.trim()).filter(Boolean)
  const skillColors = ['from-blue-500/20 to-blue-500/5', 'from-violet-500/20 to-violet-500/5', 'from-amber-500/20 to-amber-500/5', 'from-emerald-500/20 to-emerald-500/5']
  return (
    <Card className='group overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 border-primary/5'>
      <div className='relative h-24 bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,.15),transparent_60%)]' />
        <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 size-24 rounded-full border-4 border-background bg-background shadow-md ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20 group-hover:shadow-lg' />
      </div>
      <CardContent className='flex flex-col items-center px-6 pb-6 pt-0 text-center'>
        <UserAvatar user={user} className='-mt-12 size-20 border-4 border-background shadow-md ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20' />
        <Link to='/people/$username' params={{ username: user.username }} className='mt-3 font-semibold tracking-tight text-lg hover:text-primary'>{user.name}</Link>
        <p className='text-sm text-muted-foreground leading-relaxed'>{user.title}</p>
        <p className='text-xs text-muted-foreground mt-0.5'>{user.company}</p>
        {skillList.length > 0 && (
          <div className='mt-4 flex flex-wrap justify-center gap-1.5'>
            {skillList.slice(0, 3).map((skill, i) => (
              <Badge key={skill} variant='secondary' className={cn(
                'px-2.5 py-1 text-[10px] font-medium bg-gradient-to-br',
                skillColors[i % skillColors.length]
              )}>
                {skill}
              </Badge>
            ))}
          </div>
        )}
        <Button className='mt-5 w-full transition-all duration-200 hover:shadow-sm gap-1.5' variant='outline' onClick={() => connect.mutate()}>
          <UserPlus className='size-4' /> Connect
        </Button>
      </CardContent>
    </Card>
  )
}
