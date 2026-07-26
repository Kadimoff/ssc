import { useState } from 'react'
import { Bell, CheckCircle2, Eye, LockKeyhole, Save, Target } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { User } from '@/data/types'
import { useAction, useSnapshot } from '@/app/app-data'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsPage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to manage settings' />
  return <SettingsForm key={data.currentUser.id} user={data.currentUser} />
}

function SettingsForm({ user }: { user: User }) {
  const [email, setEmail] = useState(user.email), [availability, setAvailability] = useState(user.availability)
  const update = useAction(() => apiClient.updateProfile({ email, availability }), 'Settings saved')
  return <PageContainer><PageHeading eyebrow='Account' title='Settings' description='Control your account context, privacy defaults, and notification preferences.' /><div className='grid gap-5 lg:grid-cols-2'><Card><CardHeader><CardTitle>Account details</CardTitle><CardDescription>Information used for account and program communication.</CardDescription></CardHeader><CardContent className='space-y-4'><Label>Email<Input className='mt-2' type='email' value={email} onChange={(event) => setEmail(event.target.value)} /></Label><Label>Availability<Input className='mt-2' value={availability} onChange={(event) => setAvailability(event.target.value)} /></Label></CardContent><CardFooter><Button onClick={() => update.mutate()}><Save />Save changes</Button></CardFooter></Card><Card><CardHeader><CardTitle>Privacy defaults</CardTitle></CardHeader><CardContent className='space-y-3'><Setting icon={Eye} title='Profile visibility' text='Visible to authenticated community members.' /><Setting icon={Bell} title='Program notifications' text='Operational updates and direct invitations enabled.' /><Setting icon={LockKeyhole} title='Evidence visibility' text='Evidence remains scoped to authorized program roles.' /></CardContent></Card></div></PageContainer>
}

export function VerificationPage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view verification' />
  const user = data.currentUser
  return <PageContainer><PageHeading eyebrow='Trust and identity' title='Verification' description='Understand what has been verified, what remains pending, and how the decision is used.' /><div className='grid gap-5 md:grid-cols-3'><VerificationStep title='Account identity' status='verified' text='Email and account ownership confirmed for this environment.' /><VerificationStep title='Role authority' status={user.roles.some((role) => ['partner_admin', 'program_manager', 'platform_admin'].includes(role)) ? 'verified' : 'not required'} text='Required only for privileged partner and program operations.' /><VerificationStep title='Organization authority' status={user.verificationStatus} text='Reviewed separately from general profile identity.' /></div><Card className='mt-6'><CardHeader><CardTitle>Correction and appeal</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>If a verification status is incorrect, provide the minimum evidence needed to the program administrator. Rejected or suspended decisions must include a review note in production.</p></CardContent></Card></PageContainer>
}

export function GoalsPage() {
  const { data } = useSnapshot()
  const initial = JSON.parse(localStorage.getItem('ssc.goals.v1') ?? '[]') as Array<{ title: string; evidence: string; done: boolean }>
  const [goals, setGoals] = useState(initial), [title, setTitle] = useState(''), [evidence, setEvidence] = useState('')
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to manage goals' />
  const persist = (next: typeof goals) => { setGoals(next); localStorage.setItem('ssc.goals.v1', JSON.stringify(next)) }
  return <PageContainer><PageHeading eyebrow='Execution' title='Goals and evidence' description='Define the next decision or milestone and state what evidence will count as complete.' /><Card><CardContent className='grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]'><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Goal or milestone' /><Input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder='Evidence required' /><Button disabled={title.trim().length < 3} onClick={() => { persist([...goals, { title: title.trim(), evidence: evidence.trim(), done: false }]); setTitle(''); setEvidence('') }}><Target />Add goal</Button></CardContent></Card><div className='mt-5 space-y-3'>{goals.map((goal, index) => <Card key={`${goal.title}-${index}`}><CardContent className='flex items-center gap-4 p-4'><button onClick={() => persist(goals.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item))} className='text-primary'><CheckCircle2 className={goal.done ? 'fill-primary/20' : ''} /></button><div><b className={goal.done ? 'line-through opacity-60' : ''}>{goal.title}</b><p className='text-sm text-muted-foreground'>{goal.evidence || 'Evidence definition pending'}</p></div><Badge className='ml-auto' variant={goal.done ? 'default' : 'secondary'}>{goal.done ? 'Complete' : 'Open'}</Badge></CardContent></Card>)}</div></PageContainer>
}

function Setting({ icon: Icon, title, text }: { icon: typeof Eye; title: string; text: string }) { return <div className='flex gap-3 rounded-xl border p-4'><Icon className='mt-0.5 size-5 text-primary' /><div><b className='text-sm'>{title}</b><p className='mt-1 text-xs text-muted-foreground'>{text}</p></div></div> }
function VerificationStep({ title, status, text }: { title: string; status: string; text: string }) { return <Card><CardHeader><Badge className='w-fit' variant={status === 'verified' ? 'default' : 'secondary'}>{status.replace(/_/g, ' ')}</Badge><CardTitle className='pt-2 text-lg'>{title}</CardTitle></CardHeader><CardContent><p className='text-sm leading-6 text-muted-foreground'>{text}</p></CardContent></Card> }
