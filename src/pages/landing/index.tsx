import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  Compass,
  FileCheck2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Layers3,
  Menu,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react'
import { ThemeToggle } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { Copilot } from '@/features/assistant/copilot'
import { PilotInquiryDialog } from '@/components/landing/pilot-inquiry-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoDataBadge, ResponsiveDialog } from '@/components/execution-primitives'
import { businessPackages, primaryRevenueStreams, trustCommitments } from '@/config/business-model'
import { demoProfiles, localAsset } from '@/config/demo-assets'
import sscLogo from '../../../components/ssc-logo-optimized.webp'

const landingNav = [
  ['Product', 'workflow'],
  ['How it works', 'workspace-preview'],
  ['For students', 'stakeholders'],
  ['For institutions', 'institutional'],
  ['Programs', 'programs'],
  ['Business model', 'business-model'],
] as const

const workflowSteps = [
  { title: 'Verified profile', description: 'Confirm a participant’s university context without heavy KYC.', icon: ShieldCheck },
  { title: 'Build or join a team', description: 'Create a startup, define open roles and find complementary builders.', icon: Users },
  { title: 'Define milestones', description: 'Turn ambition into owned, dated and measurable execution steps.', icon: Target },
  { title: 'Add evidence', description: 'Attach interviews, prototypes, metrics and pilot records to progress.', icon: FileCheck2 },
  { title: 'Work with mentors', description: 'Prepare focused sessions and leave with accountable action items.', icon: GraduationCap },
  { title: 'Enter programs', description: 'Apply once the team, evidence and eligibility context are visible.', icon: CalendarCheck2 },
  { title: 'Prepare a handoff', description: 'Share relevant signals and missing evidence with authorized investors.', icon: BriefcaseBusiness },
  { title: 'Report outcomes', description: 'Give institutions an auditable view of activity and verified progress.', icon: BarChart3 },
] as const

const stakeholders = [
  { title: 'Students and founders', icon: Rocket, text: 'Build a team, manage progress, prove execution, find mentors and programs—and stay free.' },
  { title: 'Universities', icon: Building2, text: 'Verify participants, coordinate portfolios and programs, and replace fragmented tracking with outcome visibility.' },
  { title: 'Mentors', icon: GraduationCap, text: 'Receive better-matched founders, prepare around goals, and track action items and follow-up.' },
  { title: 'Programs and accelerators', icon: Layers3, text: 'Review applications, operate cohorts, collect evidence, prepare demo day and export outcomes.' },
  { title: 'Investors', icon: SearchCheck, text: 'Discover relevant ventures, inspect evidence, identify missing signals and request consent-based introductions.' },
  { title: 'Partners', icon: Handshake, text: 'Contribute programs, experts and challenges while tracking commitments and operational outcomes.' },
] as const

const executionSignals = [
  ['Team', '2 active · 1 role open'],
  ['Milestone', 'Seller trust validation · 70%'],
  ['Evidence', '1 pending review · 1 verified'],
  ['Mentor', 'Product validation · 01 Aug'],
  ['Program', 'Application under review'],
] as const

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
          <Button size='sm' className='min-h-10' asChild><Link to='/sign-up'>Start building free</Link></Button>
          <ResponsiveDialog
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            title='Explore SSC'
            description='Execution for students, programs and university ecosystems.'
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
      <WorkflowSection />
      <StakeholderSection />
      <WorkspacePreviewSection />
      <EvidenceSection />
      <ProgramsSection />
      <InstitutionalSection />
      <InvestorSection />
      <CommunitySection />
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
  return <section data-landing-section='hero' className='relative z-10 min-h-svh pt-20'>
    <div className='app-container grid min-h-[calc(100svh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:py-20'>
      <div>
        <Badge variant='outline' className='mb-6 border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-primary'>Free for students · Built for university startup ecosystems</Badge>
        <h1 className='max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-[-.04em] text-balance sm:text-6xl lg:text-7xl'>
          Turn university ideas into <span className='animated-gradient-text'>verified startup outcomes.</span>
        </h1>
        <p className='mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl'>
          SSC brings students, universities, mentors, programs and investors into one execution workflow—from verified profiles and team formation to milestones, evidence, programs and introductions.
        </p>
        <div className='mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <Button size='lg' className='premium-explore-cta group' asChild><Link to='/sign-up'>Start building free <ArrowRight className='transition-transform group-hover:translate-x-0.5' /></Link></Button>
          <PilotInquiryDialog label='Run a university pilot' className='bg-secondary text-secondary-foreground hover:bg-secondary/80' />
          <Button size='lg' variant='ghost' asChild><a href='#workflow'>See how SSC works</a></Button>
        </div>
        <div className='mt-10 flex flex-wrap items-center gap-2 border-t pt-6'>
          <DemoDataBadge label='Illustrative workspace' />
          <span className='text-sm text-muted-foreground'>Sample multi-stakeholder workflow · No public traction claim</span>
        </div>
      </div>
      <ExecutionPreviewCard />
    </div>
  </section>
}

