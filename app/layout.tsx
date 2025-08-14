import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FarcasterWrapper } from "@/components/FarcasterWrapper"
import { WagmiProvider } from "@/components/WagmiProvider"
import { Analytics } from "@vercel/analytics/next"

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
    // Farcaster Mini App embed metadata
    'fc:miniapp': '{"version":"1","imageUrl":"https://pizza-party.vmfcoin.com/images/pizza-transparent.png","button":{"title":"Pizza Party","action":{"type":"launch_frame","name":"Pizza Party","url":"https://pizza-party.vmfcoin.com","splashImageUrl":"https://pizza-party.vmfcoin.com/images/pizza-transparent.png","splashBackgroundColor":"#FF6B35"}}}',
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔍 Layout: Farcaster Mini App initialization starting...');
              
              // Simple ready() call as backup
              function callReady() {
                try {
                  if (window.farcaster && window.farcaster.sdk && window.farcaster.sdk.actions && window.farcaster.sdk.actions.ready) {
                    window.farcaster.sdk.actions.ready();
                    console.log('✅ Layout: Called ready() via window.farcaster.sdk.actions.ready()');
                    return true;
                  }
                  return false;
                } catch (error) {
                  console.error('❌ Layout: Error calling ready():', error);
                  return false;
                }
              }
              
              // Try to call ready() when DOM is loaded
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callReady);
              } else {
                callReady();
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <WagmiProvider>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </WagmiProvider>
        <Analytics />
      </body>
    </html>
  )
}
