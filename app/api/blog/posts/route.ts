import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog-service'

export async function GET() {
    try {
        const posts = await getAllPosts({})
        return NextResponse.json(posts)
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}
