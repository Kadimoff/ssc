import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import {
  usePageTransition, useScrollReveal, useStaggerCards, useBubbleEntrance, useLikeAnimation, useBookmarkAnimation,
  useHeroEntrance, useCounterAnimation, useMagneticHover,
  useRevealCards, useMarquee, useTiltCards,
} from '@/hooks/use-animations'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(useGSAP)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowRight, BadgeCheck, Bell, Bookmark, BrainCircuit, BriefcaseBusiness, CalendarDays, Camera, CameraOff, Check, CircleDollarSign, CircleHelp, ClipboardCheck,
  ChevronRight, Flag, GraduationCap, Hand, HandCoins, Hash, Heart, Home, Info,
  Lightbulb, Link2, LogOut, MapPin, Menu, MessageCircle, MessagesSquare, Mic, MicOff, Monitor, Moon,
  LayoutDashboard, MoreHorizontal, Network, Newspaper, Phone, Plus, Rocket, School, Search, Send,
  Settings, Share2, ShieldCheck, Sparkles, Sun, Target, TrendingUp, Trophy, UserPlus, Users, Video, X,
  ArrowDown, ArrowUp, Gauge, Pause, Play, RefreshCw,
} from 'lucide-react'
import { apiClient, runtimeMode } from '@/data/client'
import {
  ecosystemMetrics, ecosystemPillars, eventItems, featuredMembers, newsItems,
  universityWordmarks, type EcosystemIcon,
} from '@/data/landing-content'
import type { Job, PostKind, PostLink, Snapshot, User } from '@/data/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FounderCardsSection } from '@/components/landing/founder-cards'
import { HeroStats } from '@/components/landing/hero-stats'
import { Donut, Funnel, Sparkline, BarList } from '@/components/investor/charts'
import { MotionRocket } from '@/components/motion-rocket'


const snapshotKey = ['snapshot'] as const
const navItems = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/startups', label: 'Startups', icon: Rocket },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/mentorship', label: 'Mentorship', icon: GraduationCap },
  { to: '/programs', label: 'Programs', icon: CalendarDays },
  { to: '/live', label: 'Live', icon: Video },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/investors', label: 'Investors', icon: CircleDollarSign },
  { to: '/rankings', label: 'Rankings', icon: Trophy },
] as const
const workspaceItems = [
  { to: '/profile', label: 'My Profile', description: 'Founder identity and readiness', icon: Users },
  { to: '/messages', label: 'Messages', description: 'Mentors, teams and investors', icon: MessagesSquare },
  { to: '/notifications', label: 'Notifications', description: 'Requests, feedback and alerts', icon: Bell },
  { to: '/communities', label: 'Communities', description: 'Founder groups and discussions', icon: Network },
  { to: '/jobs', label: 'Opportunities', description: 'Roles, projects and referrals', icon: BriefcaseBusiness },
] as const

function useSnapshot() {
  return useQuery({ queryKey: snapshotKey, queryFn: () => apiClient.snapshot() })
}

function useAction(action: () => Promise<unknown>, success?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: action,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: snapshotKey }); if (success) toast.success(success) },
    onError: (error: Error) => toast.error(error.message),
  })
}

function UserAvatar({ user, className }: { user?: User | null; className?: string }) {
  const name = user?.name || 'Student Startup Community'
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase()
  return <Avatar className={cn('size-10 border border-primary/15', className)}><AvatarFallback className='bg-primary/10 font-semibold text-primary'>{initials}</AvatarFallback></Avatar>
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  return <Button variant='ghost' size='icon' aria-label='Toggle theme' onClick={() => { document.documentElement.classList.toggle('dark'); setDark(!dark) }}>{dark ? <Sun /> : <Moon />}</Button>
}

export function AppShell() {
  const { data } = useSnapshot()
  const location = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const logout = useAction(() => apiClient.logout(), 'Signed out')
  const me = data?.currentUser
  const mainRef = useRef<HTMLDivElement>(null)
  usePageTransition(mainRef, location)

  // Mobile menu slide animation
  useEffect(() => {
    if (!mobileMenuRef.current) return
    if (mobileOpen) {
      gsap.fromTo(mobileMenuRef.current, { opacity: 0, y: -10, height: 0 }, { opacity: 1, y: 0, height: 'auto', duration: 0.25, ease: 'power2.out' })
    }
  }, [mobileOpen])

  return <div className='relative isolate min-h-svh'>
    <header className='glass-header sticky top-0 z-40 border-b'>
      <div className='app-container flex h-16 items-center gap-3'>
        <nav className='nav-bar hidden xl:flex'>{navItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}</nav>
        <label className='ml-auto hidden min-w-44 max-w-xs flex-1 items-center gap-2 rounded-lg border bg-muted/50 px-3 2xl:flex'><Search className='size-4 text-muted-foreground' /><input className='h-9 min-w-0 flex-1 bg-transparent text-sm outline-none' placeholder='Search workspace' /></label>
        <div className='ml-auto flex items-center gap-1 md:ml-0'>
          <Badge variant='outline' className='hidden text-[10px] uppercase sm:flex'>{runtimeMode}</Badge>
          <ThemeToggle />
          <LetsStart />
          <Button variant='ghost' size='icon' aria-label='Notifications' asChild><Link to='/notifications'><Bell /></Link></Button>
          {me ? <>
            <Button variant='ghost' className='hidden gap-2 sm:flex' onClick={() => navigate({ to: '/profile' })}><UserAvatar user={me} className='size-7' /><span className='max-w-24 truncate'>{me.name.split(' ')[0]}</span></Button>
            <Button variant='ghost' size='icon' aria-label='Sign out' onClick={() => logout.mutate()}><LogOut /></Button>
          </> : <Button size='sm' onClick={() => navigate({ to: '/sign-in' })}>Sign in</Button>}
          <Button variant='ghost' size='icon' className='xl:hidden' aria-label='Open navigation' onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</Button>
        </div>
      </div>
      <nav aria-label='Quick access' className='app-container hidden h-11 items-center gap-4 overflow-x-auto border-t md:flex'>
        <span className='mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Jump to</span>
        <div className='flex items-center gap-0.5'>{workspaceItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-pill', location === to && 'nav-pill-active')}><Icon className='size-3.5' />{label}{to === '/notifications' && <span className='size-1.5 rounded-full bg-emerald-500' />}</Link>)}</div>
      </nav>
      {mobileOpen && <nav ref={mobileMenuRef} className='app-container grid max-h-[75svh] gap-1 overflow-y-auto border-t py-3 xl:hidden'>{navItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}<p className='mt-2 border-t px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>Quick access</p>{workspaceItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}</nav>}
    </header>
    <main ref={mainRef} className='relative z-10 pb-20 xl:pb-0'><Outlet /></main>
    <nav className='glass-header fixed inset-x-0 bottom-0 z-40 grid grid-cols-8 border-t px-1 py-1 xl:hidden'>{navItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-mobile-link', location === to && 'nav-mobile-active')}><Icon className='size-5' />{label}</Link>)}</nav>
  </div>
}

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  useHeroEntrance(heroRef)

  return <div className='relative isolate min-h-svh overflow-hidden'>
    {/* ---- NAV ---- */}
    <header className='glass-header fixed inset-x-0 top-0 z-50'>
      <div className='app-container flex h-[72px] items-center gap-2'>
        <nav aria-label='Landing page sections' className='ml-auto hidden items-center gap-1 lg:flex'>
          <a className='nav-link' href='#ecosystem'>Ecosystem</a>
          <a className='nav-link' href='#members'>Members</a>
          <a className='nav-link' href='#founder-cards'>Founders</a>
          <a className='nav-link' href='#updates'>Updates</a>
        </nav>
        <div className='ml-auto flex items-center gap-2 lg:ml-6'>
          <ThemeToggle />
          <Button variant='ghost' size='sm' asChild><Link to='/sign-in'>Sign in</Link></Button>
          <Button size='sm' asChild><Link to='/sign-up'>Get started</Link></Button>
        </div>
      </div>
    </header>

    {/* ---- HERO ---- */}
    <section ref={heroRef} data-landing-section='hero' className='relative z-10 min-h-svh'>
      <div className='app-container grid min-h-svh items-center gap-16 pt-24 pb-16 lg:grid-cols-[1.08fr_.92fr]'>
        <div className='relative'>
          <div data-hero-badge className='mb-8 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur shadow-xs'>
            <span className='size-2 rounded-full bg-primary animate-pulse' />
            Professional momentum, without the noise
          </div>
          <h1 className='text-5xl font-extrabold leading-[1.05] tracking-[-.04em] sm:text-6xl lg:text-7xl xl:text-8xl'>
            <span data-hero-line className='block'>The network for</span>
            <span data-hero-line className='animated-gradient-text block'>student builders</span>
          </h1>
          <p data-hero-subtitle className='mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl'>
            Share meaningful work, meet aligned collaborators, and discover opportunities — all in one focused professional community.
          </p>
          <div data-hero-buttons className='mt-10 flex flex-wrap gap-3'>
            <span className='hero-button-float'>
              <Button size='lg' className='premium-explore-cta group gap-2 overflow-hidden text-[15px]' asChild>
                <Link to='/feed'>Explore the community <ArrowRight className='transition-transform group-hover:translate-x-0.5' /></Link>
              </Button>
            </span>
            <span className='hero-button-float hero-button-float-delayed'>
              <Button size='lg' variant='outline' className='text-[15px]' asChild>
                <Link to='/sign-up'>Create your profile <Sparkles /></Link>
              </Button>
            </span>
          </div>
          <div data-hero-metrics className='mt-14 grid max-w-xl grid-cols-3 gap-6 border-t pt-7'>
            <Metric value='1,200+' label='Student builders' />
            <Metric value='18' label='Universities' />
            <Metric value='45+' label='Active mentors' />
          </div>
        </div>

        <div data-hero-card className='relative hidden items-center justify-center md:flex'>
          <div className='absolute -inset-16 -z-10 rounded-full bg-primary/8 blur-[120px]' />
          <HeroStats />
        </div>
      </div>
    </section>

    <EcosystemSection />
    <FounderCardsSection />
    <MembersSection />
    <UpdatesSection />
    <UniversitySection />
    <LandingCallToAction />
    <LandingFooter />
  </div>
}

/* ---- Helpers ---- */
function Metric({ value, label }: { value: string; label: string }) {
  return <div><strong className='text-2xl font-extrabold tracking-tight'>{value}</strong><p className='mt-1 text-sm text-muted-foreground'>{label}</p></div>
}

/* ---- Ecosystem Icons Map ---- */
const ecosystemIcons = {
  investors: HandCoins,
  incubation: Rocket,
  mentors: GraduationCap,
  ecosystem: Network,
  students: Lightbulb,
  universities: School,
} satisfies Record<EcosystemIcon, typeof Users>

/* ---- Section Heading ---- */
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className='mx-auto max-w-3xl text-center'>
    <Badge variant='secondary' className='px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase'>{eyebrow}</Badge>
    <h2 className='mt-6 text-3xl font-bold tracking-[-.025em] text-balance sm:text-4xl lg:text-5xl'>{title}</h2>
    <p className='mt-5 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground'>{description}</p>
  </div>
}

/* ---- Ecosystem ---- */
function EcosystemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollReveal(sectionRef, { targets: '> .app-container > [data-animate]', stagger: 0.05 })
  useCounterAnimation(sectionRef, '[data-counter]')
  useTiltCards(sectionRef, '[data-tilt]', { maxTilt: 5 })

  return <section ref={sectionRef} id='ecosystem' data-landing-section='ecosystem' className='relative z-10 scroll-mt-20 py-24 sm:py-32'>
    <div className='app-container'>
      <SectionHeading
        eyebrow='The SSC ecosystem'
        title='One community, an entire startup ecosystem.'
        description='SSC connects the relationships, knowledge and environments student founders need to move from curiosity to real progress.'
      />
      <div data-animate className='mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-sm sm:grid-cols-3 lg:grid-cols-5'>
        {ecosystemMetrics.map((metric, index) => (
          <div key={metric.label} className='ecosystem-metric-float relative bg-card p-6 text-center sm:p-8' style={{ animationDelay: `${index * -0.45}s` }}>
            <div className='absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent' />
            <strong data-counter className='text-2xl font-extrabold text-primary sm:text-3xl'>{metric.value}</strong>
            <p className='mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>{metric.label}</p>
          </div>
        ))}
      </div>
      <div data-animate className='mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {ecosystemPillars.map((pillar, index) => {
          const Icon = ecosystemIcons[pillar.icon]
          return (
            <div key={pillar.title} className='ecosystem-card-float' style={{ animationDelay: `${index * -0.55}s` }}>
              <Card data-tilt className='group relative h-full overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 [transform-style:preserve-3d]'>
                <div className='pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                <CardHeader>
                  <span className='mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25'>
                    <Icon size={20} />
                  </span>
                  <CardTitle className='text-lg'>{pillar.title}</CardTitle>
                  <CardDescription className='leading-6'>{pillar.description}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  </section>
}

/* data-landing-section='founder-cards' is implemented in components/landing/founder-cards. */
/* ---- Members ---- */
function MembersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [selectedMember, setSelectedMember] = useState<(typeof featuredMembers)[number] | null>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  useScrollReveal(sectionRef, { targets: '> .app-container > [data-animate]' })

  useEffect(() => {
    const element = rail.current
    if (!element || paused || selectedMember || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let previousTime = performance.now()
    const loopPoint = element.scrollWidth / 2
    if (element.scrollLeft < 1 && loopPoint > 0) element.scrollLeft = loopPoint

    const move = (time: number) => {
      const elapsed = Math.min(time - previousTime, 50)
      previousTime = time
      element.scrollLeft -= elapsed * 0.05
      if (element.scrollLeft <= 0.5) element.scrollLeft += loopPoint
      if (element.scrollLeft > loopPoint + 1) element.scrollLeft -= loopPoint
      frame = window.requestAnimationFrame(move)
    }

    frame = window.requestAnimationFrame(move)
    return () => window.cancelAnimationFrame(frame)
  }, [paused, selectedMember])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setPaused(true)
    drag.current.moved = false
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    drag.current = { active: true, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const distance = event.clientX - drag.current.startX
    if (Math.abs(distance) > 5) drag.current.moved = true
    event.currentTarget.scrollLeft = drag.current.startScroll - distance
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.active && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    drag.current.active = false
    window.setTimeout(() => setPaused(false), 700)
  }

  return <section ref={sectionRef} id='members' data-landing-section='members' className='relative z-10 scroll-mt-20 py-24 sm:py-32'>
    <div className='app-container'>
      <div data-animate className='max-w-2xl'>
        <div className='max-w-2xl'>
          <Badge variant='secondary' className='px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase'>People of SSC</Badge>
          <h2 className='mt-5 text-3xl font-bold tracking-[-.025em] sm:text-5xl'>Meet the builders behind the momentum.</h2>
          <p className='mt-5 text-lg leading-8 text-muted-foreground'>Students from different universities and disciplines, connected by the ambition to build something useful.</p>
        </div>
      </div>
    </div>
    <div ref={rail} tabIndex={0} aria-label='Featured SSC members'
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}
      className='landing-carousel mt-12 flex w-full gap-6 overflow-x-auto py-2 focus-visible:ring-2 focus-visible:ring-ring'
    >
      {[...featuredMembers, ...featuredMembers].map((member, index) => <MemberCard key={`${member.name}-${index}`} member={member} onView={() => { if (!drag.current.moved) setSelectedMember(member) }} />)}
    </div>
    <Dialog open={Boolean(selectedMember)} onOpenChange={(open) => { if (!open) setSelectedMember(null) }}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Member profile</DialogTitle>
          <DialogDescription>Meet a builder from the SSC community.</DialogDescription>
        </DialogHeader>
        {selectedMember && <MemberProfile member={selectedMember} />}
      </DialogContent>
    </Dialog>
  </section>
}

