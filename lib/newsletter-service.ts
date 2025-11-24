import { supabase } from './supabase'
import { handleSupabaseError, logError } from './error-handler'

/**
 * Newsletter Service
 * Handles newsletter subscription operations
 */

export interface NewsletterSubscription {
  id: string
  email: string
  user_id: string | null
  subscribed: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  source: 'sidebar' | 'landing' | 'signup' | 'profile' | 'other'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type NewsletterSource = 'sidebar' | 'landing' | 'signup' | 'profile' | 'other'

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(
  email: string,
  userId: string | null = null,
  source: NewsletterSource = 'sidebar',
  metadata: Record<string, any> = {}
): Promise<NewsletterSubscription> {
  try {
    // Validate email format
    if (!email || !email.trim()) {
      throw new Error('Email is required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format')
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    // Handle check error (but ignore "not found" errors)
    if (checkError && checkError.code !== 'PGRST116') {
      logError(checkError, { context: 'subscribeToNewsletter', email, action: 'check' })
      throw checkError
    }

    if (existing) {
      // If exists but unsubscribed, resubscribe
      if (!existing.subscribed) {
        const { data, error } = await supabase
          .from('newsletter_subscriptions')
          .update({
            subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            user_id: userId || existing.user_id,
            source,
            metadata: { ...existing.metadata, ...metadata },
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          logError(error, { context: 'subscribeToNewsletter', email, action: 'resubscribe' })
          throw error
        }

        if (!data) {
          throw new Error('Failed to resubscribe to newsletter')
        }

        return data as NewsletterSubscription
      }

      // Already subscribed - return existing subscription
      return existing as NewsletterSubscription
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.toLowerCase().trim(),
        user_id: userId,
        subscribed: true,
        source,
        metadata,
      })
      .select()
      .single()

    if (error) {
      logError(error, { context: 'subscribeToNewsletter', email, action: 'insert' })
      throw error
    }

    if (!data) {
      throw new Error('Failed to create newsletter subscription')
    }

    return data as NewsletterSubscription
  } catch (error) {
    logError(error, { context: 'subscribeToNewsletter', email })
    throw handleSupabaseError(error)
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('unsubscribe_newsletter', {
      p_email: email.toLowerCase().trim(),
    })

    if (error) {
      logError(error, { context: 'unsubscribeFromNewsletter', email })
      throw handleSupabaseError(error)
    }

    return data as boolean
  } catch (error) {
    logError(error, { context: 'unsubscribeFromNewsletter', email })
    throw handleSupabaseError(error)
  }
}

/**
 * Check if email is subscribed
 */
export async function checkSubscriptionStatus(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('subscribed')
      .eq('email', email.toLowerCase().trim())
      .eq('subscribed', true)
      .single()

    if (error) {
      // If no record found, user is not subscribed
      if (error.code === 'PGRST116') {
        return false
      }
      logError(error, { context: 'checkSubscriptionStatus', email })
      throw handleSupabaseError(error)
    }

    return data?.subscribed ?? false
  } catch (error) {
    logError(error, { context: 'checkSubscriptionStatus', email })
    throw handleSupabaseError(error)
  }
}

/**
 * Get user's subscription (if logged in)
 */
export async function getUserSubscription(userId: string): Promise<NewsletterSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logError(error, { context: 'getUserSubscription', userId })
      throw handleSupabaseError(error)
    }

    return data as NewsletterSubscription | null
  } catch (error) {
    logError(error, { context: 'getUserSubscription', userId })
    throw handleSupabaseError(error)
  }
}

