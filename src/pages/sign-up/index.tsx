import { useState, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Eye, EyeOff, Rocket, Sparkles, UserPlus } from 'lucide-react'
import { apiClient } from '@/data/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const snapshotKey = ['snapshot'] as const

export function SignUpPage() {
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
      tl.to('[data-auth-el]', { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 })
    })
    return () => mm.revert()
  }, { scope: containerRef })

  return (
    <div className='relative isolate grid min-h-svh place-items-center overflow-hidden p-5'>
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-48 -right-48 size-[500px] rounded-full bg-gradient-to-br from-accent/10 via-accent/5 to-transparent blur-[120px]' />
        <div className='absolute -bottom-48 -left-48 size-[400px] rounded-full bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent blur-[120px]' />
      </div>
      <div ref={containerRef} className='w-full max-w-md'>
        <Card>
          <CardHeader className='text-center'>
            <Link to='/' className='mx-auto mb-6 flex w-fit items-center gap-2 font-bold' data-auth-el>
              <span className='grid size-9 place-items-center rounded-xl bg-primary text-xs text-primary-foreground'>SSC</span>
              Student Startup Community
            </Link>
            <CardTitle data-auth-el className='text-2xl'>Create your profile</CardTitle>
            <CardDescription data-auth-el>Join a focused network for ambitious builders</CardDescription>
          </CardHeader>
          <CardContent>
            <form className='grid gap-5' onSubmit={async (e) => {
              e.preventDefault(); setLoading(true); setError('')
              const form = new FormData(e.currentTarget)
              try {
                await apiClient.register({
                  username: String(form.get('username')),
                  password: String(form.get('password')),
                  name: String(form.get('name')),
                  email: String(form.get('email')),
                  title: String(form.get('title')),
                })
                await queryClient.invalidateQueries({ queryKey: snapshotKey })
                navigate({ to: '/feed' })
              } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue') }
              finally { setLoading(false) }
            }}>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='su-name'>Full name</Label>
                <Input id='su-name' name='name' required placeholder='Aylin Mammadova' />
              </div>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='su-username'>Username</Label>
                <Input id='su-username' name='username' required placeholder='aylinm' />
              </div>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='su-email'>Email</Label>
                <Input id='su-email' name='email' type='email' required placeholder='aylin@example.com' />
              </div>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='su-title'>Professional title</Label>
                <Input id='su-title' name='title' required placeholder='Product Strategist' />
              </div>
              <div data-auth-el className='grid gap-2'>
                <Label htmlFor='su-password'>Password</Label>
                <div className='relative'>
                  <Input id='su-password' name='password' type={showPw ? 'text' : 'password'} required minLength={6} />
                  <Button type='button' variant='ghost' size='icon' className='absolute right-0 top-0' onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              {error && <p data-auth-el className='text-sm text-destructive'>{error}</p>}
              <Button data-auth-el disabled={loading} className='gap-2'>
                {loading ? 'Creating account…' : <><UserPlus size={16} /> Create account</>}
              </Button>
            </form>
            <div data-auth-el className='relative my-6'>
              <div className='absolute inset-0 flex items-center'><span className='w-full border-t' /></div>
              <div className='relative flex justify-center text-xs uppercase'><span className='bg-card px-2 text-muted-foreground'>or continue with</span></div>
            </div>
            <div data-auth-el className='grid grid-cols-2 gap-3'>
              <Button variant='outline' className='gap-2' onClick={() => setError('Sign up via Google coming soon. Use the form above.')}><Rocket size={14} /> Google</Button>
              <Button variant='outline' className='gap-2' onClick={() => setError('Sign up via GitHub coming soon. Use the form above.')}><Sparkles size={14} /> GitHub</Button>
            </div>
          </CardContent>
          <CardFooter className='justify-center'>
            <p data-auth-el className='text-sm text-muted-foreground'>Already a member? <Link className='font-medium text-primary hover:underline' to='/sign-in'>Sign in →</Link></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
