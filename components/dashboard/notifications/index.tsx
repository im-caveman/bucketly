"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchUserNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/notification-service";

interface NotificationsProps {
  initialNotifications?: Notification[];
}

export default function Notifications({
  initialNotifications = [],
}: NotificationsProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    async function loadNotifications() {
      try {
        const fetchedNotifications = await fetchUserNotifications(user.id);
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to initial notifications if fetch fails
        setNotifications(initialNotifications);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [user?.id]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some((n) => n.id === newNotification.id);
        if (exists) {
          // Update existing notification
          return prev.map((n) =>
            n.id === newNotification.id ? newNotification : n
          );
        }
        // Add new notification at the beginning
        return [newNotification, ...prev];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );

    try {
      await markNotificationAsRead(id, user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
      );
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!user?.id) return;

    // Optimistically update UI
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));

    try {
      await deleteNotification(id, user.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Reload notifications on error
      const fetchedNotifications = await fetchUserNotifications(user.id);
      setNotifications(fetchedNotifications);
    }
  };

  const clearAll = async () => {
    if (!user?.id) return;

    // Optimistically clear UI
    setNotifications([]);

    try {
      await deleteAllNotifications(user.id);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Reload notifications on error
      const fetchedNotifications = await fetchUserNotifications(user.id);
      setNotifications(fetchedNotifications);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          Notifications
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {displayedNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={notification.id}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDeleteNotification}
                />
              </motion.div>
            ))}

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-foreground/60">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-foreground/80 font-medium">
                  No notifications
                </p>
              </div>
            ) : null}

            {notifications.length > 3 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? "Show Less" : `Show All (${notifications.length})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
