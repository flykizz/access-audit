import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  label?: string
  stage?: string
  className?: string
}

export function ProgressBar({ value, label, stage, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('aa-progress', className)}>
      {(label || stage) && (
        <div className="aa-flex aa-items-center aa-justify-between aa-mb-1.5">
          <span className="aa-text-xs aa-font-medium aa-text-gray-600">{label}</span>
          {stage && <span className="aa-text-xs aa-text-gray-400">{stage}</span>}
        </div>
      )}
      <div
        className="aa-progress-bar"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="aa-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="aa-progress-text">{Math.round(clamped)}%</div>
    </div>
  )
}
