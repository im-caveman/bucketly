"use client"

import type React from "react"

import type { BucketList } from "@/types/bucket-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { followBucketList, unfollowBucketList, createTimelineEvent } from "@/lib/bucket-list-service"
import Link from "next/link"
import { useState } from "react"

interface ListCardProps {
  list: BucketList
  compact?: boolean
  onFollowChange?: () => void
}

export function ListCard({ list, compact = false, onFollowChange }: ListCardProps) {
  const [isFollowing, setIsFollowing] = useState(list.isFollowing)
  const [followerCount, setFollowerCount] = useState(list.followers)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const completed = list.items.filter((item) => item.completed).length
  const total = list.items.length
  const percentage = Math.round((completed / total) * 100)

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow lists",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        await unfollowBucketList(user.id, list.id)
        setIsFollowing(false)
        setFollowerCount(followerCount - 1)
        toast({
          title: "Unfollowed",
          description: `You unfollowed "${list.name}"`,
        })
      } else {
        await followBucketList(user.id, list.id)
        setIsFollowing(true)
        setFollowerCount(followerCount + 1)
        
        // Create timeline event for following a list
        await createTimelineEvent(
          user.id,
          'list_followed',
          `Following: ${list.name}`,
          `Started following a ${list.category} bucket list`,
          {
            list_id: list.id,
            list_name: list.name,
            category: list.category,
          },
          true
        )
        
        toast({
          title: "Following",
          description: `You are now following "${list.name}"`,
        })
      }
      
      // Notify parent component of follow change
      if (onFollowChange) {
        onFollowChange()
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
      <Card className="h-full overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 flex flex-col">
        <CardHeader className="h-auto pb-0">
          <CardTitle className="font-display text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">
            {list.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 leading-snug">
            {list.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between gap-3">
          {/* Progress Section */}
          <div className="space-y-1.5">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${Math.max(percentage, 0)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completed}/{total} completed
              </span>
              <span className="font-semibold text-primary">{percentage}%</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-1 py-2 border-y border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Followers</span>
              <span className="font-semibold text-foreground">{followerCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Points</span>
              <span className="font-semibold text-primary">{totalPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Created by</span>
              <span className="font-medium text-foreground truncate ml-2">{list.createdBy}</span>
            </div>
          </div>

          {/* Follow Button */}
          <Button 
            onClick={handleFollowToggle} 
            variant={isFollowing ? "default" : "outline"} 
            className="w-full mt-auto" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "..." : isFollowing ? "Following" : "Follow List"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
