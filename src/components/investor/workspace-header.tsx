import { ChevronDown, Settings2, ShieldCheck, Sparkles } from 'lucide-react'
import type { SavedInvestorThesis } from '@/data/investor-workspace-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function InvestorWorkspaceHeader({
  theses,
  activeThesisId,
  onThesisChange,
  onSettings,
  onNewSearch,
}: {
  theses: SavedInvestorThesis[]
  activeThesisId: string
  onThesisChange: (id: string) => void
  onSettings: () => void
  onNewSearch: () => void
}) {
  return (
    <header className='mb-6 rounded-2xl border border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_42%)] p-5 sm:p-6'>
      <div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
        <div className='max-w-2xl'>
          <div className='mb-3 flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>Investor command center</Badge>
            <Badge variant='outline' className='gap-1.5 bg-background/70'>
              <ShieldCheck className='size-3' aria-hidden='true' />
              Illustrative dataset
            </Badge>
          </div>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Investor Workspace</h1>
          <p className='mt-2 text-base font-medium text-foreground/85'>Discover, review and track verified student-led ventures.</p>
          <p className='mt-1 text-sm leading-6 text-muted-foreground'>Match ventures to your thesis, inspect evidence and manage your review workflow.</p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end'>
          <label className='relative min-w-60 text-xs font-semibold text-muted-foreground'>
            Saved thesis
            <select
              value={activeThesisId}
              onChange={(event) => onThesisChange(event.target.value)}
              className='mt-1 h-10 w-full appearance-none rounded-lg border bg-background pl-3 pr-9 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              {theses.map((thesis) => <option key={thesis.id} value={thesis.id}>{thesis.name}</option>)}
            </select>
            <ChevronDown className='pointer-events-none absolute bottom-3 right-3 size-4' aria-hidden='true' />
          </label>
          <Button variant='outline' onClick={onSettings}><Settings2 />Settings</Button>
          <Button onClick={onNewSearch}><Sparkles />New thesis search</Button>
        </div>
      </div>
    </header>
  )
}
