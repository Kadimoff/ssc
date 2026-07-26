import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useStaggerCards, useBookmarkAnimation } from '@/hooks/use-animations'
import { Bookmark } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { Job } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'
import { MatchWorkbench } from '@/features/assistant/match-workbench'

export function JobsPage() {
  const { data } = useSnapshot(); const [query, setQuery] = useState(''); const jobsRef = useRef<HTMLDivElement>(null)
  useStaggerCards(jobsRef, [data, query])
  if (!data) return <PageLoading />
  const jobs = data.jobs.filter((job) => `${job.role} ${job.company} ${job.skills}`.toLowerCase().includes(query.toLowerCase()))
  return <PageContainer><PageHeading eyebrow='Opportunities' title='Work worth doing, with people worth meeting.' description='Roles, projects and collaborations curated from the community.' /><MatchWorkbench snapshot={data} mode='opportunity' /><Input className='mb-6 max-w-xl' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search roles, companies or skills' /><div ref={jobsRef} className='grid gap-4'>{jobs.map((job) => <div key={job.id} data-card><JobCard job={job} /></div>)}</div></PageContainer>
}

function JobCard({ job }: { job: Job }) { const save = useAction(() => apiClient.toggleJob(job.id, 'saved')); const saveRef = useRef<HTMLButtonElement>(null); const bookmarkAnim = useBookmarkAnimation(); const handleSave = () => { if (saveRef.current) bookmarkAnim(saveRef.current); save.mutate() }; return <Card className='md:flex-row md:items-center'><CardHeader className='flex-1'><div className='mb-2 flex gap-2'>{job.featured && <Badge>Featured</Badge>}<Badge variant='secondary'>{job.type}</Badge></div><CardTitle>{job.role}</CardTitle><CardDescription>{job.company} · {job.location}</CardDescription><p className='pt-2 text-sm text-muted-foreground'>{job.skills}</p></CardHeader><CardFooter className='gap-2 md:pt-6'><Button asChild><Link to='/jobs/$jobId' params={{ jobId: job.id }}>{job.applied ? 'View application' : 'View and apply'}</Link></Button><Button ref={saveRef} variant='outline' size='icon' onClick={handleSave} className={job.saved ? 'text-primary' : ''}><Bookmark className={job.saved ? 'fill-current' : ''} /></Button></CardFooter></Card> }
