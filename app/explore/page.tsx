"use client"

import { useState, useMemo } from "react"
import { ListCard } from "@/components/bucket-list/list-card"
import { CategoryFilter } from "@/components/bucket-list/category-filter"
import { SortMenu } from "@/components/bucket-list/sort-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { usePublicBucketLists, useSearchBucketLists, useTrendingBucketLists } from "@/hooks/use-bucket-lists"
import type { BucketListWithItems } from "@/lib/bucket-list-service"
import type { Category, BucketList } from "@/types/bucket-list"
import { formatErrorMessage } from "@/lib/error-handler"

export default function ExplorePage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "new" | "points" | "a-z">("popular")
  const [activeTab, setActiveTab] = useState<"all" | "trending">("all")
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Use SWR hooks for data fetching with caching
  const { bucketLists: searchResults, isLoading: searchLoading, isError: searchError } = useSearchBucketLists(
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : undefined,
    user?.id
  )

  const {
    bucketLists: publicLists,
    hasMore: publicHasMore,
    isLoading: publicLoading,
    isError: publicError
  } = usePublicBucketLists(
    selectedCategory !== "all" ? selectedCategory : undefined,
    user?.id,
    page,
    pageSize
  )

  const { bucketLists: trendingLists, isLoading: trendingLoading, isError: trendingError } = useTrendingBucketLists(
    user?.id,
    20
  )

  // Determine which data to use
  const bucketLists = searchQuery.trim() ? searchResults : publicLists
  const loading = searchQuery.trim() ? searchLoading : publicLoading
  const error = searchQuery.trim() ? searchError : publicError
  const hasMore = searchQuery.trim() ? false : publicHasMore

  // Reset page when filters change
  const handleCategoryChange = (category: Category | "all") => {
    setSelectedCategory(category)
    setPage(0)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPage(0)
  }

  const convertToDisplayFormat = (list: BucketListWithItems & { isFollowing?: boolean }): BucketList => {
    return {
      id: list.id,
      name: list.name,
      description: list.description || "",
      category: list.category,
      items: list.bucket_items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        points: item.points,
        difficulty: item.difficulty || undefined,
        location: item.location || undefined,
        completed: item.completed,
        completedDate: item.completed_date || undefined,
      })),
      isFollowing: list.isFollowing || false,
      followers: list.follower_count,
      createdBy: list.profiles.username,
      isPublic: list.is_public,
    }
  }

  const filteredAndSortedLists = useMemo(() => {
    const listsToSort = activeTab === "trending" ? (trendingLists || []) : (bucketLists || [])
    const sorted = [...listsToSort].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.follower_count - a.follower_count
        case "new":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "points":
          return (
            b.bucket_items.reduce((sum, i) => sum + i.points, 0) -
            a.bucket_items.reduce((sum, i) => sum + i.points, 0)
          )
        case "a-z":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return sorted.map(convertToDisplayFormat)
  }, [bucketLists, trendingLists, sortBy, activeTab])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Explore Bucket Lists</h1>
          <p className="text-lg text-muted-foreground">Discover curated lists and find your next adventure</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "trending")} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">All Lists</TabsTrigger>
            <TabsTrigger value="trending">Trending 🔥</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        {activeTab === "all" && (
          <div className="mb-8">
            <Input
              placeholder="Search lists by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-11"
            />
          </div>
        )}

        {/* Category Filter */}
        {activeTab === "all" && (
          <div className="mb-8 pb-6 border-b border-border">
            <h2 className="font-display text-sm font-semibold mb-4 text-muted-foreground uppercase">Categories</h2>
            <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
          </div>
        )}

        {/* Sort and Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {activeTab === "trending" && trendingLoading ? (
              "Loading trending lists..."
            ) : (
              <>
                Showing {filteredAndSortedLists.length} list{filteredAndSortedLists.length !== 1 ? "s" : ""}
                {activeTab === "trending" && " (from last 30 days)"}
              </>
            )}
          </p>
          <SortMenu selected={sortBy} onChange={setSortBy} />
        </div>

        {/* Lists Grid */}
        {(loading || (activeTab === "trending" && trendingLoading)) ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Loading bucket lists...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-xl text-destructive mb-4">{formatErrorMessage(error)}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : filteredAndSortedLists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No lists found matching your criteria</p>
            <Button
              onClick={() => {
                handleSearchChange("")
                handleCategoryChange("all")
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && activeTab === "all" && !searchQuery.trim() && (
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
      </div>
    </div>
  )
}
