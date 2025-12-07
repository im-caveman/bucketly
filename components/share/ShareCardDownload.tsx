"use client"

import React, { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { saveAs } from "file-saver"
import { Button } from "@/components/ui/button"
import { Loader2, Share2, Download, Check, Link as LinkIcon, Facebook } from "lucide-react"
import { toast } from "sonner"
import { ShareCardClassic } from "./variations/ShareCardClassic"
import { ShareCardIllustration } from "./variations/ShareCardIllustration"
import { ShareCardVector } from "./variations/ShareCardVector"
import { ShareCardCertificate } from "./variations/ShareCardCertificate"

export type ShareCardVariant = "classic" | "illustration" | "vector" | "certificate"

interface ShareCardDownloadProps {
    title: string
    points: number
    username: string
    photo?: string
    itemId: string
    variant?: ShareCardVariant
    rank?: number | string
}

export function ShareCardDownload({
    title,
    points,
    username,
    photo,
    itemId,
    variant = "illustration",
    rank
}: ShareCardDownloadProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        if (!cardRef.current) return

        try {
            setIsGenerating(true)
            // Wait a brief moment for fonts/images to be ready if they were just mounted
            await new Promise(resolve => setTimeout(resolve, 100))

            const dataUrl = await toPng(cardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1080,
                pixelRatio: 1, // Ensure 1:1 mapping for 1080x1080
            })

            saveAs(dataUrl, `bucketly-${variant}-${Date.now()}.png`)
            toast.success("Card downloaded! Ready to share.")
        } catch (err) {
            console.error("Failed to generate image:", err)
            toast.error("Failed to generate share card")
        } finally {
            setIsGenerating(false)
        }
    }

    const shareText = `I just completed "${title}" and earned ${points} points on Bucketly! 🏆 #Bucketly`
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?item=${itemId}`
        : ''

    const handleShareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    }

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')
    }

    const [copied, setCopied] = useState(false)
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const renderCard = () => {
        const props = {
            title,
            points,
            username,
            photo,
            rank,
            date: new Date().toISOString()
        }

        switch (variant) {
            case "classic":
                return <ShareCardClassic {...props} />
            case "certificate":
                return <ShareCardCertificate {...props} />
            case "vector":
                // Vector style doesn't strictly need photo, but we pass it anyway
                return <ShareCardVector {...props} />
            case "illustration":
            default:
                return <ShareCardIllustration {...props} />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-lg text-center">Share your success!</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download Image
                    </Button>
                    <Button variant="outline" onClick={handleShareTwitter} className="gap-2" size="icon" title="Tweet">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    </Button>
                    <Button variant="outline" onClick={handleShareFacebook} className="gap-2" size="icon" title="Share on Facebook">
                        <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="gap-2" size="icon" title="Copy Link">
                        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Hidden Render Container - Positioned off-screen absolutely but kept in DOM */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div ref={cardRef}>
                    {renderCard()}
                </div>
            </div>
        </div>
    )
}
