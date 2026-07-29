import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useCounterAnimation,
  useHeroEntrance,
  useMarquee,
  useRevealCards,
  useScrollReveal,
  useTiltCards,
} from '@/hooks/use-animations'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Lightbulb,
  MapPin,
  Menu,
  Network,
  Newspaper,
  Rocket,
  School,
  Sparkles,
  type Users,
} from 'lucide-react'
import { ThemeToggle } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { Copilot } from '@/features/assistant/copilot'
import { HeroStats } from '@/components/landing/hero-stats'
import { PilotInquiryDialog } from '@/components/landing/pilot-inquiry-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoDataBadge, ResponsiveDialog } from '@/components/execution-primitives'
import { businessPackages, primaryRevenueStreams, trustCommitments } from '@/config/business-model'
import { localAsset } from '@/config/demo-assets'
import {
  ecosystemMetrics,
  ecosystemPillars,
  eventItems,
  featuredMembers,
  newsItems,
  universityWordmarks,
  type EcosystemIcon,
  type FeaturedMember,
} from '@/data/landing-content'
import { cn } from '@/lib/utils'
import sscLogo from '../../../components/ssc-logo-optimized.webp'

const landingNav = [
  ['Ecosystem', 'ecosystem'],
  ['Members', 'members'],
  ['Updates', 'updates'],
  ['Business model', 'business-model'],
] as const

const ecosystemIcons = {
  investors: HandCoins,
  incubation: Rocket,
  mentors: GraduationCap,
  ecosystem: Network,
  students: Lightbulb,
  universities: School,
} satisfies Record<EcosystemIcon, typeof Users>

