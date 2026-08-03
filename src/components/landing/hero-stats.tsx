import { useRef, useState, type PointerEvent } from 'react'
import gsap from 'gsap'
import buildersIcon from '../../../components/orbit-builders.webp'
import universitiesIcon from '../../../components/orbit-universities.webp'
import mentorsIcon from '../../../components/orbit-mentors.webp'
import partnersIcon from '../../../components/orbit-partners.webp'
import './hero-stats.css'

type Stat = {
  image: string
  value: string
  label: string
  tone: 'emerald' | 'gold' | 'mint' | 'amber'
}

type OrbitOffset = { x: number; y: number }

const BASE_POINTS = [
  { x: 280, y: 90 },
  { x: 476, y: 230 },
  { x: 280, y: 370 },
  { x: 84, y: 230 },
] as const

const ZERO_OFFSETS: OrbitOffset[] = BASE_POINTS.map(() => ({ x: 0, y: 0 }))

const STATS: Stat[] = [
  { image: buildersIcon, value: 'Build', label: 'teams', tone: 'emerald' },
  { image: universitiesIcon, value: 'Verify', label: 'participants', tone: 'gold' },
  { image: mentorsIcon, value: 'Guide with', label: 'mentors', tone: 'mint' },
  { image: partnersIcon, value: 'Connect investors', label: 'Report outcomes', tone: 'amber' },
]

