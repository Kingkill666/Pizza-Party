"use client"
// DEPLOYMENT MARKER: Enhanced SSR Protection - Commit 5ff1c13

import { useState, useEffect } from 'react'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'

interface WagmiProviderProps {
  children: React.ReactNode
}

export const WagmiProvider = ({ children }: WagmiProviderProps) => {
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  useEffect(() => {
    // Only set client-side after hydration
    try {
      setIsClient(true)
    } catch (error) {
      console.error('WagmiProvider client-side initialization error:', error)
      setHasError(true)
    }
  }, [])

  // Error boundary for WagmiProvider
  if (hasError) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">🍕 Pizza Party 🍕</h1>
          <p className="text-gray-600 mb-4">Wallet connection error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // SSR SAFETY: Don't render anything until client-side to prevent SSR issues
  if (!isClient) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  // SSR SAFETY: Only render Wagmi components after client-side hydration
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          {children}
        </WagmiConfig>
      </QueryClientProvider>
    )
  } catch (error) {
    console.error('WagmiProvider rendering error:', error)
    setHasError(true)
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">🍕 Pizza Party 🍕</h1>
          <p className="text-gray-600 mb-4">Wallet configuration error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    )
  }
} 