"use client"

import { useState, useMemo } from "react"
import { LeaderboardEntry } from "@/components/bucket-list/leaderboard-entry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useLeaderboard, useUserRank } from "@/hooks/use-leaderboard"
import { Loader2 } from "lucide-react"

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time")
  const [category, setCategory] = useState<"global" | "by-category">("global")
  const [page, setPage] = useState(0)
  const pageSize = 50

  // Use SWR hooks for data fetching with caching and pagination
  const {
    leaderboard,
    hasMore,
    isLoading: leaderboardLoading,
    isError: leaderboardError,
    mutate: mutateLeaderboard
  } = useLeaderboard(page, pageSize)

  const { userRank: currentUserData, isLoading: userRankLoading, isError: userRankError } = useUserRank(user?.id)

  const loading = leaderboardLoading || userRankLoading
  const error = leaderboardError || userRankError

  const topUsers = useMemo(() => {
    if (!leaderboard) return []
    // Only show top 3 for spotlight if on first page
    return page === 0 ? leaderboard.slice(0, 3) : []
  }, [leaderboard, page])

  const scrollToUser = () => {
    if (currentUserData) {
      const element = document.getElementById(`user-${currentUserData.rank}`)
      element?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleRetry = () => {
    mutateLeaderboard()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load leaderboard. Please try again.</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-lg text-muted-foreground">See where you stand among the bucket list community</p>
        </div>

        {/* Your Rank Card */}
        {currentUserData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Your Current Rank</p>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-display font-bold text-primary">#{currentUserData.rank}</div>
                  <div>
                    <p className="font-display font-bold text-lg">{currentUserData.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUserData.completions} completions • {Math.round(currentUserData.points).toLocaleString()} points
                    </p>
                  </div>
                </div>
              </div>
              {currentUserData.rank <= 100 && (
                <Button onClick={scrollToUser} className="gap-2">
                  👀 View in List
                </Button>
              )}
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
                size="sm">
                All Time
              </Button>
            </div>

            {/* Top 3 Spotlight - only on first page */}
            {page === 0 && topUsers.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold text-lg mb-4">Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {topUsers.map((user, index) => {
                    const isAvatarUrl = user.avatar_url && (user.avatar_url.startsWith('http') || user.avatar_url.startsWith('/'))
                    const fallbackInitial = user.username.charAt(0).toUpperCase()

                    return (
                      <div
                        key={user.id}
                        className="bg-gradient-to-b from-secondary/20 to-primary/20 rounded-lg p-6 text-center border border-primary/20"
                      >
                        <div className="text-5xl mb-2">{["🥇", "🥈", "🥉"][index]}</div>
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          {isAvatarUrl && <AvatarImage src={user.avatar_url!} alt={user.username} />}
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
                            {fallbackInitial}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-display font-bold text-lg mb-1">{user.username}</p>
                        <p className="text-2xl font-display font-bold text-primary mb-2">
                          {Math.round(user.points).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.completions} completions</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-2">
              <h2 className="font-display font-bold text-lg mb-4">Leaderboard</h2>
              {!leaderboard || leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No users on the leaderboard yet.</p>
                  <p className="text-sm text-muted-foreground">Complete bucket list items to earn points and climb the ranks!</p>
                </div>
              ) : (
                leaderboard.map((leaderboardUser) => (
                  <div key={leaderboardUser.id} id={`user-${leaderboardUser.rank}`}>
                    <LeaderboardEntry
                      rank={leaderboardUser.rank}
                      username={leaderboardUser.username}
                      avatar={leaderboardUser.avatar_url || leaderboardUser.username.charAt(0).toUpperCase()}
                      points={Math.round(leaderboardUser.points)}
                      completions={leaderboardUser.completions}
                      isCurrentUser={user?.id === leaderboardUser.id}
                      userId={leaderboardUser.id}
                      bio={leaderboardUser.bio}
                      globalRank={leaderboardUser.rank}
                      twitterUrl={leaderboardUser.twitter_url}
                      instagramUrl={leaderboardUser.instagram_url}
                      linkedinUrl={leaderboardUser.linkedin_url}
                      githubUrl={leaderboardUser.github_url}
                      websiteUrl={leaderboardUser.website_url}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && !error && leaderboard && leaderboard.length > 0 && (
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
