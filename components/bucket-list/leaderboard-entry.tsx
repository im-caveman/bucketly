"use client"
import { Card, CardContent } from "@/components/ui/card"

interface LeaderboardEntryProps {
  rank: number
  username: string
  avatar: string
  points: number
  completions: number
  trend?: "up" | "down" | "flat"
  isCurrentUser?: boolean
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
}: LeaderboardEntryProps) {
  const medal = getMedalIcon(rank)

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
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

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white">
              {avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-display font-bold ${isCurrentUser ? "text-primary" : ""}`}>
                {username}
                {isCurrentUser && <span className="text-xs ml-2 text-primary">(You)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{completions} completions</p>
            </div>
          </div>

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
