"use client"

import type React from "react"
import { useEffect } from "react"
import { sdk } from "@farcaster/frame-sdk"

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp()
        console.log("🍕 Environment:", isMiniApp ? "Farcaster Mini App" : "Regular Web")

        if (isMiniApp) {
          console.log("🎯 Calling sdk.actions.ready() immediately...")
          // Call ready() immediately when interface is ready, as per Farcaster docs
          await sdk.actions.ready()
          console.log("✅ Farcaster Mini App ready - splash screen should be hidden")
        } else {
          console.log("🌐 Running in regular web environment")
        }
      } catch (error) {
        console.error("❌ Farcaster initialization error:", error)
      }
    }

    // Call ready as soon as possible, following Farcaster docs
    initializeFarcaster()
  }, [])

  // Render children immediately - no loading state
  return <>{children}</>
} 