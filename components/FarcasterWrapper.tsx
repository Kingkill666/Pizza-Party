'use client'

import { useEffect, useState } from 'react'
import { farcasterApp } from '@/lib/farcaster-miniapp'

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sdkAvailable, setSdkAvailable] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster environment
        const isFarcasterEnv = farcasterApp.isFarcasterEnvironment()
        setIsFarcaster(isFarcasterEnv)

        // Check if SDK is available
        const sdkAvailable = await farcasterApp.isSDKAvailable()
        setSdkAvailable(sdkAvailable)

        if (isFarcasterEnv && sdkAvailable) {
          console.log('🍕 Detected Farcaster environment with SDK available')
          
          // Initialize the Farcaster Mini App SDK
          await farcasterApp.initialize()
          setIsInitialized(true)
          
          console.log('✅ Farcaster Mini App initialized successfully')
        } else if (isFarcasterEnv && !sdkAvailable) {
          console.log('⚠️ Farcaster environment detected but SDK not available')
          // Still mark as initialized to show content
          setIsInitialized(true)
        } else {
          // Not in Farcaster environment, mark as initialized
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('❌ Failed to initialize Farcaster Mini App:', error)
        // Mark as initialized to show content even if there's an error
        setIsInitialized(true)
      }
    }

    initializeFarcaster()
  }, [])

  // Call ready() after the app is fully loaded
  useEffect(() => {
    if (isInitialized && isFarcaster && sdkAvailable && !isReady) {
      const callReady = async () => {
        try {
          await farcasterApp.ready()
          setIsReady(true)
          console.log('✅ Farcaster Mini App ready called successfully')
        } catch (error) {
          console.error('❌ Failed to call ready:', error)
          setIsReady(true) // Still mark as ready to show content
        }
      }
      
      callReady()
    } else if (isInitialized && !isFarcaster) {
      // Not in Farcaster environment, mark as ready
      setIsReady(true)
    }
  }, [isInitialized, isFarcaster, sdkAvailable, isReady])

  // Show loading state while initializing in Farcaster
  if (isFarcaster && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Loading Pizza Party</h2>
          <p className="text-gray-600">
            {sdkAvailable ? 'Initializing Farcaster Mini App...' : 'Loading Pizza Party...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 