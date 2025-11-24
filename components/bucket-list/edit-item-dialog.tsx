"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { BucketListItem } from "@/types/bucket-list"

interface EditItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onItemUpdated: () => void
  item: BucketListItem
}

export function EditItemDialog({ isOpen, onClose, onItemUpdated, item }: EditItemDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description || "",
    points: item.points.toString(),
    difficulty: (item.difficulty || "medium") as "easy" | "medium" | "hard",
    location: item.location || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: item.title,
        description: item.description || "",
        points: item.points.toString(),
        difficulty: (item.difficulty || "medium") as "easy" | "medium" | "hard",
        location: item.location || "",
      })
      setErrors({})
    }
  }, [isOpen, item])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.title.length < 3 || formData.title.length > 200) {
      newErrors.title = "Title must be between 3 and 200 characters"
    }

    const points = parseInt(formData.points)
    if (isNaN(points) || points < 1 || points > 1000) {
      newErrors.points = "Points must be between 1 and 1000"
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
      const { updateBucketItem } = await import("@/lib/bucket-list-service")
      
      await updateBucketItem(item.id, {
        title: formData.title,
        description: formData.description || null,
        points: parseInt(formData.points),
        difficulty: formData.difficulty,
        location: formData.location || null,
      })

      toast({
        title: "Item updated",
        description: "Your bucket list item has been updated successfully.",
      })

      onItemUpdated()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bucket List Item</DialogTitle>
          <DialogDescription>
            Update the details of your bucket list item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Visit Japan"
                disabled={isSubmitting}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your bucket list item..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-points">
                  Points <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  min="1"
                  max="1000"
                  disabled={isSubmitting}
                />
                {errors.points && <p className="text-sm text-destructive">{errors.points}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setFormData({ ...formData, difficulty: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Tokyo, Japan"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
