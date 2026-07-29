import { useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Compass,
  GraduationCap,
  Handshake,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessagesSquare,
  Network,
  Newspaper,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
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

const moreItems = [
  { to: '/discover', label: 'Discover', description: 'Recommendations with reasons', icon: Compass },
  { to: '/mentorship', label: 'Mentorship', description: 'Book and manage focused sessions', icon: GraduationCap },
  { to: '/communities', label: 'Communities', description: 'Join stage and sector groups', icon: Users },
  { to: '/jobs', label: 'Open roles', description: 'Find startup work and collaborators', icon: BriefcaseBusiness },
  { to: '/events', label: 'Events', description: 'Programs, workshops, and office hours', icon: CalendarDays },
  { to: '/investors', label: 'Investor workspace', description: 'Review evidence and opportunities', icon: CircleDollarSign, access: 'investor' as AccessArea },
  { to: '/partnerships', label: 'Partnership operations', description: 'Commitments, outcomes, and audit', icon: Handshake, access: 'partnerships' as AccessArea },
  { to: '/rankings', label: 'Evidence rankings', description: 'Secondary discovery signals', icon: Trophy },
  { to: '/news', label: 'Ecosystem news', description: 'Editorial updates', icon: Newspaper },
  { to: '/search', label: 'Search', description: 'Search the full workspace', icon: Search },
  { to: '/settings', label: 'Settings', description: 'Profile and privacy preferences', icon: Settings },
  { to: '/help', label: 'Help', description: 'Learn how execution workflows work', icon: HelpCircle },
] as const

const mobileNav = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/workspace', label: 'Workspace', icon: Compass },
  { to: '/startups', label: 'Startups', icon: Rocket },
  { to: '/messages', label: 'Inbox', icon: MessagesSquare },
] as const

function routeActive(location: string, to: string) {
  return location === to || (to !== '/feed' && location.startsWith(`${to}/`))
}

export function AppShell() {
  const { data } = useSnapshot()
  const location = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const logout = useAction(() => apiClient.logout(), 'Signed out')
  const me = data?.currentUser
  const mainRef = useRef<HTMLDivElement>(null)
  usePageTransition(mainRef, location)

  return <div className='relative isolate min-h-svh'>
    <header className='glass-header sticky top-0 z-40 border-b'>
      <div className='app-container flex h-16 items-center gap-3'>
        <Link to='/feed' aria-label='SSC home' className='flex h-11 w-9 shrink-0 items-center overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-[116px]'>
          <img src={sscLogo} alt='SSC — Student Startup Community' className='h-10 w-[116px] max-w-none object-contain object-left dark:brightness-0 dark:invert' />
        </Link>
        <nav aria-label='Primary navigation' className='nav-bar !hidden xl:!flex'>
          {desktopNav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-link', routeActive(location, to) && 'nav-link-active')}><Icon />{label}</Link>)}
          <button type='button' className={cn('nav-link', moreItems.some((item) => routeActive(location, item.to)) && 'nav-link-active')} onClick={() => setMoreOpen(true)}><Menu />More</button>
        </nav>
        <div className='ml-auto flex items-center gap-1'>
          {runtimeMode === 'demo' && <span className='hidden sm:inline-flex'><DemoDataBadge label='Sample' /></span>}
          <PersonaSwitcher compact />
          <ThemeToggle />
          <Button variant='ghost' size='icon' aria-label='Notifications' asChild><Link to='/notifications'><Bell /></Link></Button>
          {me ? <>
            <Button variant='ghost' className='hidden gap-2 sm:flex' onClick={() => navigate({ to: '/profile' })}><UserAvatar user={me} className='size-7' /><span className='max-w-24 truncate'>{me.name.split(' ')[0]}</span></Button>
            <Button variant='ghost' size='icon' className='hidden sm:inline-flex' aria-label='Sign out' onClick={() => logout.mutate()}><LogOut /></Button>
          </> : <Button size='sm' asChild><Link to='/sign-in'>Sign in</Link></Button>}
          <Button variant='ghost' size='icon' className='xl:hidden' aria-label='Open more navigation' onClick={() => setMoreOpen(true)}><Menu /></Button>
        </div>
      </div>
    </header>

    <main ref={mainRef} className='relative z-10 pb-[calc(5rem+env(safe-area-inset-bottom))] xl:pb-0'><Outlet /></main>
    {data && <Copilot snapshot={data} />}

    <nav aria-label='Mobile navigation' className='glass-header fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t px-1 pb-[env(safe-area-inset-bottom)] pt-1 xl:hidden'>
      {mobileNav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-mobile-link min-h-12 justify-center', routeActive(location, to) && 'nav-mobile-active')}><Icon className='size-5' />{label}</Link>)}
      <button type='button' className={cn('nav-mobile-link min-h-12 justify-center', moreItems.some((item) => routeActive(location, item.to)) && 'nav-mobile-active')} onClick={() => setMoreOpen(true)}><Menu className='size-5' />More</button>
    </nav>

    <ResponsiveDialog
      open={moreOpen}
      onOpenChange={setMoreOpen}
      title='More from SSC'
      description='Discovery, mentorship, operations, and account tools.'
      className='sm:max-w-2xl'
      footer={<div className='flex w-full items-center justify-between gap-3'><PersonaSwitcher /><Button variant='outline' onClick={() => setMoreOpen(false)}>Close</Button></div>}
    >
      <div className='grid gap-2 sm:grid-cols-2'>
        {moreItems.filter((item) => !('access' in item) || canAccess(me, item.access)).map(({ to, label, description, icon: Icon }) => <Link
          key={to}
          to={to}
          onClick={() => setMoreOpen(false)}
          className={cn('flex min-h-16 items-center gap-3 rounded-xl border p-3 outline-none transition-colors hover:border-primary/30 hover:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-primary', routeActive(location, to) && 'border-primary/30 bg-primary/[0.06]')}
        >
          <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span>
          <span className='min-w-0'><b className='block text-sm'>{label}</b><span className='mt-0.5 block text-xs text-muted-foreground'>{description}</span></span>
        </Link>)}
        {canAccess(me, 'admin') && <Link to='/admin' onClick={() => setMoreOpen(false)} className='flex min-h-16 items-center gap-3 rounded-xl border p-3 outline-none hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary'><span className='grid size-10 place-items-center rounded-xl bg-primary/10 text-primary'><ShieldCheck className='size-5' /></span><span><b className='block text-sm'>Platform administration</b><span className='text-xs text-muted-foreground'>Moderation, authority, and audit</span></span></Link>}
      </div>
    </ResponsiveDialog>
  </div>
}
