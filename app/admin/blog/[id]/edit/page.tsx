'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { getPostByIdAction, updatePostAction } from '@/app/admin/blog/actions'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'

export default function EditBlogPostPage() {
    const router = useRouter()
    const params = useParams()
    const postId = params.id as string

    const [post, setPost] = useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadPost()
    }, [postId])

    const loadPost = async () => {
        try {
            setIsLoading(true)
            const data = await getPostByIdAction(postId)
            setPost(data)
        } catch (error) {
            console.error('Error loading post:', error)
            toast.error('Failed to load blog post')
            router.push('/admin')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (data: any) => {
        try {
            await updatePostAction(postId, data)
            toast.success('Blog post updated successfully!')
            loadPost() // Reload to get updated data
        } catch (error: any) {
            console.error('Error updating post:', error)
            toast.error(error.message || 'Failed to update blog post')
        }
    }

    const handleCancel = () => {
        router.push('/admin')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading blog post...</p>
                </div>
            </div>
        )
    }

    if (!post) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/admin">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Edit Blog Post</CardTitle>
                        <CardDescription>
                            Update your blog post content and settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BlogEditor post={post} onSave={handleSave} onCancel={handleCancel} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
