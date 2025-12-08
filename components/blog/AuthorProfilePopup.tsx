"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPreviewModal } from "@/components/profile/user-preview-modal"

interface AuthorProfilePopupProps {
    userId: string
    username: string
    fullName: string
    avatarUrl: string | null
    bio: string | null
    stats?: {
        totalPoints: number
        itemsCompleted: number
        globalRank: number | null
    }
    social?: {
        twitter: string | null
        instagram: string | null
        linkedin: string | null
        github: string | null
        website: string | null
    }
}

export function AuthorProfilePopup({
    userId,
    username,
    fullName,
    avatarUrl,
    bio,
    stats,
    social
}: AuthorProfilePopupProps) {
    const [isOpen, setIsOpen] = useState(false)
    const isAvatarUrl = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))
    const fallbackInitial = username ? username.charAt(0).toUpperCase() : 'A'

    const handleClick = () => {
        setIsOpen(!isOpen)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleClick}
                >
                    <Avatar className="h-16 w-16">
                        {isAvatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                        <AvatarFallback className="text-lg">
                            {fallbackInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium mb-1">
                            {fullName}
                        </p>
                        {bio && (
                            <p className="text-sm text-muted-foreground">{bio}</p>
                        )}
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
                    userId={userId}
                    username={username}
                    avatar={avatarUrl || ''}
                    bio={bio || undefined}
                    totalPoints={stats?.totalPoints || 0}
                    itemsCompleted={stats?.itemsCompleted || 0}
                    globalRank={stats?.globalRank || undefined}
                    twitterUrl={social?.twitter || undefined}
                    instagramUrl={social?.instagram || undefined}
                    linkedinUrl={social?.linkedin || undefined}
                    githubUrl={social?.github || undefined}
                    websiteUrl={social?.website || undefined}
                />
            </PopoverContent>
        </Popover>
    )
}
