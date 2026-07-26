import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'error' | 'warning' | 'info' | 'success'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  error: 'aa-badge-error',
  warning: 'aa-badge-warning',
  info: 'aa-badge-info',
  success: 'aa-badge-success',
}

export function Badge({ className, variant = 'info', ...props }: BadgeProps) {
  return (
    <span className={cn('aa-badge', variantClasses[variant], className)} {...props} />
  )
}
