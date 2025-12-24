"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

interface NotificationsProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function Notifications({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete,
  onClearAll,
}: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-full">
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
            onClick={onClearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <ScrollArea className="w-full h-auto [&>[data-slot=scroll-area-viewport]]:max-h-[300px] [&>[data-slot=scroll-area-viewport]]:h-auto">
          <div className="space-y-2 p-1">
            <AnimatePresence initial={false} mode="popLayout">
              {notifications.map((notification) => (
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
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
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
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
