import { Link } from '@tanstack/react-router'
import { BookOpen, FileText, LifeBuoy, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { PageContainer, PageHeading } from '@/app/app-shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HelpPage() {
  const guides = [
    { title: 'Account and roles', text: 'Understand member, investor, partner, program, moderator, and administrator access.', to: '/verification' as const },
    { title: 'Partnership evidence', text: 'Learn why contributions remain pending until independently reviewed.', to: '/partnerships' as const },
    { title: 'Goals and milestones', text: 'Define completion evidence before marking progress.', to: '/goals' as const },
  ]
  return <PageContainer><PageHeading eyebrow='Support' title='Help center' description='Practical guidance for using SSC responsibly and resolving access or evidence questions.' /><div className='grid gap-4 md:grid-cols-3'>{guides.map((guide) => <Card key={guide.title}><CardHeader><BookOpen className='text-primary' /><CardTitle>{guide.title}</CardTitle></CardHeader><CardContent><p className='mb-4 text-sm leading-6 text-muted-foreground'>{guide.text}</p><Button variant='outline' asChild><Link to={guide.to}>Open guide</Link></Button></CardContent></Card>)}</div><Card className='mt-6'><CardContent className='flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center'><LifeBuoy className='text-primary' /><div className='flex-1'><b>Need operational support?</b><p className='text-sm text-muted-foreground'>Use the local project owner for access, evidence correction, or incident escalation.</p></div><Button variant='outline' asChild><a href='mailto:support@ssc.local'><Mail />support@ssc.local</a></Button></CardContent></Card></PageContainer>
}

export function PrivacyPage() { return <PolicyPage title='Privacy policy' eyebrow='Data protection' icon={ShieldCheck} sections={[
  ['Data we process', 'Account profiles, role assignments, program participation, consent records, messages, evidence metadata, and audit events required to operate the workspace.'],
  ['Purpose and minimization', 'SSC processes only the information required for community participation, program delivery, verification, safety, and accountable reporting. Raw national identifiers are not part of the baseline model.'],
  ['Visibility and sharing', 'Profile and evidence visibility depends on role and program scope. Partner access must be limited to the purpose agreed for the relevant program.'],
  ['Retention and correction', 'Production retention must be defined in the applicable agreement. Material corrections create auditable events rather than silently rewriting history.'],
]} /> }
export function TermsPage() { return <PolicyPage title='Terms of service' eyebrow='Platform terms' icon={FileText} sections={[
  ['Acceptable use', 'Use SSC for lawful collaboration, program delivery, and evidence-based reporting. Harassment, impersonation, unauthorized disclosure, and manipulated evidence are prohibited.'],
  ['Claims and evidence', 'Illustrative records are not real partnerships or outcomes. Users must not present pending, rejected, or unverified records as confirmed impact.'],
  ['Accounts and authority', 'Privileged roles require appropriate authority. Accounts may be suspended when access, safety, or evidence integrity is at risk.'],
  ['Service status', 'This repository is a local pilot baseline. Production use requires legal review, hardened deployment, backups, monitoring, and accountable operators.'],
]} /> }
export function NotFoundPage() { return <PageContainer><Card className='mx-auto max-w-xl text-center'><CardContent className='py-16'><LockKeyhole className='mx-auto mb-4 size-12 text-muted-foreground' /><h1 className='text-2xl font-bold'>Page not found</h1><p className='mt-2 text-muted-foreground'>The destination may have moved or may not exist.</p><Button className='mt-5' asChild><Link to='/feed'>Return home</Link></Button></CardContent></Card></PageContainer> }

function PolicyPage({ title, eyebrow, icon: Icon, sections }: { title: string; eyebrow: string; icon: typeof ShieldCheck; sections: string[][] }) {
  return <PageContainer><PageHeading eyebrow={eyebrow} title={title} description='SSC local pilot baseline · version 1.0 · 23 July 2026' /><div className='mx-auto max-w-4xl space-y-4'>{sections.map(([heading, text]) => <Card key={heading}><CardHeader><CardTitle className='flex items-center gap-2'><Icon className='size-5 text-primary' />{heading}</CardTitle></CardHeader><CardContent><p className='leading-7 text-muted-foreground'>{text}</p></CardContent></Card>)}</div></PageContainer>
}
