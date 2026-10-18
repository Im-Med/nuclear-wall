'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { Modals } from './modals'
import { BottomNav } from './bottom-nav'
import { Topbar } from './topbar'
import { OverviewPage } from './overview-page'
import { SchedulePage } from './schedule-page'
import { FocusModesPage } from './focus-modes-page'
import { AppsPage } from './apps-page'
import { SettingsPage } from './settings-page'
import { NAV_ITEMS } from './nav-items'
import { useModal } from './modal-provider'
import { useLocalStorage } from '@/lib/use-local-storage'
import type { PageKey } from '@/lib/nuclear-types'

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview & Commitment',
    subtitle: 'Your wall is up. Seal it with a Commitment Lock.',
  },
  schedule: {
    title: 'Weekly Schedule',
    subtitle: 'Recurring focus blocks that activate automatically.',
  },
  modes: {
    title: 'Standalone Modes',
    subtitle: 'One-tap sessions, independent of your schedule.',
  },
  apps: {
    title: 'App Lists',
    subtitle: 'Manage always-allowed apps and see what is blocked.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Admin PIN, preferences and data.',
  },
}

export function AppShell() {
  const [page, setPage] = useLocalStorage<PageKey>('nw:page', 'overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useLocalStorage<boolean>('nw:sidebar-collapsed', false)

  const { modal } = useModal()

  const navigate = (key: PageKey) => {
    setPage(key)
    setDrawerOpen(false)
  }

  useEffect(() => {
    if (modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return
      const item = NAV_ITEMS[Number(e.key) - 1]
      if (item) setPage(item.key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, setPage])

  return (
    <div className="flex h-dvh overflow-hidden bg-sidebar text-foreground">
      <Modals />
      <Sidebar
        page={page}
        onNavigate={navigate}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:py-2 lg:pr-2">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-border bg-background lg:rounded-2xl lg:border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <Topbar
            title={pageMeta[page].title}
            subtitle={pageMeta[page].subtitle}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
          <main className="relative min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div
              key={page}
              className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-bottom-2 px-4 pb-10 duration-500 md:px-8"
            >
              {page === 'overview' && <OverviewPage onNavigate={setPage} />}
              {page === 'schedule' && <SchedulePage />}
              {page === 'modes' && <FocusModesPage />}
              {page === 'apps' && <AppsPage />}
              {page === 'settings' && <SettingsPage />}
            </div>
          </main>
        </div>
      </div>

      <BottomNav page={page} onNavigate={navigate} />
    </div>
  )
}
