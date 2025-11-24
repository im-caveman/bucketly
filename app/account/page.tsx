"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"

export default function AccountPage() {
  const userStats = {
    name: "KRIMSON",
    username: "@krimson",
    email: "krimson@joyco.studio",
    avatar: "/avatars/user_krimson.png",
    joined: "January 2024",
    rank: "Explorer",
    rankProgress: 75,
    nextRank: "Adventurer",
    totalPoints: 1250,
    listsFollowing: 12,
    listsCreated: 3,
    completedItems: 48,
    followers: 234,
    following: 156,
  }

  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first item", icon: "🎯", unlocked: true },
    { id: 2, name: "Social Butterfly", description: "Get 100 followers", icon: "🦋", unlocked: true },
    { id: 3, name: "Creator", description: "Create your first list", icon: "✨", unlocked: true },
    { id: 4, name: "Centurion", description: "Complete 100 items", icon: "💯", unlocked: false },
    { id: 5, name: "Globe Trotter", description: "Visit 25 countries", icon: "🌍", unlocked: false },
    { id: 6, name: "Legend", description: "Reach top 10 on leaderboard", icon: "👑", unlocked: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Your Account</h1>
          <p className="text-muted-foreground">Manage your profile and view your achievements</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="size-24 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
                  <Image src={userStats.avatar || "/placeholder.svg"} alt={userStats.name} width={96} height={96} />
                </div>
                <h2 className="font-display text-2xl font-bold mb-1">{userStats.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">{userStats.username}</p>
                <Badge className="mb-4">{userStats.rank}</Badge>

                <div className="w-full space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Rank</span>
                    <span className="font-semibold">{userStats.nextRank}</span>
                  </div>
                  <Progress value={userStats.rankProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">{userStats.rankProgress}% to next rank</p>
                </div>

                <Link href="/settings" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📊</span>
                  Your Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.totalPoints}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.completedItems}</p>
                    <p className="text-sm text-muted-foreground mt-1">Completed Items</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.listsFollowing}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lists Following</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.listsCreated}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lists Created</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.followers}</p>
                    <p className="text-sm text-muted-foreground mt-1">Followers</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{userStats.following}</p>
                    <p className="text-sm text-muted-foreground mt-1">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏆</span>
                  Achievements
                </CardTitle>
                <CardDescription>Unlock badges by completing challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        achievement.unlocked ? "border-primary bg-primary/5" : "border-muted bg-muted/20 opacity-50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="font-semibold text-sm mb-1">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 text-xs" variant="secondary">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>ℹ️</span>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{userStats.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold">{userStats.joined}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Account Status</span>
                  <Badge className="bg-success/10 text-success">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
