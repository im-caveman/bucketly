"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Eye, EyeOff, Calendar, Edit, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Memory {
  id: string
  user_id: string
  bucket_item_id: string
  reflection: string
  photos: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  profiles?: {
    username: string
    avatar_url: string | null
  }
}

interface MemoryDetailDialogProps {
  memory: Memory
  isOpen: boolean
  onClose: () => void
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

export function MemoryDetailDialog({ 
  memory, 
  isOpen, 
  onClose, 
  canEdit,
  onEdit,
  onDelete 
}: MemoryDetailDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    setShowDeleteConfirm(false)
    onDelete()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle>Memory Details</DialogTitle>
              <Badge variant={memory.is_public ? "default" : "secondary"} className="gap-1">
                {memory.is_public ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Private
                  </>
                )}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo Gallery */}
            {memory.photos && memory.photos.length > 0 && (
              <div className="relative">
                {memory.photos.length === 1 ? (
                  <img
                    src={memory.photos[0]}
                    alt="Memory"
                    className="w-full rounded-lg object-cover max-h-[400px]"
                  />
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {memory.photos.map((photo, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={photo}
                            alt={`Memory ${index + 1}`}
                            className="w-full rounded-lg object-cover max-h-[400px]"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(memory.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {memory.profiles && (
                <div className="flex items-center gap-2">
                  {memory.profiles.avatar_url && (
                    <img
                      src={memory.profiles.avatar_url}
                      alt={memory.profiles.username}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span>by {memory.profiles.username}</span>
                </div>
              )}
            </div>

            {/* Reflection */}
            <div className="space-y-2">
              <h4 className="font-semibold">Reflection</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {memory.reflection}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canEdit && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onEdit}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="sm:ml-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memory and all associated photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
