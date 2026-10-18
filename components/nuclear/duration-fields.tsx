'use client'

import { useId } from 'react'
import { inputClass } from './ui-bits'

export interface Duration {
  days: number
  hours: number
  minutes: number
}

export const EMPTY_DURATION: Duration = { days: 0, hours: 0, minutes: 0 }

export function durationToMs(d: Duration) {
  return ((d.days * 24 + d.hours) * 60 + d.minutes) * 60 * 1000
}

const clamp = (raw: string, max: number) => {
  const n = parseInt(raw, 10)
  return Number.isNaN(n) ? 0 : Math.min(max, Math.max(0, n))
}

export function DurationFields({
  value,
  onChange,
}: {
  value: Duration
  onChange: (next: Duration) => void
}) {
  const id = useId()
  const fields: { key: keyof Duration; label: string; max: number }[] = [
    { key: 'days', label: 'Days', max: 30 },
    { key: 'hours', label: 'Hours', max: 23 },
    { key: 'minutes', label: 'Minutes', max: 59 },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-${f.key}`} className="text-xs font-medium text-muted-foreground">
            {f.label}
          </label>
          <input
            id={`${id}-${f.key}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={f.max}
            value={value[f.key]}
            onChange={(e) => onChange({ ...value, [f.key]: clamp(e.target.value, f.max) })}
            className={`${inputClass} text-center font-mono text-base`}
          />
        </div>
      ))}
    </div>
  )
}
