import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import { usePageTransition, useScrollReveal } from '@/hooks/use-animations'
import { Bookmark, BrainCircuit, BriefcaseBusiness, ChevronRight, Flag, Info, MapPin, MessageCircle, Plus, Rocket, School, Search, ShieldCheck, Target, Users } from 'lucide-react'
import type { User } from '@/data/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeading, UserAvatar } from '@/app/app-shared'
import { startups as staticStartups } from '@/data/platform-content'
import { useSnapshot } from '@/app/app-data'

interface CreatedStartupDraft {
  name: string
  sector: string
  problem: string
  stage: string
  createdAt: string
}

function readLocalArray<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function StartupsPage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const [savedOnly, setSavedOnly] = useState(false)
  const [savedSlugs, setSavedSlugs] = useState<string[]>(() => readLocalArray<string>('ssc.savedStartups.v1'))
  const [drafts] = useState<CreatedStartupDraft[]>(() => readLocalArray<CreatedStartupDraft>('ssc.createdStartups.v1'))
  const startups = data?.startups?.length ? data.startups : staticStartups
  const visibleStartups = savedOnly ? startups.filter((startup) => savedSlugs.includes(startup.slug)) : startups
  const toggleSaved = (slug: string) => {
    const next = savedSlugs.includes(slug) ? savedSlugs.filter((item) => item !== slug) : [...savedSlugs, slug]
    setSavedSlugs(next)
    localStorage.setItem('ssc.savedStartups.v1', JSON.stringify(next))
  }
  return <PageContainer>
    <PageHeading eyebrow='Startup workspace' title='Discover teams and turn visible progress into trust.' description='Explore verified student startups, open roles, milestones and mentor-backed execution signals.' />
    <div className='mb-6 flex flex-wrap gap-3'><Button asChild><Link to='/startups/new'><Plus />Create startup</Link></Button><Button variant='outline' asChild><Link to='/jobs'><Search />Browse open roles</Link></Button><Button variant={savedOnly ? 'default' : 'outline'} onClick={() => setSavedOnly((value) => !value)}><Bookmark className={savedOnly ? 'fill-current' : ''} />Saved startups ({savedSlugs.length})</Button></div>
    {drafts.length > 0 && !savedOnly && <section className='mb-8'><div className='mb-3'><h2 className='text-xl font-bold'>Your local drafts</h2><p className='text-sm text-muted-foreground'>Saved in this browser until backend venture creation is connected.</p></div><div className='grid gap-4 md:grid-cols-2'>{drafts.map((draft) => <Card key={`${draft.name}-${draft.createdAt}`} className='border-dashed'><CardHeader><div className='flex items-center justify-between gap-3'><Badge variant='secondary'>Local draft</Badge><span className='text-xs text-muted-foreground'>{new Date(draft.createdAt).toLocaleDateString()}</span></div><CardTitle>{draft.name}</CardTitle><CardDescription>{draft.sector} · {draft.stage}</CardDescription></CardHeader><CardContent><p className='line-clamp-3 text-sm leading-6 text-muted-foreground'>{draft.problem}</p></CardContent><CardFooter><Button variant='outline' size='sm' asChild><Link to='/goals'>Add evidence goals</Link></Button></CardFooter></Card>)}</div></section>}
    {visibleStartups.length === 0 ? <Card className='border-dashed py-14 text-center'><CardContent><Bookmark className='mx-auto mb-3 size-9 text-muted-foreground' /><p className='font-semibold'>No saved startups yet</p><p className='mt-1 text-sm text-muted-foreground'>Switch back to all startups and save the teams you want to revisit.</p></CardContent></Card> : <div className='grid gap-5 lg:grid-cols-3'>{visibleStartups.map((startup) => <Card key={startup.name} className='overflow-hidden'>
      <CardHeader><div className='flex items-center justify-between'><Badge>{startup.stage}</Badge><div className='flex items-center gap-1'><span className='text-sm font-bold text-primary'>{startup.score}% ready</span><Button variant='ghost' size='icon' aria-label={savedSlugs.includes(startup.slug) ? `Remove ${startup.name} from saved startups` : `Save ${startup.name}`} onClick={() => toggleSaved(startup.slug)}><Bookmark className={savedSlugs.includes(startup.slug) ? 'fill-current text-primary' : ''} /></Button></div></div><CardTitle className='pt-3'>{startup.name}</CardTitle><CardDescription>{startup.sector}</CardDescription></CardHeader>
      <CardContent><p className='leading-6 text-muted-foreground'>{startup.summary}</p><div className='mt-5 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${startup.score}%` }} /></div></CardContent>
      <CardFooter className='justify-between border-t'><span className='text-sm text-muted-foreground'>{startup.roles}</span><Button variant='ghost' size='sm' onClick={() => navigate({ to: '/startups/$slug', params: { slug: startup.slug } })}>View startup <ChevronRight /></Button></CardFooter>
    </Card>)}</div>}
  </PageContainer>
}

