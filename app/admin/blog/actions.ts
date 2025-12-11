'use server'

import {
    getAllPostsAdmin,
    deletePost as deletePostService,
    createPost as createPostService,
    updatePost as updatePostService,
    getPostById as getPostByIdService,
} from '@/lib/blog-service'
import type { BlogPostFormData, BlogListFilters } from '@/types/blog'
import { verifyAdmin } from '@/lib/admin-auth'

/**
 * Server action to get all posts for admin
 */
export async function getAllPostsAdminAction(filters?: BlogListFilters) {
    await verifyAdmin()
    return await getAllPostsAdmin(filters)
}

/**
 * Server action to delete a post
 */
export async function deletePostAction(postId: string) {
    await verifyAdmin()
    return await deletePostService(postId)
}

/**
 * Server action to create a post
 */
export async function createPostAction(postData: any, authorId: string) {
    const user = await verifyAdmin()

    // Ensure the authorId matches the authenticated admin user
    if (authorId !== user.id) {
        throw new Error('Unauthorized: Author ID mismatch')
    }

    // Convert comma-separated tags to array
    const tags = postData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)

    const formattedData: BlogPostFormData = {
        ...postData,
        tags,
        cover_image_url: postData.cover_image_url || null,
        excerpt: postData.excerpt || null,
        meta_title: postData.meta_title || null,
        meta_description: postData.meta_description || null,
    }

    return await createPostService(formattedData, authorId)
}

/**
 * Server action to update a post
 */
export async function updatePostAction(postId: string, postData: any) {
    await verifyAdmin()

    // Convert comma-separated tags to array
    const tags = postData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)

    const formattedData = {
        ...postData,
        tags,
        cover_image_url: postData.cover_image_url || null,
        excerpt: postData.excerpt || null,
        meta_title: postData.meta_title || null,
        meta_description: postData.meta_description || null,
    }

    return await updatePostService(postId, formattedData)
}

/**
 * Server action to get a post by ID
 */
export async function getPostByIdAction(postId: string) {
    await verifyAdmin()
    return await getPostByIdService(postId)
}
