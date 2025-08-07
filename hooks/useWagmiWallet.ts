"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { config, persistentConnection, refreshTokenManager, isMobile, isInWalletBrowser, switchToBaseSepolia, handleConnectionError } from '@/lib/wagmi-config'
import { baseSepolia } from 'wagmi/chains'

export const useWagmiWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  // Wagmi v2 hooks
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending: isConnectLoading } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Load persistent connection on mount
  useEffect(() => {
    const savedConnection = persistentConnection.load()
    if (savedConnection && !isConnected) {
      console.log('📱 Restoring persistent connection:', savedConnection)
      // Auto-connect logic would go here
    }
  }, [isConnected])

  // Handle network switching
  useEffect(() => {
    if (isConnected && chainId !== baseSepolia.id) {
      console.log('🔄 Switching to Base Sepolia network...')
      switchChain({ chainId: baseSepolia.id })
    }
  }, [isConnected, chainId, switchChain])

  // Enhanced connect function with mobile support
  const connectWallet = useCallback(async (connectorId: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      const targetConnector = connectors.find(c => c.id === connectorId)
      if (!targetConnector) {
        throw new Error('Connector not found')
      }

      console.log(`🎯 Connecting to ${connectorId}...`)
      console.log(`📱 Mobile device: ${isMobile()}`)
      console.log(`🏦 In wallet browser: ${isInWalletBrowser()}`)

      // Connect using Wagmi v2
      await connect({ connector: targetConnector })

      // Switch to Base Sepolia if needed
      if (chainId !== baseSepolia.id) {
        await switchChain({ chainId: baseSepolia.id })
      }

      // Generate session token
      const token = generateSessionToken(address)
      setSessionToken(token)
      if (address) {
        refreshTokenManager.set(address, token)
      }

      // Save persistent connection
      persistentConnection.save({
        address,
        connectorId,
        timestamp: Date.now(),
      })

      console.log(`✅ Successfully connected to ${connectorId}`)
      return { address, connectorId }

    } catch (error: any) {
      console.error(`❌ Failed to connect to ${connectorId}:`, error)
      
      const errorMessage = handleConnectionError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }, [connect, connectors, chainId, address, switchChain])

  // Enhanced disconnect function with cleanup
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Starting enhanced wallet disconnect...')

    // Clear session token
    setSessionToken(null)
    if (address) {
      refreshTokenManager.clear(address)
    }

    // Clear persistent connection
    persistentConnection.clear()

    // Clear all localStorage wallet data
    if (typeof window !== 'undefined') {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('wallet') || key.includes('ethereum') || key.includes('wagmi'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      sessionStorage.clear()
    }

    // Disconnect using Wagmi
    disconnect()

    console.log('✅ Enhanced wallet disconnect completed')
  }, [disconnect, address])

  // Get wallet balance
  const getBalance = useCallback(async (): Promise<string> => {
    if (!address) return '0'

    try {
      // Use wagmi's built-in balance hook or fetch manually
      const balance = await fetch(`https://sepolia.base.org/api?module=account&action=balance&address=${address}`)
        .then(res => res.json())
        .then(data => data.result)
      
      const balanceInEth = Number(balance) / Math.pow(10, 18)
      return balanceInEth.toString()
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }, [address])

  // Refresh session token
  const refreshSession = useCallback(async () => {
    if (!address) return null

    try {
      const newToken = await refreshTokenManager.refresh(address)
      if (newToken) {
        setSessionToken(newToken)
        return newToken
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
    return null
  }, [address])

  // Check if session is valid
  const isSessionValid = useCallback(() => {
    if (!sessionToken || !address) return false
    
    const tokenData = refreshTokenManager.get(address)
    return !!tokenData
  }, [sessionToken, address])

  // Get available connectors
  const getAvailableConnectors = useCallback(() => {
    return connectors.map(connector => ({
      id: connector.id,
      name: connector.name,
      ready: connector.ready,
      icon: getConnectorIcon(connector.id),
      color: getConnectorColor(connector.id),
    }))
  }, [connectors])

  // Helper functions
  const generateSessionToken = (address: string | undefined) => {
    if (!address) return null
    return `session_${address}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    // Connection state
    address,
    isConnected,
    isConnecting: isConnecting || isConnectLoading,
    error,
    
    // Session management
    sessionToken,
    isSessionValid: isSessionValid(),
    
    // Connection functions
    connectWallet,
    disconnectWallet,
    getBalance,
    refreshSession,
    
    // Network state
    chainId,
    isCorrectNetwork: chainId === baseSepolia.id,
    
    // Available connectors
    connectors: getAvailableConnectors(),
    
    // Utility functions
    formatAddress: formatAddress(address),
    setError,
    
    // Mobile detection
    isMobile: isMobile(),
    isInWalletBrowser: isInWalletBrowser(),
  }
} 