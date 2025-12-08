
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
try {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const envConfig: Record<string, string> = {}

    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            envConfig[key.trim()] = value.trim()
        }
    })

    // Also try to read from process.env if available (in case values are already loaded)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.replace('anon', 'url') || envConfig['NEXT_PUBLIC_SUPABASE_URL']
    // Note: NEXT_PUBLIC_SUPABASE_URL logic above is a bit fuzzy, let's stick to envConfig

    const url = envConfig['NEXT_PUBLIC_SUPABASE_URL']
    const key = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY']

    if (!url || !key) {
        console.error('Missing Supabase credentials in .env.local')
        process.exit(1)
    }

    const supabase = createClient(url, key)

    async function fixAuthors() {
        console.log('Finding user "Tsunyoxi"...')

        // 1. Get the user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .ilike('username', 'tsunyoxi')
            .single()

        if (profileError || !profile) {
            console.error('User "Tsunyoxi" not found:', profileError)
            // List profiles to debug
            const { data: profiles } = await supabase.from('profiles').select('username').limit(5)
            console.log('Available profiles:', profiles?.map(p => p.username))

            // If no profiles, maybe check auth.users? But we can't access auth.users easily via client SDK unless service role is used properly.
            return
        }

        console.log(`Found user: ${profile.username} (${profile.id})`)

        // 2. Update blog posts
        const { error: updateError, count } = await supabase
            .from('blog_posts')
            .update({ author_id: profile.id })
            .neq('author_id', profile.id)
            .select()

        if (updateError) {
            console.error('Error updating posts:', updateError)
            return
        }

        console.log(`Updated ${count !== null ? count : 'unknown'} blog posts to author_id: ${profile.id}`)
    }

    fixAuthors()

} catch (err) {
    console.error('Error reading .env.local:', err)
}
