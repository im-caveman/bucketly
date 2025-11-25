import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { CalendarDays } from "lucide-react"

interface UserHoverCardProps {
    user: {
        username: string
        avatar_url?: string | null
        bio?: string | null
        created_at?: string
    }
    children: React.ReactNode
}

export function UserHoverCard({ user, children }: UserHoverCardProps) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <Link href={`/profile/${user.username}`}>
                            <h4 className="text-sm font-semibold hover:underline">@{user.username}</h4>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {user.bio || "No bio available"}
                        </p>
                        <div className="flex items-center pt-2">
                            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                            <span className="text-xs text-muted-foreground">
                                Joined {new Date().getFullYear()} {/* Placeholder as we might not have created_at */}
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}
