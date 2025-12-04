"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2, Link as LinkIcon, Twitter, Facebook, Linkedin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SocialShareProps {
    url: string
    title: string
    description?: string
}

export function SocialShare({ url, title, description }: SocialShareProps) {
    const { toast } = useToast()

    const handleShare = (platform: string) => {
        let shareUrl = ""
        const text = encodeURIComponent(title)
        const desc = encodeURIComponent(description || "")
        const link = encodeURIComponent(url)

        switch (platform) {
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${link}`
                break
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}`
                break
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`
                break
            case "copy":
                navigator.clipboard.writeText(url)
                toast({
                    title: "Link copied!",
                    description: "The link has been copied to your clipboard.",
                })
                return
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank", "width=600,height=400")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("copy")}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
