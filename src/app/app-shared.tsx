import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import type { User } from '@/data/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function UserAvatar({ user, className }: { user?: User | null; className?: string }) {
  const name = user?.name || 'Student Startup Community'
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase()
  return <Avatar className={cn('size-10 border border-primary/15', className)}><AvatarFallback className='bg-primary/10 font-semibold text-primary'>{initials}</AvatarFallback></Avatar>
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  return <Button variant='ghost' size='icon' aria-label='Toggle theme' onClick={() => { document.documentElement.classList.toggle('dark'); setDark(!dark) }}>{dark ? <Sun /> : <Moon />}</Button>
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn('app-container py-8 lg:py-10', className)}>{children}</div> }

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className='mb-8 max-w-3xl'><Badge variant='secondary'>{eyebrow}</Badge><h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-4xl'>{title}</h1><p className='mt-3 text-lg text-muted-foreground'>{description}</p></div> }

export function PageLoading() { return <PageContainer><div className='h-40 animate-pulse rounded-xl bg-muted' /></PageContainer> }

export function AuthRequired({ title }: { title: string }) { return <PageContainer><Card className='mx-auto max-w-lg text-center'><CardHeader><CardTitle>{title}</CardTitle><CardDescription>Your conversations and profile are kept private.</CardDescription></CardHeader><CardFooter className='justify-center'><Button asChild><Link to='/sign-in'>Sign in</Link></Button></CardFooter></Card></PageContainer> }

export function ProfileInfo({ label, value }: { label: string; value: string }) { return <div className='rounded-xl bg-muted/50 p-4'><p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p><p className='mt-2 font-medium'>{value || 'Not added'}</p></div> }
