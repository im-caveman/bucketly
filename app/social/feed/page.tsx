"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SocialPost {
  id: string
  userId: string
  username: string
  avatar: string
  itemCompleted: string
  listName: string
  photos: string[]
  reflection: string
  points: number
  timestamp: string
  likes: number
  comments: number
  liked: boolean
}

// Mock social feed data
const mockFeedPosts: SocialPost[] = [
  {
    id: "1",
    userId: "user1",
    username: "Alex Journey",
    avatar: "🎯",
    itemCompleted: "Visit Japan",
    listName: "Travel the World",
    photos: ["/placeholder.svg?key=abc123", "/placeholder.svg?key=def456"],
    reflection:
      "Standing in front of the ancient temples of Kyoto was an incredible experience. The spiritual atmosphere and beautiful gardens left me speechless. This is definitely one of my favorite memories!",
    points: 100,
    timestamp: "2 hours ago",
    likes: 234,
    comments: 18,
    liked: false,
  },
  {
    id: "2",
    userId: "user2",
    username: "Sam Explorer",
    avatar: "✈️",
    itemCompleted: "Trek Machu Picchu",
    listName: "Travel the World",
    photos: ["/placeholder.svg?key=ghi789"],
    reflection:
      "The hike was incredibly challenging but absolutely worth it. Reaching the summit at sunrise and seeing the ancient city revealed was a moment I'll never forget.",
    points: 150,
    timestamp: "5 hours ago",
    likes: 567,
    comments: 42,
    liked: true,
  },
  {
    id: "3",
    userId: "user3",
    username: "Casey Dreams",
    avatar: "🌍",
    itemCompleted: "Complete a Novel",
    listName: "Life Achievements",
    photos: ["/placeholder.svg?key=jkl012"],
    reflection:
      'Finally finished my first novel! It\'s been a long journey with many ups and downs, but seeing those words "The End" on the page feels surreal.',
    points: 200,
    timestamp: "1 day ago",
    likes: 892,
    comments: 67,
    liked: false,
  },
]

export default function SocialFeedPage() {
  const [posts, setPosts] = useState(mockFeedPosts)
  const [filter, setFilter] = useState<"all" | "friends" | "following">("all")
  const [newComment, setNewComment] = useState("")

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Community Feed</h1>
          <p className="text-lg text-muted-foreground">See what others in the community are achieving</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "friends" ? "default" : "outline"} onClick={() => setFilter("friends")}>
            Friends
          </Button>
          <Button variant={filter === "following" ? "default" : "outline"} onClick={() => setFilter("following")}>
            Following
          </Button>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {/* Post Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-display font-bold">{post.username}</p>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>
                  <Badge className="gap-1">
                    <span>⭐</span>+{post.points}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-4">
                {/* Achievement Title */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="font-display font-bold text-lg">{post.itemCompleted}</p>
                  <p className="text-sm text-muted-foreground">{post.listName}</p>
                </div>

                {/* Photos Gallery */}
                {post.photos.length > 0 && (
                  <div
                    className={`grid gap-2 ${
                      post.photos.length === 1
                        ? "grid-cols-1"
                        : post.photos.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2"
                    }`}
                  >
                    {post.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Post ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Reflection Text */}
                <p className="text-foreground leading-relaxed">{post.reflection}</p>

                {/* Interaction Buttons */}
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`gap-2 flex-1 ${post.liked ? "text-primary" : ""}`}
                  >
                    <span>{post.liked ? "❤️" : "🤍"}</span>
                    {post.likes} likes
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 flex-1">
                    <span>💬</span>
                    {post.comments} comments
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 flex-1">
                    <span>↗️</span>
                    Share
                  </Button>
                </div>

                {/* Comment Input */}
                <div className="pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button size="sm" variant="outline">
                      Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
