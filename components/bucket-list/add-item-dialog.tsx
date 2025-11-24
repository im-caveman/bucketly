"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { validateItemTitle, validatePoints, validateDifficulty } from "@/lib/validation"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"

interface AddItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
  listId: string
}

export function AddItemDialog({ isOpen, onClose, onItemAdded, listId }: AddItemDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "50",
    difficulty: "medium" as "easy" | "medium" | "hard",
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const titleValidation = validateItemTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }

    const points = parseInt(formData.points)
    const pointsValidation = validatePoints(points)
    if (!pointsValidation.isValid) {
      newErrors.points = pointsValidation.error!
    }

    const difficultyValidation = validateDifficulty(formData.difficulty)
    if (!difficultyValidation.isValid) {
      newErrors.difficulty = difficultyValidation.error!
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
      const { addBucketItem } = await import("@/lib/bucket-list-service")
      
      await addBucketItem(listId, {
        title: formData.title,
        description: formData.description || null,
        points: parseInt(formData.points),
        difficulty: formData.difficulty,
        location: formData.location || null,
      })

      toast({
        title: "Item added",
        description: "Your bucket list item has been added successfully.",
      })

      setFormData({
        title: "",
        description: "",
        points: "50",
        difficulty: "medium",
        location: "",
      })
      setErrors({})
      onItemAdded()
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
      setFormData({
        title: "",
        description: "",
        points: "50",
        difficulty: "medium",
        location: "",
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Bucket List Item</DialogTitle>
          <DialogDescription>
            Add a new item to your bucket list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Visit Japan"
                disabled={isSubmitting}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your bucket list item..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">
                  Points <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="points"
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
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setFormData({ ...formData, difficulty: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="difficulty">
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
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
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
