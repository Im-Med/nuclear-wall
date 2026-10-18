import { useId } from 'react'
import { cn } from '@/lib/utils'

type ShieldLogoProps = {
  className?: string
  title?: string
}

const OUTER_SHIELD = 'M32 3 L55 10.5 V29 C55 44.5 45.5 55 32 61 C18.5 55 9 44.5 9 29 V10.5 Z'
const INNER_SHIELD =
  'M32 8.2 L50.2 14.2 V29.2 C50.2 41.6 42.6 50.4 32 55.6 C21.4 50.4 13.8 41.6 13.8 29.2 V14.2 Z'

const TREFOIL_BLADES = [
  'M34.25 29.1 L38 22.61 A12 12 0 0 1 44 33 L36.5 33 A4.5 4.5 0 0 0 34.25 29.1 Z',
  'M34.25 36.9 L38 43.39 A12 12 0 0 1 26 43.39 L29.75 36.9 A4.5 4.5 0 0 0 34.25 36.9 Z',
  'M27.5 33 L20 33 A12 12 0 0 1 26 22.61 L29.75 29.1 A4.5 4.5 0 0 0 27.5 33 Z',
]

export function ShieldLogo({ className, title }: ShieldLogoProps) {
  const id = useId()
  const bodyGradient = `${id}-body`
  const rimGradient = `${id}-rim`
  const emblemGradient = `${id}-emblem`
  const radialGradient = `${id}-radial`
  const glowFilter = `${id}-glow`
  const emblemGlow = `${id}-emblem-glow`

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('size-full', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={rimGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={bodyGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1470" />
          <stop offset="100%" stopColor="#12081f" />
        </linearGradient>
        <linearGradient id={emblemGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <radialGradient id={radialGradient} cx="50%" cy="52%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilter} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur" />
          <feFlood floodColor="#a855f7" floodOpacity="0.55" />
          <feComposite in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={emblemGlow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${glowFilter})`}>
        <path d={OUTER_SHIELD} fill={`url(#${rimGradient})`} />
      </g>
      <path d={INNER_SHIELD} fill={`url(#${bodyGradient})`} />
      <path d={INNER_SHIELD} fill={`url(#${radialGradient})`} />
      <path
        d={INNER_SHIELD}
        fill="none"
        stroke={`url(#${rimGradient})`}
        strokeOpacity="0.55"
        strokeWidth="0.7"
      />
      <path d="M32 8.2 V55.6" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="0.8" />
      <path
        d="M14.6 16 L32 10.2 L49.4 16 V24 C42 21 37 19.6 32 19.6 C27 19.6 22 21 14.6 24 Z"
        fill="#ffffff"
        fillOpacity="0.1"
      />
      <path
        d="M11 12 L31 5.2"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      <circle cx="32" cy="33" r="14.5" fill="none" stroke={`url(#${emblemGradient})`} strokeOpacity="0.35" strokeWidth="0.8" />
      <circle cx="32" cy="33" r="14.5" fill="none" stroke="#67e8f9" strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="1.2 3.4" />

      <g fill={`url(#${emblemGradient})`} filter={`url(#${emblemGlow})`}>
        {TREFOIL_BLADES.map((d) => (
          <path key={d} d={d} />
        ))}
        <circle cx="32" cy="33" r="2.6" />
      </g>
      <circle cx="32" cy="33" r="1.1" fill="#12081f" />
    </svg>
  )
}
