import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { usePageTransition } from '@/hooks/use-animations'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Bell, BriefcaseBusiness, CalendarDays, CircleDollarSign, ChevronRight, GraduationCap, Handshake, Home, LogOut, Menu, MessagesSquare, Network, Newspaper, Rocket, Search, ShieldCheck, Sparkles, Trophy, Users, Video, X } from 'lucide-react'
import { apiClient, runtimeMode } from '@/data/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ThemeToggle, UserAvatar } from '@/app/app-shared'
import { useAction, useSnapshot } from '@/app/app-data'
import { canAccess, type AccessArea } from '@/app/access-policy'
import { Copilot } from '@/features/assistant/copilot'

gsap.registerPlugin(useGSAP)

const navItems = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/startups', label: 'Startups', icon: Rocket },
  { to: '/partnerships', label: 'Partnerships', icon: Handshake, access: 'partnerships' as AccessArea },
  { to: '/programs', label: 'Programs', icon: CalendarDays },
  { to: '/mentorship', label: 'Mentorship', icon: GraduationCap },
  { to: '/messages', label: 'Inbox', icon: MessagesSquare },
] as const

const workspaceItems = [
  { to: '/search', label: 'Search', description: 'Search the full workspace', icon: Search },
  { to: '/profile', label: 'My Profile', description: 'Founder identity and readiness', icon: Users },
  { to: '/notifications', label: 'Notifications', description: 'Requests, feedback and alerts', icon: Bell },
  { to: '/communities', label: 'Communities', description: 'Founder groups and discussions', icon: Network },
  { to: '/jobs', label: 'Opportunities', description: 'Roles, projects and referrals', icon: BriefcaseBusiness },
  { to: '/news', label: 'News', description: 'Ecosystem updates', icon: Newspaper },
  { to: '/live', label: 'Live', description: 'Community sessions', icon: Video },
  { to: '/investors', label: 'Investors', description: 'Capital readiness', icon: CircleDollarSign, access: 'investor' as AccessArea },
  { to: '/rankings', label: 'Rankings', description: 'Evidence-based signals', icon: Trophy },
] as const

export function AppShell() {
  const { data } = useSnapshot()
  const location = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const logout = useAction(() => apiClient.logout(), 'Signed out')
  const me = data?.currentUser
  const isAdmin = canAccess(me, 'admin')
  const visibleNavItems = navItems.filter((item) => !('access' in item) || canAccess(me, item.access))
  const visibleWorkspaceItems = workspaceItems.filter((item) => !('access' in item) || canAccess(me, item.access))
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
        <nav className='nav-bar hidden xl:flex'>{visibleNavItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}</nav>
        <form className='ml-auto hidden min-w-44 max-w-xs flex-1 items-center gap-2 rounded-lg border bg-muted/50 px-3 2xl:flex' onSubmit={(event) => { event.preventDefault(); if (searchQuery.trim()) navigate({ to: '/search', search: { q: searchQuery.trim() } }) }}><Search className='size-4 text-muted-foreground' /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className='h-9 min-w-0 flex-1 bg-transparent text-sm outline-none' placeholder='Search workspace' aria-label='Search workspace' /></form>
        <div className='ml-auto flex items-center gap-1 md:ml-0'>
          <Badge variant='outline' className='hidden text-[10px] uppercase sm:flex'>{runtimeMode}</Badge>
          <ThemeToggle />
          {data && <Copilot snapshot={data} />}
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
        <div className='flex items-center gap-0.5'>{visibleWorkspaceItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-pill', location === to && 'nav-pill-active')}><Icon className='size-3.5' />{label}{to === '/notifications' && <span className='size-1.5 rounded-full bg-emerald-500' />}</Link>)}{isAdmin && <Link to='/admin' className={cn('nav-pill', location === '/admin' && 'nav-pill-active')}><ShieldCheck className='size-3.5' />Admin</Link>}</div>
      </nav>
      {mobileOpen && <nav ref={mobileMenuRef} className='app-container grid max-h-[75svh] gap-1 overflow-y-auto border-t py-3 xl:hidden'>{visibleNavItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}<p className='mt-2 border-t px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>Quick access</p>{visibleWorkspaceItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={cn('nav-link', location === to && 'nav-link-active')}><Icon />{label}</Link>)}{isAdmin && <Link to='/admin' onClick={() => setMobileOpen(false)} className={cn('nav-link', location === '/admin' && 'nav-link-active')}><ShieldCheck />Admin</Link>}</nav>}
    </header>
    <main ref={mainRef} className='relative z-10 pb-20 xl:pb-0'><Outlet /></main>
    <nav className='glass-header fixed inset-x-0 bottom-0 z-40 grid border-t px-1 py-1 xl:hidden' style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))` }}>{visibleNavItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn('nav-mobile-link', location === to && 'nav-mobile-active')}><Icon className='size-5' />{label}</Link>)}</nav>
  </div>
}

function LetsStart() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const actions = [
    { label: 'Start live video keet', icon: Video, desc: 'Meet face-to-face with community', color: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400', to: '/live' },
    { label: 'Browse opportunities', icon: BriefcaseBusiness, desc: 'Roles, projects and referrals', color: 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400', to: '/jobs' },
    { label: 'Find your community', icon: Network, desc: 'Founder groups and discussions', color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400', to: '/communities' },
    { label: 'Connect with people', icon: Users, desc: 'Meet aligned collaborators', color: 'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400', to: '/network' },
    { label: 'Start a startup', icon: Rocket, desc: 'Create or join a venture', color: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400', to: '/startups/new' },
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
