"use client"

import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BadgeIconProps {
    badgeCount: number
    isActive: boolean
    onClick: () => void
}

export function BadgeIcon({
    badgeCount,
    isActive,
    onClick,
}: BadgeIconProps) {
    return (
        <Button
            variant={isActive ? "default" : "ghost"}
            size="icon"
            className="relative cursor-pointer"
            onClick={onClick}
            aria-label="View badges"
        >
            <Trophy className="h-5 w-5" />
            {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    {badgeCount}
                </span>
            )}
        </Button>
    )
}
