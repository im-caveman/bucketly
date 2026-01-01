import type { Profile, BlogPost, Category } from '@/types/supabase'
import type { UserProfile, UserProfileFrontend } from '@/types/bucket-list'

/**
 * Transform database Profile to frontend UserProfile
 * Handles property mapping and null safety
 */
export function transformProfile(dbProfile: Profile): UserProfile {
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    avatar_url: dbProfile.avatar_url ?? null,
    bio: dbProfile.bio ?? null,
    twitter_url: dbProfile.twitter_url ?? null,
    instagram_url: dbProfile.instagram_url ?? null,
    linkedin_url: dbProfile.linkedin_url ?? null,
    points: dbProfile.points,
    rank: dbProfile.rank ?? null,
    user_id: dbProfile.user_id,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    github_url: dbProfile.github_url ?? null,
    website_url: dbProfile.website_url ?? null,
    global_rank: dbProfile.global_rank ?? null,
    total_points: dbProfile.total_points ?? null,
    items_completed: dbProfile.items_completed ?? null,
    lists_following: dbProfile.lists_following ?? null,
    lists_created: dbProfile.lists_created ?? null,
    followers_count: dbProfile.followers_count ?? null,
    following_count: dbProfile.following_count ?? null,
    is_private: dbProfile.is_private ?? null,
  }
}

/**
 * Transform database BlogPost with author to BlogPostWithAuthor
 */
export function transformBlogPostWithAuthor(
  dbPost: BlogPost & {
    profiles?: { username: string; avatar_url: string | null }
  }
): BlogPostWithAuthor {
  return {
    ...dbPost,
    author: {
      username: dbPost.profiles?.username ?? 'Unknown',
      avatar_url: dbPost.profiles?.avatar_url ?? null,
    },
  }
}

/**
 * Transform category string to Category type with validation
 */
export function toCategory(value: string): Category {
  const categories: Category[] = [
    'adventures',
    'places',
    'cuisines',
    'books',
    'songs',
    'movies',
    'fitness',
    'skills',
    'experiences',
    'goals',
    'travel',
    'hobbies',
    'other',
    'miscellaneous',
  ]

  if (categories.includes(value as Category)) {
    return value as Category
  }

  return 'other' // Fallback for invalid categories
}

/**
 * Safe string to number conversion
 */
export function toNumber(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

/**
 * Safe string to boolean conversion
 */
export function toBoolean(value: string | boolean | null | undefined): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  return false
}
