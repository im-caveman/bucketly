"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"

interface DeleteListDialogProps {
  isOpen: boolean
  onClose: () => void
  onListDeleted: () => void
  listId: string | null
  listName: string | null
}

export function DeleteListDialog({ isOpen, onClose, onListDeleted, listId, listName }: DeleteListDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Safety check to ensure body is unlocked when dialog closes or unmounts
  useEffect(() => {
    const cleanup = () => {
      document.body.style.pointerEvents = ""
    }

    if (!isOpen) {
      const timer = setTimeout(cleanup, 500)
      return () => clearTimeout(timer)
    }

    return cleanup
  }, [isOpen])

  const handleDelete = async () => {
    if (!listId) return
    setIsDeleting(true)

    try {
      const { deleteBucketList } = await import("@/lib/bucket-list-service")

      await deleteBucketList(listId)

      toast({
        title: "List deleted",
        description: "Your bucket list has been deleted successfully.",
      })

      onClose()
      // Wait a moment for the dialog to close before refreshing data
      setTimeout(() => {
        onListDeleted()
      }, 100)
    } catch (error: any) {
      const apiError = handleSupabaseError(error)
      toast({
        title: "Error",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bucket List?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{listName || 'this list'}&quot;</span>?
            This action cannot be undone. All items, progress, and memories associated with this list will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete List"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
