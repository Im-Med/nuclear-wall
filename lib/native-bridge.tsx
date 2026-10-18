'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface NativeCatalogApp {
  name: string
  processes: string[]
  installPath: string
  /** Data-URL PNG, may be an empty string. */
  icon: string
  blocked: boolean
}

export interface NativeWebsite {
  domain?: string
  host?: string
  url?: string
  action?: string
  allow?: boolean
}

export interface NativeStrict {
  studyLockActive: boolean
  studyLockStart: string
  studyLockEnd: string
  /** Optional: whether the daily study lock is switched on at all (not just inside its window). */
  studyLockEnabled?: boolean
  catalog: NativeCatalogApp[]
}

export interface NativeState {
  commitment?: {
    active: boolean
    mode: string
    endAt: number
    remainingSeconds: number
    isHardLock: boolean
  }
  scheduleEnabled?: boolean
  blockedApps?: string[]
  websites?: NativeWebsite[]
  enforcement?: 'active' | 'idle'
  strict?: NativeStrict
  downloads?: { lockDownloads: boolean }
}

interface NuclearWallBridge {
  postCommand?: (type: string, payload?: Record<string, unknown>) => void
  onState?: (state: NativeState) => void
}

declare global {
  interface Window {
    NuclearWall?: NuclearWallBridge
  }
}

export const NATIVE_STATE_EVENT = 'nuclearwall-state'

export function postNativeCommand(type: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.NuclearWall?.postCommand?.(type, payload)
}

function parseNativeState(raw: unknown): NativeState | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  return value && typeof value === 'object' ? (value as NativeState) : null
}

interface FocusRequest {
  name: string
  nonce: number
}

interface NativeContextValue {
  /** Latest state pushed by the desktop shell, or null when running outside it. */
  native: NativeState | null
  connected: boolean
  /** Optimistically update local state until the next push from the shell arrives. */
  patchNative: (update: (state: NativeState) => NativeState) => void
  focusRequest: FocusRequest | null
  requestAppFocus: (name: string) => void
  clearFocusRequest: () => void
}

const NativeContext = createContext<NativeContextValue | null>(null)

export function NativeBridgeProvider({ children }: { children: ReactNode }) {
  const [native, setNative] = useState<NativeState | null>(null)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)

  useEffect(() => {
    const accept = (raw: unknown) => {
      const next = parseNativeState(raw)
      if (next) setNative(next)
    }
    const onEvent = (e: Event) => accept((e as CustomEvent).detail)
    document.addEventListener(NATIVE_STATE_EVENT, onEvent)

    const bridge = window.NuclearWall
    const previousHandler = bridge?.onState
    const handler = (state: NativeState) => {
      previousHandler?.(state)
      accept(state)
    }
    if (bridge) bridge.onState = handler

    return () => {
      document.removeEventListener(NATIVE_STATE_EVENT, onEvent)
      if (bridge && bridge.onState === handler) bridge.onState = previousHandler
    }
  }, [])

  const patchNative = useCallback((update: (state: NativeState) => NativeState) => {
    setNative((prev) => (prev ? update(prev) : prev))
  }, [])

  const requestAppFocus = useCallback((name: string) => {
    setFocusRequest((prev) => ({ name, nonce: (prev?.nonce ?? 0) + 1 }))
  }, [])

  const clearFocusRequest = useCallback(() => setFocusRequest(null), [])

  const value = useMemo<NativeContextValue>(
    () => ({
      native,
      connected: native !== null,
      patchNative,
      focusRequest,
      requestAppFocus,
      clearFocusRequest,
    }),
    [native, patchNative, focusRequest, requestAppFocus, clearFocusRequest],
  )

  return <NativeContext.Provider value={value}>{children}</NativeContext.Provider>
}

export function useNative() {
  const ctx = useContext(NativeContext)
  if (!ctx) throw new Error('useNative must be used inside NativeBridgeProvider')
  return ctx
}
