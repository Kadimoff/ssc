import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, Compass, GraduationCap, Network, Rocket, Users } from 'lucide-react'
import { PageContainer, PageHeading } from '@/app/app-shared'
import { DemoDataBadge } from '@/components/execution-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExecutionStore } from '@/features/execution/store'

const recommendations = [
  { icon: Users, title: 'Backend & Data Guild', kind: 'Community', reason: 'Because CampusCart has an open backend role and needs payment infrastructure.', to: '/communities' },
  { icon: GraduationCap, title: 'Marketplace validation office hours', kind: 'Mentor session', reason: 'Because your active milestone tests seller trust before checkout.', to: '/mentorship' },
  { icon: CalendarDays, title: 'Student Venture Validation Sprint', kind: 'Program', reason: 'Because CampusCart is validating and has a pending evidence bundle.', to: '/programs' },
  { icon: Rocket, title: 'GreenStack', kind: 'Startup', reason: 'Because you follow climate ventures with verified campus-pilot evidence.', to: '/startups' },
] as const

export function DiscoverPage() {
  const { state } = useExecutionStore()
  return <PageContainer>
    <div className='mb-3'><DemoDataBadge label='Illustrative recommendations' /></div>
    <PageHeading eyebrow='Discover' title='Recommendations with a reason.' description='Find people, teams, communities, programs, and events connected to your stage, sector, open roles, and institution.' />
    <div className='grid gap-5 md:grid-cols-2'>{recommendations.map(({ icon: Icon, title, kind, reason, to }) => <Card key={title}><CardHeader><div className='flex items-center justify-between gap-2'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><Icon /></span><Badge variant='secondary'>{kind}</Badge></div><CardTitle className='pt-2'>{title}</CardTitle><CardDescription className='leading-6'>{reason}</CardDescription></CardHeader><CardContent><Button variant='outline' className='w-full justify-between' asChild><Link to={to}>Review recommendation <ArrowRight /></Link></Button></CardContent></Card>)}</div>
    <Card className='mt-6'><CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'><Compass className='size-8 text-primary' /><div className='flex-1'><b>What shapes this view</b><p className='mt-1 text-sm text-muted-foreground'>Selected persona, {state.openRoles.filter((item) => item.status === 'open').length} open role, active milestones, saved ventures, and sample program context.</p></div><Button asChild><Link to='/network'><Network />Browse everyone</Link></Button></CardContent></Card>
  </PageContainer>
}
