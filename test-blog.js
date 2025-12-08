import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlogQuery() {
    try {
        console.log('Testing blog query...')

        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
        *,
        author:profiles!blog_posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })

        if (error) {
            console.error('Query error:', error)
        } else {
            console.log('Success! Found posts:', data?.length)
            console.log('First post:', data?.[0]?.title)
        }
    } catch (err) {
        console.error('Exception:', err)
    }
}

testBlogQuery()
