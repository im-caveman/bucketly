'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BlogContent } from '@/components/blog/BlogContent'
import { generateSlug, calculateReadingTime } from '@/lib/blog-utils'
import type { BlogPost, BlogCategory, BlogStatus } from '@/types/blog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, FileText } from 'lucide-react'

const blogPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long'),
    excerpt: z.string().max(160, 'Excerpt must be 160 characters or less').optional(),
    content: z.string().min(1, 'Content is required'),
    cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    category: z.enum(['guide', 'challenge', 'inspiration', 'how-to']),
    tags: z.string(), // Comma-separated tags
    status: z.enum(['draft', 'published', 'archived']),
    meta_title: z.string().max(60, 'Meta title too long').optional(),
    meta_description: z.string().max(160, 'Meta description too long').optional(),
    is_featured: z.boolean(),
})

type BlogPostFormValues = z.infer<typeof blogPostSchema>

interface BlogEditorProps {
    post?: BlogPost
    onSave: (data: BlogPostFormValues) => Promise<void>
    onCancel?: () => void
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: post
            ? {
                ...post,
                tags: post.tags.join(', '),
                cover_image_url: post.cover_image_url || '',
                excerpt: post.excerpt || '',
                meta_title: post.meta_title || '',
                meta_description: post.meta_description || '',
            }
            : {
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                cover_image_url: '',
                category: 'guide' as BlogCategory,
                tags: '',
                status: 'draft' as BlogStatus,
                meta_title: '',
                meta_description: '',
                is_featured: false,
            },
    })

    const watchTitle = watch('title')
    const watchContent = watch('content')
    const watchStatus = watch('status')
    const watchIsFeatured = watch('is_featured')

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        setValue('title', title)
        if (!post) {
            // Only auto-generate for new posts
            setValue('slug', generateSlug(title))
        }
    }

    const readingTime = watchContent ? calculateReadingTime(watchContent) : 0

    const onSubmit = async (data: BlogPostFormValues) => {
        setIsSubmitting(true)
        try {
            await onSave(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        {...register('title')}
                        onChange={handleTitleChange}
                        placeholder="Enter blog post title"
                    />
                    {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="url-friendly-slug"
                    />
                    {errors.slug && (
                        <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt (160 chars max)</Label>
                <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="Brief summary for SEO and preview cards"
                    rows={2}
                    maxLength={160}
                />
                {errors.excerpt && (
                    <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
            </div>

            {/* Content with Preview */}
            <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown) *</Label>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Edit
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Preview
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="mt-2">
                        <Textarea
                            id="content"
                            {...register('content')}
                            placeholder="Write your blog post in Markdown..."
                            rows={20}
                            className="font-mono text-sm"
                        />
                        {errors.content && (
                            <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            Reading time: ~{readingTime} min
                        </p>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-2">
                        <div className="border rounded-lg p-6 min-h-[400px] bg-background">
                            {watchContent ? (
                                <BlogContent content={watchContent} />
                            ) : (
                                <p className="text-muted-foreground text-center py-12">
                                    No content to preview
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                    id="cover_image_url"
                    {...register('cover_image_url')}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                />
                {errors.cover_image_url && (
                    <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
                )}
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                        value={watch('category')}
                        onValueChange={(value) => setValue('category', value as BlogCategory)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="challenge">Challenge</SelectItem>
                            <SelectItem value="inspiration">Inspiration</SelectItem>
                            <SelectItem value="how-to">How-To</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                        id="tags"
                        {...register('tags')}
                        placeholder="fitness, wellness, productivity"
                    />
                    {errors.tags && (
                        <p className="text-sm text-destructive">{errors.tags.message}</p>
                    )}
                </div>
            </div>

            {/* SEO Meta Tags */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">SEO Settings (Optional)</h3>

                <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title (60 chars max)</Label>
                    <Input
                        id="meta_title"
                        {...register('meta_title')}
                        placeholder="Override default title for SEO"
                        maxLength={60}
                    />
                    {errors.meta_title && (
                        <p className="text-sm text-destructive">{errors.meta_title.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description (160 chars max)</Label>
                    <Textarea
                        id="meta_description"
                        {...register('meta_description')}
                        placeholder="Override default description for SEO"
                        rows={2}
                        maxLength={160}
                    />
                    {errors.meta_description && (
                        <p className="text-sm text-destructive">{errors.meta_description.message}</p>
                    )}
                </div>
            </div>

            {/* Status and Featured */}
            <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="status">Status:</Label>
                        <Select
                            value={watchStatus}
                            onValueChange={(value) => setValue('status', value as BlogStatus)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="is_featured"
                            checked={watchIsFeatured}
                            onCheckedChange={(checked) => setValue('is_featured', checked)}
                        />
                        <Label htmlFor="is_featured" className="cursor-pointer">
                            Featured Post
                        </Label>
                    </div>
                </div>

                <div className="flex gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
