"use client"

import { useState } from "react"
import { LeaderboardEntry } from "@/components/bucket-list/leaderboard-entry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface LeaderboardUser {
  rank: number
  username: string
  avatar: string
  points: number
  completions: number
  trend: "up" | "down" | "flat"
}

// Mock leaderboard data
const generateMockLeaderboard = (): LeaderboardUser[] => {
  const names = [
    "Alex Journey",
    "Sam Explorer",
    "Jordan Adventure",
    "Casey Dreams",
    "Morgan Quest",
    "Riley Wanderer",
    "Taylor Adventures",
    "Jordan Achiever",
  ]
  const avatars = ["🎯", "✈️", "🏔️", "🌍", "💫", "🎪", "🚀", "⭐"]

  return Array.from({ length: 100 }, (_, i) => ({
    rank: i + 1,
    username: names[i % names.length] + (i > names.length ? ` ${Math.floor(i / names.length)}` : ""),
    avatar: avatars[i % avatars.length],
    points: Math.max(0, 50000 - i * 400 + Math.random() * 1000),
    completions: Math.max(1, 200 - Math.floor(i / 2)),
    trend: i % 5 === 0 ? "up" : i % 3 === 0 ? "down" : "flat",
  }))
}

const mockLeaderboard = generateMockLeaderboard()
const currentUserRank = 47

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time")
  const [category, setCategory] = useState<"global" | "by-category">("global")

  const currentUser = mockLeaderboard.find((u) => u.rank === currentUserRank)
  const topUsers = mockLeaderboard.slice(0, 10)

  const scrollToUser = () => {
    // In a real app, this would scroll to the current user's position
    const element = document.getElementById(`user-${currentUserRank}`)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-lg text-muted-foreground">See where you stand among the bucket list community</p>
        </div>

        {/* Your Rank Card */}
        {currentUser && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Your Current Rank</p>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-display font-bold text-primary">#{currentUser.rank}</div>
                  <div>
                    <p className="font-display font-bold text-lg">{currentUser.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.completions} completions • {Math.round(currentUser.points).toLocaleString()} points
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={scrollToUser} className="gap-2">
                👀 View in List
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="global" className="mb-8">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <div className="flex gap-2 mb-6">
              <Button
                variant={timeframe === "weekly" ? "default" : "outline"}
                onClick={() => setTimeframe("weekly")}
                size="sm"
              >
                Weekly
              </Button>
              <Button
                variant={timeframe === "monthly" ? "default" : "outline"}
                onClick={() => setTimeframe("monthly")}
                size="sm"
              >
                Monthly
              </Button>
              <Button
                variant={timeframe === "all-time" ? "default" : "outline"}
                onClick={() => setTimeframe("all-time")}
                size="sm"
              >
                All Time
              </Button>
            </div>

            {/* Top 3 Spotlight */}
            <div className="mb-8">
              <h2 className="font-display font-bold text-lg mb-4">Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {topUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.rank}
                    className="bg-gradient-to-b from-secondary/20 to-primary/20 rounded-lg p-6 text-center border border-primary/20"
                  >
                    <div className="text-5xl mb-2">{["🥇", "🥈", "🥉"][user.rank - 1]}</div>
                    <p className="font-display font-bold text-lg mb-1">{user.username}</p>
                    <p className="text-2xl font-display font-bold text-primary mb-2">
                      {Math.round(user.points).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.completions} completions</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-2">
              <h2 className="font-display font-bold text-lg mb-4">Leaderboard</h2>
              {mockLeaderboard.map((user) => (
                <div key={user.rank} id={`user-${user.rank}`}>
                  <LeaderboardEntry {...user} isCurrentUser={user.rank === currentUserRank} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="category" className="space-y-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Category-specific leaderboards coming soon!</p>
              <p className="text-sm text-muted-foreground">Compete with others in Travel, Culinary, Books, and more.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
