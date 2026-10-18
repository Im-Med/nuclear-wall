'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActivityItem,
  ActivityKind,
  AppSettings,
  Mode,
  ModeKind,
  ModeScope,
  NuclearState,
  Preset,
} from './nuclear-types'
import {
  createBuiltInMode,
  createCustomMode,
  createDefaultState,
  createPresetModes,
} from './nuclear-data'
import { formatCompact, isModeInWindow, uid } from './nuclear-utils'
import { postNativeCommand } from './native-bridge'

const STORAGE_KEY = 'nw:state:v2'
const MAX_ACTIVITY = 30

function logActivity(
  prev: NuclearState,
  kind: ActivityKind,
  title: string,
  body: string,
): ActivityItem[] {
  const item: ActivityItem = { id: uid('act'), kind, title, body, at: Date.now(), read: false }
  return [item, ...(prev.activity ?? [])].slice(0, MAX_ACTIVITY)
}

interface NuclearContextValue {
  state: NuclearState
  hydrated: boolean
  /** Epoch ms, 0 until the client has mounted. */
  now: number
  commitmentActive: boolean
  scheduleLocked: boolean
  standaloneActiveCount: number
  activePreset: Preset
  startCommitment: (durationMs: number) => void
  setScheduleEnabled: (enabled: boolean) => void
  lockSchedule: (durationMs: number) => void
  setActivePreset: (id: string) => void
  addPreset: (name: string) => string
  deletePreset: (id: string) => void
  clearPreset: (id: string) => void
  addBuiltInMode: (kind: Exclude<ModeKind, 'custom'>) => void
  setModeEnabled: (id: string, enabled: boolean) => void
  addMode: (scope: ModeScope, name: string, emoji: string) => string
  saveMode: (scope: ModeScope, mode: Mode) => void
  deleteMode: (scope: ModeScope, id: string) => void
  setStandaloneActive: (id: string, active: boolean) => void
  setAllowlist: (ids: string[]) => void
  setPin: (pin: string) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  resetAll: () => void
  markActivityRead: () => void
  clearActivity: () => void
}

const NuclearContext = createContext<NuclearContextValue | null>(null)

function loadState(defaults: NuclearState): NuclearState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<NuclearState>
    if (!Array.isArray(parsed.presets) || parsed.presets.length === 0) return defaults
    const withEnabled = (m: Mode): Mode => ({ ...m, enabled: m.enabled !== false })
    const merged: NuclearState = {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      presets: parsed.presets.map((p) => ({ ...p, modes: p.modes.map(withEnabled) })),
      standalone: (parsed.standalone ?? defaults.standalone).map(withEnabled),
    }
    if (!merged.presets.some((p) => p.id === merged.activePresetId)) {
      merged.activePresetId = merged.presets[0].id
    }
    return merged
  } catch {
    return defaults
  }
}

