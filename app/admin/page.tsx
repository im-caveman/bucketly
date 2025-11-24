"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { useAuth } from "@/contexts/auth-context"
import { AdminListCreator } from "@/components/admin/admin-list-creator"
import { AdminListManager } from "@/components/admin/admin-list-manager"
import { AdminNotificationManager } from "@/components/admin/admin-notification-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ListChecks, Users, Settings, Bell } from "lucide-react"

export default function AdminPage() {
    const { user } = useAuth()
    const { isAdmin, isLoading } = useAdmin()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            // Redirect non-admin users to dashboard
            router.push("/")
        }
    }, [isAdmin, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold mb-2">🛡️ Admin Panel</h1>
                    <p className="text-lg text-muted-foreground">
                        Manage platform content, users, and settings
                    </p>
                </div>

                {/* Admin Tabs */}
                <Tabs defaultValue="lists" className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="lists" className="gap-2">
                            <ListChecks className="h-4 w-4" />
                            Lists
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* List Management Tab */}
                    <TabsContent value="lists" className="space-y-6 mt-6">
                        {/* Create Public List Section */}
                        <Card>
                            <CardHeader className="pb-4 !h-auto min-h-[auto]">
                                <CardTitle className="flex items-center gap-2 mb-2">
                                    <span>✨</span>
                                    Create Public Bucket List
                                </CardTitle>
                                <CardDescription className="mt-0 text-sm leading-relaxed">
                                    Create a new public bucket list that will be visible to all users on the Explore page
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <AdminListCreator />
                            </CardContent>
                        </Card>

                        {/* Manage Lists Section */}
                        <Card>
                            <CardHeader className="pb-4 !h-auto min-h-[auto]">
                                <CardTitle className="flex items-center gap-2 mb-2">
                                    <span>📋</span>
                                    Manage Public Lists
                                </CardTitle>
                                <CardDescription className="mt-0 text-sm leading-relaxed">
                                    View, edit, and manage all public bucket lists
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <AdminListManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Management Tab */}
                    <TabsContent value="notifications" className="mt-6">
                        <AdminNotificationManager />
                    </TabsContent>

                    {/* User Management Tab */}
                    <TabsContent value="users" className="mt-6">
                        <Card>
                            <CardHeader className="pb-4 !h-auto min-h-[auto]">
                                <CardTitle className="flex items-center gap-2 mb-2">
                                    <Users className="h-5 w-5" />
                                    User Management
                                </CardTitle>
                                <CardDescription className="mt-0 text-sm leading-relaxed">
                                    Manage user accounts, roles, and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-lg font-medium mb-2">User Management</p>
                                    <p className="text-sm text-muted-foreground">
                                        User management features coming soon
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="mt-6">
                        <Card>
                            <CardHeader className="pb-4 !h-auto min-h-[auto]">
                                <CardTitle className="flex items-center gap-2 mb-2">
                                    <Settings className="h-5 w-5" />
                                    Platform Settings
                                </CardTitle>
                                <CardDescription className="mt-0 text-sm leading-relaxed">
                                    Configure global platform settings and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-center py-12">
                                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-lg font-medium mb-2">Platform Settings</p>
                                    <p className="text-sm text-muted-foreground">
                                        Settings configuration coming soon
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
