import { useState, useEffect } from 'react'
import { farcasterApp } from '@/lib/farcaster-miniapp'

interface FarcasterUser {
  fid: number
  address?: string
}

export function useFarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFarcaster, setIsFarcaster] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // Check if we're in Farcaster environment
        const isFarcasterEnv = farcasterApp.isFarcasterEnvironment()
        setIsFarcaster(isFarcasterEnv)

        if (isFarcasterEnv) {
          console.log('🍕 Initializing Farcaster authentication')
          
          // Initialize the SDK
          await farcasterApp.initialize()
          
          // Get current user
          const currentUser = await farcasterApp.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            console.log('✅ Farcaster user authenticated:', currentUser.fid)
          }
        }
      } catch (error) {
        console.error('❌ Farcaster auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async () => {
    try {
      const token = await farcasterApp.getAuthToken()
      if (token) {
        const user = await farcasterApp.getCurrentUser()
        setUser(user)
        return user
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
    }
    return null
  }

  const signOut = () => {
    setUser(null)
  }

  const makeAuthenticatedRequest = async (url: string, options?: RequestInit) => {
    try {
      return await farcasterApp.makeAuthenticatedRequest(url, options)
    } catch (error) {
      console.error('❌ Authenticated request error:', error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    isFarcaster,
    signIn,
    signOut,
    makeAuthenticatedRequest,
    isAuthenticated: !!user
  }
} 