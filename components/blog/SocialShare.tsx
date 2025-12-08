'use client'

import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

interface SocialShareProps {
    url: string
    title: string
    description?: string
}

export function SocialShare({ url, title, description }: SocialShareProps) {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = description ? encodeURIComponent(description) : ''

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard!')
        } catch (error) {
            toast.error('Failed to copy link')
        }
    }

    const openShareWindow = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400')
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Share:</span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => openShareWindow(shareLinks.twitter)}
                className="gap-2"
            >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Share on Twitter</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => openShareWindow(shareLinks.facebook)}
                className="gap-2"
            >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Share on Facebook</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => openShareWindow(shareLinks.linkedin)}
                className="gap-2"
            >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">Share on LinkedIn</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
            >
                <LinkIcon className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
            </Button>
        </div>
    )
}
