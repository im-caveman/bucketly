"use client"

import { useState } from "react"
import { ListCard } from "@/components/bucket-list/list-card"
import { CategoryFilter } from "@/components/bucket-list/category-filter"
import { UserStats } from "@/components/bucket-list/user-stats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { Category, BucketList, UserProfile } from "@/types/bucket-list"

// Mock data
const mockUser: UserProfile = {
  id: "1",
  username: "Alex Journey",
  avatar: "🎯",
  bio: "Living dreams one checkbox at a time",
  totalPoints: 2840,
  globalRank: 47,
  itemsCompleted: 89,
  listsFollowing: 12,
  listsCreated: 3,
}

const mockLists: BucketList[] = [
  {
    id: "1",
    name: "Travel the World",
    description: "Visit 50 countries and experience different cultures",
    category: "places",
    items: [
      {
        id: "1",
        title: "Visit Japan",
        description: "Experience Tokyo and Kyoto",
        points: 100,
        completed: true,
        difficulty: "medium",
      },
      {
        id: "2",
        title: "Trek Machu Picchu",
        description: "Hike to the ancient Incan city",
        points: 150,
        completed: true,
        difficulty: "hard",
      },
      {
        id: "3",
        title: "Safari in Kenya",
        description: "See the Big Five",
        points: 120,
        completed: false,
        difficulty: "hard",
      },
      {
        id: "4",
        title: "Northern Lights in Iceland",
        description: "Witness the Aurora Borealis",
        points: 100,
        completed: false,
        difficulty: "medium",
      },
      {
        id: "5",
        title: "Dive the Great Barrier Reef",
        description: "Explore coral and marine life",
        points: 110,
        completed: false,
        difficulty: "medium",
      },
    ],
    isFollowing: true,
    followers: 1240,
    createdBy: "Global Explorers",
    isPublic: true,
  },
  {
    id: "2",
    name: "Culinary Adventures",
    description: "Try 100 iconic dishes from around the world",
    category: "cuisines",
    items: [
      {
        id: "1",
        title: "Authentic Ramen in Tokyo",
        description: "Taste the best tonkotsu ramen",
        points: 50,
        completed: true,
        difficulty: "easy",
      },
      {
        id: "2",
        title: "Fresh Sushi Omakase",
        description: "Experience omakase at a Michelin-starred restaurant",
        points: 75,
        completed: true,
        difficulty: "medium",
      },
      {
        id: "3",
        title: "Paella in Spain",
        description: "Cook and eat paella in Valencia",
        points: 60,
        completed: false,
        difficulty: "medium",
      },
      {
        id: "4",
        title: "Thai Street Food Tour",
        description: "Eat the best street food in Bangkok",
        points: 55,
        completed: false,
        difficulty: "easy",
      },
    ],
    isFollowing: true,
    followers: 856,
    createdBy: "Food Lovers",
    isPublic: true,
  },
  {
    id: "3",
    name: "Read 50 Classics",
    description: "Read the most influential books of all time",
    category: "books",
    items: [
      { id: "1", title: "1984", description: "George Orwell", points: 80, completed: true, difficulty: "medium" },
      {
        id: "2",
        title: "Pride and Prejudice",
        description: "Jane Austen",
        points: 70,
        completed: true,
        difficulty: "medium",
      },
      {
        id: "3",
        title: "The Great Gatsby",
        description: "F. Scott Fitzgerald",
        points: 75,
        completed: false,
        difficulty: "easy",
      },
      {
        id: "4",
        title: "Moby Dick",
        description: "Herman Melville",
        points: 100,
        completed: false,
        difficulty: "hard",
      },
      {
        id: "5",
        title: "Jane Eyre",
        description: "Charlotte Brontë",
        points: 85,
        completed: false,
        difficulty: "medium",
      },
    ],
    isFollowing: true,
    followers: 2100,
    createdBy: "Book Club",
    isPublic: true,
  },
]

export default function BucketListHome() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLists = mockLists.filter((list) => {
    const matchesCategory = selectedCategory === "all" || list.category === selectedCategory
    const matchesSearch =
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && list.isFollowing
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
          <UserStats user={mockUser} />
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
              <p className="text-lg text-muted-foreground mb-4">No lists found</p>
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
