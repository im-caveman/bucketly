/**
 * Example Integration of Bucket Item Management Features
 * 
 * This file demonstrates how to integrate all the bucket item management
 * features into a list detail page. Copy the relevant parts to your actual
 * list detail page implementation.
 */

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ItemCard } from "@/components/bucket-list/item-card"
import { AddItemDialog } from "@/components/bucket-list/add-item-dialog"
import { EditItemDialog } from "@/components/bucket-list/edit-item-dialog"
import { DeleteItemDialog } from "@/components/bucket-list/delete-item-dialog"
import { ListProgress } from "@/components/bucket-list/list-progress"
import { FilterTabs } from "@/components/bucket-list/filter-tabs"
import { UploadMemoryDialog } from "@/components/bucket-list/upload-memory-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { fetchBucketListById } from "@/lib/bucket-list-service"
import { useAuth } from "@/contexts/auth-context"
import type { BucketListItem } from "@/types/bucket-list"
import Link from "next/link"

export default function ListDetailPageExample() {
  const params = useParams()
  const listId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [listData, setListData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  // Dialog states
  const [addItemDialog, setAddItemDialog] = useState(false)
  const [editItemDialog, setEditItemDialog] = useState<{ isOpen: boolean; item: BucketListItem | null }>({
    isOpen: false,
    item: null,
  })
  const [deleteItemDialog, setDeleteItemDialog] = useState<{
    isOpen: boolean
    itemId: string
    itemTitle: string
  }>({
    isOpen: false,
    itemId: "",
    itemTitle: "",
  })
  const [uploadMemoryDialog, setUploadMemoryDialog] = useState<{
    isOpen: boolean
    itemId: string
    itemTitle: string
  }>({
    isOpen: false,
    itemId: "",
    itemTitle: "",
  })

  // Load list data
  const loadListData = async () => {
    try {
      setIsLoading(true)
      const data = await fetchBucketListById(listId, user?.id)
      setListData(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load list data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadListData()
  }, [listId, user])

  // Check if current user is the owner
  const isOwner = user && listData && user.id === listData.user_id

  // Filter items
  const filteredItems = listData?.bucket_items?.filter((item: any) => {
    if (filter === "completed") return item.completed
    if (filter === "incomplete") return !item.completed
    return true
  }) || []

  // Handle item actions
  const handleEditItem = (item: BucketListItem) => {
    setEditItemDialog({ isOpen: true, item })
  }

  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    setDeleteItemDialog({ isOpen: true, itemId, itemTitle })
  }

  const handleUploadMemory = (itemId: string, itemTitle: string) => {
    setUploadMemoryDialog({ isOpen: true, itemId, itemTitle })
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!listData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">List not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
              <span className="text-4xl">{categoryIcons[listData.category]}</span>
              <h1 className="font-display text-4xl font-bold">{listData.name}</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-3">{listData.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{listData.follower_count.toLocaleString()} followers</Badge>
              <Badge variant="outline">Created by {listData.profiles.username}</Badge>
            </div>
          </div>
          {!isOwner && (
            <Button size="lg" className="gap-2 shrink-0">
              <span>❤️</span>
              Follow
            </Button>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <ListProgress items={listData.bucket_items} />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <FilterTabs filter={filter} onChange={setFilter} />
          {isOwner && (
            <Button onClick={() => setAddItemDialog(true)} className="gap-2">
              <span>+</span>
              Add Item
            </Button>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {filter === "completed" ? "No completed items yet" : "No items to do!"}
              </p>
              {isOwner && filter === "all" && (
                <Button onClick={() => setAddItemDialog(true)} className="mt-4">
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            filteredItems.map((item: any) => (
              <div key={item.id} className="relative group">
                <ItemCard
                  item={item}
                  onCompletionChange={loadListData}
                  onUploadMemory={() => handleUploadMemory(item.id, item.title)}
                />
                {isOwner && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditItem(item)}
                      className="bg-background"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="bg-background text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      {isOwner && (
        <>
          <AddItemDialog
            isOpen={addItemDialog}
            onClose={() => setAddItemDialog(false)}
            onItemAdded={loadListData}
            listId={listId}
          />

          {editItemDialog.item && (
            <EditItemDialog
              isOpen={editItemDialog.isOpen}
              onClose={() => setEditItemDialog({ isOpen: false, item: null })}
              onItemUpdated={loadListData}
              item={editItemDialog.item}
            />
          )}

          <DeleteItemDialog
            isOpen={deleteItemDialog.isOpen}
            onClose={() => setDeleteItemDialog({ isOpen: false, itemId: "", itemTitle: "" })}
            onItemDeleted={loadListData}
            itemId={deleteItemDialog.itemId}
            itemTitle={deleteItemDialog.itemTitle}
          />
        </>
      )}

      {/* Memory Upload Dialog - Available to all users for completed items */}
      {user && uploadMemoryDialog.itemId && (
        <UploadMemoryDialog
          isOpen={uploadMemoryDialog.isOpen}
          onClose={() => setUploadMemoryDialog({ isOpen: false, itemId: "", itemTitle: "" })}
          onMemoryUploaded={loadListData}
          itemId={uploadMemoryDialog.itemId}
          itemTitle={uploadMemoryDialog.itemTitle}
          userId={user.id}
        />
      )}
    </div>
  )
}
