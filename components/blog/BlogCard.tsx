'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CategoryBadge } from './CategoryBadge'
import { Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { BlogPostWithAuthor } from '@/types/blog'

interface BlogCardProps {
    post: BlogPostWithAuthor
}

export function BlogCard({ post }: BlogCardProps) {
    // Defensive check
    if (!post) return null

    const publishedDate = post.published_at
        ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
        : 'Draft'

    const authorName = post.author?.full_name || post.author?.username || 'Unknown Author'
    const authorInitials = post.author?.username?.charAt(0).toUpperCase() || 'A'

    return (
        <Link href={`/blog/${post.slug}`} className="group">
            <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full flex flex-col">
                {/* Cover Image */}
                {post.cover_image_url && (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                        <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}

                <CardHeader className="flex-none">
                    <div className="flex items-center gap-2 mb-2">
                        <CategoryBadge category={post.category} />
                        {post.is_featured && (
                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                ⭐ Featured
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </CardHeader>

                <CardContent className="flex-1">
                    {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.excerpt}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex-none flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author?.avatar_url || undefined} />
                            <AvatarFallback>
                                {authorInitials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                            {authorName}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.reading_time_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.view_count}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
