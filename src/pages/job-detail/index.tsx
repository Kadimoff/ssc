import { useParams } from '@tanstack/react-router'
import { Bookmark, BriefcaseBusiness, CheckCircle2, MapPin } from 'lucide-react'
import { apiClient } from '@/data/client'
import { useAction, useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageLoading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function JobDetailPage() {
  const { jobId } = useParams({ from: '/app/jobs/$jobId' })
  const { data } = useSnapshot()
  const apply = useAction(() => apiClient.toggleJob(jobId, 'applied'), 'Application status updated')
  const save = useAction(() => apiClient.toggleJob(jobId, 'saved'))
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view and apply' />
  const job = data.jobs.find((item) => item.id === jobId)
  if (!job) return <PageContainer><Card><CardContent className='py-20 text-center'>Opportunity not found.</CardContent></Card></PageContainer>
  return <PageContainer><div className='grid gap-6 lg:grid-cols-[1fr_320px]'><main><Card><CardHeader><div className='flex flex-wrap gap-2'>{job.featured && <Badge>Featured</Badge>}<Badge variant='secondary'>{job.type}</Badge></div><CardTitle className='mt-3 text-3xl'>{job.role}</CardTitle><p className='text-muted-foreground'>{job.company}</p></CardHeader><CardContent className='space-y-6'><div className='flex flex-wrap gap-4 text-sm text-muted-foreground'><span className='flex items-center gap-1'><MapPin className='size-4' />{job.location}</span><span className='flex items-center gap-1'><BriefcaseBusiness className='size-4' />{job.type}</span></div><section><h2 className='font-semibold'>About the opportunity</h2><p className='mt-2 leading-7 text-muted-foreground'>{job.description}</p></section><section><h2 className='font-semibold'>Skills</h2><div className='mt-2 flex flex-wrap gap-2'>{job.skills.split(',').map((skill) => <Badge key={skill} variant='outline'>{skill.trim()}</Badge>)}</div></section></CardContent><CardFooter className='border-t'><p className='text-xs text-muted-foreground'>Applications in demo mode remain on this device.</p></CardFooter></Card></main>
      <aside><Card className='sticky top-32'><CardHeader><CardTitle>Application</CardTitle></CardHeader><CardContent><Button className='w-full' variant={job.applied ? 'outline' : 'default'} onClick={() => apply.mutate()}>{job.applied ? <><CheckCircle2 />Application submitted</> : 'Submit application'}</Button><Button className='mt-2 w-full' variant='ghost' onClick={() => save.mutate()}><Bookmark className={job.saved ? 'fill-current text-primary' : ''} />{job.saved ? 'Saved' : 'Save opportunity'}</Button></CardContent></Card></aside></div></PageContainer>
}
