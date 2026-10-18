export type PageKey = 'overview' | 'schedule' | 'modes' | 'apps' | 'settings'

export type ModeScope = 'schedule' | 'standalone'
export type ModeKind = 'game' | 'lockin' | 'taki' | 'night' | 'custom'
export type ModeState = 'always' | 'scheduled'
export type AppCategory = 'social' | 'video' | 'games' | 'music' | 'study' | 'tools'

export interface TimeWindow {
  id: string
  /** HH:MM, 24h */
  start: string
  /** HH:MM, 24h. "00:00" with a later-than-midnight start means end of day. */
  end: string
  /** 0 = Monday ... 6 = Sunday */
  days: number[]
}

export interface WebsiteRule {
  id: string
  domain: string
  rule: 'allow' | 'block'
}

export interface Mode {
  id: string
  name: string
  emoji: string
  kind: ModeKind
  state: ModeState
  windows: TimeWindow[]
  blockedApps: string[]
  allowedApps: string[]
  sites: WebsiteRule[]
  /** Only meaningful for standalone modes. */
  active: boolean
  /** Schedule modes only: when false the mode is hidden from the weekly schedule and never runs. */
  enabled: boolean
}

export interface Preset {
  id: string
  name: string
  modes: Mode[]
}

export interface Commitment {
  startedAt: number
  endAt: number
}

export interface AppSettings {
  notifications: boolean
  hideBlockedIcons: boolean
  strictSettings: boolean
}

export interface InstalledApp {
  id: string
  name: string
  category: AppCategory
}

export type ActivityKind = 'info' | 'active' | 'done' | 'lock'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  body: string
  /** Epoch ms */
  at: number
  read: boolean
}

export interface NuclearState {
  /** Newest first, capped in the store. */
  activity: ActivityItem[]
  pin: string
  commitment: Commitment | null
  scheduleEnabled: boolean
  scheduleLockEndAt: number | null
  activePresetId: string
  presets: Preset[]
  standalone: Mode[]
  allowlist: string[]
  settings: AppSettings
}
