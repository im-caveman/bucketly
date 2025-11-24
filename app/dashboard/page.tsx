"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ListCard } from "@/components/bucket-list/list-card"
import { CategoryFilter } from "@/components/bucket-list/category-filter"
import { UserStats } from "@/components/bucket-list/user-stats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Category, BucketList, UserProfile } from "@/types/bucket-list"
import { toBucketList, toUserProfile } from "@/types/bucket-list"
import { fetchUserProfile } from "@/lib/bucket-list-service"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [followedLists, setFollowedLists] = useState<BucketList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Fetch user profile and followed lists
  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user profile
        const profile = await fetchUserProfile(user.id)
        setUserProfile(toUserProfile(profile))

        // Fetch followed lists with items
        const { data: followedListsData, error: listsError } = await supabase
          .from('list_followers')
          .select(`
            bucket_list_id,
            bucket_lists (
              id,
              user_id,
              name,
              description,
              category,
              is_public,
              follower_count,
              created_at,
              updated_at,
              bucket_items (
                id,
                bucket_list_id,
                title,
                description,
                points,
                difficulty,
                location,
                completed,
                completed_date,
                created_at,
                updated_at
              ),
              profiles (
                username,
                avatar_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (listsError) throw listsError

        // Transform data to BucketList format
        const lists: BucketList[] = (followedListsData
          ?.map((item: any) => {
            const list = item.bucket_lists
            if (!list) return null

            return toBucketList(
              {
                id: list.id,
                user_id: list.user_id,
                name: list.name,
                description: list.description,
                category: list.category,
                is_public: list.is_public,
                follower_count: list.follower_count,
                created_at: list.created_at,
                updated_at: list.updated_at,
              },
              list.bucket_items || [],
              true // isFollowing is true since these are followed lists
            )
          })
          .filter((list): list is BucketList => list !== null) || [])

        // Add creator username to lists
        const listsWithCreator = lists.map((list: any, index: number) => {
          const originalList = followedListsData?.[index]?.bucket_lists
          return {
            ...list,
            createdBy: originalList?.profiles?.username || 'Unknown User'
          }
        })

        setFollowedLists(listsWithCreator)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Filter lists based on category and search
  const filteredLists = followedLists.filter((list) => {
    const matchesCategory = selectedCategory === "all" || list.category === selectedCategory
    const matchesSearch =
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Don't render if no user
  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">Your Bucket List</h1>
              <p className="text-lg text-muted-foreground">Track your dreams, celebrate your achievements</p>
            </div>
            <Link href="/create">
              <Button size="lg" className="gap-2">
                <span>✨</span>
                Create List
              </Button>
            </Link>
          </div>

          {/* User Stats Card */}
          <UserStats user={userProfile} />
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-6 mb-8">
          <div>
            <Input
              placeholder="Search your lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11"
            />
          </div>
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Lists Grid */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Following</h2>
          {filteredLists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {followedLists.length === 0 
                  ? "You're not following any lists yet" 
                  : "No lists match your search"}
              </p>
              <Link href="/explore">
                <Button variant="outline">Explore Bucket Lists</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredLists.map((list) => (
                <ListCard key={list.id} list={list} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