export function NuclearProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NuclearState>(createDefaultState)
  const [hydrated, setHydrated] = useState(false)
  const [now, setNow] = useState(0)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    setState((prev) => loadState(prev))
    setNow(Date.now())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage can be unavailable in private mode
    }
  }, [state, hydrated])

  const hasTimer = state.commitment !== null || state.scheduleLockEndAt !== null
  useEffect(() => {
    if (!hydrated) return
    const id = setInterval(() => setNow(Date.now()), hasTimer ? 1000 : 30000)
    return () => clearInterval(id)
  }, [hydrated, hasTimer])

  const commitmentActive = state.commitment !== null && now < state.commitment.endAt
  const scheduleLocked = state.scheduleLockEndAt !== null && now < state.scheduleLockEndAt

  useEffect(() => {
    if (!hydrated || now === 0) return
    setState((prev) => {
      const commitmentDone = prev.commitment !== null && now >= prev.commitment.endAt
      const lockDone = prev.scheduleLockEndAt !== null && now >= prev.scheduleLockEndAt
      if (!commitmentDone && !lockDone) return prev
      let activity = prev.activity
      if (commitmentDone) {
        activity = logActivity(
          { ...prev, activity },
          'done',
          'Commitment complete',
          'Your lock has ended. Nice work staying focused.',
        )
      }
      if (lockDone) {
        activity = logActivity(
          { ...prev, activity },
          'done',
          'Schedule unlocked',
          'The schedule lock has ended. You can edit it again.',
        )
      }
      return {
        ...prev,
        activity,
        commitment: commitmentDone ? null : prev.commitment,
        scheduleLockEndAt: lockDone ? null : prev.scheduleLockEndAt,
      }
    })
  }, [hydrated, now])

  const runningModeIds = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (!hydrated || now === 0) return
    const preset = state.presets.find((p) => p.id === state.activePresetId) ?? state.presets[0]
    const current = new Set(
      state.scheduleEnabled
        ? preset.modes.filter((m) => m.enabled && isModeInWindow(m, now)).map((m) => m.id)
        : [],
    )
    const previous = runningModeIds.current
    runningModeIds.current = current
    if (previous === null) return
    const started = preset.modes.filter((m) => current.has(m.id) && !previous.has(m.id))
    const ended = state.scheduleEnabled
      ? preset.modes.filter((m) => !current.has(m.id) && previous.has(m.id))
      : []
    if (started.length === 0 && ended.length === 0) return
    setState((prev) => {
      let next = prev
      for (const m of started) {
        next = {
          ...next,
          activity: logActivity(next, 'active', `${m.name} started`, 'Scheduled block is now running.'),
        }
      }
      for (const m of ended) {
        next = {
          ...next,
          activity: logActivity(next, 'done', `${m.name} ended`, 'Scheduled block has finished.'),
        }
      }
      return next
    })
  }, [hydrated, now, state.presets, state.activePresetId, state.scheduleEnabled])

  const activePreset = useMemo(
    () => state.presets.find((p) => p.id === state.activePresetId) ?? state.presets[0],
    [state.presets, state.activePresetId],
  )
  const standaloneActiveCount = state.standalone.filter((m) => m.active).length

  const startCommitment = useCallback((durationMs: number) => {
    const startedAt = Date.now()
    setNow(startedAt)
    if (!stateRef.current.scheduleEnabled && durationMs > 0) {
      postNativeCommand('commitment_lock', { durationMinutes: Math.max(1, Math.round(durationMs / 60000)) })
    }
    setState((prev) =>
      prev.scheduleEnabled || durationMs <= 0
        ? prev
        : {
            ...prev,
            commitment: { startedAt, endAt: startedAt + durationMs },
            activity: logActivity(
              prev,
              'lock',
              'Commitment lock started',
              `Locked in for ${formatCompact(durationMs)}. It cannot be undone early.`,
            ),
          },
    )
  }, [])

  const setScheduleEnabled = useCallback((enabled: boolean) => {
    const t = Date.now()
    const current = stateRef.current
    const allowed = enabled
      ? !(current.commitment !== null && t < current.commitment.endAt) && !current.standalone.some((m) => m.active)
      : !(current.scheduleLockEndAt !== null && t < current.scheduleLockEndAt)
    if (allowed) postNativeCommand('schedule_set', { enabled })
    setState((prev) => {
      if (enabled) {
        const blocked =
          (prev.commitment !== null && t < prev.commitment.endAt) ||
          prev.standalone.some((m) => m.active)
        return blocked
          ? prev
          : {
              ...prev,
              scheduleEnabled: true,
              activity: logActivity(prev, 'info', 'Schedule turned on', 'Weekly blocks will now run automatically.'),
            }
      }
      if (prev.scheduleLockEndAt !== null && t < prev.scheduleLockEndAt) return prev
      return {
        ...prev,
        scheduleEnabled: false,
        activity: logActivity(prev, 'info', 'Schedule turned off', 'Weekly blocks are paused.'),
      }
    })
  }, [])

  const lockSchedule = useCallback((durationMs: number) => {
    const t = Date.now()
    setNow(t)
    setState((prev) =>
      prev.scheduleEnabled && durationMs > 0
        ? {
            ...prev,
            scheduleLockEndAt: t + durationMs,
            activity: logActivity(
              prev,
              'lock',
              'Schedule locked',
              `Editing is disabled for ${formatCompact(durationMs)}.`,
            ),
          }
        : prev,
    )
  }, [])

  const setActivePreset = useCallback((id: string) => {
    setState((prev) => (prev.presets.some((p) => p.id === id) ? { ...prev, activePresetId: id } : prev))
  }, [])

  const addPreset = useCallback((name: string) => {
    const id = uid('preset')
    setState((prev) => ({
      ...prev,
      presets: [...prev.presets, { id, name, modes: createPresetModes() }],
      activePresetId: id,
    }))
    return id
  }, [])

  const deletePreset = useCallback((id: string) => {
    setState((prev) => {
      if (prev.presets.length <= 1 || (prev.scheduleLockEndAt !== null && Date.now() < prev.scheduleLockEndAt)) {
        return prev
      }
      const presets = prev.presets.filter((p) => p.id !== id)
      return {
        ...prev,
        presets,
        activePresetId: presets.some((p) => p.id === prev.activePresetId) ? prev.activePresetId : presets[0].id,
      }
    })
  }, [])

  const clearPreset = useCallback((id: string) => {
    setState((prev) =>
      prev.scheduleLockEndAt !== null && Date.now() < prev.scheduleLockEndAt
        ? prev
        : { ...prev, presets: prev.presets.map((p) => (p.id === id ? { ...p, modes: [] } : p)) },
    )
  }, [])

  const addBuiltInMode = useCallback((kind: Exclude<ModeKind, 'custom'>) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.map((p) =>
        p.id === prev.activePresetId && !p.modes.some((m) => m.kind === kind)
          ? { ...p, modes: [...p.modes, createBuiltInMode(kind)] }
          : p,
      ),
    }))
  }, [])

  const setModeEnabled = useCallback((id: string, enabled: boolean) => {
    setState((prev) => {
      if (prev.scheduleLockEndAt !== null && Date.now() < prev.scheduleLockEndAt) return prev
      const target = prev.presets.find((p) => p.id === prev.activePresetId)?.modes.find((m) => m.id === id)
      return {
        ...prev,
        activity: target
          ? logActivity(
              prev,
              'info',
              `${target.name} ${enabled ? 'added to' : 'removed from'} schedule`,
              enabled ? 'It will appear in the weekly schedule.' : 'It is hidden and will not run.',
            )
          : prev.activity,
        presets: prev.presets.map((p) =>
          p.id === prev.activePresetId
            ? { ...p, modes: p.modes.map((m) => (m.id === id ? { ...m, enabled } : m)) }
            : p,
        ),
      }
    })
  }, [])

  const addMode = useCallback((scope: ModeScope, name: string, emoji: string) => {
    const mode = createCustomMode(name, emoji)
    setState((prev) =>
      scope === 'standalone'
        ? { ...prev, standalone: [...prev.standalone, mode] }
        : {
            ...prev,
            presets: prev.presets.map((p) =>
              p.id === prev.activePresetId ? { ...p, modes: [...p.modes, mode] } : p,
            ),
          },
    )
    return mode.id
  }, [])

  const saveMode = useCallback((scope: ModeScope, mode: Mode) => {
    const current = stateRef.current
    const pool =
      scope === 'standalone'
        ? current.standalone
        : (current.presets.find((p) => p.id === current.activePresetId)?.modes ?? [])
    const before = pool.find((m) => m.id === mode.id)
    if (before && JSON.stringify(before.sites) !== JSON.stringify(mode.sites)) {
      const allModes = [...current.presets.flatMap((p) => p.modes), ...current.standalone].map((m) =>
        m.id === mode.id ? mode : m,
      )
      const domains = Array.from(
        new Set(allModes.flatMap((m) => m.sites.filter((s) => s.rule === 'allow').map((s) => s.domain))),
      )
      postNativeCommand('websites_update', {
        websites: domains.map((domain) => ({ domain, action: 'allow' })),
      })
    }
    setState((prev) =>
      scope === 'standalone'
        ? { ...prev, standalone: prev.standalone.map((m) => (m.id === mode.id ? mode : m)) }
        : {
            ...prev,
            presets: prev.presets.map((p) =>
              p.id === prev.activePresetId
                ? { ...p, modes: p.modes.map((m) => (m.id === mode.id ? mode : m)) }
                : p,
            ),
          },
    )
  }, [])

  const deleteMode = useCallback((scope: ModeScope, id: string) => {
    setState((prev) =>
      scope === 'standalone'
        ? { ...prev, standalone: prev.standalone.filter((m) => m.id !== id) }
        : {
            ...prev,
            presets: prev.presets.map((p) =>
              p.id === prev.activePresetId
                ? { ...p, modes: p.modes.filter((m) => m.id !== id) }
                : p,
            ),
          },
    )
  }, [])

  const setStandaloneActive = useCallback((id: string, active: boolean) => {
    const t = Date.now()
    setState((prev) => {
      if (active && prev.scheduleEnabled) return prev
      if (!active && prev.commitment !== null && t < prev.commitment.endAt) return prev
      const target = prev.standalone.find((m) => m.id === id)
      return {
        ...prev,
        activity: target
          ? logActivity(
              prev,
              active ? 'active' : 'done',
              `${target.name} ${active ? 'started' : 'stopped'}`,
              active ? 'Standalone session is running.' : 'Standalone session has ended.',
            )
          : prev.activity,
        standalone: prev.standalone.map((m) => (m.id === id ? { ...m, active } : m)),
      }
    })
  }, [])

  const setAllowlist = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, allowlist: ids }))
  }, [])

  const setPin = useCallback((pin: string) => {
    setState((prev) => ({ ...prev, pin }))
  }, [])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const resetAll = useCallback(() => {
    const fresh = createDefaultState()
    setState({ ...fresh, activity: logActivity(fresh, 'info', 'Data reset', 'All settings and modes were restored to defaults.') })
  }, [])

  const markActivityRead = useCallback(() => {
    setState((prev) =>
      (prev.activity ?? []).every((a) => a.read)
        ? prev
        : { ...prev, activity: prev.activity.map((a) => ({ ...a, read: true })) },
    )
  }, [])

  const clearActivity = useCallback(() => {
    setState((prev) => ((prev.activity ?? []).length === 0 ? prev : { ...prev, activity: [] }))
  }, [])

  const value: NuclearContextValue = {
    state,
    hydrated,
    now,
    commitmentActive,
    scheduleLocked,
    standaloneActiveCount,
    activePreset,
    startCommitment,
    setScheduleEnabled,
    lockSchedule,
    setActivePreset,
    addPreset,
    deletePreset,
    clearPreset,
    addBuiltInMode,
    setModeEnabled,
    addMode,
    saveMode,
    deleteMode,
    setStandaloneActive,
    setAllowlist,
    setPin,
    updateSettings,
    resetAll,
    markActivityRead,
    clearActivity,
  }

  return <NuclearContext.Provider value={value}>{children}</NuclearContext.Provider>
}

export function useNuclear() {
  const ctx = useContext(NuclearContext)
  if (!ctx) throw new Error('useNuclear must be used inside NuclearProvider')
  return ctx
}
