import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

/* ------------------------------------------------------------------ */
/*  prefers-reduced-motion                                            */
/* ------------------------------------------------------------------ */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (event: MediaQueryListEvent) => setReduced(event.matches)
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])
  return reduced
}

/* ------------------------------------------------------------------ */
/*  Page transition — fade-in on route change                         */
/* ------------------------------------------------------------------ */

export function usePageTransition(ref: React.RefObject<HTMLElement | null>, pathname: string) {
  const reduced = useReducedMotion()
  const prevPath = useRef(pathname)
  useEffect(() => {
    if (pathname === '/') return
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    if (!ref.current || reduced) return
    gsap.from(ref.current, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out', clearProps: 'opacity,y' })
  }, [pathname, ref, reduced])
}

/* ------------------------------------------------------------------ */
/*  Scroll reveal — fade + translate up                               */
/* ------------------------------------------------------------------ */

interface ScrollRevealOptions {
  trigger?: string | Element
  start?: string
  y?: number
  opacity?: number
  duration?: number
  stagger?: number
  targets?: string
  scale?: number
  from?: gsap.TweenVars
  to?: gsap.TweenVars
}

export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  {
    trigger, start = 'top 85%', y = 30, opacity = 0, duration = 0.6, stagger = 0.08,
    targets = '> [data-animate]', scale, from, to,
  }: ScrollRevealOptions = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
      const els = containerRef.current?.querySelectorAll(scoped)
      if (!els?.length) return
      const triggerEl = typeof trigger === 'string' ? containerRef.current?.closest(trigger) : trigger
      const fromVars = from ?? { opacity, y, ...(scale !== undefined && { scale }) }
      const toVars = to ?? { opacity: 1, y: 0, ...(scale !== undefined && { scale: 1 }), duration, stagger, ease: 'power2.out', scrollTrigger: { trigger: triggerEl ?? containerRef.current, start, once: true } }
      gsap.fromTo(els, fromVars, toVars)
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Stagger cards — data load entrance                                */
/* ------------------------------------------------------------------ */

export function useStaggerCards(containerRef: React.RefObject<HTMLElement | null>, deps: unknown[], targets = '> [data-card]') {
  useGSAP(() => {
    if (!containerRef.current) return
    const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
    const items = containerRef.current.querySelectorAll(scoped)
    if (!items.length) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' })
    })
    return () => mm.revert()
  }, { scope: containerRef, dependencies: deps })
}

/* ------------------------------------------------------------------ */
/*  Bubble entrance — new message                                     */
/* ------------------------------------------------------------------ */

