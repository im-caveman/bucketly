"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import { createAdminNotification } from "@/lib/notification-service"
import { toast } from "sonner"

export function AdminNotificationManager() {
    const { user } = useAuth()
    const [isSending, setIsSending] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "info" as "info" | "warning" | "success" | "error",
        priority: "medium" as "low" | "medium" | "high",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("You must be logged in")
            return
        }

        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error("Please fill in title and message")
            return
        }

        setIsSending(true)

        try {
            await createAdminNotification(
                formData.title.trim(),
                formData.message.trim(),
                formData.type,
                formData.priority
            )

            toast.success("Notification sent to all users!")

            // Reset form
            setFormData({
                title: "",
                message: "",
                type: "info",
                priority: "medium",
            })
        } catch (error: any) {
            console.error('Error sending notification:', error)
            toast.error(error.message || "Failed to send notification")
        } finally {
            setIsSending(false)
        }
    }

    const quickTemplates = [
        {
            title: "🎉 New Feature Available",
            message: "We've just released a new feature! Check it out and let us know what you think.",
            type: "success" as const,
            priority: "medium" as const,
        },
        {
            title: "📢 Important Update",
            message: "We have an important update regarding the platform. Please check your account settings.",
            type: "info" as const,
            priority: "high" as const,
        },
        {
            title: "⚠️ Maintenance Notice",
            message: "Scheduled maintenance will occur tonight from 2 AM to 4 AM EST. The platform may be temporarily unavailable.",
            type: "warning" as const,
            priority: "high" as const,
        },
    ]

    const applyTemplate = (template: typeof quickTemplates[0]) => {
        setFormData({
            title: template.title,
            message: template.message,
            type: template.type,
            priority: template.priority,
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4 !h-auto min-h-[auto]">
                    <CardTitle className="flex items-center gap-2 mb-2">
                        <span>📢</span>
                        Send Admin Notification
                    </CardTitle>
                    <CardDescription className="mt-0 text-sm leading-relaxed">
                        Create and send a notification to all users on the platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="notification-title" className="text-base font-semibold">
                                Title *
                            </Label>
                            <Input
                                id="notification-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., New Feature Available"
                                required
                                className="h-11"
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notification-message" className="text-base font-semibold">
                                Message *
                            </Label>
                            <Textarea
                                id="notification-message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter your notification message..."
                                rows={4}
                                required
                                className="min-h-24"
                                maxLength={1000}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.message.length}/1000 characters
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="notification-type" className="text-base font-semibold">
                                    Type
                                </Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, type: value as typeof formData.type })
                                    }
                                >
                                    <SelectTrigger id="notification-type" className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">ℹ️ Info</SelectItem>
                                        <SelectItem value="success">✅ Success</SelectItem>
                                        <SelectItem value="warning">⚠️ Warning</SelectItem>
                                        <SelectItem value="error">❌ Error</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notification-priority" className="text-base font-semibold">
                                    Priority
                                </Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, priority: value as typeof formData.priority })
                                    }
                                >
                                    <SelectTrigger id="notification-priority" className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" disabled={isSending} className="w-full h-11">
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to All Users
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
                <CardHeader className="pb-4 !h-auto min-h-[auto]">
                    <CardTitle className="text-base mb-2">Quick Templates</CardTitle>
                    <CardDescription className="mt-0 text-sm leading-relaxed">
                        Click a template to fill the form quickly
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-3">
                        {quickTemplates.map((template, index) => (
                            <Button
                                key={index}
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-4 px-4 hover:bg-accent transition-colors"
                                onClick={() => applyTemplate(template)}
                            >
                                <div className="flex-1 text-left">
                                    <div className="font-semibold mb-2 text-sm">{template.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {template.message}
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

