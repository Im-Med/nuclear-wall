'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { AppPicker } from './app-picker'
import { NativeApps } from './native-apps'
import { useNative } from '@/lib/native-bridge'
import { SegmentedTabs } from './segmented-tabs'
import { AppBadge, Checkbox, btnPrimary, inputClass } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { APP_BY_ID, APP_CATEGORIES, INSTALLED_APPS } from '@/lib/nuclear-data'
import type { AppCategory } from '@/lib/nuclear-types'
import { cn } from '@/lib/utils'

type Tab = 'allowlist' | 'installed'

export function AppsPage() {
  const { native } = useNative()
  return native?.strict?.catalog ? <NativeApps /> : <LocalAppsPage />
}

function LocalAppsPage() {
  const { state, activePreset, setAllowlist } = useNuclear()
  const [tab, setTab] = useState<Tab>('allowlist')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<AppCategory | 'all'>('all')

  const blockedIn = useMemo(() => {
    const map = new Map<string, string[]>()
    const modes = [...activePreset.modes, ...state.standalone]
    for (const m of modes) {
      for (const id of m.blockedApps) map.set(id, [...(map.get(id) ?? []), m.name])
    }
    return map
  }, [activePreset.modes, state.standalone])

  const toggleAllow = (id: string, on: boolean) =>
    setAllowlist(on ? [...state.allowlist, id] : state.allowlist.filter((a) => a !== id))

  const filtered = INSTALLED_APPS.filter((a) => {
    const q = query.trim().toLowerCase()
    return (category === 'all' || a.category === category) && (!q || a.name.toLowerCase().includes(q))
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Always-allowed apps stay usable in every mode, so essentials like Phone are never locked out.
        </p>
        <SegmentedTabs<Tab>
          label="App list views"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'allowlist', label: 'Allowlist', badge: String(state.allowlist.length) },
            { value: 'installed', label: 'Installed apps', badge: String(INSTALLED_APPS.length) },
          ]}
        />
      </div>

      {tab === 'allowlist' && (
        <section className="neo-card flex flex-col gap-4 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Always allowed</h2>
            <button type="button" onClick={() => setPickerOpen(true)} className={btnPrimary}>
              <Plus className="size-4" />
              Add apps
            </button>
          </div>
          {state.allowlist.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No always-allowed apps. Add some so essentials are never blocked.
            </p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {state.allowlist.map((id) => {
                const app = APP_BY_ID.get(id)
                if (!app) return null
                return (
                  <li key={id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/40">
                    <Checkbox checked onChange={() => toggleAllow(id, false)} label={`${app.name} always allowed, uncheck to remove`} />
                    <AppBadge name={app.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{app.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{app.category}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {tab === 'installed' && (
        <section className="neo-card flex flex-col gap-4 rounded-2xl border border-border p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-48 flex-1">
              <span className="sr-only">Search installed apps</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search installed apps"
                className={cn(inputClass, 'pl-9')}
              />
            </label>
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
              {[{ value: 'all' as const, label: 'All' }, ...APP_CATEGORIES].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition',
                    category === c.value
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex flex-col">
            {filtered.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">No apps match your filters</li>
            )}
            {filtered.map((app) => {
              const allowed = state.allowlist.includes(app.id)
              const blockers = blockedIn.get(app.id) ?? []
              return (
                <li key={app.id} className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent/40">
                  <AppBadge name={app.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{app.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {blockers.length > 0 ? `Blocked in ${blockers.join(', ')}` : 'Not blocked anywhere'}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Always allow
                    <Checkbox checked={allowed} onChange={(on) => toggleAllow(app.id, on)} label={`Always allow ${app.name}`} />
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {pickerOpen && (
        <AppPicker
          layer={1}
          title="Add always-allowed apps"
          selected={state.allowlist}
          onChange={setAllowlist}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
