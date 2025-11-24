import { describe, it, expect, vi } from 'vitest'
import {
  handleSupabaseError,
  formatErrorMessage,
  isErrorType,
  withErrorHandling,
  type ApiError
} from '../error-handler'

describe('handleSupabaseError', () => {
  it('should handle PGRST116 (not found) error', () => {
    const error = { code: 'PGRST116', details: 'Resource not found' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('404')
    expect(result.message).toBe('Resource not found')
  })

  it('should handle 23505 (duplicate) error', () => {
    const error = { 
      code: '23505', 
      details: 'Key (username)=(testuser) already exists' 
    }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('409')
    expect(result.message).toBe('This resource already exists')
    expect(result.details).toContain('username')
  })

  it('should handle 42501 (permission) error', () => {
    const error = { code: '42501' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('403')
    expect(result.message).toBe('You do not have permission to perform this action')
  })

  it('should handle PGRST301 (JWT expired) error', () => {
    const error = { code: 'PGRST301' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('401')
    expect(result.message).toBe('Your session has expired')
  })

  it('should handle invalid login credentials', () => {
    const error = { message: 'Invalid login credentials' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('401')
    expect(result.message).toBe('Invalid email or password')
  })

  it('should handle user already registered', () => {
    const error = { message: 'User already registered' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('409')
    expect(result.message).toBe('An account with this email already exists')
  })

  it('should handle network errors', () => {
    const error = { name: 'NetworkError' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('503')
    expect(result.message).toBe('Unable to connect to the server')
  })

  it('should handle unknown errors', () => {
    const error = { message: 'Something went wrong' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('500')
    expect(result.message).toBe('Something went wrong')
  })

  it('should handle constraint violations', () => {
    const error = { 
      code: '23514', 
      details: 'Failing row contains username_length constraint' 
    }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('400')
    expect(result.details).toContain('Username must be between 3 and 30 characters')
  })
})

describe('formatErrorMessage', () => {
  it('should format error with message only', () => {
    const error: ApiError = { code: '404', message: 'Not found' }
    const result = formatErrorMessage(error)
    
    expect(result).toBe('Not found')
  })

  it('should format error with message and details', () => {
    const error: ApiError = { 
      code: '409', 
      message: 'Duplicate', 
      details: 'Username exists' 
    }
    const result = formatErrorMessage(error)
    
    expect(result).toBe('Duplicate - Username exists')
  })

  it('should format error with message, details, and hint', () => {
    const error: ApiError = { 
      code: '400', 
      message: 'Invalid input', 
      details: 'Too long',
      hint: 'Use shorter text'
    }
    const result = formatErrorMessage(error)
    
    expect(result).toBe('Invalid input - Too long. Use shorter text')
  })
})

describe('isErrorType', () => {
  it('should return true for matching error code', () => {
    const error = { code: 'PGRST116' }
    const result = isErrorType(error, '404')
    
    expect(result).toBe(true)
  })

  it('should return false for non-matching error code', () => {
    const error = { code: 'PGRST116' }
    const result = isErrorType(error, '500')
    
    expect(result).toBe(false)
  })
})

describe('withErrorHandling', () => {
  it('should return data on success', async () => {
    const fn = async () => 'success'
    const result = await withErrorHandling(fn)
    
    expect(result.data).toBe('success')
    expect(result.error).toBeNull()
  })

  it('should return error on failure', async () => {
    const fn = async () => {
      throw { code: 'PGRST116' }
    }
    const result = await withErrorHandling(fn)
    
    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull()
    expect(result.error?.code).toBe('404')
  })

  it('should call onError callback on failure', async () => {
    const fn = async () => {
      throw { code: 'PGRST116' }
    }
    const onError = vi.fn()
    await withErrorHandling(fn, onError)
    
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: '404' })
    )
  })
})
