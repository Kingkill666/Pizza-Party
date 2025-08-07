import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FarcasterWrapper } from "@/components/FarcasterWrapper"
import { WagmiProvider } from "@/components/WagmiProvider"

// 🚨 URGENT DEPLOYMENT MARKER: Force Vercel to use commit ae22e86 - ALL SSR FIXES INCLUDED
// This commit includes: Debug page SSR protection, Admin page SSR protection, Game page SSR protection
// WagmiProvider SSR protection, QueryClient protection, indexedDB protection
// CACHE BUSTING: Force fresh deployment with all error handling fixes

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pizza Party dApp",
  description: "Play to win a slice of the pie!",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/star-favicon.png",
    apple: "/images/star-favicon.png",
  },
  generator: 'v0.dev',
  // Cache busting
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
    // Farcaster Frame metadata
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://pizzaparty.app/images/pizza-transparent.png',
    'fc:frame:button:1': 'Play Daily Game',
    'fc:frame:button:2': 'View Jackpot',
    'fc:frame:button:3': 'Connect Wallet',
    'fc:frame:button:4': 'Share Pizza Party',
    'fc:frame:post_url': 'https://pizzaparty.app/api/frame',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
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
        <WagmiProvider>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </WagmiProvider>
      </body>
    </html>
  )
}
