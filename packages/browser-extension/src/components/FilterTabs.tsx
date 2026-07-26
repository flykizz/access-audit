import { cn } from '@/lib/utils'
import { t } from '@/core/i18n'

type Filter = 'all' | 'error' | 'warning' | 'info'

interface FilterTabsProps {
  active: string
  onChange: (filter: Filter) => void
  counts: { all: number; error: number; warning: number; info: number }
  className?: string
}

const tabs: Array<{ key: Filter; dot?: string }> = [
  { key: 'all' },
  { key: 'error', dot: '#ef4444' },
  { key: 'warning', dot: '#f59e0b' },
  { key: 'info', dot: '#3b82f6' },
]

function getLabelKey(key: Filter): string {
  if (key === 'all') return 'all'
  return `${key}Count`
}

export function FilterTabs({ active, onChange, counts, className }: FilterTabsProps) {
  return (
    <div
      className={cn('aa-filter-tabs', className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key
        const labelKey = getLabelKey(tab.key)
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn('aa-filter-tab', isActive && 'aa-filter-tab-active')}
          >
            {tab.dot && (
              <span
                className="aa-filter-tab-dot"
                style={{ backgroundColor: tab.dot }}
              />
            )}
            <span>{t(labelKey)}</span>
            <span
              className={cn(
                'aa-filter-tab-count',
                isActive ? 'aa-filter-tab-count-active' : 'aa-filter-tab-count-inactive'
              )}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
