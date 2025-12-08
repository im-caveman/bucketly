'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { createPostAction } from '@/app/admin/blog/actions'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewBlogPostPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSave = async (data: any) => {
        if (!user) {
            toast.error('You must be logged in to create a post')
            return
        }

        setIsSubmitting(true)
        try {
            const newPost = await createPostAction(data, user.id)
            toast.success('Blog post created successfully!')
            router.push(`/admin/blog/${newPost.id}/edit`)
        } catch (error: any) {
            console.error('Error creating post:', error)
            toast.error(error.message || 'Failed to create blog post')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin')
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
                        <CardTitle className="text-3xl">Create New Blog Post</CardTitle>
                        <CardDescription>
                            Write and publish a new blog post for your audience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BlogEditor onSave={handleSave} onCancel={handleCancel} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