function ExecutionPreviewCard() {
  return <div className='relative'>
    <div className='absolute -inset-16 -z-10 rounded-full bg-primary/8 blur-[100px]' />
    <Card className='glass-card overflow-hidden border-primary/15 shadow-2xl shadow-primary/10'>
      <CardHeader className='border-b bg-gradient-to-r from-primary/[0.09] via-transparent to-amber-500/[0.06]'>
        <div className='flex items-center justify-between gap-3'><div><p className='text-xs font-bold uppercase tracking-[.14em] text-primary'>Continue working</p><CardTitle className='mt-2'>Validate the seller trust model</CardTitle></div><DemoDataBadge /></div>
        <CardDescription>CampusCart · validation stage · due 08 Aug</CardDescription>
      </CardHeader>
      <CardContent className='space-y-5 p-5 sm:p-6'>
        <div className='rounded-xl border bg-background/55 p-4'>
          <div className='flex items-center justify-between text-sm'><span className='font-medium'>Current milestone</span><strong className='text-primary'>70%</strong></div>
          <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'><div className='h-full w-[70%] rounded-full bg-gradient-to-r from-primary to-emerald-400' /></div>
          <p className='mt-3 text-sm leading-6 text-muted-foreground'>Complete three remaining interviews, then attach the decision summary as evidence.</p>
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {executionSignals.map(([label, value]) => <div key={label} className='rounded-xl border border-border/70 bg-card/60 p-3'><p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>{label}</p><p className='mt-1 text-sm font-semibold'>{value}</p></div>)}
        </div>
        <Button className='w-full' asChild><Link to='/feed'>Open illustrative workspace <ArrowRight /></Link></Button>
      </CardContent>
    </Card>
  </div>
}

function SectionHeading({ eyebrow, title, description, align = 'center' }: { eyebrow: string; title: string; description: string; align?: 'center' | 'left' }) {
  return <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
    <p className='text-xs font-bold uppercase tracking-[.16em] text-primary'>{eyebrow}</p>
    <h2 className='mt-4 text-3xl font-bold tracking-[-.03em] text-balance sm:text-4xl lg:text-5xl'>{title}</h2>
    <p className='mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8'>{description}</p>
  </div>
}

function WorkflowSection() {
  return <section id='workflow' data-landing-section='workflow' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container'>
      <SectionHeading eyebrow='Core workflow' title='One operating loop from eligibility to outcomes.' description='SSC gives every stakeholder the same execution context without turning the product into another social feed.' />
      <div className='relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {workflowSteps.map(({ title, description, icon: Icon }, index) => <Card key={title} className='group relative overflow-hidden border-primary/10 bg-card/75'>
          <CardHeader className='h-full'>
            <div className='flex items-center justify-between'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span><span className='text-xs font-bold text-muted-foreground'>{String(index + 1).padStart(2, '0')}</span></div>
            <CardTitle className='mt-4 text-base'>{title}</CardTitle>
            <CardDescription className='leading-6'>{description}</CardDescription>
          </CardHeader>
        </Card>)}
      </div>
    </div>
  </section>
}

