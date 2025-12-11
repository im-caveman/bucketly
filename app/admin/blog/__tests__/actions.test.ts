import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createPostAction,
    updatePostAction,
    deletePostAction,
    getAllPostsAdminAction,
    getPostByIdAction
} from '../actions'
import * as adminAuth from '@/lib/admin-auth'

// Mock the admin auth module
vi.mock('@/lib/admin-auth', () => ({
    verifyAdmin: vi.fn()
}))

// Mock the blog service
vi.mock('@/lib/blog-service', () => ({
    createPost: vi.fn().mockResolvedValue({ id: 'new-post' }),
    updatePost: vi.fn().mockResolvedValue({ id: 'updated-post' }),
    deletePost: vi.fn().mockResolvedValue(undefined),
    getAllPostsAdmin: vi.fn().mockResolvedValue([]),
    getPostById: vi.fn().mockResolvedValue({ id: 'post-1' })
}))

describe('Admin Blog Actions Security', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('createPostAction should throw if verifyAdmin throws', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockRejectedValue(new Error('Unauthorized: Admin access required'))

        // Act & Assert
        await expect(createPostAction({ tags: '' }, 'user-1'))
            .rejects.toThrow('Unauthorized: Admin access required')
    })

    it('updatePostAction should throw if verifyAdmin throws', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockRejectedValue(new Error('Unauthorized: Admin access required'))

        // Act & Assert
        await expect(updatePostAction('post-1', { tags: '' }))
            .rejects.toThrow('Unauthorized: Admin access required')
    })

    it('deletePostAction should throw if verifyAdmin throws', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockRejectedValue(new Error('Unauthorized: Admin access required'))

        // Act & Assert
        await expect(deletePostAction('post-1'))
            .rejects.toThrow('Unauthorized: Admin access required')
    })

    it('getAllPostsAdminAction should throw if verifyAdmin throws', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockRejectedValue(new Error('Unauthorized: Admin access required'))

        // Act & Assert
        await expect(getAllPostsAdminAction())
            .rejects.toThrow('Unauthorized: Admin access required')
    })

    it('createPostAction should succeed if verifyAdmin succeeds and author matches', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockResolvedValue({ id: 'admin-1', email: 'tsunyoxi@gmail.com' } as any)

        // Act
        const result = await createPostAction({ tags: 'tag1, tag2' }, 'admin-1')

        // Assert
        expect(result).toEqual({ id: 'new-post' })
        expect(adminAuth.verifyAdmin).toHaveBeenCalled()
    })

    it('createPostAction should throw if authorId does not match authenticated user', async () => {
        // Arrange
        vi.mocked(adminAuth.verifyAdmin).mockResolvedValue({ id: 'admin-1', email: 'tsunyoxi@gmail.com' } as any)

        // Act & Assert
        await expect(createPostAction({ tags: '' }, 'other-user'))
            .rejects.toThrow('Unauthorized: Author ID mismatch')
    })
})
