"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

export default function MemoryDetailPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [reflection, setReflection] = useState(
    "This was an incredible experience! Visiting the ancient temples in Kyoto during cherry blossom season was a dream come true. The serene atmosphere and stunning architecture left me in awe.",
  )
  const [isPublic, setIsPublic] = useState(true)

  const memory = {
    id: "1",
    itemTitle: "Visit Japan",
    listName: "Travel the World",
    points: 100,
    completedDate: "March 15, 2024",
    photos: ["/tokyo-temples.jpg", "/tokyo-temples.jpg"],
    likes: 45,
    comments: 12,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/memories">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4">
              ← Back to Memories
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{memory.itemTitle}</h1>
              <p className="text-muted-foreground">
                From <span className="font-semibold">{memory.listName}</span> · {memory.completedDate}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <span>✏️</span>
                  Edit
                </Button>
              )}
              <Badge className="text-lg px-3 py-1 bg-primary">+{memory.points}</Badge>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-2 p-2">
              {memory.photos.map((photo, idx) => (
                <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo || "/placeholder.svg"}
                    alt={`Memory ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reflection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-display text-xl font-bold mb-4">Your Reflection</h3>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} className="min-h-32" />
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Share Publicly</p>
                    <p className="text-sm text-muted-foreground">Others can see this memory</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={() => setIsEditing(false)} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed">{reflection}</p>
            )}
          </CardContent>
        </Card>

        {/* Social Stats */}
        {isPublic && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Button variant="ghost" className="gap-2">
                  <span>❤️</span>
                  {memory.likes} Likes
                </Button>
                <Button variant="ghost" className="gap-2">
                  <span>💬</span>
                  {memory.comments} Comments
                </Button>
                <Button variant="ghost" className="gap-2 ml-auto">
                  <span>🔗</span>
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
