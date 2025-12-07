"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { fetchMemoriesForUser, deleteMemory } from "@/lib/bucket-list-service"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Category } from "@/types/supabase"
import { UploadMemoryDialog } from "@/components/bucket-list/upload-memory-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MemoryWithCategory {
  id: string
  itemId: string
  listName: string
  category: Category
  itemTitle: string
  photos: string[]
  reflection: string
  points: number
  isPublic: boolean
  completedDate: string
}

const CATEGORY_ICONS: Record<string, string> = {
  adventures: "🎯",
  places: "🌍",
  cuisines: "🍽️",
  books: "📚",
  songs: "🎵",
  monuments: "🏛️",
  "acts-of-service": "🤝",
  miscellaneous: "✨",
}

export default function MemoriesPage() {
  const { user } = useAuth()
  const [memories, setMemories] = useState<MemoryWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [editMemory, setEditMemory] = useState<{
    isOpen: boolean;
    item: { id: string, title: string } | null;
    initialData?: { reflection: string, photos: string[], isPublic: boolean }
  }>({
    isOpen: false,
    item: null
  })

  const [deleteMemoryId, setDeleteMemoryId] = useState<string | null>(null)

  // Delete handler
  const handleDeleteMemory = (memoryId: string) => {
    setDeleteMemoryId(memoryId)
  }

  const confirmDelete = async () => {
    if (!deleteMemoryId || !user) return

    try {
      await deleteMemory(deleteMemoryId, user.id)
      toast.success("Memory deleted")
      // Remove from local state
      setMemories(prev => prev.filter(m => m.id !== deleteMemoryId))
      setDeleteMemoryId(null)
    } catch (error) {
      console.error("Failed to delete memory:", error)
      toast.error("Failed to delete memory")
      setDeleteMemoryId(null)
    }
  }

  const loadMemories = useMemo(() => {
    return async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await fetchMemoriesForUser(user.id)

        // Transform the data to a flatter structure for easier UI handling
        const formattedMemories = data.map((m: any) => ({
          id: m.id,
          itemId: m.bucket_item_id,
          listName: m.bucket_items?.bucket_lists?.name || "Unknown List",
          category: m.bucket_items?.bucket_lists?.category || "miscellaneous",
          itemTitle: m.bucket_items?.title || "Unknown Item",
          photos: m.photos || [],
          reflection: m.reflection,
          points: 0, // Points are on the item, but we might not have them directly here unless we joined deeper. Displaying item points is fine if available.
          isPublic: m.is_public,
          completedDate: m.created_at, // Using created_at of memory as the "memory date"
        }))

        setMemories(formattedMemories)
      } catch (error) {
        console.error("Error loading memories:", error)
        toast.error("Failed to load memories")
      } finally {
        setLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    loadMemories()
  }, [loadMemories])

  // Extract unique years and months for filters
  const { years, months } = useMemo(() => {
    const yearsSet = new Set<string>()
    const monthsSet = new Set<string>()

    memories.forEach(m => {
      const date = new Date(m.completedDate)
      yearsSet.add(date.getFullYear().toString())
      monthsSet.add((date.getMonth() + 1).toString())
    })

    return {
      years: Array.from(yearsSet).sort().reverse(),
      // We'll just show all 12 months in the dropdown usually, but if we want only available ones:
      months: Array.from(monthsSet).sort((a, b) => parseInt(a) - parseInt(b))
    }
  }, [memories])

  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const date = new Date(m.completedDate)
      const matchesMonth = monthFilter === "all" || (date.getMonth() + 1).toString() === monthFilter
      const matchesYear = yearFilter === "all" || date.getFullYear().toString() === yearFilter
      const matchesCategory = categoryFilter === "all" || m.category === categoryFilter
      return matchesMonth && matchesYear && matchesCategory
    })
  }, [memories, monthFilter, yearFilter, categoryFilter])

  const groupedMemories = useMemo(() => {
    const groups: Record<string, MemoryWithCategory[]> = {}
    filteredMemories.forEach(m => {
      if (!groups[m.category]) {
        groups[m.category] = []
      }
      groups[m.category].push(m)
    })
    return groups
  }, [filteredMemories])

  // Helper to get month name
  const getMonthName = (monthNum: string) => {
    const date = new Date()
    date.setMonth(parseInt(monthNum) - 1)
    return date.toLocaleString('default', { month: 'long' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">My Memories</h1>
          <p className="text-lg text-muted-foreground">Celebrate your journey through time</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(CATEGORY_ICONS).map(cat => (
                <SelectItem key={cat} value={cat}>
                  <span className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span className="capitalize">{cat.replace(/-/g, ' ')}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <SelectItem key={m} value={m.toString()}>{getMonthName(m.toString())}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {Object.keys(groupedMemories).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No memories found for this period.</p>
            </div>
          ) : (
            Object.entries(groupedMemories).map(([category, items]) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-2xl">{CATEGORY_ICONS[category] || "✨"}</span>
                  <h2 className="text-2xl font-bold capitalize">{category.replace(/-/g, " ")}</h2>
                  <Badge variant="secondary" className="ml-2">{items.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {items.map((memory) => (
                    <Card key={memory.id} className="overflow-hidden group rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-none hover:shadow-none transition-none">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Photos Gallery */}
                          {memory.photos.length > 0 && (
                            <div className="md:col-span-1">
                              <div className={`grid gap-2 ${memory.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {memory.photos.map((photo, idx) => (
                                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={photo}
                                      alt={`Memory ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div className={memory.photos.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">{memory.listName}</p>
                                  <h3 className="font-display text-xl font-bold">{memory.itemTitle}</h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(memory.completedDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <p className="text-foreground leading-relaxed italic">
                                "{memory.reflection}"
                              </p>

                              <div className="flex items-center justify-between pt-2">
                                <Badge variant={memory.isPublic ? "default" : "outline"} className="gap-1">
                                  <span>{memory.isPublic ? "🌍" : "🔒"}</span>
                                  {memory.isPublic ? "Public" : "Private"}
                                </Badge>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditMemory({
                                      isOpen: true,
                                      item: { id: memory.itemId, title: memory.itemTitle },
                                      initialData: { reflection: memory.reflection, photos: memory.photos, isPublic: memory.isPublic }
                                    })}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteMemory(memory.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  }
                </div >
              </div >
            ))
          )}
        </div >
      </div >

      {user && editMemory.isOpen && editMemory.item && (
        <UploadMemoryDialog
          isOpen={editMemory.isOpen}
          onClose={() => setEditMemory({ isOpen: false, item: null })}
          onMemoryUploaded={() => {
            toast.success("Memory updated!")
            loadMemories() // Reload memories
          }}
          itemId={editMemory.item.id}
          itemTitle={editMemory.item.title}
          userId={user.id}
          initialData={editMemory.initialData}
        />
      )}

      <AlertDialog open={!!deleteMemoryId} onOpenChange={(open) => !open && setDeleteMemoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your memory and remove it from your timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}

