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

type ActiveWidget = "notifications" | null

export function IconWidgets() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeWidget, setActiveWidget] = useState<ActiveWidget>(null)

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
            {/* Add more icon widgets here in the future */}
          </div>
        </CardContent>
      </Card>

      {/* Expandable Content */}
      {activeWidget === "notifications" && (
        <Notifications initialNotifications={notifications} />
      )}
    </>
  )
}
