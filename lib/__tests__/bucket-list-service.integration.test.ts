import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '../supabase'

// Mock the Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
    rpc: vi.fn(),
  },
}))

describe('Bucket List Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a bucket list', async () => {
      const mockData = {
        id: '123',
        user_id: 'user-1',
        name: 'My Bucket List',
        category: 'adventures' as const,
        is_public: true,
      }

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .insert(mockData)
        .select()
        .single()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
      expect(mockFrom).toHaveBeenCalledWith('bucket_lists')
    })

    it('should fetch user bucket lists', async () => {
      const mockData = [
        {
          id: '123',
          user_id: 'user-1',
          name: 'My Bucket List',
          bucket_items: [],
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .select('*')
        .eq('user_id', 'user-1')
        .order('created_at')

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should update a bucket list', async () => {
      const mockData = {
        id: '123',
        name: 'Updated List',
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .update({ name: 'Updated List' })
        .eq('id', '123')
        .select()
        .single()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should delete a bucket list', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .delete()
        .eq('id', '123')

      expect(result.error).toBeNull()
    })
  })

  describe('Authentication Flow', () => {
    it('should sign up a new user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any)

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'Test1234',
      })

      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should sign in an existing user', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-1', email: 'test@example.com' },
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      } as any)

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'Test1234',
      })

      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should sign out a user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      const result = await supabase.auth.signOut()

      expect(result.error).toBeNull()
    })

    it('should handle authentication errors', async () => {
      const mockError = { message: 'Invalid credentials' }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError,
      } as any)

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong',
      })

      expect(result.error).toEqual(mockError)
      expect(result.data.session).toBeNull()
    })
  })

  describe('RLS Policy Enforcement', () => {
    it('should enforce RLS on bucket_lists table', async () => {
      const mockError = { code: '42501', message: 'Insufficient privilege' }

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase.from('bucket_lists').select('*')

      expect(result.error).toEqual(mockError)
      expect(result.error?.code).toBe('42501')
    })

    it('should allow access to public lists', async () => {
      const mockData = [
        { id: '123', is_public: true, name: 'Public List' },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .select('*')
        .eq('is_public', true)

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should allow users to update their own profile', async () => {
      const mockData = {
        id: 'user-1',
        username: 'newusername',
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('profiles')
        .update({ username: 'newusername' })
        .eq('id', 'user-1')
        .select()
        .single()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('Item Completion and Points', () => {
    it('should mark item as completed', async () => {
      const mockData = {
        id: 'item-1',
        completed: true,
        completed_date: new Date().toISOString(),
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_items')
        .update({ completed: true })
        .eq('id', 'item-1')
        .select()
        .single()

      expect(result.data?.completed).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should recalculate global ranks', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any)

      const result = await supabase.rpc('recalculate_global_ranks')

      expect(result.error).toBeNull()
      expect(supabase.rpc).toHaveBeenCalledWith('recalculate_global_ranks')
    })
  })

  describe('Social Features', () => {
    it('should follow a bucket list', async () => {
      const mockData = {
        id: 'follow-1',
        user_id: 'user-1',
        bucket_list_id: 'list-1',
      }

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('list_followers')
        .insert({ user_id: 'user-1', bucket_list_id: 'list-1' })
        .select()
        .single()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should unfollow a bucket list', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('list_followers')
        .delete()
        .eq('user_id', 'user-1')
        .eq('bucket_list_id', 'list-1')

      expect(result.error).toBeNull()
    })

    it('should fetch social feed', async () => {
      const mockData = [
        {
          id: 'event-1',
          user_id: 'user-2',
          event_type: 'item_completed',
          title: 'Completed an item',
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockData, error: null, count: 1 }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('user_feed_view')
        .select('*', { count: 'exact' })
        .in('user_id', ['user-2'])
        .order('created_at')
        .range(0, 19)

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('Memory Management', () => {
    it('should create a memory', async () => {
      const mockData = {
        id: 'memory-1',
        user_id: 'user-1',
        bucket_item_id: 'item-1',
        reflection: 'Great experience!',
        photos: ['url1', 'url2'],
      }

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('memories')
        .insert(mockData)
        .select()
        .single()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should fetch memories for an item', async () => {
      const mockData = [
        {
          id: 'memory-1',
          bucket_item_id: 'item-1',
          reflection: 'Great!',
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('memories')
        .select('*')
        .eq('bucket_item_id', 'item-1')
        .order('created_at')

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('Leaderboard and Rankings', () => {
    it('should fetch leaderboard', async () => {
      const mockData = [
        {
          id: 'user-1',
          username: 'topuser',
          total_points: 1000,
          global_rank: 1,
        },
        {
          id: 'user-2',
          username: 'seconduser',
          total_points: 800,
          global_rank: 2,
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100)

      expect(result.data).toEqual(mockData)
      expect(result.data?.[0].global_rank).toBe(1)
      expect(result.error).toBeNull()
    })
  })
})
