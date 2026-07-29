import { useState } from 'react'
import { BadgeCheck, Building2, FileBarChart, FileSignature, Handshake, Plus, Scale, Target } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/data/client'
import type { AgreementStatus, OrganizationType } from '@/data/types'
import { useAction, useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DemoDataBadge, StatusBadge as ExecutionStatusBadge } from '@/components/execution-primitives'
import { PilotInquiryDialog } from '@/components/landing/pilot-inquiry-dialog'
import { businessPackages } from '@/config/business-model'

const statusTone: Record<string, string> = {
  verified: 'bg-emerald-500/10 text-emerald-600', active: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-amber-500/10 text-amber-600', pending_signature: 'bg-amber-500/10 text-amber-600',
  draft: 'bg-sky-500/10 text-sky-600', prospect: 'bg-violet-500/10 text-violet-600',
  onboarding: 'bg-blue-500/10 text-blue-600',
}
const readable = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase())

export function PartnershipsPage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to operate partnerships' />
  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Illustrative partner operations' /></div>
    <div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
      <PageHeading eyebrow='Partnership operating system' title='Turn partner promises into verified outcomes.' description='Register organizations, govern agreements, record contributions, and preserve an audit trail for every joint program.' />
      <CreateOrganizationDialog />
    </div>
    <div className='mb-5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200'>
      All named external organizations and commitments on this screen are illustrative demo data—not claimed partnerships or impact.
    </div>
    <Card className='mb-6 border-primary/20 bg-primary/[0.025]'><CardHeader><div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'><div><CardTitle>Institutional deployment path</CardTitle><CardDescription className='mt-1 max-w-2xl'>SSC is free for students and founders. Institutions fund verification, program operations, governance, reporting and implementation support.</CardDescription></div><div className='flex flex-wrap gap-2'><PilotInquiryDialog /><Button variant='outline' asChild><a href={`${import.meta.env.BASE_URL}#business-model`}>Compare public packages</a></Button></div></div></CardHeader><CardContent className='grid gap-3 sm:grid-cols-3'>{businessPackages.filter((plan) => ['institutional-pilot', 'campus-platform', 'program-operations'].includes(plan.id)).map((plan) => <div key={plan.id} className='rounded-xl border bg-background/50 p-4'><div className='flex items-start justify-between gap-2'><b className='text-sm'>{plan.publicLabel}</b><Badge variant='outline'>{plan.publicPrice}</Badge></div><p className='mt-2 text-xs leading-5 text-muted-foreground'>{plan.description}</p></div>)}</CardContent></Card>
    <div className='mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <Metric icon={Building2} label='Organizations' value={data.organizations.length} detail={`${data.organizations.filter((item) => item.verificationStatus === 'verified').length} verified`} />
      <Metric icon={FileSignature} label='Agreements' value={data.agreements.length} detail={`${data.agreements.filter((item) => item.status === 'active').length} active`} />
      <Metric icon={Handshake} label='Joint programs' value={data.programs.length} detail={`${data.programPartners.length} partner roles`} />
      <Metric icon={BadgeCheck} label='Contributions' value={data.contributions.length} detail={`${data.contributions.filter((item) => item.verificationStatus === 'verified').length} verified`} />
    </div>
    <Card className='mb-6 border-primary/20'><CardHeader><div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'><div><CardTitle>University outcome dashboard</CardTitle><CardDescription>Operational coverage across commitments, delivery, evidence, and verified outcomes.</CardDescription></div><Badge variant='outline'>Pilot reporting view</Badge></div></CardHeader><CardContent className='grid gap-3 sm:grid-cols-4'><OutcomeMetric label='Commitment delivery' value={`${Math.round((data.contributions.filter((item) => item.verificationStatus === 'verified').length / Math.max(1, data.contributions.length)) * 100)}%`} /><OutcomeMetric label='Evidence coverage' value={`${data.evidenceArtifacts.length} records`} /><OutcomeMetric label='Verified outcomes' value={String(data.outcomes.filter((item) => item.verificationStatus === 'verified').length)} /><OutcomeMetric label='Active agreements' value={String(data.agreements.filter((item) => item.status === 'active').length)} /></CardContent></Card>
    <Tabs defaultValue='organizations'>
      <TabsList className='mb-5 flex h-auto w-full flex-wrap justify-start'>
        <TabsTrigger value='organizations'>Organizations</TabsTrigger><TabsTrigger value='agreements'>Agreements</TabsTrigger>
        <TabsTrigger value='contributions'>Contributions</TabsTrigger><TabsTrigger value='outcomes'>Outcomes</TabsTrigger><TabsTrigger value='audit'>Audit log</TabsTrigger><TabsTrigger value='report'>Report preview</TabsTrigger>
      </TabsList>
      <TabsContent value='organizations'><div className='grid gap-4 lg:grid-cols-2'>{data.organizations.map((organization) => <Card key={organization.id}>
        <CardHeader><div className='flex items-start justify-between gap-3'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Building2 /></span><div className='flex flex-wrap justify-end gap-1.5'><StatusBadge value={organization.verificationStatus} /><StatusBadge value={organization.partnershipStatus} /></div></div><CardTitle className='pt-2'>{organization.displayName}</CardTitle><CardDescription>{readable(organization.type)} · {organization.countryCode}</CardDescription></CardHeader>
        <CardContent><p className='mb-4 text-sm leading-6 text-muted-foreground'>{organization.summary}</p><div className='flex flex-wrap gap-1.5'>{organization.contributionAreas.map((area) => <Badge key={area} variant='outline'>{area}</Badge>)}</div>
          {organization.verificationStatus !== 'verified' && <Button className='mt-4' size='sm' variant='outline' onClick={() => mutate(() => apiClient.verifyOrganization(organization.id, 'verified'), `${organization.displayName} verified`)}><BadgeCheck />Verify demo record</Button>}
        </CardContent>
      </Card>)}</div></TabsContent>
      <TabsContent value='agreements'><div className='space-y-4'>{data.agreements.map((agreement) => {
        const parties = data.agreementParties.filter((party) => party.agreementId === agreement.id).map((party) => data.organizations.find((organization) => organization.id === party.organizationId)?.displayName).filter(Boolean)
        return <Card key={agreement.id}><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><Badge variant='outline'>{readable(agreement.type)}</Badge><StatusBadge value={agreement.status} /></div><CardTitle>{agreement.title}</CardTitle><CardDescription>{parties.join(' + ') || 'No parties assigned'} · {agreement.startsAt} → {agreement.endsAt}</CardDescription></CardHeader><CardContent className='grid gap-5 md:grid-cols-2'><AgreementList title='Intended outcomes' items={agreement.intendedOutcomes} /><AgreementList title='Resource commitments' items={agreement.resourceCommitments} /><div className='md:col-span-2'><AgreementActions id={agreement.id} status={agreement.status} /></div></CardContent></Card>
      })}</div></TabsContent>
      <TabsContent value='contributions'><div className='space-y-3'>{data.contributions.map((contribution) => {
        const organization = data.organizations.find((item) => item.id === contribution.organizationId)
        const program = data.programs.find((item) => item.id === contribution.programId)
        return <Card key={contribution.id}><CardContent className='flex flex-col gap-4 p-5 md:flex-row md:items-center'><span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Handshake /></span><div className='min-w-0 flex-1'><div className='flex flex-wrap items-center gap-2'><b>{organization?.displayName}</b><StatusBadge value={contribution.verificationStatus} /></div><p className='mt-1 text-sm text-muted-foreground'>{program?.name} · {readable(contribution.type)}</p><p className='mt-2 text-sm'>{contribution.quantity} {contribution.unit} — {contribution.description}</p></div>{contribution.verificationStatus === 'pending' && <Button size='sm' onClick={() => mutate(() => apiClient.verifyContribution(contribution.id, 'verified'), 'Contribution verified')}><BadgeCheck />Verify</Button>}</CardContent></Card>
      })}</div></TabsContent>
      <TabsContent value='outcomes'><div className='space-y-3'>{data.outcomes.map((outcome) => <Card key={outcome.id}><CardContent className='grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_140px_120px] md:items-center'><div><div className='flex items-center gap-2'><Target className='size-5 text-primary' /><b>{readable(outcome.type)}</b></div><p className='mt-2 text-sm text-muted-foreground'>Attribution: {readable(outcome.attributionMode)} · {outcome.evidenceIds.length} evidence record{outcome.evidenceIds.length === 1 ? '' : 's'}</p></div><div><p className='text-xs text-muted-foreground'>Confidence</p><b>{Math.max(0, Math.min(100, outcome.confidenceScore))}%</b></div><ExecutionStatusBadge status={outcome.verificationStatus} /></CardContent></Card>)}</div></TabsContent>
      <TabsContent value='audit'><Card><CardHeader><CardTitle>Audit trail</CardTitle><CardDescription>Every partnership mutation records who changed what and when.</CardDescription></CardHeader><CardContent className='space-y-1'>{data.auditLogs.map((log) => <div key={log.id} className='grid gap-1 border-b py-3 text-sm md:grid-cols-[180px_220px_1fr]'><time className='text-muted-foreground'>{new Date(log.createdAt).toLocaleString()}</time><code className='text-xs text-primary'>{log.action}</code><span>{log.summary}</span></div>)}</CardContent></Card></TabsContent>
      <TabsContent value='report'><Card><CardHeader><div className='flex items-center gap-3'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><FileBarChart /></span><div><CardTitle>Partner delivery and outcomes report</CardTitle><CardDescription>Preview of the operational report—not social engagement or promotional reach.</CardDescription></div></div></CardHeader><CardContent><div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'><OutcomeMetric label='Agreements governed' value={String(data.agreements.length)} /><OutcomeMetric label='Commitments recorded' value={String(data.contributions.length)} /><OutcomeMetric label='Evidence artifacts' value={String(data.evidenceArtifacts.length)} /><OutcomeMetric label='Outcomes verified' value={String(data.outcomes.filter((item) => item.verificationStatus === 'verified').length)} /></div><div className='mt-5 rounded-xl border bg-muted/20 p-4'><b className='text-sm'>Reporting boundary</b><p className='mt-2 text-sm leading-6 text-muted-foreground'>Counts are derived from current illustrative workspace records. Attribution modes and confidence are displayed explicitly; no follower, impression, or popularity metrics are included.</p></div></CardContent></Card></TabsContent>
    </Tabs>
  </PageContainer>
}

