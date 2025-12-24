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
import { fetchBucketListById, toggleItemCompletion, createMemory, uploadMemoryPhoto, fetchUserMemoryForItem, deleteMemory, cloneBucketList, followBucketList, unfollowBucketList, fetchUserBucketLists, type BucketListWithItems } from "@/lib/bucket-list-service"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, ShieldCheck, Bookmark, Lock, Info, Plus, Pencil, Trash2 } from "lucide-react"
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { UploadMemoryDialog } from "@/components/bucket-list/upload-memory-dialog"
import { AddItemDialog } from "@/components/bucket-list/add-item-dialog"
import { EditListDialog } from "@/components/bucket-list/edit-list-dialog"
import { DeleteListDialog } from "@/components/bucket-list/delete-list-dialog"
import { useRouter } from "next/navigation"

export function ListDetailClient() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [list, setList] = useState<BucketListWithItems | null>(null)
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
    const [followLoading, setFollowLoading] = useState(false)

    // Management dialogs state
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isEditListOpen, setIsEditListOpen] = useState(false)
    const [isDeleteListOpen, setIsDeleteListOpen] = useState(false)

    // Check if current user is owner
    const isOwner = user?.id === list?.user_id

    const loadList = async () => {
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

    useEffect(() => {
        loadList()
    }, [params.id, user?.id])

    const filteredItems = items.filter((item) => {
        if (filter === "completed") return item.completed
        if (filter === "incomplete") return !item.completed
        return true
    })

    const handleFollowToggle = async () => {
        if (!user || !list) return

        setFollowLoading(true)

        try {
            if (list.isFollowing) {
                // Handle Unfollow
                await unfollowBucketList(user.id, list.id)
                // Don't decrement follower count as it represents all-time copies
                setList(prev => prev ? { ...prev, isFollowing: false } : null)
                toast.success("Unfollowed list")
            } else {
                // Handle Follow
                await followBucketList(user.id, list.id)
                setList(prev => prev ? { ...prev, isFollowing: true, follower_count: (prev.follower_count || 0) + 1 } : null)
                toast.success("List added to your collection! 🎉")

                // Find and redirect to the shadow copy
                // We delay slightly to allow propagation though not strictly necessary if pure db
                const lists = await fetchUserBucketLists(user.id)
                const shadowCopy = lists.find(l => l.origin_id === list.id)

                if (shadowCopy) {
                    router.push(`/list/${shadowCopy.id}`)
                } else {
                    // Fallback if we can't find it immediately (e.g. latency)
                    toast.info("Check 'My Lists' to see your new copy")
                }
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error)
            toast.error("Failed to update follow status")
        } finally {
            setFollowLoading(false)
        }
    }

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
                    await deleteMemory((userMemory as any).id, user.id)
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
    const isShadowClone = !!list.origin_id

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-6 border-b border-border/50">
                <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-2 py-0">
                            {list.category}
                        </Badge>
                        {isShadowClone ? (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                <Bookmark className="h-3 w-3" />
                                Followed List
                            </Badge>
                        ) : isOwner ? (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                <ShieldCheck className="h-3 w-3" />
                                Created List
                            </Badge>
                        ) : null}
                    </div>

                    <div className="flex items-start gap-4">
                        <span className="text-3xl md:text-4xl mt-1 shrink-0">{categoryIcons[list.category] || "✨"}</span>
                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text leading-tight break-words">
                            {list.name}
                        </h1>
                    </div>

                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed line-clamp-3 md:line-clamp-none">
                        {list.description}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap pt-1">
                        <Badge variant="secondary" className="bg-muted/50 whitespace-nowrap text-[10px] uppercase tracking-wider font-semibold">
                            {list.follower_count.toLocaleString()} followers
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">
                            By {list.profiles?.username || "Unknown"}
                        </Badge>
                        {!list.is_public && (
                            <Badge variant="outline" className="bg-muted/30 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">
                                Private
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-1 md:justify-end">
                    {/* Action Buttons - ONLY for non-clones */}
                    {isOwner && !isShadowClone && (
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsAddItemOpen(true)} className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 px-6">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                            <div className="flex items-center gap-1.5 pl-1.5 border-l border-border/50">
                                <Button variant="outline" size="icon" onClick={() => setIsEditListOpen(true)} className="rounded-full h-9 w-9 border-primary/20 hover:border-primary hover:bg-primary/5">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit List</span>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setIsDeleteListOpen(true)} className="rounded-full h-9 w-9 border-destructive/20 hover:border-destructive hover:bg-destructive/5 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete List</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {isShadowClone && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 rounded-full text-[11px] text-blue-500 border border-blue-500/10 shadow-sm animate-in slide-in-from-right-2 duration-300">
                            <Lock className="h-3 w-3" />
                            <span className="font-bold uppercase tracking-wider">Read-only copy</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 cursor-help ml-0.5 opacity-70 hover:opacity-100 transition-opacity" />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                        <p>This is a tracked copy of a public list. You can update your own progress, but the list structure and details cannot be changed.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}

                    {!isOwner && (
                        <Button
                            size="lg"
                            className="rounded-full gap-2 transition-all active:scale-95 shadow-md px-6"
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            variant={list.isFollowing ? "secondary" : "default"}
                        >
                            {followLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <span>{list.isFollowing ? "✓" : "➕"}</span>
                            )}
                            {list.isFollowing ? "Following" : "Follow List"}
                        </Button>
                    )}

                    <div className="pl-1.5 border-l border-border/50 ml-1.5">
                        <SocialShare
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            title={`Check out this bucket list: ${list.name}`}
                            description={list.description || undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="pt-2">
                <ListProgress items={items} />
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <FilterTabs filter={filter} onChange={setFilter} />
                    <div className="hidden md:block text-sm text-muted-foreground font-medium">
                        Total potential: <span className="text-primary">{totalListPoints} points</span>
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-muted/20">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No items found</h3>
                            <p className="text-muted-foreground">
                                {filter === "completed" ? "Start checking off your goals!" : "You've finished everything here!"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredItems.map((item) => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onToggle={isOwner ? () => handleToggleItem(item.id) : undefined}
                                    readonly={!isOwner}
                                    onUploadMemory={isOwner ? () => {
                                        setUploadMemoryModal({ isOpen: true, item })
                                    } : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals & Dialogs */}
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

            {isOwner && !isShadowClone && (
                <>
                    <AddItemDialog
                        isOpen={isAddItemOpen}
                        onClose={() => setIsAddItemOpen(false)}
                        onItemAdded={() => {
                            loadList()
                            setIsAddItemOpen(false)
                        }}
                        listId={list.id}
                        category={list.category}
                    />

                    <EditListDialog
                        isOpen={isEditListOpen}
                        onClose={() => setIsEditListOpen(false)}
                        onListUpdated={() => {
                            loadList()
                            setIsEditListOpen(false)
                        }}
                        list={list}
                    />

                    <DeleteListDialog
                        isOpen={isDeleteListOpen}
                        onClose={() => setIsDeleteListOpen(false)}
                        onListDeleted={() => {
                            router.push(`/profile/${user?.user_metadata?.username || ''}`)
                        }}
                        listId={list.id}
                        listName={list.name}
                    />
                </>
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
