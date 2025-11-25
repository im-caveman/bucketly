"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import HomeIcon from "@/components/icons/home"
import CompassIcon from "@/components/icons/compass"
import TrophyIcon from "@/components/icons/trophy"
import TimelineIcon from "@/components/icons/timeline"
import HeartIcon from "@/components/icons/heart"
import PlusCircleIcon from "@/components/icons/plus-circle"
import GearIcon from "@/components/icons/gear"
import ShieldIcon from "@/components/icons/shield"
import MonkeyIcon from "@/components/icons/monkey"
import DotsVerticalIcon from "@/components/icons/dots-vertical"
import { Bullet } from "@/components/ui/bullet"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { fetchUserProfile, subscribeToProfileUpdates, type UserProfile } from "@/lib/bucket-list-service"
import { useUserProfile } from "@/hooks/use-profile"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { UserHoverCard } from "@/components/profile/user-hover-card"

const data = {
  navMain: [
    {
      title: "Main",
      items: [
        {
          title: "Home",
          url: "/",
          icon: HomeIcon,
        },
        {
          title: "Explore",
          url: "/explore",
          icon: CompassIcon,
        },
        {
          title: "Timeline",
          url: "/timeline",
          icon: TimelineIcon,
        },
        {
          title: "Leaderboard",
          url: "/leaderboard",
          icon: TrophyIcon,
        },
        {
          title: "Memories",
          url: "/memories",
          icon: HeartIcon,
        },
        {
          title: "Create List",
          url: "/create",
          icon: PlusCircleIcon,
        },
      ],
    },
  ],
  user: {
    name: "KRIMSON",
    email: "krimson@joyco.studio",
    avatar: "/avatars/user_krimson.png",
  },
}

import LogOutIcon from "@/components/icons/log-out"

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const { profile: userProfile, mutate } = useUserProfile(user?.id)

  useEffect(() => {
    if (!userProfile?.id) return

    const channel = subscribeToProfileUpdates(userProfile.id, () => {
      mutate()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [userProfile?.id, mutate])

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 hover:bg-sidebar-primary transition-colors text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">Bucketly</span>
          <span className="text-xs uppercase">Your Life List</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {/* Admin Panel - only show for admin users */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                      <Link href="/admin">
                        <ShieldIcon className="size-5" />
                        <span>Admin Panel</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-2">
            <div className="flex items-center">
              <Bullet className="mr-2" />
              User
            </div>
            <button
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOutIcon className="size-4" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full cursor-pointer">
                    <UserHoverCard user={userProfile || { username: user?.email?.split('@')[0] || 'User', avatar_url: user?.user_metadata?.avatar_url }}>
                      <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                        <Avatar className="h-full w-full rounded-lg">
                          <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.username} className="object-cover rounded-lg" />
                          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-lg rounded-lg">
                            {userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </UserHoverCard>
                    <div className="pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded data-[state=open]:bg-sidebar-accent-active data-[state=open]:hover:bg-sidebar-accent-active data-[state=open]:text-sidebar-accent-foreground">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xl font-display">{userProfile?.username || 'Loading...'}</span>
                      </div>
                      <DotsVerticalIcon className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="end" sideOffset={4}>
                    <div className="flex flex-col">
                      <Link href="/account" className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <MonkeyIcon className="mr-2 h-4 w-4" />
                        Account
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <GearIcon className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
