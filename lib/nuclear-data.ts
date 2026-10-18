import type {
  AppCategory,
  InstalledApp,
  Mode,
  ModeKind,
  NuclearState,
  Preset,
  TimeWindow,
} from './nuclear-types'
import { uid } from './nuclear-utils'

export const INSTALLED_APPS: InstalledApp[] = [
  { id: 'instagram', name: 'Instagram', category: 'social' },
  { id: 'tiktok', name: 'TikTok', category: 'social' },
  { id: 'snapchat', name: 'Snapchat', category: 'social' },
  { id: 'x', name: 'X (Twitter)', category: 'social' },
  { id: 'facebook', name: 'Facebook', category: 'social' },
  { id: 'reddit', name: 'Reddit', category: 'social' },
  { id: 'pinterest', name: 'Pinterest', category: 'social' },
  { id: 'telegram', name: 'Telegram', category: 'social' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'social' },
  { id: 'messenger', name: 'Messenger', category: 'social' },
  { id: 'discord', name: 'Discord', category: 'social' },
  { id: 'youtube', name: 'YouTube', category: 'video' },
  { id: 'netflix', name: 'Netflix', category: 'video' },
  { id: 'twitch', name: 'Twitch', category: 'video' },
  { id: 'steam', name: 'Steam', category: 'games' },
  { id: 'pubg', name: 'PUBG Mobile', category: 'games' },
  { id: 'freefire', name: 'Free Fire', category: 'games' },
  { id: 'roblox', name: 'Roblox', category: 'games' },
  { id: 'minecraft', name: 'Minecraft', category: 'games' },
  { id: 'clash', name: 'Clash of Clans', category: 'games' },
  { id: 'spotify', name: 'Spotify', category: 'music' },
  { id: 'taki', name: 'Taki Academy', category: 'study' },
  { id: 'zoom', name: 'Zoom', category: 'study' },
  { id: 'meet', name: 'Google Meet', category: 'study' },
  { id: 'chatgpt', name: 'ChatGPT', category: 'study' },
  { id: 'gemini', name: 'Gemini', category: 'study' },
  { id: 'claude', name: 'Claude', category: 'study' },
  { id: 'notion', name: 'Notion', category: 'study' },
  { id: 'classroom', name: 'Google Classroom', category: 'study' },
  { id: 'duolingo', name: 'Duolingo', category: 'study' },
  { id: 'khan', name: 'Khan Academy', category: 'study' },
  { id: 'chrome', name: 'Chrome', category: 'tools' },
  { id: 'gmail', name: 'Gmail', category: 'tools' },
  { id: 'calculator', name: 'Calculator', category: 'tools' },
  { id: 'camera', name: 'Camera', category: 'tools' },
  { id: 'clock', name: 'Clock', category: 'tools' },
  { id: 'phone', name: 'Phone', category: 'tools' },
  { id: 'messages', name: 'Messages', category: 'tools' },
]

export const APP_BY_ID = new Map(INSTALLED_APPS.map((a) => [a.id, a]))

export const APP_CATEGORIES: { value: AppCategory; label: string }[] = [
  { value: 'social', label: 'Social' },
  { value: 'video', label: 'Video' },
  { value: 'games', label: 'Games' },
  { value: 'music', label: 'Music' },
  { value: 'study', label: 'Study' },
  { value: 'tools', label: 'Tools' },
]

export const DEFAULT_DOMAINS = [
  'google.com',
  'takiacademy.com',
  'softymeet.com',
  'zoom.us',
  'chatgpt.com',
  'openai.com',
  'gemini.google.com',
  'claude.ai',
  'grok.com',
  'notebooklm.google.com',
  'open.spotify.com',
  'messenger.com',
  'instagram.com',
]

