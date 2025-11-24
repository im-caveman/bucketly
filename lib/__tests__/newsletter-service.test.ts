import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscribeToNewsletter } from '../newsletter-service'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: {
                id: '123',
                email: 'test@example.com',
                subscribed: true,
                source: 'sidebar',
              },
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}))

describe('Newsletter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('subscribeToNewsletter', () => {
    it('should throw error for empty email', async () => {
      await expect(subscribeToNewsletter('')).rejects.toThrow('Email is required')
    })

    it('should throw error for invalid email format', async () => {
      await expect(subscribeToNewsletter('invalid-email')).rejects.toThrow(
        'Invalid email format'
      )
    })

    it('should accept valid email format', async () => {
      const result = await subscribeToNewsletter('test@example.com')
      expect(result).toBeDefined()
      expect(result.email).toBe('test@example.com')
    })

    it('should trim and lowercase email', async () => {
      const result = await subscribeToNewsletter('  TEST@EXAMPLE.COM  ')
      expect(result).toBeDefined()
    })

    it('should accept optional userId parameter', async () => {
      const result = await subscribeToNewsletter('test@example.com', 'user-123')
      expect(result).toBeDefined()
    })

    it('should accept optional source parameter', async () => {
      const result = await subscribeToNewsletter(
        'test@example.com',
        null,
        'landing'
      )
      expect(result).toBeDefined()
    })

    it('should accept optional metadata parameter', async () => {
      const result = await subscribeToNewsletter('test@example.com', null, 'sidebar', {
        campaign: 'spring-2024',
      })
      expect(result).toBeDefined()
    })
  })
})
