import { useState, FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { t } from '@/core/i18n'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (name: string, email: string, password: string) => Promise<void>
  onSwitchMode: () => void
  className?: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  form?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function AuthForm({ mode, onLogin, onSignup, onSwitchMode, className }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (isSignup && !name.trim()) {
      next.name = t('nameRequired')
    }
    if (!email.trim()) {
      next.email = t('emailRequired')
    } else if (!validateEmail(email)) {
      next.email = t('emailInvalid')
    }
    if (!password) {
      next.password = t('passwordRequired')
    } else if (password.length < 6) {
      next.password = t('passwordTooShort')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return
    setLoading(true)
    setErrors((prev) => ({ ...prev, form: undefined }))
    try {
      if (isSignup) {
        await onSignup(name.trim(), email.trim(), password)
      } else {
        await onLogin(email.trim(), password)
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : t('authFailed'),
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('aa-space-y-4 aa-w-full aa-max-w-sm', className)}
      noValidate
    >
      <div className="aa-text-center aa-mb-2">
        <h2 className="aa-text-xl aa-font-semibold aa-text-gray-900">
          {isSignup ? t('signupTitle') : t('loginTitle')}
        </h2>
        <p className="aa-text-sm aa-text-gray-500 aa-mt-1">
          {isSignup ? t('signupSubtitle') : t('loginSubtitle')}
        </p>
      </div>

      {errors.form && (
        <div
          className="aa-rounded-md aa-bg-error-10 aa-text-sm aa-text-error aa-px-3 aa-py-2"
          style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {isSignup && (
        <Input
          label={t('name')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder={t('namePlaceholder')}
          autoComplete="name"
        />
      )}

      <Input
        label={t('email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <Input
        label={t('password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        autoComplete={isSignup ? 'new-password' : 'current-password'}
      />

      <Button type="submit" className="aa-w-full" loading={loading} disabled={loading}>
        {isSignup ? t('signup') : t('login')}
      </Button>

      <div className="aa-text-center aa-text-sm aa-text-gray-500">
        {isSignup ? t('haveAccount') : t('noAccount')}{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="aa-link aa-font-medium"
        >
          {isSignup ? t('loginAction') : t('signupAction')}
        </button>
      </div>
    </form>
  )
}
