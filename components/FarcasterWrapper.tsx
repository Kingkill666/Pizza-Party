"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { sdk } from "@farcaster/frame-sdk"

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false)

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

        setIsInitialized(true)
      } catch (error) {
        console.error("❌ Farcaster initialization error:", error)
        setIsInitialized(true)
      }
    }

    // Call ready as soon as possible, following Farcaster docs
    initializeFarcaster()
  }, [])

  // Show loading state only briefly while we call ready()
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Loading Pizza Party</h2>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 