"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserPreviewModal } from "@/components/profile/user-preview-modal"
import { useState } from "react"

interface LeaderboardEntryProps {
  rank: number
  username: string
  avatar: string
  points: number
  completions: number
  trend?: "up" | "down" | "flat"
  isCurrentUser?: boolean
  userId?: string
  bio?: string
  globalRank?: number
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string
}

const getMedalIcon = (rank: number) => {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return null
}

const getTrendIcon = (trend?: string) => {
  if (trend === "up") return "📈"
  if (trend === "down") return "📉"
  return "➡️"
}

export function LeaderboardEntry({
  rank,
  username,
  avatar,
  points,
  completions,
  trend,
  isCurrentUser,
  userId,
  bio,
  globalRank,
  twitterUrl,
  instagramUrl,
  linkedinUrl,
  githubUrl,
  websiteUrl,
}: LeaderboardEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const medal = getMedalIcon(rank)

  // Check if avatar is a URL or just initials
  const isAvatarUrl = avatar.startsWith('http') || avatar.startsWith('/')
  const fallbackInitial = isAvatarUrl ? username.charAt(0).toUpperCase() : avatar

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 relative ${isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
        }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="text-center w-12 shrink-0">
            {medal ? (
              <div className="text-3xl">{medal}</div>
            ) : (
              <div className="font-display text-2xl font-bold text-muted-foreground">#{rank}</div>
            )}
          </div>

          {/* User Info with Click Preview */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleClick}
              >
                <Avatar className="w-10 h-10">
                  {isAvatarUrl && <AvatarImage src={avatar} alt={username} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    {fallbackInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className={`font-display font-bold ${isCurrentUser ? "text-primary" : ""}`}>
                    {username}
                    {isCurrentUser && <span className="text-xs ml-2 text-primary">(You)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{completions} completions</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent 
              side="left" 
              align="start"
              sideOffset={-60}
              alignOffset={-20}
              className="p-0 border-0 bg-transparent shadow-none w-auto z-50"
            >
              <UserPreviewModal
                userId={userId || ''}
                username={username}
                avatar={avatar}
                bio={bio}
                totalPoints={points}
                itemsCompleted={completions}
                globalRank={globalRank || rank}
                twitterUrl={twitterUrl}
                instagramUrl={instagramUrl}
                linkedinUrl={linkedinUrl}
                githubUrl={githubUrl}
                websiteUrl={websiteUrl}
              />
            </PopoverContent>
          </Popover>

          {/* Points */}
          <div className="text-right shrink-0">
            <p className="font-display font-bold text-lg text-primary">{points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>

          {/* Trend */}
          {trend && <div className="text-xl">{getTrendIcon(trend)}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
