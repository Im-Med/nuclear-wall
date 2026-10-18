'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Bell, CheckCheck, CircleCheck, Lock, Trash2, Zap, type LucideIcon } from 'lucide-react'
import { useNuclear } from '@/lib/nuclear-store'
import type { ActivityKind } from '@/lib/nuclear-types'
import { cn } from '@/lib/utils'

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  info: Bell,
  active: Zap,
  done: CircleCheck,
  lock: Lock,
}

function timeAgo(at: number, now: number) {
  const diff = Math.max(0, now - at)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationsMenu() {
  const { state, now, markActivityRead, clearActivity } = useNuclear()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const items = state.activity ?? []
  const unread = items.filter((a) => !a.read).length

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground',
          open && 'border-primary/40 text-foreground',
        )}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground shadow-[0_0_8px_var(--primary)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50 duration-150"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markActivityRead}
                disabled={unread === 0}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCheck className="size-3.5" />
                Mark read
              </button>
              <button
                type="button"
                onClick={clearActivity}
                disabled={items.length === 0}
                aria-label="Clear all notifications"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Bell className="size-6 text-muted-foreground/60" />
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="text-pretty text-xs text-muted-foreground">
                Mode starts, commitment locks and schedule changes will show up here.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {items.map((item) => {
                const Icon = KIND_ICON[item.kind]
                return (
                  <li
                    key={item.id}
                    className={cn('flex gap-3 px-4 py-3', !item.read && 'bg-primary/5')}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground',
                        !item.read && 'border-primary/30 text-primary',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug font-medium">{item.title}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {now === 0 ? '' : timeAgo(item.at, now)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-pretty text-xs text-muted-foreground">{item.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
