"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { validateItemTitle, validateDifficulty } from "@/lib/validation"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchGlobalItems } from "@/lib/bucket-list-service"
import type { Category } from "@/types/bucket-list"

interface AddItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
  listId: string
  category: Category
}

export function AddItemDialog({ isOpen, onClose, onItemAdded, listId, category }: AddItemDialogProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"search" | "custom">("search")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom item state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [globalItems, setGlobalItems] = useState<any[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  useEffect(() => {
    if (mode === "search" && isOpen) {
      const loadItems = async () => {
        setIsLoadingItems(true)
        try {
          const { data } = await fetchGlobalItems(category, searchQuery)
          setGlobalItems(data)
        } catch (error) {
          console.error("Failed to fetch items", error)
        } finally {
          setIsLoadingItems(false)
        }
      }

      // Debounce search
      const timer = setTimeout(loadItems, 300)
      return () => clearTimeout(timer)
    }
  }, [mode, searchQuery, isOpen, category])

  const validateCustomForm = () => {
    const newErrors: Record<string, string> = {}

    const titleValidation = validateItemTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }

    const difficultyValidation = validateDifficulty(formData.difficulty)
    if (!difficultyValidation.isValid) {
      newErrors.difficulty = difficultyValidation.error!
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { addBucketItem } = await import("@/lib/bucket-list-service")
      
      if (mode === "search") {
        if (!selectedItem) return

        await addBucketItem(listId, {
          title: selectedItem.title,
          description: selectedItem.description,
          points: selectedItem.points,
          difficulty: selectedItem.difficulty,
          location: selectedItem.location,
          target_value: selectedItem.target_value,
          unit_type: selectedItem.unit_type,
        })
      } else {
        if (!validateCustomForm()) {
          setIsSubmitting(false)
          return
        }

        await addBucketItem(listId, {
          title: formData.title,
          description: formData.description || null,
          points: 0, // Custom items always have 0 points
          difficulty: formData.difficulty,
          location: formData.location || null,
        })
      }

      toast({
        title: "Item added",
        description: "Your bucket list item has been added successfully.",
      })

      resetForm()
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "medium",
      location: "",
    })
    setErrors({})
    setSearchQuery("")
    setSelectedItem(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Bucket List Item</DialogTitle>
          <DialogDescription>
            Add an item to your bucket list. You can search for existing items (with points) or create a custom one (no points).
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-border pb-4">
          <Button
            variant={mode === "search" ? "default" : "ghost"}
            onClick={() => setMode("search")}
            className="flex-1 gap-2"
          >
            🔍 Search Items
          </Button>
          <Button
            variant={mode === "custom" ? "default" : "ghost"}
            onClick={() => setMode("custom")}
            className="flex-1 gap-2"
          >
            ✏️ Create Custom
          </Button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto">
          {mode === "search" ? (
            <div className="space-y-4">
              <Input
                placeholder="Search available items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="space-y-2">
                {isLoadingItems ? (
                  <div className="text-center py-8 text-muted-foreground">Loading items...</div>
                ) : globalItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found. Try a different search or create a custom item.
                  </div>
                ) : (
                  globalItems.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedItem?.id === item.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {item.difficulty && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.difficulty}
                                </Badge>
                              )}
                              {item.location && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  📍 {item.location}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-primary text-primary-foreground">+{item.points}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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

              <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                <p>Note: Custom items do not award points upon completion.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (mode === "search" && !selectedItem)}
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
