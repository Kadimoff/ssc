import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const navigate = useNavigate()
  useEffect(() => { navigate({ to: mode === 'sign-in' ? '/sign-in' : '/sign-up' }) }, [mode, navigate])
  return null
}
