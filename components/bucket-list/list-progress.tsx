"use client"

import type { BucketListItem } from "@/types/bucket-list"
import { Card, CardContent } from "@/components/ui/card"

interface ListProgressProps {
  items: BucketListItem[]
  points?: number
}

export function ListProgress({ items, points }: ListProgressProps) {
  const completed = items.filter((i) => i.is_completed).length
  const total = items.length
  const percentage = Math.round((completed / total) * 100)
  const totalPoints = items.reduce((sum, i) => sum + i.points, 0)
  const earnedPoints = items.filter((i) => i.is_completed).reduce((sum, i) => sum + i.points, 0)

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase">Progress</p>
                <span className="font-display text-3xl font-bold text-primary">{percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completed} of {total} items
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Points</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-accent">{earnedPoints}</span>
              <span className="text-sm text-muted-foreground">/ {totalPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Points possible</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
