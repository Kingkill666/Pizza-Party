"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWagmiWallet } from '@/hooks/useWagmiWallet'
import { isMobile, isInWalletBrowser } from '@/lib/wagmi-config'

interface WagmiWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect?: (address: string) => void
}

export const WagmiWalletModal = ({ isOpen, onClose, onConnect }: WagmiWalletModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  
  const {
    connectors,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
    setError,
    isMobile: isMobileDevice,
    isInWalletBrowser: inWalletBrowser,
  } = useWagmiWallet()

  // Auto-close on successful connection
  useEffect(() => {
    if (isOpen && !isConnecting && !error) {
      onClose()
    }
  }, [isOpen, isConnecting, error, onClose])

  const handleConnect = async (connectorId: string) => {
    setIsProcessing(true)
    setSelectedConnector(connectorId)
    setError(null)

    try {
      const result = await connectWallet(connectorId)
      if (result?.address && onConnect) {
        onConnect(result.address)
      }
    } catch (error: any) {
      console.error('Connection failed:', error)
      setError(error.message)
    } finally {
      setIsProcessing(false)
      setSelectedConnector(null)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    onClose()
  }

  const getConnectorDisplayName = (connectorId: string) => {
    const names: Record<string, string> = {
      metaMask: 'MetaMask',
      coinbaseWallet: 'Coinbase Wallet',
      walletConnect: 'WalletConnect',
      injected: 'Browser Wallet',
    }
    return names[connectorId] || connectorId
  }

  const getConnectorIcon = (connectorId: string) => {
    const icons: Record<string, string> = {
      metaMask: '🦊',
      coinbaseWallet: '🪙',
      walletConnect: '🔗',
      injected: '💉',
    }
    return icons[connectorId] || '🔗'
  }

  const getConnectorColor = (connectorId: string) => {
    const colors: Record<string, string> = {
      metaMask: 'bg-orange-500 hover:bg-orange-600',
      coinbaseWallet: 'bg-blue-500 hover:bg-blue-600',
      walletConnect: 'bg-blue-600 hover:bg-blue-700',
      injected: 'bg-gray-500 hover:bg-gray-600',
    }
    return colors[connectorId] || 'bg-gray-500 hover:bg-gray-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🍕 Connect Your Wallet 🍕
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mobile Tips */}
          {isMobileDevice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📱 Mobile Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure your wallet app is installed</li>
                <li>• Try opening this site in your wallet's browser</li>
                <li>• Use WalletConnect for better mobile support</li>
              </ul>
            </div>
          )}

          {/* Available Connectors */}
          <div className="space-y-3">
            {connectors
              .filter(connector => connector.ready)
              .map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  disabled={isProcessing && selectedConnector === connector.id}
                  className={`w-full h-14 text-lg font-semibold ${getConnectorColor(connector.id)} transition-all duration-200 transform hover:scale-105 active:scale-95`}
                >
                  <span className="mr-3 text-xl">{getConnectorIcon(connector.id)}</span>
                  {isProcessing && selectedConnector === connector.id ? (
                    'Connecting...'
                  ) : (
                    getConnectorDisplayName(connector.id)
                  )}
                </Button>
              ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">❌ {error}</p>
              {error.includes('network') && (
                <p className="text-red-700 text-xs mt-2">
                  Make sure you're connected to Base Sepolia network
                </p>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">🔒 Security Notice</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Only connect to trusted dApps</li>
              <li>• Never share your private keys</li>
              <li>• Review transaction details before signing</li>
              <li>• Disconnect when you're done</li>
            </ul>
          </div>

          {/* Mobile Wallet Instructions */}
          {isMobileDevice && !inWalletBrowser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">📱 Mobile Wallet Instructions</h3>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Open your wallet app</li>
                <li>2. Go to the browser/dApp section</li>
                <li>3. Enter this website URL</li>
                <li>4. Try connecting again</li>
              </ol>
            </div>
          )}

          {/* Disconnect Button */}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
          >
            🔌 Disconnect Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 