import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FarcasterWrapper } from "@/components/FarcasterWrapper"
import { WagmiProvider } from "@/components/WagmiProvider"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pizza Party - Daily Games, Weekly Jackpots",
  description: "Play daily Pizza Party games to earn toppings and win weekly VMF jackpots!",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/pizza-party-title-transparent.png",
    apple: "/images/pizza-party-title-transparent.png",
  },
  generator: "v0.dev",
  openGraph: {
    title: "Pizza Party - Daily Games, Weekly Jackpots",
    description: "Play daily Pizza Party games to earn toppings and win weekly VMF jackpots!",
    images: ["/images/pizza-homepage.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pizza Party - Daily Games, Weekly Jackpots",
    description: "Play daily Pizza Party games to earn toppings and win weekly VMF jackpots!",
    images: ["/images/pizza-homepage.png"],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "/images/pizza-homepage.png",
      button: {
        title: "🍕 Play Pizza Party",
        action: {
          type: "launch_frame",
          name: "Pizza Party",
          url: "/",
          splashImageUrl: "/images/pizza-party-title-transparent.png",
          splashBackgroundColor: "#FF6B35",
        },
      },
    }),
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <WagmiProvider>
            <FarcasterWrapper>{children}</FarcasterWrapper>
          </WagmiProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
