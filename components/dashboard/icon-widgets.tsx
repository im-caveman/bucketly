"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationIcon } from "./notifications/notification-icon"
import Notifications from "./notifications"
import type { Notification } from "@/types/dashboard"
import {
  fetchUserNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/notification-service"
import { BadgeIcon } from "./badges/badge-icon"
import BadgePreview from "./badges"
import { useUserBadges } from "@/hooks/use-badges"

type ActiveWidget = "notifications" | "badges" | null

export function IconWidgets() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeWidget, setActiveWidget] = useState<ActiveWidget>(null)
  const { userBadges } = useUserBadges(user?.id)

  // Fetch notifications on mount
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    async function loadNotifications() {
      if (!user?.id) return

      try {
        const fetchedNotifications = await fetchUserNotifications(user.id)
        setNotifications(fetchedNotifications)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [user?.id])

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!user?.id) return

    const channel = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotification.id)
        if (exists) {
          return prev.map((n) =>
            n.id === newNotification.id ? newNotification : n
          )
        }
        return [newNotification, ...prev]
      })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Notification Handlers
  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )

    try {
      await markNotificationAsRead(id, user.id)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
      )
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!user?.id) return

    // Optimistically update UI
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))

    try {
      await deleteNotification(id, user.id)
    } catch (error) {
      console.error("Error deleting notification:", error)
      // Reload on error
      const fetchedNotifications = await fetchUserNotifications(user.id)
      setNotifications(fetchedNotifications)
    }
  }

  const handleClearAll = async () => {
    if (!user?.id) return

    // Optimistically clear UI
    setNotifications([])

    try {
      await deleteAllNotifications(user.id)
    } catch (error) {
      console.error("Error clearing notifications:", error)
      // Reload on error
      const fetchedNotifications = await fetchUserNotifications(user.id)
      setNotifications(fetchedNotifications)
    }
  }

  const toggleWidget = (widget: ActiveWidget) => {
    setActiveWidget((prev) => (prev === widget ? null : widget))
  }

  return (
    <>
      {/* Icon Row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <NotificationIcon
              unreadCount={unreadCount}
              isActive={activeWidget === "notifications"}
              onClick={() => toggleWidget("notifications")}
            />
            <BadgeIcon
              badgeCount={userBadges?.length || 0}
              isActive={activeWidget === "badges"}
              onClick={() => toggleWidget("badges")}
            />
            {/* Add more icon widgets here in the future */}
          </div>
        </CardContent>
      </Card>

      {/* Expandable Content */}
      {activeWidget === "notifications" && (
        <Notifications
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
          onClearAll={handleClearAll}
        />
      )}
      {activeWidget === "badges" && (
        <BadgePreview />
      )}
    </>
  )
}
