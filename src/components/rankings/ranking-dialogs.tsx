import { BarChart3, CheckCircle2, Database, FileCheck2, Info, ShieldCheck } from 'lucide-react'
import type { RankingEntry } from '@/data/rankings-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const breakdownLabels: Array<{ key: keyof RankingEntry['breakdown']; label: string; weight: string }> = [
  { key: 'execution', label: 'Execution progress', weight: '25%' },
  { key: 'evidence', label: 'Verified evidence', weight: '20%' },
  { key: 'milestones', label: 'Milestone completion', weight: '20%' },
  { key: 'team', label: 'Team completeness', weight: '15%' },
  { key: 'community', label: 'Community contribution', weight: '10%' },
  { key: 'activity', label: 'Recent activity', weight: '10%' },
]

export function RankingMethodology() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant='outline'><Info className='size-4' />How rankings work</Button></DialogTrigger>
      <DialogContent className='max-h-[85svh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader><DialogTitle>How SSC rankings work</DialogTitle><DialogDescription>Transparent ecosystem-visibility signals from the illustrative workspace dataset.</DialogDescription></DialogHeader>
        <div className='grid gap-3 sm:grid-cols-2'>
          {[
            { icon: BarChart3, title: 'Signals considered', text: 'Execution progress, milestone completion, team completeness, community contribution and recent activity.' },
            { icon: FileCheck2, title: 'Verified evidence', text: 'Artifacts count as verified only when their workspace verification status is explicitly marked verified.' },
            { icon: Database, title: 'Update cadence', text: 'The demo ranking is recalculated from current frontend records when filters or periods change.' },
            { icon: ShieldCheck, title: 'Integrity controls', text: 'Follower and like counts are not sufficient. Missing data receives a neutral fallback and cannot create an empty row.' },
          ].map((item) => <div key={item.title} className='rounded-xl border bg-muted/25 p-4'><item.icon className='size-5 text-primary' /><h3 className='mt-3 text-sm font-semibold'>{item.title}</h3><p className='mt-1 text-xs leading-5 text-muted-foreground'>{item.text}</p></div>)}
        </div>
        <div className='rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4 text-xs leading-5 text-amber-800 dark:text-amber-200'>All records on this page are illustrative. This ranking supports discovery and ecosystem visibility. It does not predict investment outcomes.</div>
      </DialogContent>
    </Dialog>
  )
}

export function RankingScoreBreakdown({ entry, onClose }: { entry: RankingEntry | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(entry)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className='sm:max-w-xl'>
        {entry && <>
          <DialogHeader><div className='flex items-center gap-2'><DialogTitle>{entry.name} score breakdown</DialogTitle>{entry.verifiedEvidence && <Badge className='gap-1 bg-emerald-500/10 text-emerald-600'><CheckCircle2 className='size-3' />Verified evidence</Badge>}</div><DialogDescription>{entry.university} · {entry.sector} · {entry.stage}</DialogDescription></DialogHeader>
          <div className='rounded-xl border bg-primary/[0.035] p-4'><div className='flex items-end justify-between'><div><p className='text-xs text-muted-foreground'>Overall decision-support signal</p><p className='mt-1 text-3xl font-extrabold'>{entry.score}<span className='ml-1 text-sm font-medium text-muted-foreground'>/ 100</span></p></div><Badge variant='outline'>{entry.lastActivity}</Badge></div></div>
          <div className='grid grid-cols-2 gap-3'><div className='rounded-xl border p-3'><p className='text-[10px] font-semibold uppercase text-muted-foreground'>Evidence records</p><b className='mt-1 block text-xl'>{entry.evidenceCount}</b></div><div className='rounded-xl border p-3'><p className='text-[10px] font-semibold uppercase text-muted-foreground'>Signal confidence</p><b className='mt-1 block text-xl'>{entry.confidence}%</b></div></div>
          <div className='space-y-3'>
            {breakdownLabels.map((item) => <div key={item.key}><div className='mb-1.5 flex items-center justify-between text-xs'><span className='font-medium'>{item.label} <span className='text-muted-foreground'>· weight {item.weight}</span></span><b>{entry.breakdown[item.key]}</b></div><div className='h-2 overflow-hidden rounded-full bg-muted'><div className='h-full rounded-full bg-primary' style={{ width: `${entry.breakdown[item.key]}%` }} /></div></div>)}
          </div>
          <div className='rounded-xl border p-3 text-xs'><b>Strongest current signal</b><p className='mt-1 leading-5 text-muted-foreground'>{entry.strongestSignal}</p></div>
          <p className='text-[11px] leading-5 text-muted-foreground'>This ranking supports discovery and ecosystem visibility. It does not predict investment outcomes.</p>
        </>}
      </DialogContent>
    </Dialog>
  )
}
