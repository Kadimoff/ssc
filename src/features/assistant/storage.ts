import type { AssistantResponse } from './types'

export const ASSISTANT_HISTORY_KEY = 'ssc.assistantHistory.v1'
export const COPILOT_CONVERSATION_KEY = 'ssc.copilotConversation.v1'

export interface AssistantHistoryEntry {
  id: string
  prompt: string
  createdAt: string
}

export function readAssistantHistory(): AssistantHistoryEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(ASSISTANT_HISTORY_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter((item): item is AssistantHistoryEntry => Boolean(item && typeof item.id === 'string' && typeof item.prompt === 'string' && typeof item.createdAt === 'string')).slice(0, 8)
  } catch {
    return []
  }
}

export function saveAssistantPrompt(prompt: string) {
  const entry: AssistantHistoryEntry = { id: crypto.randomUUID(), prompt: prompt.trim(), createdAt: new Date().toISOString() }
  const next = [entry, ...readAssistantHistory().filter((item) => item.prompt !== entry.prompt)].slice(0, 8)
  localStorage.setItem(ASSISTANT_HISTORY_KEY, JSON.stringify(next))
  return next
}

export function clearAssistantHistory() {
  localStorage.removeItem(ASSISTANT_HISTORY_KEY)
}

export interface CopilotTurn {
  id: string
  prompt: string
  response?: AssistantResponse
  status: 'loading' | 'complete' | 'error'
  error?: string
  createdAt: string
}

export function readCopilotConversation(): CopilotTurn[] {
  try {
    const value = JSON.parse(localStorage.getItem(COPILOT_CONVERSATION_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter((item): item is CopilotTurn =>
      Boolean(
        item &&
        typeof item.id === 'string' &&
        typeof item.prompt === 'string' &&
        typeof item.createdAt === 'string' &&
        (item.status === 'complete' || item.status === 'error'),
      )
    ).slice(-8)
  } catch {
    return []
  }
}

export function saveCopilotConversation(turns: CopilotTurn[]) {
  const stable = turns.filter((turn) => turn.status !== 'loading').slice(-8)
  localStorage.setItem(COPILOT_CONVERSATION_KEY, JSON.stringify(stable))
}

export function clearCopilotConversation() {
  localStorage.removeItem(COPILOT_CONVERSATION_KEY)
}
