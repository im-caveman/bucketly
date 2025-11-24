import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TimelineEvent } from "@/types/bucket-list"

interface TimelineEventProps {
  event: TimelineEvent
  isLast?: boolean
}

const eventTypeConfig = {
  item_completed: {
    icon: "✅",
    color: "bg-green-500/20 text-green-600",
    label: "Completed Item",
  },
  memory_uploaded: {
    icon: "📸",
    color: "bg-blue-500/20 text-blue-600",
    label: "Memory Uploaded",
  },
  memory_shared: {
    icon: "🌍",
    color: "bg-purple-500/20 text-purple-600",
    label: "Memory Shared",
  },
  list_created: {
    icon: "✨",
    color: "bg-orange-500/20 text-orange-600",
    label: "List Created",
  },
  list_followed: {
    icon: "❤️",
    color: "bg-pink-500/20 text-pink-600",
    label: "List Followed",
  },
  achievement_unlocked: {
    icon: "🏆",
    color: "bg-yellow-500/20 text-yellow-600",
    label: "Achievement Unlocked",
  },
}

export function TimelineEventComponent({ event, isLast = false }: TimelineEventProps) {
  const config = eventTypeConfig[event.type]
  const eventDate = new Date(event.timestamp)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="relative flex gap-6">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div
          className={`size-14 rounded-full flex items-center justify-center text-2xl ${config.color} border-2 border-background relative z-10 bg-background`}
        >
          {config.icon}
        </div>
        {!isLast && <div className="w-1 flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-4" />}
      </div>

      {/* Event content */}
      <div className="flex-1 pb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <Badge variant="secondary" className={config.color}>
                  {config.label}
                </Badge>
              </div>

              {/* Details */}
              {event.itemTitle && (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Item:</span> {event.itemTitle}
                  </p>
                </div>
              )}

              {event.listName && (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">List:</span> {event.listName}
                  </p>
                </div>
              )}

              {event.points && (
                <div className="text-sm">
                  <Badge className="bg-primary text-primary-foreground">+{event.points} points</Badge>
                </div>
              )}

              {/* Photos */}
              {event.photos && event.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-3">
                  {event.photos.map((photo, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Event photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy badge */}
              {event.isPublic !== undefined && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={event.isPublic ? "default" : "secondary"} className="gap-1">
                    <span>{event.isPublic ? "🌍" : "🔒"}</span>
                    {event.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                {formattedDate} at {formattedTime}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
