"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { validateListName } from "@/lib/validation"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"
import type { BucketListWithItems } from "@/lib/bucket-list-service"

interface EditListDialogProps {
  isOpen: boolean
  onClose: () => void
  onListUpdated: () => void
  list: BucketListWithItems
}

export function EditListDialog({ isOpen, onClose, onListUpdated, list }: EditListDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: list.name,
    description: list.description || "",
    is_public: list.is_public,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const nameValidation = validateListName(formData.name)
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error!
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const { updateBucketList } = await import("@/lib/bucket-list-service")

      await updateBucketList(list.id, {
        name: formData.name,
        description: formData.description || null,
        is_public: formData.is_public,
      })

      toast({
        title: "List updated",
        description: "Your bucket list has been updated successfully.",
      })

      onListUpdated()
      onClose()
    } catch (error: any) {
      const apiError = handleSupabaseError(error)
      toast({
        title: "Error",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form to list values on close (or partial reset)
      // Actually best to keep edited values if reopen?
      // Standard practice: reset on cancel/close to avoid stale state.
      setFormData({
        name: list.name,
        description: list.description || "",
        is_public: list.is_public,
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bucket List</DialogTitle>
          <DialogDescription>
            Update the details of your bucket list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                List Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Travel the World"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your bucket list..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="is_public" className="font-semibold">Make Public</Label>
                <p className="text-sm text-muted-foreground">Others can find and follow your list</p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
