"use client"

import { usePathname } from "next/navigation"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import Widget from "@/components/dashboard/widget"
import { IconWidgets } from "@/components/dashboard/icon-widgets"
import Newsletter from "@/components/newsletter"
import type { MockData } from "@/types/dashboard"

interface LayoutContentProps {
  children: React.ReactNode
  mockData: MockData
}

export function LayoutContent({ children, mockData }: LayoutContentProps) {
  const pathname = usePathname()

  // Landing page and auth pages should not have sidebars
  const isLandingPage = pathname === "/"
  const isAuthPage = pathname?.startsWith("/auth")
  const shouldShowSidebars = !isLandingPage && !isAuthPage

  if (!shouldShowSidebars) {
    // Simple layout for landing and auth pages
    return <>{children}</>
  }

  // Full dashboard layout with sidebars
  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader mockData={mockData} />

      {/* Desktop Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
        <div className="hidden lg:block col-span-2 top-0 relative">
          <DashboardSidebar />
        </div>
        <div className="col-span-1 lg:col-span-7 mt-sides h-[calc(100vh-var(--sides))] overflow-y-auto rounded-t-2xl bg-background/50 border-t border-x border-border/50 no-scrollbar">{children}</div>
        <div className="col-span-3 hidden lg:block">
          <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
            <Widget widgetData={mockData.widgetData} />
            <IconWidgets />
            <Newsletter />
          </div>
        </div>
      </div>

    </>
  )
}
