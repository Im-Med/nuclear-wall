'use client'

import { useId, useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Toggle } from './toggle'
import { useModal } from './modal-provider'
import { Notice, btnDanger, btnPrimary, inputClass } from './ui-bits'
import { useNuclear } from '@/lib/nuclear-store'
import { postNativeCommand, useNative } from '@/lib/native-bridge'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { state, updateSettings, resetAll, commitmentActive, scheduleLocked } = useNuclear()
  const { openModal } = useModal()
  const resetBlocked = commitmentActive || scheduleLocked

  const preferences = [
    {
      key: 'notifications' as const,
      title: 'Block notifications',
      body: 'Silence notifications from blocked apps while a mode is running.',
    },
    {
      key: 'hideBlockedIcons' as const,
      title: 'Hide blocked app icons',
      body: 'Remove blocked apps from the launcher while a mode is running.',
    },
    {
      key: 'strictSettings' as const,
      title: 'Protect device settings',
      body: 'Prevent changes to uninstall, accessibility and device admin settings during modes.',
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="glow-border neo-card flex items-start gap-4 rounded-2xl p-5 lg:col-span-2">
        <span className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">Device Owner Active 🛡️</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nuclear Wall holds device owner privileges, which is what makes blocks impossible to bypass or uninstall
            while a mode is running.
          </p>
        </div>
      </section>

      <ChangePin />

      <section className="neo-card flex flex-col gap-4 rounded-2xl border border-border p-5">
        <h2 className="font-semibold">Preferences</h2>
        <ul className="flex flex-col divide-y divide-border">
          {preferences.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.body}</p>
              </div>
              <Toggle checked={state.settings[p.key]} onChange={(v) => updateSettings({ [p.key]: v })} label={p.title} />
            </li>
          ))}
        </ul>
      </section>

      <EnforcementSettings />

      <section className="neo-card flex flex-col gap-4 rounded-2xl border border-destructive/30 p-5 lg:col-span-2">
        <div>
          <h2 className="font-semibold">Reset all data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Restores presets, modes, allowlist and PIN to their defaults. Requires your admin PIN.
          </p>
        </div>
        {resetBlocked && (
          <Notice>🔒 A Commitment Lock or schedule lock is active. Reset is unavailable until it ends.</Notice>
        )}
        <button
          type="button"
          disabled={resetBlocked}
          onClick={() =>
            openModal({
              type: 'pin',
              title: 'Reset all data',
              description: 'This restores everything to defaults and cannot be undone.',
              onConfirm: resetAll,
            })
          }
          className={cn(btnDanger, 'w-fit')}
        >
          Reset all data
        </button>
      </section>
    </div>
  )
}

function EnforcementSettings() {
  const { native, connected, patchNative } = useNative()
  const { openModal } = useModal()
  const [studyLockChoice, setStudyLockChoice] = useState(true)

  const strict = native?.strict
  const studyLockActive = strict?.studyLockActive === true
  const lockDownloads = native?.downloads?.lockDownloads === true
  const studyLockOn = studyLockActive || (strict?.studyLockEnabled ?? studyLockChoice)
  const lockWindow = `${strict?.studyLockStart ?? '19:00'}–${strict?.studyLockEnd ?? '21:00'}`

  const confirmWeakening = (title: string, apply: () => void) =>
    openModal({
      type: 'pin',
      title,
      description: 'Turning this protection off requires your admin PIN.',
      onConfirm: apply,
    })

  const applyDownloads = (enabled: boolean) => {
    patchNative((s) => ({ ...s, downloads: { ...s.downloads, lockDownloads: enabled } }))
    postNativeCommand('downloads_set', { enabled })
  }

  const applyStudyLock = (enabled: boolean) => {
    setStudyLockChoice(enabled)
    patchNative((s) => ({
      ...s,
      strict: s.strict && { ...s.strict, studyLockEnabled: enabled },
    }))
    postNativeCommand('studylock_set', { enabled })
  }

  const rows = [
    {
      key: 'downloads',
      title: 'Lock downloads (documents & images only)',
      body: 'Only documents and images can be downloaded. Everything else is blocked.',
      checked: lockDownloads,
      disabled: !connected,
      onChange: (on: boolean) =>
        on ? applyDownloads(true) : confirmWeakening('Unlock downloads', () => applyDownloads(false)),
    },
    {
      key: 'studylock',
      title: `Study lock ${lockWindow}`,
      body: studyLockActive
        ? 'Running right now. It cannot be turned off until the window ends.'
        : 'Blocks your distracting apps every day during this window.',
      checked: studyLockOn,
      disabled: !connected || studyLockActive,
      onChange: (on: boolean) =>
        on ? applyStudyLock(true) : confirmWeakening('Turn off study lock', () => applyStudyLock(false)),
    },
  ]

  return (
    <section className="neo-card flex flex-col gap-4 rounded-2xl border border-border p-5 lg:col-span-2">
      <h2 className="font-semibold">Enforcement</h2>
      {!connected && (
        <Notice tone="info">These controls are available when Nuclear Wall runs inside the desktop app.</Notice>
      )}
      <ul className="flex flex-col divide-y divide-border">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{r.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.body}</p>
            </div>
            <Toggle checked={r.checked} onChange={r.onChange} label={r.title} disabled={r.disabled} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChangePin() {
  const { state, setPin } = useNuclear()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const id = useId()

  const digits = (v: string) => v.replace(/\D/g, '').slice(0, 8)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (current !== state.pin) return setMessage({ ok: false, text: 'Current PIN is incorrect.' })
    if (next.length < 4) return setMessage({ ok: false, text: 'New PIN must be 4 to 8 digits.' })
    if (next !== confirm) return setMessage({ ok: false, text: 'New PIN and confirmation do not match.' })
    setPin(next)
    setCurrent('')
    setNext('')
    setConfirm('')
    setMessage({ ok: true, text: 'Admin PIN updated.' })
  }

  const fields = [
    { key: 'current', label: 'Current PIN', value: current, set: setCurrent },
    { key: 'next', label: 'New PIN', value: next, set: setNext },
    { key: 'confirm', label: 'Confirm new PIN', value: confirm, set: setConfirm },
  ]

  return (
    <section className="neo-card rounded-2xl border border-border p-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="size-4 text-primary" />
        <h2 className="font-semibold">Admin PIN</h2>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-${f.key}`} className="text-xs font-medium text-muted-foreground">
              {f.label}
            </label>
            <input
              id={`${id}-${f.key}`}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={f.value}
              onChange={(e) => {
                f.set(digits(e.target.value))
                setMessage(null)
              }}
              className={cn(inputClass, 'font-mono tracking-widest')}
            />
          </div>
        ))}
        {message && (
          <p role="status" className={cn('text-sm', message.ok ? 'text-primary' : 'text-destructive')}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={!current || !next || !confirm} className={cn(btnPrimary, 'w-fit')}>
          Update PIN
        </button>
      </form>
    </section>
  )
}