export function useBubbleEntrance(containerRef: React.RefObject<HTMLElement | null>, messageCount: number) {
  const prevCount = useRef(messageCount)
  useEffect(() => {
    if (!containerRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isNew = messageCount > prevCount.current
    prevCount.current = messageCount
    if (!isNew || reduced) return
    const container = containerRef.current
    const bubbles = container.querySelectorAll(':scope > div')
    const last = bubbles[bubbles.length - 1]
    if (!(last instanceof HTMLElement)) return
    gsap.fromTo(last, { opacity: 0, y: 15, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' })
    gsap.to(container, { scrollTop: container.scrollHeight, duration: 0.3, ease: 'power2.out' })
  }, [messageCount, containerRef])
}

/* ------------------------------------------------------------------ */
/*  Like button pulse                                                  */
/* ------------------------------------------------------------------ */

export function useLikeAnimation() {
  return useCallback((el: HTMLElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(el, { scale: 1 }, { scale: 1.35, duration: 0.15, ease: 'back.out(2)', yoyo: true, repeat: 1, clearProps: 'scale' })
  }, [])
}

/* ------------------------------------------------------------------ */
/*  Bookmark/save rotate                                               */
/* ------------------------------------------------------------------ */

export function useBookmarkAnimation() {
  return useCallback((el: HTMLElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(el, { rotate: -10 }, { rotate: 0, duration: 0.25, ease: 'elastic.out(1, 0.5)', clearProps: 'rotate' })
  }, [])
}

/* ================================================================== */
/*  NEW — Premium landing animations                                  */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Hero entrance — staggered headline + parallax decorative          */
/* ------------------------------------------------------------------ */

export function useHeroEntrance(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Pre-set all entrance elements to invisible so no flash
      gsap.set([
        '[data-hero-blob]',
        '[data-hero-badge]',
        '[data-hero-line]',
        '[data-hero-subtitle]',
        '[data-hero-metrics] > *',
        '[data-hero-card]',
      ], { opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Floating decorative blobs
      tl.fromTo('[data-hero-blob]', {
        opacity: 0, scale: 0.6,
      }, {
        opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)',
      }, 0)

      // Badge
      tl.fromTo('[data-hero-badge]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'opacity,y' }, 0.2)

      // Headline — each line via wrapping span
      tl.fromTo('[data-hero-line]', { opacity: 0, y: 80, rotationX: -25 }, { opacity: 1, y: 0, rotationX: 0, duration: 0.9, stagger: 0.15, clearProps: 'opacity,y,rotationX' }, 0.3)

      // Subtitle
      tl.fromTo('[data-hero-subtitle]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'opacity,y' }, 0.7)

      // Metrics row
      tl.fromTo('[data-hero-metrics] > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, clearProps: 'opacity,y' }, 1.0)

      // Right side card
      tl.fromTo('[data-hero-card]', { opacity: 0, x: 60, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)', clearProps: 'opacity,x,scale' }, 0.4)
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Counter animation — scroll-triggered number count-up              */
/* ------------------------------------------------------------------ */

export function useCounterAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-counter]',
  { duration = 2, start = 'top 85%' } = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
      const els = containerRef.current?.querySelectorAll(scoped)
      if (!els?.length) return

      els.forEach((el) => {
        const raw = el.textContent?.replace(/[^0-9.]/g, '') || '0'
        const suffix = el.textContent?.replace(/[0-9.,]/g, '') || ''
        const targetNum = parseFloat(raw)
        if (isNaN(targetNum)) return

        el.textContent = '0' + suffix

        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => {
            gsap.to(el, {
              innerText: targetNum,
              duration,
              ease: 'power2.out',
              modifiers: {
                innerText: (value) => {
                  const num = Math.round(parseFloat(value))
                  return num.toLocaleString() + suffix
                },
              },
            })
          },
        })
      })
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Floating decorative elements — gentle bob animation               */
/* ------------------------------------------------------------------ */

export function useFloatingElements(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-float]',
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
      const els = containerRef.current?.querySelectorAll(scoped)
      if (!els?.length) return

      els.forEach((el) => {
        const elHtml = el as HTMLElement
        const dur = parseFloat(elHtml.dataset.floatDuration || '4')
        const dist = parseFloat(elHtml.dataset.floatDistance || '12')

        gsap.to(el, {
          y: dist,
          duration: dur,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Magnetic hover — button follows cursor slightly                   */
/* ------------------------------------------------------------------ */

export function useMagneticHover(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-magnetic]',
) {
  useEffect(() => {
    if (!containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
    const els = Array.from(containerRef.current.querySelectorAll(scoped))
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
    if (!els.length) return

    const onMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power2.out' })
    }
    const onLeave = (e: MouseEvent) => {
      gsap.to(e.currentTarget as HTMLElement, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' })
    }

    els.forEach((el) => {
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => {
      els.forEach((el) => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [containerRef, targets])
}

/* ------------------------------------------------------------------ */
/*  Gradient orb mouse follower — moves with cursor                   */
/* ------------------------------------------------------------------ */

export function useGradientOrb(
  containerRef: React.RefObject<HTMLElement | null>,
  target: string,
) {
  useEffect(() => {
    if (!containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = containerRef.current.querySelector(target) as HTMLElement
    if (!el) return

    const container = containerRef.current

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      gsap.to(el, { x: (x - 50) * 0.5, y: (y - 50) * 0.5, duration: 1.5, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [containerRef, target])
}

/* ------------------------------------------------------------------ */
/*  Smooth reveal on scroll — clip-path / scale variant              */
/* ------------------------------------------------------------------ */

export function useRevealCards(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-reveal]',
  { start = 'top 85%', stagger = 0.1 } = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
      const els = containerRef.current?.querySelectorAll(scoped)
      if (!els?.length) return

      gsap.fromTo(els,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start, once: true },
        },
      )
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Infinite marquee — for logos / wordmarks                          */
/* ------------------------------------------------------------------ */

export function useMarquee(
  containerRef: React.RefObject<HTMLElement | null>,
  target: string,
  { speed = 30, direction = -1 } = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const el = containerRef.current?.querySelector(target) as HTMLElement
      if (!el) return

      const items = el.children
      if (!items.length) return

      const totalWidth = el.scrollWidth / 2
      const duration = totalWidth / speed

      gsap.fromTo(el, { x: 0 }, {
        x: direction * totalWidth,
        duration,
        ease: 'none',
        repeat: -1,
      })
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Text reveal — character-by-character entrance                     */
/* ------------------------------------------------------------------ */

export function useTextReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  target: string,
  { start = 'top 85%', stagger = 0.02, duration = 0.5 } = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const el = containerRef.current?.querySelector(target) as HTMLElement
      if (!el) return

      const text = el.textContent || ''
      el.textContent = ''
      const chars = text.split('').map((char) => {
        const span = document.createElement('span')
        span.textContent = char === ' ' ? ' ' : char
        span.style.display = 'inline-block'
        el.appendChild(span)
        return span
      })

      gsap.fromTo(chars,
        { opacity: 0, y: 20, rotateX: -45 },
        {
          opacity: 1, y: 0, rotateX: 0, duration, stagger,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start, once: true },
        },
      )
    })
    return () => mm.revert()
  }, { scope: containerRef })
}

/* ------------------------------------------------------------------ */
/*  Pillar card hover — tilt on mouse move                            */
/* ------------------------------------------------------------------ */

export function useTiltCards(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-tilt]',
  { maxTilt = 8 } = {},
) {
  useEffect(() => {
    if (!containerRef.current) return
    const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
    const els = Array.from(containerRef.current.querySelectorAll(scoped))
      .filter((el): el is HTMLElement => el instanceof HTMLElement)

    const onMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const tiltX = (y - 0.5) * -maxTilt
      const tiltY = (x - 0.5) * maxTilt
      gsap.to(el, { rotateX: tiltX, rotateY: tiltY, duration: 0.4, ease: 'power2.out' })
    }
    const onLeave = (e: MouseEvent) => {
      gsap.to(e.currentTarget as HTMLElement, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out' })
    }

    els.forEach((el) => {
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => {
      els.forEach((el) => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [containerRef, targets, maxTilt])
}

/* ------------------------------------------------------------------ */
/*  Parallax on scroll                                                */
/* ------------------------------------------------------------------ */

export function useParallax(
  containerRef: React.RefObject<HTMLElement | null>,
  targets = '[data-parallax]',
  { speed = 0.3 } = {},
) {
  useGSAP(() => {
    if (!containerRef.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scoped = targets.trimStart().startsWith('>') ? `:scope ${targets}` : targets
      const els = containerRef.current?.querySelectorAll(scoped)
      if (!els?.length) return

      els.forEach((el) => {
        gsap.to(el, {
          y: () => (1 - speed) * -100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      })
    })
    return () => mm.revert()
  }, { scope: containerRef })
}