function StakeholderSection() {
  return <section id='stakeholders' data-landing-section='stakeholders' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container'>
      <SectionHeading eyebrow='Who SSC serves' title='Different roles. One shared record of progress.' description='Each workspace is role-aware, while the underlying team, milestone, evidence, program and outcome context remains consistent.' />
      <div className='mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {stakeholders.map(({ title, text, icon: Icon }, index) => <Card key={title} className={index === 0 ? 'border-primary/25 bg-primary/[0.045]' : 'border-border/80 bg-card/70'}>
          <CardHeader><span className='grid size-10 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span><CardTitle className='mt-3 text-lg'>{title}</CardTitle><CardDescription className='leading-6'>{text}</CardDescription></CardHeader>
        </Card>)}
      </div>
    </div>
  </section>
}

function WorkspacePreviewSection() {
  return <section id='workspace-preview' data-landing-section='workspace-preview' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container grid items-center gap-10 lg:grid-cols-[.86fr_1.14fr]'>
      <div>
        <SectionHeading align='left' eyebrow='Execution workspace' title='Know the next action in ten seconds.' description='Continue Working, startup health, the current milestone, evidence status, program deadlines and attention items appear before community updates.' />
        <div className='mt-8 space-y-3'>
          {['Role-aware next action', 'Startup and team completeness', 'Milestone and evidence coverage', 'Mentor, application and verification attention'].map((item) => <p key={item} className='flex items-center gap-3 text-sm font-medium'><Check className='size-4 text-primary' />{item}</p>)}
        </div>
        <Button className='mt-8' asChild><Link to='/feed'>View the demo workspace <ArrowRight /></Link></Button>
      </div>
      <Card className='overflow-hidden border-primary/15 bg-card/75 shadow-xl'>
        <div className='flex items-center justify-between border-b px-5 py-4'><div><p className='text-sm font-semibold'>Founder workspace</p><p className='text-xs text-muted-foreground'>Illustrative CampusCart workflow</p></div><DemoDataBadge /></div>
        <img src={localAsset('images/feed/greenstack-dashboard.webp')} alt='Illustrative SSC execution workspace preview with startup progress and evidence signals' className='aspect-[16/10] w-full bg-muted/40 object-contain' loading='lazy' />
      </Card>
    </div>
  </section>
}

function EvidenceSection() {
  return <section data-landing-section='evidence' className='relative z-10 py-20 sm:py-28'>
    <div className='app-container grid gap-5 lg:grid-cols-2'>
      <Card className='overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.08] to-card'>
        <CardHeader><span className='grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground'><BadgeCheck /></span><CardTitle className='mt-4 text-2xl'>Verification with a clear review trail</CardTitle><CardDescription className='text-base leading-7'>Students submit institution context and consent. Authorized operators can approve, reject or request changes with a visible audit record.</CardDescription></CardHeader>
        <CardContent className='grid grid-cols-2 gap-2'>
          {['Draft', 'Pending', 'Needs changes', 'Verified'].map((status) => <div key={status} className='rounded-xl border bg-background/55 p-3 text-sm font-semibold'>{status}</div>)}
        </CardContent>
      </Card>
      <Card className='overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-card'>
        <CardHeader><span className='grid size-11 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300'><FileCheck2 /></span><CardTitle className='mt-4 text-2xl'>Progress that can be inspected</CardTitle><CardDescription className='text-base leading-7'>Interviews, prototypes, metrics and pilot records connect directly to milestones. Review states distinguish a claim from verified evidence.</CardDescription></CardHeader>
        <CardContent className='space-y-2'>
          {['Evidence definition', 'Safe demo file metadata', 'Reviewer note and status', 'Outcome-ready audit context'].map((item) => <p key={item} className='flex items-center gap-3 rounded-xl border bg-background/55 p-3 text-sm'><Check className='size-4 text-amber-600' />{item}</p>)}
        </CardContent>
      </Card>
    </div>
  </section>
}

