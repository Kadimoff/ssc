import { Link, useRouterState } from '@tanstack/react-router'
import { BriefcaseBusiness, Building2, CalendarDays, Newspaper, Rocket, Search, Users } from 'lucide-react'
import { useSnapshot } from '@/app/app-data'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { articles, communityEvents } from '@/data/editorial-content'
import { startups as staticStartups } from '@/data/platform-content'
import { Card, CardContent } from '@/components/ui/card'

export function SearchPage() {
  const { data } = useSnapshot()
  const searchString = useRouterState({ select: (state) => state.location.searchStr })
  const query = new URLSearchParams(searchString).get('q')?.trim() ?? ''
  if (!data) return <PageLoading />
  const startups = data.startups?.length ? data.startups : staticStartups
  const match = (value: string) => query.length > 1 && value.toLowerCase().includes(query.toLowerCase())
  const results = [
    ...data.users.filter((item) => match(`${item.name} ${item.title} ${item.skills}`)).map((item) => ({ key: item.id, title: item.name, detail: item.title, to: `/people/${item.username}`, icon: Users })),
    ...startups.filter((item) => match(`${item.name} ${item.sector} ${item.summary}`)).map((item) => ({ key: item.slug, title: item.name, detail: `${item.sector} · ${item.stage}`, to: `/startups/${item.slug}`, icon: Rocket })),
    ...data.organizations.filter((item) => match(`${item.displayName} ${item.type} ${item.summary}`)).map((item) => ({ key: item.id, title: item.displayName, detail: `${item.type.replace(/_/g, ' ')} · organization`, to: '/partnerships', icon: Building2 })),
    ...data.jobs.filter((item) => match(`${item.role} ${item.company} ${item.skills}`)).map((item) => ({ key: item.id, title: item.role, detail: `${item.company} · ${item.location}`, to: `/jobs/${item.id}`, icon: BriefcaseBusiness })),
    ...articles.filter((item) => match(`${item.title} ${item.summary}`)).map((item) => ({ key: item.slug, title: item.title, detail: `${item.category} · ${item.date}`, to: `/news/${item.slug}`, icon: Newspaper })),
    ...communityEvents.filter((item) => match(`${item.title} ${item.description}`)).map((item) => ({ key: item.slug, title: item.title, detail: `${item.date} · ${item.location}`, to: `/events/${item.slug}`, icon: CalendarDays })),
  ]
  return <PageContainer><PageHeading eyebrow='Workspace search' title={query ? `Results for “${query}”` : 'Search the SSC workspace'} description='Find people, ventures, organizations, opportunities, articles, and events from one place.' />
    {!query ? <Empty text='Enter a search term in the header.' /> : results.length ? <div className='grid gap-3'>{results.map((result) => <Link key={`${result.to}-${result.key}`} to={result.to} className='block'><Card className='transition-colors hover:border-primary/30'><CardContent className='flex items-center gap-4 p-4'><span className='grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'><result.icon /></span><div><b>{result.title}</b><p className='text-sm text-muted-foreground'>{result.detail}</p></div></CardContent></Card></Link>)}</div> : <Empty text='No matching workspace records were found.' />}
  </PageContainer>
}
function Empty({ text }: { text: string }) { return <Card className='border-dashed'><CardContent className='py-16 text-center text-muted-foreground'><Search className='mx-auto mb-3 size-9' /><p>{text}</p></CardContent></Card> }
