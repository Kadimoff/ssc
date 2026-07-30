import { useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Compass,
  GraduationCap,
  Handshake,
  Home,
  LogOut,
  Menu,
  MessagesSquare,
  Network,
  Newspaper,
  Plus,
  Radio,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react'
import { usePageTransition } from '@/hooks/use-animations'
import { apiClient, runtimeMode } from '@/data/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'
import { canAccess, type AccessArea } from '@/app/access-policy'
import { Copilot } from '@/features/assistant/copilot'
import { PersonaSwitcher } from '@/features/execution/persona-switcher'
import { useExecutionStore } from '@/features/execution/store'
import { DemoDataBadge, ResponsiveDialog } from '@/components/execution-primitives'
import sscLogo from '../../components/ssc-logo-optimized.webp'

const desktopNav = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/workspace', label: 'Workspace', icon: Compass },
  { to: '/startups', label: 'Startups', icon: Rocket },
  { to: '/programs', label: 'Programs', icon: CalendarDays },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/messages', label: 'Inbox', icon: MessagesSquare },
] as const

type MoreItem = {
  to: string
  label: string
  description: string
  icon: typeof Home
  access?: AccessArea
}

const moreGroups: Array<{ label: string; items: MoreItem[] }> = [
  {
    label: 'Build',
    items: [
      { to: '/mentorship', label: 'Mentorship', description: 'Sessions, goals and follow-up', icon: GraduationCap },
      { to: '/jobs', label: 'Opportunities', description: 'Open startup roles', icon: BriefcaseBusiness },
      { to: '/events', label: 'Events', description: 'Workshops and office hours', icon: CalendarDays },
      { to: '/communities', label: 'Communities', description: 'Stage and sector groups', icon: Users },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/discover', label: 'Discover', description: 'Contextual recommendations', icon: Compass },
      { to: '/news', label: 'News', description: 'Ecosystem editorial', icon: Newspaper },
      { to: '/live', label: 'Live', description: 'Illustrative live sessions', icon: Radio },
      { to: '/rankings', label: 'Execution signals', description: 'Secondary evidence-led discovery', icon: Trophy },
      { to: '/assistant', label: 'SSC Copilot', description: 'Workflow support', icon: Bot },
    ],
  },
  {
    label: 'Institutional',
    items: [
      { to: '/partnerships', label: 'Partnerships', description: 'Commitments, outcomes and audit', icon: Handshake, access: 'partnerships' },
      { to: '/investors', label: 'Investors', description: 'Evidence review and introductions', icon: CircleDollarSign, access: 'investor' },
      { to: '/admin', label: 'Administration', description: 'Authority, access and governance', icon: ShieldCheck, access: 'admin' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'My profile', description: 'Identity and public context', icon: UserRound },
      { to: '/verification', label: 'Verification', description: 'Submit or review eligibility', icon: BadgeCheck },
      { to: '/notifications', label: 'Notifications', description: 'Execution attention queue', icon: Bell },
      { to: '/settings', label: 'Settings', description: 'Privacy and preferences', icon: Settings },
    ],
  },
]

const moreItems = moreGroups.flatMap((group) => group.items)

const mobileNav = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/workspace', label: 'Workspace', icon: Compass },
  { to: '/discover', label: 'Discover', icon: Search },
  { to: '/messages', label: 'Inbox', icon: MessagesSquare },
] as const

const pageTitleMap: Record<string, string> = {
  '/feed': 'Home',
  '/workspace': 'Workspace',
  '/startups': 'Startups',
  '/programs': 'Programs',
  '/network': 'Network',
  '/discover': 'Discover',
  '/messages': 'Inbox',
  '/mentorship': 'Mentorship',
  '/partnerships': 'Partnerships',
  '/investors': 'Investors',
  '/rankings': 'Execution signals',
  '/verification': 'Verification',
  '/admin': 'Administration',
}

function routeActive(location: string, to: string) {
  return location === to || (to !== '/feed' && location.startsWith(`${to}/`))
}

function pageTitle(location: string) {
  if (location.startsWith('/startups/')) return 'Startup workspace'
  return pageTitleMap[location] || Object.entries(pageTitleMap).find(([path]) => location.startsWith(`${path}/`))?.[1] || 'SSC'
}

