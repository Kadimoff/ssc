import { Inbox, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
  variant = 'dialog',
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  variant?: 'dialog' | 'drawer'
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className={cn('responsive-dialog max-h-[92svh] gap-0 overflow-hidden p-0 sm:max-w-xl', variant === 'drawer' && 'responsive-navigation-drawer left-0 top-0 translate-x-0 translate-y-0', className)}>
      <DialogHeader className='border-b px-5 py-5 text-left'>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <div className='min-h-0 overflow-y-auto px-5 py-5'>{children}</div>
      {footer && <DialogFooter className='sticky bottom-0 border-t bg-background/95 px-5 py-4 backdrop-blur'>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
}

export const MobileDetailsSheet = ResponsiveDialog

export function MobileFilterSheet({ children, count }: { children: React.ReactNode; count?: number }) {
  return <ResponsiveDialog
    title='Filter results'
    description='Narrow the current workspace view.'
    trigger={<Button variant='outline' className='md:hidden'><SlidersHorizontal />Filters{count ? ` (${count})` : ''}</Button>}
    footer={<Button className='w-full'>Show results</Button>}
  >{children}</ResponsiveDialog>
}

export function ResponsiveDataList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('responsive-data-list space-y-3', className)}>{children}</div>
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string
  description: string
  action?: React.ReactNode
  icon?: LucideIcon
}) {
  return <div className='rounded-2xl border border-dashed px-5 py-12 text-center'>
    <span className='mx-auto grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground'><Icon className='size-5' /></span>
    <h3 className='mt-4 font-semibold'>{title}</h3>
    <p className='mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground'>{description}</p>
    {action && <div className='mt-5'>{action}</div>}
  </div>
}

const statusTone: Record<string, string> = {
  verified: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  approved: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  complete: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  in_progress: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  needs_changes: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400',
  rejected: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  blocked: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  draft: 'border-border bg-muted text-muted-foreground',
  planned: 'border-border bg-muted text-muted-foreground',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge variant='outline' className={cn('capitalize', statusTone[status] ?? 'bg-muted text-muted-foreground', className)}>{status.replace(/_/g, ' ')}</Badge>
}

export function DemoDataBadge({ label = 'Sample data' }: { label?: string }) {
  return <Badge variant='outline' className='border-amber-500/25 bg-amber-500/5 text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-300'>{label}</Badge>
}

export function FormField({
  label,
  htmlFor,
  required,
  helper,
  error,
  count,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  helper?: string
  error?: string
  count?: { current: number; max: number }
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('space-y-2', className)}>
    <div className='flex items-end justify-between gap-3'>
      <label htmlFor={htmlFor} className='text-sm font-semibold'>
        {label} <span className='font-normal text-muted-foreground'>{required ? '(required)' : '(optional)'}</span>
      </label>
      {count && <span className={cn('text-xs text-muted-foreground', count.current > count.max && 'text-destructive')} aria-live='polite'>{count.current}/{count.max}</span>}
    </div>
    {children}
    <div className='min-h-5 text-xs leading-5'>
      {error ? <p role='alert' className='text-destructive'>{error}</p> : helper ? <p className='text-muted-foreground'>{helper}</p> : null}
    </div>
  </div>
}
