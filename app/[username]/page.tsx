"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Twitter, Instagram, Linkedin, Github, Globe, UserPlus, UserMinus } from "lucide-react"
import { fetchUserProfile, fetchUserBucketLists, fetchUserTimeline } from "@/lib/bucket-list-service"
import type { UserProfile } from "@/lib/bucket-list-service"
import { useUserFollow } from "@/hooks/use-user-follow"
import { useUserBadges } from "@/hooks/use-badges"
import Link from "next/link"
import { FollowersDialog } from "@/components/profile/followers-dialog"
import { UserHoverCard } from "@/components/profile/user-hover-card"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = React.use(params)
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bucketLists, setBucketLists] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine if viewing own profile and setup follow hook
  const isOwnProfile = currentUser?.id === profile?.id
  const { isFollowing, isLoading: followLoading, toggleFollow } = useUserFollow(
    isOwnProfile || !profile ? undefined : profile.id
  )

  const { userBadges, isLoading: userBadgesLoading } = useUserBadges(profile?.id)

  useEffect(() => {
    fetchProfileData()
  }, [username])

  useEffect(() => {
    if (!profile) return

    // Subscribe to profile updates for real-time statistics
    const { subscribeToProfileUpdates } = require('@/lib/bucket-list-service')
    const channel = subscribeToProfileUpdates(profile.id, (updatedProfile: UserProfile) => {
      setProfile(updatedProfile)
    })

    return () => {
      channel.unsubscribe()
    }
  }, [profile?.id])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, find the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (userError) throw userError

      setProfile(userData as UserProfile)

      // Fetch user's bucket lists
      const lists = await fetchUserBucketLists(userData.id)
      setBucketLists(lists)

      // Fetch user's timeline
      const timelineData = await fetchUserTimeline(userData.id)
      setTimeline(timelineData.data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Profile not found'}</p>
          <Button onClick={fetchProfileData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const socialLinks = [
    { url: profile.twitter_url, icon: Twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { url: profile.instagram_url, icon: Instagram, label: "Instagram", color: "hover:text-[#E4405F]" },
    { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn", color: "hover:text-[#0A66C2]" },
    { url: profile.github_url, icon: Github, label: "GitHub", color: "hover:text-foreground" },
    { url: profile.website_url, icon: Globe, label: "Website", color: "hover:text-primary" },
  ].filter(link => link.url)



  const unlockedAchievements = userBadges?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">{isOwnProfile ? 'Your Profile' : `${profile.username}'s Profile`}</h1>
          <p className="text-muted-foreground">{isOwnProfile ? 'Manage your profile and view your achievements' : 'View profile and achievements'}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <UserHoverCard user={profile}>
                  <Avatar className="size-24 mb-4 ring-4 ring-primary/20 cursor-pointer">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.username} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-4xl text-white">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </UserHoverCard>
                <UserHoverCard user={profile}>
                  <h2 className="font-display text-2xl font-bold mb-3 hover:underline cursor-pointer">{profile.username}</h2>
                </UserHoverCard>
                {profile.global_rank && (
                  <Badge className="mb-4">Global Rank #{profile.global_rank}</Badge>
                )}

                <div className="flex items-center justify-center gap-4 w-full mb-6">
                  <div className="text-center p-2 bg-muted/30 rounded-lg min-w-[80px]">
                    <p className="text-xl font-display font-bold text-primary">{profile.total_points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <FollowersDialog userId={profile.id}>
                    <div className="text-center p-2 bg-muted/30 rounded-lg min-w-[80px] cursor-pointer hover:bg-muted/50 transition-colors">
                      <p className="text-xl font-display font-bold text-primary">{profile.followers_count}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  </FollowersDialog>
                  <div className="text-center p-2 bg-muted/30 rounded-lg min-w-[80px]">
                    <p className="text-xl font-display font-bold text-primary">{profile.following_count}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>

                {isOwnProfile ? (
                  <Link href="/settings" className="w-full">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className="w-full"
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {followLoading ? (
                      "Loading..."
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="w-full pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 text-center font-semibold">SOCIAL LINKS</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {socialLinks.map((link, index) => {
                        const Icon = link.icon
                        return (
                          <a
                            key={index}
                            href={link.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-all ${link.color}`}
                            title={link.label}
                          >
                            <Icon className="w-5 h-5" />
                          </a>
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
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
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
                {userBadgesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : userBadges && userBadges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {userBadges.map((userBadge) => (
                      <div
                        key={userBadge.id}
                        className="p-4 rounded-lg border-2 border-transparent hover:border-primary/20 hover:bg-primary/10 transition-all text-center"
                      >
                        <div className="relative size-12 mx-auto mb-2">
                          <img
                            src={userBadge.badges.icon_url}
                            alt={userBadge.badges.name}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <p className="font-semibold text-sm mb-1">{userBadge.badges.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{userBadge.badges.description}</p>
                        <Badge className="mt-2 text-xs" variant="secondary">
                          {new Date(userBadge.awarded_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No badges earned yet.</p>
                  </div>
                )}
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

        {/* Tabs */}
        <Tabs defaultValue="created" className="mb-8 mt-6">
          <TabsList>
            <TabsTrigger value="created">Lists Created</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="space-y-4">
            {bucketLists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No lists created yet.</p>
              </div>
            ) : (
              bucketLists.map((list) => (
                <Link key={list.id} href={`/list/${list.id}`} className="block">
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{list.name}</span>
                        <div className="flex gap-2">
                          {!list.is_public && <Badge variant="outline">Private</Badge>}
                          <Badge variant="secondary">{list.follower_count.toLocaleString()} followers</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {list.bucket_items?.length || 0} items • {list.category}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {timeline.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recent activity.</p>
              </div>
            ) : (
              timeline.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {event.event_type === 'item_completed' ? '✅' :
                          event.event_type === 'memory_uploaded' ? '📸' :
                            event.event_type === 'list_created' ? '✨' :
                              event.event_type === 'list_followed' ? '❤️' : '🎯'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
