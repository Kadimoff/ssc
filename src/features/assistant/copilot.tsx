import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import {
  Bot, ExternalLink, RotateCcw, Send, ShieldCheck, Sparkles, Trash2, X,
} from 'lucide-react'
import type { Snapshot } from '@/data/types'
import { mentors, startups } from '@/data/platform-content'
import {
  clearCopilotConversation, type CopilotTurn, readAssistantHistory, readCopilotConversation,
  saveAssistantPrompt, saveCopilotConversation,
} from './storage'
import { runAssistant } from './engine'
import { AssistantCriteriaChips, AssistantResults } from './result-cards'
import { roleQuickPrompts } from './prompts'
import { assistantContextFromSnapshot } from './types'
import { apiClient, runtimeMode } from '@/data/client'
import { useReducedMotion } from '@/hooks/use-animations'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const panelId = 'ssc-copilot-panel'

function contextualPrompt(prompt: string, previousTurns: CopilotTurn[]) {
  const previous = [...previousTurns].reverse().find((turn) => turn.status === 'complete')
  if (!previous) return prompt
  const normalized = prompt.toLocaleLowerCase('en').trim()
  const looksLikeFollowUp = prompt.length < 120 && /^(only|just|and|also|what about|show me|baku|remote|sadece|yalniz|yalnız|yalnızca|peki|bəs|ancaq|daha)\b/.test(normalized)
  return looksLikeFollowUp ? `${previous.prompt}. Follow-up filter: ${prompt}` : prompt
}

