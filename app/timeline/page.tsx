"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TimelineEventComponent } from "@/components/bucket-list/timeline-event"
import type { TimelineEvent } from "@/types/bucket-list"

// Mock timeline data
const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "item_completed",
    title: "Completed an Epic Journey",
    description: "Finished the challenging quest",
    timestamp: "2025-01-20T14:30:00",
    itemTitle: "Visit Japan",
    listName: "Travel the World",
    points: 100,
    photos: ["/tokyo-temples.jpg"],
  },
  {
    id: "2",
    type: "memory_uploaded",
    title: "Memory Added",
    description: "Uploaded photos and reflections",
    timestamp: "2025-01-20T14:35:00",
    itemTitle: "Visit Japan",
    listName: "Travel the World",
    photos: ["/tokyo-temples.jpg"],
  },
  {
    id: "3",
    type: "memory_shared",
    title: "Shared Your Achievement",
    description: "Made memory public on the community",
    timestamp: "2025-01-20T15:00:00",
    itemTitle: "Visit Japan",
    listName: "Travel the World",
    isPublic: true,
  },
  {
    id: "4",
    type: "item_completed",
    title: "Conquered Another Challenge",
    description: "Reached a major milestone",
    timestamp: "2025-01-18T10:15:00",
    itemTitle: "Trek Machu Picchu",
    listName: "Travel the World",
    points: 150,
    photos: ["/machu-picchu-mountain.jpg"],
  },
  {
    id: "5",
    type: "list_followed",
    title: "Started Following a List",
    description: "Added to your bucket list journey",
    timestamp: "2025-01-15T09:20:00",
    listName: "Read 50 Classics",
  },
  {
    id: "6",
    type: "achievement_unlocked",
    title: "Achievement Unlocked",
    description: "Completed 10 items across all lists",
    timestamp: "2025-01-10T16:45:00",
    points: 500,
  },
  {
    id: "7",
    type: "list_created",
    title: "Created New Bucket List",
    description: "Started a new adventure",
    timestamp: "2025-01-05T11:30:00",
    listName: "Culinary Adventures",
  },
  {
    id: "8",
    type: "item_completed",
    title: "Completed an Item",
    description: "Making progress on your goals",
    timestamp: "2025-01-01T12:00:00",
    itemTitle: "Authentic Ramen in Tokyo",
    listName: "Culinary Adventures",
    points: 50,
  },
]

type FilterType = "all" | "completed" | "shared" | "achievements"

export default function TimelinePage() {
  const [events, setEvents] = useState(mockTimelineEvents)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")

  const filteredEvents = events
    .filter((event) => {
      if (filter === "all") return true
      if (filter === "completed") return event.type === "item_completed"
      if (filter === "shared") return event.type === "memory_shared"
      if (filter === "achievements") return event.type === "achievement_unlocked"
      return true
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return sortBy === "newest" ? timeB - timeA : timeA - timeB
    })

  const totalPoints = events.filter((e) => e.points).reduce((sum, e) => sum + (e.points || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Your Timeline</h1>
          <p className="text-lg text-muted-foreground">
            A visual journey of your achievements, memories, and milestones
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Total Events</p>
            <p className="font-display text-3xl font-bold">{events.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-muted-foreground mb-1">Total Points</p>
            <p className="font-display text-3xl font-bold text-purple-600">{totalPoints}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-lg p-4 border border-pink-500/20">
            <p className="text-sm text-muted-foreground mb-1">Memories Shared</p>
            <p className="font-display text-3xl font-bold text-pink-600">
              {events.filter((e) => e.type === "memory_shared").length}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Select value={filter} onValueChange={(val: any) => setFilter(val)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="completed">Completions</SelectItem>
              <SelectItem value="shared">Shared Memories</SelectItem>
              <SelectItem value="achievements">Achievements</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="ml-auto bg-transparent">
            📥 Export Timeline
          </Button>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No events found</p>
              <p className="text-sm text-muted-foreground">
                Start completing items and sharing memories to build your timeline
              </p>
            </div>
          ) : (
            <div className="relative">
              {filteredEvents.map((event, idx) => (
                <TimelineEventComponent key={event.id} event={event} isLast={idx === filteredEvents.length - 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
