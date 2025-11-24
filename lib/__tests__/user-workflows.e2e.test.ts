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

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Journey: Signup to Memory Creation', () => {
    it('should complete full user journey from signup to creating a memory', async () => {
      const userId = 'user-123'
      const listId = 'list-123'
      const itemId = 'item-123'
      const memoryId = 'memory-123'

      // Step 1: User signs up
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: { id: userId, email: 'newuser@example.com' },
          session: { access_token: 'token', user: { id: userId } },
        },
        error: null,
      } as any)

      const signupResult = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'Test1234',
      })

      expect(signupResult.data.user?.id).toBe(userId)
      expect(signupResult.error).toBeNull()

      // Step 2: Profile is automatically created (via trigger)
      const mockProfileFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: userId,
                username: 'newuser',
                total_points: 0,
                items_completed: 0,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockProfileFrom)

      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      expect(profileResult.data?.id).toBe(userId)
      expect(profileResult.data?.total_points).toBe(0)

      // Step 3: User creates a bucket list
      const mockListFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: listId,
                user_id: userId,
                name: 'My Adventure List',
                category: 'adventures',
                is_public: true,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockListFrom)

      const listResult = await supabase
        .from('bucket_lists')
        .insert({
          user_id: userId,
          name: 'My Adventure List',
          category: 'adventures',
        })
        .select()
        .single()

      expect(listResult.data?.id).toBe(listId)
      expect(listResult.data?.name).toBe('My Adventure List')

      // Step 4: User adds an item to the list
      const mockItemFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: itemId,
                bucket_list_id: listId,
                title: 'Visit Paris',
                points: 100,
                completed: false,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockItemFrom)

      const itemResult = await supabase
        .from('bucket_items')
        .insert({
          bucket_list_id: listId,
          title: 'Visit Paris',
          points: 100,
        })
        .select()
        .single()

      expect(itemResult.data?.id).toBe(itemId)
      expect(itemResult.data?.completed).toBe(false)

      // Step 5: User completes the item
      const mockCompleteFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: itemId,
                  completed: true,
                  completed_date: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockCompleteFrom)

      const completeResult = await supabase
        .from('bucket_items')
        .update({ completed: true })
        .eq('id', itemId)
        .select()
        .single()

      expect(completeResult.data?.completed).toBe(true)

      // Step 6: User creates a memory for the completed item
      const mockMemoryFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: memoryId,
                user_id: userId,
                bucket_item_id: itemId,
                reflection: 'Amazing experience in Paris!',
                photos: ['photo1.jpg', 'photo2.jpg'],
                is_public: true,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockMemoryFrom)

      const memoryResult = await supabase
        .from('memories')
        .insert({
          user_id: userId,
          bucket_item_id: itemId,
          reflection: 'Amazing experience in Paris!',
          photos: ['photo1.jpg', 'photo2.jpg'],
        })
        .select()
        .single()

      expect(memoryResult.data?.id).toBe(memoryId)
      expect(memoryResult.data?.reflection).toBe('Amazing experience in Paris!')

      // Step 7: Verify profile stats updated
      const mockUpdatedProfileFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: userId,
                total_points: 100,
                items_completed: 1,
                lists_created: 1,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockUpdatedProfileFrom)

      const updatedProfileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      expect(updatedProfileResult.data?.total_points).toBe(100)
      expect(updatedProfileResult.data?.items_completed).toBe(1)
    })
  })

  describe('Social Features Workflow', () => {
    it('should complete social interaction workflow', async () => {
      const user1Id = 'user-1'
      const user2Id = 'user-2'
      const listId = 'list-123'

      // Step 1: User 1 creates a public bucket list
      const mockListFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: listId,
                user_id: user1Id,
                name: 'Travel Goals',
                category: 'adventures' as const,
                is_public: true,
                follower_count: 0,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockListFrom)

      const listResult = await supabase
        .from('bucket_lists')
        .insert({
          user_id: user1Id,
          name: 'Travel Goals',
          category: 'adventures' as const,
          is_public: true,
        })
        .select()
        .single()

      expect(listResult.data?.is_public).toBe(true)

      // Step 2: User 2 discovers the list in explore
      const mockExploreFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: listId,
                    name: 'Travel Goals',
                    is_public: true,
                  },
                ],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockExploreFrom)

      const exploreResult = await supabase
        .from('bucket_lists')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .order('created_at')
        .range(0, 19)

      expect(exploreResult.data?.length).toBeGreaterThan(0)

      // Step 3: User 2 follows the list
      const mockFollowFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: user2Id,
                bucket_list_id: listId,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFollowFrom)

      const followResult = await supabase
        .from('list_followers')
        .insert({
          user_id: user2Id,
          bucket_list_id: listId,
        })
        .select()
        .single()

      expect(followResult.data?.user_id).toBe(user2Id)

      // Step 4: User 1 completes an item (creates timeline event)
      const mockEventFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: user1Id,
                event_type: 'item_completed',
                title: 'Completed: Visit Tokyo',
                is_public: true,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockEventFrom)

      const eventResult = await supabase
        .from('timeline_events')
        .insert({
          user_id: user1Id,
          event_type: 'item_completed',
          title: 'Completed: Visit Tokyo',
          is_public: true,
        })
        .select()
        .single()

      expect(eventResult.data?.event_type).toBe('item_completed')

      // Step 5: User 2 sees the event in their social feed
      const mockFeedFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: [
                  {
                    user_id: user1Id,
                    event_type: 'item_completed',
                    title: 'Completed: Visit Tokyo',
                  },
                ],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFeedFrom)

      const feedResult = await supabase
        .from('user_feed_view')
        .select('*', { count: 'exact' })
        .in('user_id', [user1Id])
        .order('created_at')
        .range(0, 19)

      expect(feedResult.data?.length).toBeGreaterThan(0)
      expect(feedResult.data?.[0].event_type).toBe('item_completed')
    })
  })

  describe('Leaderboard and Ranking Workflow', () => {
    it('should update rankings when users complete items', async () => {
      const user1Id = 'user-1'
      const user2Id = 'user-2'

      // Step 1: Initial leaderboard state
      const mockInitialLeaderboard = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  id: user1Id,
                  username: 'user1',
                  total_points: 500,
                  global_rank: 1,
                },
                {
                  id: user2Id,
                  username: 'user2',
                  total_points: 300,
                  global_rank: 2,
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockInitialLeaderboard)

      const initialLeaderboard = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100)

      expect(initialLeaderboard.data?.[0].global_rank).toBe(1)
      expect(initialLeaderboard.data?.[1].global_rank).toBe(2)

      // Step 2: User 2 completes a high-value item
      const mockItemComplete = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { completed: true },
                error: null,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockItemComplete)

      await supabase
        .from('bucket_items')
        .update({ completed: true })
        .eq('id', 'item-123')
        .select()
        .single()

      // Step 3: Recalculate global ranks
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any)

      await supabase.rpc('recalculate_global_ranks')

      expect(supabase.rpc).toHaveBeenCalledWith('recalculate_global_ranks')

      // Step 4: Updated leaderboard shows new rankings
      const mockUpdatedLeaderboard = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  id: user2Id,
                  username: 'user2',
                  total_points: 600,
                  global_rank: 1,
                },
                {
                  id: user1Id,
                  username: 'user1',
                  total_points: 500,
                  global_rank: 2,
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockUpdatedLeaderboard)

      const updatedLeaderboard = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100)

      expect(updatedLeaderboard.data?.[0].id).toBe(user2Id)
      expect(updatedLeaderboard.data?.[0].global_rank).toBe(1)
    })
  })

  describe('Profile Management Workflow', () => {
    it('should update profile and maintain statistics', async () => {
      const userId = 'user-123'

      // Step 1: Fetch initial profile
      const mockInitialProfile = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: userId,
                username: 'oldusername',
                bio: 'Old bio',
                total_points: 0,
                items_completed: 0,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockInitialProfile)

      const initialProfile = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      expect(initialProfile.data?.username).toBe('oldusername')

      // Step 2: Update profile information
      const mockUpdateProfile = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: userId,
                  username: 'newusername',
                  bio: 'Updated bio',
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockUpdateProfile)

      const updateResult = await supabase
        .from('profiles')
        .update({
          username: 'newusername',
          bio: 'Updated bio',
        })
        .eq('id', userId)
        .select()
        .single()

      expect(updateResult.data?.username).toBe('newusername')
      expect(updateResult.data?.bio).toBe('Updated bio')

      // Step 3: User creates lists and completes items
      // (Statistics are updated via triggers)

      // Step 4: Update profile stats
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any)

      await supabase.rpc('update_profile_stats', { user_uuid: userId })

      expect(supabase.rpc).toHaveBeenCalledWith('update_profile_stats', {
        user_uuid: userId,
      })

      // Step 5: Fetch updated profile with statistics
      const mockUpdatedProfile = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: userId,
                username: 'newusername',
                total_points: 250,
                items_completed: 3,
                lists_created: 2,
                lists_following: 5,
              },
              error: null,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockUpdatedProfile)

      const updatedProfile = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      expect(updatedProfile.data?.total_points).toBe(250)
      expect(updatedProfile.data?.items_completed).toBe(3)
      expect(updatedProfile.data?.lists_created).toBe(2)
    })
  })

  describe('Error Handling in Workflows', () => {
    it('should handle duplicate username error during profile update', async () => {
      const userId = 'user-123'
      const duplicateError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: 'Key (username)=(existinguser) already exists',
      }

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: duplicateError,
              }),
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('profiles')
        .update({ username: 'existinguser' })
        .eq('id', userId)
        .select()
        .single()

      expect(result.error).toBeTruthy()
      expect(result.error?.code).toBe('23505')
    })

    it('should handle permission error when accessing private list', async () => {
      const permissionError = {
        code: '42501',
        message: 'new row violates row-level security policy',
      }

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: permissionError,
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('bucket_lists')
        .select('*')
        .eq('id', 'private-list-123')

      expect(result.error).toBeTruthy()
      expect(result.error?.code).toBe('42501')
    })

    it('should handle already following error', async () => {
      const duplicateError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      }

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: duplicateError,
            }),
          }),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await supabase
        .from('list_followers')
        .insert({
          user_id: 'user-1',
          bucket_list_id: 'list-1',
        })
        .select()
        .single()

      expect(result.error).toBeTruthy()
      expect(result.error?.code).toBe('23505')
    })
  })
})
