import { useId } from 'react'
import { cn } from '@/lib/utils'

type ShieldLogoProps = {
  className?: string
  title?: string
}

const OUTER_SHIELD = 'M32 2 L56 10 V29 C56 45 46 56 32 62.5 C18 56 8 45 8 29 V10 Z'
const MID_SHIELD = 'M32 4.6 L53.6 11.8 V29 C53.6 43.6 44.6 53.8 32 59.8 C19.4 53.8 10.4 43.6 10.4 29 V11.8 Z'
const INNER_SHIELD =
  'M32 8.2 L50.2 14.2 V29.2 C50.2 41.6 42.6 50.4 32 55.6 C21.4 50.4 13.8 41.6 13.8 29.2 V14.2 Z'
const LEFT_FACET = 'M32 8.2 L13.8 14.2 V29.2 C13.8 41.6 21.4 50.4 32 55.6 Z'
const RIGHT_FACET = 'M32 8.2 L50.2 14.2 V29.2 C50.2 41.6 42.6 50.4 32 55.6 Z'

const TREFOIL_BLADES = [
  'M34.25 29.1 L38 22.61 A12 12 0 0 1 44 33 L36.5 33 A4.5 4.5 0 0 0 34.25 29.1 Z',
  'M34.25 36.9 L38 43.39 A12 12 0 0 1 26 43.39 L29.75 36.9 A4.5 4.5 0 0 0 34.25 36.9 Z',
  'M27.5 33 L20 33 A12 12 0 0 1 26 22.61 L29.75 29.1 A4.5 4.5 0 0 0 27.5 33 Z',
]

const TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * 360) / 24
  return { angle, major: i % 6 === 0 }
})

export function ShieldLogo({ className, title }: ShieldLogoProps) {
  const id = useId()
  const rim = `${id}-rim`
  const rimDark = `${id}-rim-dark`
  const body = `${id}-body`
  const bodyGlow = `${id}-body-glow`
  const emblem = `${id}-emblem`
  const disc = `${id}-disc`
  const gloss = `${id}-gloss`
  const outerGlow = `${id}-outer-glow`
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
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5eaff" />
          <stop offset="30%" stopColor="#c084fc" />
          <stop offset="62%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={rimDark} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="55%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="55%" stopColor="#24104a" />
          <stop offset="100%" stopColor="#0d0618" />
        </linearGradient>
        <radialGradient id={bodyGlow} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={emblem} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="50%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <radialGradient id={disc} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#2a1260" />
          <stop offset="100%" stopColor="#0a0412" />
        </radialGradient>
        <linearGradient id={gloss} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={outerGlow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="blur" />
          <feFlood floodColor="#a855f7" floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={emblemGlow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${outerGlow})`}>
        <path d={OUTER_SHIELD} fill={`url(#${rim})`} />
      </g>
      <path d={MID_SHIELD} fill={`url(#${rimDark})`} />
      <path d={MID_SHIELD} fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="0.5" />

      <path d={INNER_SHIELD} fill={`url(#${body})`} />
      <path d={INNER_SHIELD} fill={`url(#${bodyGlow})`} />
      <path d={LEFT_FACET} fill="#ffffff" fillOpacity="0.07" />
      <path d={RIGHT_FACET} fill="#000000" fillOpacity="0.22" />
      <path d="M32 8.2 V55.6" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="0.5" />
      <path d={INNER_SHIELD} fill="none" stroke={`url(#${rim})`} strokeOpacity="0.8" strokeWidth="0.8" />

      <path
        d="M14.8 15.4 L32 9.6 L49.2 15.4 V22.5 C42.5 19.8 37.5 18.6 32 18.6 C26.5 18.6 21.5 19.8 14.8 22.5 Z"
        fill={`url(#${gloss})`}
      />
      <path d="M10 11.6 L31 4.4" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1" strokeLinecap="round" />
      <path d="M33.5 4.2 L54 11" stroke="#a5f3fc" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />

      <circle cx="32" cy="33" r="16" fill={`url(#${disc})`} />
      <circle cx="32" cy="33" r="16" fill="none" stroke={`url(#${emblem})`} strokeWidth="1" strokeOpacity="0.85" />
      <g stroke="#67e8f9" strokeLinecap="round">
        {TICKS.map(({ angle, major }) => (
          <line
            key={angle}
            x1="32"
            y1={major ? 18.2 : 18.9}
            x2="32"
            y2="20"
            strokeWidth={major ? 0.9 : 0.5}
            strokeOpacity={major ? 0.95 : 0.5}
            transform={`rotate(${angle} 32 33)`}
          />
        ))}
      </g>

      <g fill={`url(#${emblem})`} filter={`url(#${emblemGlow})`}>
        {TREFOIL_BLADES.map((d) => (
          <path key={d} d={d} />
        ))}
        <circle cx="32" cy="33" r="2.8" />
      </g>
      <circle cx="32" cy="33" r="1.2" fill="#0a0412" />

      <path d="M32 61 L29.6 57.6 H34.4 Z" fill="#22d3ee" fillOpacity="0.7" />
    </svg>
  )
}
