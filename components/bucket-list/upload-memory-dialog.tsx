"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { X, Upload } from "lucide-react"
import { createMemory, uploadMemoryPhoto } from "@/lib/bucket-list-service"
import { validateReflection, validateFileSize, validateImageType } from "@/lib/validation"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"

interface UploadMemoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onMemoryUploaded: () => void
  itemId: string
  itemTitle: string
  userId: string
  initialData?: {
    reflection: string
    photos: string[]
  }
}

export function UploadMemoryDialog({
  isOpen,
  onClose,
  onMemoryUploaded,
  itemId,
  itemTitle,
  userId,
  initialData
}: UploadMemoryDialogProps) {
  const { toast } = useToast()
  const [reflection, setReflection] = useState(initialData?.reflection || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.photos || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const reflectionValidation = validateReflection(reflection)
    if (!reflectionValidation.isValid) {
      newErrors.reflection = reflectionValidation.error!
    }

    selectedFiles.forEach((file, index) => {
      const sizeValidation = validateFileSize(file, 10)
      if (!sizeValidation.isValid) {
        newErrors[`photo_${index}`] = `Photo ${index + 1}: ${sizeValidation.error}`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate file types
    const validFiles = files.filter(file => {
      const typeValidation = validateImageType(file)
      if (!typeValidation.isValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name}: ${typeValidation.error}`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))

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
      // Upload photos first
      const photoUrls: string[] = []
      for (const file of selectedFiles) {
        const url = await uploadMemoryPhoto(userId, file)
        photoUrls.push(url)
      }

      // Create memory record
      await createMemory(userId, {
        bucket_item_id: itemId,
        reflection,
        photos: photoUrls,
        is_public: false,
      })

      toast({
        title: "Memory uploaded! 📸",
        description: "Your memory has been saved successfully.",
      })

      // Reset form
      setReflection("")
      setSelectedFiles([])
      setPreviewUrls([])
      setErrors({})

      onMemoryUploaded()
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
      setReflection("")
      setSelectedFiles([])
      setPreviewUrls([])
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Memory</DialogTitle>
          <DialogDescription>
            Share your experience completing &quot;{itemTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Photo Upload Section */}
            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="space-y-3">
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
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
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {previewUrls.length > 0 ? "Add More Photos" : "Upload Photos"}
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
                placeholder="Share your thoughts, feelings, and experiences about completing this item..."
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

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
