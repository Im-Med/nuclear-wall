'use client'

import { Check, Eraser, Lock, Plus, Trash2 } from 'lucide-react'
import { ModeCard, KIND_DOT } from './mode-card'
import { useModal } from './modal-provider'
import { Toggle } from './toggle'
import { Notice, btnPrimary, btnSecondary } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { BUILT_IN_KINDS } from '@/lib/nuclear-data'
import {
  DAY_NAMES,
  entriesForDay,
  format12,
  formatCompact,
  isWindowValid,
  localClock,
  windowEnd,
  windowStart,
} from '@/lib/nuclear-utils'
import { cn } from '@/lib/utils'

export function SchedulePage() {
  const {
    state,
    now,
    activePreset,
    commitmentActive,
    standaloneActiveCount,
    scheduleLocked,
    setScheduleEnabled,
    setActivePreset,
    setModeEnabled,
    addBuiltInMode,
    deleteMode,
    deletePreset,
    clearPreset,
  } = useNuclear()
  const { openModal, openModeEditor } = useModal()
  const enabled = state.scheduleEnabled

  const exclusiveBlock = !enabled && (commitmentActive || standaloneActiveCount > 0)
  const toggleDisabled = exclusiveBlock || (enabled && scheduleLocked)

  const onToggle = (next: boolean) => {
    if (next) {
      setScheduleEnabled(true)
      return
    }
    openModal({
      type: 'pin',
      title: 'Turn off Weekly Schedule',
      description: 'Enter your admin PIN to disable the schedule.',
      onConfirm: () => setScheduleEnabled(false),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Schedule presets"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {state.presets.map((p) => {
          const active = p.id === activePreset.id
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActivePreset(p.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition',
                active
                  ? 'border-primary/50 bg-primary/15 text-foreground shadow-[0_0_20px_-6px_var(--primary)]'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {p.name}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => openModal({ type: 'new-preset' })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
        >
          <Plus className="size-4" />
          New Preset
        </button>
      </div>

      <section className="glow-border neo-card flex flex-col gap-4 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Weekly Schedule</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {enabled
                ? `Running the ${activePreset.name} automatically.`
                : 'Turn on to run your modes automatically every week.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('font-mono text-xs font-semibold', enabled ? 'text-primary' : 'text-muted-foreground')}>
              {enabled ? 'ON' : 'OFF'}
            </span>
            <Toggle checked={enabled} onChange={onToggle} disabled={toggleDisabled} label="Weekly Schedule" />
            <button
              type="button"
              disabled={!enabled || scheduleLocked}
              onClick={() => openModal({ type: 'schedule-lock' })}
              className={btnSecondary}
            >
              <Lock className="size-4" />
              Lock Schedule
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            type="button"
            disabled={scheduleLocked || activePreset.modes.length === 0}
            onClick={() =>
              openModal({
                type: 'confirm',
                title: `Clear ${activePreset.name}?`,
                description: 'This removes every mode from this weekly schedule. The preset itself is kept.',
                confirmLabel: 'Clear schedule',
                onConfirm: () => clearPreset(activePreset.id),
              })
            }
            className={btnSecondary}
          >
            <Eraser className="size-4" />
            Clear Schedule
          </button>
          <button
            type="button"
            disabled={scheduleLocked || state.presets.length <= 1}
            onClick={() =>
              openModal({
                type: 'confirm',
                title: `Delete ${activePreset.name}?`,
                description: 'This permanently deletes this weekly schedule and all its modes.',
                confirmLabel: 'Delete schedule',
                onConfirm: () => deletePreset(activePreset.id),
              })
            }
            className={cn(btnSecondary, 'text-destructive hover:text-destructive')}
          >
            <Trash2 className="size-4" />
            Delete Schedule
          </button>
          {state.presets.length <= 1 && (
            <p className="self-center text-xs text-muted-foreground">At least one schedule must remain.</p>
          )}
        </div>
        {exclusiveBlock && (
          <Notice>🔒 A Standalone Mode or Commitment Lock is active. Turn it OFF to enable Weekly Schedule.</Notice>
        )}
        {scheduleLocked && state.scheduleLockEndAt && (
          <Notice>
            🔒 Schedule locked for {formatCompact(state.scheduleLockEndAt - now)}. It cannot be turned off or edited until
            then.
          </Notice>
        )}
        {!enabled && !exclusiveBlock && (
          <p className="text-xs text-muted-foreground">
            Lock Schedule becomes available once the schedule is ON.
          </p>
        )}
      </section>

      <WrittenSchedule />

      <section className="flex flex-col gap-4" aria-label="Preset modes">
        <div>
          <h2 className="text-lg font-semibold">Preset modes</h2>
          <p className="text-sm text-muted-foreground">Add a ready-made mode to {activePreset.name} in one tap.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {BUILT_IN_KINDS.map((b) => {
            const added = activePreset.modes.some((m) => m.kind === b.kind)
            return (
              <li key={b.kind} className="neo-card flex items-center gap-3 rounded-2xl border border-border p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-sidebar text-xl">
                  {b.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.blurb}</p>
                </div>
                {added ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Check className="size-4" />
                    Added
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={scheduleLocked}
                    onClick={() => addBuiltInMode(b.kind)}
                    aria-label={`Add ${b.label}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 text-primary transition hover:bg-primary/10 disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Modes in {activePreset.name}</h2>
            <p className="text-sm text-muted-foreground">
              Turn a mode on to show it in the schedule. Editing needs your admin PIN.
            </p>
          </div>
          <button
            type="button"
            disabled={scheduleLocked}
            onClick={() => openModal({ type: 'new-mode', scope: 'schedule' })}
            className={btnPrimary}
          >
            <Plus className="size-4" />
            Add Mode to Schedule
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activePreset.modes.map((m) => (
            <ModeCard
              key={m.id}
              mode={m}
              muted={!m.enabled}
              onOpen={() => openModeEditor('schedule', m.id, m.name)}
              footer={
                <>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={m.enabled}
                      onChange={(next) => setModeEnabled(m.id, next)}
                      disabled={scheduleLocked}
                      label={`Show ${m.name} in schedule`}
                    />
                    <span
                      className={cn('text-xs font-medium', m.enabled ? 'text-primary' : 'text-muted-foreground')}
                    >
                      {m.enabled ? 'In schedule' : 'Hidden'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={scheduleLocked}
                    aria-label={`Delete ${m.name}`}
                    onClick={() =>
                      openModal({
                        type: 'confirm',
                        title: `Delete ${m.name}?`,
                        description: 'This permanently removes the mode from this schedule.',
                        confirmLabel: 'Delete mode',
                        onConfirm: () => deleteMode('schedule', m.id),
                      })
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              }
            />
          ))}
          {activePreset.modes.length === 0 && (
            <p className="text-sm text-muted-foreground">No modes yet. Add a preset mode above.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function WrittenSchedule() {
  const { state, now, activePreset } = useNuclear()
  const modes = activePreset.modes.filter((m) => m.enabled)
  const clock = now > 0 && state.scheduleEnabled ? localClock(now) : null

  const daily = modes.flatMap((m) =>
    m.state === 'always'
      ? [{ key: `${m.id}-always`, mode: m, label: 'All day' }]
      : m.windows
          .filter((w) => w.days.length === 7 && isWindowValid(w))
          .map((w) => ({
            key: `${m.id}-${w.id}`,
            mode: m,
            label: `${format12(windowStart(w))} - ${format12(windowEnd(w))}`,
          })),
  )

  return (
    <section className="flex flex-col gap-4" aria-label="Written weekly schedule">
      <div>
        <h2 className="text-lg font-semibold">Written schedule</h2>
        <p className="text-sm text-muted-foreground">Generated from your modes. Edit a mode to change it.</p>
      </div>

      {daily.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {daily.map(({ key, mode, label }) => (
            <li
              key={key}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
            >
              <span className={cn('size-2 rounded-full', KIND_DOT[mode.kind])} aria-hidden />
              <span className="font-medium">{mode.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{label}</span>
              <span className="text-xs text-primary">(Every Day)</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DAY_NAMES.map((name, day) => {
          const entries = entriesForDay(modes, day)
          const isToday = clock?.day === day
          return (
            <article
              key={name}
              className={cn(
                'neo-card rounded-2xl border p-4',
                isToday ? 'border-primary/50' : 'border-border',
              )}
            >
              <header className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{name}</h3>
                {isToday && (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    Today
                  </span>
                )}
              </header>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No blocks</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {entries.map((e) => {
                    const current =
                      !!clock && !e.allDay && isToday && clock.minutes >= e.start && clock.minutes < e.end
                    return (
                      <li
                        key={e.key}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm',
                          current && 'bg-primary/10 ring-1 ring-primary/30',
                        )}
                      >
                        <span className={cn('size-2 shrink-0 rounded-full', KIND_DOT[e.kind])} aria-hidden />
                        <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                          {e.allDay ? 'All day' : `${format12(e.start)}-${format12(e.end)}`}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{e.name}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