function MemberCard({ member, onView }: { member: (typeof featuredMembers)[number]; onView: () => void }) {
  return <article className='w-[190px] shrink-0 px-2 py-3 text-center'>
    <Avatar className='mx-auto size-16 border-2 border-background/80 shadow-md transition-transform duration-300 hover:scale-105'>
      <AvatarImage src={member.avatarUrl} alt={`${member.name} profile`} loading='lazy' />
      <AvatarFallback className='bg-primary/10 text-base font-bold text-primary'>{member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</AvatarFallback>
    </Avatar>
    <h3 className='mt-3 truncate text-sm font-semibold'>{member.name}</h3>
    <p className='mt-0.5 truncate text-xs text-muted-foreground'>{member.role}</p>
    <div className='mt-2 flex h-5 justify-center gap-1 overflow-hidden'>{member.skills.slice(0, 2).map((skill) => <Badge key={skill} variant='secondary' className='px-1.5 py-0 text-[9px]'>{skill}</Badge>)}</div>
    <Button type='button' variant='link' size='sm' className='mt-1 h-7 px-1 text-xs' onClick={onView}>View profile <ChevronRight className='size-3' /></Button>
  </article>
}

function MemberProfile({ member }: { member: (typeof featuredMembers)[number] }) {
  return <div className='pt-2 text-center'>
    <Avatar className='mx-auto size-28 border-4 border-background shadow-xl'>
      <AvatarImage src={member.avatarUrl} alt={`${member.name} profile`} />
      <AvatarFallback className='bg-primary/10 text-2xl font-bold text-primary'>{member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</AvatarFallback>
    </Avatar>
    <h3 className='mt-4 text-2xl font-bold'>{member.name}</h3>
    <p className='mt-1 text-muted-foreground'>{member.role}</p>
    <p className='mx-auto mt-5 flex max-w-md items-start justify-center gap-2 text-sm'><School className='mt-0.5 size-4 shrink-0 text-primary' />{member.university}</p>
    <div className='mt-5 flex flex-wrap justify-center gap-2'>{member.skills.map((skill) => <Badge key={skill} variant='secondary'>{skill}</Badge>)}</div>
    <div className='mt-6 grid grid-cols-2 gap-3 text-left'><ProfileInfo label='Startup focus' value={member.focus} /><ProfileInfo label='Current stage' value={member.stage} /></div>
  </div>
}

/* ---- Updates ---- */
function UpdatesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [newsStart, setNewsStart] = useState(0)
  const [newsFading, setNewsFading] = useState(false)
  useRevealCards(sectionRef, '> .app-container [data-reveal]', { stagger: 0.12 })

  useEffect(() => {
    let fadeTimer = 0
    let swapTimer = 0
    const rotate = () => {
      fadeTimer = window.setTimeout(() => {
        setNewsFading(true)
        swapTimer = window.setTimeout(() => {
          setNewsStart((current) => (current + 1) % newsItems.length)
          setNewsFading(false)
          rotate()
        }, 400)
      }, 4_600)
    }
    rotate()
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(swapTimer) }
  }, [])

  const visibleNews = [newsItems[newsStart], newsItems[(newsStart + 1) % newsItems.length]]

  return <section ref={sectionRef} id='updates' data-landing-section='updates' className='relative z-10 scroll-mt-20 py-24 sm:py-32'>
    <div className='app-container'>
      <div className='updates-heading-float'>
        <SectionHeading
          eyebrow='What is happening'
          title='Ideas, opportunities and moments that move the community.'
          description='Follow the progress of student teams and find the next room worth being in.'
        />
      </div>
      <div className='mt-14 grid items-stretch gap-10 lg:grid-cols-2'>
        <div className='flex h-full flex-col'>
          <div className='updates-column-heading mb-6 flex items-center gap-2'>
            <span className='grid size-8 place-items-center rounded-lg bg-primary/10 text-primary'><Newspaper size={16} /></span>
            <h3 className='text-xl font-semibold'>Latest news</h3>
          </div>
          <div className={cn('news-rotation-grid grid flex-1 auto-rows-fr gap-4', newsFading && 'is-fading')}>
            {visibleNews.map((item) => (
              <Card key={`${newsStart}-${item.title}`} data-reveal className='news-rotate-card group relative h-full overflow-hidden transition-all duration-300 hover:shadow-md'>
                <div className='absolute top-0 left-0 h-full w-0.5 bg-primary/20 transition-all duration-300 group-hover:bg-primary' />
                <CardHeader>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Badge variant='outline' className='text-[10px]'>{item.category}</Badge>
                    <span>{item.date}</span>
                  </div>
                  <CardTitle className='pt-2 text-xl'>{item.title}</CardTitle>
                  <CardDescription className='leading-6'>{item.summary}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant='link' className='gap-1 px-0 text-[13px]' onClick={() => toast.info('Full news pages will be available soon.')}>
                    Read update <ChevronRight size={14} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <div className='flex h-full flex-col'>
          <div className='updates-column-heading mb-6 flex items-center gap-2'>
            <span className='grid size-8 place-items-center rounded-lg bg-primary/10 text-primary'><CalendarDays size={16} /></span>
            <h3 className='text-xl font-semibold'>Upcoming events</h3>
          </div>
          <div className='grid flex-1 auto-rows-fr gap-4'>
            {eventItems.map((event, i) => (
              <Card key={event.title} data-reveal className='group relative flex h-full flex-row items-stretch gap-0 overflow-hidden p-0 transition-all duration-300 hover:shadow-md' style={{ transitionDelay: `${i * 80}ms` }}>
                <div className='grid w-28 shrink-0 place-items-center rounded-l-xl bg-gradient-to-b from-primary/15 to-primary/5 p-4 text-center text-primary'>
                  <div>
                    <b className='block text-3xl font-extrabold tracking-tight'>{event.day}</b>
                    <span className='text-[10px] font-bold tracking-[.2em] uppercase'>{event.month}</span>
                  </div>
                </div>
                <CardContent className='flex flex-1 flex-col justify-center p-5'>
                  <div className='mb-2 flex flex-wrap gap-3 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'><CalendarDays size={12} />{event.time}</span>
                    <span className='flex items-center gap-1'><MapPin size={12} />{event.location}</span>
                  </div>
                  <h4 className='font-semibold'>{event.title}</h4>
                  <p className='mt-1 text-sm text-muted-foreground'>{event.format}</p>
                </CardContent>
                <Button variant='ghost' size='icon' className='my-auto mr-4 shrink-0' aria-label={`View ${event.title}`} onClick={() => toast.info('Event registration will be available soon.')}>
                  <ChevronRight />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
}

/* ---- Universities ---- */
function UniversitySection() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollReveal(sectionRef, { targets: '> .app-container > [data-animate]' })
  useMarquee(sectionRef, '[data-marquee]', { speed: 25 })

  return <section ref={sectionRef} data-landing-section='universities' className='relative z-10 py-24 sm:py-28'>
    <div className='app-container text-center'>
      <p data-animate className='text-sm font-semibold uppercase tracking-[.2em] text-muted-foreground'>A growing student network across universities</p>
      <div data-animate className='relative mt-10 overflow-hidden'>
        <div data-marquee className='flex gap-4'>
          {[...universityWordmarks, ...universityWordmarks].map((name, i) => (
            <span key={`${name}-${i}`} className='shrink-0 rounded-xl border bg-card px-6 py-3.5 text-sm font-semibold text-muted-foreground shadow-xs transition-colors hover:border-primary/20 hover:text-foreground'>
              {name}
            </span>
          ))}
        </div>
      </div>
      <p data-animate className='mx-auto mt-8 max-w-2xl text-xs text-muted-foreground'>Demo ecosystem representation. Institution names do not imply a formal partnership.</p>
    </div>
  </section>
}

/* ---- CTA ---- */
function LandingCallToAction() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollReveal(sectionRef, { targets: '> [data-animate] > [data-animate]' })
  useMagneticHover(sectionRef, '[data-magnetic]')

  return <section ref={sectionRef} data-landing-section='cta' className='app-container relative z-10 pb-24 pt-8'>
    <div data-animate className='relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-[oklch(.53_.17_165)] to-[oklch(.48_.16_135)] px-8 py-20 text-center text-primary-foreground sm:px-16 sm:py-24'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,.2),transparent_50%)]' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(1_0_0/.08),transparent_40%)]' />
      <div className='pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-white/[0.06] blur-[80px]' />
      <div className='pointer-events-none absolute -bottom-32 -left-32 size-64 rounded-full bg-white/[0.04] blur-[70px]' />

      <div className='relative mx-auto max-w-2xl'>
        <Badge data-animate className='bg-white/15 text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-white/15 px-4 py-1.5'>
          Your next step
        </Badge>
        <h2 data-animate className='mt-7 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance'>
          Build your place in the startup ecosystem.
        </h2>
        <p data-animate className='mt-5 text-lg leading-8 text-white/75'>
          Meet teammates, learn from mentors and turn your first evidence into real momentum.
        </p>
        <div data-animate className='mt-10 flex flex-wrap justify-center gap-4'>
          <Button size='lg' variant='secondary' className='gap-2 shadow-xl' asChild>
            <Link data-magnetic to='/sign-up'>Join SSC <ArrowRight /></Link>
          </Button>
          <Button size='lg' className='border border-white/25 bg-transparent text-white shadow-xs backdrop-blur hover:bg-white/10' asChild>
            <Link data-magnetic to='/feed'>Explore the community</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
}

/* ---- Footer ---- */
function LandingFooter() {
  return <footer data-landing-section='footer' className='relative z-10'>
    <div className='app-container flex flex-col gap-6 py-12 text-sm text-muted-foreground sm:flex-row sm:items-center'>
      <p className='sm:ml-auto'>A demo platform for the next generation of student builders.</p>
      <div className='flex gap-4'>
        <a href='#ecosystem' className='transition-colors hover:text-foreground'>Ecosystem</a>
        <a href='#members' className='transition-colors hover:text-foreground'>Members</a>
        <a href='#updates' className='transition-colors hover:text-foreground'>Updates</a>
      </div>
    </div>
  </footer>
}

/* ------------------------------------------------------------------ */
/*  Feed — kind metadata, composer, post card, rails                  */
/* ------------------------------------------------------------------ */

type FeedFilter = 'all' | 'following' | 'milestone' | 'hiring' | 'launch' | 'update'

const KIND_META: Record<PostKind, { label: string; icon: typeof Heart; badge: string; grad: string; dot: string }> = {
  update: { label: 'Update', icon: Sparkles, badge: 'bg-primary/10 text-primary border-primary/25', grad: 'from-primary/20 via-primary/5 to-transparent', dot: 'bg-primary' },
  milestone: { label: 'Milestone', icon: Trophy, badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', grad: 'from-emerald-500/25 via-emerald-500/5 to-transparent', dot: 'bg-emerald-500' },
  raise: { label: 'Raise', icon: CircleDollarSign, badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30', grad: 'from-amber-500/25 via-amber-500/5 to-transparent', dot: 'bg-amber-500' },
  hiring: { label: 'Hiring', icon: BriefcaseBusiness, badge: 'bg-sky-500/15 text-sky-500 border-sky-500/30', grad: 'from-sky-500/25 via-sky-500/5 to-transparent', dot: 'bg-sky-500' },
  launch: { label: 'Launch', icon: Rocket, badge: 'bg-violet-500/15 text-violet-500 border-violet-500/30', grad: 'from-violet-500/25 via-violet-500/5 to-transparent', dot: 'bg-violet-500' },
  question: { label: 'Question', icon: CircleHelp, badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30', grad: 'from-amber-500/20 via-amber-500/5 to-transparent', dot: 'bg-amber-500' },
}

function postKind(post: Snapshot['posts'][number]): PostKind {
  const fromType = post.type?.toLowerCase()
  const map: Record<string, PostKind> = { update: 'update', milestone: 'milestone', raise: 'raise', hiring: 'hiring', launch: 'launch', question: 'question' }
  return post.kind ?? map[fromType ?? ''] ?? 'update'
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FeedPage() {
  const { data } = useSnapshot()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const feedRef = useRef<HTMLDivElement>(null)
  useStaggerCards(feedRef, [data, filter])
  if (!data) return <PageLoading />
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const kinds: PostKind[] = ['update', 'milestone', 'hiring', 'launch']

  const filtered = data.posts.filter((post) => {
    const k = postKind(post)
    if (filter === 'all') return true
    if (filter === 'following') return me ? connectedIds.has(post.authorId) || post.authorId === me.id : false
    return k === filter
  })

  const chips: { key: FeedFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: data.posts.length },
    { key: 'following', label: 'Following', count: me ? data.posts.filter((p) => connectedIds.has(p.authorId) || p.authorId === me.id).length : 0 },
    ...kinds.map((k) => ({ key: k as FeedFilter, label: KIND_META[k].label + 's', count: data.posts.filter((p) => postKind(p) === k).length })),
  ]

  return <PageContainer className='grid gap-6 xl:grid-cols-[260px_minmax(0,650px)_300px]'>
    <FeedLeftRail data={data} />
    <section ref={feedRef} className='min-w-0 space-y-4'>
      <FeedComposer me={me} />
      <div className='flex flex-wrap gap-2'>
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              filter === chip.key
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/25',
            )}
          >
            {chip.label}
            <span className={cn('rounded-full px-1.5 text-[10px]', filter === chip.key ? 'bg-primary/20' : 'bg-muted')}>{chip.count}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card className='border-dashed border-muted-foreground/25 py-16 text-center'>
          <CardContent><MessagesSquare className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No posts in this view</p><p className='mt-1 text-sm text-muted-foreground'>Try another filter or publish an update.</p></CardContent>
        </Card>
      ) : filtered.map((post) => <div key={post.id} data-card><PostCard post={post} data={data} /></div>)}
    </section>
    <FeedRightRail data={data} />
  </PageContainer>
}

function FeedComposer({ me }: { me: Snapshot['currentUser'] }) {
  const [content, setContent] = useState('')
  const [kind, setKind] = useState<PostKind>('update')
  const [tags, setTags] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [expanded, setExpanded] = useState(false)
  const parsedTags = tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
  const link: PostLink | undefined = linkTitle.trim() ? { title: linkTitle.trim(), subtitle: linkUrl.trim() || 'External link', url: linkUrl.trim() || '#' } : undefined
  const create = useAction(() => apiClient.createPost(content, { kind, tags: parsedTags, link }), 'Update published')
  const reset = () => { setContent(''); setTags(''); setLinkTitle(''); setLinkUrl(''); setKind('update'); setExpanded(false) }
  const Icon = KIND_META[kind].icon
  return (
    <Card className='glass-card overflow-hidden p-0'>
      <div className={cn('h-0.5 bg-gradient-to-r', KIND_META[kind].grad)} />
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          <UserAvatar user={me} />
          <div className='min-w-0 flex-1'>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder={me ? 'Share a milestone, raise, launch, hiring note, or ask for feedback…' : 'Sign in to share with the community'}
              disabled={!me}
              className='min-h-[56px] resize-none bg-transparent shadow-none focus-visible:ring-0 border-0 px-0 text-[15px]'
            />
            {expanded && (
              <div className='mt-2 space-y-2'>
                <div className='flex flex-wrap gap-1.5'>
                  {(Object.keys(KIND_META) as PostKind[]).map((k) => {
                    const M = KIND_META[k]
                    const active = kind === k
                    return (
                      <button key={k} type='button' onClick={() => setKind(k)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all', active ? M.badge : 'border-border text-muted-foreground hover:text-foreground')}>
                        <M.icon className='size-3.5' /> {M.label}
                      </button>
                    )
                  })}
                </div>
                <div className='grid gap-2 sm:grid-cols-2'>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder='Tags, comma-separated (climate, mvp)' className='h-9 bg-muted/40 text-sm' />
                  <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder='Link URL (optional)' className='h-9 bg-muted/40 text-sm' />
                </div>
                <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder='Link preview title (optional)' className='h-9 bg-muted/40 text-sm' />
              </div>
            )}
          </div>
        </div>
        <div className='mt-3 flex items-center gap-2 border-t pt-3'>
          <Badge variant='outline' className={cn('gap-1', KIND_META[kind].badge)}><Icon className='size-3.5' /> {KIND_META[kind].label}</Badge>
          {parsedTags.length > 0 && parsedTags.slice(0, 3).map((t) => <Badge key={t} variant='secondary' className='gap-1 text-[10px]'><Hash className='size-3' />{t}</Badge>)}
          <Button className='ml-auto gap-1.5' size='sm' disabled={!me || !content.trim() || create.isPending} onClick={() => create.mutate(undefined, { onSuccess: reset })}>
            <Send className='size-4' /> Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PostCard({ post, data }: { post: Snapshot['posts'][number]; data: Snapshot }) {
  const author = data.users.find((user) => user.id === post.authorId)
  const react = useAction(() => apiClient.togglePost(post.id, 'liked'))
  const save = useAction(() => apiClient.togglePost(post.id, 'saved'))
  const repost = useAction(() => apiClient.repost(post.id))
  const remove = useAction(() => apiClient.deletePost(post.id), 'Post removed')
  const [showThread, setShowThread] = useState(false)
  const kind = postKind(post)
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const tags = post.tags ?? []
  return (
    <Card className='group overflow-hidden border-primary/5 transition-all duration-300 hover:border-primary/20 hover:shadow-md'>
      <div className={cn('h-0.5 bg-gradient-to-r opacity-70 transition-opacity duration-300 group-hover:opacity-100', meta.grad)} />
      <CardHeader className='flex-row items-start gap-3 pb-2'>
        <UserAvatar user={author} className='ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/15' />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <CardTitle className='text-[15px] tracking-tight'>{author?.name}</CardTitle>
            <Badge variant='outline' className={cn('gap-1 border text-[10px] font-semibold uppercase tracking-wider', meta.badge)}><Icon className='size-3' />{meta.label}</Badge>
          </div>
          <CardDescription className='flex items-center gap-1.5 text-xs'>
            <span className='truncate'>{author?.title}</span>
            <span className='text-[10px]'>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </CardDescription>
        </div>
        {data.currentUser?.role === 'admin' && <Button className='ml-auto' variant='ghost' size='icon' onClick={() => remove.mutate()} aria-label='Delete post'><MoreHorizontal /></Button>}
      </CardHeader>
      <CardContent>
        <p className='whitespace-pre-wrap text-[15px] leading-relaxed text-balance'>{post.content}</p>
        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {tags.map((tag) => <span key={tag} className='inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground'><Hash className='size-2.5' />{tag}</span>)}
          </div>
        )}
        {(post.link || post.previewTitle) && (
          <a href={post.link?.url ?? '#'} onClick={(e) => e.preventDefault()} className='mt-4 block overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-sm' >
            <div className={cn('mb-3 h-1 w-12 rounded-full bg-gradient-to-r', meta.grad)} />
            <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'><Link2 className='size-3.5' />{post.link?.url ?? 'ssc.community'}</div>
            <h3 className='mt-2 font-semibold tracking-tight'>{post.link?.title ?? post.previewTitle}</h3>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{post.link?.subtitle ?? post.previewSubtitle}</p>
          </a>
        )}
        <div className='mt-4 flex gap-5 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1.5'><Heart className={cn('size-3.5', post.liked && 'text-primary')} /> {post.reactions}</span>
          <span className='flex items-center gap-1.5'><MessageCircle className='size-3.5' /> {post.comments}</span>
          <span className='flex items-center gap-1.5'><Share2 className='size-3.5' /> {post.reposts}</span>
        </div>
      </CardContent>
      <CardFooter className='grid grid-cols-4 border-t px-1 pt-1'>
        <PostAction active={post.liked} icon={Heart} label='Like' onClick={() => react.mutate()} />
        <PostAction icon={MessageCircle} label='Comment' onClick={() => setShowThread((v) => !v)} />
        <PostAction icon={Share2} label='Repost' onClick={() => repost.mutate()} />
        <PostAction active={post.saved} icon={Bookmark} label='Save' onClick={() => save.mutate()} />
      </CardFooter>
      {showThread && <CommentThread post={post} data={data} />}
    </Card>
  )
}

function CommentThread({ post, data }: { post: Snapshot['posts'][number]; data: Snapshot }) {
  const me = data.currentUser
  const [text, setText] = useState('')
  const add = useAction(() => apiClient.addComment(post.id, text), undefined)
  const comments = post.commentsList ?? []
  return (
    <div className='space-y-3 border-t bg-muted/20 p-4'>
      {comments.map((c) => {
        const author = data.users.find((u) => u.id === c.authorId)
        return (
          <div key={c.id} className='flex gap-2.5'>
            <UserAvatar user={author} className='size-8' />
            <div className='min-w-0 flex-1 rounded-xl bg-card px-3 py-2 shadow-sm'>
              <div className='flex items-center gap-1.5 text-xs'><b className='truncate'>{author?.name ?? 'Member'}</b><span className='text-muted-foreground'>· {timeAgo(c.createdAt)}</span></div>
              <p className='mt-0.5 text-sm text-foreground'>{c.text}</p>
            </div>
          </div>
        )
      })}
      {me ? (
        <form className='flex items-center gap-2' onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; add.mutate(undefined, { onSuccess: () => setText('') }) }}>
          <UserAvatar user={me} className='size-8' />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='Add a constructive reply…' className='h-9 bg-card' />
          <Button type='submit' size='icon' disabled={!text.trim() || add.isPending} aria-label='Send comment'><Send className='size-4' /></Button>
        </form>
      ) : <p className='text-xs text-muted-foreground'>Sign in to reply.</p>}
    </div>
  )
}

