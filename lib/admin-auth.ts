import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin emails - must match client-side list in hooks/use-admin.ts
const ADMIN_EMAILS = ['tsunyoxi@gmail.com']

export async function verifyAdmin() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
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

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized: Authentication required')
    }

    const userEmail = user.email?.toLowerCase()

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        console.warn(`Unauthorized admin access attempt by: ${userEmail || 'unknown'}`)
        throw new Error('Unauthorized: Admin access required')
    }

    return user
}
