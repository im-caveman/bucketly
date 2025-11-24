"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { X, Upload } from "lucide-react"
import { updateMemory, uploadMemoryPhoto, deleteMemoryPhoto } from "@/lib/bucket-list-service"

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

interface EditMemoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onMemoryUpdated: () => void
  memory: Memory
  userId: string
}

export function EditMemoryDialog({ 
  isOpen, 
  onClose, 
  onMemoryUpdated, 
  memory,
  userId 
}: EditMemoryDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reflection, setReflection] = useState(memory.reflection)
  const [isPublic, setIsPublic] = useState(memory.is_public)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(memory.photos || [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Reset form when memory changes
    setReflection(memory.reflection)
    setIsPublic(memory.is_public)
    setExistingPhotos(memory.photos || [])
    setNewFiles([])
    setNewPreviewUrls([])
    setPhotosToDelete([])
    setErrors({})
  }, [memory])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (reflection.length < 10 || reflection.length > 5000) {
      newErrors.reflection = "Reflection must be between 10 and 5000 characters"
    }

    newFiles.forEach((file, index) => {
      if (file.size > 10 * 1024 * 1024) {
        newErrors[`photo_${index}`] = `Photo ${index + 1} exceeds 10MB limit`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
      }
      return isImage
    })

    setNewFiles(prev => [...prev, ...validFiles])

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(prev => prev.filter(url => url !== photoUrl))
    setPhotosToDelete(prev => [...prev, photoUrl])
  }

  const removeNewPhoto = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index))
    
    // Clear the specific error if it exists
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`photo_${index}`]
      return newErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Delete removed photos from storage
      for (const photoUrl of photosToDelete) {
        try {
          await deleteMemoryPhoto(photoUrl)
        } catch (error) {
          console.error('Error deleting photo:', error)
          // Continue even if deletion fails
        }
      }

      // Upload new photos
      const newPhotoUrls: string[] = []
      for (const file of newFiles) {
        const url = await uploadMemoryPhoto(userId, file)
        newPhotoUrls.push(url)
      }

      // Combine existing and new photos
      const allPhotos = [...existingPhotos, ...newPhotoUrls]

      // Update memory record
      await updateMemory(memory.id, {
        reflection,
        photos: allPhotos,
        is_public: isPublic,
      })

      toast({
        title: "Memory updated! ✨",
        description: "Your changes have been saved successfully.",
      })

      // Reset form
      setNewFiles([])
      setNewPreviewUrls([])
      setPhotosToDelete([])
      setErrors({})
      
      onMemoryUpdated()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReflection(memory.reflection)
      setIsPublic(memory.is_public)
      setExistingPhotos(memory.photos || [])
      setNewFiles([])
      setNewPreviewUrls([])
      setPhotosToDelete([])
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Memory</DialogTitle>
          <DialogDescription>
            Update your reflection, photos, or privacy settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Photo Management Section */}
            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="space-y-3">
                {/* Existing Photos */}
                {existingPhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Photos</p>
                    <div className="grid grid-cols-2 gap-3">
                      {existingPhotos.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(url)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Photos */}
                {newPreviewUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New Photos</p>
                    <div className="grid grid-cols-2 gap-3">
                      {newPreviewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`New ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {errors[`photo_${index}`] && (
                            <p className="text-sm text-destructive mt-1">{errors[`photo_${index}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Photos
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 10MB per photo. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            {/* Reflection Text */}
            <div className="space-y-2">
              <Label htmlFor="reflection">
                Reflection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts, feelings, and experiences..."
                rows={6}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                {errors.reflection && (
                  <p className="text-sm text-destructive">{errors.reflection}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {reflection.length} / 5000 characters
                </p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between space-x-2 p-4 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is-public" className="cursor-pointer">
                  Make this memory public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Public memories can be seen by others in your social feed
                </p>
              </div>
              <Switch
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
