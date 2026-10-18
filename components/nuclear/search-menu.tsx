'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AppWindow, CalendarRange, Search, SearchX, Target, X, type LucideIcon } from 'lucide-react'
import { useNuclear } from '@/lib/nuclear-store'
import { APP_CATEGORIES, INSTALLED_APPS } from '@/lib/nuclear-data'
import type { PageKey } from '@/lib/nuclear-types'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

type ResultGroup = 'Pages' | 'Modes' | 'Apps'

interface SearchResult {
  id: string
  group: ResultGroup
  title: string
  subtitle: string
  icon: LucideIcon
  page: PageKey
}

const GROUP_ORDER: ResultGroup[] = ['Pages', 'Modes', 'Apps']
const MAX_PER_GROUP = 6

const CATEGORY_LABEL = new Map(APP_CATEGORIES.map((c) => [c.value, c.label]))

function matches(query: string, ...fields: string[]) {
  return fields.some((f) => f.toLowerCase().includes(query))
}

export function SearchMenu({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { state } = useNuclear()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()

    const pages: SearchResult[] = NAV_ITEMS.filter(
      (item) => !q || matches(q, item.label, item.shortLabel),
    ).map((item) => ({
      id: `page-${item.key}`,
      group: 'Pages',
      title: item.label,
      subtitle: 'Go to page',
      icon: item.icon,
      page: item.key,
    }))

    if (!q) return pages

    const modes: SearchResult[] = [
      ...state.presets.flatMap((preset) =>
        preset.modes
          .filter((m) => matches(q, m.name, m.kind, preset.name))
          .map<SearchResult>((m) => ({
            id: `mode-${preset.id}-${m.id}`,
            group: 'Modes',
            title: m.name,
            subtitle: `Weekly schedule · ${preset.name} · ${m.enabled ? 'On' : 'Off'}`,
            icon: CalendarRange,
            page: 'schedule',
          })),
      ),
      ...state.standalone
        .filter((m) => matches(q, m.name, m.kind))
        .map<SearchResult>((m) => ({
          id: `mode-standalone-${m.id}`,
          group: 'Modes',
          title: m.name,
          subtitle: `Standalone mode · ${m.active ? 'Active' : 'Inactive'}`,
          icon: Target,
          page: 'modes',
        })),
    ]

    const allowed = new Set(state.allowlist)
    const apps: SearchResult[] = INSTALLED_APPS.filter((a) =>
      matches(q, a.name, CATEGORY_LABEL.get(a.category) ?? a.category),
    ).map((a) => ({
      id: `app-${a.id}`,
      group: 'Apps',
      title: a.name,
      subtitle: `${CATEGORY_LABEL.get(a.category) ?? a.category} · ${allowed.has(a.id) ? 'Always allowed' : 'Blocked in focus'}`,
      icon: AppWindow,
      page: 'apps',
    }))

    const all = [...pages, ...modes, ...apps]
    return GROUP_ORDER.flatMap((group) => all.filter((r) => r.group === group).slice(0, MAX_PER_GROUP))
  }, [query, state.presets, state.standalone, state.allowlist])

  const safeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isShortcut) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.getElementById(`${listId}-${safeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [safeIndex, open, listId])

  const select = (result: SearchResult) => {
    onNavigate(result.page)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex(results.length === 0 ? 0 : (safeIndex + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex(results.length === 0 ? 0 : (safeIndex - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      const result = results[safeIndex]
      if (open && result) {
        e.preventDefault()
        select(result)
      }
    } else if (e.key === 'Escape') {
      if (query) {
        setQuery('')
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
  }

  const showEmpty = query.trim() !== '' && results.length === 0

  return (
    <div ref={rootRef} className="relative flex-1 md:w-64 md:flex-none">
      <label className="relative block">
        <span className="sr-only">Search pages, modes and apps</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results.length > 0 ? `${listId}-${safeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder="Search modes, apps…"
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          className="h-9 w-full rounded-lg border border-border bg-sidebar pr-14 pl-9 text-sm shadow-[inset_0_1px_2px_oklch(0_0_0/40%)] placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground md:block">
            Ctrl K
          </kbd>
        )}
      </label>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-72 animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50 duration-150 md:right-0 md:left-auto md:w-96">
          {showEmpty ? (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <SearchX className="size-6 text-muted-foreground/60" />
              <p className="text-sm font-medium">No results for &ldquo;{query.trim()}&rdquo;</p>
              <p className="text-pretty text-xs text-muted-foreground">
                Try a mode name like Night, or an app like YouTube.
              </p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => {
                const Icon = result.icon
                const isActive = index === safeIndex
                const showHeader = index === 0 || results[index - 1].group !== result.group
                return (
                  <li key={result.id} role="presentation">
                    {showHeader && (
                      <p
                        role="presentation"
                        className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
                      >
                        {query.trim() === '' ? 'Jump to' : result.group}
                      </p>
                    )}
                    <div
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => select(result)}
                      className={cn(
                        'mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
                        isActive && 'bg-primary/10',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground',
                          isActive && 'border-primary/30 text-primary',
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{result.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span>
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="hidden items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground md:flex">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">Enter</kbd> open
            </span>
            <span>
              <kbd className="font-mono">Esc</kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
