'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Updater<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: Updater<T>) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue)
  const keyRef = useRef(key)
  keyRef.current = key

  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialValue
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
    // initialValue is intentionally stale-by-ref; we only want the value at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    setValue(read())
  }, [read])

  const update = useCallback((next: Updater<T>) => {
    setValue((prev) => {
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(resolved))
      } catch {
        // storage may be unavailable (private mode); fail silently
      }
      return resolved
    })
  }, [])

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(keyRef.current)
    } catch {
      // ignore
    }
    setValue(initialValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== keyRef.current) return
      try {
        setValue(e.newValue === null ? initialValue : (JSON.parse(e.newValue) as T))
      } catch {
        // ignore malformed
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [value, update, remove]
}
