import { ShieldLogo } from './shield-logo'

export function ShieldRing({ progress, active }: { progress: number; active: boolean }) {
  const r = 108
  const c = 2 * Math.PI * r
  return (
    <div className="relative mx-auto flex size-48 shrink-0 items-center justify-center md:size-56">
      <span aria-hidden className="absolute inset-8 rounded-full bg-primary/20 blur-3xl" />
      {active && (
        <span
          aria-hidden
          className="animate-pulse-ring absolute inset-10 rounded-full border border-primary/40"
        />
      )}
      <svg viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--glow)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r={r} fill="none" stroke="rgb(168 85 247 / 12%)" strokeWidth="6" />
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="drop-shadow-[0_0_8px_var(--primary)] transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <svg
        viewBox="0 0 240 240"
        className="animate-spin-slow absolute inset-3 size-[calc(100%-1.5rem)]"
        aria-hidden
      >
        <circle
          cx="120"
          cy="120"
          r="116"
          fill="none"
          stroke="oklch(1 0 0 / 10%)"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
      </svg>
      <div className="relative size-24 md:size-28">
        <span aria-hidden className="absolute inset-3 rounded-full bg-primary/35 blur-2xl" />
        <ShieldLogo
          title="Nuclear Wall shield"
          className="relative drop-shadow-[0_0_18px_rgba(34,211,238,0.25)]"
        />
      </div>
    </div>
  )
}
