import { Link, useRouterState } from '@tanstack/react-router'
import { LogIn, ShieldAlert } from 'lucide-react'
import { useSnapshot } from '@/app/app-data'
import { PageContainer, PageLoading } from '@/app/app-shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { canAccess, type AccessArea } from '@/app/access-policy'

export function AccessGate({ area, children }: { area: AccessArea; children: React.ReactNode }) {
  const { data } = useSnapshot()
  const location = useRouterState({ select: (state) => state.location.pathname })
  if (!data) return <PageLoading />
  if (!data.currentUser) {
    sessionStorage.setItem('ssc.intendedPath', location)
    return <PageContainer><AccessCard icon={LogIn} title='Sign in required' description='This workspace is available only to authenticated and authorized accounts.' action={<Button asChild><Link to='/sign-in'>Sign in</Link></Button>} /></PageContainer>
  }
  if (!canAccess(data.currentUser, area)) {
    return <PageContainer><AccessCard icon={ShieldAlert} title='Access restricted' description={`Your current ${data.currentUser.activeRole.replace(/_/g, ' ')} role does not have access to this workspace.`} action={<Button asChild><Link to='/feed'>Return home</Link></Button>} /></PageContainer>
  }
  return children
}

export function AccessDeniedPage() {
  return <PageContainer><AccessCard icon={ShieldAlert} title='Access restricted' description='Your account does not have permission to open that workspace.' action={<Button asChild><Link to='/feed'>Return home</Link></Button>} /></PageContainer>
}

function AccessCard({ icon: Icon, title, description, action }: { icon: typeof ShieldAlert; title: string; description: string; action: React.ReactNode }) {
  return <Card className='mx-auto max-w-xl text-center'><CardHeader><span className='mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600'><Icon /></span><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><p className='text-sm text-muted-foreground'>Access decisions use the account role in both demo and API modes.</p></CardContent><CardFooter className='justify-center'>{action}</CardFooter></Card>
}
