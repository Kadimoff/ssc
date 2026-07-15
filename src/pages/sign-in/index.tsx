import { useState, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Eye, EyeOff, LogIn, Rocket, Sparkles } from 'lucide-react'
import { apiClient } from '@/data/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const snapshotKey = ['snapshot'] as const

export function SignInPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('[data-auth-el]', { opacity: 0, y: 20 })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('[data-auth-el]', { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 })
    })
    return () => mm.revert()
  }, { scope: containerRef })

  return (
    <div className='relative isolate grid min-h-svh place-items-center overflow-hidden p-5'>
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-48 -right-48 size-[500px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-[120px]' />
        <div className='absolute -bottom-48 -left-48 size-[400px] rounded-full bg-gradient-to-tr from-accent/10 via-accent/5 to-transparent blur-[120px]' />
      </div>
      <div ref={containerRef} className='w-full max-w-md'>
        <Card>
          <CardHeader className='text-center'>
            <Link to='/' className='mx-auto mb-6 flex w-fit items-center gap-2 font-bold' data-auth-el>
              <span className='grid size-9 place-items-center rounded-xl bg-primary text-xs text-primary-foreground'>SSC</span>
              Student Startup Community
            </Link>
            <CardTitle data-auth-el className='text-2xl'>Welcome back</CardTitle>
            <CardDescription data-auth-el>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form className='grid gap-5' onSubmit={async (e) => {
              e.preventDefault(); setLoading(true); setError('')
              const form = new FormData(e.currentTarget)
              try {
                await apiClient.login({ username: String(form.get('username')), password: String(form.get('password')) })
                await queryClient.invalidateQueries({ queryKey: snapshotKey })
                navigate({ to: '/feed' })
              } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue') }
              finally { setLoading(false) }
            }}>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='si-username'>Username</Label>
                <Input id='si-username' name='username' required defaultValue='demo' autoFocus />
              </div>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='si-password'>Password</Label>
                <div className='relative'>
                  <Input id='si-password' name='password' type={showPw ? 'text' : 'password'} required defaultValue='demo123' />
                  <Button type='button' variant='ghost' size='icon' className='absolute right-0 top-0' onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              {error && <p data-auth-el className='text-sm text-destructive'>{error}</p>}
              <Button data-auth-el disabled={loading} className='gap-2'>
                {loading ? 'Signing in…' : <><LogIn size={16} /> Sign in</>}
              </Button>
            </form>
            <div data-auth-el className='relative my-6'>
              <div className='absolute inset-0 flex items-center'><span className='w-full border-t' /></div>
              <div className='relative flex justify-center text-xs uppercase'><span className='bg-card px-2 text-muted-foreground'>or continue with</span></div>
            </div>
            <div data-auth-el className='grid grid-cols-2 gap-3'>
              <Button variant='outline' className='gap-2' onClick={() => setError('Demo mode — use the form above')}><Rocket size={14} /> Google</Button>
              <Button variant='outline' className='gap-2' onClick={() => setError('Demo mode — use the form above')}><Sparkles size={14} /> GitHub</Button>
            </div>
          </CardContent>
          <CardFooter className='justify-center'>
            <p data-auth-el className='text-sm text-muted-foreground'>New here? <Link className='font-medium text-primary hover:underline' to='/sign-up'>Create an account →</Link></p>
          </CardFooter>
        </Card>
        <p data-auth-el className='mt-4 text-center text-xs text-muted-foreground'>Demo: <code className='rounded bg-muted px-1 py-0.5'>demo</code> / <code className='rounded bg-muted px-1 py-0.5'>demo123</code></p>
      </div>
    </div>
  )
}
