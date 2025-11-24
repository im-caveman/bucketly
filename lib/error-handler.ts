import { PostgrestError } from '@supabase/supabase-js'

export interface ApiError {
  code: string
  message: string
  details?: string
  hint?: string
}

/**
 * Maps Supabase error codes to user-friendly error messages
 */
export function handleSupabaseError(error: any): ApiError {
  // Handle PostgrestError
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return {
          code: '404',
          message: 'Resource not found',
          details: error.details,
          hint: error.hint
        }

      case '23505':
        return {
          code: '409',
          message: 'This resource already exists',
          details: extractDuplicateField(error.details),
          hint: 'Please use a different value'
        }

      case '23503':
        return {
          code: '409',
          message: 'Cannot perform this action due to related data',
          details: error.details,
          hint: 'Please remove related items first'
        }

      case '42501':
        return {
          code: '403',
          message: 'You do not have permission to perform this action',
          details: error.details
        }

      case 'PGRST301':
        return {
          code: '401',
          message: 'Your session has expired',
          hint: 'Please log in again'
        }

      case '22001':
        return {
          code: '400',
          message: 'Input value is too long',
          details: error.details,
          hint: 'Please shorten your input'
        }

      case '23514':
        return {
          code: '400',
          message: 'Input value does not meet requirements',
          details: extractConstraintViolation(error.details),
          hint: error.hint
        }

      default:
        return {
          code: error.code,
          message: error.message || 'An unexpected error occurred',
          details: error.details,
          hint: error.hint
        }
    }
  }

  // Handle authentication errors
  if (error?.message) {
    if (error.message.includes('Invalid login credentials')) {
      return {
        code: '401',
        message: 'Invalid email or password',
        hint: 'Please check your credentials and try again'
      }
    }

    if (error.message.includes('Email not confirmed')) {
      return {
        code: '401',
        message: 'Please verify your email address',
        hint: 'Check your inbox for a verification email'
      }
    }

    if (error.message.includes('User already registered')) {
      return {
        code: '409',
        message: 'An account with this email already exists',
        hint: 'Try logging in or use password reset'
      }
    }

    if (error.message.includes('Password should be at least')) {
      return {
        code: '400',
        message: 'Password is too weak',
        hint: 'Password must be at least 6 characters'
      }
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      code: '503',
      message: 'Unable to connect to the server',
      hint: 'Please check your internet connection and try again'
    }
  }

  // Default error
  return {
    code: '500',
    message: error?.message || 'An unexpected error occurred',
    details: error?.details,
    hint: 'Please try again later'
  }
}

/**
 * Extracts the duplicate field name from PostgreSQL error details
 */
function extractDuplicateField(details?: string): string | undefined {
  if (!details) return undefined

  const match = details.match(/Key \(([^)]+)\)/)
  if (match && match[1]) {
    return `A record with this ${match[1]} already exists`
  }

  return details
}

/**
 * Extracts constraint violation details from PostgreSQL error
 */
function extractConstraintViolation(details?: string): string | undefined {
  if (!details) return undefined

  // Extract constraint name and make it more readable
  if (details.includes('username_length')) {
    return 'Username must be between 3 and 30 characters'
  }
  if (details.includes('bio_length')) {
    return 'Bio must be under 500 characters'
  }
  if (details.includes('name_length')) {
    return 'Name must be between 3 and 100 characters'
  }
  if (details.includes('title_length')) {
    return 'Title must be between 3 and 200 characters'
  }
  if (details.includes('reflection_length')) {
    return 'Reflection must be between 10 and 5000 characters'
  }
  if (details.includes('points_range')) {
    return 'Points must be between 1 and 1000'
  }
  if (details.includes('valid_category')) {
    return 'Please select a valid category'
  }
  if (details.includes('valid_difficulty')) {
    return 'Please select a valid difficulty level'
  }
  if (details.includes('valid_event_type')) {
    return 'Invalid event type'
  }

  return details
}

/**
 * Logs errors to console in development and to error tracking service in production
 */
export function logError(error: any, context?: Record<string, any>): void {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    console.error('Error occurred:', {
      error: error instanceof Error ? {
        ...error,
        message: error.message,
        stack: error.stack
      } : error,
      context,
      timestamp: new Date().toISOString()
    })
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { extra: context })
    console.error('Error:', error.message || error)
  }
}

/**
 * Creates a user-friendly error message from an ApiError
 */
export function formatErrorMessage(error: ApiError): string {
  let message = error.message

  if (error.details) {
    message += ` - ${error.details}`
  }

  if (error.hint) {
    message += `. ${error.hint}`
  }

  return message
}

/**
 * Checks if an error is a specific type
 */
export function isErrorType(error: any, code: string): boolean {
  const apiError = handleSupabaseError(error)
  return apiError.code === code
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (err) {
    const apiError = handleSupabaseError(err)
    logError(err, { apiError })

    if (onError) {
      onError(apiError)
    }

    return { data: null, error: apiError }
  }
}