async function mutate(action: () => Promise<unknown>, message: string) {
  try { await action(); toast.success(message); window.location.reload() }
  catch (error) { toast.error(error instanceof Error ? error.message : 'Action failed') }
}
function Metric({ icon: Icon, label, value, detail }: { icon: typeof Building2; label: string; value: number; detail: string }) {
  return <Card><CardContent className='flex items-center gap-4 p-5'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Icon /></span><div><p className='text-sm text-muted-foreground'>{label}</p><b className='text-2xl'>{value}</b><span className='ml-2 text-xs text-muted-foreground'>{detail}</span></div></CardContent></Card>
}
function OutcomeMetric({ label, value }: { label: string; value: string }) { return <div className='rounded-xl border bg-muted/20 p-4'><p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p><b className='mt-2 block text-xl'>{value}</b></div> }
function StatusBadge({ value }: { value: string }) { return <Badge className={statusTone[value] ?? 'bg-muted text-muted-foreground'} variant='secondary'>{readable(value)}</Badge> }
function AgreementList({ title, items }: { title: string; items: string[] }) { return <div><b className='text-sm'>{title}</b><ul className='mt-2 space-y-1 text-sm text-muted-foreground'>{items.map((item) => <li key={item}>• {item}</li>)}</ul></div> }
function AgreementActions({ id, status }: { id: string; status: AgreementStatus }) {
  const target = ({ draft: 'pending_signature', pending_signature: 'active', active: 'expired' } as Partial<Record<AgreementStatus, AgreementStatus>>)[status]
  return target ? <Button size='sm' variant='outline' onClick={() => mutate(() => apiClient.transitionAgreement(id, target), `Agreement moved to ${readable(target)}`)}><Scale />Move to {readable(target)}</Button> : <span className='text-xs text-muted-foreground'>This agreement has reached a terminal state.</span>
}
function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [summary, setSummary] = useState(''), [areas, setAreas] = useState('Student recruitment, Mentors')
  const [type, setType] = useState<OrganizationType>('university')
  const create = useAction(() => apiClient.createOrganization({
    type, legalName: name.trim(), displayName: name.trim(), slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    summary: summary.trim() || 'Illustrative organization added in demo mode.', countryCode: 'AZ', websiteUrl: '', verificationStatus: 'pending',
    partnershipStatus: 'prospect', contributionAreas: areas.split(',').map((item) => item.trim()).filter(Boolean), contacts: [],
  }), 'Organization added')
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus />Add organization</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Register a partner organization</DialogTitle><DialogDescription>Creates an illustrative, pending-verification partner record in demo mode.</DialogDescription></DialogHeader><div className='space-y-3'><Input value={name} onChange={(event) => setName(event.target.value)} placeholder='Organization name' /><select value={type} onChange={(event) => setType(event.target.value as OrganizationType)} className='h-10 w-full rounded-md border bg-background px-3 text-sm'>{['university', 'student_community', 'company', 'accelerator', 'sponsor', 'investor_network', 'ngo', 'public_body'].map((value) => <option key={value} value={value}>{readable(value)}</option>)}</select><Textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder='Why this partnership matters' /><Input value={areas} onChange={(event) => setAreas(event.target.value)} placeholder='Contribution areas, comma separated' /><Button className='w-full' disabled={name.trim().length < 2 || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: () => { setOpen(false); setName(''); setSummary('') } })}>Create pending record</Button></div></DialogContent></Dialog>
}
