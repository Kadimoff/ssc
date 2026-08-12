import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  AccessDeniedPage, AccessGate, AdminPage, AppShell, AssistantPage, CommunitiesPage, CommunityDetailPage, ContactPage, EventDetailPage,
  EventsPage, FeedPage, HelpPage, InvestorsPage, JobDetailPage, JobsPage, LandingPage, LivePage,
  MemberProfilePage, MentorshipPage, MessagesPage, NetworkPage, NewsDetailPage, NewsPage, NotFoundPage,
  NotificationsPage, PartnershipsPage, PrivacyPage, ProfilePage, ProgramsPage, RankingsPage, SearchPage,
  SettingsPage, SignInPage, SignUpPage, StartupCreatePage, StartupDetailPage, StartupsPage, TermsPage,
  VerificationPage, WorkspacePage, DiscoverPage,
} from './app'
import { ShaderBackground } from './components/shader-background'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const rootRoute = createRootRoute({ component: () => <><ShaderBackground /><Outlet /><Toaster richColors position='top-right' /></>, notFoundComponent: NotFoundPage })
const landingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage })
const appRoute = createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppShell })
const feedRoute = createRoute({ getParentRoute: () => appRoute, path: '/feed', component: FeedPage })
const workspaceRoute = createRoute({ getParentRoute: () => appRoute, path: '/workspace', component: WorkspacePage })
const discoverRoute = createRoute({ getParentRoute: () => appRoute, path: '/discover', component: DiscoverPage })
const profileRoute = createRoute({ getParentRoute: () => appRoute, path: '/profile', component: ProfilePage })
const networkRoute = createRoute({ getParentRoute: () => appRoute, path: '/network', component: NetworkPage })
const startupsRoute = createRoute({ getParentRoute: () => appRoute, path: '/startups', component: StartupsPage })
const startupDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/startups/$slug', component: StartupDetailPage })
const startupCreateRoute = createRoute({ getParentRoute: () => appRoute, path: '/startups/new', component: StartupCreatePage })
const mentorshipRoute = createRoute({ getParentRoute: () => appRoute, path: '/mentorship', component: MentorshipPage })
const programsRoute = createRoute({ getParentRoute: () => appRoute, path: '/programs', component: ProgramsPage })
const adminRoute = createRoute({ getParentRoute: () => appRoute, path: '/admin', component: () => <AccessGate area='admin'><AdminPage /></AccessGate> })
const investorsRoute = createRoute({ getParentRoute: () => appRoute, path: '/investors', component: () => <AccessGate area='investor'><InvestorsPage /></AccessGate> })
const rankingsRoute = createRoute({ getParentRoute: () => appRoute, path: '/rankings', component: RankingsPage })
const communitiesRoute = createRoute({ getParentRoute: () => appRoute, path: '/communities', component: CommunitiesPage })
const communityDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/communities/$communityId', component: CommunityDetailPage })
const messagesRoute = createRoute({ getParentRoute: () => appRoute, path: '/messages', component: MessagesPage })
const notificationsRoute = createRoute({ getParentRoute: () => appRoute, path: '/notifications', component: NotificationsPage })
const jobsRoute = createRoute({ getParentRoute: () => appRoute, path: '/jobs', component: JobsPage })
const jobDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/jobs/$jobId', component: JobDetailPage })
const newsRoute = createRoute({ getParentRoute: () => appRoute, path: '/news', component: NewsPage })
const newsDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/news/$slug', component: NewsDetailPage })
const eventsRoute = createRoute({ getParentRoute: () => appRoute, path: '/events', component: EventsPage })
const eventDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/events/$eventId', component: EventDetailPage })
const memberProfileRoute = createRoute({ getParentRoute: () => appRoute, path: '/people/$username', component: MemberProfilePage })
const searchRoute = createRoute({ getParentRoute: () => appRoute, path: '/search', component: SearchPage })
const assistantRoute = createRoute({ getParentRoute: () => appRoute, path: '/assistant', component: AssistantPage })
const settingsRoute = createRoute({ getParentRoute: () => appRoute, path: '/settings', component: SettingsPage })
const verificationRoute = createRoute({ getParentRoute: () => appRoute, path: '/verification', component: VerificationPage })
const goalsRoute = createRoute({ getParentRoute: () => appRoute, path: '/goals', component: () => <WorkspacePage milestonesOnly /> })
const helpRoute = createRoute({ getParentRoute: () => appRoute, path: '/help', component: HelpPage })
const privacyRoute = createRoute({ getParentRoute: () => appRoute, path: '/privacy', component: PrivacyPage })
const termsRoute = createRoute({ getParentRoute: () => appRoute, path: '/terms', component: TermsPage })
const accessDeniedRoute = createRoute({ getParentRoute: () => appRoute, path: '/access-denied', component: AccessDeniedPage })
const liveRoute = createRoute({ getParentRoute: () => appRoute, path: '/live', component: LivePage })
const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sign-in', component: SignInPage })
const signUpRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sign-up', component: SignUpPage })
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contact', component: ContactPage })
const guardedPartnershipsRoute = createRoute({ getParentRoute: () => appRoute, path: '/partnerships', component: () => <AccessGate area='partnerships'><PartnershipsPage /></AccessGate> })
const routeTree = rootRoute.addChildren([landingRoute, appRoute.addChildren([
  feedRoute, workspaceRoute, discoverRoute, profileRoute, networkRoute, memberProfileRoute, startupsRoute, startupCreateRoute, startupDetailRoute,
  mentorshipRoute, programsRoute, guardedPartnershipsRoute, adminRoute, investorsRoute, rankingsRoute,
  communitiesRoute, communityDetailRoute, messagesRoute, notificationsRoute, jobsRoute, jobDetailRoute,
  newsRoute, newsDetailRoute, eventsRoute, eventDetailRoute, liveRoute, searchRoute, assistantRoute, settingsRoute,
  verificationRoute, goalsRoute, helpRoute, privacyRoute, termsRoute, accessDeniedRoute,
]), signInRoute, signUpRoute, contactRoute])
const router = createRouter({ routeTree, defaultPreload: 'intent', basepath: '/ssc' })

declare module '@tanstack/react-router' { interface Register { router: typeof router } }

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: false } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider></React.StrictMode>,
)

if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('layout-audit')) {
  void import('./lib/responsive-audit').then(({ installResponsiveAudit }) => installResponsiveAudit())
}
