"use client"

import { useState, useMemo } from "react"
import { ListCard } from "@/components/bucket-list/list-card"
import { CategoryFilter } from "@/components/bucket-list/category-filter"
import { SortMenu } from "@/components/bucket-list/sort-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Category, BucketList } from "@/types/bucket-list"

// Extended mock data for explore page
const allAvailableLists: BucketList[] = [
  {
    id: "1",
    name: "Travel the World",
    description: "Visit 50 countries and experience different cultures",
    category: "places",
    items: Array(50)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Location ${i + 1}`,
        description: "Explore",
        points: 100,
        completed: Math.random() > 0.7,
        difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as any,
      })),
    isFollowing: false,
    followers: 2450,
    createdBy: "Global Explorers",
    isPublic: true,
  },
  {
    id: "2",
    name: "Culinary Adventures",
    description: "Try 100 iconic dishes from around the world",
    category: "cuisines",
    items: Array(100)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Dish ${i + 1}`,
        description: "Taste",
        points: 50,
        completed: false,
        difficulty: ["easy", "medium"][Math.floor(Math.random() * 2)] as any,
      })),
    isFollowing: false,
    followers: 1856,
    createdBy: "Food Lovers",
    isPublic: true,
  },
  {
    id: "3",
    name: "Read 50 Classics",
    description: "Read the most influential books of all time",
    category: "books",
    items: Array(50)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Book ${i + 1}`,
        description: "Read",
        points: 80,
        completed: false,
        difficulty: ["medium", "hard"][Math.floor(Math.random() * 2)] as any,
      })),
    isFollowing: false,
    followers: 3100,
    createdBy: "Book Club",
    isPublic: true,
  },
  {
    id: "4",
    name: "Ultimate Adventure Sports",
    description: "Try 25 extreme sports and adrenaline activities",
    category: "adventures",
    items: Array(25)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Activity ${i + 1}`,
        description: "Experience",
        points: 150,
        completed: false,
        difficulty: "hard",
      })),
    isFollowing: false,
    followers: 892,
    createdBy: "Thrill Seekers",
    isPublic: true,
  },
  {
    id: "5",
    name: "Iconic Monuments",
    description: "Visit 30 UNESCO world heritage sites",
    category: "monuments",
    items: Array(30)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Monument ${i + 1}`,
        description: "Visit",
        points: 120,
        completed: false,
        difficulty: "medium",
      })),
    isFollowing: false,
    followers: 1567,
    createdBy: "History Buffs",
    isPublic: true,
  },
  {
    id: "6",
    name: "Billboard Hot 100 Classics",
    description: "Listen to the 100 greatest songs ever made",
    category: "songs",
    items: Array(100)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Song ${i + 1}`,
        description: "Listen",
        points: 30,
        completed: false,
        difficulty: "easy",
      })),
    isFollowing: false,
    followers: 2234,
    createdBy: "Music Enthusiasts",
    isPublic: true,
  },
  {
    id: "7",
    name: "Random Acts of Kindness",
    description: "Perform 100 acts of service and kindness",
    category: "acts-of-service",
    items: Array(100)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Act ${i + 1}`,
        description: "Do good",
        points: 25,
        completed: false,
        difficulty: "easy",
      })),
    isFollowing: false,
    followers: 4120,
    createdBy: "Good Samaritans",
    isPublic: true,
  },
  {
    id: "8",
    name: "Life Achievements",
    description: "Accomplish 50 personal and professional goals",
    category: "miscellaneous",
    items: Array(50)
      .fill(null)
      .map((_, i) => ({
        id: `${i}`,
        title: `Goal ${i + 1}`,
        description: "Achieve",
        points: 200,
        completed: false,
        difficulty: "hard",
      })),
    isFollowing: false,
    followers: 1298,
    createdBy: "Goal Setters",
    isPublic: true,
  },
]

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "new" | "points" | "a-z">("popular")

  const filteredAndSortedLists = useMemo(() => {
    const filtered = allAvailableLists.filter((list) => {
      const matchesCategory = selectedCategory === "all" || list.category === selectedCategory
      const matchesSearch =
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.followers - a.followers
        case "new":
          return 0 // In real app, would use createdDate
        case "points":
          return b.items.reduce((sum, i) => sum + i.points, 0) - a.items.reduce((sum, i) => sum + i.points, 0)
        case "a-z":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return sorted
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Explore Bucket Lists</h1>
          <p className="text-lg text-muted-foreground">Discover curated lists and find your next adventure</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search lists by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 pb-6 border-b border-border">
          <h2 className="font-display text-sm font-semibold mb-4 text-muted-foreground uppercase">Categories</h2>
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Sort and Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedLists.length} list{filteredAndSortedLists.length !== 1 ? "s" : ""}
          </p>
          <SortMenu selected={sortBy} onChange={setSortBy} />
        </div>

        {/* Lists Grid */}
        {filteredAndSortedLists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No lists found matching your criteria</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
