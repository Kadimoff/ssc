import { motion } from 'motion/react'
import { Rocket } from 'lucide-react'

/**
 * MotionRocket — a motion-animated rocket (framer-motion / `motion`).
 * Continuous bob + tilt + flickering thrust flame; optional `boost` triggers a
 * scale-punch + spark burst (use when a startup climbs rank). Color-themed.
 */
export function MotionRocket({ color = '#10b981', boost = false, size = 20 }: { color?: string; boost?: boolean; size?: number }) {
  return (
    <div className='relative grid place-items-center' style={{ width: size + 6, height: size + 6 }} aria-hidden='true'>
      {/* thrust flame */}
      <motion.span
        className='pointer-events-none absolute left-1/2 rounded-full'
        style={{
          width: Math.max(3, size * 0.18),
          height: size * 0.55,
          marginLeft: -Math.max(2, size * 0.09),
          bottom: -size * 0.28,
          background: `linear-gradient(to bottom, ${color}, color-mix(in srgb, ${color} 30%, #f5b840) 55%, transparent)`,
          filter: `blur(1px)`,
        }}
        animate={{ scaleY: [0.55, 1, 0.65, 0.9], opacity: [0.55, 1, 0.6, 0.85] }}
        transition={{ duration: 0.38, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* body: bob + tilt */}
      <motion.span
        className='relative block'
        animate={{ y: [0, -2, 0], rotate: [-5, 4, -5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className='block drop-shadow'
          animate={boost ? { scale: [1, 1.4, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : { scale: 1 }}
          transition={boost ? { duration: 0.55, ease: 'backOut' } : { duration: 0 }}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${color} 60%, transparent))` }}
        >
          <Rocket style={{ color, width: size, height: size }} strokeWidth={2.2} />
        </motion.span>
      </motion.span>

      {/* boost spark burst */}
      {boost && (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i / 5) * Math.PI * 2
            return (
              <motion.span
                key={i}
                className='pointer-events-none absolute left-1/2 top-1/2 size-1 rounded-full'
                style={{ background: color, marginLeft: -2, marginTop: -2 }}
                initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                animate={{ x: Math.cos(angle) * (size * 0.9), y: Math.sin(angle) * (size * 0.9), opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
