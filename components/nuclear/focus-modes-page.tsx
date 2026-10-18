'use client'

import { Plus, Target, Trash2 } from 'lucide-react'
import { ModeCard } from './mode-card'
import { useModal } from './modal-provider'
import { Toggle } from './toggle'
import { Notice, btnPrimary } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { isModeInWindow } from '@/lib/nuclear-utils'
import type { Mode } from '@/lib/nuclear-types'
import { cn } from '@/lib/utils'

export function FocusModesPage() {
  const { state, now, commitmentActive, setStandaloneActive, deleteMode } = useNuclear()
  const { openModal, openModeEditor } = useModal()
  const scheduleOn = state.scheduleEnabled

  const statusOf = (m: Mode) => {
    if (!m.active) return 'Off'
    if (m.state === 'always' || now === 0) return 'Active now'
    return isModeInWindow(m, now) ? 'Active now' : 'Armed, waiting for window'
  }

  const toggle = (m: Mode, on: boolean) => {
    if (on) {
      setStandaloneActive(m.id, true)
      return
    }
    openModal({
      type: 'pin',
      title: `Turn off ${m.name}`,
      description: 'Enter your admin PIN to deactivate this mode.',
      onConfirm: () => setStandaloneActive(m.id, false),
    })
  }

  const remove = (m: Mode) =>
    openModal({
      type: 'pin',
      title: `Delete ${m.name}`,
      description: 'Enter your admin PIN to permanently delete this mode.',
      onConfirm: () => deleteMode('standalone', m.id),
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Standalone modes run on their own, independent of your weekly schedule. Switch one on and its rules apply
          immediately.
        </p>
        <button
          type="button"
          onClick={() =>
            openModal({
              type: 'pin',
              title: 'Add standalone mode',
              description: 'Enter your admin PIN to create a new mode.',
              onConfirm: () => openModal({ type: 'new-mode', scope: 'standalone' }),
            })
          }
          className={btnPrimary}
        >
          <Plus className="size-4" />
          Add Standalone Mode
        </button>
      </div>

      {scheduleOn && (
        <Notice>🔒 Weekly Schedule is ON. Turn it OFF to use Standalone Modes.</Notice>
      )}
      {commitmentActive && (
        <Notice tone="info">A Commitment Lock is running. Active standalone modes cannot be turned off until it ends.</Notice>
      )}

      {state.standalone.length === 0 ? (
        <div className="neo-card flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <span className="rounded-xl border border-border bg-sidebar p-3 text-primary">
            <Target className="size-6" />
          </span>
          <h2 className="font-semibold">No standalone modes yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a mode with its own blocked apps, allowed apps and websites, then switch it on whenever you need it.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.standalone.map((m) => {
            const toggleDisabled = m.active ? commitmentActive : scheduleOn
            const deleteDisabled = m.active && commitmentActive
            return (
              <ModeCard
                key={m.id}
                mode={m}
                highlight={m.active}
                onOpen={() => openModeEditor('standalone', m.id, m.name)}
                footer={
                  <>
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={m.active}
                        onChange={(on) => toggle(m, on)}
                        disabled={toggleDisabled}
                        label={`${m.name} active`}
                      />
                      <span className={cn('text-xs', m.active ? 'text-primary' : 'text-muted-foreground')}>
                        {statusOf(m)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      disabled={deleteDisabled}
                      aria-label={`Delete ${m.name}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
