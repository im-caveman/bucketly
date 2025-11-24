import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please check your .env.local file and ensure it contains a valid Supabase URL. ' +
    'See docs/ENVIRONMENT_VARIABLES.md for setup instructions.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your .env.local file and ensure it contains a valid Supabase anonymous key. ' +
    'See docs/ENVIRONMENT_VARIABLES.md for setup instructions.'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL format: "${supabaseUrl}". ` +
    'The URL must be a valid HTTPS URL (e.g., https://your-project.supabase.co). ' +
    'See docs/ENVIRONMENT_VARIABLES.md for setup instructions.'
  )
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
