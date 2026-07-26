import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Rocket } from 'lucide-react'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'
import { apiClient } from '@/data/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function StartupCreatePage() {
  const { data } = useSnapshot()
  const navigate = useNavigate()
  const [name, setName] = useState(''), [sector, setSector] = useState(''), [problem, setProblem] = useState(''), [stage, setStage] = useState('Idea')
  const slug = name.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const create = useAction(() => apiClient.createStartup({
    slug,
    name: name.trim(), sector: sector.trim(), stage: stage as 'Idea' | 'Validating' | 'MVP' | 'Pilot' | 'Revenue',
    readinessScore: 0, summary: problem.trim().slice(0, 1000), fullDescription: problem.trim(),
    founded: String(new Date().getFullYear()), location: data?.currentUser?.location ?? '',
    verificationStatus: 'pending', status: 'draft',
  }), 'Startup draft created')
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to create a startup profile' />
  return <PageContainer><PageHeading eyebrow='Startup builder' title='Create a credible venture profile.' description='Start with the problem, current evidence, and the next milestone—not an inflated valuation or vanity metric.' /><Card className='mx-auto max-w-3xl'><CardHeader><CardTitle className='flex items-center gap-2'><Rocket className='text-primary' />Venture baseline</CardTitle></CardHeader><CardContent className='grid gap-5'><Label>Startup name<Input className='mt-2' value={name} onChange={(event) => setName(event.target.value)} /></Label><div className='grid gap-4 sm:grid-cols-2'><Label>Sector<Input className='mt-2' value={sector} onChange={(event) => setSector(event.target.value)} placeholder='ClimateTech, EdTech…' /></Label><Label>Stage<select className='mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm' value={stage} onChange={(event) => setStage(event.target.value)}>{['Idea', 'Validating', 'MVP', 'Pilot', 'Revenue'].map((item) => <option key={item}>{item}</option>)}</select></Label></div><Label>Problem and current evidence<Textarea className='mt-2 min-h-32' value={problem} onChange={(event) => setProblem(event.target.value)} placeholder='Who experiences the problem, what evidence do you have, and what remains uncertain?' /></Label></CardContent><CardFooter className='justify-end border-t'><Button disabled={create.isPending || name.trim().length < 2 || sector.trim().length < 2 || problem.trim().length < 20} onClick={() => create.mutate(undefined, { onSuccess: () => navigate({ to: '/startups/$slug', params: { slug } }) })}>{create.isPending ? 'Creating…' : 'Create and match team'}</Button></CardFooter></Card></PageContainer>
}
