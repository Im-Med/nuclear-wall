'use client'

import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Mode, ModeKind } from '@/lib/nuclear-types'
import { cn } from '@/lib/utils'

export const KIND_DOT: Record<ModeKind, string> = {
  night: 'bg-chart-4',
  game: 'bg-warn',
  lockin: 'bg-primary',
  taki: 'bg-glow',
  custom: 'bg-foreground/60',
}

export function ModeCard({
  mode,
  onOpen,
  status,
  footer,
  highlight,
  muted,
}: {
  mode: Mode
  onOpen: () => void
  status?: string
  footer?: ReactNode
  highlight?: boolean
  muted?: boolean
}) {
  const allowedSites = mode.sites.filter((s) => s.rule === 'allow').length
  return (
    <article
      className={cn(
        'neo-card flex flex-col rounded-2xl border transition hover:border-primary/30',
        highlight ? 'border-primary/50 shadow-[0_0_30px_-10px_var(--primary)]' : 'border-border',
      )}
    >
      <div className={cn('flex flex-1 flex-col', muted && 'opacity-55')}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Edit ${mode.name}`}
        className="group flex flex-1 flex-col gap-4 rounded-2xl p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-sidebar text-xl">
            {mode.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{mode.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {mode.state === 'always'
                ? 'Always On'
                : `Scheduled · ${mode.windows.length} window${mode.windows.length === 1 ? '' : 's'}`}
              {status ? ` · ${status}` : ''}
            </p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Blocked" value={mode.blockedApps.length} />
          <Stat label="Allowed" value={mode.allowedApps.length} />
          <Stat label="Sites ok" value={allowedSites} />
        </dl>
      </button>
      </div>
      {footer && <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">{footer}</div>}
    </article>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-sidebar px-2 py-1.5">
      <dd className="font-mono text-base font-semibold">{value}</dd>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
    </div>
  )
}
