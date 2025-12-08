import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostsByCategory } from '@/lib/blog-service'
import { BlogCard } from '@/components/blog/BlogCard'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import type { BlogCategory } from '@/types/blog'

interface CategoryPageProps {
    params: Promise<{ category: string }>
}

const categoryInfo: Record<BlogCategory, { title: string; description: string }> = {
    guide: {
        title: 'Guides',
        description: 'Comprehensive guides to help you understand and complete bucket list challenges',
    },
    challenge: {
        title: 'Challenges',
        description: 'Discover transformative challenges to push your limits and grow',
    },
    inspiration: {
        title: 'Inspiration',
        description: 'Stories and ideas to inspire your bucket list journey',
    },
    'how-to': {
        title: 'How-To',
        description: 'Step-by-step tutorials and practical advice for achieving your goals',
    },
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
    const params = await props.params
    const category = params.category as BlogCategory
    const info = categoryInfo[category]

    if (!info) {
        return { title: 'Category Not Found' }
    }

    return {
        title: `${info.title} | Bucketly Blog`,
        description: info.description,
    }
}

export default async function CategoryPage(props: CategoryPageProps) {
    const params = await props.params
    const category = params.category as BlogCategory

    if (!categoryInfo[category]) {
        notFound()
    }

    const posts = await getPostsByCategory(category)
    const info = categoryInfo[category]

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <CategoryBadge category={category} className="text-lg px-4 py-2" />
                    </div>
                    <h1 className="font-display text-5xl font-bold mb-4">{info.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {info.description}
                    </p>
                </div>

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground text-lg">No posts in this category yet</p>
                        <Link href="/blog" className="text-primary hover:underline mt-2 inline-block">
                            View all posts
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
