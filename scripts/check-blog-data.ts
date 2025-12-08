
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
try {
    let envConfig: Record<string, string> = {}

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                envConfig[key.trim()] = value.trim()
            }
        })
    }

    const url = envConfig['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || (!key && !anonKey)) {
        console.error('Missing Supabase URL or Anon Key in .env.local')
        process.exit(1)
    }

    // Use Service Key if available for admin, otherwise fallback to Anon (with limit warning)
    const adminClient = createClient(url, key || anonKey!)
    const anonClient = createClient(url, anonKey!)

    async function checkData() {
        console.log('--- Checking Blog Post ---')
        // 1. Get a blog post 
        const { data: posts, error: postError } = await adminClient
            .from('blog_posts')
            .select('*')
            .limit(1)

        if (postError) {
            console.error('Error fetching posts:', postError)
            return
        }
        if (!posts || posts.length === 0) {
            console.log('No blog posts found.')
            return
        }

        const post = posts[0]
        console.log('Post found:', { id: post.id, title: post.title, author_id: post.author_id })

        console.log('\n--- Checking Author Profile (Admin Scope) ---')
        // 2. Check profile 
        const { data: profileNode, error: profileError } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', post.author_id)
            .single()

        if (profileError) {
            console.error('Error fetching profile (Admin Scope):', profileError)
        } else {
            console.log('Profile found (Admin Scope):', { id: profileNode.id, username: profileNode.username })
        }

        console.log('\n--- Checking Author Profile (Anon User Scope) ---')
        // 3. Check profile using Anon Client (Respecting RLS)
        const { data: publicProfile, error: publicError } = await anonClient
            .from('profiles')
            .select('*')
            .eq('id', post.author_id)
            .single()

        if (publicError) {
            console.error('Error fetching profile (Anon Scope):', publicError)
            console.log('Use code: ' + publicError.code + ', Msg: ' + publicError.message)
        } else {
            console.log('Profile found (Anon Scope):', { id: publicProfile.id, username: publicProfile.username })
        }
    }

    checkData()

} catch (err) {
    console.error('Script Error:', err)
}
