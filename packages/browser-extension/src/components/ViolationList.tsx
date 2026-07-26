import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { t } from '@/core/i18n'
import type { Violation } from '@/core/types'

type Level = 'error' | 'warning' | 'info'
type Filter = 'all' | 'error' | 'warning' | 'info'

interface ViolationListProps {
  violations: Violation[]
  onSelect: (violation: Violation, nodeIndex: number) => void
  filter: Filter
  className?: string
}

const impactOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
}

function getImpactLevel(impact: string): Level {
  if (impact === 'critical' || impact === 'serious') return 'error'
  if (impact === 'moderate') return 'warning'
  return 'info'
}

function ImpactIcon({ level }: { level: Level }) {
  switch (level) {
    case 'error':
      return (
        <svg className="aa-w-4 aa-h-4 aa-text-error" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )
    case 'warning':
      return (
        <svg className="aa-w-4 aa-h-4 aa-text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      )
    case 'info':
      return (
        <svg className="aa-w-4 aa-h-4 aa-text-info" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      )
  }
}

export function ViolationList({ violations, onSelect, filter, className }: ViolationListProps) {
  const filtered = useMemo(() => {
    const list = violations.filter((v) => {
      if (filter === 'all') return true
      return getImpactLevel(v.impact) === filter
    })
    return [...list].sort(
      (a, b) => (impactOrder[a.impact] ?? 99) - (impactOrder[b.impact] ?? 99)
    )
  }, [violations, filter])

  if (filtered.length === 0) {
    return (
      <div className={cn('aa-empty-state', className)}>
        <svg
          className="aa-empty-state-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="aa-empty-state-title">{t('noViolations')}</p>
        <p className="aa-empty-state-hint">{t('noViolationsHint')}</p>
      </div>
    )
  }

  return (
    <ul className={cn('aa-violation-list', className)}>
      {filtered.map((v, idx) => {
        const level = getImpactLevel(v.impact)
        const nodeCount = v.nodes?.length ?? 0
        return (
          <li key={`${v.id}-${idx}`}>
            <button
              type="button"
              onClick={() => onSelect(v, 0)}
              className="aa-violation-item"
            >
              <div className="aa-violation-icon">
                <ImpactIcon level={level} />
              </div>
              <div className="aa-violation-body">
                <div className="aa-violation-header">
                  <span className="aa-violation-title">
                    {v.help || v.description}
                  </span>
                  <span className="aa-violation-count">
                    {nodeCount} {t('elements')}
                  </span>
                </div>
                <div className="aa-violation-meta-row">
                  <code className="aa-violation-code">
                    {v.id}
                  </code>
                  {v.impact && (
                    <span className="aa-text-xs aa-text-gray-400 aa-capitalize">{v.impact}</span>
                  )}
                </div>
              </div>
              <svg
                className="aa-violation-chevron"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
