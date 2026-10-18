'use client'

import { useEffect, useState } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight, Lock, Quote, ShieldCheck, Sparkles, Target, Timer } from 'lucide-react'
import { ShieldRing } from './shield-ring'
import { useModal } from './modal-provider'
import { DurationFields, EMPTY_DURATION, durationToMs, type Duration } from './duration-fields'
import { Notice, btnPrimary } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { QUOTES } from '@/lib/nuclear-data'
import { formatCompact, splitDuration } from '@/lib/nuclear-utils'
import type { PageKey } from '@/lib/nuclear-types'
import { cn } from '@/lib/utils'

const PRESETS: { label: string; value: Duration }[] = [
  { label: '1h', value: { days: 0, hours: 1, minutes: 0 } },
  { label: '2h', value: { days: 0, hours: 2, minutes: 0 } },
  { label: '4h', value: { days: 0, hours: 4, minutes: 0 } },
  { label: '1d', value: { days: 1, hours: 0, minutes: 0 } },
]

const pad = (n: number) => n.toString().padStart(2, '0')

export function OverviewPage({ onNavigate }: { onNavigate: (key: PageKey) => void }) {
  const { state, now, commitmentActive } = useNuclear()
  const commitment = state.commitment
  const progress =
    commitmentActive && commitment
      ? Math.min(1, (now - commitment.startedAt) / (commitment.endAt - commitment.startedAt))
      : 0

  return (
    <div className="flex flex-col gap-6">
      <section className="glow-border neo-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <ShieldRing progress={progress} active={commitmentActive} />
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="size-4" />
              Device Owner Active 🛡️
            </div>
            <div>
              <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">Nuclear Wall ⚛️</h2>
              <p className="mt-2 text-pretty text-muted-foreground">Nuclear-strength focus &amp; self-control</p>
            </div>
            <StatusRow onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {commitmentActive && commitment ? <ActiveCommitment /> : <CommitmentForm />}
        </div>
        <QuoteCard />
      </div>
    </div>
  )
}

