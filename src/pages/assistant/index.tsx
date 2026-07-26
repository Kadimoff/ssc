import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Bot, Clock3, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { type AssistantEntityType, type AssistantResponse } from '@/features/assistant/types'
import { clearAssistantHistory, readAssistantHistory, saveAssistantPrompt } from '@/features/assistant/storage'
import { AssistantCriteriaChips, AssistantResults } from '@/features/assistant/result-cards'
import { roleQuickPrompts } from '@/features/assistant/prompts'
import type { Snapshot } from '@/data/types'
import { apiClient, runtimeMode } from '@/data/client'
import { AuthRequired, PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function AssistantPage() {
  const { data } = useSnapshot()
  const searchString = useRouterState({ select: (state) => state.location.searchStr })
  const initialPrompt = new URLSearchParams(searchString).get('q')?.trim() ?? ''
  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to use SSC Copilot' />
  return <AssistantWorkspace key={`${data.currentUser.id}:${initialPrompt}`} data={data} initialPrompt={initialPrompt} />
}

function AssistantWorkspace({ data, initialPrompt }: { data: Snapshot; initialPrompt: string }) {
  const user = data.currentUser!
  const [prompt, setPrompt] = useState(initialPrompt)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [history, setHistory] = useState(() => readAssistantHistory())
  const [filter, setFilter] = useState<AssistantEntityType | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (value = prompt) => {
    const next = value.trim()
    if (next.length < 3) return
    setPrompt(next)
    setLoading(true)
    setError('')
    try {
      setResponse(await apiClient.assistantQuery(next))
      setHistory(saveAssistantPrompt(next))
      setFilter('all')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Assistant request failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!initialPrompt) return
    let active = true
    apiClient.assistantQuery(initialPrompt).then((result) => {
      if (active) setResponse(result)
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Assistant request failed')
    })
    return () => { active = false }
  }, [initialPrompt])
  const visibleResponse = response && filter !== 'all' ? { ...response, results: response.results.filter((item) => item.entityType === filter) } : response
  const resultTypes = response ? [...new Set(response.results.map((item) => item.entityType))] : []
  return <PageContainer>
    <PageHeading eyebrow='SSC Copilot' title='Describe the outcome. Inspect the evidence behind every match.' description='Search people, ventures, mentors, opportunities, programs, and authorized partner records using natural language.' />
    <div className='grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]'>
      <aside className='space-y-4'>
        <Card><CardHeader className='flex-row items-center justify-between'><CardTitle className='flex items-center gap-2 text-base'><Clock3 className='size-4' />Recent prompts</CardTitle>{history.length > 0 && <Button variant='ghost' size='icon' aria-label='Clear assistant history' onClick={() => { clearAssistantHistory(); setHistory([]) }}><Trash2 /></Button>}</CardHeader><CardContent className='space-y-2'>{history.length ? history.map((item) => <button key={item.id} onClick={() => submit(item.prompt)} className='w-full rounded-lg border p-2.5 text-left text-xs leading-5 transition-colors hover:border-primary/30 hover:bg-muted/40'>{item.prompt}</button>) : <p className='text-sm text-muted-foreground'>Your recent prompts stay in this browser.</p>}</CardContent></Card>
        <Card><CardContent className='space-y-2 p-4 text-xs leading-5 text-muted-foreground'><div className='flex items-center gap-2 font-semibold text-foreground'><ShieldCheck className='size-4 text-primary' />Privacy by design</div><p>{runtimeMode === 'api' ? 'Raw prompts are not stored. Personal contact details are redacted before an optional model extracts filters.' : 'Demo prompts stay in this browser. Scores are deterministic relevance calculations.'} Results are not predictions or investment advice.</p></CardContent></Card>
      </aside>
      <main className='min-w-0 space-y-5'>
        <Card className='overflow-hidden border-primary/20'><div className='h-1 bg-gradient-to-r from-primary via-primary/30 to-transparent' /><CardContent className='p-5'>
          <form onSubmit={(event) => { event.preventDefault(); void submit() }} className='space-y-3'><Textarea autoFocus value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder='Example: I need a backend teammate with Python experience for a ClimateTech MVP.' className='min-h-28 text-base' /><div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'><div className='flex flex-wrap gap-2'>{roleQuickPrompts(user).slice(0, 2).map((item) => <Button key={item} type='button' size='sm' variant='outline' className='h-auto whitespace-normal' onClick={() => void submit(item)}><Sparkles />{item}</Button>)}</div><Button disabled={loading || prompt.trim().length < 3}><Send />{loading ? 'Matching…' : 'Analyze and match'}</Button></div></form>
        </CardContent></Card>
        {error && <p role='alert' className='rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'>{error}</p>}
        {!response ? <Card className='border-dashed'><CardContent className='py-20 text-center'><span className='mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary'><Bot className='size-8' /></span><h2 className='text-xl font-bold'>What do you want to accomplish?</h2><p className='mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground'>Write naturally in English, Turkish, or Azerbaijani. The prototype will extract intent and rank available workspace records.</p></CardContent></Card> : <>
          <div className='space-y-2'><AssistantCriteriaChips response={response} /><p className='text-sm text-muted-foreground'>{response.summary}</p></div>
          {resultTypes.length > 1 && <div className='flex flex-wrap gap-2'><button onClick={() => setFilter('all')} className={cn('rounded-full border px-3 py-1 text-xs font-semibold', filter === 'all' ? 'border-primary/40 bg-primary/15 text-primary' : 'text-muted-foreground')}>All</button>{resultTypes.map((type) => <button key={type} onClick={() => setFilter(type)} className={cn('rounded-full border px-3 py-1 text-xs font-semibold capitalize', filter === type ? 'border-primary/40 bg-primary/15 text-primary' : 'text-muted-foreground')}>{type}</button>)}</div>}
          {visibleResponse && <AssistantResults response={visibleResponse} />}
        </>}
      </main>
    </div>
  </PageContainer>
}
