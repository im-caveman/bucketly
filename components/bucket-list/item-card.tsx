"use client"

import type { BucketListItem } from "@/types/bucket-list"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ItemCardProps {
  item: BucketListItem
  onToggle: (completed: boolean) => void
  onUploadMemory: () => void
}

const difficultyColors = {
  easy: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  hard: "bg-destructive/10 text-destructive",
}

export function ItemCard({ item, onToggle, onUploadMemory }: ItemCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        item.completed ? "opacity-60 bg-muted/50" : "hover:border-primary hover:shadow-md hover:shadow-primary/10"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox checked={item.completed} onCheckedChange={onToggle} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4
                  className={`font-display font-bold text-base ${
                    item.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
              <span className="font-display font-bold text-lg text-primary shrink-0">+{item.points}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
              {item.difficulty && (
                <Badge variant="secondary" className={difficultyColors[item.difficulty]}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Badge>
              )}
              {item.location && (
                <Badge variant="outline" className="gap-1">
                  <span>📍</span>
                  {item.location}
                </Badge>
              )}
              {item.completed && (
                <Badge className="bg-success/10 text-success gap-1">
                  <span>✓</span>
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {item.completed && (
          <Button onClick={onUploadMemory} variant="outline" size="sm" className="mt-3 w-full gap-2 bg-transparent">
            <span>📸</span>
            Upload Memory
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
