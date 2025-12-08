'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogSearchWrapper } from '@/components/blog/BlogSearchWrapper'
import type { BlogCategory, BlogPost } from '@/types/blog'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BlogPage() {
    const searchParams = useSearchParams()
    const category = searchParams.get('category') as BlogCategory | null
    const search = searchParams.get('search') || ''

    const [allPosts, setAllPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch all posts once on mount
    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch('/api/blog/posts')
                const data = await response.json()
                setAllPosts(data)
            } catch (error) {
                console.error('Error fetching posts:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    // Filter posts client-side
    const filteredPosts = useMemo(() => {
        let filtered = allPosts

        // Filter by category
        if (category) {
            filtered = filtered.filter(post => post.category === category)
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase()
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.excerpt?.toLowerCase().includes(searchLower) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchLower))
            )
        }

        return filtered
    }, [allPosts, category, search])

    const featuredPosts = useMemo(() => {
        if (category || search) return []
        return allPosts.filter(post => post.is_featured).slice(0, 3)
    }, [allPosts, category, search])

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="h-10 w-10 text-primary" />
                        <h1 className="font-display text-5xl font-bold">Blog</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Guides, challenges, and inspiration to help you complete your bucket list
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-8">
                    <BlogSearchWrapper defaultValue={search} />
                </div>

                {/* Category Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="grid w-full max-w-2xl grid-cols-5 bg-muted p-1 rounded-lg">
                        {[
                            { value: 'all', label: 'All', href: '/blog' },
                            { value: 'guide', label: 'Guides', href: '/blog?category=guide' },
                            { value: 'challenge', label: 'Challenges', href: '/blog?category=challenge' },
                            { value: 'inspiration', label: 'Inspiration', href: '/blog?category=inspiration' },
                            { value: 'how-to', label: 'How-To', href: '/blog?category=how-to' },
                        ].map((cat) => {
                            const isActive = (category || 'all') === cat.value
                            return (
                                <Link
                                    key={cat.value}
                                    href={cat.href}
                                    className={cn(
                                        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        isActive
                                            ? "bg-background text-foreground shadow-sm"
                                            : "hover:bg-background/50 text-muted-foreground"
                                    )}
                                >
                                    {cat.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-muted-foreground">Loading posts...</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Posts */}
                        {featuredPosts.length > 0 && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-bold mb-6">Featured Posts</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredPosts.map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Posts */}
                        <div>
                            {featuredPosts.length > 0 && (
                                <h2 className="text-3xl font-bold mb-6">All Posts</h2>
                            )}

                            {filteredPosts.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg">
                                    <p className="text-muted-foreground text-lg">No blog posts found</p>
                                    {(category || search) && (
                                        <Link href="/blog" className="text-primary hover:underline mt-2 inline-block">
                                            Clear filters
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPosts.map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