export const QUOTES = [
  'Discipline is choosing what you want most over what you want now.',
  'The wall holds when your willpower does not.',
  'Small focused hours build unreasonable results.',
  'You do not rise to your goals, you fall to your systems.',
  'Distraction is the tax you pay for staying undecided.',
  'Be the person your future self already thanks.',
  'Deep work is a superpower. Protect it like one.',
  'Comfort is a slow leak. Commitment is the patch.',
  'Your phone is a tool. Do not let it become your boss.',
  'Every minute you protect today is a minute you own tomorrow.',
  'Motivation gets you started. Boundaries keep you going.',
  'What you do when nobody is watching writes your story.',
  'Focus is not about saying yes. It is about saying no to a hundred good distractions.',
  'The urge passes in ninety seconds. The regret lasts all day.',
  'Be so locked in that your goals feel inevitable.',
  'You cannot build a legacy in the feed.',
  'One focused hour beats five distracted ones.',
  'Boredom is the doorway to your best ideas.',
  'Starve the distraction. Feed the ambition.',
  'Hard choices now, easy life later. Easy choices now, hard life later.',
  'Your attention is the most valuable thing you own. Spend it like it is.',
  'Winners do not wait for the mood. They build the wall.',
  'Progress is quiet. Distraction is loud. Choose quiet.',
  'The version of you that you want to become is working right now.',
  'Do it tired. Do it bored. Do it anyway.',
  'Consistency beats intensity every single time.',
  'Nobody ever regretted finishing the work first.',
  'A closed tab is a small victory. Stack enough of them.',
  'You are one decision away from a completely different day.',
  'Silence the noise and the signal gets very clear.',
  'Greatness is built in the hours everyone else wastes.',
  'Say no to the scroll. Say yes to the mission.',
  'Pressure builds diamonds. Distraction builds nothing.',
  'The best time to lock in was yesterday. The next best is now.',
  'Your future is built by what you ignore today.',
  'Real rest is earned. Endless scrolling is not rest.',
  'Eyes on the goal. Everything else is background noise.',
  'Strong people do not feel less urge. They just do not obey it.',
  'Own your morning, own your day, own your life.',
  'The grind is lonely, but the results are loud.',
  'Today is a vote for who you will become. Vote well.',
  'Turn off the world. Turn on the work.',
  'Self-control is the quiet engine behind every big win.',
  'Time you waste is time you never get to spend.',
  'Make your future self proud, not just your present self comfortable.',
  'You did not come this far to scroll your way back.',
  'Build the wall. Then build the empire behind it.',
]

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const SOCIAL = [
  'instagram',
  'tiktok',
  'snapchat',
  'x',
  'facebook',
  'reddit',
  'pinterest',
  'discord',
]
const VIDEO = ['youtube', 'netflix', 'twitch']
const GAMES = ['steam', 'pubg', 'freefire', 'roblox', 'minecraft', 'clash']
const STUDY_ALLOWED = ['taki', 'zoom', 'meet', 'chatgpt', 'gemini', 'claude', 'notion']
const ESSENTIALS = ['phone', 'messages', 'calculator']

function win(id: string, start: string, end: string, days: number[]): TimeWindow {
  return { id, start, end, days }
}

export function seedSites(prefix: string) {
  return DEFAULT_DOMAINS.map((domain, i) => ({
    id: `${prefix}-site-${i}`,
    domain,
    rule: 'allow' as const,
  }))
}

function mode(
  id: string,
  name: string,
  emoji: string,
  kind: ModeKind,
  windows: TimeWindow[],
  blockedApps: string[],
  allowedApps: string[],
): Mode {
  return {
    id,
    name,
    emoji,
    kind,
    state: 'scheduled',
    windows,
    blockedApps,
    allowedApps,
    sites: seedSites(id),
    active: false,
    enabled: true,
  }
}

export function createCustomMode(name: string, emoji: string): Mode {
  const id = uid('mode')
  return {
    id,
    name,
    emoji,
    kind: 'custom',
    state: 'scheduled',
    windows: [],
    blockedApps: [],
    allowedApps: [],
    sites: seedSites(id),
    active: false,
    enabled: true,
  }
}

