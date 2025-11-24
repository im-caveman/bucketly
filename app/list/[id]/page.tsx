"use client"

import { useState } from "react"
import { ItemCard } from "@/components/bucket-list/item-card"
import { ListProgress } from "@/components/bucket-list/list-progress"
import { FilterTabs } from "@/components/bucket-list/filter-tabs"
import { CompletionModal } from "@/components/bucket-list/completion-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for a single list
const mockListDetail = {
  id: "1",
  name: "Travel the World",
  description: "Visit 50 countries and experience different cultures. This is your ultimate journey around the globe.",
  category: "places" as const,
  items: [
    {
      id: "1",
      title: "Visit Japan",
      description: "Experience Tokyo and Kyoto temples",
      points: 100,
      completed: true,
      difficulty: "medium" as const,
      location: "Japan",
    },
    {
      id: "2",
      title: "Trek Machu Picchu",
      description: "Hike to the ancient Incan city",
      points: 150,
      completed: true,
      difficulty: "hard" as const,
      location: "Peru",
    },
    {
      id: "3",
      title: "Safari in Kenya",
      description: "See the Big Five wildlife",
      points: 120,
      completed: false,
      difficulty: "hard" as const,
      location: "Kenya",
    },
    {
      id: "4",
      title: "Northern Lights in Iceland",
      description: "Witness the Aurora Borealis",
      points: 100,
      completed: false,
      difficulty: "medium" as const,
      location: "Iceland",
    },
    {
      id: "5",
      title: "Dive the Great Barrier Reef",
      description: "Explore coral and marine life",
      points: 110,
      completed: false,
      difficulty: "medium" as const,
      location: "Australia",
    },
    {
      id: "6",
      title: "Climb Mount Kilimanjaro",
      description: "Summit Africa's highest peak",
      points: 200,
      completed: false,
      difficulty: "hard" as const,
      location: "Tanzania",
    },
    {
      id: "7",
      title: "Explore Petra",
      description: "Ancient city carved in rose-red stone",
      points: 90,
      completed: false,
      difficulty: "easy" as const,
      location: "Jordan",
    },
    {
      id: "8",
      title: "Visit Great Wall of China",
      description: "Walk the iconic wall",
      points: 95,
      completed: false,
      difficulty: "medium" as const,
      location: "China",
    },
  ],
  followers: 2450,
  createdBy: "Global Explorers",
  isPublic: true,
}

export default function ListDetailPage() {
  const [items, setItems] = useState(mockListDetail.items)
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")
  const [completionModal, setCompletionModal] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null,
  })

  const filteredItems = items.filter((item) => {
    if (filter === "completed") return item.completed
    if (filter === "incomplete") return !item.completed
    return true
  })

  const handleToggleItem = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    if (!item.completed) {
      setCompletionModal({ isOpen: true, item })
      setItems(items.map((i) => (i.id === id ? { ...i, completed: true } : i)))
    } else {
      setItems(items.map((i) => (i.id === id ? { ...i, completed: false } : i)))
    }
  }

  const handleSaveMemory = (memory: { photos: string[]; reflection: string; isPublic: boolean }) => {
    console.log("[v0] Saved memory:", memory)
    setCompletionModal({ isOpen: false, item: null })
  }

  const categoryIcons: Record<string, string> = {
    adventures: "🎯",
    places: "🌍",
    cuisines: "🍽️",
    books: "📚",
    songs: "🎵",
    monuments: "🏛️",
    "acts-of-service": "🤝",
    miscellaneous: "✨",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                  ← Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{categoryIcons[mockListDetail.category]}</span>
              <h1 className="font-display text-4xl font-bold">{mockListDetail.name}</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-3">{mockListDetail.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{mockListDetail.followers.toLocaleString()} followers</Badge>
              <Badge variant="outline">Created by {mockListDetail.createdBy}</Badge>
            </div>
          </div>
          <Button size="lg" className="gap-2 shrink-0">
            <span>❤️</span>
            Follow
          </Button>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <ListProgress items={items} />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs filter={filter} onChange={setFilter} />
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {filter === "completed" ? "No completed items yet" : "No items to do!"}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={() => handleToggleItem(item.id)}
                onUploadMemory={() => {
                  console.log("[v0] Opening memory upload for:", item.title)
                }}
              />
            ))
          )}
        </div>
      </div>
      {completionModal.item && (
        <CompletionModal
          isOpen={completionModal.isOpen}
          itemTitle={completionModal.item.title}
          itemPoints={completionModal.item.points}
          onClose={() => setCompletionModal({ isOpen: false, item: null })}
          onSave={handleSaveMemory}
        />
      )}
    </div>
  )
}
