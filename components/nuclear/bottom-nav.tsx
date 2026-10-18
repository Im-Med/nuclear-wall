'use client'

import type { PageKey } from '@/lib/nuclear-types'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

export function BottomNav({
  page,
  onNavigate,
}: {
  page: PageKey
  onNavigate: (key: PageKey) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ key, shortLabel, icon: Icon }) => {
          const active = page === key
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-all duration-300',
                    active ? 'opacity-100 shadow-[0_0_12px_var(--primary)]' : 'opacity-0',
                  )}
                />
                <Icon
                  className={cn(
                    'size-5 transition-all',
                    active ? 'text-primary drop-shadow-[0_0_8px_var(--primary)]' : 'group-hover:scale-105',
                  )}
                />
                <span>{shortLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
