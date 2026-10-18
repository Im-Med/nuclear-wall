import { AppWindow, CalendarRange, LayoutDashboard, Settings, Target } from 'lucide-react'
import type { PageKey } from '@/lib/nuclear-types'

export const NAV_ITEMS: { key: PageKey; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { key: 'schedule', label: 'Weekly Schedule', shortLabel: 'Schedule', icon: CalendarRange },
  { key: 'modes', label: 'Standalone Modes', shortLabel: 'Modes', icon: Target },
  { key: 'apps', label: 'App Lists', shortLabel: 'Apps', icon: AppWindow },
  { key: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
]
