'use client'

import { BlogCard } from './BlogCard'
import type { BlogPostWithAuthor } from '@/types/blog'

interface RelatedPostsProps {
    posts: BlogPostWithAuthor[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Related Posts</h3>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="scale-95">
                        <BlogCard post={post} />
                    </div>
                ))}
            </div>
        </div>
    )
}
