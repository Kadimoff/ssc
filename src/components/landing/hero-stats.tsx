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

const STATS: Stat[] = [
  { image: buildersIcon, value: 'Build', label: 'teams', tone: 'emerald' },
  { image: universitiesIcon, value: 'Verify', label: 'participants', tone: 'gold' },
  { image: mentorsIcon, value: 'Guide', label: 'milestones', tone: 'mint' },
  { image: partnersIcon, value: 'Report', label: 'outcomes', tone: 'amber' },
]

export function HeroStats() {
  return (
    <section className='hero-orbit' aria-label='SSC execution workflow'>
      <div className='hero-network-stage'>
        <svg className='hero-network' viewBox='0 0 560 460' aria-hidden='true'>
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
            <path id='hero-network-route' pathLength='4' d='M280 90 L476 230 L280 370 L84 230 Z' />
          </defs>

          <g className='hero-network-glow' fill='none' stroke='url(#hero-network-gradient)'>
            <use href='#hero-network-route' />
            <path d='M280 90 L280 178 M476 230 L370 230 M280 370 L280 282 M84 230 L190 230' />
            <path d='M280 178 L370 230 L280 282 L190 230 Z' />
            <path d='M280 90 Q385 124 476 230 M476 230 Q385 336 280 370 M280 370 Q175 336 84 230 M84 230 Q175 124 280 90' />
          </g>

          <g className='hero-network-core' fill='none' stroke='url(#hero-network-gradient)'>
            <use href='#hero-network-route' />
            <path d='M280 90 L280 178 M476 230 L370 230 M280 370 L280 282 M84 230 L190 230' />
            <path d='M280 178 L370 230 L280 282 L190 230 Z' />
            <path className='hero-network-dash' d='M280 90 Q385 124 476 230 M476 230 Q385 336 280 370 M280 370 Q175 336 84 230 M84 230 Q175 124 280 90' />
          </g>

          {[[280, 90], [476, 230], [280, 370], [84, 230]].map(([cx, cy]) => (
            <g className='hero-network-node' key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
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
              <div className='hero-orbit-card'>
                <span className='hero-orbit-icon' aria-hidden='true'>
                  <img src={stat.image} alt='' />
                </span>
                <span className='hero-orbit-copy'>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className='sr-only'>Icons move between connected network points. Hover or focus an icon to pause and highlight it.</p>
    </section>
  )
}
