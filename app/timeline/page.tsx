"use client"

import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TimelineEventComponent } from "@/components/bucket-list/timeline-event"
import type { TimelineEvent } from "@/types/bucket-list"
import { useAuth } from "@/contexts/auth-context"
import { useUserTimeline } from "@/hooks/use-timeline"
import { useRouter } from "next/navigation"
import type { TimelineEventData } from "@/lib/bucket-list-service"

type FilterType = "all" | "completed" | "shared" | "achievements"

export default function TimelinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [page, setPage] = useState(0)
  const pageSize = 50

  // Use SWR hook for data fetching with caching and pagination
  const {
    events: timelineData,
    hasMore,
    isLoading: loading,
    isError: error,
    mutate
  } = useUserTimeline(user?.id, page, pageSize)

  // Transform database events to UI format
  const events = useMemo(() => {
    if (!timelineData) return []

    return timelineData.map((event: TimelineEventData) => ({
      id: event.id,
      type: event.event_type as any,
      title: event.title,
      description: event.description || '',
      timestamp: event.created_at,
      itemTitle: event.metadata?.item_title,
      listName: event.metadata?.list_name,
      points: event.metadata?.points,
      photos: event.metadata?.photos || [],
      isPublic: event.is_public,
    }))
  }, [timelineData])

  // Redirect if not logged in
  if (!user && !loading) {
    router.push('/auth/login')
    return null
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your timeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Failed to load timeline events</p>
          <Button onClick={() => mutate()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Pagination Controls */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              variant="outline"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page + 1}
            </span>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
