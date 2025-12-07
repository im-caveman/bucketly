"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShareCardDownload } from "@/components/share/ShareCardDownload"
import { useAuth } from "@/contexts/auth-context"

interface ListCompletionModalProps {
    isOpen: boolean
    listTitle: string
    listId: string
    totalPoints: number
    onClose: () => void
}

export function ListCompletionModal({ isOpen, listTitle, listId, totalPoints, onClose }: ListCompletionModalProps) {
    const { user } = useAuth()

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>List Completed! 🏆</DialogTitle>
                    <DialogDescription>
                        Incredible! You've completed every item in "{listTitle}". Here is your official certificate.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <ShareCardDownload
                        title={listTitle}
                        points={totalPoints} // Sum of all points
                        username={user?.user_metadata?.username || "Bucketly User"}
                        itemId={listId} // Use listId here for sharing context
                        variant="certificate"
                        rank="Master" // Or calculates rank
                    />

                    <div className="flex justify-center">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
