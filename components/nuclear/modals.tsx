'use client'

import { useId, useState } from 'react'
import { Dialog } from './dialog'
import { ModeEditor } from './mode-editor'
import { useModal } from './modal-provider'
import { DurationFields, EMPTY_DURATION, durationToMs, type Duration } from './duration-fields'
import { Notice, btnDanger, btnPrimary, btnSecondary, inputClass } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { cn } from '@/lib/utils'

export function Modals() {
  const { modal } = useModal()
  if (!modal) return null

  switch (modal.type) {
    case 'pin':
      return <PinModal title={modal.title} description={modal.description} onConfirm={modal.onConfirm} />
    case 'confirm':
      return (
        <ConfirmModal
          title={modal.title}
          description={modal.description}
          confirmLabel={modal.confirmLabel}
          onConfirm={modal.onConfirm}
        />
      )
    case 'new-preset':
      return <NewPresetModal />
    case 'new-mode':
      return <NewModeModal scope={modal.scope} />
    case 'mode-editor':
      return <ModeEditor key={`${modal.scope}-${modal.modeId}`} scope={modal.scope} modeId={modal.modeId} />
    case 'schedule-lock':
      return <ScheduleLockModal />
  }
}

function PinModal({
  title,
  description,
  onConfirm,
}: {
  title: string
  description?: string
  onConfirm: () => void
}) {
  const { state } = useNuclear()
  const { closeModal } = useModal()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const id = useId()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === state.pin) {
      closeModal()
      onConfirm()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <Dialog title={title} description={description ?? 'Enter your admin PIN to continue.'} size="sm" onClose={closeModal}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            Admin PIN
          </label>
          <input
            id={id}
            data-autofocus
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ''))
              setError(false)
            }}
            aria-invalid={error}
            placeholder="Enter PIN"
            className={cn(inputClass, 'text-center font-mono text-lg tracking-[0.5em]', error && 'border-destructive/60')}
          />
          {error && (
            <p role="alert" className="text-xs text-destructive">
              Incorrect PIN. Try again.
            </p>
          )}
          {state.pin === '1234' && (
            <p className="text-xs text-muted-foreground">Default PIN is 1234. Change it in Settings.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={closeModal} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={value.length === 0} className={btnPrimary}>
            Confirm
          </button>
        </div>
      </form>
    </Dialog>
  )
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
}) {
  const { closeModal } = useModal()
  return (
    <Dialog
      title={title}
      description={description}
      size="sm"
      onClose={closeModal}
      footer={
        <>
          <button type="button" data-autofocus onClick={closeModal} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              closeModal()
              onConfirm()
            }}
            className={btnPrimary}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">Please confirm to continue.</p>
    </Dialog>
  )
}

function NewPresetModal() {
  const { state, addPreset } = useNuclear()
  const { closeModal } = useModal()
  const [name, setName] = useState('')
  const id = useId()

  const trimmed = name.trim()
  const taken = state.presets.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed || taken) return
    addPreset(trimmed)
    closeModal()
  }

  return (
    <Dialog title="New preset" description="Each preset keeps its own weekly schedule." size="sm" onClose={closeModal}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            Preset name
          </label>
          <input
            id={id}
            data-autofocus
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vacation Preset"
            className={inputClass}
          />
          {taken && <p className="text-xs text-destructive">A preset with this name already exists</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={closeModal} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed || taken} className={btnPrimary}>
            Create preset
          </button>
        </div>
      </form>
    </Dialog>
  )
}

const EMOJIS = ['🎯', '📚', '🧠', '🎧', '🏃', '💤', '⚡', '🔥']

function NewModeModal({ scope }: { scope: 'schedule' | 'standalone' }) {
  const { activePreset, state, addMode } = useNuclear()
  const { openModal, closeModal } = useModal()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const id = useId()

  const siblings = scope === 'schedule' ? activePreset.modes : state.standalone
  const trimmed = name.trim()
  const taken = siblings.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed || taken) return
    const modeId = addMode(scope, trimmed, emoji)
    openModal({ type: 'mode-editor', scope, modeId })
  }

  return (
    <Dialog
      title={scope === 'schedule' ? 'Add mode to schedule' : 'Add standalone mode'}
      description="Name your mode, then choose its schedule, apps and websites."
      size="sm"
      onClose={closeModal}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            Mode name
          </label>
          <input
            id={id}
            data-autofocus
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="Study Sprint"
            className={inputClass}
          />
          {taken && <p className="text-xs text-destructive">A mode with this name already exists</p>}
        </div>
        <div role="radiogroup" aria-label="Mode icon" className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={emoji === e}
              aria-label={`Icon ${e}`}
              onClick={() => setEmoji(e)}
              className={cn(
                'flex size-10 items-center justify-center rounded-lg border text-lg transition',
                emoji === e
                  ? 'border-primary/60 bg-primary/15 shadow-[0_0_14px_-4px_var(--primary)]'
                  : 'border-border hover:bg-accent',
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={closeModal} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed || taken} className={btnPrimary}>
            Create and edit
          </button>
        </div>
      </form>
    </Dialog>
  )
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function ScheduleLockModal() {
  const { lockSchedule } = useNuclear()
  const { closeModal } = useModal()
  const [duration, setDuration] = useState<Duration>(EMPTY_DURATION)
  const ms = durationToMs(duration)

  const lock = (durationMs: number) => {
    lockSchedule(durationMs)
    closeModal()
  }

  return (
    <Dialog title="Lock schedule" description="Choose how long the weekly schedule stays locked." size="sm" onClose={closeModal}>
      <div className="flex flex-col gap-4">
        <Notice>
          Once locked, the schedule cannot be turned off or edited until the timer ends. Not even the admin PIN can undo it.
        </Notice>
        <DurationFields value={duration} onChange={setDuration} />
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => lock(WEEK_MS)} className={btnDanger}>
            Lock for 1 Week 🔒
          </button>
          <button type="button" disabled={ms <= 0} onClick={() => lock(ms)} className={btnPrimary}>
            Lock Schedule 🔒
          </button>
        </div>
      </div>
    </Dialog>
  )
}