function ProgramsSection() {
  return <section id='programs' data-landing-section='programs' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container'>
      <SectionHeading eyebrow='Programs and mentorship' title='Turn support into accountable follow-through.' description='Discovery is connected to real eligibility, applications, sessions, action items, deadlines and evidence—not just profile browsing.' />
      <div className='mt-12 grid gap-4 lg:grid-cols-3'>
        {[
          { icon: Compass, title: 'Discover the right support', text: 'See program fit, mentor expertise, stage, availability and a clear recommendation reason.' },
          { icon: BookOpenCheck, title: 'Prepare with context', text: 'Bring the startup, challenge, desired outcome and relevant material into every session or application.' },
          { icon: ClipboardCheck, title: 'Track what happens next', text: 'Link mentor actions and program submissions to milestones, owners, deadlines and demo-day readiness.' },
        ].map(({ icon: Icon, title, text }) => <Card key={title}><CardHeader><Icon className='size-6 text-primary' /><CardTitle className='mt-3'>{title}</CardTitle><CardDescription className='leading-6'>{text}</CardDescription></CardHeader></Card>)}
      </div>
    </div>
  </section>
}

function InstitutionalSection() {
  const outputs = ['Verified participants', 'Active startups', 'Teams formed', 'Milestones completed', 'Evidence coverage', 'Mentor sessions', 'Cohort completion', 'Demo-day ready teams', 'Consent-based introductions']
  return <section id='institutional' data-landing-section='institutional' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container grid items-center gap-10 lg:grid-cols-[1fr_1fr]'>
      <div>
        <SectionHeading align='left' eyebrow='Institutional value' title='Operate entrepreneurship without the spreadsheet maze.' description='University and program teams receive verification, portfolio, cohort, mentor, outcome, audit and reporting workflows in one role-aware system.' />
        <div className='mt-8 flex flex-wrap gap-2'>{outputs.map((output) => <Badge key={output} variant='secondary' className='px-3 py-1.5'>{output}</Badge>)}</div>
        <div className='mt-8 flex flex-wrap gap-3'><PilotInquiryDialog /><Button variant='outline' asChild><Link to='/partnerships'>View institutional capabilities</Link></Button></div>
      </div>
      <Card className='glass-card border-primary/15'>
        <CardHeader><div className='flex items-center justify-between'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Workflow /></span><DemoDataBadge label='Illustrative outcomes' /></div><CardTitle className='mt-4'>One outcome chain, visible by role</CardTitle><CardDescription>Operational measures—not likes, follows or content views.</CardDescription></CardHeader>
        <CardContent className='space-y-2'>
          {['Participant verified', 'Startup and team created', 'Milestone completed', 'Evidence reviewed', 'Mentor action closed', 'Program outcome reported'].map((item, index) => <div key={item} className='flex items-center gap-3 rounded-xl border bg-card/55 p-3'><span className='grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary'>{index + 1}</span><span className='text-sm font-medium'>{item}</span></div>)}
        </CardContent>
      </Card>
    </div>
  </section>
}

function InvestorSection() {
  return <section data-landing-section='investor' className='relative z-10 py-20 sm:py-28'>
    <div className='app-container rounded-3xl border border-primary/15 bg-gradient-to-br from-card/90 via-card/70 to-primary/[0.06] p-6 shadow-xl sm:p-10 lg:p-14'>
      <div className='grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr]'>
        <SectionHeading align='left' eyebrow='Investor handoff' title='Relevant context without pretending to predict returns.' description='Authorized investors can review matched signals, missing evidence, watchlists and consent-based introduction requests. SSC supports decisions; it does not score guaranteed investment outcomes.' />
        <div className='grid gap-3 sm:grid-cols-2'>
          {['Thesis relevance', 'Verified evidence coverage', 'Missing decision signals', 'Startup ask and next milestone', 'Watchlist updates', 'Tracked introduction status'].map((item) => <div key={item} className='flex min-h-20 items-center gap-3 rounded-xl border bg-background/55 p-4'><SearchCheck className='size-5 shrink-0 text-primary' /><span className='text-sm font-semibold'>{item}</span></div>)}
        </div>
      </div>
    </div>
  </section>
}

