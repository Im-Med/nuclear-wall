import type { Mode, TimeWindow } from './nuclear-types'

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function windowStart(w: TimeWindow) {
  return toMinutes(w.start)
}

export function windowEnd(w: TimeWindow) {
  const end = toMinutes(w.end)
  return end === 0 && toMinutes(w.start) > 0 ? 1440 : end
}

export function isWindowValid(w: TimeWindow) {
  return w.days.length > 0 && windowEnd(w) > windowStart(w)
}

export function format12(totalMinutes: number) {
  const mins = totalMinutes % 1440
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const suffix = h24 >= 12 ? 'pm' : 'am'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

export function formatRange(w: TimeWindow) {
  return `${format12(windowStart(w))} - ${format12(windowEnd(w))}`
}

export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function formatCompact(ms: number) {
  const { days, hours, minutes, seconds } = splitDuration(ms)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function normalizeDomain(input: string): string | null {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(cleaned)
    ? cleaned
    : null
}

export interface ScheduleEntry {
  key: string
  modeId: string
  name: string
  emoji: string
  kind: Mode['kind']
  start: number
  end: number
  allDay: boolean
}

/** Flattens every mode's windows into one sorted list for a single weekday. */
export function entriesForDay(modes: Mode[], day: number): ScheduleEntry[] {
  const entries: ScheduleEntry[] = []
  for (const mode of modes) {
    if (!mode.enabled) continue
    if (mode.state === 'always') {
      entries.push({
        key: `${mode.id}-always`,
        modeId: mode.id,
        name: mode.name,
        emoji: mode.emoji,
        kind: mode.kind,
        start: 0,
        end: 1440,
        allDay: true,
      })
      continue
    }
    for (const w of mode.windows) {
      if (!w.days.includes(day) || !isWindowValid(w)) continue
      entries.push({
        key: `${mode.id}-${w.id}`,
        modeId: mode.id,
        name: mode.name,
        emoji: mode.emoji,
        kind: mode.kind,
        start: windowStart(w),
        end: windowEnd(w),
        allDay: false,
      })
    }
  }
  return entries.sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start - b.start)
}

/** Monday-first weekday index and minutes since midnight for a timestamp. */
export function localClock(ms: number) {
  const d = new Date(ms)
  return { day: (d.getDay() + 6) % 7, minutes: d.getHours() * 60 + d.getMinutes() }
}

export function isModeInWindow(mode: Mode, ms: number) {
  if (!mode.enabled) return false
  if (mode.state === 'always') return true
  const { day, minutes } = localClock(ms)
  return mode.windows.some(
    (w) => w.days.includes(day) && minutes >= windowStart(w) && minutes < windowEnd(w),
  )
}
