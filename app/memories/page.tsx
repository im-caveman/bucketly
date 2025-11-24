"use client"

import { useState } from "react"
import type { Memory } from "@/types/bucket-list"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock memories data
const mockMemories: Memory[] = [
  {
    id: "1",
    itemId: "1",
    listName: "Travel the World",
    itemTitle: "Visit Japan",
    photos: ["/tokyo-temples.jpg"],
    reflection:
      "Standing in front of the ancient temples of Kyoto was a life-changing experience. The peaceful gardens and spiritual atmosphere made me reflect on what truly matters.",
    points: 100,
    isPublic: true,
    completedDate: "2025-01-15",
  },
  {
    id: "2",
    itemId: "2",
    listName: "Travel the World",
    itemTitle: "Trek Machu Picchu",
    photos: ["/machu-picchu-mountain.jpg"],
    reflection:
      "The hike was incredibly challenging, but reaching the summit at sunrise was absolutely worth every step. This is definitely one of my greatest achievements.",
    points: 150,
    isPublic: true,
    completedDate: "2025-01-10",
  },
  {
    id: "3",
    itemId: "3",
    listName: "Read 50 Classics",
    itemTitle: "1984 by George Orwell",
    photos: [],
    reflection:
      "This dystopian novel really made me think about the dangers of totalitarianism. A thought-provoking read that I'll be recommending to everyone.",
    points: 80,
    isPublic: false,
    completedDate: "2025-01-08",
  },
]

export default function MemoriesPage() {
  const [memories, setMemories] = useState(mockMemories)
  const [filter, setFilter] = useState<"all" | "public" | "private">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "points">("newest")

  const filteredMemories = memories
    .filter((m) => {
      if (filter === "public") return m.isPublic
      if (filter === "private") return !m.isPublic
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
        case "oldest":
          return new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime()
        case "points":
          return b.points - a.points
        default:
          return 0
      }
    })

  const handleShareMemory = (id: string) => {
    setMemories(memories.map((m) => (m.id === id ? { ...m, isPublic: !m.isPublic } : m)))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">My Memories</h1>
          <p className="text-lg text-muted-foreground">Celebrate your completed achievements and share your journey</p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8">
          <Select value={filter} onValueChange={(val: any) => setFilter(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Memories</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="points">Most Points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Memories Timeline */}
        <div className="space-y-6">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No memories yet</p>
              <p className="text-sm text-muted-foreground">Complete items and upload memories to see them here</p>
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Photos Gallery */}
                    {memory.photos.length > 0 && (
                      <div className="md:col-span-1">
                        <div className="grid grid-cols-2 gap-2">
                          {memory.photos.map((photo, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Memory ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className={memory.photos.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm text-muted-foreground">{memory.listName}</p>
                              <h3 className="font-display text-xl font-bold">{memory.itemTitle}</h3>
                            </div>
                            <Badge className="bg-primary text-primary-foreground">+{memory.points}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(memory.completedDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <p className="text-sm leading-relaxed text-foreground">{memory.reflection}</p>

                        <div className="flex items-center gap-2 pt-3">
                          <Badge variant={memory.isPublic ? "default" : "secondary"} className="gap-1">
                            <span>{memory.isPublic ? "🌍" : "🔒"}</span>
                            {memory.isPublic ? "Public" : "Private"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareMemory(memory.id)}
                            className="gap-1"
                          >
                            {memory.isPublic ? "🔒 Make Private" : "🌍 Share"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
