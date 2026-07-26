import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BadgeCheck, Building2, CircleHelp, MessagesSquare, Rocket, Settings, ShieldCheck, Target, Users } from 'lucide-react'
import { apiClient } from '@/data/client'
import type { User } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthRequired, PageLoading, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'

export function ProfilePage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view your profile' />
  const user = data.currentUser
  const skills = user.skills.split(',').map((skill) => skill.trim()).filter(Boolean)

  return <div className='app-container grid min-h-[calc(100svh-4rem)] lg:grid-cols-[240px_1fr]'>
    <aside className='hidden border-r py-8 pr-5 lg:flex lg:flex-col'>
      <div className='mb-7'><h2 className='text-xl font-bold'>Member workspace</h2><p className='mt-1 text-sm capitalize text-muted-foreground'>{user.activeRole.replace(/_/g, ' ')}</p></div>
      <nav className='space-y-2'>
        <div className='flex h-9 w-full items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium'><Users className='size-4' />Profile Status</div>
        <Button className='w-full justify-start' variant='ghost' asChild><Link to='/verification'><BadgeCheck />Verification</Link></Button>
        <Button className='w-full justify-start' variant='ghost' asChild><Link to='/goals'><Target />Goals</Link></Button>
        <Button className='w-full justify-start' variant='ghost' asChild><Link to='/settings'><Settings />Settings</Link></Button>
      </nav>
      <div className='mt-auto space-y-3 pt-8'><Button className='w-full' asChild><Link to='/startups/new'><Rocket />Create Startup</Link></Button><div className='grid grid-cols-2 gap-2'><Button variant='ghost' size='sm' asChild><Link to='/help'><CircleHelp />Help</Link></Button><Button variant='ghost' size='sm' asChild><Link to='/privacy'><ShieldCheck />Privacy</Link></Button></div></div>
    </aside>

    <main className='min-w-0 py-6 lg:pl-7'>
      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='space-y-6'>
          <Card className='relative overflow-hidden'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_35%)]' />
            <CardContent className='relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center'>
              <UserAvatar user={user} className='size-32 shrink-0 border-4 border-background text-3xl shadow-lg sm:size-36' />
              <div className='min-w-0 flex-1'><div className='flex flex-wrap items-center gap-3'><h1 className='text-3xl font-bold tracking-tight'>{user.name}</h1>{user.verificationStatus === 'verified' && <Badge className='gap-1 bg-emerald-500 text-white'><BadgeCheck className='size-3.5' />Verified profile</Badge>}</div><h2 className='mt-2 text-lg font-semibold text-muted-foreground'>{user.title}</h2><p className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'><Building2 className='size-4' />{user.company || user.location || 'Organization not added'}</p><div className='mt-6 flex flex-wrap gap-3'><Button asChild><Link to='/network'><Users />Browse network</Link></Button><Button variant='outline' asChild><Link to='/messages'><MessagesSquare />Message</Link></Button><EditProfile user={user} /></div></div>
            </CardContent>
          </Card>

          <section className='grid gap-4 md:grid-cols-2'>
            <Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>{user.about || 'Building institutional-grade products for the next generation of student entrepreneurs.'}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Verified Skills</CardTitle></CardHeader><CardContent className='flex flex-wrap gap-2'>{skills.map((skill, index) => <span key={skill} className='flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm'><b>{skill}</b><span className='rounded bg-background px-1.5 font-mono text-xs text-emerald-500'>{8 + index * 4}</span></span>)}</CardContent></Card>
          </section>

          <Card className='overflow-hidden'><CardHeader className='flex-row items-center justify-between border-b'><div><CardTitle>Venture workspace</CardTitle><CardDescription>Build a profile from evidence, milestones, and current needs.</CardDescription></div><Badge variant='secondary'>Member-owned</Badge></CardHeader><CardContent className='grid gap-6 p-6 md:grid-cols-[190px_1fr] md:items-center'><div className='grid h-32 place-items-center rounded-xl border bg-[linear-gradient(135deg,var(--muted),color-mix(in_oklch,var(--primary)_16%,var(--muted)))]'><Rocket className='size-12 text-primary' /></div><div><h3 className='text-2xl font-bold'>{user.activeRole === 'founder' ? 'Founder venture profile' : 'Explore or create a venture'}</h3><p className='mt-4 leading-6 text-muted-foreground'>Use the startup workspace to document the problem, current evidence, team, open roles, and next milestone without overstating progress.</p><Button variant='link' className='mt-3 px-0' asChild><Link to='/startups'>Open startup workspace <ArrowRight /></Link></Button></div></CardContent></Card>
        </div>

        <aside className='space-y-4'>
          <Card className='overflow-hidden border-primary/20 bg-primary text-primary-foreground'><CardHeader><CardTitle>Profile readiness</CardTitle></CardHeader><CardContent><div className='flex items-end gap-3'><strong className='text-5xl text-emerald-400'>88</strong><span className='pb-1 text-primary-foreground/70'>/ 100</span></div><ReadinessBar label='Profile context' value={92} /><ReadinessBar label='Evidence coverage' value={85} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Network Impact</CardTitle></CardHeader><CardContent className='grid grid-cols-2 gap-3'><ProfileStat value='412' label='Connections' /><ProfileStat value='2' label='Startups' /><div className='col-span-2'><ProfileStat value='14' label='Mentorship Sessions' /></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Profile Status</CardTitle><CardDescription>Complete the remaining trust signals.</CardDescription></CardHeader><CardContent><div className='flex justify-between text-sm'><span>Profile completeness</span><b>92%</b></div><div className='mt-2 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full w-[92%] rounded-full bg-emerald-500' /></div></CardContent></Card>
        </aside>
      </div>
    </main>
  </div>
}

function ReadinessBar({ label, value }: { label: string; value: number }) { return <div className='mt-6'><div className='mb-2 flex justify-between text-sm text-primary-foreground/80'><span>{label}</span><span>{value}%</span></div><div className='h-1.5 overflow-hidden rounded-full bg-primary-foreground/20'><div className='h-full rounded-full bg-emerald-400' style={{ width: `${value}%` }} /></div></div> }

function ProfileStat({ value, label }: { value: string; label: string }) { return <div className='rounded-xl border bg-muted/50 p-4 text-center'><strong className='block text-2xl'>{value}</strong><span className='mt-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>{label}</span></div> }

function EditProfile({ user }: { user: User }) { const [open, setOpen] = useState(false); const [title, setTitle] = useState(user.title); const [about, setAbout] = useState(user.about); const update = useAction(() => apiClient.updateProfile({ title, about }), 'Profile updated'); return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant='outline'>Edit profile</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Keep your professional context clear and current.</DialogDescription></DialogHeader><div className='grid gap-4'><Label>Title<Input className='mt-2' value={title} onChange={(event) => setTitle(event.target.value)} /></Label><Label>About<Textarea className='mt-2' value={about} onChange={(event) => setAbout(event.target.value)} /></Label><Button onClick={() => update.mutate(undefined, { onSuccess: () => setOpen(false) })}>Save changes</Button></div></DialogContent></Dialog> }
