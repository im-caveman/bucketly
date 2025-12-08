'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import { Edit, Trash2, Eye, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { BlogPostWithAuthor, BlogCategory, BlogStatus } from '@/types/blog'
import { getAllPostsAdminAction, deletePostAction } from '@/app/admin/blog/actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function BlogPostList() {
    const router = useRouter()
    const [posts, setPosts] = useState<BlogPostWithAuthor[]>([])
    const [filteredPosts, setFilteredPosts] = useState<BlogPostWithAuthor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all')
    const [categoryFilter, setCategoryFilter] = useState<BlogCategory | 'all'>('all')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)

    useEffect(() => {
        loadPosts()
    }, [])

    useEffect(() => {
        filterPosts()
    }, [posts, searchQuery, statusFilter, categoryFilter])

    const loadPosts = async () => {
        try {
            setIsLoading(true)
            const data = await getAllPostsAdminAction()
            setPosts(data)
        } catch (error) {
            console.error('Error loading posts:', error)
            toast.error('Failed to load blog posts')
        } finally {
            setIsLoading(false)
        }
    }

    const filterPosts = () => {
        let filtered = [...posts]

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((post) => post.status === statusFilter)
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter((post) => post.category === categoryFilter)
        }

        setFilteredPosts(filtered)
    }

    const handleEdit = (postId: string) => {
        router.push(`/admin/blog/${postId}/edit`)
    }

    const handleDelete = async () => {
        if (!postToDelete) return

        try {
            await deletePostAction(postToDelete)
            toast.success('Blog post deleted successfully')
            loadPosts()
        } catch (error) {
            console.error('Error deleting post:', error)
            toast.error('Failed to delete blog post')
        } finally {
            setDeleteDialogOpen(false)
            setPostToDelete(null)
        }
    }

    const openDeleteDialog = (postId: string) => {
        setPostToDelete(postId)
        setDeleteDialogOpen(true)
    }

    const getStatusBadge = (status: BlogStatus) => {
        const variants: Record<BlogStatus, { label: string; className: string }> = {
            draft: { label: 'Draft', className: 'bg-gray-500/10 text-gray-600' },
            published: { label: 'Published', className: 'bg-green-500/10 text-green-600' },
            archived: { label: 'Archived', className: 'bg-yellow-500/10 text-yellow-600' },
        }

        const variant = variants[status]
        return (
            <Badge variant="secondary" className={variant.className}>
                {variant.label}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading blog posts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BlogStatus | 'all')}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as BlogCategory | 'all')}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="challenge">Challenge</SelectItem>
                        <SelectItem value="inspiration">Inspiration</SelectItem>
                        <SelectItem value="how-to">How-To</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={() => router.push('/admin/blog/new')}>
                    Create New Post
                </Button>
            </div>

            {/* Posts Table */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">No blog posts found</p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium line-clamp-1">{post.title}</div>
                                            {post.is_featured && (
                                                <span className="text-xs text-yellow-600">⭐ Featured</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <CategoryBadge category={post.category} />
                                    </TableCell>
                                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {post.view_count}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(post.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(post.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this blog post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
