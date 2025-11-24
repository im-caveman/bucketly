"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock user data
const mockUser = {
  username: "Alex Journey",
  bio: "Living dreams one checkbox at a time • Travel enthusiast • Book lover",
  avatar: "🎯",
  coverColor: "from-primary to-accent",
  stats: {
    rank: 47,
    points: 28400,
    completions: 89,
    following: 12,
    created: 3,
  },
  listsCreated: [
    { id: "1", name: "Travel the World", category: "places", followers: 2450, items: 50 },
    { id: "2", name: "Ultimate Adventure Sports", category: "adventures", followers: 892, items: 25 },
  ],
  recentActivity: [
    { type: "completed", title: "Visit Japan", list: "Travel the World", date: "2025-01-15", points: 100 },
    { type: "completed", title: "Trek Machu Picchu", list: "Travel the World", date: "2025-01-10", points: 150 },
    { type: "followed", title: "Read 50 Classics", list: null, date: "2025-01-05" },
  ],
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Cover Section */}
      <div className={`h-40 bg-gradient-to-r ${mockUser.coverColor}`} />

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-20 mb-8">
          <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-7xl border-4 border-background shadow-lg">
            {mockUser.avatar}
          </div>

          <div className="flex-1 pt-12">
            <h1 className="font-display text-4xl font-bold mb-1">{mockUser.username}</h1>
            <p className="text-lg text-muted-foreground mb-4">{mockUser.bio}</p>

            <div className="flex gap-2 flex-wrap mb-4">
              <Badge className="bg-primary text-primary-foreground">Global Rank #{mockUser.stats.rank}</Badge>
              <Badge variant="outline">{mockUser.stats.completions} Completions</Badge>
              <Badge variant="outline">{mockUser.stats.created} Lists Created</Badge>
            </div>

            <Button size="lg" className="gap-2">
              ❤️ Follow
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Points", value: mockUser.stats.points.toLocaleString(), icon: "⭐" },
            { label: "Completed", value: mockUser.stats.completions, icon: "✓" },
            { label: "Following", value: mockUser.stats.following, icon: "📚" },
            { label: "Created", value: mockUser.stats.created, icon: "✨" },
            { label: "Rank", value: `#${mockUser.stats.rank}`, icon: "🏆" },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="font-display font-bold text-2xl text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="created" className="mb-8">
          <TabsList>
            <TabsTrigger value="created">Lists Created</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="space-y-4">
            {mockUser.listsCreated.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{list.name}</span>
                    <Badge variant="secondary">{list.followers.toLocaleString()} followers</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {list.items} items • {list.category}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {mockUser.recentActivity.map((activity, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{activity.type === "completed" ? "✅" : "❤️"}</div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {activity.type === "completed" ? "Completed" : "Started following"}{" "}
                        <span className="text-primary">{activity.title}</span>
                      </p>
                      {activity.list && <p className="text-sm text-muted-foreground">{activity.list}</p>}
                      {activity.points && (
                        <p className="text-sm text-primary font-semibold">+{activity.points} points</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
