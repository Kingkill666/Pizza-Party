'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { formatAddress } from '@/lib/wallet-config'

export function WalletStatus() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <ConnectButton 
        chainStatus="icon"
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        ✅ Connected {formatAddress(address || '')}
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
