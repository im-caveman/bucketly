"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WidgetData } from "@/types/dashboard";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { fetchUserBucketLists } from "@/lib/bucket-list-service";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target, Lightbulb, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WidgetProps {
  widgetData: WidgetData;
}

const QUOTES = [
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Dream big and dare to fail.",
  "It always seems impossible until it's done.",
  "Your time is limited, don't waste it living someone else's life.",
];

export default function Widget({ widgetData }: WidgetProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"time" | "focus" | "insight">("time");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [focusItem, setFocusItem] = useState<{ title: string; listName: string } | null>(null);
  const [quote, setQuote] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set initial quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Determine greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function loadFocusItem() {
      if (!user?.id) return;
      fetchUserBucketLists(user.id).then((lists) => {
        // Find the first uncompleted item across all lists
        let found = false;
        for (const list of lists) {
          const uncompleted = list.bucket_items?.find((item) => !item.completed);
          if (uncompleted) {
            setFocusItem({ title: uncompleted.title, listName: list.name });
            found = true;
            break;
          }
        }
        if (!found) setFocusItem(null);
      }).catch((error) => {
        console.error("Failed to load focus item", error);
      });
    }

    loadFocusItem();

    // Listen for updates
    const handleUpdate = () => loadFocusItem();
    window.addEventListener('bucketly:item-update', handleUpdate);

    return () => {
      window.removeEventListener('bucketly:item-update', handleUpdate);
    };
  }, [user?.id]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const restOfDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dayOfWeek, restOfDate };
  };

  const dateInfo = formatDate(currentTime);

  const tabs = [
    { id: "time", icon: Clock, label: "Time" },
    { id: "focus", icon: Target, label: "Focus" },
    { id: "insight", icon: Lightbulb, label: "Insight" },
  ] as const;

  const nextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex].id);
  };

  const prevTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevIndex].id);
  };

  return (
    <Card className="w-full aspect-[2] relative overflow-hidden group">
      <CardContent className="bg-accent/30 flex-1 flex flex-col justify-between p-6 h-full relative z-20">

        {/* Header: Greeting & Navigation */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {greeting}, {user?.user_metadata?.username || "Traveler"}
            </span>
            <span className="text-xs opacity-50 font-mono">
              {dateInfo.dayOfWeek}, {dateInfo.restOfDate}
            </span>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-1.5 rounded-full transition-colors ${activeTab === tab.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"
                  }`}
              >
                <tab.icon className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center py-2">
          <AnimatePresence mode="wait">
            {activeTab === "time" && (
              <motion.div
                key="time"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center w-full"
              >
                <div className="text-5xl font-display tracking-tight" suppressHydrationWarning>
                  {formatTime(currentTime)}
                </div>
                <span>{widgetData.temperature}</span>
              </motion.div>
            )}

            {activeTab === "focus" && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center w-full px-4"
              >
                {focusItem ? (
                  <>
                    <div className="text-xs uppercase tracking-widest text-primary mb-2">Next Mission</div>
                    <div className="text-xl font-bold leading-tight line-clamp-2 mb-1">
                      {focusItem.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      in {focusItem.listName}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active missions.</p>
                    <p className="text-xs">Add items to your bucket list!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "insight" && (
              <motion.div
                key="insight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center w-full px-4"
              >
                <div className="text-xs uppercase tracking-widest text-primary mb-2">Daily Insight</div>
                <blockquote className="text-lg font-medium italic leading-snug">
                  &quot;{quote}&quot;
                </blockquote>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Background Elements */}
        <div className="absolute inset-0 -z-[1] pointer-events-none">
          <Image
            src="/assets/pc_blueprint.gif"
            alt="background"
            width={250}
            height={250}
            className="size-full object-contain opacity-20 mix-blend-screen"
          />
        </div>

        {/* Hover Navigation Arrows */}
        <button
          onClick={prevTab}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextTab}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </CardContent>
    </Card>
  );
}
