import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useFollowers } from "@/hooks/use-followers"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserHoverCard } from "./user-hover-card"

interface FollowersDialogProps {
    userId: string
    children: React.ReactNode
}

export function FollowersDialog({ userId, children }: FollowersDialogProps) {
    const { followers, isLoading } = useFollowers(userId)

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                Loading followers...
                            </div>
                        ) : followers?.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                No followers yet
                            </div>
                        ) : (
                            followers?.map((follow: any) => (
                                <div key={follow.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserHoverCard user={follow.follower}>
                                            <Link href={`/profile/${follow.follower.username}`}>
                                                <Avatar className="h-10 w-10 border cursor-pointer">
                                                    <AvatarImage src={follow.follower.avatar_url} />
                                                    <AvatarFallback>{follow.follower.username[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                        </UserHoverCard>
                                        <div className="flex flex-col">
                                            <UserHoverCard user={follow.follower}>
                                                <Link
                                                    href={`/profile/${follow.follower.username}`}
                                                    className="font-medium hover:underline cursor-pointer"
                                                >
                                                    {follow.follower.username}
                                                </Link>
                                            </UserHoverCard>
                                            {follow.follower.bio && (
                                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {follow.follower.bio}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Future: Add Follow/Unfollow button here if looking at own profile or checking relationship */}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
