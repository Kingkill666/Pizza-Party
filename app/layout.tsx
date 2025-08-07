import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FarcasterWrapper } from "@/components/FarcasterWrapper"
import { WagmiProvider } from "@/components/WagmiProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pizza Party dApp",
  description: "Play to win a slice of the pie!",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/star-favicon.png",
    apple: "/images/star-favicon.png",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  generator: 'v0.dev',
  // Farcaster Frame metadata
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://pizzaparty.app/images/pizza-transparent.png',
    'fc:frame:button:1': 'Play Daily Game',
    'fc:frame:button:2': 'View Jackpot',
    'fc:frame:button:3': 'Connect Wallet',
    'fc:frame:button:4': 'Share Pizza Party',
    'fc:frame:post_url': 'https://pizzaparty.app/api/frame',
  },
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
