"use client"

import type { UserProfile } from "@/types/bucket-list"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface UserStatsProps {
  user: UserProfile
}

export function UserStats({ user }: UserStatsProps) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  // Check if avatar is a URL or emoji/text
  const isAvatarUrl = user.avatar_url && (user.avatar_url.startsWith('http') || user.avatar_url.startsWith('/'))
  const avatarInitial = user.username ? user.username.charAt(0).toUpperCase() : '?'
  const avatarSrc = isAvatarUrl ? user.avatar_url : `/placeholder-user.jpg`

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            {isAvatarUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                {avatarInitial}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
              {getMedalIcon(user.global_rank ?? 0)}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-display font-bold text-lg">{user.username}</h3>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="font-display font-bold text-primary text-lg">{user.total_points ?? 0}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-accent text-lg">{user.items_completed ?? 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-secondary text-lg">{user.lists_following ?? 0}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
