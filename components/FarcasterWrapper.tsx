'use client'

import { useEffect, useState } from 'react'
import { farcasterApp } from '@/lib/farcaster-miniapp'

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster environment
        const isFarcasterEnv = farcasterApp.isFarcasterEnvironment()
        setIsFarcaster(isFarcasterEnv)

        if (isFarcasterEnv) {
          console.log('🍕 Detected Farcaster environment')
          
          // Initialize the Farcaster Mini App SDK
          await farcasterApp.initialize()
          setIsInitialized(true)
          
          console.log('✅ Farcaster Mini App initialized successfully')
        }
      } catch (error) {
        console.error('❌ Failed to initialize Farcaster Mini App:', error)
      }
    }

    initializeFarcaster()
  }, [])

  // Show loading state while initializing in Farcaster
  if (isFarcaster && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Loading Pizza Party</h2>
          <p className="text-gray-600">Initializing Farcaster Mini App...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 