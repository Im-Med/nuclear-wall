'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Tab<T extends string> = { value: T; label: string; badge?: string }

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: Tab<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const update = () => {
      const active = list.querySelector<HTMLButtonElement>('[data-active="true"]')
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(list)
    return () => observer.disconnect()
  }, [value, tabs])

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn(
        'relative inline-flex items-center gap-1 rounded-xl border border-border bg-sidebar p-1 shadow-[inset_0_1px_2px_oklch(0_0_0/40%)]',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 rounded-lg border border-primary/30 bg-accent shadow-[0_0_20px_-6px_var(--primary),inset_0_1px_0_oklch(1_0_0/8%)] transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative z-10 flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.badge && (
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none',
                  active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
