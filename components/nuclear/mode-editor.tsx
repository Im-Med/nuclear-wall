'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { Dialog } from './dialog'
import { AppPicker } from './app-picker'
import { SegmentedTabs } from './segmented-tabs'
import { useModal } from './modal-provider'
import {
  AppBadge,
  Checkbox,
  Notice,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { APP_BY_ID } from '@/lib/nuclear-data'
import type { Mode, ModeScope, TimeWindow } from '@/lib/nuclear-types'
import { DAY_LABELS, isWindowValid, normalizeDomain, uid } from '@/lib/nuclear-utils'
import { cn } from '@/lib/utils'

type Tab = 'schedule' | 'apps' | 'sites'
type PickerTarget = 'blocked' | 'allowed' | null

export function ModeEditor({ scope, modeId }: { scope: ModeScope; modeId: string }) {
  const { state, activePreset, saveMode, deleteMode, scheduleLocked, commitmentActive } = useNuclear()
  const { openModal, closeModal } = useModal()

  const siblings = scope === 'schedule' ? activePreset.modes : state.standalone
  const source = siblings.find((m) => m.id === modeId)

  const [draft, setDraft] = useState<Mode | null>(() =>
    source ? (JSON.parse(JSON.stringify(source)) as Mode) : null,
  )
  const [tab, setTab] = useState<Tab>('schedule')
  const [picker, setPicker] = useState<PickerTarget>(null)

  useEffect(() => {
    if (!source) closeModal()
  }, [source, closeModal])

  const nameTaken = useMemo(
    () =>
      draft
        ? siblings.some(
            (m) => m.id !== draft.id && m.name.toLowerCase() === draft.name.trim().toLowerCase(),
          )
        : false,
    [siblings, draft],
  )

  if (!draft || !source) return null

  const lockedByScheduleLock = scope === 'schedule' && scheduleLocked
  const lockedByCommitment = scope === 'standalone' && source.active && commitmentActive
  const readOnly = lockedByScheduleLock || lockedByCommitment
  const windowsOk = draft.state === 'always' || draft.windows.every(isWindowValid)
  const nameOk = draft.name.trim().length > 0 && !nameTaken
  const canSave = !readOnly && windowsOk && nameOk
  const canDelete = true

  const patch = (next: Partial<Mode>) => setDraft((d) => (d ? { ...d, ...next } : d))

  const save = () => {
    if (!canSave) return
    saveMode(scope, { ...draft, name: draft.name.trim() })
    closeModal()
  }

  const requestDelete = () => {
    openModal({
      type: 'confirm',
      title: `Delete ${source.name}?`,
      description: 'This permanently removes the mode and its schedule.',
      confirmLabel: 'Delete mode',
      onConfirm: () => deleteMode(scope, source.id),
    })
  }

  const blockedBy = (id: string) => (draft.allowedApps.includes(id) ? 'Already in allowed apps' : null)
  const allowedBy = (id: string) => (draft.blockedApps.includes(id) ? 'Already in blocked apps' : null)

  return (
    <>
      <Dialog
        title={`Edit ${source.name}`}
        description={scope === 'schedule' ? 'Changes apply to the active preset.' : 'Standalone mode settings.'}
        size="lg"
        onClose={closeModal}
        footer={
          <>
            {canDelete && (
              <button type="button" onClick={requestDelete} disabled={readOnly} className={cn(btnDanger, 'mr-auto')}>
                <Trash2 className="size-4" />
                Delete
              </button>
            )}
            <button type="button" onClick={closeModal} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={!canSave} className={btnPrimary}>
              Save Changes
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {lockedByScheduleLock && (
            <Notice>🔒 The weekly schedule is locked. Modes cannot be edited until the lock ends.</Notice>
          )}
          {lockedByCommitment && (
            <Notice>🔒 A Commitment Lock is active. This running mode cannot be edited until it ends.</Notice>
          )}

          <fieldset disabled={readOnly} className="flex flex-col gap-5 disabled:opacity-60">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <NameField
                value={draft.name}
                onChange={(name) => patch({ name })}
                error={!draft.name.trim() ? 'Name is required' : nameTaken ? 'A mode with this name already exists' : null}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">State</span>
                <div role="radiogroup" aria-label="Mode state" className="flex gap-1 rounded-xl border border-border bg-sidebar p-1">
                  {(['always', 'scheduled'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={draft.state === s}
                      onClick={() => patch({ state: s })}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                        draft.state === s
                          ? 'border border-primary/30 bg-accent text-foreground shadow-[0_0_16px_-6px_var(--primary)]'
                          : 'border border-transparent text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {s === 'always' ? 'Always On' : 'Scheduled'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SegmentedTabs<Tab>
              label="Mode editor sections"
              value={tab}
              onChange={setTab}
              className="self-start"
              tabs={[
                { value: 'schedule', label: 'Schedule', badge: String(draft.windows.length) },
                { value: 'apps', label: 'Apps', badge: String(draft.blockedApps.length + draft.allowedApps.length) },
                { value: 'sites', label: 'Websites', badge: String(draft.sites.length) },
              ]}
            />

            {tab === 'schedule' && <ScheduleTab draft={draft} patch={patch} />}
            {tab === 'apps' && (
              <div className="grid gap-4 md:grid-cols-2">
                <AppListSection
                  title="Blocked Apps"
                  ids={draft.blockedApps}
                  onRemove={(id) => patch({ blockedApps: draft.blockedApps.filter((a) => a !== id) })}
                  onOpenPicker={() => setPicker('blocked')}
                />
                <AppListSection
                  title="Allowed Apps"
                  ids={draft.allowedApps}
                  onRemove={(id) => patch({ allowedApps: draft.allowedApps.filter((a) => a !== id) })}
                  onOpenPicker={() => setPicker('allowed')}
                />
              </div>
            )}
            {tab === 'sites' && <SitesTab draft={draft} patch={patch} />}
          </fieldset>
        </div>
      </Dialog>

      {picker === 'blocked' && (
        <AppPicker
          title="Select blocked apps"
          description="Apps already allowed in this mode are disabled."
          selected={draft.blockedApps}
          onChange={(ids) => patch({ blockedApps: ids })}
          disabledReason={blockedBy}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'allowed' && (
        <AppPicker
          title="Select allowed apps"
          description="Apps already blocked in this mode are disabled."
          selected={draft.allowedApps}
          onChange={(ids) => patch({ allowedApps: ids })}
          disabledReason={allowedBy}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  )
}

function NameField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error: string | null
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        Mode name
      </label>
      <input
        id={id}
        value={value}
        maxLength={30}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(inputClass, error && 'border-destructive/60')}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function ScheduleTab({
  draft,
  patch,
}: {
  draft: Mode
  patch: (p: Partial<Mode>) => void
}) {
  const updateWindow = (id: string, next: Partial<TimeWindow>) =>
    patch({ windows: draft.windows.map((w) => (w.id === id ? { ...w, ...next } : w)) })

  const addWindow = () =>
    patch({
      windows: [
        ...draft.windows,
        { id: uid('win'), start: '09:00', end: '10:00', days: [0, 1, 2, 3, 4, 5, 6] },
      ],
    })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Schedule windows</h3>
        <button type="button" onClick={addWindow} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent">
          <Plus className="size-3.5" />
          Add window
        </button>
      </div>
      {draft.state === 'always' && (
        <Notice tone="info">This mode is Always On, so its windows are ignored. Switch to Scheduled to use them.</Notice>
      )}
      {draft.windows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No windows yet. Add one to choose when this mode runs.
        </p>
      )}
      <ul className={cn('flex flex-col gap-3', draft.state === 'always' && 'opacity-50')}>
        {draft.windows.map((w, i) => {
          const valid = isWindowValid(w)
          return (
            <li key={w.id} className={cn('rounded-xl border bg-card p-3', valid ? 'border-border' : 'border-destructive/50')}>
              <div className="flex flex-wrap items-end gap-3">
                <TimeField label="Start" value={w.start} onChange={(v) => updateWindow(w.id, { start: v })} />
                <TimeField label="End" value={w.end} onChange={(v) => updateWindow(w.id, { end: v })} />
                <button
                  type="button"
                  aria-label={`Remove window ${i + 1}`}
                  onClick={() => patch({ windows: draft.windows.filter((x) => x.id !== w.id) })}
                  className="ml-auto rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div role="group" aria-label="Active days" className="mt-3 flex flex-wrap gap-1.5">
                {DAY_LABELS.map((label, d) => {
                  const on = w.days.includes(d)
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        updateWindow(w.id, {
                          days: on ? w.days.filter((x) => x !== d) : [...w.days, d].sort(),
                        })
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition',
                        on
                          ? 'border-primary/50 bg-primary/15 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {!valid && (
                <p className="mt-2 text-xs text-destructive">
                  {w.days.length === 0
                    ? 'Pick at least one day.'
                    : 'End time must be after the start time (use 12:00 AM for midnight).'}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input id={id} type="time" value={value} onChange={(e) => onChange(e.target.value || '00:00')} className={cn(inputClass, 'w-36 font-mono')} />
    </div>
  )
}

function AppListSection({
  title,
  ids,
  onRemove,
  onOpenPicker,
}: {
  title: string
  ids: string[]
  onRemove: (id: string) => void
  onOpenPicker: () => void
}) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title} <span className="font-mono text-xs text-muted-foreground">({ids.length})</span>
        </h3>
        <button type="button" onClick={onOpenPicker} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-accent">
          <Plus className="size-3.5" />
          Select apps
        </button>
      </div>
      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {ids.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No apps selected</li>
        )}
        {ids.map((id) => {
          const app = APP_BY_ID.get(id)
          if (!app) return null
          return (
            <li key={id} className="flex items-center gap-3 rounded-lg px-1.5 py-1.5 hover:bg-accent/40">
              <Checkbox checked onChange={() => onRemove(id)} label={`${app.name} in ${title}, uncheck to remove`} />
              <AppBadge name={app.name} />
              <span className="min-w-0 flex-1 truncate text-sm">{app.name}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SitesTab({ draft, patch }: { draft: Mode; patch: (p: Partial<Mode>) => void }) {
  const [domain, setDomain] = useState('')
  const [rule, setRule] = useState<'allow' | 'block'>('allow')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = normalizeDomain(domain)
    if (!normalized) return setError('Enter a valid domain such as example.com')
    if (draft.sites.some((s) => s.domain === normalized)) return setError('That domain is already in the list')
    patch({ sites: [...draft.sites, { id: uid('site'), domain: normalized, rule }] })
    setDomain('')
    setError(null)
  }

  const allowed = draft.sites.filter((s) => s.rule === 'allow').length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Website rules</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {allowed} allowed / {draft.sites.length - allowed} blocked
        </span>
      </div>
      <form onSubmit={add} className="flex flex-wrap items-start gap-2">
        <div className="min-w-48 flex-1">
          <label htmlFor={inputId} className="sr-only">
            Website domain
          </label>
          <input
            id={inputId}
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value)
              setError(null)
            }}
            placeholder="example.com"
            aria-invalid={!!error}
            className={cn(inputClass, error && 'border-destructive/60')}
          />
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <select
          aria-label="Rule type"
          value={rule}
          onChange={(e) => setRule(e.target.value as 'allow' | 'block')}
          className={cn(inputClass, 'w-28')}
        >
          <option value="allow">Allow</option>
          <option value="block">Block</option>
        </select>
        <button type="submit" className={btnPrimary}>
          <Plus className="size-4" />
          Add
        </button>
      </form>
      <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-card p-1.5">
        {draft.sites.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No website rules</li>
        )}
        {draft.sites.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/40">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-sm">{s.domain}</span>
            <button
              type="button"
              onClick={() =>
                patch({
                  sites: draft.sites.map((x) =>
                    x.id === s.id ? { ...x, rule: x.rule === 'allow' ? 'block' : 'allow' } : x,
                  ),
                })
              }
              aria-label={`${s.domain} is ${s.rule === 'allow' ? 'allowed' : 'blocked'}, click to toggle`}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition',
                s.rule === 'allow'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-destructive/40 bg-destructive/10 text-destructive',
              )}
            >
              {s.rule === 'allow' ? 'Allowed' : 'Blocked'}
            </button>
            <button
              type="button"
              aria-label={`Remove ${s.domain}`}
              onClick={() => patch({ sites: draft.sites.filter((x) => x.id !== s.id) })}
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
