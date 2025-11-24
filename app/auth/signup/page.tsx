'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { validateEmail, validatePassword, validateUsername } from '@/lib/validation'
import { handleSupabaseError, formatErrorMessage } from '@/lib/error-handler'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    username?: string
    confirmPassword?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.error
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { user, error } = await signUp(email, password, username)

      if (error) {
        const apiError = handleSupabaseError(error)
        toast.error(formatErrorMessage(apiError))
        return
      }

      if (user) {
        // Check if email confirmation is required
        // If user.email_confirmed_at is null, email confirmation is required
        const emailConfirmationRequired = !user.email_confirmed_at
        
        if (emailConfirmationRequired) {
          toast.info('Account created! Please check your email to confirm your account before logging in.', {
            duration: 8000,
            description: `We sent a confirmation link to ${email}`,
          })
          // Redirect to login page after showing the message
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else {
          toast.success('Account created successfully! Redirecting to your dashboard...', {
            duration: 2000,
          })
          // Redirect to dashboard immediately
          router.push('/dashboard')
          router.refresh() // Force a refresh to update the session
        }
      }
    } catch (error) {
      const apiError = handleSupabaseError(error)
      toast.error(formatErrorMessage(apiError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Start tracking your bucket list goals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
