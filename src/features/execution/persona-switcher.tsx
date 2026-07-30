import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, RefreshCw, UsersRound } from 'lucide-react'
import { snapshotKey } from '@/app/app-data'
import { DemoDataBadge, ResponsiveDialog } from '@/components/execution-primitives'
import { Button } from '@/components/ui/button'
import { runtimeMode } from '@/data/client'
import { cn } from '@/lib/utils'
import { personaPresets, useExecutionStore } from './store'

export function PersonaSwitcher({ compact = false }: { compact?: boolean }) {
  const { state, store } = useExecutionStore()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  if (runtimeMode !== 'demo') return null
  const selected = personaPresets.find((item) => item.id === state.selectedPersona) ?? personaPresets[0]

  const choose = async (id: typeof selected.id) => {
    store.selectPersona(id)
    await queryClient.invalidateQueries({ queryKey: snapshotKey })
    setOpen(false)
  }

  return <ResponsiveDialog
    open={open}
    onOpenChange={setOpen}
    title='Preview a demo persona'
    description='Switch the seeded session to see each role’s actual workspace and actions.'
    trigger={<Button variant='outline' size={compact ? 'icon' : 'sm'} className='min-w-0 gap-2' aria-label={`Demo persona: ${selected.label}`}><UsersRound />{!compact && <span className='min-w-0 max-w-40 truncate'>{selected.label}</span>}</Button>}
    footer={<div className='flex w-full items-center justify-between gap-3'><DemoDataBadge label='Demo only' /><span className='min-w-0 text-right text-xs text-muted-foreground'>Selection persists in this browser.</span></div>}
  >
    <div className='grid gap-2'>
      {personaPresets.map((preset) => {
        const active = preset.id === state.selectedPersona
        return <button
          type='button'
          key={preset.id}
          onClick={() => void choose(preset.id)}
          className={cn('flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', active && 'border-primary/35 bg-primary/[0.07]')}
        >
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground', active && 'bg-primary text-primary-foreground')}>{active ? <Check className='size-4' /> : <RefreshCw className='size-4' />}</span>
          <span className='min-w-0 flex-1'><b className='block text-sm'>{preset.label}</b><span className='mt-0.5 block text-xs text-muted-foreground'>{preset.description}</span></span>
        </button>
      })}
    </div>
  </ResponsiveDialog>
}
