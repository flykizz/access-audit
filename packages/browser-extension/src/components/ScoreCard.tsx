import { cn } from '@/lib/utils'
import { t } from '@/core/i18n'

interface ScoreCardProps {
  score: number
  errorCount: number
  warningCount: number
  infoCount: number
  className?: string
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'aa-score-good'
  if (score >= 70) return 'aa-score-fair'
  return 'aa-score-poor'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return t('scoreGood')
  if (score >= 70) return t('scoreFair')
  return t('scorePoor')
}

export function ScoreCard({
  score,
  errorCount,
  warningCount,
  infoCount,
  className,
}: ScoreCardProps) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference
  const scoreClass = getScoreClass(clamped)

  const stats = [
    { key: 'error', label: t('errors'), count: errorCount, dot: '#ef4444' },
    { key: 'warning', label: t('warnings'), count: warningCount, dot: '#f59e0b' },
    { key: 'info', label: t('info'), count: infoCount, dot: '#3b82f6' },
  ]

  return (
    <div className={cn('aa-score-card', scoreClass, className)}>
      <div className="aa-score-circle">
        <svg className="aa-w-full aa-h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="aa-score-circle-inner">
          <span className="aa-score-value">{Math.round(clamped)}</span>
          <span className="aa-score-label">{getScoreLabel(clamped)}</span>
        </div>
      </div>
      <div className="aa-score-stats">
        {stats.map((s) => (
          <div key={s.key} className="aa-score-stat-row">
            <div className="aa-score-stat-left">
              <span
                className="aa-score-dot"
                style={{ backgroundColor: s.dot }}
              />
              <span className="aa-text-sm aa-text-gray-600">{s.label}</span>
            </div>
            <span className="aa-text-sm aa-font-semibold aa-text-gray-900">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
