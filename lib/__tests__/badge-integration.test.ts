
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleItemCompletion, createBucketList, followBucketList } from '@/lib/bucket-list-service'
import { supabase } from '@/lib/supabase'
import { checkAndAwardBadges } from '@/lib/badge-progress-service'

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  }
}))

vi.mock('@/lib/badge-progress-service', () => ({
  checkAndAwardBadges: vi.fn(),
}))

vi.mock('@/lib/error-handler', () => ({
  handleSupabaseError: (err: any) => err,
  logError: vi.fn(),
}))

describe('Badge Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup basic supabase mock chains
    const mockSelect = vi.fn().mockReturnThis()
    const mockInsert = vi.fn().mockReturnThis()
    const mockUpdate = vi.fn().mockReturnThis()
    const mockDelete = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null })
    const mockContains = vi.fn().mockResolvedValue({ data: [], error: null })

    // Default mock implementation
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      contains: mockContains,
    })

    // @ts-ignore
    supabase.from = mockFrom
    // @ts-ignore
    supabase.rpc.mockResolvedValue({ error: null })
  })

  it('should check and award badges when completing an item', async () => {
    // Setup specific mock for bucket_items select
    const mockItem = {
        id: 'item-1',
        title: 'Test Item',
        description: 'Test Desc',
        points: 10,
        bucket_lists: {
            user_id: 'user-1',
            category: 'adventure'
        }
    }

    const mockSingleItem = vi.fn()
        .mockResolvedValueOnce({ data: mockItem, error: null }) // First select (get item)
        .mockResolvedValue({ data: { ...mockItem, completed: true }, error: null }) // Second select (update result)

    // Mock user items for stats recalculation
     // @ts-ignore
     supabase.from.mockImplementation((table) => {
        if (table === 'bucket_items') {
             // Logic for stats: 1. update item, 2. select points/completed for stats
             const mockUpdateChain = {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: mockSingleItem,
             }

             return {
                select: vi.fn().mockImplementation((cols) => {
                    // Logic to discern between "get item" and "get user items"
                    // toggleItemCompletion first gets the item, then updates it, then stats calls select('points, completed')
                    // 1. Get Item: .select(..., bucket_lists(...))
                    if (cols && cols.includes && cols.includes('bucket_lists')) {
                         return { eq: vi.fn().mockReturnThis(), single: mockSingleItem }
                    }
                    // 2. Stats calculation: .select('points, completed')
                    return {
                        eq: vi.fn().mockReturnThis(),
                        not: vi.fn().mockReturnThis(),
                        in: vi.fn().mockResolvedValue({ data: [{ points: 10 }], error: null })
                    }
                }),
                update: vi.fn().mockReturnValue(mockUpdateChain),
                eq: vi.fn().mockImplementation((col) => {
                     // toggleItemCompletion calls .eq('id', itemId).single()
                     // but deleteBucketItem or others might call eq.delete() etc.
                     // The stats calculation uses .in(), not .eq() for items.
                     // The only time eq is called on bucket_items is for update/delete or fetch single.

                     // Return an object that has single() for the initial fetch
                     return {
                        single: mockSingleItem,
                        select: vi.fn().mockReturnValue({ single: mockSingleItem }), // for update chain: .eq().select().single()
                     }
                }),
                single: mockSingleItem,
             }
        }
        if (table === 'bucket_lists') {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [{ id: 'list-1' }], error: null }),
                insert: vi.fn().mockReturnThis(), // needed for createBucketList
            }
        }
        if (table === 'profiles') {
            return {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: {}, error: null })
            }
        }
        if (table === 'timeline_events') {
             return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                contains: vi.fn().mockResolvedValue({ data: [], error: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
             }
        }
        return {
             select: vi.fn().mockReturnThis(),
             insert: vi.fn().mockReturnThis(),
             delete: vi.fn().mockReturnThis(),
             eq: vi.fn().mockReturnThis(),
             contains: vi.fn().mockResolvedValue({ data: [], error: null }),
             single: vi.fn().mockResolvedValue({ data: {}, error: null }),
             update: vi.fn().mockReturnThis(),
             in: vi.fn().mockReturnThis(),
             not: vi.fn().mockReturnThis(),
        }
    })

    await toggleItemCompletion('item-1', true)

    expect(checkAndAwardBadges).toHaveBeenCalledWith('user-1')
  })

  it('should check and award badges when creating a bucket list', async () => {
     // @ts-ignore
     supabase.from.mockImplementation((table) => {
         if (table === 'bucket_lists') {
             return {
                 insert: vi.fn().mockReturnThis(),
                 select: vi.fn().mockReturnThis(),
                 single: vi.fn().mockResolvedValue({ data: { id: 'list-new' }, error: null })
             }
         }
         return {
             insert: vi.fn().mockReturnThis(), // bucket_items, timeline_events
             select: vi.fn().mockReturnThis(),
             single: vi.fn().mockReturnThis(),
             update: vi.fn().mockReturnThis(),
             eq: vi.fn().mockReturnThis(),
         }
     })

     await createBucketList({
         userId: 'user-1',
         name: 'New List',
         category: 'adventure',
         isPublic: true,
         items: [{ title: 'Item 1' }]
     })

     expect(checkAndAwardBadges).toHaveBeenCalledWith('user-1')
  })

  it('should check and award badges when following a list', async () => {
    // @ts-ignore
    supabase.from.mockImplementation((table) => {
        if (table === 'list_followers') {
            return {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'follow-1' }, error: null })
            }
        }
        return {
             update: vi.fn().mockReturnThis(), // profiles update
             eq: vi.fn().mockReturnThis(),
             select: vi.fn().mockReturnThis(),
             single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }
    })

    await followBucketList('user-1', 'list-2')

    expect(checkAndAwardBadges).toHaveBeenCalledWith('user-1')
  })
})
