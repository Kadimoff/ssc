import { useState } from 'react'
import { BadgeCheck, CalendarDays, Handshake, Plus, Rocket, Target, Users } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { ContributionType, ProgramType } from '@/data/types'
import { useAction, useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { canAccess } from '@/app/access-policy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const readable = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export function ProgramsPage() {
  const { data } = useSnapshot()
  const [query, setQuery] = useState('')
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view joint programs' />
  const programs = data.programs.filter((program) => `${program.name} ${program.description}`.toLowerCase().includes(query.toLowerCase()))
  return <PageContainer>
    <div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
      <PageHeading eyebrow='Joint programs' title='One workspace for every partner-led cohort.' description='Define roles before launch, track delivery against commitments, and connect every reported outcome to evidence.' />
      {canAccess(data.currentUser, 'partnerships') && <div className='flex gap-2'><ContributionDialog /><CreateProgramDialog /></div>}
    </div>
    <div className='mb-5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200'>Program names, participants, commitments, and results shown here are illustrative demo records.</div>
    <div className='mb-6 grid gap-4 sm:grid-cols-3'>
      <Signal icon={Rocket} label='Programs' value={data.programs.length} />
      <Signal icon={Users} label='Cohorts' value={data.cohorts.length} />
      <Signal icon={BadgeCheck} label='Verified outcomes' value={data.outcomes.filter((item) => item.verificationStatus === 'verified').length} />
    </div>
    <Input className='mb-5 max-w-md' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search joint programs...' />
    <div className='space-y-5'>{programs.map((program) => {
      const host = data.organizations.find((organization) => organization.id === program.hostOrganizationId)
      const partnerRows = data.programPartners.filter((partner) => partner.programId === program.id)
      const cohorts = data.cohorts.filter((cohort) => cohort.programId === program.id)
      const contributions = data.contributions.filter((item) => item.programId === program.id)
      return <Card key={program.id}>
        <CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><div className='flex gap-2'><Badge><Rocket className='size-3' />{readable(program.type)}</Badge><Badge variant='outline'>{readable(program.status)}</Badge></div><span className='text-xs text-muted-foreground'>{program.startsAt} → {program.endsAt}</span></div><CardTitle className='pt-2'>{program.name}</CardTitle><CardDescription>{program.description}</CardDescription></CardHeader>
        <CardContent className='grid gap-6 lg:grid-cols-3'>
          <section><h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'><Handshake className='size-4 text-primary' />Partner roles</h3><div className='space-y-2'>{partnerRows.map((partner) => {
            const organization = data.organizations.find((item) => item.id === partner.organizationId)
            return <div key={partner.id} className='rounded-lg border p-3'><b className='text-sm'>{organization?.displayName}</b><p className='text-xs text-primary'>{readable(partner.role)}</p><p className='mt-1 text-xs text-muted-foreground'>{partner.commitmentSummary}</p></div>
          })}<p className='text-xs text-muted-foreground'>Host: {host?.displayName}</p></div></section>
          <section><h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'><CalendarDays className='size-4 text-primary' />Cohorts & milestones</h3>{cohorts.map((cohort) => <div key={cohort.id} className='mb-2 rounded-lg border p-3'><div className='flex justify-between gap-2'><b className='text-sm'>{cohort.name}</b><Badge variant='secondary'>{readable(cohort.status)}</Badge></div><p className='mt-1 text-xs text-muted-foreground'>Capacity {cohort.capacity}</p></div>)}<div className='mt-3 flex flex-wrap gap-1'>{program.milestoneLabels.map((item) => <Badge key={item} variant='outline'>{item}</Badge>)}</div></section>
          <section><h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'><Target className='size-4 text-primary' />Contributions</h3>{contributions.map((item) => <div key={item.id} className='mb-2 rounded-lg border p-3'><div className='flex justify-between gap-2'><b className='text-sm'>{readable(item.type)}</b><Badge variant={item.verificationStatus === 'verified' ? 'default' : 'secondary'}>{readable(item.verificationStatus)}</Badge></div><p className='mt-1 text-xs text-muted-foreground'>{item.quantity} {item.unit} · {item.description}</p></div>)}</section>
        </CardContent>
      </Card>
    })}</div>
  </PageContainer>
}

function Signal({ icon: Icon, label, value }: { icon: typeof Rocket; label: string; value: number }) { return <Card><CardContent className='flex items-center gap-3 p-5'><Icon className='text-primary' /><div><p className='text-xs text-muted-foreground'>{label}</p><b className='text-2xl'>{value}</b></div></CardContent></Card> }

function CreateProgramDialog() {
  const { data } = useSnapshot()
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [description, setDescription] = useState('')
  const [type, setType] = useState<ProgramType>('sprint')
  const hostOrganizationId = data?.organizations[0]?.id ?? ''
  const create = useAction(() => apiClient.createProgram({
    name: name.trim(), type, status: 'draft', hostOrganizationId, description: description.trim(),
    startsAt: '2026-09-01', endsAt: '2026-11-30', eligibilityRules: ['Verified participant'],
    milestoneLabels: ['Team formed', 'Problem validated', 'Prototype evidenced'],
    outcomesFramework: ['team_formed', 'mvp_completed'],
  }), 'Joint program created')
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus />New program</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create a joint program</DialogTitle><DialogDescription>Start in draft so partner roles and evidence rules can be agreed before launch.</DialogDescription></DialogHeader><div className='space-y-3'><Input value={name} onChange={(event) => setName(event.target.value)} placeholder='Program name' /><select className='h-10 w-full rounded-md border bg-background px-3 text-sm' value={type} onChange={(event) => setType(event.target.value as ProgramType)}>{['accelerator', 'challenge', 'sprint', 'demo_day', 'mentor_series', 'incubator_prep'].map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder='Program purpose and scope' /><Button className='w-full' disabled={name.trim().length < 3 || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: () => { setOpen(false); setName(''); setDescription('') } })}>Create draft program</Button></div></DialogContent></Dialog>
}

function ContributionDialog() {
  const { data } = useSnapshot()
  const [open, setOpen] = useState(false), [quantity, setQuantity] = useState('10'), [unit, setUnit] = useState('hours'), [description, setDescription] = useState('')
  const [type, setType] = useState<ContributionType>('mentors')
  const programId = data?.programs[0]?.id ?? '', organizationId = data?.organizations[1]?.id ?? ''
  const create = useAction(() => apiClient.recordContribution({
    programId, organizationId, type, quantity: Math.max(0, Number(quantity)), unit, description,
    evidenceIds: [],
  }), 'Contribution recorded for verification')
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant='outline'><Handshake />Record contribution</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Record partner contribution</DialogTitle><DialogDescription>This creates a pending record; a verifier must approve it before reporting.</DialogDescription></DialogHeader><div className='space-y-3'><select className='h-10 w-full rounded-md border bg-background px-3 text-sm' value={type} onChange={(event) => setType(event.target.value as ContributionType)}>{['mentors', 'students', 'challenge', 'funding', 'credits', 'space', 'judging', 'pilot_access', 'marketing'].map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select><div className='grid grid-cols-2 gap-3'><Input type='number' min='0' value={quantity} onChange={(event) => setQuantity(event.target.value)} /><Input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder='Unit' /></div><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder='What was committed or delivered?' /><Button className='w-full' disabled={!programId || !organizationId || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: () => { setOpen(false); setDescription('') } })}>Record pending contribution</Button></div></DialogContent></Dialog>
}