export function LandingPage() {
  const { data } = useSnapshot()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return <div className='relative isolate min-h-svh overflow-hidden'>
    <header className='glass-header fixed inset-x-0 top-0 z-50 border-b'>
      <div className='app-container flex h-[72px] items-center gap-3'>
        <Link to='/' aria-label='SSC home' className='flex h-12 w-[104px] shrink-0 items-center overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-[122px]'>
          <img className='ssc-brand-logo h-12 w-[122px] object-left' src={sscLogo} alt='SSC — Student Startup Community' />
        </Link>
        <nav aria-label='Landing page sections' className='ml-auto hidden items-center gap-0.5 xl:flex'>
          {landingNav.map(([label, id]) => <a key={id} className='nav-link' href={`#${id}`}>{label}</a>)}
        </nav>
        <div className='ml-auto flex items-center gap-1 xl:ml-5'>
          <span className='hidden sm:inline-flex'><ThemeToggle /></span>
          <Button variant='ghost' size='sm' className='hidden md:inline-flex' asChild><Link to='/sign-in'>Sign in</Link></Button>
          <Button size='sm' className='min-h-10' asChild><Link to='/sign-up'>Get started</Link></Button>
          <ResponsiveDialog
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            title='Explore SSC'
            description='Explore the SSC ecosystem, its people, updates, and institutional model.'
            className='sm:max-w-md'
            trigger={<Button variant='ghost' size='icon' className='xl:hidden' aria-label='Open navigation'><Menu /></Button>}
            footer={<div className='flex w-full gap-2'><Button variant='outline' className='flex-1' asChild><Link to='/sign-in' onClick={() => setMobileMenuOpen(false)}>Sign in</Link></Button><Button className='flex-1' asChild><Link to='/sign-up' onClick={() => setMobileMenuOpen(false)}>Start free</Link></Button></div>}
          >
            <nav aria-label='Mobile landing navigation' className='space-y-1'>
              {landingNav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMobileMenuOpen(false)} className='flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold outline-none hover:bg-primary/[0.06] focus-visible:ring-2 focus-visible:ring-primary'>{label}<ArrowRight className='size-4 text-muted-foreground' /></a>)}
              <div className='mt-4 flex items-center justify-between border-t px-3 pt-4'><span className='text-sm text-muted-foreground'>Appearance</span><ThemeToggle /></div>
            </nav>
          </ResponsiveDialog>
        </div>
      </div>
    </header>

    <main>
      <HeroSection />
      <EcosystemSection />
      <MembersSection />
      <UpdatesSection />
      <UniversitySection />
      <BusinessModelSection />
      <PilotSection />
      <FinalCallToAction />
      <DemoDisclaimer />
    </main>
    <LandingFooter />
    {data && <Copilot snapshot={data} />}
  </div>
}

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  useHeroEntrance(heroRef)
  return <section ref={heroRef} data-landing-section='hero' className='landing-hero relative z-10 min-h-svh overflow-hidden pt-20'>
    <div data-hero-blob className='pointer-events-none absolute left-[4%] top-[18%] size-56 rounded-full bg-primary/10 blur-[90px]' />
    <div data-hero-blob className='pointer-events-none absolute bottom-[8%] right-[8%] size-72 rounded-full bg-amber-400/[0.07] blur-[110px]' />
    <div className='app-container grid min-h-[calc(100svh-5rem)] items-center gap-8 py-12 md:gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14 lg:py-20'>
      <div className='relative z-10'>
        <div data-hero-badge className='mb-8 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur'>
          <span className='size-2 animate-pulse rounded-full bg-primary' />
          Professional momentum, without the noise
        </div>
        <h1 className='max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-[-.04em] sm:text-6xl lg:text-7xl xl:text-8xl'>
          <span data-hero-line className='block'>The network for</span>
          <span data-hero-line className='animated-gradient-text block'>student builders</span>
        </h1>
        <p data-hero-subtitle className='mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl'>
          Share meaningful work, meet aligned collaborators, and discover opportunities — all in one focused professional community.
        </p>
        <div data-hero-buttons className='mt-10 flex flex-wrap gap-3'>
          <span className='hero-button-float'><Button size='lg' className='premium-explore-cta group gap-2 overflow-hidden text-[15px]' asChild><Link to='/feed'>Explore the community <ArrowRight className='transition-transform group-hover:translate-x-0.5' /></Link></Button></span>
          <span className='hero-button-float hero-button-float-delayed'><Button size='lg' variant='outline' className='text-[15px]' asChild><Link to='/sign-up'>Create your profile <Sparkles /></Link></Button></span>
        </div>
        <div data-hero-metrics className='mt-14 grid max-w-xl grid-cols-3 gap-3 border-t pt-7 sm:gap-6'>
          <Metric value='Sample' label='Student builders' />
          <Metric value='Illustrative' label='University ecosystems' />
          <Metric value='Demo' label='Mentor workflows' />
        </div>
        <div data-hero-metrics className='mt-5'>
          <DemoDataBadge label='Illustrative ecosystem' />
        </div>
      </div>
      <div data-hero-card className='landing-hero-visual' aria-label='Illustrative SSC ecosystem'>
        <div className='absolute inset-12 -z-10 rounded-full bg-primary/10 blur-[90px]' />
        <HeroStats />
        <div className='landing-hero-visual-label'><DemoDataBadge label='Illustrative ecosystem' /></div>
      </div>
    </div>
  </section>
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className='min-w-0'><strong className='block text-base font-extrabold tracking-tight sm:text-2xl'>{value}</strong><span className='mt-1 block text-[11px] leading-4 text-muted-foreground sm:text-sm'>{label}</span></div>
}

function SectionHeading({ eyebrow, title, description, align = 'center' }: { eyebrow: string; title: string; description: string; align?: 'center' | 'left' }) {
  return <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
    <Badge variant='secondary' className='px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider'>{eyebrow}</Badge>
    <h2 className='mt-6 text-3xl font-bold tracking-[-.025em] text-balance sm:text-4xl lg:text-5xl'>{title}</h2>
    <p className='mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground'>{description}</p>
  </div>
}

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
          return <div key={pillar.title} className='ecosystem-card-float' style={{ animationDelay: `${index * -0.55}s` }}>
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
        })}
      </div>
    </div>
  </section>
}

function MembersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollReveal(sectionRef, { targets: '> .app-container > [data-animate]' })

  return <section ref={sectionRef} id='members' data-landing-section='members' className='relative z-10 scroll-mt-20 py-24 sm:py-32'>
    <div className='app-container'>
      <div data-animate className='max-w-2xl'>
        <Badge variant='secondary' className='px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider'>People of SSC</Badge>
        <h2 className='mt-5 text-3xl font-bold tracking-[-.025em] sm:text-5xl'>Meet the builders behind the momentum.</h2>
        <p className='mt-5 text-lg leading-8 text-muted-foreground'>Illustrative student, founder, mentor and operator profiles show the range of roles that can work together in SSC.</p>
      </div>
    </div>
    <MembersRail />
  </section>
}

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
                <div className='absolute left-0 top-0 h-full w-0.5 bg-primary/20 transition-all duration-300 group-hover:bg-primary' />
                <CardHeader>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Badge variant='outline' className='text-[10px]'>{item.category}</Badge>
                    <span>{item.date}</span>
                  </div>
                  <CardTitle className='pt-2 text-xl'>{item.title}</CardTitle>
                  <CardDescription className='leading-6'>{item.summary}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant='link' className='gap-1 px-0 text-[13px]' asChild><Link to='/news'>Read update <ChevronRight size={14} /></Link></Button>
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
            {eventItems.map((event, index) => (
              <Card key={event.title} data-reveal className='group relative flex h-full flex-row items-stretch gap-0 overflow-hidden p-0 transition-all duration-300 hover:shadow-md' style={{ transitionDelay: `${index * 80}ms` }}>
                <div className='grid w-28 shrink-0 place-items-center rounded-l-xl bg-gradient-to-b from-primary/15 to-primary/5 p-4 text-center text-primary'>
                  <div><b className='block text-3xl font-extrabold tracking-tight'>{event.day}</b><span className='text-[10px] font-bold uppercase tracking-[.2em]'>{event.month}</span></div>
                </div>
                <CardContent className='flex min-w-0 flex-1 flex-col justify-center p-5'>
                  <div className='mb-2 flex flex-wrap gap-3 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'><CalendarDays size={12} />{event.time}</span>
                    <span className='flex items-center gap-1'><MapPin size={12} />{event.location}</span>
                  </div>
                  <h4 className='font-semibold'>{event.title}</h4>
                  <p className='mt-1 text-sm text-muted-foreground'>{event.format}</p>
                </CardContent>
                <Button variant='ghost' size='icon' className='my-auto mr-4 shrink-0' aria-label={`View ${event.title}`} asChild><Link to='/events'><ChevronRight /></Link></Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
}

function UniversitySection() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollReveal(sectionRef, { targets: '> .app-container > [data-animate]' })
  useMarquee(sectionRef, '[data-marquee]', { speed: 25 })

  return <section ref={sectionRef} data-landing-section='universities' className='relative z-10 py-24 sm:py-28'>
    <div className='app-container text-center'>
      <p data-animate className='text-sm font-semibold uppercase tracking-[.2em] text-muted-foreground'>Built for university entrepreneurship environments</p>
      <div data-animate className='relative mt-10 overflow-hidden'>
        <div data-marquee className='flex gap-4'>
          {[...universityWordmarks, ...universityWordmarks].map((name, index) => (
            <span key={`${name}-${index}`} aria-hidden={index >= universityWordmarks.length || undefined} className='shrink-0 rounded-xl border bg-card px-6 py-3.5 text-sm font-semibold text-muted-foreground shadow-xs transition-colors hover:border-primary/20 hover:text-foreground'>
              {name}
            </span>
          ))}
        </div>
      </div>
      <p data-animate className='mx-auto mt-8 max-w-2xl text-xs text-muted-foreground'>Demo ecosystem representation. Organization labels do not imply customers, formal partnerships, or endorsements.</p>
    </div>
  </section>
}

function MembersRail() {
  const railRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [selectedMember, setSelectedMember] = useState<FeaturedMember | null>(null)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  useEffect(() => {
    const rail = railRef.current
    if (!rail || paused || selectedMember || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let previousTime = performance.now()
    const loopPoint = rail.scrollWidth / 2
    if (rail.scrollLeft < 1 && loopPoint > 0) rail.scrollLeft = loopPoint
    const move = (time: number) => {
      const elapsed = Math.min(time - previousTime, 50)
      previousTime = time
      rail.scrollLeft -= elapsed * 0.045
      if (rail.scrollLeft <= 0.5) rail.scrollLeft += loopPoint
      if (rail.scrollLeft > loopPoint + 1) rail.scrollLeft -= loopPoint
      frame = window.requestAnimationFrame(move)
    }
    frame = window.requestAnimationFrame(move)
    return () => window.cancelAnimationFrame(frame)
  }, [paused, selectedMember])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setPaused(true)
    dragRef.current.moved = false
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = { active: true, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    const distance = event.clientX - dragRef.current.startX
    if (Math.abs(distance) > 5) dragRef.current.moved = true
    event.currentTarget.scrollLeft = dragRef.current.startScroll - distance
  }
  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current.active = false
    window.setTimeout(() => setPaused(false), 650)
  }

  return <>
    <div
      ref={railRef}
      tabIndex={0}
      aria-label='Illustrative people of SSC. Scroll horizontally to explore demo profiles.'
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className='landing-carousel landing-members-rail mt-12 flex w-full gap-4 overflow-x-auto px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-6'
    >
      {featuredMembers.map((member) => <MemberRailCard key={member.name} member={member} onView={() => { if (!dragRef.current.moved) setSelectedMember(member) }} />)}
      {featuredMembers.map((member) => <MemberRailCard key={`clone-${member.name}`} member={member} clone onView={() => undefined} />)}
    </div>
    <ResponsiveDialog
      open={Boolean(selectedMember)}
      onOpenChange={(open) => { if (!open) setSelectedMember(null) }}
      title='Demo member profile'
      description='An illustrative identity in the SSC sample ecosystem.'
      className='sm:max-w-xl'
    >
      {selectedMember && <MemberProfile member={selectedMember} />}
    </ResponsiveDialog>
  </>
}

function MemberRailCard({ member, clone = false, onView }: { member: FeaturedMember; clone?: boolean; onView: () => void }) {
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)
  return <article aria-hidden={clone || undefined} className='landing-member-card w-[210px] shrink-0 rounded-2xl border border-primary/10 bg-card/75 px-4 py-5 text-center shadow-sm'>
    <Avatar className='mx-auto size-16 border-2 border-background/80 shadow-md'>
      <AvatarImage src={member.avatarUrl ? localAsset(member.avatarUrl) : undefined} alt={clone ? '' : `Illustrative demo profile for ${member.name}`} loading='lazy' />
      <AvatarFallback className='bg-primary/10 text-base font-bold text-primary'>{initials}</AvatarFallback>
    </Avatar>
    <div className='mt-3 flex items-center justify-center gap-1.5'><h3 className='truncate text-sm font-semibold'>{member.name}</h3><DemoDataBadge label='Demo' /></div>
    <p className='mt-1 truncate text-xs text-muted-foreground'>{member.role}</p>
    <div className='mt-3 flex h-5 justify-center gap-1 overflow-hidden'>{member.skills.slice(0, 2).map((skill) => <Badge key={skill} variant='secondary' className='px-1.5 py-0 text-[9px]'>{skill}</Badge>)}</div>
    <Button type='button' variant='link' size='sm' tabIndex={clone ? -1 : 0} className='mt-2 h-8 px-1 text-xs' onClick={onView}>View profile <ArrowRight className='size-3' /></Button>
  </article>
}

