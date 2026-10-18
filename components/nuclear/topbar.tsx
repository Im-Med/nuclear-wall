'use client'

import { Bell, Menu, Search } from 'lucide-react'

export function Topbar({
  title,
  subtitle,
  onOpenDrawer,
}: {
  title: string
  subtitle: string
  onOpenDrawer: () => void
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
        <label className="relative flex-1 md:w-64 md:flex-none">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search blocks, apps…"
            className="h-9 w-full rounded-lg border border-border bg-sidebar pr-12 pl-9 text-sm shadow-[inset_0_1px_2px_oklch(0_0_0/40%)] placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </label>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
        </button>
      </div>
    </header>
  )
}
