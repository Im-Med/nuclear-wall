'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-10 w-full rounded-lg border border-border bg-sidebar px-3 text-sm shadow-[inset_0_1px_2px_oklch(0_0_0/40%)] placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_var(--primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-40'

export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-offset-2',
        checked
          ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_10px_-2px_var(--primary)]'
          : 'border-border bg-sidebar hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )
}

export function AppBadge({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-xs font-bold text-primary"
    >
      {name[0]}
    </span>
  )
}

export function Notice({ children, tone = 'warn' }: { children: React.ReactNode; tone?: 'warn' | 'info' }) {
  return (
    <p
      role="status"
      className={cn(
        'rounded-lg border px-3 py-2 text-sm leading-relaxed',
        tone === 'warn'
          ? 'border-warn/30 bg-warn/10 text-warn'
          : 'border-primary/30 bg-primary/10 text-primary',
      )}
    >
      {children}
    </p>
  )
}