export function Copilot({ snapshot }: { snapshot: Snapshot }) {
  const user = snapshot.currentUser
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [turns, setTurns] = useState<CopilotTurn[]>(() => readCopilotConversation())
  const [recent, setRecent] = useState(() => readAssistantHistory())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const animatedTurnCount = useRef(turns.length)
  const animatedTurnState = useRef(turns.map((turn) => `${turn.id}:${turn.status}`).join('|'))
  const loading = turns.some((turn) => turn.status === 'loading')

  const closePanel = useCallback(() => {
    if (!open || closingRef.current) return
    const panel = panelRef.current
    if (reducedMotion || !panel) {
      setOpen(false)
      return
    }
    closingRef.current = true
    gsap.to(panel, {
      opacity: 0,
      scale: 0.14,
      x: 125,
      y: 95,
      rotate: 5,
      filter: 'blur(10px)',
      borderRadius: '999px',
      transformOrigin: 'bottom right',
      duration: 0.38,
      ease: 'power3.in',
      onComplete: () => {
        setOpen(false)
        closingRef.current = false
      },
    })
  }, [open, reducedMotion])

  useEffect(() => {
    saveCopilotConversation(turns)
    const timeline = timelineRef.current
    if (!timeline) return
    const frame = window.requestAnimationFrame(() => {
      timeline.scrollTo({ top: timeline.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
      if (turns.length <= animatedTurnCount.current || reducedMotion) {
        animatedTurnCount.current = turns.length
      } else {
        const latest = timeline.querySelector<HTMLElement>('[data-chat-turn]:last-child')
        if (latest) {
          gsap.fromTo(latest, { opacity: 0, y: 18, scale: 0.97 }, {
            opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out', clearProps: 'all',
          })
        }
        animatedTurnCount.current = turns.length
      }

      const state = turns.map((turn) => `${turn.id}:${turn.status}`).join('|')
      if (!reducedMotion && state !== animatedTurnState.current && turns[turns.length - 1]?.status === 'complete') {
        const resultParts = timeline.querySelectorAll<HTMLElement>('[data-chat-turn]:last-child [data-assistant-reveal]')
        gsap.fromTo(resultParts, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0, duration: 0.34, stagger: 0.07, ease: 'power2.out', clearProps: 'all',
        })
      }
      animatedTurnState.current = state
    })
    return () => window.cancelAnimationFrame(frame)
  }, [reducedMotion, turns])

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    if (panel && !reducedMotion) {
      const reveal = panel.querySelectorAll('[data-copilot-reveal]')
      const timeline = gsap.timeline()
      timeline.fromTo(panel, {
        opacity: 0,
        scale: 0.12,
        x: 135,
        y: 105,
        rotate: 6,
        filter: 'blur(12px)',
        borderRadius: '999px',
        transformOrigin: 'bottom right',
      }, {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        rotate: 0,
        filter: 'blur(0px)',
        borderRadius: '1rem',
        duration: 0.62,
        ease: 'expo.out',
      }).fromTo(reveal, {
        opacity: 0, y: 14, scale: 0.97,
      }, {
        opacity: 1, y: 0, scale: 1, duration: 0.34, stagger: 0.055, ease: 'power2.out',
      }, '-=0.3')
    }

    const timer = window.setTimeout(() => textareaRef.current?.focus(), reducedMotion ? 0 : 480)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [closePanel, open, reducedMotion])

  async function runTurn(turnId: string, visiblePrompt: string, previousTurns: CopilotTurn[]) {
    const query = contextualPrompt(visiblePrompt, previousTurns)
    try {
      const response = user
        ? await apiClient.assistantQuery(query)
        : runAssistant(query, assistantContextFromSnapshot(snapshot, startups, mentors, false))
      setTurns((current) => current.map((turn) =>
        turn.id === turnId ? { ...turn, response, status: 'complete', error: undefined } : turn
      ))
      setRecent(saveAssistantPrompt(visiblePrompt))
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Assistant request failed'
      setTurns((current) => current.map((turn) =>
        turn.id === turnId ? { ...turn, status: 'error', error } : turn
      ))
    } finally {
      window.setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  function submit(value = prompt) {
    const next = value.trim()
    if (next.length < 3 || loading) return
    const turn: CopilotTurn = {
      id: crypto.randomUUID(), prompt: next, status: 'loading', createdAt: new Date().toISOString(),
    }
    const previousTurns = turns
    setTurns((current) => [...current, turn].slice(-8))
    setPrompt('')
    void runTurn(turn.id, next, previousTurns)
  }

  function retry(turn: CopilotTurn) {
    if (loading) return
    const turnIndex = turns.findIndex((item) => item.id === turn.id)
    setTurns((current) => current.map((item) =>
      item.id === turn.id ? { ...item, status: 'loading', error: undefined } : item
    ))
    void runTurn(turn.id, turn.prompt, turns.slice(0, turnIndex))
  }

  function clearConversation() {
    setTurns([])
    clearCopilotConversation()
    setPrompt('')
    window.setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function openPanel() {
    if (closingRef.current) return
    setOpen(true)
  }

  return <>
    <Button
      variant='ghost'
      size='sm'
      className='gap-1.5'
      aria-label={open ? 'Close SSC Copilot' : 'Open SSC Copilot'}
      aria-controls={panelId}
      aria-expanded={open}
      onClick={() => open ? closePanel() : openPanel()}
    >
      <Sparkles className='size-4 text-primary' />
      <span className='hidden lg:inline'>Copilot</span>
    </Button>

    {createPortal(<>
      {open && <aside
        ref={panelRef}
        id={panelId}
        role='dialog'
        aria-modal='false'
        aria-labelledby='ssc-copilot-title'
        className={`fixed inset-x-3 bottom-20 z-50 flex h-[min(700px,calc(100svh-6rem))] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-background/98 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:w-[390px] xl:bottom-5 ${reducedMotion ? '' : 'opacity-0'}`}
      >
        <header data-copilot-reveal className='flex items-center gap-3 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4'>
          <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
            <Bot className='size-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <h2 id='ssc-copilot-title' className='font-bold'>SSC AI Assistant</h2>
            <p className='truncate text-xs text-muted-foreground'>Your platform discovery copilot</p>
          </div>
          <span className='flex items-center gap-1 text-[10px] font-medium text-emerald-600'>
            <span className='size-1.5 rounded-full bg-emerald-500' />Online
          </span>
          {turns.length > 0 && <Button variant='ghost' size='icon' className='size-8' aria-label='Clear conversation' onClick={clearConversation}>
            <Trash2 className='size-4' />
          </Button>}
          <Button variant='ghost' size='icon' className='size-8' aria-label='Close AI assistant' onClick={closePanel}>
            <X className='size-4' />
          </Button>
        </header>

        <div ref={timelineRef} data-copilot-reveal aria-live='polite' className='flex-1 space-y-5 overflow-y-auto overscroll-contain p-4'>
          {turns.length === 0 && <>
            <div className='rounded-2xl rounded-bl-md border bg-muted/25 p-3 text-sm leading-6'>
              <div className='mb-1 flex items-center gap-2 font-semibold'><Bot className='size-4 text-primary' />How can I help?</div>
              <span className='text-muted-foreground'>Describe a teammate, mentor, opportunity, startup, or program you want to find.</span>
            </div>
            <div>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>Quick prompts</p>
              <div className='grid gap-2'>
                {roleQuickPrompts(user).slice(0, 3).map((item) => <button
                  key={item}
                  type='button'
                  className='rounded-xl border p-2.5 text-left text-xs leading-5 transition-colors hover:border-primary/30 hover:bg-primary/5'
                  onClick={() => submit(item)}
                >{item}</button>)}
              </div>
            </div>
            {recent.length > 0 && <div>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>Recent prompts</p>
              <div className='flex flex-wrap gap-1.5'>
                {recent.slice(0, 2).map((item) => <button key={item.id} type='button' className='max-w-full truncate rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-muted/70' onClick={() => submit(item.prompt)}>{item.prompt}</button>)}
              </div>
            </div>}
          </>}

          {turns.map((turn) => <div key={turn.id} data-chat-turn className='space-y-3'>
            <div className='ml-10 flex justify-end'>
              <div className='max-w-[88%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-5 text-primary-foreground shadow-sm'>
                {turn.prompt}
              </div>
            </div>

            <div className='mr-3 flex items-start gap-2'>
              <span className='mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
                <Bot className='size-3.5' />
              </span>
              <div className='min-w-0 flex-1'>
                {turn.status === 'loading' && <div className='inline-flex items-center gap-1 rounded-2xl rounded-bl-md border bg-card px-4 py-3 shadow-sm' aria-label='SSC AI is thinking'>
                  {[0, 1, 2].map((dot) => <span key={dot} className='size-1.5 animate-bounce rounded-full bg-primary' style={{ animationDelay: `${dot * 120}ms` }} />)}
                  <span className='ml-2 text-xs text-muted-foreground'>Finding the best matches…</span>
                </div>}

                {turn.status === 'error' && <div className='rounded-2xl rounded-bl-md border border-destructive/25 bg-destructive/5 p-3 text-sm'>
                  <p className='text-destructive'>{turn.error}</p>
                  <Button size='sm' variant='outline' className='mt-2' onClick={() => retry(turn)}>
                    <RotateCcw className='size-3.5' />Retry
                  </Button>
                </div>}

                {turn.status === 'complete' && turn.response && <div className='space-y-3'>
                  <div data-assistant-reveal className='rounded-2xl rounded-bl-md border bg-card p-3 shadow-sm'>
                    <AssistantCriteriaChips response={turn.response} />
                    <p className='mt-2 text-sm leading-5 text-muted-foreground'>{turn.response.summary}</p>
                  </div>
                  <div data-assistant-reveal><AssistantResults response={turn.response} compact limit={2} /></div>
                  <div data-assistant-reveal><Button variant='outline' size='sm' className='w-full' asChild>
                      <Link to='/assistant' search={{ q: turn.prompt }} onClick={closePanel}>
                        Open full results<ExternalLink className='size-3.5' />
                      </Link>
                    </Button></div>
                </div>}
              </div>
            </div>
          </div>)}
        </div>

        <div data-copilot-reveal className='border-t bg-background p-3'>
          <form onSubmit={(event) => { event.preventDefault(); submit() }} className='space-y-2'>
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  submit()
                }
              }}
              placeholder={turns.length ? 'Ask a follow-up…' : 'Ask SSC AI…'}
              aria-label='Message SSC AI'
              className='min-h-16 resize-none'
            />
            <div className='flex items-center justify-between gap-2'>
              <span className='min-w-0 truncate text-[10px] text-muted-foreground'>
                <ShieldCheck className='mr-1 inline size-3 text-primary' />
                {runtimeMode === 'api' ? 'Raw prompts are not stored on the server' : 'Private browser demo'}
              </span>
              <Button size='sm' disabled={loading || prompt.trim().length < 3}>
                <Send className='size-3.5' />{loading ? 'Thinking…' : 'Send'}
              </Button>
            </div>
          </form>
        </div>
      </aside>}
    </>, document.body)}
  </>
}
