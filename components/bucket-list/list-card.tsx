"use client"

import type React from "react"

import type { BucketList } from "@/types/bucket-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { followBucketList, unfollowBucketList, createTimelineEvent } from "@/lib/bucket-list-service"
import Link from "next/link"
import { useState } from "react"
import {
  Pencil,
  Trash2,
  MoreVertical,
  Users,
  Calendar,
  ExternalLink,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Bookmark
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ListCardProps {
  list: BucketList
  compact?: boolean
  showProgress?: boolean
  showCreator?: boolean
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onFollowChange?: () => void
}

export function ListCard({
  list,
  compact = false,
  showProgress = true,
  showCreator = true,
  isOwner = false,
  onEdit,
  onDelete,
  onFollowChange
}: ListCardProps) {

  const [isFollowing, setIsFollowing] = useState(list.isFollowing)
  const [followerCount, setFollowerCount] = useState(list.followers || 0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const items = list.items || []
  const completed = items.filter((item) => item.completed).length
  const total = items.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0



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
          {showProgress ? (
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
          ) : (
            <div className="text-xs text-muted-foreground font-medium">
              {total} {total === 1 ? 'Item' : 'Tasks'}
            </div>
          )}
        </div>
      </Link>
    )
  }

  const totalPoints = items?.reduce((sum, i) => sum + i.points, 0) || 0

  const isShadowClone = !!list.origin_id

  return (
    <Link href={`/list/${list.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 flex flex-col">
        <CardHeader className="h-auto pb-0 relative group">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isShadowClone ? (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-1.5 py-0 h-5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Bookmark className="h-2.5 w-2.5" />
                    Followed
                  </Badge>
                ) : isOwner ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-1.5 py-0 h-5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Created
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="font-display text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">
                {list.name}
              </CardTitle>
            </div>
            {/* Show dropdown menu only for owned lists that are NOT clones */}
            {isOwner && !isShadowClone && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/list/${list.id}`;
                  }}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      onEdit();
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit List
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete List
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <CardDescription className="line-clamp-2 leading-snug">
            {list.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between gap-3">
          {/* Progress Section */}
          {showProgress ? (
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
          ) : (
            <div className="flex items-center justify-between text-sm font-medium py-1 px-3 bg-primary/5 rounded-full w-fit">
              <span className="text-primary">{total} {total === 1 ? 'Task' : 'Tasks'}</span>
            </div>
          )}

          {/* Stats Section */}
          <div className="space-y-1 py-2 border-y border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Followers</span>
              <span className="font-semibold text-foreground">{(followerCount || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Points</span>
              <span className="font-semibold text-primary">{(totalPoints || 0).toLocaleString()} pts</span>
            </div>
            {showCreator && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Created by</span>
                <span className="font-medium text-foreground truncate ml-2">{list.createdBy}</span>
              </div>
            )}
          </div>

          {/* Follow Button */}
          {!isOwner && (
            <Button
              onClick={handleFollowToggle}
              variant={isFollowing ? "default" : "outline"}
              className="w-full mt-auto"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? "..." : isFollowing ? "Following" : "Follow List"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
