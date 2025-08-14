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
              console.log('🔍 Layout: Starting proper Farcaster Mini App initialization...');
              
              // Wait for DOM content to load before initializing
              document.addEventListener('DOMContentLoaded', async function() {
                console.log('📄 DOM Content Loaded, checking environment...');
                
                // Proper environment detection
                const isFarcaster = window.location.search.includes('farcaster=true') ||
                                   window.frameElement?.parentElement?.host?.includes('farcaster.xyz') ||
                                   window.location.href.includes('farcaster') ||
                                   window.location.href.includes('warpcast') ||
                                   window.location.href.includes('miniapp');
                
                console.log('🌍 Environment check:', isFarcaster ? 'Farcaster' : 'Regular web');
                console.log('📍 URL:', window.location.href);
                console.log('🔍 Frame element:', window.frameElement ? 'Exists' : 'None');
                console.log('🏠 Parent host:', window.frameElement?.parentElement?.host || 'N/A');
                
                if (isFarcaster) {
                  console.log('🎯 In Farcaster environment, initializing SDK...');
                  
                  try {
                    // Try to access the SDK directly first
                    if (window.farcaster && window.farcaster.sdk && window.farcaster.sdk.actions) {
                      console.log('✅ Found Farcaster SDK in window object');
                      
                      // Wait for UI to be ready, then call ready()
                      requestAnimationFrame(() => {
                        try {
                          window.farcaster.sdk.actions.ready();
                          console.log('✅ Called ready() via window.farcaster.sdk.actions.ready()');
                        } catch (error) {
                          console.error('❌ Error calling ready() via window:', error);
                        }
                      });
                    } else {
                      console.log('⚠️ Farcaster SDK not found in window object, trying dynamic import...');
                      
                      // Try dynamic import as fallback
                      try {
                        const { sdk } = await import('@farcaster/miniapp-sdk');
                        console.log('✅ Successfully imported @farcaster/miniapp-sdk');
                        
                        if (sdk && sdk.actions && sdk.actions.ready) {
                          console.log('✅ Found imported sdk.actions.ready');
                          
                          // Wait for UI to be ready, then call ready()
                          requestAnimationFrame(() => {
                            try {
                              sdk.actions.ready();
                              console.log('✅ Called ready() via imported sdk.actions.ready()');
                            } catch (error) {
                              console.error('❌ Error calling ready() via imported sdk:', error);
                            }
                          });
                        } else {
                          console.log('❌ Imported sdk.actions.ready not found');
                        }
                      } catch (error) {
                        console.error('❌ Failed to import @farcaster/miniapp-sdk:', error);
                      }
                    }
                  } catch (error) {
                    console.error('❌ Error in Farcaster initialization:', error);
                  }
                } else {
                  console.log('ℹ️ Not in Farcaster environment, skipping SDK initialization');
                }
              });
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
