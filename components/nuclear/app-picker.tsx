'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Dialog } from './dialog'
import { AppBadge, Checkbox, btnPrimary, btnSecondary, inputClass } from './ui-bits'
import { INSTALLED_APPS } from '@/lib/nuclear-data'
import { cn } from '@/lib/utils'

export function AppPicker({
  title,
  description,
  selected,
  onChange,
  disabledReason,
  onClose,
  layer = 2,
}: {
  title: string
  description?: string
  selected: string[]
  onChange: (ids: string[]) => void
  /** Returns a label when the app cannot be selected here. */
  disabledReason?: (appId: string) => string | null
  onClose: () => void
  layer?: 1 | 2
}) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return INSTALLED_APPS.filter(
      (a) => !q || a.name.toLowerCase().includes(q) || a.category.includes(q),
    )
  }, [query])

  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...selected, id] : selected.filter((s) => s !== id))

  return (
    <Dialog
      title={title}
      description={description}
      onClose={onClose}
      layer={layer}
      size="sm"
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={() => onChange([])}>
            Clear all
          </button>
          <button type="button" className={btnPrimary} onClick={onClose}>
            Done ({selected.length})
          </button>
        </>
      }
    >
      <label className="relative block">
        <span className="sr-only">Search installed apps</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          data-autofocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search installed apps"
          className={cn(inputClass, 'pl-9')}
        />
      </label>
      <ul className="mt-3 flex flex-col gap-1">
        {visible.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">
            No apps match &quot;{query}&quot;
          </li>
        )}
        {visible.map((app) => {
          const reason = disabledReason?.(app.id) ?? null
          const checked = selected.includes(app.id)
          return (
            <li
              key={app.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-accent/40',
                reason && 'opacity-60',
              )}
            >
              <Checkbox
                checked={checked}
                disabled={!!reason}
                onChange={(c) => toggle(app.id, c)}
                label={`${app.name}${reason ? `, ${reason}` : ''}`}
              />
              <AppBadge name={app.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{app.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{app.category}</p>
              </div>
              {reason && (
                <span className="shrink-0 rounded-md border border-border bg-sidebar px-2 py-0.5 text-[11px] text-muted-foreground">
                  {reason}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </Dialog>
  )
}
