import { forwardRef, useId, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? (label ? generatedId : undefined)
    return (
      <div className="aa-form-group">
        {label && (
          <label htmlFor={inputId} className="aa-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn('aa-input', error && 'aa-input-error', className)}
          {...props}
        />
        {error && <p className="aa-error-message">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
