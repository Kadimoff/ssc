import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  AdminPage, AppShell, CommunitiesPage, CommunityDetailPage, FeedPage, InvestorsPage, JobsPage, LandingPage,
  LivePage, MentorshipPage, MessagesPage, NetworkPage, NewsPage, NotificationsPage, ProfilePage, ProgramsPage, RankingsPage, SignInPage, SignUpPage, StartupDetailPage, StartupsPage,
} from './app'
import { ShaderBackground } from './components/shader-background'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const rootRoute = createRootRoute({ component: () => <><ShaderBackground /><Outlet /><Toaster richColors position='top-right' /></> })
const landingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage })
const appRoute = createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppShell })
const feedRoute = createRoute({ getParentRoute: () => appRoute, path: '/feed', component: FeedPage })
const profileRoute = createRoute({ getParentRoute: () => appRoute, path: '/profile', component: ProfilePage })
const networkRoute = createRoute({ getParentRoute: () => appRoute, path: '/network', component: NetworkPage })
const startupsRoute = createRoute({ getParentRoute: () => appRoute, path: '/startups', component: StartupsPage })
const startupDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/startups/$slug', component: StartupDetailPage })
const mentorshipRoute = createRoute({ getParentRoute: () => appRoute, path: '/mentorship', component: MentorshipPage })
const programsRoute = createRoute({ getParentRoute: () => appRoute, path: '/programs', component: ProgramsPage })
const adminRoute = createRoute({ getParentRoute: () => appRoute, path: '/admin', component: AdminPage })
const investorsRoute = createRoute({ getParentRoute: () => appRoute, path: '/investors', component: InvestorsPage })
const rankingsRoute = createRoute({ getParentRoute: () => appRoute, path: '/rankings', component: RankingsPage })
const communitiesRoute = createRoute({ getParentRoute: () => appRoute, path: '/communities', component: CommunitiesPage })
const communityDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/communities/$communityId', component: CommunityDetailPage })
const messagesRoute = createRoute({ getParentRoute: () => appRoute, path: '/messages', component: MessagesPage })
const notificationsRoute = createRoute({ getParentRoute: () => appRoute, path: '/notifications', component: NotificationsPage })
const jobsRoute = createRoute({ getParentRoute: () => appRoute, path: '/jobs', component: JobsPage })
const newsRoute = createRoute({ getParentRoute: () => appRoute, path: '/news', component: NewsPage })
const liveRoute = createRoute({ getParentRoute: () => appRoute, path: '/live', component: LivePage })
const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sign-in', component: SignInPage })
const signUpRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sign-up', component: SignUpPage })
const routeTree = rootRoute.addChildren([landingRoute, appRoute.addChildren([feedRoute, profileRoute, networkRoute, startupsRoute, startupDetailRoute, mentorshipRoute, programsRoute, adminRoute, investorsRoute, rankingsRoute, communitiesRoute, communityDetailRoute, messagesRoute, notificationsRoute, jobsRoute, newsRoute, liveRoute]), signInRoute, signUpRoute])
const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' { interface Register { router: typeof router } }

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: false } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider></React.StrictMode>,
)
