"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { AnimatePresence, motion, PanInfo } from "motion/react";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsV0 } from "@/lib/v0-context";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchUserNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/notification-service";

interface MobileNotificationsProps {
  initialNotifications?: Notification[];
}

interface SwipeableWrapperProps {
  children: React.ReactNode;
  onDelete: () => void;
}

function SwipeableWrapper({ children, onDelete }: SwipeableWrapperProps) {
  const handleDragEnd = (event: Event, info: PanInfo) => {
    // Delete if swiped left more than 120px OR with sufficient velocity
    const shouldDelete =
      info.offset.x < -120 || (info.offset.x < -50 && info.velocity.x < -500);

    if (shouldDelete) {
      // Immediate deletion - let parent handle exit animation
      onDelete();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 0 }}
      dragSnapToOrigin
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 0.98,
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      }}
      className="relative cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }} // Allow vertical scrolling, horizontal dragging
    >
      {children}
    </motion.div>
  );
}

export default function MobileNotifications({
  initialNotifications = [],
}: MobileNotificationsProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const isV0 = useIsV0();

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
        const exists = prev.some((n) => n.id === newNotification.id);
        if (exists) {
          return prev.map((n) =>
            n.id === newNotification.id ? newNotification : n
          );
        }
        return [newNotification, ...prev];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );

    try {
      await markNotificationAsRead(id, user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
      );
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!user?.id) return;

    setNotifications((prev) => prev.filter((notif) => notif.id !== id));

    try {
      await deleteNotification(id, user.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      const fetchedNotifications = await fetchUserNotifications(user.id);
      setNotifications(fetchedNotifications);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Accessibility Title */}
      <SheetHeader className="sr-only">
        <SheetTitle>Notifications</SheetTitle>
      </SheetHeader>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          <h2 className="text-sm font-medium uppercase">Notifications</h2>
        </div>
        <SheetClose>
          <Badge
            variant="secondary"
            className="uppercase text-muted-foreground"
          >
            Close
          </Badge>
        </SheetClose>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto overflow-x-clip p-2 space-y-2 bg-muted">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-foreground/80 font-medium">No notifications</p>
          </div>
        ) : (
          <AnimatePresence mode={isV0 ? "wait" : "popLayout"}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: -300 }}
                transition={{
                  layout: { duration: 0.3, ease: "easeOut" },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                  x: { duration: 0.2 },
                }}
              >
                <SwipeableWrapper
                  onDelete={() => handleDeleteNotification(notification.id)}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDeleteNotification}
                  />
                </SwipeableWrapper>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Swipe Hint */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Swipe left to delete notifications
          </p>
        </div>
      )}
    </div>
  );
}
