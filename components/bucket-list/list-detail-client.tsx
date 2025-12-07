"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ItemCard } from "@/components/bucket-list/item-card"
import { ListProgress } from "@/components/bucket-list/list-progress"
import { FilterTabs } from "@/components/bucket-list/filter-tabs"
import { CompletionModal } from "@/components/bucket-list/completion-modal"
import { ListCompletionModal } from "@/components/bucket-list/list-completion-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { fetchBucketListById, toggleItemCompletion, createMemory, uploadMemoryPhoto, fetchUserMemoryForItem, deleteMemory, type BucketListWithItems } from "@/lib/bucket-list-service"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SocialShare } from "@/components/common/social-share"
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

import { UploadMemoryDialog } from "@/components/bucket-list/upload-memory-dialog"

export function ListDetailClient() {
    const params = useParams()
    const { user } = useAuth()
    const [list, setList] = useState<BucketListWithItems & { isFollowing: boolean } | null>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")
    const [completionModal, setCompletionModal] = useState<{ isOpen: boolean; item: any | null }>({
        isOpen: false,
        item: null,
    })
    const [showListCompletionModal, setShowListCompletionModal] = useState(false)
    const [uploadMemoryModal, setUploadMemoryModal] = useState<{ isOpen: boolean; item: any | null }>({
        isOpen: false,
        item: null,
    })
    const [uncheckDialog, setUncheckDialog] = useState<{ isOpen: boolean; itemId: string | null }>({
        isOpen: false,
        itemId: null
    })

    useEffect(() => {
        async function loadList() {
            if (!params.id) return

            try {
                setLoading(true)
                const data = await fetchBucketListById(params.id as string, user?.id)
                setList(data)
                setItems(data.bucket_items || [])
            } catch (err) {
                console.error("Error loading list:", err)
                setError("Failed to load list details")
                toast.error("Failed to load list details")
            } finally {
                setLoading(false)
            }
        }

        loadList()
    }, [params.id, user?.id])

    const filteredItems = items.filter((item) => {
        if (filter === "completed") return item.completed
        if (filter === "incomplete") return !item.completed
        return true
    })

    const handleCompletionModalClose = () => {
        setCompletionModal({ isOpen: false, item: null })

        // Check if all items are completed
        const allCompleted = items.length > 0 && items.every(i => i.completed)
        if (allCompleted) {
            setShowListCompletionModal(true)
        }
    }

    const handleToggleItem = async (id: string) => {
        const item = items.find((i) => i.id === id)
        if (!item) return

        // Optimistic update state to track visually, but logic decides if we revert or proceed
        const newCompleted = !item.completed

        // If Unchecking, check for memories first
        if (!newCompleted) {
            // Check if memory exists
            try {
                if (!user) return // Should be guarded already but safe keeping
                const userMemory = await fetchUserMemoryForItem(item.id, user.id)

                if (userMemory) {
                    // Open confirmation dialog
                    setUncheckDialog({ isOpen: true, itemId: id })
                    return // Stop here, wait for confirmation
                }
            } catch (err) {
                console.error("Error checking memories:", err)
            }
        }

        // Proceed with toggle if checking OR if unchecking but no memory
        await performToggle(id, newCompleted)
    }

    const handleConfirmUncheck = async () => {
        if (!uncheckDialog.itemId || !user) return

        // 1. Delete Memory
        const item = items.find(i => i.id === uncheckDialog.itemId)
        if (item) {
            try {
                // Find the user's memory to delete
                const userMemory = await fetchUserMemoryForItem(item.id, user.id)
                if (userMemory) {
                    await deleteMemory(userMemory.id, user.id)
                }
            } catch (err) {
                console.error("Error deleting memory during uncheck:", err)
                toast.error("Failed to delete associated memory")
                return
            }
        }

        // 2. Toggle Item to Incomplete
        await performToggle(uncheckDialog.itemId, false)
        setUncheckDialog({ isOpen: false, itemId: null })
    }

    const performToggle = async (id: string, newCompleted: boolean) => {
        // Optimistic update - use functional form to avoid stale closure
        setItems(prevItems => prevItems.map((i) => (i.id === id ? { ...i, completed: newCompleted } : i)))

        if (newCompleted) {
            const item = items.find(i => i.id === id)
            if (item) setCompletionModal({ isOpen: true, item })
        }

        try {
            await toggleItemCompletion(id, newCompleted)
            window.dispatchEvent(new CustomEvent('bucketly:item-update'))
            toast.success(newCompleted ? "Item completed! 🎉" : "Item marked as incomplete")
        } catch (error) {
            console.error("Failed to toggle item:", error)
            toast.error("Failed to update item")
            // Revert optimistic update - use functional form to avoid stale closure
            setItems(prevItems => prevItems.map((i) => (i.id === id ? { ...i, completed: !newCompleted } : i)))
        }
    }

    const handleSaveMemory = async (memory: { photos: File[]; reflection: string; isPublic: boolean }) => {
        if (!completionModal.item || !user) {
            console.error("Missing required data:", { hasItem: !!completionModal.item, hasUser: !!user })
            toast.error("Missing required information")
            return
        }

        console.log("Starting memory save process...", {
            itemId: completionModal.item.id,
            userId: user.id,
            photoCount: memory.photos.length,
            reflectionLength: memory.reflection.length,
            isPublic: memory.isPublic
        })

        try {
            const toastId = toast.loading("Saving memory...")

            // Upload photos first
            const photoUrls: string[] = []
            for (let i = 0; i < memory.photos.length; i++) {
                const file = memory.photos[i]
                console.log(`Uploading photo ${i + 1}/${memory.photos.length}:`, {
                    name: file.name,
                    size: file.size,
                    type: file.type
                })

                try {
                    const url = await uploadMemoryPhoto(user.id, file)
                    photoUrls.push(url)
                    console.log(`Photo ${i + 1} uploaded successfully:`, url)
                } catch (uploadError) {
                    console.error(`Failed to upload photo ${i + 1}:`, uploadError)
                    console.error("Upload error details:", JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2))
                    toast.dismiss(toastId)
                    toast.error(`Failed to upload photo: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
                    throw uploadError
                }
            }

            console.log("All photos uploaded successfully. Creating memory record...")

            // Create memory record
            try {
                await createMemory(user.id, {
                    bucket_item_id: completionModal.item.id,
                    reflection: memory.reflection,
                    photos: photoUrls,
                    is_public: memory.isPublic,
                })
                console.log("Memory record created successfully")
            } catch (createError) {
                console.error("Failed to create memory record:", createError)
                console.error("Create error details:", JSON.stringify(createError, Object.getOwnPropertyNames(createError), 2))
                toast.dismiss(toastId)
                toast.error(`Failed to save memory: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
                throw createError
            }

            toast.dismiss(toastId)
            toast.success("Memory saved successfully! 🎉")
            console.log("Memory save completed successfully")

            // Dispatch event for widget update
            window.dispatchEvent(new CustomEvent('bucketly:item-update'))
        } catch (error) {
            console.error("Failed to save memory (outer catch):", error)
            console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
            // Don't show duplicate error toast if already shown in inner catch
            throw error // Re-throw so CompletionModal knows it failed
        }
    }

    const categoryIcons: Record<string, string> = {
        adventures: "🎯",
        places: "🌍",
        cuisines: "🍽️",
        books: "📚",
        songs: "🎵",
        monuments: "🏛️",
        "acts-of-service": "🤝",
        miscellaneous: "✨",
        "travel": "✈️"
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !list) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">List not found</h1>
                <p className="text-muted-foreground">{error || "The list you are looking for does not exist."}</p>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        )
    }

    const totalListPoints = items.reduce((acc, item) => acc + (item.points || 0), 0)

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                                    ← Back
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-4xl">{categoryIcons[list.category] || "✨"}</span>
                            <h1 className="font-display text-4xl font-bold">{list.name}</h1>
                        </div>
                        {list.description && (
                            <p className="text-lg text-muted-foreground mb-3">{list.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{list.follower_count.toLocaleString()} followers</Badge>
                            <Badge variant="outline">Created by {list.profiles?.username || "Unknown"}</Badge>

                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <SocialShare
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            title={`Check out this bucket list: ${list.name}`}
                            description={list.description || undefined}
                        />
                        <Button size="lg" className="gap-2">
                            <span>❤️</span>
                            {list.isFollowing ? "Following" : "Follow"}
                        </Button>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="mb-8">
                    <ListProgress items={items} />
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <FilterTabs filter={filter} onChange={setFilter} />
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground">
                                {filter === "completed" ? "No completed items yet" : "No items to do!"}
                            </p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onToggle={() => handleToggleItem(item.id)}
                                onUploadMemory={() => {
                                    setUploadMemoryModal({ isOpen: true, item })
                                }}
                            />
                        ))
                    )}
                </div>
            </div>
            {completionModal.item && (
                <CompletionModal
                    isOpen={completionModal.isOpen}
                    itemTitle={completionModal.item.title}
                    itemId={completionModal.item.id}
                    itemPoints={completionModal.item.points}
                    onClose={handleCompletionModalClose}
                    onSave={handleSaveMemory}
                />
            )}

            <ListCompletionModal
                isOpen={showListCompletionModal}
                listTitle={list.name}
                listId={list.id}
                totalPoints={totalListPoints}
                onClose={() => setShowListCompletionModal(false)}
            />

            {user && uploadMemoryModal.item && (
                <UploadMemoryDialog
                    isOpen={uploadMemoryModal.isOpen}
                    onClose={() => setUploadMemoryModal({ isOpen: false, item: null })}
                    onMemoryUploaded={() => {
                        toast.success("Memory uploaded successfully!")
                    }}
                    itemId={uploadMemoryModal.item.id}
                    itemTitle={uploadMemoryModal.item.title}
                    userId={user.id}
                />
            )}

            <AlertDialog open={uncheckDialog.isOpen} onOpenChange={(open) => !open && setUncheckDialog({ ...uncheckDialog, isOpen: false })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Unchecking this item will <strong>delete the associated memory and timeline event</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUncheck} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Uncheck & Delete Memory
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
