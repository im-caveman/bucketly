"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { MemoryGallery } from "./memory-gallery"
import { UploadMemoryDialog } from "./upload-memory-dialog"
import { EditMemoryDialog } from "./edit-memory-dialog"
import { deleteMemory } from "@/lib/bucket-list-service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Memory {
  id: string
  user_id: string
  bucket_item_id: string
  reflection: string
  photos: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

interface MemoryManagerProps {
  itemId: string
  itemTitle: string
  userId: string
  isItemCompleted: boolean
  onMemoryChange?: () => void
}

export function MemoryManager({
  itemId,
  itemTitle,
  userId,
  isItemCompleted,
  onMemoryChange
}: MemoryManagerProps) {
  const { toast } = useToast()
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadClick = () => {
    if (!isItemCompleted) {
      toast({
        title: "Item not completed",
        description: "You need to complete this item before uploading a memory.",
        variant: "destructive",
      })
      return
    }
    setShowUploadDialog(true)
  }

  const handleMemoryUploaded = () => {
    setRefreshKey(prev => prev + 1)
    if (onMemoryChange) {
      onMemoryChange()
    }
  }

  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory)
    setShowEditDialog(true)
  }

  const handleMemoryUpdated = () => {
    setRefreshKey(prev => prev + 1)
    if (onMemoryChange) {
      onMemoryChange()
    }
  }

  const handleDeleteMemory = (memoryId: string) => {
    setMemoryToDelete(memoryId)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!memoryToDelete) return

    setIsDeleting(true)
    try {
      await deleteMemory(memoryToDelete)

      toast({
        title: "Memory deleted",
        description: "The memory and all associated photos have been removed.",
      })

      setRefreshKey(prev => prev + 1)
      if (onMemoryChange) {
        onMemoryChange()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setMemoryToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <MemoryGallery
        key={refreshKey}
        itemId={itemId}
        currentUserId={userId}
        onEdit={handleEditMemory}
        onDelete={handleDeleteMemory}
      />

      {showUploadDialog && (
        <UploadMemoryDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onMemoryUploaded={handleMemoryUploaded}
          itemId={itemId}
          itemTitle={itemTitle}
          userId={userId}
        />
      )}

      {showEditDialog && selectedMemory && (
        <EditMemoryDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setSelectedMemory(null)
          }}
          onMemoryUpdated={handleMemoryUpdated}
          memory={selectedMemory}
          userId={userId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memory and all associated photos from storage.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
