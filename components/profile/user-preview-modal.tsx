"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Twitter, Instagram, Linkedin, Github, Globe, UserPlus, UserMinus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useUserFollow } from "@/hooks/use-user-follow"
import { useAuth } from "@/contexts/auth-context"

interface UserPreviewModalProps {
  userId: string
  username: string
  avatar: string
  bio?: string
  totalPoints: number
  itemsCompleted: number
  globalRank?: number
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string
}

export function UserPreviewModal({
  userId,
  username,
  avatar,
  bio,
  totalPoints,
  itemsCompleted,
  globalRank,
  twitterUrl,
  instagramUrl,
  linkedinUrl,
  githubUrl,
  websiteUrl,
}: UserPreviewModalProps) {
  const { user } = useAuth()
  const { isFollowing, isLoading, toggleFollow } = useUserFollow(userId)
  const isAvatarUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('/'))
  const fallbackInitial = username.charAt(0).toUpperCase()
  const isOwnProfile = user?.id === userId

  const socialLinks = [
    { url: twitterUrl, icon: Twitter, label: "Twitter" },
    { url: instagramUrl, icon: Instagram, label: "Instagram" },
    { url: linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: githubUrl, icon: Github, label: "GitHub" },
    { url: websiteUrl, icon: Globe, label: "Website" },
  ].filter(link => link.url)

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFollow()
  }

  return (
    <Card className="w-80 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-xl">
      <CardContent className="pt-6 pb-4">
        <Link href={`/${username}`} className="block">
          <div className="flex flex-col items-center text-center mb-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative mb-3">
              <Avatar className="size-20 ring-4 ring-primary/20">
                {isAvatarUrl && <AvatarImage src={avatar} alt={username} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl text-white">
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              {/* Follow Button Badge */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowClick}
                  disabled={isLoading}
                  className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ring-2 ring-background ${
                    isFollowing 
                      ? 'bg-muted hover:bg-muted/80 text-foreground' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFollowing ? 'Unfollow' : 'Follow'}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <h2 className="font-display text-xl font-bold mb-1">{username}</h2>
            {globalRank && (
              <Badge className="mb-2 cursor-pointer">Global Rank #{globalRank}</Badge>
            )}
            {bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bio}</p>
            )}
          </div>
        </Link>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
          <div className="text-center p-2 bg-muted/50 rounded-lg cursor-default">
            <p className="text-2xl font-display font-bold text-primary">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg cursor-default">
            <p className="text-2xl font-display font-bold text-primary">{itemsCompleted}</p>
            <p className="text-xs text-muted-foreground">Items Completed</p>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {socialLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Link
                  key={index}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
