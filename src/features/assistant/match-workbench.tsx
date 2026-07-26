import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Rocket, Save, Search, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Snapshot } from '@/data/types'
import { mentors as staticMentors, startups as staticStartups } from '@/data/platform-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { runAssistant } from './engine'
import { buildContextualMatchPrompt } from './match-context'
import { AssistantCriteriaChips, AssistantResults } from './result-cards'
import { assistantContextFromSnapshot, type AssistantIntent, type AssistantResponse } from './types'

export type MatchWorkbenchMode = 'teammate' | 'mentor' | 'opportunity' | 'venture' | 'workspace'

const modes: Record<MatchWorkbenchMode, {
  title: string
  description: string
  intent?: AssistantIntent
  prompts: string[]
}> = {
  teammate: {
    title: 'Build your team with AI Match',
    description: 'Add your startup context and combine up to three requirements. Every result explains the evidence behind the match.',
    intent: 'find_teammate',
    prompts: ['Backend developer with Node.js and PostgreSQL', 'Open to a co-founder role', 'Baku or remote'],
  },
  mentor: {
    title: 'Match the right mentor to your next decision',
    description: 'Describe the stage, challenge, and outcome you need from a focused mentor session.',
    intent: 'find_mentor',
    prompts: ['Fundraising mentor for a pre-seed startup', 'Needs marketplace experience', 'Available for practical office hours'],
  },
  opportunity: {
    title: 'Match opportunities to your skills and goals',
    description: 'Combine role, skill, location, and collaboration preferences instead of relying on a keyword alone.',
    intent: 'find_job',
    prompts: ['Backend or full-stack role', 'Node.js, Python, or PostgreSQL', 'Remote-friendly startup team'],
  },
  venture: {
    title: 'Discover ventures through explainable signals',
    description: 'Describe the sector, stage, team, and evidence profile you want to explore.',
    intent: 'find_startup',
    prompts: ['ClimateTech or AgriTech startup', 'MVP or pilot stage', 'Readiness above 75'],
  },
  workspace: {
    title: 'Ask the workspace in natural language',
    description: 'Search people, ventures, mentors, opportunities, programs, and platform guidance through one explainable query.',
    prompts: ['Find a backend teammate', 'Show active startup programs', 'Find remote AI opportunities'],
  },
}

interface StoredDraft {
  startupSlug: string
  prompts: string[]
}

function readDraft(mode: MatchWorkbenchMode): StoredDraft {
  try {
    const value = JSON.parse(localStorage.getItem(`ssc.matchDraft.${mode}.v1`) ?? '{}')
    return {
      startupSlug: typeof value.startupSlug === 'string' ? value.startupSlug : '',
      prompts: Array.isArray(value.prompts) && value.prompts.length
        ? value.prompts.filter((item: unknown): item is string => typeof item === 'string').slice(0, 3)
        : [''],
    }
  } catch {
    return { startupSlug: '', prompts: [''] }
  }
}