function weeklyModes(): Mode[] {
  return [
    mode('night', 'Night Mode', '🌙', 'night', [win('n0', '00:00', '06:00', ALL_DAYS)], [
      ...SOCIAL,
      ...VIDEO,
      ...GAMES,
    ], ['phone', 'messages', 'clock']),
    mode(
      'game',
      'Game Mode',
      '🎮',
      'game',
      [
        win('g0', '22:00', '00:00', ALL_DAYS),
        win('g1', '16:30', '18:00', [0]),
        win('g2', '17:30', '19:00', [1]),
        win('g3', '18:00', '19:30', [2, 3]),
        win('g4', '16:00', '19:30', [4, 5]),
        win('g5', '17:00', '20:00', [6]),
      ],
      ['tiktok', 'snapchat', 'facebook', 'reddit', 'pinterest'],
      [...GAMES, 'discord', 'spotify', 'messenger', 'youtube', 'phone', 'messages'],
    ),
    mode(
      'lockin',
      'Lock-In Mode',
      '🔒',
      'lockin',
      [
        win('l0', '06:00', '16:30', [0]),
        win('l1', '06:00', '17:30', [1]),
        win('l2', '06:00', '18:00', [2, 3]),
        win('l3', '06:00', '16:00', [4, 5]),
        win('l4', '06:00', '15:00', [6]),
        win('l5', '18:00', '19:30', [0]),
        win('l6', '19:00', '19:30', [1]),
        win('l7', '21:00', '22:00', [0, 1, 2, 3, 4, 5]),
        win('l8', '20:00', '22:00', [6]),
      ],
      [...SOCIAL, ...VIDEO, ...GAMES],
      [
        ...STUDY_ALLOWED,
        'classroom',
        'khan',
        'duolingo',
        'chrome',
        'spotify',
        ...ESSENTIALS,
      ],
    ),
    mode(
      'taki',
      'Taki Mode',
      '📚',
      'taki',
      [win('t0', '19:30', '21:00', [0, 1, 2, 3, 4, 5]), win('t1', '15:00', '17:00', [6])],
      [...SOCIAL, ...VIDEO, ...GAMES],
      [...STUDY_ALLOWED, 'chrome', ...ESSENTIALS],
    ),
  ]
}

function examModes(): Mode[] {
  return weeklyModes().map((m) =>
    m.id === 'game'
      ? { ...m, windows: m.windows.filter((w) => w.id === 'g0' || w.id === 'g5') }
      : m,
  )
}

export function createDefaultState(): NuclearState {
  const standalone: Mode = {
    id: 'aziz',
    name: 'Aziz Mode',
    emoji: '⚡',
    kind: 'custom',
    state: 'always',
    windows: [],
    blockedApps: ['instagram', 'tiktok', 'youtube', 'snapchat', 'reddit', 'discord'],
    allowedApps: ['taki', 'chatgpt', 'phone', 'messages'],
    sites: seedSites('aziz'),
    active: false,
    enabled: true,
  }
  const presets: Preset[] = [
    { id: 'default', name: 'Default Preset', modes: weeklyModes() },
    { id: 'exam', name: 'Exam Week', modes: examModes() },
  ]
  return {
    activity: [],
    pin: '1234',
    commitment: null,
    scheduleEnabled: false,
    scheduleLockEndAt: null,
    activePresetId: 'default',
    presets,
    standalone: [standalone],
    allowlist: ['phone', 'messages', 'calculator', 'camera', 'clock'],
    settings: { notifications: true, hideBlockedIcons: false, strictSettings: true },
  }
}

export const BUILT_IN_KINDS: { kind: Exclude<ModeKind, 'custom'>; label: string; emoji: string; blurb: string }[] = [
  { kind: 'night', label: 'Night Mode', emoji: '🌙', blurb: 'Midnight to 6am, every day' },
  { kind: 'game', label: 'Game Mode', emoji: '🎮', blurb: 'Gaming windows after study' },
  { kind: 'lockin', label: 'Lock-In Mode', emoji: '🔒', blurb: 'Deep focus, study apps only' },
  { kind: 'taki', label: 'Taki Mode', emoji: '📚', blurb: 'Evening Taki Academy sessions' },
]

/** A fresh copy of one of the four built-in modes with its full default windows. */
export function createBuiltInMode(kind: Exclude<ModeKind, 'custom'>): Mode {
  const found = weeklyModes().find((m) => m.kind === kind)
  if (!found) throw new Error(`Unknown built-in mode: ${kind}`)
  return found
}

/** New presets start with the four built-in modes and only the daily Night and Game windows. */
export function createPresetModes(): Mode[] {
  return weeklyModes().map((m) => ({
    ...m,
    windows: m.windows.filter((w) => w.id === 'n0' || w.id === 'g0'),
  }))
}
