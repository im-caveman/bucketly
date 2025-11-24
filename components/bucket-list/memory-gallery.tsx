"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { fetchMemoriesForItem } from "@/lib/bucket-list-service"
import { Eye, EyeOff, Calendar } from "lucide-react"
import { MemoryDetailDialog } from "./memory-detail-dialog"

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

interface MemoryGalleryProps {
  itemId: string
  currentUserId?: string
  onEdit?: (memory: Memory) => void
  onDelete?: (memoryId: string) => void
}

export function MemoryGallery({ itemId, currentUserId, onEdit, onDelete }: MemoryGalleryProps) {
  const { toast } = useToast()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  useEffect(() => {
    loadMemories()
  }, [itemId])

  const loadMemories = async () => {
    setIsLoading(true)
    try {
      const data = await fetchMemoriesForItem(itemId)
      
      // Filter memories based on privacy and ownership
      const filteredMemories = data.filter((memory: Memory) => {
        if (memory.user_id === currentUserId) {
          return true // Show all own memories
        }
        return memory.is_public // Show only public memories from others
      })
      
      setMemories(filteredMemories)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory)
  }

  const handleCloseDetail = () => {
    setSelectedMemory(null)
  }

  const handleEdit = (memory: Memory) => {
    setSelectedMemory(null)
    if (onEdit) {
      onEdit(memory)
    }
  }

  const handleDelete = async (memoryId: string) => {
    setSelectedMemory(null)
    if (onDelete) {
      onDelete(memoryId)
    }
    // Reload memories after deletion
    await loadMemories()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (memories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="font-display font-bold text-lg mb-2">No memories yet</h3>
          <p className="text-sm text-muted-foreground text-center">
            Complete this item and upload your first memory!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl">
            Memories ({memories.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((memory) => (
            <Card 
              key={memory.id} 
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleMemoryClick(memory)}
            >
              {memory.photos && memory.photos.length > 0 && (
                <div className="relative aspect-video">
                  <img
                    src={memory.photos[0]}
                    alt="Memory"
                    className="w-full h-full object-cover"
                  />
                  {memory.photos.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      +{memory.photos.length - 1} more
                    </Badge>
                  )}
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(memory.created_at).toLocaleDateString()}
                  </div>
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
                
                <p className="text-sm line-clamp-3">
                  {memory.reflection}
                </p>

                {memory.profiles && memory.user_id !== currentUserId && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {memory.profiles.avatar_url && (
                      <img
                        src={memory.profiles.avatar_url}
                        alt={memory.profiles.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      by {memory.profiles.username}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedMemory && (
        <MemoryDetailDialog
          memory={selectedMemory}
          isOpen={!!selectedMemory}
          onClose={handleCloseDetail}
          canEdit={selectedMemory.user_id === currentUserId}
          onEdit={() => handleEdit(selectedMemory)}
          onDelete={() => handleDelete(selectedMemory.id)}
        />
      )}
    </>
  )
}
