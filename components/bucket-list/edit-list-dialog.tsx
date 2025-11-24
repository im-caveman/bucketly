"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { updateBucketList, type UpdateBucketListData } from "@/lib/bucket-list-service"
import type { Category } from "@/types/bucket-list"

interface EditListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  currentName: string
  currentDescription: string
  currentCategory: Category
  currentIsPublic: boolean
  onSuccess?: () => void
}

const categoriesList = [
  { id: "adventures", label: "Adventures", icon: "🎯" },
  { id: "places", label: "Places", icon: "🌍" },
  { id: "cuisines", label: "Cuisines", icon: "🍽️" },
  { id: "books", label: "Books", icon: "📚" },
  { id: "songs", label: "Songs", icon: "🎵" },
  { id: "monuments", label: "Monuments", icon: "🏛️" },
  { id: "acts-of-service", label: "Acts of Service", icon: "🤝" },
  { id: "miscellaneous", label: "Miscellaneous", icon: "✨" },
] as const

export function EditListDialog({
  open,
  onOpenChange,
  listId,
  currentName,
  currentDescription,
  currentCategory,
  currentIsPublic,
  onSuccess,
}: EditListDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription)
  const [category, setCategory] = useState<Category>(currentCategory)
  const [isPublic, setIsPublic] = useState(currentIsPublic)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(currentName)
      setDescription(currentDescription)
      setCategory(currentCategory)
      setIsPublic(currentIsPublic)
      setValidationError(null)
    }
  }, [open, currentName, currentDescription, currentCategory, currentIsPublic])

  const validateForm = () => {
    if (!name.trim()) {
      setValidationError("List name is required")
      return false
    }
    if (name.trim().length < 3) {
      setValidationError("List name must be at least 3 characters")
      return false
    }
    if (name.trim().length > 100) {
      setValidationError("List name must be less than 100 characters")
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const updates: UpdateBucketListData = {
        name: name.trim(),
        description: description.trim() || null,
        category,
        is_public: isPublic,
      }

      await updateBucketList(listId, updates)

      toast({
        title: "Success!",
        description: "Bucket list updated successfully",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error updating bucket list:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update bucket list",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bucket List</DialogTitle>
          <DialogDescription>Make changes to your bucket list details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-name">List Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (validationError) setValidationError(null)
              }}
              placeholder="e.g., Travel the World"
            />
            {validationError && <p className="text-sm text-destructive mt-1">{validationError}</p>}
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              className="min-h-20"
            />
          </div>

          <div>
            <Label className="mb-2 block">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as Category)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    category === cat.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <p className="font-semibold text-sm mt-1">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold">Make Public</p>
              <p className="text-sm text-muted-foreground">Others can find and follow your list</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