export function MatchWorkbench({
  snapshot,
  mode,
  initialStartupSlug,
  className = '',
  compactResults = true,
}: {
  snapshot: Snapshot
  mode: MatchWorkbenchMode
  initialStartupSlug?: string
  className?: string
  compactResults?: boolean
}) {
  const config = modes[mode]
  const stored = useMemo(() => readDraft(mode), [mode])
  const startups = snapshot.startups?.length ? snapshot.startups : staticStartups
  const mentors = snapshot.mentors?.length ? snapshot.mentors : staticMentors
  const [startupSlug, setStartupSlug] = useState(initialStartupSlug ?? stored.startupSlug)
  const [prompts, setPrompts] = useState<string[]>(stored.prompts)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const startup = startups.find((item) => item.slug === startupSlug)
  const showStartupContext = mode !== 'workspace' && mode !== 'venture'

  useEffect(() => {
    localStorage.setItem(`ssc.matchDraft.${mode}.v1`, JSON.stringify({ startupSlug, prompts }))
  }, [mode, prompts, startupSlug])

  const updatePrompt = (index: number, value: string) => {
    setPrompts((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  const addPreset = (value: string) => {
    setPrompts((current) => {
      if (current.includes(value)) return current
      const emptyIndex = current.findIndex((item) => !item.trim())
      if (emptyIndex >= 0) return current.map((item, index) => index === emptyIndex ? value : item)
      return current.length < 3 ? [...current, value] : [...current.slice(0, 2), value]
    })
  }

  const match = () => {
    const query = buildContextualMatchPrompt(startup, prompts)
    if (query.length < 3) return toast.error('Add at least one matching requirement.')
    setResponse(runAssistant(
      query,
      assistantContextFromSnapshot(snapshot, startups, mentors, false),
      config.intent,
    ))
  }

  const saveSearch = () => {
    if (!response) return
    const key = 'ssc.savedMatches.v1'
    const current = JSON.parse(localStorage.getItem(key) ?? '[]')
    const next = [{
      id: crypto.randomUUID(),
      mode,
      startupSlug,
      prompts: prompts.filter((item) => item.trim()),
      resultIds: response.results.slice(0, 5).map((item) => item.entityId),
      createdAt: new Date().toISOString(),
    }, ...(Array.isArray(current) ? current : [])].slice(0, 20)
    localStorage.setItem(key, JSON.stringify(next))
    toast.success('Match search saved in this browser.')
  }

  return <Card data-ai-match-workbench={mode} className={`mb-7 overflow-hidden border-primary/20 ${className}`}>
    <div className='h-1 bg-gradient-to-r from-primary via-primary/35 to-transparent' />
    <CardHeader className='gap-2'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <CardTitle className='flex items-center gap-2'><Sparkles className='size-5 text-primary' />{config.title}</CardTitle>
          <CardDescription className='mt-1 max-w-3xl leading-5'>{config.description}</CardDescription>
        </div>
        {response && <Button type='button' size='sm' variant='outline' onClick={saveSearch}><Save className='size-3.5' />Save search</Button>}
      </div>
    </CardHeader>
    <CardContent className='space-y-4'>
      {showStartupContext && <div className='grid gap-3 md:grid-cols-[1fr_auto] md:items-end'>
        <label className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Startup context
          <select
            value={startupSlug}
            onChange={(event) => setStartupSlug(event.target.value)}
            className='mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground'
          >
            <option value=''>No startup selected</option>
            {startups.map((item) => <option key={item.slug} value={item.slug}>{item.name} · {item.stage} · {item.roles}</option>)}
          </select>
        </label>
        <Button type='button' variant='outline' asChild><Link to='/startups/new'><Rocket className='size-4' />Add startup</Link></Button>
      </div>}

      <div>
        <div className='mb-2 flex items-center justify-between gap-3'>
          <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Requirements ({prompts.length}/3)</span>
          {prompts.length < 3 && <Button type='button' size='sm' variant='ghost' onClick={() => setPrompts((current) => [...current, ''])}><Plus className='size-3.5' />Add requirement</Button>}
        </div>
        <div className='grid gap-2 lg:grid-cols-3'>
          {prompts.map((value, index) => <div key={index} className='relative'>
            <Textarea
              value={value}
              onChange={(event) => updatePrompt(index, event.target.value)}
              placeholder={config.prompts[index] ?? 'Describe another requirement'}
              className='min-h-20 resize-none pr-9 text-sm'
              aria-label={`Matching requirement ${index + 1}`}
            />
            {prompts.length > 1 && <button type='button' aria-label={`Remove requirement ${index + 1}`} onClick={() => setPrompts((current) => current.filter((_, itemIndex) => itemIndex !== index))} className='absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'><Trash2 className='size-3.5' /></button>}
          </div>)}
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-2'>{config.prompts.map((item) => <Button key={item} type='button' size='sm' variant='outline' className='h-auto whitespace-normal text-left text-xs' onClick={() => addPreset(item)}>{item}</Button>)}</div>
        <Button type='button' onClick={match}><Search className='size-4' />Find matches</Button>
      </div>

      {response && <div className='space-y-4 border-t pt-5'>
        <div className='space-y-2'><AssistantCriteriaChips response={response} /><p className='text-sm text-muted-foreground'>{response.summary}</p></div>
        <AssistantResults response={response} compact={compactResults} limit={compactResults ? 4 : undefined} />
      </div>}
    </CardContent>
  </Card>
}
