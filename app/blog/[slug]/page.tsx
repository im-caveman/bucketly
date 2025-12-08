import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPostBySlug, getRelatedPosts, incrementViewCount } from '@/lib/blog-service'
import { BlogContent } from '@/components/blog/BlogContent'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { SocialShare } from '@/components/blog/SocialShare'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { AuthorProfilePopup } from '@/components/blog/AuthorProfilePopup'

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
    try {
        const params = await props.params
        const post = await getPostBySlug(params.slug)

        const title = post.meta_title || post.title
        const description = post.meta_description || post.excerpt || ''
        const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bucketly.app'}/blog/${post.slug}`

        return {
            title: `${title} | Bucketly Blog`,
            description,
            keywords: post.tags,
            authors: [{ name: post.author.full_name || post.author.username }],
            openGraph: {
                title,
                description,
                type: 'article',
                url,
                images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
                publishedTime: post.published_at || undefined,
                modifiedTime: post.updated_at,
                authors: [post.author.full_name || post.author.username],
                tags: post.tags,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: post.cover_image_url ? [post.cover_image_url] : [],
            },
            alternates: {
                canonical: url,
            },
        }
    } catch (error) {
        return {
            title: 'Post Not Found | Bucketly Blog',
        }
    }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
    let post
    try {
        const params = await props.params
        post = await getPostBySlug(params.slug)
    } catch (error) {
        notFound()
    }

    // Get related posts
    const relatedPosts = await getRelatedPosts(post.id, post.tags, 3)

    // Increment view count (fire and forget)
    incrementViewCount(post.id).catch(console.error)

    const publishedDate = post.published_at ? new Date(post.published_at) : null
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bucketly.app'}/blog/${post.slug}`

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.title,
                        image: post.cover_image_url || '',
                        datePublished: post.published_at,
                        dateModified: post.updated_at,
                        author: {
                            '@type': 'Person',
                            name: post.author.full_name || post.author.username,
                            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bucketly.app'}/${post.author.username}`,
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'Bucketly',
                            logo: {
                                '@type': 'ImageObject',
                                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bucketly.app'}/logo.png`,
                            },
                        },
                        description: post.excerpt || '',
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': url,
                        },
                        keywords: post.tags.join(', '),
                    }),
                }}
            />

            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <CategoryBadge category={post.category} />
                                    {post.is_featured && (
                                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                            ⭐ Featured
                                        </span>
                                    )}
                                </div>

                                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                                    {post.title}
                                </h1>

                                {post.excerpt && (
                                    <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
                                )}

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                    {publishedDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(publishedDate, 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{post.reading_time_minutes} min read</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        <span>{post.view_count} views</span>
                                    </div>
                                </div>

                                {/* Author */}
                                <div className="pb-6 border-b">
                                    <AuthorProfilePopup
                                        userId={post.author.id}
                                        username={post.author.username}
                                        fullName={post.author.full_name || post.author.username}
                                        avatarUrl={post.author.avatar_url}
                                        bio={post.author.bio}
                                        stats={post.author.stats}
                                        social={post.author.social}
                                    />
                                </div>
                            </div>

                            {/* Cover Image */}
                            {post.cover_image_url && (
                                <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
                                    <Image
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <article className="mb-12">
                                <BlogContent content={post.content} />
                            </article>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-medium mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social Share */}
                            <div className="border-t pt-8">
                                <SocialShare
                                    url={url}
                                    title={post.title}
                                    description={post.excerpt || undefined}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-8">
                                {/* Author Card */}
                                <div className="border rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">About the Author</h3>
                                    <AuthorProfilePopup
                                        userId={post.author.id}
                                        username={post.author.username}
                                        fullName={post.author.full_name || post.author.username}
                                        avatarUrl={post.author.avatar_url}
                                        bio={post.author.bio}
                                        stats={post.author.stats}
                                        social={post.author.social}
                                    />
                                </div>

                                {/* Related Posts */}
                                {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
