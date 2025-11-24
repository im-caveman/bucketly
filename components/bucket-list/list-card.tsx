"use client"

import type React from "react"

import type { BucketList } from "@/types/bucket-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

interface ListCardProps {
  list: BucketList
  compact?: boolean
}

export function ListCard({ list, compact = false }: ListCardProps) {
  const [isFollowing, setIsFollowing] = useState(list.isFollowing)
  const [followerCount, setFollowerCount] = useState(list.followers)

  const completed = list.items.filter((item) => item.completed).length
  const total = list.items.length
  const percentage = Math.round((completed / total) * 100)

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFollowing(!isFollowing)
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)
  }

  if (compact) {
    return (
      <Link href={`/list/${list.id}`}>
        <div className="list-card cursor-pointer">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-lg font-semibold truncate">{list.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{list.description}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completed}/{total} completed
              </span>
              <span className="font-semibold text-primary">{percentage}%</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const totalPoints = list.items.reduce((sum, i) => sum + i.points, 0)

  return (
    <Link href={`/list/${list.id}`} className="block h-full">
      <Card className="h-full min-h-[360px] overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate font-display text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                {list.name}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-base leading-relaxed min-h-[3.5rem]">
                {list.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-1 flex flex-col">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="progress-bar h-2">
              <div className="progress-bar-fill" style={{ width: `${Math.max(percentage, 0)}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {completed}/{total} items completed
              </span>
              <span className="font-semibold text-primary">{percentage}%</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-1.5 py-2 border-y border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Followers</span>
              <span className="font-semibold text-foreground">{followerCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Points</span>
              <span className="font-semibold text-primary">{totalPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created by</span>
              <span className="font-medium text-foreground">{list.createdBy}</span>
            </div>
          </div>

          {/* Follow Button */}
          <Button onClick={handleFollowToggle} variant={isFollowing ? "default" : "outline"} className="w-full mt-4">
            {isFollowing ? "Following" : "Follow List"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
