"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

const AVAILABLE_AVATARS = [
  "/avatars/user_krimson.png",
  "/avatars/user_joyboy.png",
  "/avatars/user_mati.png",
  "/avatars/user_pek.png",
]

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    completions: true,
    followers: true,
    comments: true,
    achievements: true,
  })

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showProgress: true,
    allowMessages: true,
  })

  const [avatar, setAvatar] = useState("/avatars/user_krimson.png")
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
      setIsAvatarDialogOpen(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    toast.success("Profile updated successfully", {
      description: "Your changes have been saved to your account.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👤</span>
                Profile Settings
              </CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative size-24 rounded-xl overflow-hidden border-2 border-border">
                    <Image src={avatar || "/placeholder.svg"} alt="Current avatar" fill className="object-cover" />
                  </div>
                  <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Profile Picture</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-4 gap-4 py-4">
                        {AVAILABLE_AVATARS.map((src) => (
                          <button
                            key={src}
                            onClick={() => {
                              setAvatar(src)
                              setIsAvatarDialogOpen(false)
                            }}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                              avatar === src
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-border",
                            )}
                          >
                            <Image src={src || "/placeholder.svg"} alt="Avatar option" fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or upload your own</span>
                        </div>
                      </div>
                      <div className="flex justify-center pt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => document.getElementById("avatar-upload")?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" defaultValue="KRIMSON" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="mt-2 min-h-20"
                      defaultValue="Adventure seeker and bucket list enthusiast!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Your city or country"
                      className="mt-2"
                      defaultValue="Global Nomad"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔔</span>
                Notifications
              </CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Item Completions</p>
                  <p className="text-sm text-muted-foreground">When you or friends complete items</p>
                </div>
                <Switch
                  checked={notifications.completions}
                  onCheckedChange={(v) => setNotifications({ ...notifications, completions: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">New Followers</p>
                  <p className="text-sm text-muted-foreground">When someone follows you</p>
                </div>
                <Switch
                  checked={notifications.followers}
                  onCheckedChange={(v) => setNotifications({ ...notifications, followers: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Comments & Likes</p>
                  <p className="text-sm text-muted-foreground">Activity on your posts</p>
                </div>
                <Switch
                  checked={notifications.comments}
                  onCheckedChange={(v) => setNotifications({ ...notifications, comments: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Achievements</p>
                  <p className="text-sm text-muted-foreground">New badges and milestones</p>
                </div>
                <Switch
                  checked={notifications.achievements}
                  onCheckedChange={(v) => setNotifications({ ...notifications, achievements: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔒</span>
                Privacy
              </CardTitle>
              <CardDescription>Control who can see your activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Anyone can view your profile</p>
                </div>
                <Switch
                  checked={privacy.profilePublic}
                  onCheckedChange={(v) => setPrivacy({ ...privacy, profilePublic: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Show Progress</p>
                  <p className="text-sm text-muted-foreground">Display completion stats on profile</p>
                </div>
                <Switch
                  checked={privacy.showProgress}
                  onCheckedChange={(v) => setPrivacy({ ...privacy, showProgress: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Allow Messages</p>
                  <p className="text-sm text-muted-foreground">Receive messages from other users</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(v) => setPrivacy({ ...privacy, allowMessages: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <span>⚠️</span>
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground text-center">This action cannot be undone</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
