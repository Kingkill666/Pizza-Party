'use client'

import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatAddress } from '@/lib/wallet-config'
import { useFarcasterWallet } from './FarcasterWalletProvider'

export default function WalletConnector() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMobile, setIsMobile] = useState(false)
  
  // Farcaster wallet integration
  const { 
    fid, 
    username, 
    avatar, 
    wallet: farcasterWallet, 
    connected: farcasterConnected, 
    loading: farcasterLoading, 
    error: farcasterError,
    isFarcasterEnvironment 
  } = useFarcasterWallet()

  // Detect mobile devices
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent))
  }, [])

  // Use Farcaster wallet if available, otherwise fallback to regular wallet
  const activeWallet = farcasterConnected && farcasterWallet 
    ? { address: farcasterWallet, isConnected: true }
    : { address, isConnected }

  if (!activeWallet.isConnected) {
    return (
      <div className="wallet-connector">
              <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium" data-testid="wallet-status">
        {isFarcasterEnvironment && farcasterLoading ? 'Loading Farcaster wallet...' : '🔗 Wallet Connection Required'}
      </div>
        {(error || farcasterError) && (
          <p className="error-message">
            {error?.message || farcasterError || 'Failed to connect wallet. Please try again.'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium" data-testid="wallet-status">
        {farcasterConnected ? (
          `✅ Connected via Farcaster (FID: ${fid}) ${formatAddress(farcasterWallet || '')}`
        ) : (
          `✅ Connected ${formatAddress(address || '')}`
        )}
      </div>
      <button
        onClick={() => disconnect()}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
} 