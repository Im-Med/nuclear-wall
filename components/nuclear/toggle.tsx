'use client'

import { cn } from '@/lib/utils'

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
        checked
          ? 'border-primary/50 bg-primary/20 shadow-[0_0_16px_-4px_var(--primary)]'
          : 'border-border bg-sidebar shadow-[inset_0_1px_3px_oklch(0_0_0/50%)]',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 rounded-full transition-all duration-300',
          checked
            ? 'translate-x-6 bg-primary shadow-[0_0_10px_var(--primary)]'
            : 'translate-x-1 bg-muted-foreground/60',
        )}
      />
    </button>
  )
}