export function StartupDetailPage() {
  const { slug } = useParams({ from: '/app/startups/$slug' })
  const { data } = useSnapshot()
  const startups = data?.startups?.length ? data.startups : staticStartups
  const startup = startups.find((s) => s.slug === slug)
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const location = useRouterState({ select: (state) => state.location.pathname })
  const [followed, setFollowed] = useState(() => readLocalArray<string>('ssc.savedStartups.v1').includes(slug))
  usePageTransition(pageRef, location)
  useScrollReveal(pageRef, { targets: '> [data-animate]', stagger: 0.1, y: 40 })
  if (!startup) return <PageContainer><Card className='border-dashed border-muted-foreground/20 py-16 text-center'><CardContent><Rocket className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>Startup not found</p><Button variant='outline' className='mt-4' onClick={() => navigate({ to: '/startups' })}>Back to startups</Button></CardContent></Card></PageContainer>
  return (
    <div ref={pageRef} className='app-container py-8 lg:py-10'>
      {/* Gradient background */}
      <div className='pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_60%)]' />

      {/* Header */}
      <section data-animate className='relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div className='flex items-center gap-6'>
          <div className='flex size-24 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/20 to-primary/5 shadow-2xl'>
            <Rocket className='size-10 text-primary' />
          </div>
          <div>
            <div className='mb-2 flex items-center gap-3'>
              <Badge variant='secondary' className='text-[10px] uppercase tracking-wider'>Startup workspace</Badge>
              <Badge className='gap-1 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase'><Rocket className='size-3' />{startup.sector}</Badge>
            </div>
            <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl'>{startup.name}</h1>
            <p className='mt-2 max-w-2xl text-lg text-muted-foreground'>{startup.summary}</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' className='gap-2' asChild><Link to='/messages'><MessageCircle className='size-4' />Contact</Link></Button>
          <Button variant={followed ? 'outline' : 'default'} className='gap-2 shadow-xs' onClick={() => { const stored = readLocalArray<string>('ssc.savedStartups.v1'); const next = followed ? stored.filter((item) => item !== slug) : [...new Set([...stored, slug])]; localStorage.setItem('ssc.savedStartups.v1', JSON.stringify(next)); setFollowed(!followed) }}><Bookmark className={followed ? 'fill-current' : ''} />{followed ? 'Following' : 'Follow'}</Button>
        </div>
      </section>

      {/* Bento Grid */}
      <div className='relative z-10 mt-8 grid gap-6 lg:grid-cols-12'>
        {/* Left column */}
        <div className='space-y-6 lg:col-span-8'>
          {/* About */}
          <Card data-animate className='overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 group'>
            <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'><Info className='size-5 text-primary' />About the Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='leading-relaxed text-muted-foreground'>{startup.fullDesc}</p>
              <div className='mt-5 flex flex-wrap gap-2'>
                {startup.sector.toLowerCase().includes('climate') && <>
                  <Badge variant='secondary' className='gap-1'><Target className='size-3' />IoT Integration</Badge>
                  <Badge variant='secondary' className='gap-1'><BrainCircuit className='size-3' />Predictive Analytics</Badge>
                </>}
                {startup.sector.toLowerCase().includes('edtech') && <>
                  <Badge variant='secondary' className='gap-1'><BrainCircuit className='size-3' />AI Assessment</Badge>
                  <Badge variant='secondary' className='gap-1'><School className='size-3' />Competency Framework</Badge>
                </>}
                {startup.sector.toLowerCase().includes('health') && <>
                  <Badge variant='secondary' className='gap-1'><ShieldCheck className='size-3' />HIPAA Compliant</Badge>
                  <Badge variant='secondary' className='gap-1'><BrainCircuit className='size-3' />Smart Routing</Badge>
                </>}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card data-animate className='overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 group'>
            <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg'><Flag className='size-5 text-primary' />Execution Milestones</CardTitle>
                <Badge variant='outline'>{startup.milestones.length} milestones</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='relative space-y-8 pl-4 before:absolute before:inset-y-0 before:left-[3px] before:w-px before:bg-border'>
                {startup.milestones.map((m) => (
                  <div key={m.title} className='relative group/milestone'>
                    <div className={cn(
                      'absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-background transition-transform group-hover/milestone:scale-125',
                      m.status === 'done' && 'bg-primary',
                      m.status === 'current' && 'border-2 border-primary bg-background animate-pulse',
                      m.status === 'future' && 'border-2 border-muted-foreground/30 bg-background'
                    )} />
                    <div className='mb-1 text-xs font-semibold uppercase tracking-wider text-primary'>{m.date}</div>
                    <h3 className='font-semibold'>{m.title}</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>{m.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card data-animate className='overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 group'>
            <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'><Users className='size-5 text-primary' />Core Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-3'>
                {startup.team.map((member) => (
                  <div key={member.name} className='flex flex-col items-center rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/20 hover:shadow-sm'>
                    <UserAvatar user={{ name: member.name } as User} className='size-16 ring-2 ring-border' />
                    <h4 className='mt-3 font-semibold'>{member.name}</h4>
                    <p className='text-xs text-primary'>{member.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className='space-y-6 lg:col-span-4'>
          {/* Status card */}
          <Card data-animate className='overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-[0_4px_30px_color-mix(in_oklch,var(--primary)_5%,transparent)]'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <Badge className='bg-primary/20 text-primary border-primary/30'>{startup.stage} Stage</Badge>
                <span className='text-lg font-bold text-primary'>{startup.score}% ready</span>
              </div>
              <div className='mt-5 h-2 overflow-hidden rounded-full bg-muted'>
                <div className='h-full animate-[progress-fill_1.5s_ease-out_forwards] rounded-full bg-primary shadow-[0_0_10px_color-mix(in_oklch,var(--primary)_50%,transparent)]' style={{ width: `${startup.score}%` }} />
              </div>
              <div className='mt-6 grid grid-cols-2 gap-4 border-t pt-4'>
                <div><p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Founded</p><p className='mt-1 font-semibold'>{startup.founded}</p></div>
                <div><p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Location</p><p className='mt-1 flex items-center gap-1 font-semibold'><MapPin className='size-3.5' />{startup.location}</p></div>
                <div className='col-span-2'><p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Backed By</p><div className='mt-1 flex gap-2'>{startup.backedBy.map((b) => <span key={b} className='rounded-md bg-muted px-2.5 py-1 text-sm font-medium'>{b}</span>)}</div></div>
              </div>
            </CardContent>
          </Card>

          {/* Open Roles */}
          <Card data-animate className='overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 group'>
            <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg'><BriefcaseBusiness className='size-5 text-primary' />Open Roles</CardTitle>
                <Badge variant='secondary'>{startup.openRoles.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {startup.openRoles.map((role) => (
                <button key={role.title} type='button' onClick={() => navigate({ to: '/jobs' })} className='group/role w-full rounded-lg border p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm'>
                  <div className='flex items-start justify-between'>
                    <div><h4 className='font-semibold group-hover/role:text-primary transition-colors'>{role.title}</h4><p className='text-xs text-muted-foreground'>{role.dept} · {role.type}</p></div>
                    <ChevronRight className='mt-0.5 size-4 text-muted-foreground opacity-0 transition-all group-hover/role:opacity-100 group-hover/role:translate-x-0.5' />
                  </div>
                  <div className='mt-3 flex gap-2'>{role.skills.map((s) => <span key={s} className='rounded border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground'>{s}</span>)}</div>
                </button>
              ))}
            </CardContent>
            <CardFooter className='justify-center border-t pt-4'>
              <Button variant='ghost' size='sm' className='gap-1 text-sm' asChild><Link to='/jobs'>View all careers <ChevronRight className='size-3' /></Link></Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className='relative z-10 mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row'>
        <p className='font-semibold text-foreground/60'>{startup.name} Ecosystem</p>
        <nav className='flex gap-6'><Link className='transition-colors hover:text-foreground' to='/privacy'>Privacy Policy</Link><Link className='transition-colors hover:text-foreground' to='/terms'>Terms of Service</Link></nav>
        <p className='text-xs'>© 2026 {startup.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
