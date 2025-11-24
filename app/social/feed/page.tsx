"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchSocialFeed, type TimelineEventWithProfile } from "@/lib/bucket-list-service"
import { useRouter } from "next/navigation"

export default function SocialFeedPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [events, setEvents] = useState<TimelineEventWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    async function loadFeed() {
      try {
        setLoading(true)
        const { events: feedEvents, hasMore: more } = await fetchSocialFeed(user!.id, 0, 20)
        setEvents(feedEvents)
        setHasMore(more)
        setPage(0)
      } catch (error: any) {
        console.error('Error loading social feed:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to load social feed",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [user, router, toast])

  const loadMore = async () => {
    if (!user || loadingMore) return

    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const { events: moreEvents, hasMore: more } = await fetchSocialFeed(user!.id, nextPage, 20)
      setEvents(prev => [...prev, ...moreEvents])
      setHasMore(more)
      setPage(nextPage)
    } catch (error: any) {
      console.error('Error loading more events:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load more events",
        variant: "destructive",
      })
    } finally {
      setLoadingMore(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'item_completed':
        return '✅'
      case 'memory_uploaded':
      case 'memory_shared':
        return '📸'
      case 'list_created':
        return '📝'
      case 'list_followed':
        return '👥'
      case 'achievement_unlocked':
        return '🏆'
      default:
        return '📌'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Loading your social feed...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Social Feed</h1>
          <p className="text-lg text-muted-foreground">See what people you follow are achieving</p>
        </div>

        {/* Feed Events */}
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Your feed is empty. Follow some bucket lists to see updates!
            </p>
            <Button onClick={() => router.push('/explore')} variant="outline">
              Explore Lists
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {/* Event Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                        {event.avatar_url ? (
                          <img
                            src={event.avatar_url}
                            alt={event.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          event.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-display font-bold">{event.username}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                      {event.metadata?.points && (
                        <Badge className="gap-1">
                          <span>⭐</span>+{event.metadata.points}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-4">
                  {/* Event Title and Description */}
                  <div>
                    <p className="font-display font-bold text-lg">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>

                  {/* Event Metadata */}
                  {event.metadata && (
                    <div className="space-y-2">
                      {event.metadata.item_title && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Item: </span>
                          <span className="font-medium">{event.metadata.item_title}</span>
                        </p>
                      )}
                      {event.metadata.list_name && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">List: </span>
                          <span className="font-medium">{event.metadata.list_name}</span>
                        </p>
                      )}
                      {event.metadata.reflection && (
                        <p className="text-foreground leading-relaxed mt-2 p-3 bg-muted/50 rounded-lg">
                          {event.metadata.reflection}
                        </p>
                      )}
                      {event.metadata.photos && Array.isArray(event.metadata.photos) && event.metadata.photos.length > 0 && (
                        <div
                          className={`grid gap-2 mt-3 ${event.metadata.photos.length === 1
                              ? "grid-cols-1"
                              : event.metadata.photos.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2"
                            }`}
                        >
                          {event.metadata.photos.map((photo: string, idx: number) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
