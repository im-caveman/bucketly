"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface CompletionModalProps {
  isOpen: boolean
  itemTitle: string
  itemPoints: number
  onClose: () => void
  onSave: (memory: { photos: string[]; reflection: string; isPublic: boolean }) => void
}

export function CompletionModal({ isOpen, itemTitle, itemPoints, onClose, onSave }: CompletionModalProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [reflection, setReflection] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target?.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSave = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onSave({ photos, reflection, isPublic })
      setPhotos([])
      setReflection("")
      setIsPublic(false)
      setIsAnimating(false)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">Celebrate Your Achievement!</DialogTitle>
              <DialogDescription>
                {itemTitle} · +{itemPoints} points earned
              </DialogDescription>
            </div>
            <div className="text-5xl font-bold text-primary animate-bounce">{isAnimating ? "🎉" : "✓"}</div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Upload Photos or Videos</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const files = e.dataTransfer.files
                const event = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>
                handleFileUpload(event)
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <div className="text-3xl mb-2">📸</div>
                <p className="font-semibold">Drag and drop photos or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports multiple files</p>
              </label>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reflection Text */}
          <div>
            <Label htmlFor="reflection" className="text-base font-semibold mb-2 block">
              Your Reflection
            </Label>
            <Textarea
              id="reflection"
              placeholder="Share your experience, feelings, and memories from this achievement..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground mt-1">{reflection.length}/500 characters</p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold">Share Publicly</p>
              <p className="text-sm text-muted-foreground">Others can see and celebrate your achievement</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Points Display */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Points Earned</p>
              <Badge className="text-lg px-3 py-1 bg-primary text-primary-foreground">+{itemPoints}</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 gap-2" size="lg">
              <span>💾</span>
              Save to Memories
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