export function HeroStats() {
  const [dragging, setDragging] = useState(false)
  const [offsets, setOffsets] = useState<OrbitOffset[]>(ZERO_OFFSETS)
  const offsetsRef = useRef<OrbitOffset[]>(ZERO_OFFSETS)
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    index: number
    startX: number
    startY: number
    startSvgX: number
    startSvgY: number
    startDomX: number
    startDomY: number
    startOffset: OrbitOffset
    target: HTMLDivElement
  } | null>(null)
  const frameDragRef = useRef<{ pointerId: number; startX: number; startY: number; startDomX: number; startDomY: number } | null>(null)
  const pointReturnTweens = useRef<Array<ReturnType<typeof gsap.to> | undefined>>([])
  const frameReturnTween = useRef<ReturnType<typeof gsap.to> | null>(null)

  const points = BASE_POINTS.map((point, index) => ({ x: point.x + offsets[index].x, y: point.y + offsets[index].y }))
  const routePath = `M${points[0].x} ${points[0].y} L${points[1].x} ${points[1].y} L${points[2].x} ${points[2].y} L${points[3].x} ${points[3].y} Z`
  const spokePath = `M${points[0].x} ${points[0].y} L280 178 M${points[1].x} ${points[1].y} L370 230 M${points[2].x} ${points[2].y} L280 282 M${points[3].x} ${points[3].y} L190 230`
  const curvePath = `M${points[0].x} ${points[0].y} Q385 124 ${points[1].x} ${points[1].y} M${points[1].x} ${points[1].y} Q385 336 ${points[2].x} ${points[2].y} M${points[2].x} ${points[2].y} Q175 336 ${points[3].x} ${points[3].y} M${points[3].x} ${points[3].y} Q175 124 ${points[0].x} ${points[0].y}`

  const setPointOffset = (index: number, offset: OrbitOffset) => {
    const next = offsetsRef.current.map((current, currentIndex) => currentIndex === index ? offset : current)
    offsetsRef.current = next
    setOffsets(next)
  }

  const screenToSvg = (x: number, y: number) => {
    const matrix = svgRef.current?.getScreenCTM()
    if (!matrix) return { x, y }
    const point = new DOMPoint(x, y).matrixTransform(matrix.inverse())
    return { x: point.x, y: point.y }
  }

  const handleDragStart = (event: PointerEvent<HTMLDivElement>, index: number) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    gsap.killTweensOf(event.currentTarget)
    pointReturnTweens.current[index]?.kill()
    const startSvg = screenToSvg(event.clientX, event.clientY)
    dragRef.current = {
      pointerId: event.pointerId,
      index,
      startX: event.clientX,
      startY: event.clientY,
      startSvgX: startSvg.x,
      startSvgY: startSvg.y,
      startDomX: Number(gsap.getProperty(event.currentTarget, 'x')) || 0,
      startDomY: Number(gsap.getProperty(event.currentTarget, 'y')) || 0,
      startOffset: offsetsRef.current[index],
      target: event.currentTarget,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const handleDragMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const rubber = (distance: number) => Math.sign(distance) * (1 - Math.exp(-Math.abs(distance) / 150)) * 150
    const x = drag.startDomX + rubber(event.clientX - drag.startX)
    const y = drag.startDomY + rubber(event.clientY - drag.startY)
    const svgPoint = screenToSvg(drag.startX + x - drag.startDomX, drag.startY + y - drag.startDomY)
    setPointOffset(drag.index, {
      x: drag.startOffset.x + svgPoint.x - drag.startSvgX,
      y: drag.startOffset.y + svgPoint.y - drag.startSvgY,
    })
    gsap.set(drag.target, { x, y, rotation: Math.max(-8, Math.min(8, x / 18)), scale: 1.06 })
  }

  const handleDragEnd = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.target.hasPointerCapture(event.pointerId)) drag.target.releasePointerCapture(event.pointerId)
    dragRef.current = null
    const offsetProxy = { ...offsetsRef.current[drag.index] }
    pointReturnTweens.current[drag.index] = gsap.to(offsetProxy, {
      x: 0,
      y: 0,
      duration: .9,
      ease: 'elastic.out(1, .34)',
      onUpdate: () => setPointOffset(drag.index, { x: offsetProxy.x, y: offsetProxy.y }),
      onComplete: () => setPointOffset(drag.index, { x: 0, y: 0 }),
    })
    gsap.to(drag.target, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: .9,
      ease: 'elastic.out(1, .34)',
      clearProps: 'transform',
      onComplete: () => setDragging(false),
    })
  }

  const handleFrameDragStart = (event: PointerEvent<SVGPathElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const frame = frameRef.current
    if (!frame) return
    frameReturnTween.current?.kill()
    gsap.killTweensOf(frame)
    frameDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startDomX: Number(gsap.getProperty(frame, 'x')) || 0,
      startDomY: Number(gsap.getProperty(frame, 'y')) || 0,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const handleFrameDragMove = (event: PointerEvent<SVGPathElement>) => {
    const drag = frameDragRef.current
    const frame = frameRef.current
    if (!drag || !frame || drag.pointerId !== event.pointerId) return
    const rubber = (distance: number) => Math.sign(distance) * (1 - Math.exp(-Math.abs(distance) / 190)) * 190
    gsap.set(frame, {
      x: drag.startDomX + rubber(event.clientX - drag.startX),
      y: drag.startDomY + rubber(event.clientY - drag.startY),
      scale: 1.015,
    })
  }

  const handleFrameDragEnd = (event: PointerEvent<SVGPathElement>) => {
    const drag = frameDragRef.current
    const frame = frameRef.current
    if (!drag || !frame || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    frameDragRef.current = null
    frameReturnTween.current = gsap.to(frame, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'elastic.out(1, .32)',
      clearProps: 'transform',
      onComplete: () => setDragging(false),
    })
  }

  return (
    <section className={`hero-orbit${dragging ? ' hero-orbit-dragging' : ''}`} aria-label='SSC execution workflow'>
      <div ref={frameRef} className='hero-network-drag-frame'>
        <div className='hero-network-stage'>
        <svg ref={svgRef} className='hero-network' viewBox='0 0 560 460' aria-hidden='true'>
          <defs>
            <linearGradient id='hero-network-gradient' x1='84' y1='90' x2='476' y2='370' gradientUnits='userSpaceOnUse'>
              <stop stopColor='#2dd4bf' />
              <stop offset='.5' stopColor='#34d399' />
              <stop offset='1' stopColor='#fbbf24' />
            </linearGradient>
            <radialGradient id='hero-network-node'>
              <stop stopColor='#fff' />
              <stop offset='.35' stopColor='#6ee7b7' />
              <stop offset='1' stopColor='#10b981' stopOpacity='0' />
            </radialGradient>
            <filter id='hero-network-glow' x='-30%' y='-30%' width='160%' height='160%'>
              <feGaussianBlur stdDeviation='5' result='blur' />
              <feMerge>
                <feMergeNode in='blur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
            <path id='hero-network-route' pathLength='4' d={routePath} />
          </defs>

          <g className='hero-network-glow' fill='none' stroke='url(#hero-network-gradient)'>
            <use href='#hero-network-route' />
            <path d={spokePath} />
            <path d='M280 178 L370 230 L280 282 L190 230 Z' />
            <path d={curvePath} />
          </g>

          <g className='hero-network-core' fill='none' stroke='url(#hero-network-gradient)'>
            <use href='#hero-network-route' />
            <path d={spokePath} />
            <path d='M280 178 L370 230 L280 282 L190 230 Z' />
            <path className='hero-network-dash' d={curvePath} />
          </g>

          <path
            className='hero-network-hit-area'
            d={`${routePath} ${spokePath} M280 178 L370 230 L280 282 L190 230 Z`}
            fill='none'
            onPointerDown={handleFrameDragStart}
            onPointerMove={handleFrameDragMove}
            onPointerUp={handleFrameDragEnd}
            onPointerCancel={handleFrameDragEnd}
          />

          {points.map(({ x, y }, index) => (
            <g className='hero-network-node' key={index} transform={`translate(${x} ${y})`}>
              <circle r='21' fill='url(#hero-network-node)' />
              <circle r='4' fill='#a7f3d0' />
            </g>
          ))}

          {[0, -3, -6, -9].map((begin) => (
            <circle className='hero-network-pulse' r='4' fill='#ecfdf5' filter='url(#hero-network-glow)' key={begin}>
              <animateMotion dur='12s' begin={`${begin}s`} repeatCount='indefinite'>
                <mpath href='#hero-network-route' />
              </animateMotion>
            </circle>
          ))}
        </svg>

        {STATS.map((stat, index) => (
          <article
            className={`hero-orbit-item hero-orbit-item-${stat.tone}`}
            style={{ animationDelay: `${index * -6}s` }}
            key={stat.label}
            tabIndex={0}
            aria-label={`${stat.value} ${stat.label}`}
          >
            <div className='hero-orbit-upright'>
              <div
                className='hero-orbit-drag'
                onPointerDown={(event) => handleDragStart(event, index)}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
              >
                <div className='hero-orbit-card'>
                  <span className='hero-orbit-icon' aria-hidden='true'>
                    <img src={stat.image} alt='' draggable={false} />
                  </span>
                  <span className='hero-orbit-copy'>
                    <strong>{stat.value}</strong>
                    <small>{stat.label}</small>
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
        </div>
      </div>

      <p className='sr-only'>Drag an icon to stretch its connected lines, or drag the network frame to move the whole ecosystem. Everything springs back into place.</p>
    </section>
  )
}
