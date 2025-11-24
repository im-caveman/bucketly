"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NotificationIconProps {
  unreadCount: number
  isActive: boolean
  onClick: () => void
}

export function NotificationIcon({
  unreadCount,
  isActive,
  onClick,
}: NotificationIconProps) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
