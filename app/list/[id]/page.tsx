import { Metadata, ResolvingMetadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { ListDetailClient } from "@/components/bucket-list/list-detail-client"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  const searchParams = await props.searchParams
  const id = params.id
  const itemId = searchParams.item // Look for ?item=XYZ

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. If Sharing a specific Item Completion
  if (itemId && typeof itemId === 'string') {
    const { data: item } = await supabase
      .from('bucket_items')
      .select(`
            title,
            points,
            bucket_lists (
               category,
               user_id,
               profiles (username)
            ),
            memories (
               photos
            )
        `)
      .eq('id', itemId)
      .single()

    if (item) {
      // Find latest memory photo if any
      let photo = ''
      if (item.memories && item.memories.length > 0) {
        const photos = item.memories[0].photos
        if (Array.isArray(photos) && photos.length > 0) {
          photo = photos[0]
        }
      }

      const username = item.bucket_lists?.profiles?.username || 'User'
      const title = item.title
      const points = item.points
      const category = item.bucket_lists?.category || 'General'

      const ogUrl = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://bucketly.vercel.app' : 'http://localhost:3000'}/api/og/completion`)
      // NOTE: We should use the DEPLOYED URL for OG images.
      // For now using relative or env based. Assuming Vercel_URL is set or we construct it.
      // Client side navigation uses window.location.origin.
      // Server side we need a base URL.
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bucketly.vercel.app'

      const imageUrl = new URL(`${baseUrl}/api/og/completion`)
      imageUrl.searchParams.set('title', title)
      imageUrl.searchParams.set('user', username)
      imageUrl.searchParams.set('points', String(points))
      if (photo) imageUrl.searchParams.set('photo', photo)

      return {
        title: `${username} completed ${title} | Bucketly`,
        description: `Check out this achievement on Bucketly! +${points} points earned.`,
        openGraph: {
          images: [imageUrl.toString()],
          title: `${username} completed ${title} | Bucketly`,
          description: `Check out this achievement on Bucketly! +${points} points earned.`,
        },
        twitter: {
          card: 'summary_large_image',
          title: `${username} completed ${title}`,
          description: `+${points} points earned on Bucketly`,
          images: [imageUrl.toString()],
        }
      }
    }
  }

  // 2. Fallback: List Metadata
  const { data: list } = await supabase
    .from('bucket_lists')
    .select('name, description, profiles(username)')
    .eq('id', id)
    .single()

  if (list) {
    return {
      title: `${list.name} by ${list.profiles?.username || 'User'} | Bucketly`,
      description: list.description || 'Check out this bucket list on Bucketly.',
      openGraph: {
        title: list.name,
        description: list.description || undefined,
      }
    }
  }

  return {
    title: "Bucket List Details | Bucketly",
  }
}

export default function Page() {
  return <ListDetailClient />
}