function FeedLeftRail({ data }: { data: Snapshot }) {
  const me = data.currentUser
  const completion = me ? Math.min(100, 45 + (me.skills ? 15 : 0) + (me.about ? 15 : 0) + (me.website ? 10 : 0) + (me.company ? 15 : 0)) : 0
  const steps = ['Add your startup', 'Book a mentor session', 'Publish your first update']
  const [done, setDone] = useState<boolean[]>([false, false, false])
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-14 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
        <CardContent className='px-5 pb-5 text-center'>
          <UserAvatar user={me} className='mx-auto -mt-8 size-16 border-4 border-card' />
          <div className='mt-3 flex items-center justify-center gap-1.5'>
            <h3 className='font-semibold'>{me?.name ?? 'Join SSC'}</h3>
            {me && <BadgeCheck className='size-4 text-primary' aria-label='Verified student' />}
          </div>
          <p className='mt-0.5 text-xs text-muted-foreground'>{me?.title ?? 'Build your founder identity'}</p>
          <div className='mt-4'>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground'><span>Profile completion</span><span className='font-semibold text-foreground'>{completion}%</span></div>
            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--primary)_55%,var(--accent))]' style={{ width: `${completion}%` }} /></div>
          </div>
          {me && <Button variant='outline' size='sm' className='mt-4 w-full' asChild><Link to='/profile'>View profile</Link></Button>}
        </CardContent>
      </Card>
      <Card className='glass-card overflow-hidden p-0'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold'><ClipboardCheck className='size-4 text-primary' /> Next steps</div>
          <ul className='space-y-1'>
            {steps.map((step, i) => (
              <li key={step}>
                <button onClick={() => setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))} className='flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-muted/60'>
                  <span className={cn('grid size-4 shrink-0 place-items-center rounded-full border', done[i] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40')}>
                    {done[i] && <Check className='size-3' />}
                  </span>
                  <span className={cn(done[i] && 'text-muted-foreground line-through')}>{step}</span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className='overflow-hidden border-primary/5 p-0'>
        <CardContent className='grid gap-1 p-3'>
          <SideLink icon={Bookmark}>Saved posts</SideLink>
          <SideLink icon={Users}>My communities</SideLink>
          <SideLink icon={CalendarDays}>Events</SideLink>
        </CardContent>
      </Card>
    </aside>
  )
}

function FeedRightRail({ data }: { data: Snapshot }) {
  const me = data.currentUser
  const connectedIds = new Set(data.connections.filter((pair) => me && pair.includes(me.id)).flat())
  const people = data.users.filter((u) => u.id !== me?.id && !connectedIds.has(u.id)).slice(0, 4)
  const tagCounts = new Map<string, number>()
  data.posts.forEach((p) => (p.tags ?? []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)))
  const trending = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const events = [
    { title: 'Founder Office Hours', date: 'Thu · 6:00 PM', host: 'Tarlan Y.' },
    { title: 'Demo Day Prep Workshop', date: 'Sat · 11:00 AM', host: 'SSC Programs' },
  ]
  const trendColors = ['from-emerald-500/20 via-emerald-500/5 to-transparent', 'from-amber-500/20 via-amber-500/5 to-transparent', 'from-sky-500/20 via-sky-500/5 to-transparent', 'from-violet-500/20 via-violet-500/5 to-transparent']
  return (
    <aside className='hidden space-y-4 xl:block'>
      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><Users className='size-4 text-primary' /> People to meet</CardTitle></CardHeader>
        <CardContent className='space-y-1'>{people.map((u) => <PersonRow key={u.id} user={u} />)}</CardContent>
      </Card>

      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-amber-500' /> Upcoming events</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {events.map((ev) => (
            <div key={ev.title} className='rounded-xl border border-border/70 bg-card/50 p-3'>
              <div className='flex items-center justify-between gap-2'><b className='text-sm'>{ev.title}</b></div>
              <div className='mt-1 flex items-center justify-between text-[11px] text-muted-foreground'><span>{ev.date}</span><span>{ev.host}</span></div>
              <Button variant='outline' size='sm' className='mt-2 w-full' onClick={() => toast.info('Added to your calendar.')}>Add to calendar</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent' />
        <CardHeader><CardTitle className='flex items-center gap-2 text-base'><Sparkles className='size-4 text-primary' /> Trending topics</CardTitle></CardHeader>
        <CardContent className='space-y-1 text-sm'>
          {trending.length === 0 && <p className='px-2 py-3 text-xs text-muted-foreground'>No tags yet — publish a tagged update.</p>}
          {trending.map(([tag, count], i) => (
            <div key={tag}>
              <Trend icon={<Hash className='size-3.5 text-primary' />} title={tag} posts={`${count} post${count === 1 ? '' : 's'}`} color={trendColors[i % trendColors.length]} />
              {i < trending.length - 1 && <div className='mx-2 h-px bg-gradient-to-r from-primary/10 to-transparent' />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='glass-card overflow-hidden p-0'>
        <div className='h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent' />
        <CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><TrendingUp className='size-4 text-emerald-500' /> Ecosystem pulse</CardTitle><CardDescription className='flex items-center gap-1 text-[11px]'><span className='relative flex size-1.5'><span className='absolute inline-flex size-1.5 animate-ping rounded-full bg-emerald-500 opacity-70' /><span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' /></span> Live this week</CardDescription></CardHeader>
        <CardContent className='grid grid-cols-3 gap-2 pt-1 text-center'>
          {[{ v: '142', l: 'Active builders' }, { v: '9', l: 'New startups' }, { v: '45', l: 'Mentors' }].map((s) => (
            <div key={s.l} className='rounded-xl bg-card/50 p-2.5'><div className='text-lg font-extrabold tracking-tight text-foreground'>{s.v}</div><div className='text-[10px] text-muted-foreground'>{s.l}</div></div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}

function PostAction({ icon: Icon, label, active, onClick }: { icon: typeof Heart; label: string; active?: boolean; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const likeAnim = useLikeAnimation()
  const bookmarkAnim = useBookmarkAnimation()
  const handleClick = () => {
    if (label === 'Like' && ref.current) likeAnim(ref.current)
    if (label === 'Save' && ref.current) bookmarkAnim(ref.current)
    onClick()
  }
  return (
    <Button
      ref={ref}
      variant='ghost'
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[13px] text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50',
        active && 'text-primary hover:text-primary'
      )}
      onClick={handleClick}
    >
      <Icon className={cn('size-4', active && 'fill-current')} />
      <span>{label}</span>
    </Button>
  )
}
function Trend({ icon, title, posts, color }: { icon?: React.ReactNode; title: string; posts: string; color?: string }) {
  return (
    <div className='group cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-muted/50'>
      <div className='flex items-center gap-2'>
        {icon && (
          <span className={cn(
            'grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br',
            color || 'from-primary/20 to-primary/5'
          )}>
            {icon}
          </span>
        )}
        <p className='font-medium text-sm group-hover:text-primary transition-colors'>{title}</p>
      </div>
      <p className='text-xs text-muted-foreground mt-1 ml-9'>{posts}</p>
    </div>
  )
}

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
        <h3 className='mt-3 font-semibold tracking-tight text-lg'>{user.name}</h3>
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
function PersonRow({ user }: { user: User }) {
  const connect = useAction(() => apiClient.connect(user.id))
  return (
    <div className='group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/[0.03] hover:to-transparent'>
      <UserAvatar user={user} className='size-10 ring-2 ring-transparent transition-all duration-200 group-hover:ring-primary/15' />
      <div className='min-w-0 flex-1 text-sm'>
        <b className='block truncate'>{user.name}</b>
        <span className='text-xs text-muted-foreground truncate block'>{user.title}</span>
      </div>
      <Button variant='ghost' size='icon' className='size-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100' onClick={() => connect.mutate()}>
        <Plus className='size-4' />
      </Button>
    </div>
  )
}

export function CommunitiesPage() {
  const { data } = useSnapshot(); const commRef = useRef<HTMLDivElement>(null)
  useStaggerCards(commRef, [data])
  if (!data) return <PageLoading />
  return <PageContainer>
    <PageHeading eyebrow='Communities' title='Find your people. Build momentum.' description='Smaller circles for deeper professional conversations.' />
    <div ref={commRef} className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{data.communities.map((community) => <div key={community.id} data-card><CommunityCard community={community} admin={data.currentUser?.role === 'admin'} /></div>)}</div>
  </PageContainer>
}

export function NewsPage() {
  const { data } = useSnapshot()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const newsRef = useRef<HTMLDivElement>(null)
  useStaggerCards(newsRef, [data, selectedCategory])
  if (!data) return <PageLoading />

  const categories = ['All', 'Announcement', 'Community', 'Events', 'Startups', 'Research']
  const newsCards = [
    { category: 'Startups', date: 'Jul 1, 2026', title: 'Stanford AI Cohort Demo Day', summary: '12 student startups presented to 50+ investors at the quarterly demo day event.', link: '#' },
    { category: 'Community', date: 'Jun 28, 2026', title: 'Summer Hackathon Launch', summary: '48-hour build sprint with mentorship from YC alumni. 200+ participants registered.', link: '#' },
    { category: 'Announcement', date: 'Jun 25, 2026', title: 'New Mentor Onboarding', summary: '15 new industry mentors joined this month across AI, fintech, and climate.', link: '#' },
    { category: 'Research', date: 'Jun 22, 2026', title: 'Founder Survey Results', summary: 'Key insights from 500+ student founders on fundraising, product-market fit, and team building.', link: '#' },
    { category: 'Events', date: 'Jun 20, 2026', title: 'Weekly Founder Circle', summary: 'Every Thursday at 6pm. Share progress, get feedback, find co-founders.', link: '#' },
    { category: 'Startups', date: 'Jun 18, 2026', title: 'GreenStack Raises Pre-Seed', summary: 'ClimateTech startup from SSC community closed $500k pre-seed round.', link: '#' },
  ]

  const filtered = selectedCategory === 'All' ? newsCards : newsCards.filter((n) => n.category === selectedCategory)

  const categoryColors: Record<string, string> = {
    'Startups': 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Community': 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Announcement': 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Research': 'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/30',
    'Events': 'from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/30',
  }

  return <PageContainer>
    <PageHeading eyebrow='News & Updates' title='What is happening in the community.' description='Follow the progress of student teams, events, and ecosystem news.' />
    <div className='mb-8 flex flex-wrap gap-2'>
      {categories.map((cat) => (
        <Button
          key={cat}
          size='sm'
          variant={selectedCategory === cat ? 'default' : 'outline'}
          className='rounded-full'
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
    <div ref={newsRef} className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
      {filtered.map((card, i) => (
        <div key={i} data-card>
          <Card className='group overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 border-primary/5'>
            <div className='h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent' />
            <CardHeader>
              <Badge className={`w-fit border bg-gradient-to-br ${categoryColors[card.category] || categoryColors['Community']}`} variant='secondary'>
                {card.category}
              </Badge>
              <CardTitle className='mt-2 tracking-tight text-lg'>{card.title}</CardTitle>
              <CardDescription className='leading-relaxed text-balance line-clamp-3'>{card.summary}</CardDescription>
            </CardHeader>
            <CardFooter className='justify-between border-t pt-4'>
              <span className='text-xs text-muted-foreground'>{card.date}</span>
              <Button variant='ghost' size='sm' className='gap-1 text-xs' onClick={() => toast.info('Full article coming soon.')}>
                Read more <ChevronRight className='size-3' />
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
    {filtered.length === 0 && (
      <Card className='border-dashed border-muted-foreground/20 py-16 text-center'>
        <CardContent><Newspaper className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No news in this category</p></CardContent>
      </Card>
    )}
  </PageContainer>
}

function CommunityCard({ community, admin }: { community: Snapshot['communities'][number]; admin: boolean }) {
  const toggle = useAction(() => apiClient.toggleCommunity(community.id))
  const remove = useAction(() => apiClient.deleteCommunity(community.id))
  const categoryColors: Record<string, string> = {
    'AI': 'from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Startups': 'from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Design': 'from-violet-500/20 via-violet-500/10 to-transparent text-violet-600 dark:text-violet-400 border-violet-500/30',
    'Tech': 'from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Business': 'from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Science': 'from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  }
  const headerColors: Record<string, string> = {
    'AI': 'from-blue-600/40 via-blue-400/20 to-transparent',
    'Startups': 'from-emerald-600/40 via-emerald-400/20 to-transparent',
    'Design': 'from-violet-600/40 via-violet-400/20 to-transparent',
    'Tech': 'from-primary/40 via-primary/20 to-transparent',
    'Business': 'from-amber-600/40 via-amber-400/20 to-transparent',
    'Science': 'from-emerald-600/40 via-emerald-400/20 to-transparent',
  }
  const colorClass = categoryColors[community.category] || categoryColors['Tech']
  const headerClass = headerColors[community.category] || headerColors['Tech']
  return (
    <Link to='/communities/$communityId' params={{ communityId: String(community.id) }} className='block'>
      <Card className='group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 border-primary/5'>
        <div className={`h-1.5 bg-gradient-to-r ${headerClass}`} />
        <CardHeader>
          <Badge className={`mb-3 w-fit border bg-gradient-to-br ${colorClass}`} variant='secondary'>
            {community.category}
          </Badge>
          <CardTitle className='tracking-tight text-lg'>{community.name}</CardTitle>
          <CardDescription className='leading-relaxed text-balance line-clamp-2'>{community.description}</CardDescription>
        </CardHeader>
        <CardContent className='pb-4'>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='size-4 text-muted-foreground' />
              <b className='text-foreground'>{community.members.toLocaleString()}</b>
              <span className='text-muted-foreground'>members</span>
            </div>
            {community.activity && (
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='relative'>
                  <span className='size-1.5 rounded-full bg-green-500 block' />
                  <span className='absolute inset-0 size-1.5 rounded-full bg-green-500 animate-ping opacity-40' />
                </span>
                {community.activity}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className='gap-2 border-t pt-4' onClick={(e) => e.preventDefault()}>
          <Button
            className='flex-1 transition-all duration-200 group-hover:shadow-sm'
            variant={community.joined ? 'outline' : 'default'}
            onClick={(e) => { e.preventDefault(); toggle.mutate() }}
          >
            {community.joined && <Check className='size-4' />}
            {community.joined ? 'Joined' : 'Join community'}
          </Button>
          {admin && (
            <Button variant='ghost' size='icon' onClick={(e) => { e.preventDefault(); remove.mutate() }} aria-label='Remove community'>
              <X className='size-4' />
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

export function JobsPage() {
  const { data } = useSnapshot(); const [query, setQuery] = useState(''); const jobsRef = useRef<HTMLDivElement>(null)
  useStaggerCards(jobsRef, [data, query])
  if (!data) return <PageLoading />
  const jobs = data.jobs.filter((job) => `${job.role} ${job.company} ${job.skills}`.toLowerCase().includes(query.toLowerCase()))
  return <PageContainer><PageHeading eyebrow='Opportunities' title='Work worth doing, with people worth meeting.' description='Roles, projects and collaborations curated from the community.' /><Input className='mb-6 max-w-xl' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search roles, companies or skills' /><div ref={jobsRef} className='grid gap-4'>{jobs.map((job) => <div key={job.id} data-card><JobCard job={job} /></div>)}</div></PageContainer>
}

interface StartupData {
  slug: string; name: string; sector: string; stage: string; score: number; roles: string; summary: string;
  fullDesc: string; founded: string; location: string; backedBy: string[]; team: Array<{ name: string; title: string; avatar?: string }>;
  milestones: Array<{ date: string; title: string; desc: string; status: 'done' | 'current' | 'future' }>;
  openRoles: Array<{ title: string; dept: string; type: string; skills: string[] }>;
}
const startups: StartupData[] = [
  { slug: 'greenstack', name: 'GreenStack', sector: 'ClimateTech', stage: 'MVP', score: 86, roles: '2 open roles', summary: 'Operational carbon intelligence for growing manufacturers.',
    fullDesc: 'Building next-generation carbon tracking infrastructure using distributed ledger tech and IoT sensor arrays for real-time emissions data.',
    founded: '2023', location: 'Seattle, WA', backedBy: ['Techstars', 'Climate Fund'],
    team: [
      { name: 'Sarah Jenkins', title: 'CEO & Co-founder' },
      { name: 'David Chen', title: 'CTO' },
      { name: 'Alex Rivera', title: 'Head of Product' },
    ],
    milestones: [
      { date: 'Q3 2023', title: 'MVP Deployment', desc: 'Deployed pilot in 3 partner facilities.', status: 'done' },
      { date: 'Q1 2024 (Current)', title: 'Seed Fundraising', desc: 'Raising $1.5M to scale go-to-market.', status: 'current' },
      { date: 'Q4 2024', title: 'Enterprise API Launch', desc: 'Opening platform for third-party ERP integrations.', status: 'future' },
    ],
    openRoles: [
      { title: 'Senior Data Engineer', dept: 'Engineering', type: 'Full-time · Remote', skills: ['Python', 'AWS'] },
      { title: 'Product Marketing Lead', dept: 'Marketing', type: 'Full-time · Seattle, WA', skills: ['B2B SaaS', 'GTM'] },
    ],
  },
  { slug: 'skillbridge-ai', name: 'SkillBridge AI', sector: 'EdTech', stage: 'Validating', score: 74, roles: '3 open roles', summary: 'Turns student projects into verified, employer-ready skill evidence.',
    fullDesc: 'AI-powered platform that evaluates student project output against industry competency frameworks.',
    founded: '2024', location: 'San Francisco, CA', backedBy: ['EdVentures'],
    team: [{ name: 'Maya Lin', title: 'CEO' }, { name: 'James Park', title: 'CTO & Co-founder' }],
    milestones: [
      { date: 'Jan 2024', title: 'Beta Launch', desc: 'Launched with 3 university partners.', status: 'done' },
      { date: 'Current', title: 'Pilot Expansion', desc: '10 universities in pilot program.', status: 'current' },
    ],
    openRoles: [
      { title: 'Full-Stack Engineer', dept: 'Engineering', type: 'Full-time · SF', skills: ['React', 'Python', 'Postgres'] },
    ],
  },
  { slug: 'mediroute', name: 'MediRoute', sector: 'HealthTech', stage: 'Pilot', score: 91, roles: '1 open role', summary: 'Coordinates faster referrals between clinics and diagnostic centers.',
    fullDesc: 'Streamlining healthcare referrals with intelligent routing and automated follow-ups.',
    founded: '2023', location: 'Boston, MA', backedBy: ['HealthX', 'MassChallenge'],
    team: [{ name: 'Dr. Priya Sharma', title: 'CEO & Founder' }, { name: 'Tom Mueller', title: 'CTO' }],
    milestones: [
      { date: 'Q2 2023', title: 'Pilot Launch', desc: 'Deployed in 2 hospital networks.', status: 'done' },
      { date: 'Current', title: 'Series A Prep', desc: 'Building enterprise sales pipeline.', status: 'current' },
    ],
    openRoles: [
      { title: 'Clinical Operations Lead', dept: 'Operations', type: 'Full-time · Boston', skills: ['Healthcare', 'HIPAA'] },
    ],
  },
]

interface MentorData {
  id: number
  name: string
  title: string
  expertise: string[]
  company: string
  rating: number
  sessions: number
  availability: string
  focusStage: string
  bio: string
  status: 'active' | 'pending' | 'suspended'
}

const mentors: MentorData[] = [
  { id: 1, name: 'Tarlan Yusifzade', title: 'Mentor · ex-VC', expertise: ['Fundraising', 'Go-to-market', 'Strategy'], company: 'Independent', rating: 4.9, sessions: 64, availability: 'Office hours weekly', focusStage: 'Pre-seed → Seed', bio: 'Operator-turned-investor. Mentors founders on validation and raise readiness.', status: 'active' },
  { id: 2, name: 'Dr. Leyla Mammad', title: 'Mentor · AI/ML', expertise: ['AI', 'LLM Apps', 'MLOps'], company: 'ModelWorks (ex)', rating: 4.8, sessions: 41, availability: 'Bi-weekly', focusStage: 'MVP → Scale', bio: 'Applied AI lead. Workshops on evaluations, inference cost, and shipping.', status: 'active' },
  { id: 3, name: 'Rashad Aliyev', title: 'Mentor · Product & Design', expertise: ['Product', 'UX Research', 'Design Systems'], company: 'North Studio', rating: 4.7, sessions: 38, availability: 'Weekly', focusStage: 'Idea → Validation', bio: 'Product designer coaching founders on trustworthy onboarding and research.', status: 'active' },
  { id: 4, name: 'Nigar Veliyeva', title: 'Mentor · Climate', expertise: ['Climate', 'Operations', 'Impact'], company: 'GreenStack (advisor)', rating: 4.9, sessions: 27, availability: 'Monthly', focusStage: 'Pilot → MVP', bio: 'Climate operator. Helps teams design pilots and measure real impact.', status: 'pending' },
  { id: 5, name: 'Dr. Elvin Huseyn', title: 'Mentor · Health', expertise: ['Health', 'Regulatory', 'Operations'], company: 'MediMatch (advisor)', rating: 4.6, sessions: 19, availability: 'Monthly', focusStage: 'Validation → Revenue', bio: 'Healthcare operator guiding provider onboarding and compliance.', status: 'pending' },
  { id: 6, name: 'Aysu Qasimova', title: 'Mentor · Growth', expertise: ['Growth', 'Content', 'Community'], company: 'Orbit Labs', rating: 4.5, sessions: 52, availability: 'Weekly', focusStage: 'Launch → Scale', bio: 'Growth practitioner for early consumer and community products.', status: 'suspended' },
]

export function StartupsPage() {
  const navigate = useNavigate()
  return <PageContainer>
    <PageHeading eyebrow='Startup workspace' title='Discover teams and turn visible progress into trust.' description='Explore verified student startups, open roles, milestones and mentor-backed execution signals.' />
    <div className='mb-6 flex flex-wrap gap-3'><Button><Plus />Create startup</Button><Button variant='outline'><Search />Browse open roles</Button><Button variant='outline'><Bookmark />Saved startups</Button></div>
    <div className='grid gap-5 lg:grid-cols-3'>{startups.map((startup) => <Card key={startup.name} className='overflow-hidden'>
      <CardHeader><div className='flex items-center justify-between'><Badge>{startup.stage}</Badge><span className='text-sm font-bold text-primary'>{startup.score}% ready</span></div><CardTitle className='pt-3'>{startup.name}</CardTitle><CardDescription>{startup.sector}</CardDescription></CardHeader>
      <CardContent><p className='leading-6 text-muted-foreground'>{startup.summary}</p><div className='mt-5 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${startup.score}%` }} /></div></CardContent>
      <CardFooter className='justify-between border-t'><span className='text-sm text-muted-foreground'>{startup.roles}</span><Button variant='ghost' size='sm' onClick={() => navigate({ to: '/startups/$slug', params: { slug: startup.slug } })}>View startup <ChevronRight /></Button></CardFooter>
    </Card>)}</div>
  </PageContainer>
}

export function StartupDetailPage() {
  const { slug } = useParams({ from: '/app/startups/$slug' })
  const startup = startups.find((s) => s.slug === slug)
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const location = useRouterState({ select: (state) => state.location.pathname })
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
          <Button variant='outline' className='gap-2'><MessageCircle className='size-4' />Contact</Button>
          <Button className='gap-2 shadow-xs'><Bookmark className='size-4' />Follow</Button>
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
                <Button variant='ghost' size='sm' className='text-xs'>View all <ChevronRight className='size-3' /></Button>
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
                <div key={role.title} className='group/role cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/30 hover:shadow-sm'>
                  <div className='flex items-start justify-between'>
                    <div><h4 className='font-semibold group-hover/role:text-primary transition-colors'>{role.title}</h4><p className='text-xs text-muted-foreground'>{role.dept} · {role.type}</p></div>
                    <ChevronRight className='mt-0.5 size-4 text-muted-foreground opacity-0 transition-all group-hover/role:opacity-100 group-hover/role:translate-x-0.5' />
                  </div>
                  <div className='mt-3 flex gap-2'>{role.skills.map((s) => <span key={s} className='rounded border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground'>{s}</span>)}</div>
                </div>
              ))}
            </CardContent>
            <CardFooter className='justify-center border-t pt-4'>
              <Button variant='ghost' size='sm' className='gap-1 text-sm'>View all careers <ChevronRight className='size-3' /></Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className='relative z-10 mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row'>
        <p className='font-semibold text-foreground/60'>{startup.name} Ecosystem</p>
        <nav className='flex gap-6'><a className='transition-colors hover:text-foreground' href='#'>Privacy Policy</a><a className='transition-colors hover:text-foreground' href='#'>Terms of Service</a></nav>
        <p className='text-xs'>© 2026 {startup.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}

export function MentorshipPage() {
  const [query, setQuery] = useState('')
  const [expertise, setExpertise] = useState('All')
  const [stage, setStage] = useState('All')
  const [booked, setBooked] = useState<Set<number>>(new Set())
  const [booking, setBooking] = useState<MentorData | null>(null)

  const activeMentors = mentors.filter((m) => m.status !== 'suspended')
  const expertiseList = ['All', ...Array.from(new Set(activeMentors.flatMap((m) => m.expertise)))]
  const stageList = ['All', ...Array.from(new Set(activeMentors.map((m) => m.focusStage)))]
  const filtered = activeMentors.filter((m) =>
    (expertise === 'All' || m.expertise.includes(expertise)) &&
    (stage === 'All' || m.focusStage === stage) &&
    `${m.name} ${m.title} ${m.expertise.join(' ')} ${m.bio}`.toLowerCase().includes(query.toLowerCase()),
  )
  const bookedMentors = activeMentors.filter((m) => booked.has(m.id))

  return <PageContainer>
    <PageHeading eyebrow='Mentorship' title='Mentors who shorten your path.' description='Discover operators by expertise, book goal-led sessions, and keep structured feedback tied to your startup — not vague impressions.' />

    {bookedMentors.length > 0 && (
      <Card className='glass-card mb-6 overflow-hidden p-0'><CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><CalendarDays className='size-4 text-primary' /> Your sessions</CardTitle><CardDescription>{bookedMentors.length} booked</CardDescription></CardHeader>
        <CardContent className='flex gap-3 overflow-x-auto pb-3'>{bookedMentors.map((m) => (
          <div key={m.id} className='flex w-56 shrink-0 flex-col gap-1 rounded-xl border bg-card/60 p-3'>
            <div className='flex items-center gap-2'><span className='grid size-8 place-items-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-500'>{m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span><b className='truncate text-sm'>{m.name}</b></div>
            <span className='text-xs text-muted-foreground'>{m.focusStage}</span>
            <div className='mt-1 flex gap-1'><Badge variant='secondary' className='gap-1 text-[10px]'><Video className='size-2.5' />Video · Thu</Badge></div>
            <Button size='sm' variant='outline' className='mt-2' onClick={() => toast.info('Feedback form opened.')}>Rate session</Button>
          </div>
        ))}</CardContent>
      </Card>
    )}

    <div className='mb-4 relative max-w-xl'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-9' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search expertise, industry or mentor' /></div>
    <div className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>Expertise</div>
    <div className='mb-4 flex flex-wrap gap-1.5'>{expertiseList.map((e) => <button key={e} onClick={() => setExpertise(e)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-all', expertise === e ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{e}</button>)}</div>
    <div className='mb-6 flex flex-wrap gap-1.5'>{stageList.map((s) => <button key={s} onClick={() => setStage(s)} className={cn('rounded-full border px-3 py-1 text-[11px] font-medium transition-all', stage === s ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : 'border-border text-muted-foreground hover:text-foreground')}>{s}</button>)}</div>

    <div className='grid gap-5 lg:grid-cols-2 xl:grid-cols-3'>{filtered.map((m) => (
      <Card key={m.id} className='glass-card flex flex-col'>
        <CardHeader className='flex-row items-start gap-3 space-y-0'>
          <span className='grid size-12 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-500'>{m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'><CardTitle className='text-base'>{m.name}</CardTitle>{m.status === 'active' && <BadgeCheck className='size-4 text-primary' aria-label='Verified mentor' />}</div>
            <CardDescription className='truncate'>{m.title}</CardDescription>
          </div>
          <Badge variant='outline' className='gap-1 text-[10px]'><span className='text-amber-500'>★</span>{m.rating.toFixed(1)}</Badge>
        </CardHeader>
        <CardContent className='flex-1 space-y-3'>
          <p className='text-sm leading-relaxed text-muted-foreground'>{m.bio}</p>
          <div className='flex flex-wrap gap-1'>{m.expertise.map((e) => <Badge key={e} variant='secondary' className='text-[10px]'>{e}</Badge>)}</div>
          <div className='flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground'>
            <span className='inline-flex items-center gap-1'><BadgeCheck className='size-3 text-primary' />{m.focusStage}</span>
            <span className='inline-flex items-center gap-1'><CalendarDays className='size-3' />{m.sessions} sessions</span>
            <span className='inline-flex items-center gap-1'><Video className='size-3' />{m.availability}</span>
          </div>
        </CardContent>
        <CardFooter className='gap-2 border-t'>
          {booked.has(m.id)
            ? <Button size='sm' variant='outline' className='flex-1' disabled><Check className='size-3.5' />Session booked</Button>
            : <Button size='sm' className='flex-1' onClick={() => setBooking(m)}><CalendarDays className='size-3.5' />Book session</Button>}
          <Button size='sm' variant='ghost' onClick={() => toast.info(`Message thread started with ${m.name}.`)}><MessagesSquare className='size-4' /></Button>
        </CardFooter>
      </Card>
    ))}
      {filtered.length === 0 && <Card className='border-dashed lg:col-span-2 xl:col-span-3'><CardContent className='py-16 text-center'><GraduationCap className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='font-medium'>No mentors match</p><p className='text-sm text-muted-foreground'>Adjust expertise or stage filters.</p></CardContent></Card>}
    </div>

    <BookingDialog key={booking?.id ?? 'closed'} mentor={booking} onClose={() => setBooking(null)} onConfirm={() => { if (booking) { setBooked((prev) => new Set(prev).add(booking.id)); toast.success(`Session booked with ${booking.name}.`) }; setBooking(null) }} />
  </PageContainer>
}

function BookingDialog({ mentor, onClose, onConfirm }: { mentor: MentorData | null; onClose: () => void; onConfirm: () => void }) {
  const [goal, setGoal] = useState('')
  const [focus, setFocus] = useState('')
  const [stagePick, setStagePick] = useState('Validation')
  const [format, setFormat] = useState<'video' | 'async'>('video')
  const [when, setWhen] = useState('')
  const valid = goal.trim().length > 8
  return <Dialog open={!!mentor} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className='max-w-lg'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'><GraduationCap className='size-5 text-amber-500' /> Book a session with {mentor?.name}</DialogTitle>
        <DialogDescription>{mentor?.title} · {mentor?.focusStage}. Define your goal so the mentor can prepare — expectations first.</DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <div>
          <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Your goal for this session</Label>
          <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder='e.g. Pressure-test our pricing model and prep for a pre-seed raise conversation.' className='min-h-[80px]' />
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Your startup stage</Label>
            <div className='flex flex-wrap gap-1'>{['Idea', 'Validation', 'MVP', 'Revenue'].map((s) => <button key={s} onClick={() => setStagePick(s)} className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all', stagePick === s ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{s}</button>)}</div>
          </div>
          <div>
            <Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Format</Label>
            <div className='flex gap-1'>{[{ k: 'video', l: 'Video call', I: Video }, { k: 'async', l: 'Async review', I: MessagesSquare }].map((o) => <button key={o.k} onClick={() => setFormat(o.k as 'video' | 'async')} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all', format === o.k ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : 'border-border text-muted-foreground hover:text-foreground')}><o.I className='size-3' />{o.l}</button>)}</div>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div><Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Focus area</Label><Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder='Fundraising, GTM…' /></div>
          <div><Label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Preferred time</Label><Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder='Thu afternoon' /></div>
        </div>
      </div>
      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={onConfirm}><Check className='size-4' />Confirm booking</Button>
      </div>
    </DialogContent>
  </Dialog>
}


const programDirectory = [
  { title: 'Stanford AI Spring Cohort', type: 'Accelerator', deadline: 'Oct 15', progress: 'Applications open', description: 'A 12-week intensive program for generative AI startups with elite compute and mentor access.', meta: '$100k grant' },
  { title: 'Web3 Global Hack', type: 'Hackathon', deadline: 'Nov 12–14', progress: '500+ participants', description: 'Build decentralized infrastructure in 48 hours with technical mentorship.', meta: 'Ethereum Foundation' },
  { title: 'FinTech Foundry', type: 'Incubator', deadline: 'Rolling', progress: '85% cohort filled', description: 'Six-month residency with banking partners and regulatory experts.', meta: 'NYC Hub' },
]

export function ProgramsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const visiblePrograms = programDirectory.filter((program) => (type === 'All' || program.type === type) && `${program.title} ${program.description}`.toLowerCase().includes(query.toLowerCase()))
  return <PageContainer className='grid gap-7 lg:grid-cols-[240px_1fr]'>
    <aside className='hidden space-y-5 lg:block'><Card><CardHeader><CardTitle className='text-base'>My Applications</CardTitle></CardHeader><CardContent className='space-y-5'><ApplicationProgress name='Y Combinator S24' status='In Review' value={66} /><ApplicationProgress name='Techstars Web3' status='Interview' value={80} /></CardContent></Card><Card><CardHeader><CardTitle className='text-base'>Filters</CardTitle></CardHeader><CardContent className='flex flex-wrap gap-2'>{['All', 'Accelerator', 'Hackathon', 'Incubator'].map((item) => <Button key={item} size='sm' variant={type === item ? 'default' : 'outline'} className='rounded-full' onClick={() => setType(item)}>{item}</Button>)}</CardContent></Card></aside>
    <main className='min-w-0'><div className='mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between'><PageHeading eyebrow='Programs & events' title='High-stakes opportunities to accelerate your startup.' description='Apply to cohorts, join hackathons and track institutional opportunities.' /><div className='relative w-full md:w-72'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-10' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search programs...' /></div></div>
      <div className='grid gap-5 md:grid-cols-2'>{visiblePrograms.map((program, index) => <Card key={program.title} className={cn('overflow-hidden', index === 0 && 'md:col-span-2')}><CardHeader><div className='flex flex-wrap items-center justify-between gap-2'><Badge className='gap-1' variant={index === 0 ? 'default' : 'secondary'}><Rocket className='size-3' />{program.type}</Badge><span className='text-xs font-semibold text-muted-foreground'>Deadline: {program.deadline}</span></div><CardTitle className='pt-3'>{program.title}</CardTitle><CardDescription className='max-w-2xl leading-6'>{program.description}</CardDescription></CardHeader><CardContent><div className='flex flex-wrap gap-2'><Badge variant='outline'>{program.meta}</Badge><Badge variant='outline'>{program.progress}</Badge></div></CardContent><CardFooter className='justify-between border-t'><span className='text-sm text-muted-foreground'>{program.progress}</span><Button variant={index === 0 ? 'default' : 'outline'}>{index === 0 ? 'Apply Now' : 'View Details'}</Button></CardFooter></Card>)}</div>
    </main>
  </PageContainer>
}

function ApplicationProgress({ name, status, value }: { name: string; status: string; value: number }) { return <div><div className='mb-2 flex justify-between gap-2 text-xs'><b>{name}</b><span className='text-amber-500'>{status}</span></div><div className='h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${value}%` }} /></div></div> }

type AdminTab = 'overview' | 'startups' | 'mentors' | 'verification' | 'moderation'

const ADMIN_TABS: { key: AdminTab; label: string; icon: typeof ShieldCheck }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'startups', label: 'Startups', icon: Rocket },
  { key: 'mentors', label: 'Mentors', icon: GraduationCap },
  { key: 'verification', label: 'Verification', icon: ShieldCheck },
  { key: 'moderation', label: 'Moderation', icon: Flag },
]

export function AdminPage() {
  const { data } = useSnapshot()
  const [tab, setTab] = useState<AdminTab>('overview')

  const [verified, setVerified] = useState<Set<string>>(new Set(['greenstack', 'mediroute']))
  const [featured, setFeatured] = useState<Set<string>>(new Set(['greenstack']))
  const [suspended, setSuspended] = useState<Set<string>>(new Set())
  const [startupQuery, setStartupQuery] = useState('')
  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, slug: string, label: string) => {
    setter((prev) => {
      const next = new Set(prev)
      const on = !next.has(slug)
      if (on) next.add(slug); else next.delete(slug)
      toast.success(`${label} ${on ? 'enabled' : 'disabled'}`)
      return next
    })
  }

  const [mentorStatus, setMentorStatus] = useState<Record<number, MentorData['status']>>(() => Object.fromEntries(mentors.map((m) => [m.id, m.status])))
  const setMentor = (id: number, status: MentorData['status']) => { setMentorStatus((p) => ({ ...p, [id]: status })); toast.success(`Mentor ${status}`) }

  const pendingVerifications = [
    { id: 101, name: 'Emin Qarayev', uni: 'Baku State University', program: 'Computer Science', method: '.edu email' },
    { id: 102, name: 'Sona Ibrahimli', uni: 'ADA University', program: 'Economics', method: 'Student ID' },
    { id: 103, name: 'Ramin Sadigli', uni: 'UNEC', program: 'Business', method: 'FIN-based' },
    { id: 104, name: 'Lala Mammadli', uni: 'Khazar University', program: 'Design', method: '.edu email' },
  ]
  const [decided, setDecided] = useState<Record<number, 'approved' | 'rejected'>>({})

  const [flagged, setFlagged] = useState<Set<number>>(new Set([2, 6]))
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: (id: number) => apiClient.deletePost(id),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: snapshotKey }); toast.success('Post removed') },
  })

  const stats = data
    ? [
        { label: 'Verified users', value: data.users.length, icon: Users, tone: 'text-primary' },
        { label: 'Active startups', value: startups.length, icon: Rocket, tone: 'text-emerald-500' },
        { label: 'Mentors', value: mentors.length, icon: GraduationCap, tone: 'text-amber-500' },
        { label: 'Posts', value: data.posts.length, icon: MessageCircle, tone: 'text-sky-500' },
      ]
    : []

  return <PageContainer>
    <PageHeading eyebrow='Admin control tower' title='Operate a trusted, measurable ecosystem.' description='Manage verification, startup quality, mentor capacity, and moderation — every action is auditable.' />
    <div className='mb-6 flex flex-wrap gap-2'>
      {ADMIN_TABS.map((t) => (
        <button key={t.key} onClick={() => setTab(t.key)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all', tab === t.key ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/25')}>
          <t.icon className='size-3.5' /> {t.label}
        </button>
      ))}
    </div>

    {tab === 'overview' && (
      <>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>{stats.map((s) => (
          <Card key={s.label} className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'>
            <span className={cn('grid size-10 place-items-center rounded-xl bg-muted/60', s.tone)}><s.icon className='size-5' /></span>
            <div><CardDescription>{s.label}</CardDescription><CardTitle className='text-2xl'>{s.value}</CardTitle></div>
          </CardHeader></Card>
        ))}</div>
        <div className='mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]'>
          <Card className='glass-card'><CardHeader><CardTitle>Ecosystem health</CardTitle><CardDescription>Current cohort operating signals.</CardDescription></CardHeader>
            <CardContent className='space-y-4'>
              <ProfileInfo label='Mentor utilization' value='72%' />
              <ProfileInfo label='Application conversion' value='34%' />
              <ProfileInfo label='Flagged incidents' value={String(flagged.size)} />
              <ProfileInfo label='Pending verifications' value={String(Object.values(decided).filter((d) => d).length ? pendingVerifications.length - Object.keys(decided).length : pendingVerifications.length)} />
            </CardContent>
          </Card>
          <Card className='glass-card'><CardHeader><CardTitle>Priority queues</CardTitle><CardDescription>High-frequency approvals.</CardDescription></CardHeader>
            <CardContent className='space-y-2'>
              {[{ label: 'Student verifications', value: pendingVerifications.length - Object.keys(decided).length }, { label: 'Startup approvals', value: startups.filter((s) => !verified.has(s.slug)).length }, { label: 'Mentor applications', value: mentors.filter((m) => mentorStatus[m.id] === 'pending').length }, { label: 'Moderation alerts', value: flagged.size }].map((q) => (
                <button key={q.label} onClick={() => setTab(q.label.includes('Student') ? 'verification' : q.label.includes('Startup') ? 'startups' : q.label.includes('Mentor') ? 'mentors' : 'moderation')} className='flex w-full items-center rounded-xl border p-3 text-left transition-colors hover:bg-muted/50'>
                  <span className='grid size-8 place-items-center rounded-lg bg-primary/10 text-primary'><ShieldCheck className='size-4' /></span>
                  <b className='ml-3 block text-sm'>{q.label}</b><Badge variant='secondary' className='ml-auto'>{q.value}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </>
    )}

    {tab === 'startups' && (
      <>
        <div className='mb-4'><div className='relative max-w-md'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-9' value={startupQuery} onChange={(e) => setStartupQuery(e.target.value)} placeholder='Search startups by name, sector, stage' /></div></div>
        <div className='space-y-3'>
          {startups.filter((s) => `${s.name} ${s.sector} ${s.stage}`.toLowerCase().includes(startupQuery.toLowerCase())).map((s) => {
            const isVerified = verified.has(s.slug), isFeatured = featured.has(s.slug), isSuspended = suspended.has(s.slug)
            return (
              <Card key={s.slug} className={cn('glass-card', isSuspended && 'opacity-60')}>
                <CardContent className='flex flex-col gap-3 p-4 md:flex-row md:items-center'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Rocket className='size-5' /></span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{s.name}</b><Badge variant='outline'>{s.sector}</Badge><Badge variant='secondary'>{s.stage}</Badge>{isVerified && <Badge className='gap-1 bg-emerald-500/15 text-emerald-500 border-emerald-500/30'><BadgeCheck className='size-3' />Verified</Badge>}{isFeatured && <Badge className='gap-1 bg-amber-500/15 text-amber-500 border-amber-500/30'><Trophy className='size-3' />Featured</Badge>}{isSuspended && <Badge variant='destructive'>Suspended</Badge>}</div>
                    <div className='mt-2 flex items-center gap-2'><div className='h-1.5 w-32 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${s.score}%` }} /></div><span className='text-xs text-muted-foreground'>{s.score}% ready · {s.roles}</span></div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm' variant={isVerified ? 'outline' : 'default'} onClick={() => toggleSet(setVerified, s.slug, 'Verification')}><BadgeCheck className='size-3.5' />{isVerified ? 'Verified' : 'Verify'}</Button>
                    <Button size='sm' variant={isFeatured ? 'outline' : 'secondary'} onClick={() => toggleSet(setFeatured, s.slug, 'Featured')}><Trophy className='size-3.5' />{isFeatured ? 'Featured' : 'Feature'}</Button>
                    <Button size='sm' variant={isSuspended ? 'destructive' : 'ghost'} onClick={() => toggleSet(setSuspended, s.slug, 'Suspend')}><X className='size-3.5' />{isSuspended ? 'Unsuspend' : 'Suspend'}</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </>
    )}

    {tab === 'mentors' && (
      <div className='grid gap-4 md:grid-cols-2'>
        {mentors.map((m) => {
          const status = mentorStatus[m.id] ?? m.status
          return (
            <Card key={m.id} className={cn('glass-card', status === 'suspended' && 'opacity-60')}>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500'><GraduationCap className='size-5' /></span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{m.name}</b><Badge variant='outline'>{m.focusStage}</Badge></div>
                    <p className='text-xs text-muted-foreground'>{m.title}</p>
                    <div className='mt-2 flex flex-wrap gap-1'>{m.expertise.map((e) => <Badge key={e} variant='secondary' className='text-[10px]'>{e}</Badge>)}</div>
                    <p className='mt-2 text-[11px] text-muted-foreground'>★ {m.rating.toFixed(1)} · {m.sessions} sessions · {m.availability}</p>
                  </div>
                  <Badge variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>{status}</Badge>
                </div>
                <div className='mt-3 flex gap-2'>
                  {status !== 'active' && <Button size='sm' onClick={() => setMentor(m.id, 'active')}><Check className='size-3.5' />Approve</Button>}
                  {status === 'active' && <Button size='sm' variant='outline' onClick={() => setMentor(m.id, 'suspended')}><X className='size-3.5' />Suspend</Button>}
                  {status === 'suspended' && <Button size='sm' variant='outline' onClick={() => setMentor(m.id, 'active')}><Check className='size-3.5' />Reactivate</Button>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {tab === 'verification' && (
      <div className='space-y-3'>
        {pendingVerifications.map((v) => {
          const d = decided[v.id]
          return (
            <Card key={v.id} className={cn('glass-card', d && 'opacity-60')}>
              <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'>
                <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><ShieldCheck className='size-5' /></span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'><b className='text-sm'>{v.name}</b>{d && <Badge variant={d === 'approved' ? 'default' : 'destructive'}>{d}</Badge>}</div>
                  <p className='text-xs text-muted-foreground'>{v.uni} · {v.program} · verified via {v.method}</p>
                </div>
                {!d ? (
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={() => { setDecided((p) => ({ ...p, [v.id]: 'approved' })); toast.success(`${v.name} verified`) }}><Check className='size-3.5' />Approve</Button>
                    <Button size='sm' variant='outline' onClick={() => { setDecided((p) => ({ ...p, [v.id]: 'rejected' })); toast.info(`${v.name} rejected`) }}><X className='size-3.5' />Reject</Button>
                  </div>
                ) : <span className='text-xs text-muted-foreground'>Decided</span>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {tab === 'moderation' && data && (
      <div className='space-y-3'>
        {data.posts.filter((p) => flagged.has(p.id)).map((p) => {
          const author = data.users.find((u) => u.id === p.authorId)
          return (
            <Card key={p.id} className='glass-card border-amber-500/30'>
              <CardContent className='flex flex-col gap-3 p-4'>
                <div className='flex items-center gap-2'><Badge variant='outline' className='gap-1 border-amber-500/40 text-amber-500'><Flag className='size-3' />Flagged</Badge><b className='text-sm'>{author?.name}</b><span className='text-xs text-muted-foreground'>· {p.type}</span></div>
                <p className='line-clamp-2 text-sm text-muted-foreground'>{p.content}</p>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline' onClick={() => { setFlagged((prev) => { const n = new Set(prev); n.delete(p.id); return n }); toast.info('Flag dismissed') }}><Check className='size-3.5' />Dismiss flag</Button>
                  <Button size='sm' variant='destructive' onClick={() => { remove.mutate(p.id); setFlagged((prev) => { const n = new Set(prev); n.delete(p.id); return n }) }}><X className='size-3.5' />Remove post</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {data.posts.filter((p) => flagged.has(p.id)).length === 0 && <Card className='border-dashed'><CardContent className='py-16 text-center'><Check className='mx-auto mb-3 size-10 text-emerald-500' /><p className='font-medium'>No flagged posts</p><p className='text-sm text-muted-foreground'>Moderation queue is clear.</p></CardContent></Card>}
      </div>
    )}
  </PageContainer>
}

type InvestorTab = 'overview' | 'ventures' | 'mentors'

export function InvestorsPage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const [tab, setTab] = useState<InvestorTab>('overview')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All')
  const [query, setQuery] = useState('')
  const [watched, setWatched] = useState<Set<string>>(new Set(['mediroute']))
  const sectors = ['All', ...Array.from(new Set(startups.map((s) => s.sector)))]
  const stages = ['All', ...Array.from(new Set(startups.map((s) => s.stage)))]
  const filtered = startups.filter((s) =>
    (stage === 'All' || s.stage === stage) &&
    (sector === 'All' || s.sector === sector) &&
    `${s.name} ${s.sector} ${s.stage} ${s.summary}`.toLowerCase().includes(query.toLowerCase()),
  )
  const watchlist = startups.filter((s) => watched.has(s.slug))

  const stats = useMemo(() => {
    const counts = <T extends string>(arr: T[]) => arr.reduce<Record<string, number>>((acc, k) => { acc[k] = (acc[k] ?? 0) + 1; return acc }, {})
    const stageCounts = counts(startups.map((s) => s.stage))
    const sectorCounts = counts(startups.map((s) => s.sector))
    const avgScore = Math.round(startups.reduce((sum, s) => sum + s.score, 0) / (startups.length || 1))
    const ready = startups.filter((s) => s.score >= 85).length
    const openRoles = startups.reduce((sum, s) => sum + s.openRoles.length, 0)
    const backers = new Set(startups.flatMap((s) => s.backedBy)).size
    const activeMentors = mentors.filter((m) => m.status === 'active')
    const avgRating = (activeMentors.reduce((sum, m) => sum + m.rating, 0) / (activeMentors.length || 1)).toFixed(1)
    const totalSessions = activeMentors.reduce((sum, m) => sum + m.sessions, 0)
    const funnelOrder = ['Validating', 'Pilot', 'MVP']
    const funnel = funnelOrder.map((k) => ({ label: k, value: stageCounts[k] ?? 0 }))
    const engagement = (data?.posts ?? []).reduce((sum, p) => sum + p.reactions + p.comments + p.reposts, 0)
    const kindCounts = counts((data?.posts ?? []).map((p) => p.kind ?? 'update'))
    return { stageCounts, sectorCounts, avgScore, ready, openRoles, backers, activeMentors, avgRating, totalSessions, funnel, engagement, kindCounts }
  }, [data])

  const TABS: { key: InvestorTab; label: string }[] = [{ key: 'overview', label: 'Overview' }, { key: 'ventures', label: 'Ventures' }, { key: 'mentors', label: 'Mentors' }]

  return <PageContainer>
    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <PageHeading eyebrow='Investor access' title='Venture evidence, not noise.' description='Computed pipeline, traction and capacity signals across verified student startups — evidence first, no social feed.' />
      <Button variant='outline' onClick={() => toast.info('Ecosystem access request sent.')}><ShieldCheck className='size-4' />Request access</Button>
    </div>

    <div className='mb-6 flex flex-wrap gap-2'>
      {TABS.map((t) => (
        <button key={t.key} onClick={() => setTab(t.key)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all', tab === t.key ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/25')}>{t.label}</button>
      ))}
    </div>

    {tab === 'overview' && (
      <>
        {/* KPI row */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {[
            { label: 'Total ventures', value: String(startups.length), icon: Rocket, tone: 'text-emerald-500' },
            { label: 'Avg readiness', value: `${stats.avgScore}%`, icon: TrendingUp, tone: 'text-primary' },
            { label: 'Investor-ready', value: `${stats.ready} / ${startups.length}`, icon: Trophy, tone: 'text-amber-500' },
            { label: 'Active mentors', value: String(stats.activeMentors.length), icon: GraduationCap, tone: 'text-sky-500' },
          ].map((kpi) => (
            <Card key={kpi.label} className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'>
              <span className={cn('grid size-10 place-items-center rounded-xl bg-muted/60', kpi.tone)}><kpi.icon className='size-5' /></span>
              <div><CardDescription>{kpi.label}</CardDescription><CardTitle className='text-2xl'>{kpi.value}</CardTitle></div>
            </CardHeader></Card>
          ))}
        </div>

        {/* Funnel + stage donut */}
        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Deal-flow funnel</CardTitle><CardDescription>Ventures by readiness stage.</CardDescription></CardHeader>
            <CardContent><Funnel steps={stats.funnel} /></CardContent>
          </Card>
          <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Stage distribution</CardTitle><CardDescription>Where the pipeline concentrates.</CardDescription></CardHeader>
            <CardContent><Donut centerLabel={String(startups.length)} centerSub='ventures' segments={Object.entries(stats.stageCounts).map(([label, value], i) => ({ label, value, color: ['#10b981', '#f5b840', '#38bdf8', '#a78bfa'][i % 4] }))} /></CardContent>
          </Card>
        </div>

        {/* Sector mix + top readiness */}
        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Sector mix</CardTitle><CardDescription>Ventures per sector.</CardDescription></CardHeader>
            <CardContent>
              <BarList items={Object.entries(stats.sectorCounts).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))} />
            </CardContent>
          </Card>
          <Card className='glass-card'><CardHeader><CardTitle className='text-base'>Top ventures by readiness</CardTitle><CardDescription>Highest readiness scores.</CardDescription></CardHeader>
            <CardContent>
              <BarList max={100} suffix='%' items={[...startups].sort((a, b) => b.score - a.score).slice(0, 5).map((s, i) => ({ label: s.name, value: s.score, tone: ['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500'][i % 5] }))} />
              <Button size='sm' variant='ghost' className='mt-3 -ml-2' onClick={() => setTab('ventures')}>Browse all ventures <ChevronRight className='size-3.5' /></Button>
            </CardContent>
          </Card>
        </div>

        {/* Engagement + mentor capacity */}
        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          <Card className='glass-card'><CardHeader><CardTitle className='flex items-center gap-2 text-base'><TrendingUp className='size-4 text-primary' /> Ecosystem engagement</CardTitle><CardDescription>Computed from the activity feed.</CardDescription></CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-3 text-center'>
                {[{ v: String(data?.posts.length ?? 0), l: 'Updates' }, { v: (stats.engagement / 1000).toFixed(1) + 'k', l: 'Engagement' }, { v: String(Object.values(stats.kindCounts).reduce((a, b) => a + b, 0)), l: 'Signals' }].map((s) => (
                  <div key={s.l} className='rounded-xl bg-muted/40 p-3'><div className='text-xl font-extrabold text-foreground'>{s.v}</div><div className='text-[10px] uppercase tracking-wide text-muted-foreground'>{s.l}</div></div>
                ))}
              </div>
              <div>
                <div className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>Posts by kind</div>
                <BarList items={Object.entries(stats.kindCounts).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label: label[0].toUpperCase() + label.slice(1), value, tone: ['bg-primary', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500'][i % 6] }))} />
              </div>
              <Sparkline points={[3, 5, 4, 7, 6, 9, 8, 12]} value={String(data?.users.length ?? 0)} label='active builders (illustrative)' color='#10b981' />
            </CardContent>
          </Card>
          <Card className='glass-card'><CardHeader><CardTitle className='flex items-center gap-2 text-base'><GraduationCap className='size-4 text-amber-500' /> Mentor capacity</CardTitle><CardDescription>Backing available across the pipeline.</CardDescription></CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-3 text-center'>
                <div className='rounded-xl bg-muted/40 p-3'><div className='text-xl font-extrabold text-foreground'>{stats.activeMentors.length}</div><div className='text-[10px] uppercase tracking-wide text-muted-foreground'>Active</div></div>
                <div className='rounded-xl bg-muted/40 p-3'><div className='text-xl font-extrabold text-foreground'>★ {stats.avgRating}</div><div className='text-[10px] uppercase tracking-wide text-muted-foreground'>Avg rating</div></div>
                <div className='rounded-xl bg-muted/40 p-3'><div className='text-xl font-extrabold text-foreground'>{stats.totalSessions}</div><div className='text-[10px] uppercase tracking-wide text-muted-foreground'>Sessions</div></div>
              </div>
              <div><div className='mb-1 flex justify-between text-xs'><span className='text-muted-foreground'>Utilization</span><span className='font-semibold text-foreground'>72%</span></div><div className='h-2 overflow-hidden rounded-full bg-muted/50'><div className='h-full rounded-full bg-amber-500' style={{ width: '72%' }} /></div></div>
              <BarList items={[{ label: 'Fundraising', value: mentors.filter((m) => m.expertise.includes('Fundraising')).length }, { label: 'AI/ML', value: mentors.filter((m) => m.expertise.some((e) => e.includes('AI') || e.includes('ML'))).length }, { label: 'Product/Design', value: mentors.filter((m) => m.expertise.some((e) => e.includes('Product') || e.includes('Design'))).length }, { label: 'Climate/Health', value: mentors.filter((m) => m.expertise.some((e) => e.includes('Climate') || e.includes('Health'))).length }]} suffix=' mentors' />
            </CardContent>
          </Card>
        </div>

        {/* Portfolio signals */}
        <Card className='glass-card mt-6'><CardHeader><CardTitle className='text-base'>Portfolio signals</CardTitle><CardDescription>Aggregate, computed from venture data.</CardDescription></CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-3'>
            <div className='rounded-xl border bg-card/50 p-4'><div className='text-xs text-muted-foreground'>Open roles</div><div className='mt-1 text-2xl font-extrabold text-foreground'>{stats.openRoles}</div><div className='text-xs text-muted-foreground'>across {startups.length} ventures</div></div>
            <div className='rounded-xl border bg-card/50 p-4'><div className='text-xs text-muted-foreground'>Distinct backers</div><div className='mt-1 text-2xl font-extrabold text-foreground'>{stats.backers}</div><div className='text-xs text-muted-foreground'>verified in cap tables</div></div>
            <div className='rounded-xl border bg-card/50 p-4'><div className='text-xs text-muted-foreground'>Aggregate raised</div><div className='mt-1 text-2xl font-extrabold text-foreground'>$1.62M</div><div className='text-xs text-muted-foreground'>illustrative estimate</div></div>
          </CardContent>
        </Card>
      </>
    )}

    {tab === 'ventures' && (
      <>
        {watchlist.length > 0 && (
          <Card className='glass-card mb-6 overflow-hidden p-0'><CardHeader className='pb-2'><CardTitle className='flex items-center gap-2 text-base'><Bookmark className='size-4 text-amber-500' /> Watchlist</CardTitle><CardDescription>{watchlist.length} tracked {watchlist.length === 1 ? 'startup' : 'startups'}</CardDescription></CardHeader>
            <CardContent className='flex gap-3 overflow-x-auto pb-3'>{watchlist.map((s) => (
              <button key={s.slug} onClick={() => navigate({ to: '/startups/$slug', params: { slug: s.slug } })} className='flex w-48 shrink-0 flex-col gap-1 rounded-xl border bg-card/60 p-3 text-left transition-colors hover:border-primary/30'>
                <div className='flex items-center gap-2'><span className='grid size-8 place-items-center rounded-lg bg-primary/10 text-primary'><Rocket className='size-4' /></span><b className='truncate text-sm'>{s.name}</b></div>
                <span className='text-xs text-muted-foreground'>{s.sector} · {s.stage}</span>
                <div className='mt-1 h-1 overflow-hidden rounded-full bg-muted'><div className='h-full bg-primary' style={{ width: `${s.score}%` }} /></div>
              </button>
            ))}</CardContent>
          </Card>
        )}

        <div className='mb-5 flex flex-wrap items-center gap-3'>
          <div className='relative min-w-[220px] flex-1'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-9' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search ventures' /></div>
          <div className='flex flex-wrap gap-1.5'>{stages.map((st) => <button key={st} onClick={() => setStage(st)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition-all', stage === st ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{st}</button>)}</div>
        </div>
        <div className='mb-6 flex flex-wrap gap-1.5'>{sectors.map((sec) => <button key={sec} onClick={() => setSector(sec)} className={cn('rounded-full border px-3 py-1 text-[11px] font-medium transition-all', sector === sec ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : 'border-border text-muted-foreground hover:text-foreground')}>{sec}</button>)}</div>

        <div className='grid gap-5 lg:grid-cols-2'>{filtered.map((s) => {
          const current = s.milestones.find((m) => m.status === 'current')
          const isWatched = watched.has(s.slug)
          return (
            <Card key={s.slug} className='glass-card group flex flex-col overflow-hidden'>
              <div className='h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent' />
              <CardHeader className='flex-row items-start gap-3 space-y-0'>
                <span className='grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Rocket className='size-6' /></span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'><CardTitle className='text-base'>{s.name}</CardTitle><Badge variant='outline'>{s.sector}</Badge><Badge variant='secondary'>{s.stage}</Badge></div>
                  <CardDescription className='mt-1 flex items-center gap-1.5 text-xs'><MapPin className='size-3' />{s.location} · founded {s.founded}</CardDescription>
                </div>
                <Button variant='ghost' size='icon' aria-label='Watch' className={cn(isWatched && 'text-amber-500')} onClick={() => setWatched((prev) => { const n = new Set(prev); if (n.has(s.slug)) n.delete(s.slug); else n.add(s.slug); toast.success(isWatched ? 'Removed from watchlist' : 'Added to watchlist'); return n })}><Bookmark className={cn('size-4', isWatched && 'fill-current')} /></Button>
              </CardHeader>
              <CardContent className='flex-1 space-y-3'>
                <p className='text-sm leading-relaxed text-muted-foreground'>{s.summary}</p>
                <div><div className='flex items-center justify-between text-[11px] text-muted-foreground'><span>Readiness</span><span className='font-semibold text-foreground'>{s.score}%</span></div><div className='mt-1 h-1.5 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--primary)_55%,var(--accent))]' style={{ width: `${s.score}%` }} /></div></div>
                {current && <div className='rounded-lg border bg-card/50 p-2.5'><div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground'><Target className='size-3 text-amber-500' />Current milestone</div><p className='mt-1 text-sm'>{current.title}</p><p className='text-xs text-muted-foreground'>{current.desc}</p></div>}
                <div className='flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground'>
                  <span className='inline-flex items-center gap-1'><Users className='size-3' />{s.team.length} team</span>
                  <span className='inline-flex items-center gap-1'><BriefcaseBusiness className='size-3' />{s.openRoles.length} roles</span>
                  {s.backedBy.length > 0 && <span className='inline-flex items-center gap-1'><CircleDollarSign className='size-3 text-amber-500' />{s.backedBy[0]}</span>}
                  <Badge variant='outline' className='gap-1 text-[10px]'><GraduationCap className='size-2.5' />Mentor-backed</Badge>
                </div>
              </CardContent>
              <CardFooter className='gap-2 border-t'>
                <Button size='sm' variant='outline' onClick={() => toast.info(`Intro requested for ${s.name}.`)}><MessagesSquare className='size-3.5' />Request intro</Button>
                <Button size='sm' className='ml-auto' onClick={() => navigate({ to: '/startups/$slug', params: { slug: s.slug } })}>Evidence <ChevronRight className='size-3.5' /></Button>
              </CardFooter>
            </Card>
          )
        })}
          {filtered.length === 0 && <Card className='border-dashed lg:col-span-2'><CardContent className='py-16 text-center'><Rocket className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='font-medium'>No ventures match</p><p className='text-sm text-muted-foreground'>Adjust stage or sector filters.</p></CardContent></Card>}
        </div>
      </>
    )}

    {tab === 'mentors' && (
      <section>
        <div className='mb-4 flex items-center gap-2'><GraduationCap className='size-5 text-amber-500' /><h2 className='text-lg font-semibold'>Mentor directory</h2><Badge variant='secondary'>{stats.activeMentors.length} active</Badge></div>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>{mentors.filter((m) => m.status !== 'suspended').map((m) => (
          <Card key={m.id} className='glass-card'><CardContent className='p-4'>
            <div className='flex items-start gap-3'><span className='grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500'><GraduationCap className='size-5' /></span>
              <div className='min-w-0 flex-1'><b className='block text-sm'>{m.name}</b><p className='truncate text-xs text-muted-foreground'>{m.title}</p></div>
              <Badge variant='outline' className='text-[10px]'>{m.focusStage}</Badge>
            </div>
            <div className='mt-2 flex flex-wrap gap-1'>{m.expertise.map((e) => <Badge key={e} variant='secondary' className='text-[10px]'>{e}</Badge>)}</div>
            <p className='mt-2 text-[11px] text-muted-foreground'>★ {m.rating.toFixed(1)} · {m.sessions} sessions</p>
            <Button size='sm' variant='outline' className='mt-3 w-full' onClick={() => toast.info(`Office hours requested with ${m.name}.`)}>Book office hours</Button>
          </CardContent></Card>
        ))}</div>
      </section>
    )}
  </PageContainer>
}


/* ------------------------------------------------------------------ */
/*  Startup Hiring Rankings — animated racing leaderboard             */
/* ------------------------------------------------------------------ */

interface RankingStartup {
  slug: string; name: string; sector: string; color: string; openRoles: number; weeks: number[]
}

// Hiring-momentum over 12 weeks (composite of open roles × growth signals).
// Series cross over on purpose so ranks race.
const startupRankings: RankingStartup[] = [
  { slug: 'greenstack', name: 'GreenStack', sector: 'Climate', color: '#10b981', openRoles: 5, weeks: [40, 42, 45, 50, 55, 60, 68, 72, 70, 75, 82, 88] },
  { slug: 'edflow', name: 'EduFlow', sector: 'EdTech', color: '#a78bfa', openRoles: 3, weeks: [70, 72, 75, 73, 70, 65, 62, 60, 58, 55, 60, 62] },
  { slug: 'medimatch', name: 'MediMatch', sector: 'Health', color: '#f5b840', openRoles: 2, weeks: [50, 55, 58, 60, 62, 65, 64, 66, 70, 72, 74, 78] },
  { slug: 'mediroute', name: 'MediRoute', sector: 'Health', color: '#38bdf8', openRoles: 1, weeks: [85, 84, 82, 80, 78, 75, 72, 70, 68, 66, 64, 60] },
  { slug: 'skillbridge', name: 'SkillBridge AI', sector: 'EdTech', color: '#f87171', openRoles: 4, weeks: [35, 38, 42, 48, 52, 58, 62, 65, 68, 72, 76, 80] },
  { slug: 'modelworks', name: 'ModelWorks', sector: 'AI', color: '#14b8a6', openRoles: 3, weeks: [60, 62, 60, 58, 60, 62, 65, 68, 66, 64, 66, 68] },
  { slug: 'orbitlabs', name: 'Orbit Labs', sector: 'SaaS', color: '#fb923c', openRoles: 2, weeks: [45, 44, 42, 40, 38, 40, 42, 45, 48, 50, 52, 54] },
  { slug: 'northstudio', name: 'North Studio', sector: 'Design', color: '#c084fc', openRoles: 1, weeks: [30, 32, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60] },
]

const RANK_WEEKS = 12
const RANK_ROW_H = 74

export function RankingsPage() {
  const [week, setWeek] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const trackRef = useRef<HTMLDivElement>(null)
  const rowEls = useRef<Map<string, HTMLDivElement>>(new Map())
  useGSAP(() => { gsap.set('[data-rank-row]', { y: 0 }) }, { scope: trackRef })

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => setWeek((w) => (w + 1) % RANK_WEEKS), 1500 / speed)
    return () => window.clearTimeout(id)
  }, [week, playing, speed])

  const ranked = useMemo(() => startupRankings
    .map((s) => ({ slug: s.slug, momentum: s.weeks[week] }))
    .sort((a, b) => b.momentum - a.momentum), [week])
  const rankOf = (slug: string) => ranked.findIndex((r) => r.slug === slug)
  const maxMomentum = Math.max(...ranked.map((r) => r.momentum), 1)

  useGSAP(() => {
    startupRankings.forEach((s) => {
      const el = rowEls.current.get(s.slug)
      if (!el) return
      gsap.to(el, { y: rankOf(s.slug) * RANK_ROW_H, duration: 0.85, ease: 'power3.inOut' })
    })
  }, { dependencies: [week] })

  const leader = ranked[0] ? startupRankings.find((s) => s.slug === ranked[0].slug) : null
  // biggest climber vs week 0
  const climber = [...startupRankings].map((s) => ({ s, delta: s.weeks[week] - s.weeks[Math.max(0, week - 1)] })).sort((a, b) => b.delta - a.delta)[0]
  const totalRoles = startupRankings.reduce((sum, s) => sum + s.openRoles, 0)

  return <PageContainer>
    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <PageHeading eyebrow='Hiring rankings' title='The race for talent, week by week.' description='Student startups compete by hiring momentum — open roles weighted by growth signals. Bars race as the quarter unfolds.' />
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}><Gauge className='size-4' />{speed}× speed</Button>
        <Button variant='outline' size='sm' onClick={() => { setWeek(0); setPlaying(true) }}><RefreshCw className='size-4' />Restart</Button>
        <Button size='sm' onClick={() => setPlaying((p) => !p)}>{playing ? <><Pause className='size-4' />Pause</> : <><Play className='size-4' />Play</>}</Button>
      </div>
    </div>

    {/* KPI row */}
    <div className='mb-6 grid gap-4 sm:grid-cols-3'>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-amber-500/15'><MotionRocket color='#f5b840' boost size={20} /></span><div><CardDescription>Current leader</CardDescription><CardTitle className='text-lg'>{leader?.name ?? '—'}</CardTitle></div></CardHeader></Card>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500'><TrendingUp className='size-5' /></span><div><CardDescription>Biggest climber</CardDescription><CardTitle className='text-lg'>{climber?.s.name ?? '—'} <span className='text-xs font-semibold text-emerald-500'>+{climber?.delta ?? 0}</span></CardTitle></div></CardHeader></Card>
      <Card className='glass-card'><CardHeader className='flex-row items-center gap-3 space-y-0'><span className='grid size-10 place-items-center rounded-xl bg-sky-500/15 text-sky-500'><BriefcaseBusiness className='size-5' /></span><div><CardDescription>Open roles tracked</CardDescription><CardTitle className='text-lg'>{totalRoles}</CardTitle></div></CardHeader></Card>
    </div>

    {/* Week scrubber */}
    <Card className='glass-card mb-5 p-4'><div className='flex items-center gap-4'>
      <div className='text-sm font-semibold whitespace-nowrap'>Week {week + 1}<span className='text-muted-foreground'> / {RANK_WEEKS}</span></div>
      <input type='range' min={0} max={RANK_WEEKS - 1} value={week} onChange={(e) => { setWeek(Number(e.target.value)); setPlaying(false) }} className='h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary' />
    </div></Card>

    {/* Racing track */}
    <Card className='glass-card overflow-hidden p-0'>
      <div className='flex items-center justify-between border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        <span>Hiring momentum</span><span>Live ranking</span>
      </div>
      <div className='relative px-3 py-3 sm:px-4' style={{ height: startupRankings.length * RANK_ROW_H + 8 }}>
        <div ref={trackRef} className='relative'>
          {startupRankings.map((s) => {
            const rank = rankOf(s.slug)
            const momentum = s.weeks[week]
            const prev = s.weeks[Math.max(0, week - 1)]
            const change = momentum - prev
            const widthPct = (momentum / maxMomentum) * 100
            const isLeader = rank === 0
            return (
              <div
                key={s.slug}
                data-rank-row={s.slug}
                ref={(el) => { if (el) rowEls.current.set(s.slug, el) }}
                className='absolute inset-x-0' style={{ top: 4, height: RANK_ROW_H - 8 }}
              >
                <div className='flex h-full items-center gap-3'>
                  <div className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold', isLeader ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground')}>{rank + 1}</div>
                  <div className='grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white' style={{ background: s.color }}>{s.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
                  <div className='w-28 shrink-0 truncate sm:w-36'><b className='block truncate text-sm'>{s.name}</b><span className='text-[10px] text-muted-foreground'>{s.sector} · {s.openRoles} open</span></div>
                  <div className='relative h-7 flex-1 rounded-md bg-muted/40'>
                    <div className='absolute inset-y-0 left-0 flex items-center overflow-hidden rounded-md px-2 transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]' style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${s.color}, color-mix(in srgb, ${s.color} 60%, #f5b840))`, boxShadow: isLeader ? `0 0 22px -4px ${s.color}` : 'none' }}>
                      <span className='truncate text-xs font-bold text-white drop-shadow-sm'>{momentum}</span>
                    </div>
                    {/* Rocket riding the leading edge — boosts on rank climb */}
                    <div className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]' style={{ left: `${widthPct}%` }}>
                      <MotionRocket color={s.color} boost={change > 0} size={17} />
                    </div>
                  </div>
                  <div className='w-12 shrink-0 text-right'>
                    {change > 0 && <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500'><ArrowUp className='size-3' />{change}</span>}
                    {change < 0 && <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-red-400'><ArrowDown className='size-3' />{Math.abs(change)}</span>}
                    {change === 0 && <span className='text-xs text-muted-foreground'>—</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>

    <p className='mt-4 text-xs text-muted-foreground'>Momentum = open roles weighted by recent growth and engagement signals. Series is illustrative for the demo; the real metric will be computed server-side when the backend lands.</p>
  </PageContainer>
}


function JobCard({ job }: { job: Job }) { const apply = useAction(() => apiClient.toggleJob(job.id, 'applied')); const save = useAction(() => apiClient.toggleJob(job.id, 'saved')); const saveRef = useRef<HTMLButtonElement>(null); const bookmarkAnim = useBookmarkAnimation(); const handleSave = () => { if (saveRef.current) bookmarkAnim(saveRef.current); save.mutate() }; return <Card className='md:flex-row md:items-center'><CardHeader className='flex-1'><div className='mb-2 flex gap-2'>{job.featured && <Badge>Featured</Badge>}<Badge variant='secondary'>{job.type}</Badge></div><CardTitle>{job.role}</CardTitle><CardDescription>{job.company} . {job.location}</CardDescription><p className='pt-2 text-sm text-muted-foreground'>{job.skills}</p></CardHeader><CardFooter className='gap-2 md:pt-6'><Button variant={job.applied ? 'outline' : 'default'} onClick={() => apply.mutate()}>{job.applied ? 'Applied' : 'Easy apply'}</Button><Button ref={saveRef} variant='outline' size='icon' onClick={handleSave} className={job.saved ? 'text-primary' : ''}><Bookmark className={job.saved ? 'fill-current' : ''} /></Button></CardFooter></Card> }


export function MessagesPage() {
  const { data } = useSnapshot(); const [selected, setSelected] = useState<number | null>(null); const [text, setText] = useState(''); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('All')
  const conversations = useMemo(() => data?.conversations.filter((item) => data.currentUser && item.participantIds.includes(data.currentUser.id)) ?? [], [data])
  const activeId = selected ?? conversations[0]?.id ?? null
  const send = useAction(() => activeId ? apiClient.sendMessage(activeId, text) : Promise.resolve(), 'Message sent')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const active = conversations.find((item) => item.id === activeId)
  const otherId = active?.participantIds.find((id) => id !== data?.currentUser?.id)
  const other = data?.users.find((user) => user.id === otherId)
  const messages = data?.messages.filter((message) => message.conversationId === activeId) ?? []
  useBubbleEntrance(messagesContainerRef, messages.length)
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to open your messages' />
  const filtered = conversations.filter((item) => { const id = item.participantIds.find((value) => value !== data.currentUser?.id); const user = data.users.find((value) => value.id === id); return `${user?.name} ${user?.title}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || user?.title.toLowerCase().includes(filter.toLowerCase())) })
  return <PageContainer className='py-5'><Card className='h-[calc(100svh-8rem)] min-h-[620px] overflow-hidden p-0'><div className='grid h-full md:grid-cols-[340px_1fr] lg:grid-cols-[220px_330px_1fr]'>
    <aside className='hidden min-h-0 flex-col border-r bg-muted/20 lg:flex'><div className='flex items-center gap-3 border-b p-5'><span className='grid size-10 place-items-center rounded-xl border bg-card'><School className='size-5 text-primary' /></span><div><b className='block'>Stanford Hub</b><small className='text-muted-foreground'>Institutional Admin</small></div></div><nav className='flex-1 space-y-1 overflow-y-auto p-3'><Button variant='ghost' className='w-full justify-start'><LayoutDashboard />Dashboard</Button><Button variant='ghost' className='w-full justify-start'><Target />Startup Index</Button><Button variant='ghost' className='w-full justify-start'><ClipboardCheck />Investor Deck</Button><Button variant='ghost' className='w-full justify-start'><Users />Talent Pool</Button><Button variant='ghost' className='w-full justify-start'><Rocket />Milestones</Button><Button variant='ghost' className='w-full justify-start'><Settings />Settings</Button></nav><div className='border-t p-4'><Button className='w-full'>Raise Capital</Button><div className='mt-3 grid grid-cols-2 gap-1'><Button size='sm' variant='ghost'><CircleHelp />Support</Button><Button size='sm' variant='ghost' onClick={() => document.documentElement.classList.toggle('dark')}><Moon />Theme</Button></div></div></aside>
    <aside className='flex min-h-0 flex-col border-r'><div className='border-b p-5'><div className='flex items-center justify-between'><h1 className='text-2xl font-bold'>Messages</h1><NewConversationDialog users={data.users.filter((u) => u.id !== data.currentUser?.id)} onSelect={async (userId) => { const id = await apiClient.ensureConversation(userId); setSelected(id) }} /></div><div className='relative mt-4'><Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' /><Input className='pl-10' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search conversations...' /></div></div><div className='flex gap-2 overflow-x-auto border-b p-3'>{['All', 'Mentor', 'Founder', 'Investor'].map((item) => <Button key={item} size='sm' className='rounded-full' variant={filter === item ? 'default' : 'outline'} onClick={() => setFilter(item)}>{item}</Button>)}</div><div className='flex-1 overflow-y-auto'>{filtered.map((item) => { const id = item.participantIds.find((value) => value !== data.currentUser?.id); const user = data.users.find((value) => value.id === id); const threadMessages = data.messages.filter((message) => message.conversationId === item.id); const preview = threadMessages[threadMessages.length - 1]; return <button key={item.id} onClick={() => setSelected(item.id)} className={cn('relative flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-muted/60', item.id === activeId && 'bg-muted/70 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500')}><span className='relative'><UserAvatar user={user} className='size-12' /><i className='absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-emerald-500' /></span><span className='min-w-0 flex-1'><span className='flex justify-between gap-2'><b className='truncate'>{user?.name}</b><small className='text-muted-foreground'>Now</small></span><small className='mt-1 block text-emerald-500'>{user?.title || 'Founder'}</small><span className='mt-1 block truncate text-sm text-muted-foreground'>{preview?.text || 'Start the conversation'}</span></span></button> })}</div></aside>
    <section className='hidden min-w-0 flex-col md:flex'>{other ? <><header className='flex min-h-[88px] items-center gap-3 border-b p-4'><UserAvatar user={other} className='size-12' /><div className='min-w-0'><div className='flex items-center gap-2'><b>{other.name}</b><BadgeCheck className='size-4 text-emerald-500' /></div><div className='mt-1 flex flex-wrap items-center gap-2'><span className='truncate text-xs text-muted-foreground'>Stanford University · Computer Science</span><Badge variant='outline' className='text-[9px]'>End-to-End Encrypted</Badge></div></div><div className='ml-auto flex gap-1'><Button variant='outline' size='sm'><MessagesSquare />Video Sync</Button><Button variant='ghost' size='icon' aria-label='Conversation options'><MoreHorizontal /></Button></div></header><div ref={messagesContainerRef} className='flex-1 space-y-5 overflow-y-auto bg-muted/20 p-6'><div className='mx-auto w-fit rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground'>Today</div><Card className='mx-auto max-w-md'><CardContent className='flex gap-3 p-3'><CalendarDays className='mt-1 size-5 text-primary' /><div><b className='text-sm'>Upcoming Milestone Review</b><p className='mt-1 text-xs text-muted-foreground'>Thursday, 2:00 PM · Founder review room</p></div></CardContent></Card>{messages.map((message) => { const mine = message.senderId === data.currentUser?.id; return <div key={message.id} className={cn('flex max-w-[82%] gap-2', mine && 'ml-auto flex-row-reverse')}><UserAvatar user={mine ? data.currentUser : other} className='mt-auto size-8' /><div><small className={cn('mb-1 block text-muted-foreground', mine && 'text-right')}>{mine ? 'You' : other.name}</small><div className={cn('rounded-2xl px-4 py-3 text-sm shadow-sm', mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border bg-card')}>{message.text}</div></div></div> })}<div className='max-w-[82%] rounded-2xl rounded-bl-sm border bg-card p-4 text-sm'><p>The revised deck looks stronger. Review the attached institutional GTM framework before our sync.</p><button className='mt-3 flex w-full items-center gap-3 rounded-xl border bg-muted/40 p-3 text-left hover:border-primary'><ClipboardCheck className='text-red-500' /><span><b className='block text-xs'>GTM_Framework_Q3.pdf</b><small className='text-muted-foreground'>2.4 MB · PDF Document</small></span></button></div></div><form className='border-t p-4' onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; send.mutate(undefined, { onSuccess: () => setText('') }) }}><div className='mb-3 flex items-center gap-2 overflow-x-auto'><span className='shrink-0 text-[10px] font-semibold uppercase text-muted-foreground'>Quick Actions:</span><Button type='button' size='sm' variant='outline' className='h-7 rounded-full text-[10px]' onClick={() => setText('Could we schedule a 15-minute sync?')}>Schedule Sync</Button><Button type='button' size='sm' variant='outline' className='h-7 rounded-full text-[10px]' onClick={() => setText('I am sharing the updated investor deck for review.')}>Share Deck</Button></div><div className='flex items-end gap-2 rounded-xl border bg-muted/30 p-2 focus-within:ring-2 focus-within:ring-ring'><Button type='button' variant='ghost' size='icon' aria-label='Attach file'><Plus /></Button><Textarea className='min-h-11 flex-1 resize-none border-0 bg-transparent' rows={1} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.ctrlKey && event.key === 'Enter') event.currentTarget.form?.requestSubmit() }} placeholder='Draft professional response...' /><Button size='icon' aria-label='Send'><Send /></Button></div><p className='mt-2 px-2 text-[10px] text-muted-foreground'>Use <b>Ctrl + Enter</b> to send</p></form></> : <div className='grid flex-1 place-items-center text-center text-muted-foreground'><div><MessagesSquare className='mx-auto mb-3 size-10' /><p>Start a conversation from the network.</p></div></div>}</section>
  </div></Card></PageContainer>
}

const notificationSeed = [
  { id: 1, group: 'Connection Requests', title: 'Sarah Chen', body: 'Requested to connect. Shared interest in AI/ML infrastructure.', time: '2 hours ago', action: 'Accept' },
  { id: 2, group: 'Mentor Feedback', title: 'Pitch Deck Review Completed', body: 'Dr. Alan Turing left detailed annotations on your Q3 Seed Deck.', time: 'Yesterday at 14:30', action: 'View Details' },
  { id: 3, group: 'Investment Interest', title: 'Data Room Accessed', body: 'A verified Tier 1 VC viewed your financial projections and capitalization table.', time: 'Today at 09:15', action: 'View Analytics' },
]

export function NotificationsPage() {
  const [read, setRead] = useState<number[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const notifications = notificationSeed.filter((item) => filter === 'all' || !read.includes(item.id))
  return <PageContainer>
    <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'><PageHeading eyebrow='Activity center' title='Notifications' description='Manage alerts, trust signals and institutional updates.' /><div className='flex gap-2'><Button variant='outline' onClick={() => setRead(notificationSeed.map((item) => item.id))}>Mark all as read</Button><Button variant='outline' size='icon' aria-label='Notification settings'><Settings /></Button></div></div>
    <div className='grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]'><main className='space-y-7'>{['Connection Requests', 'Mentor Feedback', 'Investment Interest'].map((group) => { const items = notifications.filter((item) => item.group === group); if (!items.length) return null; return <section key={group}><div className='mb-3 flex items-center gap-2'><Bell className='size-4 text-muted-foreground' /><h2 className='font-semibold'>{group}</h2><Badge>{items.length}</Badge></div><div className='space-y-3'>{items.map((item) => <Card key={item.id} className={cn('notification-card relative overflow-hidden', !read.includes(item.id) && 'border-emerald-500/30')}><CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'>{!read.includes(item.id) && <span className='absolute top-5 right-5 size-2 rounded-full bg-emerald-500' />}<span className='grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>{group === 'Connection Requests' ? <UserPlus /> : group === 'Mentor Feedback' ? <ClipboardCheck /> : <Target />}</span><div className='min-w-0 flex-1'><div className='flex flex-wrap items-center gap-2'><h3 className='font-semibold'>{item.title}</h3>{group === 'Investment Interest' && <Badge className='bg-emerald-300 text-emerald-950'>Tier 1 VC</Badge>}</div><p className='mt-1 text-sm text-muted-foreground'>{item.body}</p><small className='mt-2 block text-muted-foreground'>{item.time}</small></div><div className='flex gap-2'><Button size='sm' onClick={() => setRead((current) => [...new Set([...current, item.id])])}>{item.action}</Button>{group === 'Connection Requests' && <Button size='sm' variant='outline' onClick={() => setRead((current) => [...new Set([...current, item.id])])}>Decline</Button>}</div></CardContent></Card>)}</div></section> })}{!notifications.length && <Card className='border-dashed'><CardContent className='py-16 text-center'><Check className='mx-auto size-10 text-emerald-500' /><h2 className='mt-4 text-lg font-semibold'>You are all caught up</h2></CardContent></Card>}</main>
      <aside className='space-y-6'><Card><CardHeader><CardTitle className='text-base'>Filter Views</CardTitle></CardHeader><CardContent className='flex flex-wrap gap-2'><Button className='rounded-full' size='sm' variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Updates</Button><Button className='rounded-full' size='sm' variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Unread ({notificationSeed.length - read.length})</Button></CardContent></Card><section><h3 className='border-b pb-3 font-semibold'>System Alerts</h3><div className='mt-3 space-y-2'><SystemAlert icon={BadgeCheck} title='Identity Verified' text='Your student status has been successfully validated.' tone='text-emerald-500' /><SystemAlert icon={Target} title='Profile Incomplete' text='Add technical projects to improve your Trust Score.' tone='text-amber-500' /></div></section></aside>
    </div>
  </PageContainer>
}

function SystemAlert({ icon: Icon, title, text, tone }: { icon: typeof BadgeCheck; title: string; text: string; tone: string }) { return <div className='flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50'><Icon className={cn('mt-0.5 size-5 shrink-0', tone)} /><div><b className='text-sm'>{title}</b><p className='mt-1 text-xs leading-5 text-muted-foreground'>{text}</p></div></div> }

export function ProfilePage() {
  const { data } = useSnapshot()
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to view your profile' />
  const user = data.currentUser
  const skills = user.skills.split(',').map((skill) => skill.trim()).filter(Boolean)

  return <div className='app-container grid min-h-[calc(100svh-4rem)] lg:grid-cols-[240px_1fr]'>
    <aside className='hidden border-r py-8 pr-5 lg:flex lg:flex-col'>
      <div className='mb-7'><h2 className='text-xl font-bold'>Founder OS</h2><p className='mt-1 text-sm text-muted-foreground'>Institutional Grade</p></div>
      <nav className='space-y-2'>
        <Button className='w-full justify-start' variant='secondary'><Users />Profile Status</Button>
        <Button className='w-full justify-start' variant='ghost'><BadgeCheck />Verification</Button>
        <Button className='w-full justify-start' variant='ghost'><Target />Goals</Button>
        <Button className='w-full justify-start' variant='ghost'><Settings />Settings</Button>
      </nav>
      <div className='mt-auto space-y-3 pt-8'><Button className='w-full'><Rocket />Create Startup</Button><div className='grid grid-cols-2 gap-2'><Button variant='ghost' size='sm'><CircleHelp />Help</Button><Button variant='ghost' size='sm'><ShieldCheck />Privacy</Button></div></div>
    </aside>

    <main className='min-w-0 py-6 lg:pl-7'>
      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='space-y-6'>
          <Card className='relative overflow-hidden'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_35%)]' />
            <CardContent className='relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center'>
              <UserAvatar user={user} className='size-32 shrink-0 border-4 border-background text-3xl shadow-lg sm:size-36' />
              <div className='min-w-0 flex-1'><div className='flex flex-wrap items-center gap-3'><h1 className='text-3xl font-bold tracking-tight'>{user.name}</h1><Badge className='gap-1 bg-emerald-500 text-white'><BadgeCheck className='size-3.5' />Verified Founder</Badge></div><h2 className='mt-2 text-lg font-semibold text-muted-foreground'>{user.title}</h2><p className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'><School className='size-4' />Stanford University</p><div className='mt-6 flex flex-wrap gap-3'><Button><UserPlus />Connect</Button><Button variant='outline' asChild><Link to='/messages'><MessagesSquare />Message</Link></Button><EditProfile user={user} /></div></div>
            </CardContent>
          </Card>

          <section className='grid gap-4 md:grid-cols-2'>
            <Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>{user.about || 'Building institutional-grade products for the next generation of student entrepreneurs.'}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Verified Skills</CardTitle></CardHeader><CardContent className='flex flex-wrap gap-2'>{skills.map((skill, index) => <span key={skill} className='flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm'><b>{skill}</b><span className='rounded bg-background px-1.5 font-mono text-xs text-emerald-500'>{8 + index * 4}</span></span>)}</CardContent></Card>
          </section>

          <Card className='overflow-hidden'><CardHeader className='flex-row items-center justify-between border-b'><div><CardTitle>Current Startup</CardTitle><CardDescription>Verified proof of work</CardDescription></div><Badge className='bg-emerald-300 text-emerald-950'>Seed Stage</Badge></CardHeader><CardContent className='grid gap-6 p-6 md:grid-cols-[190px_1fr] md:items-center'><div className='grid h-32 place-items-center rounded-xl border bg-[linear-gradient(135deg,var(--muted),color-mix(in_oklch,var(--primary)_16%,var(--muted)))]'><Rocket className='size-12 text-primary' /></div><div><h3 className='text-2xl font-bold'>Nexus Ledger</h3><p className='mt-1 text-sm text-muted-foreground'>Co-Founder & CTO</p><p className='mt-4 leading-6 text-muted-foreground'>A unified capitalization table and equity management platform designed for university-backed ventures.</p><Button variant='link' className='mt-3 px-0' asChild><Link to='/startups'>View Startup Profile <ArrowRight /></Link></Button></div></CardContent></Card>
        </div>

        <aside className='space-y-4'>
          <Card className='overflow-hidden border-primary/20 bg-primary text-primary-foreground'><CardHeader><CardTitle>Founder Readiness</CardTitle></CardHeader><CardContent><div className='flex items-end gap-3'><strong className='text-5xl text-emerald-400'>88</strong><span className='pb-1 text-primary-foreground/70'>/ 100</span></div><ReadinessBar label='Peer Reviews' value={92} /><ReadinessBar label='Milestone Velocity' value={85} /></CardContent></Card>
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

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const navigate = useNavigate()
  useEffect(() => { navigate({ to: mode === 'sign-in' ? '/sign-in' : '/sign-up' }) }, [mode, navigate])
  return null
}

function NewConversationDialog({ users, onSelect }: { users: User[]; onSelect: (userId: number) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = users.filter((u) => `${u.name} ${u.title}`.toLowerCase().includes(search.toLowerCase()))
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant='ghost' size='icon' aria-label='New conversation'><Plus /></Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>New conversation</DialogTitle><DialogDescription>Select a community member to message.</DialogDescription></DialogHeader><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search members...' /><div className='max-h-60 space-y-1 overflow-y-auto'>{filtered.map((user) => <button key={user.id} onClick={() => { onSelect(user.id); setOpen(false); setSearch('') }} className='flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted'><UserAvatar user={user} /><div><b className='text-sm'>{user.name}</b><p className='text-xs text-muted-foreground'>{user.title}</p></div></button>)}</div></DialogContent></Dialog>
}

function SideLink({ icon: Icon, children }: { icon: typeof Bookmark; children: React.ReactNode }) { return <Button variant='ghost' className='justify-start'><Icon />{children}</Button> }
function ProfileInfo({ label, value }: { label: string; value: string }) { return <div className='rounded-xl bg-muted/50 p-4'><p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p><p className='mt-2 font-medium'>{value || 'Not added'}</p></div> }
function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn('app-container py-8 lg:py-10', className)}>{children}</div> }
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className='mb-8 max-w-3xl'><Badge variant='secondary'>{eyebrow}</Badge><h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-4xl'>{title}</h1><p className='mt-3 text-lg text-muted-foreground'>{description}</p></div> }
function PageLoading() { return <PageContainer><div className='h-40 animate-pulse rounded-xl bg-muted' /></PageContainer> }
function AuthRequired({ title }: { title: string }) { return <PageContainer><Card className='mx-auto max-w-lg text-center'><CardHeader><CardTitle>{title}</CardTitle><CardDescription>Your conversations and profile are kept private.</CardDescription></CardHeader><CardFooter className='justify-center'><Button asChild><Link to='/sign-in'>Sign in</Link></Button></CardFooter></Card></PageContainer> }

function LetsStart() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const actions = [
    { label: 'Start live video keet', icon: Video, desc: 'Meet face-to-face with community', color: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400', to: '/live' },
    { label: 'Browse opportunities', icon: BriefcaseBusiness, desc: 'Roles, projects and referrals', color: 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400', to: '/jobs' },
    { label: 'Find your community', icon: Network, desc: 'Founder groups and discussions', color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400', to: '/communities' },
    { label: 'Connect with people', icon: Users, desc: 'Meet aligned collaborators', color: 'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400', to: '/network' },
    { label: 'Start a startup', icon: Rocket, desc: 'Create or join a venture', color: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400', to: '/startups' },
    { label: 'Find a mentor', icon: GraduationCap, desc: 'Get focused guidance', color: 'from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400', to: '/mentorship' },
  ]
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button size='sm' className='gap-1.5 bg-primary text-primary-foreground hover:brightness-110 shadow-xs whitespace-nowrap'>
        <Sparkles className='size-3.5' /> Let's Start
      </Button>
    </DialogTrigger>
    <DialogContent className='sm:max-w-xl'>
      <DialogHeader>
        <DialogTitle className='text-2xl'>What do you want to do?</DialogTitle>
        <DialogDescription className='text-base'>Pick a direction to jump right in.</DialogDescription>
      </DialogHeader>
      <div className='grid gap-2 py-2'>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => { setOpen(false); navigate({ to: action.to }) }}
            className='group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${action.color}`}>
              <action.icon className='size-5' />
            </span>
            <div className='min-w-0 flex-1'>
              <b className='block text-sm group-hover:text-primary transition-colors'>{action.label}</b>
              <span className='text-xs text-muted-foreground'>{action.desc}</span>
            </div>
            <ChevronRight className='size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary' />
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
}

export function LivePage() {
  const { data } = useSnapshot()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [messages, setMessages] = useState<Array<{ name: string; text: string; time: string }>>([
    { name: 'System', text: 'Welcome to the Keet room!', time: 'now' },
  ])
  const [remotePeers, _setRemotePeers] = useState(data?.users.filter((u) => u.id !== data.currentUser?.id).slice(0, 3) ?? [])
  const roomRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setMessages((prev) => [...prev, { name: data?.currentUser?.name ?? 'You', text: chatMsg, time: 'just now' }])
    setChatMsg('')
  }

  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to join the Keet' />

  const videoTiles = [
    { id: 'local', name: data.currentUser.name, isLocal: true, camOn },
    ...remotePeers.map((u) => ({ id: String(u.id), name: u.name, isLocal: false, camOn: true })),
  ]

  return (
    <div ref={roomRef} className='relative isolate flex min-h-[calc(100svh-4rem)] flex-col bg-neutral-950 dark:bg-neutral-950'>
      {/* Room header */}
      <div className='flex items-center justify-between border-b border-white/10 px-5 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='relative flex size-2.5'>
              <span className='absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex size-2.5 rounded-full bg-emerald-400' />
            </span>
            <span className='text-sm font-medium text-white'>Student Startup Community · Keet</span>
          </div>
          <span className='hidden rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60 sm:inline'>Beta</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1.5 text-white/70 hover:text-white hover:bg-white/10'
            onClick={() => setParticipantsOpen(!participantsOpen)}
          >
            <Users className='size-4' />
            <span className='hidden sm:inline'>{remotePeers.length + 1}</span>
          </Button>
          <span className='text-xs text-white/40'>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main area: video grid + optional panels */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Video grid */}
        <div className='flex-1 overflow-y-auto p-3'>
          <div className={cn(
            'grid gap-3',
            videoTiles.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
            videoTiles.length <= 4 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          )}>
            {videoTiles.map((tile) => (
              <div
                key={tile.id}
                className={cn(
                  'relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 ring-1 ring-white/10 transition-all duration-300',
                  tile.isLocal && 'ring-primary/30'
                )}
              >
                {/* Avatar / video placeholder */}
                <div className='flex flex-col items-center gap-2'>
                  <div className={cn(
                    'grid size-20 place-items-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600 text-3xl font-bold text-white shadow-lg',
                    tile.isLocal && 'ring-2 ring-primary/50'
                  )}>
                    {tile.name.split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className='text-sm font-medium text-white/80'>{tile.isLocal ? 'You' : tile.name}</span>
                  {!tile.camOn && <span className='text-xs text-white/40'>Camera off</span>}
                </div>
                {/* Mic/off badge */}
                {tile.isLocal && !micOn && (
                  <div className='absolute bottom-3 right-3 rounded-full bg-rose-500/20 p-1.5'>
                    <MicOff className='size-3.5 text-rose-400' />
                  </div>
                )}
                {/* Local badge */}
                {tile.isLocal && (
                  <div className='absolute left-3 top-3 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60'>
                    You
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* News & Events during meet */}
          <div className='mt-6 space-y-5'>
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <Newspaper className='size-4 text-white/50' />
                <span className='text-xs font-semibold uppercase tracking-wider text-white/40'>Latest news</span>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {newsItems.slice(0, 2).map((item) => (
                  <div key={item.title} className='rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition-all hover:bg-white/10'>
                    <div className='flex items-center gap-2 text-[10px] text-white/40'>
                      <span className='rounded bg-white/10 px-1.5 py-0.5 font-medium text-white/60'>{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className='mt-2 text-sm font-medium text-white'>{item.title}</h4>
                    <p className='mt-1 text-xs text-white/50 line-clamp-2'>{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <CalendarDays className='size-4 text-white/50' />
                <span className='text-xs font-semibold uppercase tracking-wider text-white/40'>Upcoming events</span>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {eventItems.slice(0, 2).map((event) => (
                  <div key={event.title} className='flex items-center gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all hover:bg-white/10'>
                    <div className='grid size-14 shrink-0 place-items-center rounded-lg bg-white/10 text-center'>
                      <b className='block text-lg font-bold text-white'>{event.day}</b>
                      <span className='text-[9px] font-bold uppercase tracking-wider text-white/50'>{event.month}</span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h4 className='text-sm font-medium text-white'>{event.title}</h4>
                      <p className='mt-0.5 text-xs text-white/50'>{event.time} · {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {chatOpen && (
          <div className='flex w-80 flex-col border-l border-white/10 bg-neutral-900/80 backdrop-blur-xl animate-in slide-in-from-right-2 duration-200'>
            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
              <b className='text-sm text-white'>Room chat</b>
              <Button variant='ghost' size='icon' className='size-7 text-white/50 hover:text-white' onClick={() => setChatOpen(false)}>
                <X className='size-4' />
              </Button>
            </div>
            <div ref={chatRef} className='flex-1 space-y-3 overflow-y-auto p-4'>
              {messages.map((msg, i) => (
                <div key={i} className={cn('rounded-xl p-3', msg.name === 'System' ? 'bg-white/5 text-center text-xs text-white/40' : 'bg-white/10')}>
                  {msg.name !== 'System' && <b className='block text-xs text-white/70'>{msg.name}</b>}
                  <p className='text-sm text-white'>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className='border-t border-white/10 p-3'>
              <form onSubmit={(e) => { e.preventDefault(); sendChat() }} className='flex gap-2'>
                <Input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder='Type a message...'
                  className='h-9 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30'
                />
                <Button size='sm' type='submit' className='shrink-0 bg-primary hover:brightness-110'>
                  <Send className='size-3.5' />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Participants panel */}
        {participantsOpen && (
          <div className='flex w-64 flex-col border-l border-white/10 bg-neutral-900/80 backdrop-blur-xl animate-in slide-in-from-right-2 duration-200'>
            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
              <b className='text-sm text-white'>People ({remotePeers.length + 1})</b>
              <Button variant='ghost' size='icon' className='size-7 text-white/50 hover:text-white' onClick={() => setParticipantsOpen(false)}>
                <X className='size-4' />
              </Button>
            </div>
            <div className='flex-1 space-y-1 overflow-y-auto p-3'>
              <div className='flex items-center gap-3 rounded-xl bg-white/5 p-2.5'>
                <UserAvatar user={data.currentUser} className='size-8 ring-2 ring-primary/40' />
                <div className='min-w-0 flex-1'>
                  <b className='block text-sm text-white'>{data.currentUser.name}</b>
                  <span className='text-xs text-emerald-400'>You · Host</span>
                </div>
              </div>
              {remotePeers.map((user) => (
                <div key={user.id} className='flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/5'>
                  <UserAvatar user={user} className='size-8' />
                  <div className='min-w-0 flex-1'>
                    <b className='block text-sm text-white'>{user.name}</b>
                    <span className='text-xs text-white/40'>{user.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className='border-t border-white/10 bg-neutral-900/90 px-4 py-4 backdrop-blur-xl'>
        <div className='mx-auto flex max-w-lg items-center justify-center gap-2 sm:gap-3'>
          <ControlButton
            icon={micOn ? Mic : MicOff}
            active={micOn}
            danger={!micOn}
            label='Mic'
            onClick={() => setMicOn(!micOn)}
          />
          <ControlButton
            icon={camOn ? Camera : CameraOff}
            active={camOn}
            danger={!camOn}
            label='Camera'
            onClick={() => setCamOn(!camOn)}
          />
          <ControlButton
            icon={Monitor}
            active={false}
            label='Share'
            onClick={() => toast.info('Screen sharing will be available in the next build.')}
          />
          <ControlButton
            icon={Hand}
            active={false}
            label='Hand'
            onClick={() => toast.success('Hand raised!')}
          />
          <ControlButton
            icon={MessageCircle}
            active={chatOpen}
            label='Chat'
            onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false) }}
          />
          <ControlButton
            icon={Users}
            active={participantsOpen}
            label='People'
            onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false) }}
          />
          <button
            onClick={() => toast.info('Leaving room...')}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-all duration-200 hover:bg-rose-600 hover:shadow-rose-500/25 hover:scale-105 active:scale-95 sm:h-12 sm:w-12'
            aria-label='End call'
          >
            <Phone className='size-5 rotate-[135deg]' />
          </button>
        </div>
      </div>
    </div>
  )
}

function ControlButton({ icon: Icon, active, danger, label, onClick }: { icon: typeof Mic; active: boolean; danger?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200 active:scale-90',
        active ? 'bg-primary text-white shadow-sm shadow-primary/20' :
        danger ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' :
        'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
        'h-10 w-10 sm:h-12 sm:w-12'
      )}
      aria-label={label}
      title={label}
    >
      <Icon className='size-4 sm:size-5' />
    </button>
  )
}

import { CommunityDetailPage as CDP } from './pages/community-detail'
export const CommunityDetailPage = CDP
import { SignInPage as SIP } from './pages/sign-in'
export const SignInPage = SIP
import { SignUpPage as SUP } from './pages/sign-up'
export const SignUpPage = SUP