function StatusRow({ onNavigate }: { onNavigate: (key: PageKey) => void }) {
  const { state, commitmentActive, standaloneActiveCount, activePreset } = useNuclear()
  const items = [
    {
      icon: CalendarRange,
      label: 'Weekly Schedule',
      value: state.scheduleEnabled ? `ON · ${activePreset.name}` : 'OFF',
      on: state.scheduleEnabled,
      page: 'schedule' as const,
    },
    {
      icon: Target,
      label: 'Standalone Modes',
      value: standaloneActiveCount > 0 ? `${standaloneActiveCount} active` : 'None active',
      on: standaloneActiveCount > 0,
      page: 'modes' as const,
    },
    {
      icon: Timer,
      label: 'Commitment Lock',
      value: commitmentActive ? 'Locked' : 'Idle',
      on: commitmentActive,
      page: 'overview' as const,
    },
  ]
  return (
    <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
      {items.map(({ icon: Icon, label, value, on, page }) => (
        <li key={label}>
          <button
            type="button"
            onClick={() => onNavigate(page)}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-sidebar px-3 py-2 text-left transition hover:border-primary/30"
          >
            <Icon className={cn('size-4', on ? 'text-primary' : 'text-muted-foreground')} />
            <span>
              <span className="block text-[11px] text-muted-foreground">{label}</span>
              <span className={cn('block text-sm font-medium', on && 'text-primary')}>{value}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function CommitmentForm() {
  const { state, startCommitment, activePreset } = useNuclear()
  const { openModal } = useModal()
  const [duration, setDuration] = useState<Duration>({ days: 0, hours: 2, minutes: 0 })
  const ms = durationToMs(duration)
  const blocked = state.scheduleEnabled
  const lockin = activePreset.modes.find((m) => m.kind === 'lockin')

  const commit = () => {
    openModal({
      type: 'confirm',
      title: 'Commit and lock?',
      description: `Lock-In Mode will run for ${formatCompact(ms)}. This cannot be cancelled, shortened or bypassed until the countdown ends.`,
      confirmLabel: 'Commit & Lock 🔒',
      onConfirm: () => startCommitment(ms),
    })
  }

  return (
    <section className="neo-card flex h-full flex-col gap-5 rounded-2xl border border-border p-6">
      <div>
        <h2 className="text-lg font-semibold">Commitment Lock</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a duration and seal the wall. Once locked, there is no way out until time runs out.
        </p>
      </div>

      {blocked && <Notice>🔒 Weekly Schedule is ON. Turn it OFF to use Commitment Lock.</Notice>}

      <div className={cn('flex flex-col gap-4', blocked && 'pointer-events-none opacity-50')} aria-disabled={blocked}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick durations">
          {PRESETS.map((p) => {
            const selected = durationToMs(p.value) === ms
            return (
              <button
                key={p.label}
                type="button"
                disabled={blocked}
                onClick={() => setDuration(p.value)}
                aria-pressed={selected}
                className={cn(
                  'rounded-lg border px-4 py-1.5 text-sm font-medium transition',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--primary)]'
                    : 'border-border hover:bg-accent',
                )}
              >
                {p.label}
              </button>
            )
          })}
        </div>
        <fieldset disabled={blocked}>
          <legend className="sr-only">Custom duration</legend>
          <DurationFields value={duration} onChange={setDuration} />
        </fieldset>
      </div>

      {lockin && (
        <p className="text-xs text-muted-foreground">
          Enforces <span className="text-foreground">{lockin.name}</span>: {lockin.blockedApps.length} apps blocked,{' '}
          {lockin.sites.filter((s) => s.rule === 'allow').length} websites allowed.
        </p>
      )}

      <button
        type="button"
        onClick={commit}
        disabled={blocked || ms <= 0}
        className={cn(btnPrimary, 'mt-auto w-full py-3 text-base sm:w-fit')}
      >
        <Lock className="size-4" />
        Commit &amp; Lock 🔒
      </button>
    </section>
  )
}

function ActiveCommitment() {
  const { state, now, activePreset } = useNuclear()
  const commitment = state.commitment
  if (!commitment) return null

  const remaining = Math.max(0, commitment.endAt - now)
  const { days, hours, minutes, seconds } = splitDuration(remaining)
  const progress = Math.min(1, (now - commitment.startedAt) / (commitment.endAt - commitment.startedAt))
  const lockin = activePreset.modes.find((m) => m.kind === 'lockin')
  const fmt = (t: number) =>
    new Date(t).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })

  return (
    <section className="glow-border neo-card flex h-full flex-col gap-5 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Lock-In Mode active</h2>
          <p className="mt-1 text-sm text-muted-foreground">The wall lifts in</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Locked
        </span>
      </div>

      <div
        role="timer"
        aria-live="off"
        aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
        className="flex items-end gap-2 font-mono tabular-nums"
      >
        {days > 0 && (
          <>
            <TimeUnit value={pad(days)} label="days" />
            <Colon />
          </>
        )}
        <TimeUnit value={pad(hours)} label="hrs" />
        <Colon />
        <TimeUnit value={pad(minutes)} label="min" />
        <Colon />
        <TimeUnit value={pad(seconds)} label="sec" accent />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Started {fmt(commitment.startedAt)}</span>
          <span>{Math.round(progress * 100)}%</span>
          <span>Ends {fmt(commitment.endAt)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sidebar shadow-[inset_0_1px_2px_oklch(0_0_0/50%)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-glow to-primary shadow-[0_0_12px_var(--primary)] transition-[width] duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <p className="rounded-lg border border-border bg-sidebar px-3 py-2 text-sm text-muted-foreground">
        This commitment cannot be cancelled, paused or shortened.
        {lockin && (
          <>
            {' '}
            {lockin.blockedApps.length} apps are blocked and {lockin.sites.filter((s) => s.rule === 'allow').length}{' '}
            websites are allowed.
          </>
        )}
      </p>
    </section>
  )
}

function TimeUnit({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          'rounded-xl border bg-sidebar px-2.5 py-2 text-3xl font-semibold shadow-[inset_0_1px_3px_oklch(0_0_0/50%)] md:px-4 md:text-5xl',
          accent
            ? 'border-primary/30 text-primary [text-shadow:0_0_24px_var(--primary)]'
            : 'border-border text-foreground',
        )}
      >
        {value}
      </span>
      <span className="font-sans text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

function Colon() {
  return (
    <span className="pb-7 text-2xl text-muted-foreground/50 md:pb-8 md:text-4xl" aria-hidden>
      :
    </span>
  )
}

function QuoteCard() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = QUOTES.length

  useEffect(() => {
    const now = new Date()
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
    setIndex(dayOfYear % total)
  }, [total])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 12_000)
    return () => clearInterval(timer)
  }, [paused, total])

  const go = (step: number) => setIndex((i) => (i + step + total) % total)

  return (
    <section
      aria-label="Daily Focus Motivation"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="neo-card relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 lg:col-span-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-glow/10 blur-3xl"
      />
      <Quote
        aria-hidden
        className="pointer-events-none absolute right-5 top-14 size-28 rotate-180 fill-primary/10 text-primary/10"
      />

      <header className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/15 text-primary shadow-[0_0_16px_-4px_var(--primary)]">
            <Sparkles className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Daily Focus Motivation</h2>
        </div>
        <span className="rounded-full border border-border bg-sidebar/70 px-2.5 py-1 font-sans text-[11px] tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      <blockquote
        key={index}
        aria-live="polite"
        className="animate-quote-in relative min-h-28 text-pretty font-sans text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl"
      >
        <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
          {QUOTES[index]}
        </span>
      </blockquote>

      <footer className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose quote">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show quote ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                i === index
                  ? 'w-6 bg-primary shadow-[0_0_10px_var(--primary)]'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous quote"
            className="grid size-9 place-items-center rounded-lg border border-border bg-sidebar/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/25"
          >
            Next Quote
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </section>
  )
}
