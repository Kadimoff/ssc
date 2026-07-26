import { Link, useParams } from '@tanstack/react-router'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { toast } from 'sonner'
import { communityEvents } from '@/data/editorial-content'
import { PageContainer, PageHeading } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const registrationKey = 'ssc.eventRegistrations.v1'
const registrations = () => new Set<string>(JSON.parse(localStorage.getItem(registrationKey) ?? '[]'))
const toggleRegistration = (slug: string) => {
  const current = registrations()
  if (current.has(slug)) current.delete(slug); else current.add(slug)
  localStorage.setItem(registrationKey, JSON.stringify([...current]))
  return current.has(slug)
}

export function EventsPage() {
  return <PageContainer><PageHeading eyebrow='Events' title='Show up with a goal.' description='Workshops, office hours, and showcases designed around clear preparation and useful follow-through.' /><div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{communityEvents.map((event) => <Card key={event.slug} className='flex flex-col'><CardHeader><Badge className='w-fit'>{event.format}</Badge><CardTitle className='mt-3'>{event.title}</CardTitle></CardHeader><CardContent className='flex-1 space-y-2 text-sm text-muted-foreground'><Meta icon={CalendarDays} text={event.date} /><Meta icon={Clock} text={event.time} /><Meta icon={MapPin} text={event.location} /><p className='pt-3 leading-6'>{event.description}</p></CardContent><CardFooter className='border-t'><Button asChild className='w-full'><Link to='/events/$eventId' params={{ eventId: event.slug }}>View event</Link></Button></CardFooter></Card>)}</div></PageContainer>
}

export function EventDetailPage() {
  const { eventId } = useParams({ from: '/app/events/$eventId' })
  const event = communityEvents.find((item) => item.slug === eventId)
  if (!event) return <PageContainer><Card><CardContent className='py-20 text-center'>Event not found.</CardContent></Card></PageContainer>
  const registered = registrations().has(event.slug)
  return <PageContainer><div className='grid gap-6 lg:grid-cols-[1fr_320px]'><main><Badge>{event.format}</Badge><h1 className='mt-4 text-4xl font-bold'>{event.title}</h1><p className='mt-4 text-lg leading-8 text-muted-foreground'>{event.description}</p><Card className='mt-7'><CardHeader><CardTitle>Agenda</CardTitle></CardHeader><CardContent className='space-y-3'>{event.agenda.map((item, index) => <div key={item} className='flex items-center gap-3 rounded-lg border p-3'><span className='grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary'>{index + 1}</span>{item}</div>)}</CardContent></Card></main><aside><Card className='sticky top-32'><CardHeader><CardTitle>Event details</CardTitle></CardHeader><CardContent className='space-y-3 text-sm'><Meta icon={CalendarDays} text={event.date} /><Meta icon={Clock} text={event.time} /><Meta icon={MapPin} text={event.location} /><Meta icon={Users} text={`${event.registered} / ${event.capacity} registered`} /><p className='pt-2 text-xs text-muted-foreground'>Hosted by {event.host}. Demo registrations stay on this device.</p><Button className='mt-3 w-full' variant={registered ? 'outline' : 'default'} onClick={() => { const active = toggleRegistration(event.slug); toast.success(active ? 'Registration saved' : 'Registration cancelled'); window.location.reload() }}>{registered ? 'Cancel registration' : 'Register'}</Button></CardContent></Card></aside></div></PageContainer>
}
function Meta({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) { return <div className='flex items-center gap-2'><Icon className='size-4 text-primary' />{text}</div> }
