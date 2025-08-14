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
              console.log('🔍 Layout: Starting comprehensive Farcaster Mini App initialization...');
              
              // Function to call ready() with multiple fallbacks
              function callReady() {
                console.log('🎯 Attempting to call ready()...');
                
                // Method 1: Try window.farcaster.sdk
                if (window.farcaster && window.farcaster.sdk && window.farcaster.sdk.actions && window.farcaster.sdk.actions.ready) {
                  console.log('✅ Method 1: Found window.farcaster.sdk.actions.ready');
                  try {
                    window.farcaster.sdk.actions.ready();
                    console.log('✅ Method 1: Successfully called ready()');
                    return true;
                  } catch (error) {
                    console.error('❌ Method 1: Error calling ready():', error);
                  }
                }
                
                // Method 2: Try global sdk
                if (typeof sdk !== 'undefined' && sdk && sdk.actions && sdk.actions.ready) {
                  console.log('✅ Method 2: Found global sdk.actions.ready');
                  try {
                    sdk.actions.ready();
                    console.log('✅ Method 2: Successfully called ready()');
                    return true;
                  } catch (error) {
                    console.error('❌ Method 2: Error calling ready():', error);
                  }
                }
                
                // Method 3: Try window.sdk
                if (window.sdk && window.sdk.actions && window.sdk.actions.ready) {
                  console.log('✅ Method 3: Found window.sdk.actions.ready');
                  try {
                    window.sdk.actions.ready();
                    console.log('✅ Method 3: Successfully called ready()');
                    return true;
                  } catch (error) {
                    console.error('❌ Method 3: Error calling ready():', error);
                  }
                }
                
                console.log('❌ All methods failed to call ready()');
                return false;
              }
              
              // Wait for DOM content to load
              document.addEventListener('DOMContentLoaded', async function() {
                console.log('📄 DOM Content Loaded, checking environment...');
                
                // Log all available global objects
                console.log('🔍 Available global objects:', {
                  'window.farcaster': !!window.farcaster,
                  'window.sdk': !!window.sdk,
                  'global sdk': typeof sdk !== 'undefined',
                  'window.location.href': window.location.href,
                  'window.frameElement': !!window.frameElement
                });
                
                // Check if we're in Farcaster environment (be more permissive)
                const isFarcaster = window.location.href.includes('farcaster') || 
                                   window.location.href.includes('warpcast') || 
                                   window.location.href.includes('miniapp') ||
                                   window.location.href.includes('ngrok') ||
                                   window.frameElement ||
                                   window.location.href.includes('preview');
                
                console.log('🌍 Environment check:', isFarcaster ? 'Farcaster' : 'Regular web');
                console.log('📍 URL:', window.location.href);
                console.log('🔍 Frame element:', window.frameElement ? 'Exists' : 'None');
                
                if (isFarcaster) {
                  console.log('🎯 In Farcaster environment, attempting SDK initialization...');
                  
                  // Try immediate call
                  if (callReady()) {
                    console.log('✅ Immediate ready() call successful');
                    return;
                  }
                  
                  // Try with a small delay
                  setTimeout(() => {
                    console.log('⏰ Trying ready() call with delay...');
                    if (callReady()) {
                      console.log('✅ Delayed ready() call successful');
                      return;
                    }
                    
                    // Try with dynamic import as last resort
                    console.log('🔄 Trying dynamic import as fallback...');
                    import('@farcaster/miniapp-sdk').then(({ sdk }) => {
                      console.log('✅ Successfully imported @farcaster/miniapp-sdk');
                      if (sdk && sdk.actions && sdk.actions.ready) {
                        console.log('✅ Found imported sdk.actions.ready');
                        try {
                          sdk.actions.ready();
                          console.log('✅ Dynamic import ready() call successful');
                        } catch (error) {
                          console.error('❌ Dynamic import ready() call failed:', error);
                        }
                      }
                    }).catch(error => {
                      console.error('❌ Dynamic import failed:', error);
                    });
                  }, 100);
                } else {
                  console.log('ℹ️ Not in Farcaster environment, skipping SDK initialization');
                }
              });
              
              // Also try immediately if DOM is already loaded
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                console.log('🚀 DOM already loaded, trying immediate initialization...');
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
