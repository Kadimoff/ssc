import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { ThemeToggle } from '@/app/app-shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const contactDetails = [
  {
    label: 'Email',
    value: 'startupandtto@asoiu.edu.az',
    href: 'mailto:startupandtto@asoiu.edu.az',
    icon: Mail,
  },
  {
    label: 'Phone',
    value: '+994 70 606 98 76',
    href: 'tel:+994706069876',
    icon: Phone,
  },
] as const

export function ContactPage() {
  return <div className='relative isolate flex min-h-svh flex-col overflow-hidden'>
    <header className='relative z-10'>
      <div className='app-container flex h-[72px] items-center justify-between'>
        <Link to='/' aria-label='SSC home' className='inline-flex min-h-11 items-center gap-3 font-extrabold tracking-tight'>
          <span className='grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-sm text-primary shadow-sm'>SSC</span>
          <span className='hidden text-sm sm:block'>Student Startup Community</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>

    <main className='app-container relative z-10 flex flex-1 items-center py-14 sm:py-20'>
      <div className='mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20'>
        <section className='text-center lg:text-left' aria-labelledby='contact-page-title'>
          <div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur'>
            <span className='size-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] animate-pulse' />
            Free for students · Built for the ecosystem
          </div>
          <h1 id='contact-page-title' className='mt-7 text-5xl font-extrabold leading-[1.04] tracking-[-.05em] sm:text-6xl lg:text-7xl'>
            From campus ideas to
            <span className='animated-gradient-text block'>verified startup outcomes.</span>
          </h1>
          <p className='mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground lg:mx-0'>
            SSC connects founders, universities, mentors and investors in one execution platform—turning ideas into visible, measurable progress.
          </p>
          <div className='mt-9 flex flex-wrap justify-center gap-3 lg:justify-start'>
            <Button size='lg' className='premium-explore-cta group h-12 gap-2 overflow-hidden px-6' asChild>
              <Link to='/'>View SSC Demo <ArrowUpRight className='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' /></Link>
            </Button>
            <Button size='lg' variant='outline' className='h-12 gap-2 px-6' asChild>
              <a href='mailto:startupandtto@asoiu.edu.az'>Contact Us <MessageCircle /></a>
            </Button>
          </div>
        </section>

        <Card className='glass-card mx-auto w-full max-w-lg overflow-hidden border-primary/15 bg-card/70 py-0 shadow-2xl shadow-primary/5 backdrop-blur-xl'>
          <CardContent className='p-6 sm:p-8'>
            <div className='mb-7'>
              <p className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>Let&apos;s connect</p>
              <h2 className='mt-3 text-3xl font-bold tracking-[-.035em] sm:text-4xl'>Start a conversation.</h2>
              <p className='mt-3 leading-7 text-muted-foreground'>Want to learn more about SSC? Reach the Startup and TTO team directly.</p>
            </div>

            <div className='space-y-3'>
              {contactDetails.map(({ label, value, href, icon: Icon }) => <a
                key={label}
                href={href}
                className='group grid min-h-20 grid-cols-[48px_minmax(0,1fr)_20px] items-center gap-4 rounded-2xl border bg-background/35 p-4 transition-all hover:translate-x-1 hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span className='grid size-12 place-items-center rounded-xl bg-primary/10 text-primary'><Icon className='size-5' /></span>
                <span className='min-w-0'>
                  <span className='block text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>{label}</span>
                  <span className='mt-1 block truncate text-sm font-semibold sm:text-base'>{value}</span>
                </span>
                <ArrowUpRight className='size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary' />
              </a>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>

    <footer className='relative z-10'>
      <div className='app-container flex flex-col items-center justify-between gap-3 border-t py-6 text-xs text-muted-foreground sm:flex-row'>
        <span>SSC · Startup &amp; TTO</span>
        <Button variant='link' size='sm' className='h-auto p-0 text-xs text-muted-foreground' asChild>
          <Link to='/'><ArrowLeft /> Back to SSC</Link>
        </Button>
      </div>
    </footer>
  </div>
}
