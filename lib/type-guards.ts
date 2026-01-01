import type { Profile, BucketItem, BlogPost, Database } from '@/types/supabase'

/**
 * Type guards for safe runtime type checking
 */

export function isProfile(value: unknown): value is Profile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value
  )
}

export function isBucketItem(value: unknown): value is BucketItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  )
}

export function isBlogPost(value: unknown): value is BlogPost {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'slug' in value
  )
}

export function isTableRow<T extends keyof Database['public']['Tables']>(
  value: unknown,
  table: T
): value is Database['public']['Tables'][T]['Row'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'created_at' in value &&
    'updated_at' in value
  )
}
