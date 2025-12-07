"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareCardDownload, ShareCardVariant } from "@/components/share/ShareCardDownload"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface CompletionModalProps {
  isOpen: boolean
  itemTitle: string
  itemId: string
  itemPoints: number

  onClose: () => void
  onSave: (memory: { photos: File[]; reflection: string; isPublic: boolean }) => Promise<void> | void
}

export function CompletionModal({ isOpen, itemTitle, itemPoints, onClose, onSave, itemId }: CompletionModalProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [reflection, setReflection] = useState("")
  const [isPublic, setIsPublic] = useState(false)

  const [isAnimating, setIsAnimating] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareStyle, setShareStyle] = useState<ShareCardVariant>("illustration") // Default to illustration as per request
  const { user } = useAuth()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])

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

  const handleSave = async () => {
    // Validate reflection length (database constraint: 10-5000 characters)
    if (reflection.trim().length < 10) {
      toast.error("Please add a reflection of at least 10 characters")
      return
    }

    if (reflection.trim().length > 5000) {
      toast.error("Reflection is too long (maximum 5000 characters)")
      return
    }

    setIsAnimating(true)
    try {
      await onSave({ photos: selectedFiles, reflection: reflection.trim(), isPublic })

      // Show share screen
      setShowShare(true)
    } catch (error) {
      console.error("Failed to save:", error)
      console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } finally {
      setIsAnimating(false)
    }
  }

  const handleClose = () => {
    setShowShare(false)
    // Reset form state on close
    setPhotos([])
    setSelectedFiles([])
    setReflection("")
    setIsPublic(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {showShare ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Success! 🎉</DialogTitle>
            <DialogDescription>
              You've completed "{itemTitle}" and earned +{itemPoints} points!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Style Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose Card Style</Label>
              <Tabs defaultValue="illustration" value={shareStyle} onValueChange={(v) => setShareStyle(v as ShareCardVariant)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="illustration">Artistic</TabsTrigger>
                  <TabsTrigger value="classic">Classic</TabsTrigger>
                  <TabsTrigger value="vector">Pop Art</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ShareCardDownload
              title={itemTitle}
              points={itemPoints}
              username={user?.user_metadata?.username || "Bucketly User"}
              photo={photos[0]}
              itemId={itemId}
              variant={shareStyle}
              rank={42} // Hardcoded rank for now
            />

            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      ) : (
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
                        onClick={() => {
                          setPhotos(photos.filter((_, i) => i !== idx))
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
                        }}
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
              <p className="text-xs text-muted-foreground mt-1">{reflection.length}/5000 characters</p>
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
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2" size="lg" disabled={isAnimating}>
                {isAnimating ? <span className="animate-spin">⏳</span> : <span>💾</span>}
                {isAnimating ? "Saving..." : "Save to Memories"}
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
