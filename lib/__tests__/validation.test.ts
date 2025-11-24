import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateBio,
  validateListName,
  validateCategory,
  validateItemTitle,
  validatePoints,
  validateDifficulty,
  validateReflection,
  validateFileSize,
  validateImageType,
  validateForm
} from '../validation'

describe('validateEmail', () => {
  it('should validate correct email', () => {
    const result = validateEmail('test@example.com')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty email', () => {
    const result = validateEmail('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Email is required')
  })

  it('should reject invalid email format', () => {
    const result = validateEmail('invalid-email')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid email')
  })
})

describe('validatePassword', () => {
  it('should validate strong password', () => {
    const result = validatePassword('Test1234')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty password', () => {
    const result = validatePassword('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Password is required')
  })

  it('should reject short password', () => {
    const result = validatePassword('Test12')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('8 characters')
  })

  it('should reject password without uppercase', () => {
    const result = validatePassword('test1234')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('uppercase')
  })

  it('should reject password without lowercase', () => {
    const result = validatePassword('TEST1234')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('lowercase')
  })

  it('should reject password without number', () => {
    const result = validatePassword('TestTest')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('number')
  })
})

describe('validateUsername', () => {
  it('should validate correct username', () => {
    const result = validateUsername('test_user-123')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty username', () => {
    const result = validateUsername('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Username is required')
  })

  it('should reject short username', () => {
    const result = validateUsername('ab')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('3 characters')
  })

  it('should reject long username', () => {
    const result = validateUsername('a'.repeat(31))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('30 characters')
  })

  it('should reject username with invalid characters', () => {
    const result = validateUsername('test@user')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('letters, numbers')
  })
})

describe('validateBio', () => {
  it('should validate empty bio', () => {
    const result = validateBio('')
    expect(result.isValid).toBe(true)
  })

  it('should validate short bio', () => {
    const result = validateBio('Hello world')
    expect(result.isValid).toBe(true)
  })

  it('should reject long bio', () => {
    const result = validateBio('a'.repeat(501))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('500 characters')
  })
})

describe('validateListName', () => {
  it('should validate correct list name', () => {
    const result = validateListName('My Bucket List')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty list name', () => {
    const result = validateListName('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('List name is required')
  })

  it('should reject short list name', () => {
    const result = validateListName('ab')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('3 characters')
  })

  it('should reject long list name', () => {
    const result = validateListName('a'.repeat(101))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('100 characters')
  })
})

describe('validateCategory', () => {
  it('should validate correct category', () => {
    const result = validateCategory('adventures')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty category', () => {
    const result = validateCategory('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Category is required')
  })

  it('should reject invalid category', () => {
    const result = validateCategory('invalid')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid category')
  })
})

describe('validateItemTitle', () => {
  it('should validate correct item title', () => {
    const result = validateItemTitle('Visit Paris')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty item title', () => {
    const result = validateItemTitle('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Item title is required')
  })

  it('should reject short item title', () => {
    const result = validateItemTitle('ab')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('3 characters')
  })

  it('should reject long item title', () => {
    const result = validateItemTitle('a'.repeat(201))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('200 characters')
  })
})

describe('validatePoints', () => {
  it('should validate correct points', () => {
    const result = validatePoints(50)
    expect(result.isValid).toBe(true)
  })

  it('should reject points below minimum', () => {
    const result = validatePoints(0)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 1')
  })

  it('should reject points above maximum', () => {
    const result = validatePoints(1001)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('no more than 1000')
  })

  it('should reject non-integer points', () => {
    const result = validatePoints(50.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('whole number')
  })
})

describe('validateDifficulty', () => {
  it('should validate correct difficulty', () => {
    const result = validateDifficulty('medium')
    expect(result.isValid).toBe(true)
  })

  it('should validate empty difficulty', () => {
    const result = validateDifficulty('')
    expect(result.isValid).toBe(true)
  })

  it('should reject invalid difficulty', () => {
    const result = validateDifficulty('extreme')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('valid difficulty')
  })
})

describe('validateReflection', () => {
  it('should validate correct reflection', () => {
    const result = validateReflection('This was an amazing experience!')
    expect(result.isValid).toBe(true)
  })

  it('should reject empty reflection', () => {
    const result = validateReflection('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reflection is required')
  })

  it('should reject short reflection', () => {
    const result = validateReflection('Short')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('10 characters')
  })

  it('should reject long reflection', () => {
    const result = validateReflection('a'.repeat(5001))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('5000 characters')
  })
})

describe('validateFileSize', () => {
  it('should validate file within size limit', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
    
    const result = validateFileSize(file, 5)
    expect(result.isValid).toBe(true)
  })

  it('should reject file exceeding size limit', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }) // 6MB
    
    const result = validateFileSize(file, 5)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('5MB')
  })
})

describe('validateImageType', () => {
  it('should validate JPEG image', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const result = validateImageType(file)
    expect(result.isValid).toBe(true)
  })

  it('should validate PNG image', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const result = validateImageType(file)
    expect(result.isValid).toBe(true)
  })

  it('should reject non-image file', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const result = validateImageType(file)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('image')
  })
})

describe('validateForm', () => {
  it('should return valid for all valid fields', () => {
    const validations = {
      email: { isValid: true },
      password: { isValid: true }
    }
    const result = validateForm(validations)
    
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('should return errors for invalid fields', () => {
    const validations = {
      email: { isValid: false, error: 'Invalid email' },
      password: { isValid: true }
    }
    const result = validateForm(validations)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Invalid email')
  })

  it('should return multiple errors', () => {
    const validations = {
      email: { isValid: false, error: 'Invalid email' },
      password: { isValid: false, error: 'Weak password' }
    }
    const result = validateForm(validations)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Invalid email')
    expect(result.errors.password).toBe('Weak password')
  })
})
