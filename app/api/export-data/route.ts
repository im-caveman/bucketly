import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit } from '@/lib/rate-limit-middleware'

// GDPR Data Export API
// Provides users with a complete export of their personal data
export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      // Get user from session (middleware ensures authentication)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get session from the request
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        )
      }

      const userId = user.id

      // Collect all user data
      const userData = await Promise.all([
        // Profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),

        // Bucket lists
        supabase
          .from('bucket_lists')
          .select('*')
          .eq('user_id', userId),

        // Bucket items (through lists)
        supabase
          .from('bucket_items')
          .select(`
            *,
            bucket_lists (
              name,
              category
            )
          `)
          .eq('bucket_lists.user_id', userId),

        // Memories (through items)
        supabase
          .from('memories')
          .select(`
            *,
            bucket_items (
              title,
              bucket_lists (
                name
              )
            )
          `)
          .eq('bucket_items.bucket_lists.user_id', userId),

        // Timeline events
        supabase
          .from('timeline_events')
          .select('*')
          .eq('user_id', userId),

        // Following relationships
        supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', userId),

        // Notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId),

        // Blog posts (if user is author)
        supabase
          .from('blog_posts')
          .select('*')
          .eq('author_id', userId),

        // Blog likes
        supabase
          .from('blog_likes')
          .select('*')
          .eq('user_id', userId)
      ])

      const [
        profile,
        bucketLists,
        bucketItems,
        memories,
        timelineEvents,
        following,
        notifications,
        blogPosts,
        blogLikes
      ] = userData

      // Structure export data
      const exportData = {
        user: {
          id: profile.data?.id,
          email: user.email, // Only available from auth
          username: profile.data?.username,
          avatar_url: profile.data?.avatar_url,
          bio: profile.data?.bio,
          created_at: profile.data?.created_at,
          updated_at: profile.data?.updated_at,
          statistics: {
            total_points: profile.data?.total_points,
            global_rank: profile.data?.global_rank,
            items_completed: profile.data?.items_completed,
            lists_created: profile.data?.lists_created,
            lists_following: profile.data?.lists_following
          }
        },
        data: {
          bucket_lists: bucketLists.data || [],
          bucket_items: bucketItems.data || [],
          memories: memories.data || [],
          timeline_events: timelineEvents.data || [],
          following: following.data || [],
          notifications: notifications.data || [],
          blog_posts: blogPosts.data || [],
          blog_likes: blogLikes.data || []
        },
        export_metadata: {
          exported_at: new Date().toISOString(),
          version: '1.0',
          format: 'json'
        }
      }

      // Create downloadable file
      const filename = `bucketly-export-${user.email}-${Date.now()}.json`
      
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        }
      })

    } catch (error) {
      console.error('Data export failed:', error)
      
      return NextResponse.json({
        error: 'Export failed',
        message: 'Unable to generate data export. Please try again later.'
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
}