"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { fetchUserProfile } from "@/lib/bucket-list-service"
import type { UserProfile } from "@/lib/bucket-list-service"
import { Loader2, Twitter, Instagram, Linkedin, Github, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define static achievements data
  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first item", icon: "🎯", unlocked: true },
    { id: 2, name: "Social Butterfly", description: "Get 100 followers", icon: "🦋", unlocked: true },
    { id: 3, name: "Creator", description: "Create your first list", icon: "✨", unlocked: true },
    { id: 4, name: "Centurion", description: "Complete 100 items", icon: "💯", unlocked: false },
    { id: 5, name: "Globe Trotter", description: "Visit 25 countries", icon: "🌍", unlocked: false },
    { id: 6, name: "Legend", description: "Reach top 10 on leaderboard", icon: "👑", unlocked: false },
  ]
  
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length

  const socialLinks = profile ? [
    { url: profile.twitter_url, icon: Twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { url: profile.instagram_url, icon: Instagram, label: "Instagram", color: "hover:text-[#E4405F]" },
    { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn", color: "hover:text-[#0A66C2]" },
    { url: profile.github_url, icon: Github, label: "GitHub", color: "hover:text-foreground" },
    { url: profile.website_url, icon: Globe, label: "Website", color: "hover:text-primary" },
  ].filter(link => link.url) : []

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  // Redirect to username-based profile once loaded
  useEffect(() => {
    if (profile?.username) {
      router.replace(`/${profile.username}`)
    }
  }, [profile?.username, router])

  useEffect(() => {
    if (!user) return

    // Subscribe to profile updates for real-time statistics
    const { subscribeToProfileUpdates } = require('@/lib/bucket-list-service')
    const channel = subscribeToProfileUpdates(user.id, (updatedProfile: UserProfile) => {
      setProfile(updatedProfile)
    })

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const profileData = await fetchUserProfile(user.id)
      setProfile(profileData)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Failed to load account'}</p>
          <Button onClick={loadProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                <Avatar className="size-24 mb-4 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.username} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-4xl text-white">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-display text-2xl font-bold mb-3">{profile.username}</h2>
                {profile.global_rank && (
                  <Badge className="mb-4">Global Rank #{profile.global_rank}</Badge>
                )}

                <div className="w-full space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="font-semibold">{profile.total_points ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Completed</span>
                    <span className="font-semibold">{profile.items_completed ?? 0}</span>
                  </div>
                </div>

                <Link href="/settings" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Profile
                  </Button>
                </Link>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="w-full pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 text-center font-semibold">SOCIAL LINKS</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {socialLinks.map((link, index) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={index}
                            href={link.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-all ${link.color}`}
                            title={link.label}
                          >
                            <Icon className="w-5 h-5" />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
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
                    <p className="text-3xl font-display font-bold text-primary">{(profile.total_points ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{profile.items_completed}</p>
                    <p className="text-sm text-muted-foreground mt-1">Completed Items</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{profile.lists_following}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lists Following</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{profile.lists_created}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lists Created</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{profile.global_rank || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground mt-1">Global Rank</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-display font-bold text-primary">{unlockedAchievements}</p>
                    <p className="text-sm text-muted-foreground mt-1">Badges Unlocked</p>
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
                      className={`p-4 rounded-lg border-2 text-center transition-all ${achievement.unlocked ? "border-primary bg-primary/5" : "border-muted bg-muted/20 opacity-50"
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
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
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
