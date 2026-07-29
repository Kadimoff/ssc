import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FounderStage } from './founder-card.types'

const STAGES: { key: FounderStage; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'validation', label: 'Validation' },
  { key: 'mvp', label: 'MVP' },
  { key: 'revenue', label: 'Revenue' },
]

export function StartupStage({ stage }: { stage: FounderStage }) {
  const currentIndex = STAGES.findIndex((item) => item.key === stage)

  return (
    <div className='founder-stage' aria-label={`Startup stage: ${STAGES[currentIndex]?.label ?? stage}`}>
      <p>Stage</p>
      <ol>
        {STAGES.map((item, index) => {
          const completed = index < currentIndex
          const active = index === currentIndex
          const reached = index <= currentIndex

          return (
            <li
              className={cn(completed && 'is-completed', active && 'is-active', reached && 'is-reached')}
              key={item.key}
              aria-current={active ? 'step' : undefined}
            >
              <span className='founder-stage-marker'>
                <i>{completed && <Check aria-hidden='true' />}</i>
              </span>
              <span className='founder-stage-name'>{item.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
