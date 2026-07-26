import { useParams } from '@tanstack/react-router'
import { BadgeCheck, BriefcaseBusiness, Globe, MapPin, MessageCircle, UserPlus } from 'lucide-react'
import { apiClient } from '@/data/client'
import { useAction, useSnapshot } from '@/app/app-data'
import { PageContainer, PageLoading, UserAvatar } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MemberProfilePage() {
  const { username } = useParams({ from: '/app/people/$username' })
  const { data } = useSnapshot()
  const user = data?.users.find((item) => item.username === username)
  const connect = useAction(() => user ? apiClient.connect(user.id) : Promise.resolve(), user ? `Connected with ${user.name}` : undefined)
  const message = useAction(() => user ? apiClient.ensureConversation(user.id) : Promise.resolve(''), 'Conversation ready')
  if (!data) return <PageLoading />
  if (!user) return <PageContainer><Card className='border-dashed'><CardContent className='py-20 text-center'>Member not found.</CardContent></Card></PageContainer>
  const skills = user.skills.split(',').map((item) => item.trim()).filter(Boolean)
  return <PageContainer><Card className='overflow-hidden'><div className='h-36 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent' /><CardContent className='relative -mt-12 flex flex-col gap-5 p-6 sm:flex-row sm:items-end'><UserAvatar user={user} className='size-28 border-4 border-background text-2xl' /><div className='flex-1'><div className='flex items-center gap-2'><h1 className='text-3xl font-bold'>{user.name}</h1>{user.verificationStatus === 'verified' && <BadgeCheck className='text-emerald-500' />}</div><p className='mt-1 text-muted-foreground'>{user.title}</p></div><div className='flex gap-2'><Button onClick={() => connect.mutate()}><UserPlus />Connect</Button><Button variant='outline' onClick={() => message.mutate()}><MessageCircle />Message</Button></div></CardContent></Card>
    <div className='mt-6 grid gap-5 lg:grid-cols-[1fr_320px]'><div className='space-y-5'><Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>{user.about || 'No introduction has been added yet.'}</p></CardContent></Card><Card><CardHeader><CardTitle>Skills and interests</CardTitle></CardHeader><CardContent className='flex flex-wrap gap-2'>{skills.length ? skills.map((skill) => <Badge key={skill} variant='secondary'>{skill}</Badge>) : <p className='text-sm text-muted-foreground'>No skills listed.</p>}</CardContent></Card></div>
      <aside><Card><CardHeader><CardTitle>Professional context</CardTitle></CardHeader><CardContent className='space-y-4 text-sm'><Info icon={BriefcaseBusiness} text={user.company || 'Independent'} /><Info icon={MapPin} text={user.location || 'Location not shared'} /><Info icon={Globe} text={user.website || 'Website not shared'} /><div><p className='text-xs uppercase text-muted-foreground'>Availability</p><p className='mt-1 font-medium'>{user.availability}</p></div></CardContent></Card></aside></div>
  </PageContainer>
}
function Info({ icon: Icon, text }: { icon: typeof Globe; text: string }) { return <div className='flex items-center gap-2 text-muted-foreground'><Icon className='size-4' />{text}</div> }
