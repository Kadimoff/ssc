import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { hasHorizontalOverflow } from '@/lib/responsive-audit'

const appShell = readFileSync(new URL('./app-shell.tsx', import.meta.url), 'utf8')
const primitives = readFileSync(new URL('../components/execution-primitives.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
const messages = readFileSync(new URL('../pages/messages/index.tsx', import.meta.url), 'utf8')
const feed = readFileSync(new URL('../pages/feed/index.tsx', import.meta.url), 'utf8')
const personaSwitcher = readFileSync(new URL('../features/execution/persona-switcher.tsx', import.meta.url), 'utf8')

describe('responsive application stability', () => {
  it('links the application logo back to the landing page', () => {
    expect(appShell).toContain("<Link to='/' aria-label='SSC home'")
  })

  it('uses a viewport-safe More drawer with scroll lock-compatible focus restoration', () => {
    expect(appShell).toContain("variant='drawer'")
    expect(appShell).toContain('lastMoreTriggerRef')
    expect(appShell).toContain('requestAnimationFrame(() => lastMoreTriggerRef.current?.focus())')
    expect(appShell).toContain('inert={moreOpen || undefined}')
    expect(primitives).toContain("variant === 'drawer'")
    expect(styles).toContain('translate: none !important')
    expect(styles).toContain('grid-template-rows: auto minmax(0, 1fr) auto')
    expect(styles).toContain('width: 100vw !important')
    expect(styles).toContain('max-width: 100% !important')
    expect(styles).toContain('box-sizing: border-box')
    expect(styles).toContain('overflow-y: auto')
  })

  it('keeps bottom navigation and floating actions on one safe-area token system', () => {
    expect(styles).toContain('--mobile-content-clearance')
    expect(styles).toContain('--floating-action-bottom')
    expect(styles).toContain('.ssc-copilot-launcher')
    expect(styles).toContain("body:has([data-slot='dialog-overlay'][data-state='open'])")
    expect(appShell).toContain("pb-[var(--mobile-content-clearance)]")
  })

  it('implements Inbox list to conversation navigation without squeezing a desktop split pane', () => {
    expect(messages).toContain("export type InboxMobileView = 'list' | 'conversation'")
    expect(messages).toContain("setMobileView('conversation')")
    expect(messages).toContain("setMobileView('list')")
    expect(messages).toContain("aria-label='Back to conversations'")
    expect(messages).toContain('grid-cols-[48px_minmax(0,1fr)_auto]')
    expect(messages).toContain('line-clamp-2 break-words')
    expect(messages).toContain('[overflow-wrap:anywhere]')
  })

  it('keeps the center feed composer-first and moves execution modules to responsive rails', () => {
    const feedPage = feed.slice(feed.indexOf('export function FeedPage'), feed.indexOf('export function ExecutionHome'))
    expect(feedPage.indexOf('<FeedComposer')).toBeLessThan(feedPage.indexOf('<PostCard'))
    expect(feedPage).not.toContain('<ExecutionHome')
    expect(feedPage).not.toContain('<HomeOperations')
    expect(feed).toContain('xl:grid-cols-[240px_minmax(0,1fr)_300px]')
    expect(feed).toContain('function MobileWorkspaceSummary')
    expect(feed).toContain('function PeopleToMeetCard')
  })

  it('keeps both continue-working actions inside equal-width grid columns', () => {
    expect(feed).toContain("className='mt-3 grid w-full grid-cols-2 gap-2'")
    expect(feed.match(/className='box-border w-full min-w-0 whitespace-normal break-words px-2 text-center text-\[11px\] leading-4'/g)).toHaveLength(2)
  })

  it('keeps verification and role actions inside the responsive execution grid', () => {
    expect(feed).toContain("className='grid min-w-0 w-full grid-cols-2 gap-2 sm:w-52'")
    expect(feed).toContain("className='min-w-0 w-full whitespace-normal break-words px-2 text-center text-[11px] leading-4'")
  })

  it('keeps the mobile update composer inside the viewport', () => {
    expect(feed).toContain("className='responsive-update-dialog sm:max-w-2xl'")
    expect(styles).toContain(".responsive-landing-navigation > [class*='overflow-y-auto']")
  })

  it('keeps persona switching buttons stable when the active icon and label change', () => {
    expect(personaSwitcher).toContain("className='min-w-0 gap-2'")
    expect(personaSwitcher).toContain("className={cn('flex min-h-14 w-full min-w-0")
    expect(personaSwitcher).toContain("className='min-w-0 max-w-40 truncate'")
  })

  it('detects only genuine document-level horizontal overflow', () => {
    expect(hasHorizontalOverflow(390, 390)).toBe(false)
    expect(hasHorizontalOverflow(391, 390)).toBe(true)
  })
})
