import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { V0Provider } from "@/lib/v0-context"
import localFont from "next/font/local"
import { SidebarProvider } from "@/components/ui/sidebar"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { SWRConfigProvider } from "@/contexts/swr-config-provider"
import { LayoutContent } from "../components/layout-content"

const mockData = mockDataJson as MockData

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: "%s – Bucketly",
    default: "Bucketly - Turn Dreams Into Achievements",
  },
  description: "Track your bucket list, compete with friends, and celebrate every milestone in the ultimate gamified goal-tracking experience. Join thousands turning dreams into reality.",
  generator: 'v0.app',
  keywords: ['bucket list', 'goal tracking', 'gamification', 'achievements', 'progress tracking', 'social goals', 'life goals', 'bucket list app'],
  authors: [{ name: 'Bucketly' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bucketly.app',
    siteName: 'Bucketly',
    title: 'Bucketly - Turn Dreams Into Achievements',
    description: 'Track your bucket list, compete with friends, and celebrate every milestone in the ultimate gamified goal-tracking experience.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Bucketly - Gamified Bucket List Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bucketly - Turn Dreams Into Achievements',
    description: 'Track your bucket list, compete with friends, and celebrate every milestone in the ultimate gamified goal-tracking experience.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Rebels-Fett.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <SWRConfigProvider>
            <V0Provider isV0={isV0}>
              <SidebarProvider>
                <LayoutContent mockData={mockData}>
                  {children}
                </LayoutContent>
                <Toaster />
              </SidebarProvider>
            </V0Provider>
          </SWRConfigProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
