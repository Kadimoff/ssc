import { useId, useState } from 'react'
import { Building2, CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, ResponsiveDialog } from '@/components/execution-primitives'
import { runtimeMode } from '@/data/client'
import { useExecutionStore } from '@/features/execution/store'
import { cn } from '@/lib/utils'

type PilotForm = {
  organization: string
  role: string
  email: string
  useCase: string
  notes: string
}

const initialForm: PilotForm = {
  organization: '',
  role: '',
  email: '',
  useCase: 'University entrepreneurship pilot',
  notes: '',
}

export function PilotInquiryDialog({ label = 'Request a pilot', className }: { label?: string; className?: string }) {
  const { store } = useExecutionStore()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof PilotForm, string>>>({})
  const [saved, setSaved] = useState(false)

  const update = (key: keyof PilotForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = () => {
    const nextErrors: typeof errors = {}
    if (!form.organization.trim()) nextErrors.organization = 'Enter the organization or program name.'
    if (!form.role.trim()) nextErrors.role = 'Enter your role in the organization.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid work email.'
    if (!form.useCase.trim()) nextErrors.useCase = 'Select a pilot use case.'
    if (form.notes.length > 800) nextErrors.notes = 'Keep notes at or below 800 characters.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || runtimeMode !== 'demo') return

    store.savePilotInquiry({
      organization: form.organization.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      useCase: form.useCase,
      notes: form.notes.trim(),
    })
    setSaved(true)
    toast.success('Demo submission saved locally')
  }

  const close = () => {
    setOpen(false)
    window.setTimeout(() => {
      setSaved(false)
      setForm(initialForm)
      setErrors({})
    }, 200)
  }

  return <ResponsiveDialog
    open={open}
    onOpenChange={(next) => next ? setOpen(true) : close()}
    title={saved ? 'Pilot inquiry saved' : 'Explore an SSC pilot'}
    description={saved ? 'This demo record is stored in this browser only.' : 'Share enough context to prepare an institutional pilot conversation.'}
    trigger={<Button className={cn('min-h-11', className)} onClick={() => setOpen(true)}><Building2 />{label}</Button>}
    className='sm:max-w-2xl'
    footer={saved
      ? <Button className='w-full sm:w-auto' onClick={close}>Done</Button>
      : <div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' onClick={close}>Cancel</Button>
          <Button onClick={submit} disabled={runtimeMode !== 'demo'}><Send />Save demo inquiry</Button>
        </div>}
  >
    {saved ? <div className='py-8 text-center'>
      <span className='mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600'><CheckCircle2 /></span>
      <h3 className='mt-5 text-lg font-semibold'>Demo submission saved locally</h3>
      <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground'>Nothing was transmitted to SSC or another organization. Refreshing this demo keeps the inquiry in this browser.</p>
    </div> : <div className='space-y-1'>
      <div className='mb-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-sm leading-6 text-amber-800 dark:text-amber-200'>
        This is a demonstration form. In demo mode, submission is saved locally and is not sent.
      </div>
      {runtimeMode !== 'demo' && <div role='status' className='mb-5 rounded-xl border border-border bg-muted/60 p-3 text-sm text-muted-foreground'>No pilot-contact endpoint is configured in API mode, so this form cannot transmit a request.</div>}
      <div className='grid gap-x-4 sm:grid-cols-2'>
        <FormField label='Organization or program' htmlFor={`${id}-organization`} required error={errors.organization}>
          <Input id={`${id}-organization`} value={form.organization} onChange={(event) => update('organization', event.target.value)} aria-invalid={Boolean(errors.organization)} autoComplete='organization' placeholder='University innovation office' />
        </FormField>
        <FormField label='Your role' htmlFor={`${id}-role`} required error={errors.role}>
          <Input id={`${id}-role`} value={form.role} onChange={(event) => update('role', event.target.value)} aria-invalid={Boolean(errors.role)} autoComplete='organization-title' placeholder='Program director' />
        </FormField>
      </div>
      <FormField label='Work email' htmlFor={`${id}-email`} required helper='Used only in this locally stored demo record.' error={errors.email}>
        <Input id={`${id}-email`} type='email' value={form.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} autoComplete='email' placeholder='name@organization.edu' />
      </FormField>
      <FormField label='Primary use case' htmlFor={`${id}-use-case`} required error={errors.useCase}>
        <select id={`${id}-use-case`} className='h-11 w-full rounded-lg border border-input bg-background/55 px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50' value={form.useCase} onChange={(event) => update('useCase', event.target.value)}>
          <option>University entrepreneurship pilot</option>
          <option>Accelerator or cohort operations</option>
          <option>Multi-campus or consortium setup</option>
          <option>Corporate or ecosystem challenge</option>
          <option>Mentor and evidence operations</option>
        </select>
      </FormField>
      <FormField label='Context and goals' htmlFor={`${id}-notes`} helper='Do not include confidential student or startup data.' error={errors.notes} count={{ current: form.notes.length, max: 800 }}>
        <Textarea id={`${id}-notes`} value={form.notes} onChange={(event) => update('notes', event.target.value)} maxLength={820} aria-invalid={Boolean(errors.notes)} placeholder='Describe the program, stakeholders and outcomes you want to validate.' />
      </FormField>
    </div>}
  </ResponsiveDialog>
}
