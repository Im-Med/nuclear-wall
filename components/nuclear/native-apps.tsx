'use client'

import { useEffect, useRef, useState } from 'react'
import { Checkbox } from './ui-bits'
import { postNativeCommand, useNative, type NativeCatalogApp } from '@/lib/native-bridge'
import { cn } from '@/lib/utils'

const HIGHLIGHT_MS = 2200

export function appRowKey(name: string) {
  return name.trim().toLowerCase()
}

export function NativeApps() {
  const { native, patchNative, focusRequest, clearFocusRequest } = useNative()
  const strict = native?.strict
  const catalog = strict?.catalog ?? []
  const blockedCount = catalog.filter((a) => a.blocked).length
  const studyLockActive = strict?.studyLockActive === true

  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [highlighted, setHighlighted] = useState<string | null>(null)

  useEffect(() => () => clearTimeout(highlightTimer.current), [])

  useEffect(() => {
    if (!focusRequest) return
    const key = appRowKey(focusRequest.name)
    clearFocusRequest()
    rowRefs.current.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlighted(key)
    clearTimeout(highlightTimer.current)
    highlightTimer.current = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS)
  }, [focusRequest, clearFocusRequest])

  const setBlocked = (app: NativeCatalogApp, blocked: boolean) => {
    const base = native?.blockedApps ?? catalog.filter((a) => a.blocked).map((a) => a.name)
    const names = blocked
      ? Array.from(new Set([...base, app.name]))
      : base.filter((n) => n !== app.name)
    patchNative((s) => ({
      ...s,
      blockedApps: names,
      strict: s.strict && {
        ...s.strict,
        catalog: s.strict.catalog.map((a) => (a.name === app.name ? { ...a, blocked } : a)),
      },
    }))
    postNativeCommand('apps_update', { blockedApps: names })
  }

  return (
    <div className="flex flex-col gap-4">
      {studyLockActive && (
        <div
          role="status"
          className="glow-border neo-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-primary"
        >
          <span aria-hidden>🔒</span>
          <p>
            Study Lock ACTIVE — {blockedCount} apps blocked until {strict?.studyLockEnd ?? '21:00'}
          </p>
        </div>
      )}

      <section className="neo-card flex flex-col gap-4 rounded-2xl border border-border p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Apps</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Study lock window {strict?.studyLockStart ?? '19:00'}–{strict?.studyLockEnd ?? '21:00'}
            </p>
          </div>
          {native?.enforcement && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize',
                native.enforcement === 'active'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  native.enforcement === 'active' ? 'bg-primary shadow-[0_0_6px_var(--primary)]' : 'bg-muted-foreground/60',
                )}
              />
              Enforcement {native.enforcement}
            </span>
          )}
        </header>

        {catalog.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No apps reported by the desktop shell yet.</p>
        ) : (
          <ul className="flex flex-col">
            {catalog.map((app) => {
              const key = appRowKey(app.name)
              return (
                <li
                  key={key}
                  ref={(el) => {
                    if (el) rowRefs.current.set(key, el)
                    else rowRefs.current.delete(key)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-500 hover:bg-accent/40',
                    highlighted === key && 'bg-primary/15 ring-1 ring-primary/50',
                  )}
                >
                  <Checkbox
                    checked={app.blocked}
                    onChange={(on) => setBlocked(app, on)}
                    disabled={studyLockActive && app.blocked}
                    label={`Block ${app.name}`}
                  />
                  <AppIcon app={app} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{app.name}</p>
                    {app.processes.length > 0 && (
                      <p className="truncate font-mono text-[11px] text-muted-foreground">{app.processes.join(', ')}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
                      app.blocked
                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                        : 'border-border text-muted-foreground/70',
                    )}
                  >
                    {app.blocked ? 'BLOCKED' : 'Allowed'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function AppIcon({ app }: { app: NativeCatalogApp }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-sidebar">
      {app.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.icon} alt="" className="size-6 object-contain" />
      ) : (
        <span aria-hidden className="text-base">
          ☢️
        </span>
      )}
    </span>
  )
}
