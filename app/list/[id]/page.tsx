"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ItemCard } from "@/components/bucket-list/item-card"
import { ListProgress } from "@/components/bucket-list/list-progress"
import { FilterTabs } from "@/components/bucket-list/filter-tabs"
import { CompletionModal } from "@/components/bucket-list/completion-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { fetchBucketListById, toggleItemCompletion, type BucketListWithItems } from "@/lib/bucket-list-service"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SocialShare } from "@/components/common/social-share"

export default function ListDetailPage() {
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

  const handleToggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    // Optimistic update
    const newCompleted = !item.completed
    setItems(items.map((i) => (i.id === id ? { ...i, completed: newCompleted } : i)))

    if (newCompleted) {
      setCompletionModal({ isOpen: true, item })
    }

    try {
      await toggleItemCompletion(id, newCompleted)

      // Dispatch event for widget update
      window.dispatchEvent(new CustomEvent('bucketly:item-update'))

      toast.success(newCompleted ? "Item completed! 🎉" : "Item marked as incomplete")
    } catch (error) {
      console.error("Failed to toggle item:", error)
      toast.error("Failed to update item")
      // Revert optimistic update
      setItems(items.map((i) => (i.id === id ? { ...i, completed: !newCompleted } : i)))
    }
  }

  const handleSaveMemory = (memory: { photos: string[]; reflection: string; isPublic: boolean }) => {
    console.log("[v0] Saved memory:", memory)
    setCompletionModal({ isOpen: false, item: null })
    // TODO: Call API to save memory
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
                  console.log("[v0] Opening memory upload for:", item.title)
                }}
              />
            ))
          )}
        </div>
      </div>
      {
        completionModal.item && (
          <CompletionModal
            isOpen={completionModal.isOpen}
            itemTitle={completionModal.item.title}
            itemPoints={completionModal.item.points}
            onClose={() => setCompletionModal({ isOpen: false, item: null })}
            onSave={handleSaveMemory}
          />
        )
      }
    </div >
  )
}