function MemberProfile({ member }: { member: FeaturedMember }) {
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)
  return <div className='pt-2 text-center'>
    <Avatar className='mx-auto size-24 border-4 border-background shadow-xl'>
      <AvatarImage src={member.avatarUrl ? localAsset(member.avatarUrl) : undefined} alt={`Illustrative demo profile for ${member.name}`} />
      <AvatarFallback className='bg-primary/10 text-2xl font-bold text-primary'>{initials}</AvatarFallback>
    </Avatar>
    <h3 className='mt-4 text-2xl font-bold'>{member.name}</h3>
    <p className='mt-1 text-muted-foreground'>{member.role}</p>
    <p className='mx-auto mt-4 max-w-md text-sm text-muted-foreground'>{member.university}</p>
    <div className='mt-5 flex flex-wrap justify-center gap-2'>{member.skills.map((skill) => <Badge key={skill} variant='secondary'>{skill}</Badge>)}</div>
    <div className='mt-6 grid gap-3 text-left sm:grid-cols-2'>
      <div className='rounded-xl border p-3'><p className='text-xs text-muted-foreground'>Startup focus</p><p className='mt-1 text-sm font-semibold'>{member.focus}</p></div>
      <div className='rounded-xl border p-3'><p className='text-xs text-muted-foreground'>Profile status</p><p className='mt-1 text-sm font-semibold'>{member.stage}</p></div>
    </div>
  </div>
}

function BusinessModelSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealCards(sectionRef, '[data-reveal]', { stagger: 0.06 })
  return <section ref={sectionRef} id='business-model' data-landing-section='business-model' className='landing-section landing-section-mint relative z-10 scroll-mt-24 py-24 sm:py-32'>
    <div className='app-container'>
      <SectionHeading eyebrow='Business and sustainability model' title='A model that keeps SSC free for students.' description='Students and founders use SSC free. Universities, programs and ecosystem operators fund the infrastructure through institutional licenses, program operations and partnership packages.' />
      <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6'>
        {businessPackages.filter((plan) => plan.active && plan.public).map((plan) => <Card data-reveal key={plan.id} className={cn('landing-story-card xl:col-span-2', plan.id === 'students-founders' ? 'border-primary/30 bg-primary/[0.055] xl:col-span-3' : plan.id === 'institutional-pilot' ? 'border-amber-500/30 bg-amber-500/[0.035] xl:col-span-3' : '')}>
          <CardHeader>
            <div className='flex items-start justify-between gap-2'><CardTitle className='text-lg'>{plan.publicLabel}</CardTitle>{plan.id === 'students-founders' && <Badge className='bg-primary'>Core access</Badge>}</div>
            <p className='text-2xl font-extrabold tracking-tight text-primary'>{plan.publicPrice}</p>
            <CardDescription className='leading-6'>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className='flex h-full flex-col'>
            <ul className='space-y-2 text-sm'>
              {plan.features.map((feature) => <li key={feature} className='flex gap-2'><Check className='mt-0.5 size-4 shrink-0 text-primary' /><span>{feature}</span></li>)}
            </ul>
            <div className='mt-6'>
              {plan.id === 'students-founders'
                ? <Button className='w-full' asChild><Link to='/sign-up'>{plan.cta}</Link></Button>
                : <Button variant='outline' className='w-full' asChild><a href='#pilot'>{plan.cta}</a></Button>}
            </div>
          </CardContent>
        </Card>)}
      </div>

      <div className='mt-12 grid gap-4 lg:grid-cols-[1.2fr_.8fr]'>
        <Card>
          <CardHeader><CardTitle>Who pays—and what for</CardTitle><CardDescription>Institutions, program operators, consortiums and partner organizations fund operations, governance and implementation.</CardDescription></CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2'>
            {primaryRevenueStreams.map((stream) => <div key={stream.title} className='rounded-xl border bg-card/50 p-4'><h3 className='text-sm font-semibold'>{stream.title}</h3><p className='mt-1 text-xs leading-5 text-muted-foreground'>{stream.description}</p></div>)}
          </CardContent>
        </Card>
        <Card className='border-primary/15'>
          <CardHeader><CardTitle>What students do not pay for</CardTitle><CardDescription>Core startup building, team formation, milestones, evidence, applications and community participation.</CardDescription></CardHeader>
          <CardContent className='space-y-3'>
            {trustCommitments.map((commitment) => <p key={commitment} className='flex gap-2 text-sm leading-6'><BadgeCheck className='mt-0.5 size-4 shrink-0 text-primary' />{commitment}</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
}

function PilotSection() {
  return <section id='pilot' data-landing-section='pilot' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container'>
      <div className='rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.10] via-card/85 to-amber-500/[0.07] p-7 text-center shadow-xl sm:p-12'>
        <Badge variant='outline' className='border-primary/25 bg-background/50'>Institutional pilot path</Badge>
        <h2 className='mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-[-.03em] sm:text-5xl'>Start with one program, not a platform-wide rollout.</h2>
        <p className='mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>Run a controlled 8–12 week university or accelerator pilot, validate the workflow and review verified outcomes before expanding.</p>
        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'><PilotInquiryDialog /><Button variant='outline' asChild><Link to='/partnerships'>View institutional capabilities</Link></Button></div>
        <p className='mt-5 text-xs text-muted-foreground'>The inquiry dialog is a frontend demo. It saves locally and does not transmit data.</p>
      </div>
    </div>
  </section>
}

function FinalCallToAction() {
  return <section data-landing-section='final-cta' className='relative z-10 py-20 sm:py-28'>
    <div className='app-container'>
      <div className='landing-final-cta overflow-hidden rounded-[2rem] border border-emerald-300/20 px-6 py-14 text-center text-white shadow-2xl shadow-emerald-950/20 sm:px-12 sm:py-20'>
        <HeartHandshake className='mx-auto size-10 text-emerald-200' />
        <h2 className='mx-auto mt-5 max-w-4xl text-3xl font-bold tracking-[-.035em] sm:text-5xl'>Build free. Operate together. Prove progress.</h2>
        <p className='mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg sm:leading-8'>Open the illustrative workspace as a founder, mentor, investor or institutional operator and follow the same execution record from a different role.</p>
        <div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'><Button size='lg' className='bg-white text-emerald-950 hover:bg-emerald-50' asChild><Link to='/sign-up'>Start building free <ArrowRight /></Link></Button><Button size='lg' variant='outline' className='border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white' asChild><Link to='/feed'>Explore the demo</Link></Button></div>
      </div>
    </div>
  </section>
}

function DemoDisclaimer() {
  return <section data-landing-section='demo-disclaimer' className='relative z-10 pb-20'>
    <div className='app-container'>
      <div className='rounded-2xl border border-amber-500/25 bg-amber-500/[0.055] p-5 sm:flex sm:items-start sm:gap-4'>
        <Sparkles className='size-5 shrink-0 text-amber-700 dark:text-amber-300' />
        <div className='mt-3 sm:mt-0'><h2 className='text-sm font-semibold'>Transparent demo environment</h2><p className='mt-1 text-sm leading-6 text-muted-foreground'>Organizations, people, startups, programs, partnerships, metrics, funding, commitments and outcomes shown in the demo are illustrative unless explicitly marked Verified. They are not public customer, traction or endorsement claims.</p></div>
      </div>
    </div>
  </section>
}

function LandingFooter() {
  return <footer data-landing-section='footer' className='relative z-10'>
    <div className='app-container flex flex-col items-center gap-6 py-12 text-center text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:text-left lg:flex-nowrap'>
      <Link to='/' aria-label='SSC home' className='shrink-0 rounded-xl transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
        <img className='ssc-brand-logo h-16 sm:h-[72px]' src={sscLogo} alt='SSC — Student Startup Community' />
      </Link>
      <p className='sm:ml-auto'>A demo platform for the next generation of student builders.</p>
      <nav aria-label='Footer' className='flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end'>
        <a href='#ecosystem' className='transition-colors hover:text-foreground'>Ecosystem</a>
        <a href='#members' className='transition-colors hover:text-foreground'>Members</a>
        <a href='#updates' className='transition-colors hover:text-foreground'>Updates</a>
        <a href='#business-model' className='transition-colors hover:text-foreground'>Business model</a>
        <Link to='/privacy' className='transition-colors hover:text-foreground'>Privacy</Link>
        <Link to='/terms' className='transition-colors hover:text-foreground'>Terms</Link>
      </nav>
    </div>
  </footer>
}