function CommunitySection() {
  return <section data-landing-section='community' className='relative z-10 py-20 sm:py-28'>
    <div className='app-container'>
      <SectionHeading eyebrow='Community as an enabling layer' title='People and updates stay connected to the work.' description='Demo profiles, recommendations, events and feed posts help teams find support. They remain secondary to milestones, evidence, programs and outcomes.' />
      <div className='mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {demoProfiles.slice(0, 4).map((profile) => <Card key={profile.name} className='bg-card/70'>
          <CardContent className='flex items-center gap-3 p-4'>
            <Avatar className='size-12'><AvatarImage src={profile.image ? localAsset(profile.image) : undefined} alt={profile.alt} loading='lazy' /><AvatarFallback>{profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
            <div className='min-w-0'><div className='flex items-center gap-1.5'><p className='truncate text-sm font-semibold'>{profile.name}</p><DemoDataBadge label='Demo' /></div><p className='mt-1 truncate text-xs text-muted-foreground'>{profile.role}</p><p className='truncate text-xs text-muted-foreground'>{profile.organization}</p></div>
          </CardContent>
        </Card>)}
      </div>
      <div className='mt-6 flex justify-center'><Button variant='outline' asChild><Link to='/discover'>Explore demo recommendations <ArrowRight /></Link></Button></div>
    </div>
  </section>
}

function BusinessModelSection() {
  return <section id='business-model' data-landing-section='business-model' className='relative z-10 scroll-mt-24 py-20 sm:py-28'>
    <div className='app-container'>
      <SectionHeading eyebrow='Business and sustainability model' title='A model that keeps SSC free for students.' description='Students and founders use SSC free. Universities, programs and ecosystem operators fund the infrastructure through institutional licenses, program operations and partnership packages.' />
      <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
        {businessPackages.filter((plan) => plan.active && plan.public).map((plan) => <Card key={plan.id} className={plan.id === 'students-founders' ? 'border-primary/30 bg-primary/[0.055] xl:col-span-2' : plan.id === 'institutional-pilot' ? 'border-amber-500/30 bg-amber-500/[0.035] xl:col-span-2' : ''}>
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
    <div className='app-container text-center'>
      <HeartHandshake className='mx-auto size-9 text-primary' />
      <h2 className='mt-5 text-3xl font-bold tracking-tight sm:text-5xl'>Build free. Operate together. Prove progress.</h2>
      <p className='mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground'>Open the illustrative workspace as a founder, mentor, investor or institutional operator and follow the same execution record from a different role.</p>
      <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'><Button size='lg' asChild><Link to='/sign-up'>Start building free <ArrowRight /></Link></Button><Button size='lg' variant='outline' asChild><Link to='/feed'>Explore the demo</Link></Button></div>
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
  return <footer data-landing-section='footer' className='relative z-10 pb-10'>
    <div className='app-container flex flex-col gap-7 border-t pt-10 text-sm text-muted-foreground sm:flex-row sm:items-center'>
      <div className='flex items-center gap-3'><img className='h-10 w-24 object-left' src={sscLogo} alt='SSC' /><span>Execution for university startup ecosystems.</span></div>
      <nav aria-label='Footer' className='flex flex-wrap gap-x-5 gap-y-3 sm:ml-auto'><Link to='/privacy' className='hover:text-foreground'>Privacy</Link><Link to='/terms' className='hover:text-foreground'>Terms</Link><Link to='/help' className='hover:text-foreground'>Help</Link><a href='#business-model' className='hover:text-foreground'>Business model</a></nav>
      <p>© 2026 SSC</p>
    </div>
  </footer>
}
