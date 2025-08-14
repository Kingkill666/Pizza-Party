'use client'

import { useEffect, useState } from 'react'
import { farcasterApp } from '@/lib/farcaster-miniapp'

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export function FarcasterWrapper({ children }: FarcasterWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        console.log('🍕 FarcasterWrapper: Starting initialization...')
        
        // Initialize the Farcaster Mini App
        await farcasterApp.initialize()
        
        // Check if we're in a Farcaster environment
        const isFarcasterEnv = farcasterApp.isFarcasterEnvironment()
        console.log('🌍 FarcasterWrapper: Environment check:', isFarcasterEnv ? 'Farcaster' : 'Regular web')
        
        // Always call ready() to hide splash screen
        console.log('🎯 FarcasterWrapper: Calling ready()...')
        await farcasterApp.ready()
        console.log('✅ FarcasterWrapper: ready() called successfully')
        
        setIsInitialized(true)
      } catch (error) {
        console.error('❌ FarcasterWrapper: Initialization failed:', error)
        // Still mark as initialized to show content
        setIsInitialized(true)
      }
    }

    // Only run in client-side
    if (typeof window !== 'undefined') {
      initializeFarcaster()
    } else {
      // In SSR, mark as initialized immediately
      setIsInitialized(true)
    }
  }, [])

  // Show loading state while initializing in Farcaster
  if (!isInitialized) {
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