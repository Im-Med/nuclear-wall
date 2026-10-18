'use client'

import { Menu } from 'lucide-react'
import type { PageKey } from '@/lib/nuclear-types'
import { NotificationsMenu } from './notifications-menu'
import { SearchMenu } from './search-menu'

export function Topbar({
  title,
  subtitle,
  onOpenDrawer,
  onNavigate,
}: {
  title: string
  subtitle: string
  onOpenDrawer: () => void
  onNavigate: (page: PageKey) => void
}) {
  return (
    <header className="relative z-10 flex flex-col gap-4 px-4 pt-5 pb-6 md:flex-row md:items-center md:justify-between md:px-8 md:pt-7">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation"
          className="mt-0.5 rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="size-4" />
        </button>
        <div>
          <h1 className="text-balance text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SearchMenu onNavigate={onNavigate} />
        <NotificationsMenu />
      </div>
    </header>
  )
}
