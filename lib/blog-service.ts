import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
    BlogPost,
    BlogPostWithAuthor,
    BlogLike,
    BlogPostFormData,
    BlogListFilters,
    BlogCategory,
    BlogStatus
} from '@/types/blog'
import { generateSlug, calculateReadingTime } from './blog-utils'

/**
 * Create a Supabase server client for server-side operations
 */
async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}


/**
 * Helper to fetch authors for posts and attach them
 */
async function enrichPostsWithAuthors(supabase: any, posts: any[]) {
    if (!posts || posts.length === 0) return []

    const authorIds = [...new Set(posts.map(post => post.author_id))]

    const { data: authors, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, total_points, global_rank, items_completed, twitter_url, instagram_url, linkedin_url, github_url, website_url')
        .in('id', authorIds)

    if (error) {
        console.error('Error fetching authors:', error)
    }

    const authorMap = new Map<string, any>(authors?.map((author: any) => [author.id, author]))

    return posts.map(post => {
        const author = authorMap.get(post.author_id)
        return {
            ...post,
            author: author ? {
                id: author.id,
                username: author.username,
                full_name: author.username, // Fallback
                avatar_url: author.avatar_url,
                bio: author.bio,
                stats: {
                    totalPoints: author.total_points || 0,
                    itemsCompleted: author.items_completed || 0,
                    globalRank: author.global_rank
                },
                social: {
                    twitter: author.twitter_url,
                    instagram: author.instagram_url,
                    linkedin: author.linkedin_url,
                    github: author.github_url,
                    website: author.website_url
                }
            } : {
                id: post.author_id,
                username: 'Unknown',
                full_name: 'Unknown Author',
                avatar_url: null,
                bio: null,
                stats: { totalPoints: 0, itemsCompleted: 0, globalRank: null },
                social: { twitter: null, instagram: null, linkedin: null, github: null, website: null }
            }
        }
    })
}

export async function getAllPosts(filters?: BlogListFilters) {
    const supabase = await createClient()

    let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
        query = query.eq('category', filters.category)
    }

    if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
    }

    if (filters?.search) {
        query = query.textSearch('title', filters.search, {
            type: 'websearch',
            config: 'english'
        })
    }

    const { data, error } = await query

    if (error) throw error

    return enrichPostsWithAuthors(supabase, data || []) as Promise<BlogPostWithAuthor[]>
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(limit: number = 3) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return enrichPostsWithAuthors(supabase, data) as Promise<BlogPostWithAuthor[]>
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error) throw error

    const [post] = await enrichPostsWithAuthors(supabase, [data])
    return post as BlogPostWithAuthor
}

/**
 * Get a single blog post by ID (for admin)
 */
export async function getPostById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error

    const [post] = await enrichPostsWithAuthors(supabase, [data])
    return post as BlogPostWithAuthor
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: BlogCategory) {
    return getAllPosts({ category })
}

/**
 * Search blog posts using full-text search
 */
export async function searchPosts(searchQuery: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('published_at', { ascending: false })

    if (error) throw error
    return enrichPostsWithAuthors(supabase, data) as Promise<BlogPostWithAuthor[]>
}

/**
 * Get related posts based on matching tags
 */
export async function getRelatedPosts(postId: string, tags: string[], limit: number = 3) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', postId)
        .overlaps('tags', tags)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return enrichPostsWithAuthors(supabase, data) as Promise<BlogPostWithAuthor[]>
}

/**
 * Create a new blog post (admin only)
 */
export async function createPost(postData: BlogPostFormData, authorId: string) {
    const supabase = await createClient()

    // Auto-generate slug if not provided or empty
    const slug = postData.slug || generateSlug(postData.title)

    // Calculate reading time
    const readingTimeMinutes = calculateReadingTime(postData.content)

    // Set published_at if status is published
    const publishedAt = postData.status === 'published' ? new Date().toISOString() : null

    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            ...postData,
            slug,
            author_id: authorId,
            reading_time_minutes: readingTimeMinutes,
            published_at: publishedAt,
        })
        .select()
        .single()

    if (error) throw error
    return data as BlogPost
}

/**
 * Update an existing blog post (admin only)
 */
export async function updatePost(postId: string, postData: Partial<BlogPostFormData>) {
    const supabase = await createClient()

    const updateData: any = { ...postData }

    // Recalculate reading time if content changed
    if (postData.content) {
        updateData.reading_time_minutes = calculateReadingTime(postData.content)
    }

    // Update published_at if status changed to published
    if (postData.status === 'published') {
        const { data: currentPost } = await supabase
            .from('blog_posts')
            .select('published_at')
            .eq('id', postId)
            .single()

        if (!currentPost?.published_at) {
            updateData.published_at = new Date().toISOString()
        }
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single()

    if (error) throw error
    return data as BlogPost
}

/**
 * Delete a blog post (admin only)
 */
export async function deletePost(postId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

    if (error) throw error
}

/**
 * Increment view count for a blog post
 */
export async function incrementViewCount(postId: string) {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_blog_view_count', {
        post_id: postId
    })

    if (error) {
        // Fallback: manual increment if RPC doesn't exist
        const { data: post } = await supabase
            .from('blog_posts')
            .select('view_count')
            .eq('id', postId)
            .single()

        if (post) {
            await supabase
                .from('blog_posts')
                .update({ view_count: post.view_count + 1 })
                .eq('id', postId)
        }
    }
}

/**
 * Toggle like on a blog post
 */
export async function toggleLike(postId: string, userId: string) {
    const supabase = await createClient()

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

    if (existingLike) {
        // Unlike
        const { error } = await supabase
            .from('blog_likes')
            .delete()
            .eq('id', existingLike.id)

        if (error) throw error
        return { liked: false }
    } else {
        // Like
        const { error } = await supabase
            .from('blog_likes')
            .insert({
                post_id: postId,
                user_id: userId,
            })

        if (error) throw error
        return { liked: true }
    }
}

/**
 * Get like count for a blog post
 */
export async function getLikeCount(postId: string) {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

    if (error) throw error
    return count || 0
}

/**
 * Check if user has liked a post
 */
export async function hasUserLiked(postId: string, userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
}

/**
 * Get all posts for admin (includes drafts and archived)
 */
export async function getAllPostsAdmin(filters?: BlogListFilters) {
    const supabase = await createClient()

    let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
        query = query.eq('category', filters.category)
    }

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return enrichPostsWithAuthors(supabase, data) as Promise<BlogPostWithAuthor[]>
}
