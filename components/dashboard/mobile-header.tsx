"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import MonkeyIcon from "@/components/icons/monkey"
import HomeIcon from "@/components/icons/home"
import CompassIcon from "@/components/icons/compass"
import TrophyIcon from "@/components/icons/trophy"
import TimelineIcon from "@/components/icons/timeline"
import HeartIcon from "@/components/icons/heart"
import PlusCircleIcon from "@/components/icons/plus-circle"
import GearIcon from "@/components/icons/gear"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Explore", url: "/explore", icon: CompassIcon },
  { title: "Timeline", url: "/timeline", icon: TimelineIcon },
  { title: "Leaderboard", url: "/leaderboard", icon: TrophyIcon },
  { title: "Memories", url: "/memories", icon: HeartIcon },
  { title: "Create List", url: "/create", icon: PlusCircleIcon },
]

const userData = {
  name: "KRIMSON",
  email: "krimson@joyco.studio",
  avatar: "/avatars/user_krimson.png",
}

export function MobileHeader({ mockData }: { mockData: any }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="container flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex gap-3 p-6 border-b">
                <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <MonkeyIcon className="size-10" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-2xl font-display">Bucketly</span>
                  <span className="text-xs uppercase opacity-70">Your Life List</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.url
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* User Section */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-12 rounded-lg overflow-hidden bg-primary/10">
                    <Image
                      src={userData.avatar || "/placeholder.svg"}
                      alt={userData.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-display">{userData.name}</p>
                    <p className="text-xs opacity-70">{userData.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <MonkeyIcon className="size-4" />
                    <span>Account</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <GearIcon className="size-4" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <MonkeyIcon className="size-8" />
          <span className="text-xl font-display">Bucketly</span>
        </div>
      </div>
    </header>
  )
}
