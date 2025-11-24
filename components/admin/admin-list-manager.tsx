"use client"

import { useState } from "react"
import { usePublicBucketLists } from "@/hooks/use-bucket-lists"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AdminListManager() {
    const { bucketLists, isLoading, isError, mutate } = usePublicBucketLists()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [listToDelete, setListToDelete] = useState<string | null>(null)

    const handleDelete = async (listId: string) => {
        setDeletingId(listId)

        try {
            const { error } = await supabase
                .from('bucket_lists')
                .delete()
                .eq('id', listId)

            if (error) throw error

            toast.success("List deleted successfully")
            mutate() // Refresh the list
        } catch (error: any) {
            console.error('Error deleting list:', error)
            toast.error(error.message || "Failed to delete list")
        } finally {
            setDeletingId(null)
            setListToDelete(null)
        }
    }

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading public lists...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load lists</p>
                <Button onClick={() => mutate()} variant="outline">
                    Retry
                </Button>
            </div>
        )
    }

    if (!bucketLists || bucketLists.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No public lists yet</p>
                <p className="text-sm text-muted-foreground">
                    Create your first public list using the "Create Public List" tab
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Public Bucket Lists ({bucketLists.length})</h3>
                </div>

                <div className="grid gap-4">
                    {bucketLists.map((list) => (
                        <Card key={list.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-display font-bold text-lg truncate">{list.name}</h4>
                                            <Badge variant="secondary" className="shrink-0">
                                                {list.category}
                                            </Badge>
                                        </div>

                                        {list.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {list.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{list.bucket_items?.length || 0} items</span>
                                            <span>{list.follower_count} followers</span>
                                            <span>Created by {list.profiles?.username || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/explore`, '_blank')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setListToDelete(list.id)}
                                            disabled={deletingId === list.id}
                                        >
                                            {deletingId === list.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!listToDelete} onOpenChange={(open) => !open && setListToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Public List?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this bucket list and all its items. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => listToDelete && handleDelete(listToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