export function AppShell() {
  const { data } = useSnapshot()
  const { state: executionState } = useExecutionStore()
  const location = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const logout = useAction(() => apiClient.logout(), 'Signed out')
  const me = data?.currentUser
  const unreadCount = executionState.notifications.filter((item) => !item.read && (item.userId === 'all' || item.userId === me?.id)).length
  const mainRef = useRef<HTMLDivElement>(null)
  const lastMoreTriggerRef = useRef<HTMLButtonElement | null>(null)
  usePageTransition(mainRef, location)
  const mobileMoreActive = moreItems.some((item) => item.to !== '/discover' && routeActive(location, item.to))

  return <div className='app-shell relative isolate min-h-svh' data-overlay-open={moreOpen || undefined}>
    <header className='app-header glass-header sticky top-0 z-30 border-b'>
      <div className='app-container flex h-16 items-center gap-2 sm:gap-3'>
        <Link to='/' aria-label='SSC home' className='flex h-11 w-9 shrink-0 items-center overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary xl:w-[116px]'>
          <img src={sscLogo} alt='SSC — Student Startup Community' className='ssc-brand-logo h-10 w-[116px] max-w-none object-left' />
        </Link>
        <p className='min-w-0 max-w-[76px] truncate text-sm font-bold sm:max-w-[150px] xl:hidden'>{pageTitle(location)}</p>
        <nav aria-label='Primary navigation' className='nav-bar !hidden xl:!flex'>
          {desktopNav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-link', routeActive(location, to) && 'nav-link-active')}><Icon />{label}</Link>)}
          <button type='button' className={cn('nav-link', moreItems.some((item) => routeActive(location, item.to)) && 'nav-link-active')} onClick={(event) => { lastMoreTriggerRef.current = event.currentTarget; setMoreOpen(true) }}><Menu />More</button>
        </nav>
        <div className='ml-auto flex items-center gap-0.5 sm:gap-1'>
          {runtimeMode === 'demo' && <span className='hidden lg:inline-flex'><DemoDataBadge label='Demo data' /></span>}
          <span className='hidden md:inline-flex'><PersonaSwitcher compact /></span>
          <Button variant='ghost' size='icon' aria-label='Search SSC' asChild><Link to='/search'><Search /></Link></Button>
          <span className='hidden sm:inline-flex'><ThemeToggle /></span>
          <Button variant='ghost' size='icon' className='relative' aria-label={`Notifications, ${unreadCount} unread`} asChild><Link to='/notifications'><Bell />{unreadCount > 0 && <span className='absolute right-2 top-2 size-2 rounded-full border-2 border-card bg-emerald-500'><span className='sr-only'>{unreadCount} unread notifications</span></span>}</Link></Button>
          <Button size='sm' className='hidden min-[1380px]:inline-flex' asChild><Link to='/startups/new'><Plus />Create</Link></Button>
          {me ? <Button variant='ghost' size='icon' aria-label={`Open ${me.name} profile`} onClick={() => navigate({ to: '/profile' })}><UserAvatar user={me} className='size-8' /></Button> : <Button size='sm' asChild><Link to='/sign-in'>Sign in</Link></Button>}
          <Button variant='ghost' size='icon' className='xl:hidden' aria-label='Open more navigation' onClick={(event) => { lastMoreTriggerRef.current = event.currentTarget; setMoreOpen(true) }}><Menu /></Button>
        </div>
      </div>
    </header>

    <main ref={mainRef} className='relative z-10 pb-[var(--mobile-content-clearance)] xl:pb-0'><Outlet /></main>
    {data && <Copilot snapshot={data} suppressed={moreOpen || location.startsWith('/messages')} />}

    <nav
      aria-label='Mobile navigation'
      aria-hidden={moreOpen || undefined}
      inert={moreOpen || undefined}
      className={cn('mobile-bottom-nav glass-header fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t px-1 pb-[env(safe-area-inset-bottom)] pt-1 xl:hidden', moreOpen && 'invisible pointer-events-none')}
    >
      {mobileNav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-mobile-link min-h-12 justify-center', routeActive(location, to) && 'nav-mobile-active')}><Icon className='size-5' />{label}</Link>)}
      <button type='button' className={cn('nav-mobile-link min-h-12 justify-center', mobileMoreActive && 'nav-mobile-active')} onClick={(event) => { lastMoreTriggerRef.current = event.currentTarget; setMoreOpen(true) }}><Menu className='size-5' />More</button>
    </nav>

    <ResponsiveDialog
      open={moreOpen}
      onOpenChange={(open) => {
        setMoreOpen(open)
        if (!open) window.requestAnimationFrame(() => lastMoreTriggerRef.current?.focus())
      }}
      title='More from SSC'
      description='Build, explore and operate from one role-aware workspace.'
      variant='drawer'
      className='more-navigation-drawer sm:max-w-3xl'
      footer={<div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center'>
        {runtimeMode === 'demo' && <div className='min-w-0 flex-1'><PersonaSwitcher /></div>}
        <div className='flex items-center justify-end gap-2'><ThemeToggle />{me && <Button variant='ghost' onClick={() => { setMoreOpen(false); logout.mutate() }}><LogOut />Sign out</Button>}<Button variant='outline' onClick={() => setMoreOpen(false)}>Close</Button></div>
      </div>}
    >
      <div className='more-navigation-content space-y-6'>
        {moreGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.access || canAccess(me, item.access))
          if (!visibleItems.length) return null
          return <section key={group.label} aria-labelledby={`more-${group.label.toLowerCase()}`}>
            <h3 id={`more-${group.label.toLowerCase()}`} className='mb-2 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground'>{group.label}</h3>
            <div className='grid min-w-0 gap-2 sm:grid-cols-2'>
              {visibleItems.map(({ to, label, description, icon: Icon }) => <Link
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={cn('flex min-h-14 min-w-0 items-center gap-3 rounded-xl border p-3 text-foreground outline-none transition-colors hover:border-primary/30 hover:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-primary', routeActive(location, to) && 'border-primary/30 bg-primary/[0.06]')}
              >
                <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span>
                <span className='min-w-0'><b className='block text-sm'>{label}</b><span className='mt-0.5 block text-xs leading-5 text-muted-foreground'>{description}</span></span>
              </Link>)}
            </div>
          </section>
        })}
      </div>
    </ResponsiveDialog>
  </div>
}
