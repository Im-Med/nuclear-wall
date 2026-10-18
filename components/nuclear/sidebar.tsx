'use client'

import { ChevronsLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShieldLogo } from './shield-logo'
import { NAV_ITEMS } from './nav-items'
import { useNuclear } from '@/lib/nuclear-store'
import type { PageKey } from '@/lib/nuclear-types'

export type { PageKey }

export function Sidebar({
  page,
  onNavigate,
  drawerOpen,
  onCloseDrawer,
  collapsed,
  onToggleCollapsed,
}: {
  page: PageKey
  onNavigate: (key: PageKey) => void
  drawerOpen: boolean
  onCloseDrawer: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <>
      <div
        aria-hidden
        onClick={onCloseDrawer}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        aria-label="Primary"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-[transform,width] duration-300 ease-out lg:static lg:translate-x-0 lg:border-r-0',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
        )}
      >
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="relative size-9 shrink-0">
            <span className="absolute inset-1 rounded-full bg-primary/35 blur-md" aria-hidden />
            <ShieldLogo className="relative" />
          </div>
          <div className={cn('min-w-0 flex-1 transition-opacity', collapsed && 'lg:hidden')}>
            <p className="truncate text-sm font-semibold tracking-tight">Nuclear Wall</p>
            <p className="truncate text-xs text-muted-foreground">Focus Fortress</p>
          </div>
          <button
            type="button"
            onClick={onCloseDrawer}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
          <p
            className={cn(
              'px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70',
              collapsed && 'lg:sr-only',
            )}
          >
            Workspace
          </p>
          {NAV_ITEMS.map(({ key, label, icon: Icon }, i) => {
            const active = page === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-accent text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/6%)]'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                  collapsed && 'lg:justify-center lg:px-0',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)] transition-all',
                    active ? 'opacity-100' : 'h-2 opacity-0 group-hover:opacity-50',
                  )}
                />
                <Icon
                  className={cn(
                    'size-[18px] shrink-0 transition-colors',
                    active && 'text-primary drop-shadow-[0_0_6px_var(--primary)]',
                  )}
                />
                <span className={cn('flex-1 text-left', collapsed && 'lg:hidden')}>{label}</span>
                <kbd
                  className={cn(
                    'rounded border border-border bg-background/50 px-1.5 font-mono text-[10px] text-muted-foreground',
                    collapsed && 'lg:hidden',
                  )}
                >
                  {i + 1}
                </kbd>
              </button>
            )
          })}

          <WallStatus collapsed={collapsed} />
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground lg:flex',
              collapsed && 'lg:justify-center lg:px-0',
            )}
          >
            <ChevronsLeft className={cn('size-[18px] shrink-0 transition-transform', collapsed && 'rotate-180')} />
            <span className={cn(collapsed && 'lg:hidden')}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function WallStatus({ collapsed }: { collapsed: boolean }) {
  const { state, commitmentActive, standaloneActiveCount, activePreset } = useNuclear()
  const active = commitmentActive || state.scheduleEnabled || standaloneActiveCount > 0

  const summary = commitmentActive
    ? 'Commitment Lock engaged. Lock-In Mode cannot be lifted.'
    : state.scheduleEnabled
      ? `Weekly Schedule is running the ${activePreset.name}.`
      : standaloneActiveCount > 0
        ? `${standaloneActiveCount} standalone mode${standaloneActiveCount === 1 ? '' : 's'} active.`
        : 'No modes running. Start a commitment, schedule or standalone mode.'

  return (
    <div className={cn('glow-border neo-card mt-6 rounded-xl p-4', collapsed && 'lg:hidden')}>
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          {active && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />}
          <span className={cn('relative inline-flex size-2 rounded-full', active ? 'bg-primary' : 'bg-muted-foreground')} />
        </span>
        <p className={cn('text-xs font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
          {active ? 'Wall active' : 'Wall idle'}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  )
}
