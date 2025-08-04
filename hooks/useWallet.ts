"use client"

import { useCallback, useEffect, useState } from "react"
import {
  WalletConnection,
  formatAddress,
  isMobile,
  isWalletInstalled,
  openWalletInstallPage,
  getWalletDisplayName,
  connectMobileWallet,
  requestWalletConnection,
  debugProviders,
} from "../lib/wallet-config"

export const useWallet = () => {
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount - DISABLED for fresh start
  useEffect(() => {
    // Don't auto-connect on page load - start fresh
    console.log("🚀 Starting fresh - no auto-connection")
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("👤 Accounts changed:", accounts)
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log("🔌 Wallet accounts cleared - user disconnected")
          disconnect()
        } else if (connection && accounts[0] !== connection.address) {
          setConnection((prev) => (prev ? { ...prev, address: accounts[0] } : null))
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("🔗 Chain changed:", chainId)
        setConnection((prev) => (prev ? { ...prev, chainId: Number.parseInt(chainId, 16) } : null))
      }

      const handleConnect = (connectInfo: any) => {
        console.log("🔌 Wallet connected:", connectInfo)
        // Don't auto-connect - let user manually connect
        console.log("ℹ️ Ignoring auto-connect - manual connection only")
      }

      const handleDisconnect = (error: any) => {
        console.log("🔌 Wallet disconnected:", error)
        disconnect()
      }

      // Add event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("connect", handleConnect)
      window.ethereum.on("disconnect", handleDisconnect)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
          window.ethereum.removeListener("connect", handleConnect)
          window.ethereum.removeListener("disconnect", handleDisconnect)
        }
      }
    }
  }, [connection])

  const checkExistingConnection = async () => {
    try {
      // Check if user has explicitly disconnected
      const isDisconnected = localStorage.getItem("wallet_disconnected")
      if (isDisconnected === "true") {
        console.log("ℹ️ Wallet was explicitly disconnected, not auto-reconnecting")
        localStorage.removeItem("wallet_disconnected") // Clear the flag
        return
      }

      if (typeof window !== "undefined" && window.ethereum) {
        console.log("🔍 Checking for existing wallet connection...")

        const accounts = await window.ethereum.request({ method: "eth_accounts" })

        if (accounts && accounts.length > 0) {
          console.log("✅ Found existing connection:", accounts[0])

          const chainId = await window.ethereum.request({ method: "eth_chainId" })

          setConnection({
            address: accounts[0],
            chainId: Number.parseInt(chainId, 16),
            walletName: "Connected Wallet",
          })
        } else {
          console.log("ℹ️ No existing wallet connection found")
        }
      }
    } catch (error) {
      console.error("❌ Error checking existing connection:", error)
    }
  }

  const connectWallet = useCallback(async (walletId: string) => {
    setIsConnecting(walletId)
    setError(null)

    console.log(`🎯 Attempting to connect to ${walletId}`)
    console.log(`📱 Mobile device: ${isMobile()}`)
    
    // Debug available providers
    debugProviders()

    try {
      let result

      // Use mobile-specific connection for mobile devices
      if (isMobile()) {
        console.log("📱 Using mobile connection strategy...")
        result = await connectMobileWallet(walletId)
      } else {
        console.log("💻 Using desktop connection strategy...")

        // Check if wallet is installed on desktop
        if (!isWalletInstalled(walletId)) {
          console.log(`❌ ${walletId} not installed on desktop`)
          openWalletInstallPage(walletId)
          throw new Error(`${getWalletDisplayName(walletId)} is not installed. Please install it first.`)
        }

        result = await requestWalletConnection(walletId)
      }

      if (!result || !result.accounts || result.accounts.length === 0) {
        throw new Error("No accounts returned from wallet")
      }

      const walletConnection: WalletConnection = {
        address: result.accounts[0],
        chainId: Number.parseInt(result.chainId, 16),
        walletName: getWalletDisplayName(walletId),
      }

      console.log(`✅ Successfully connected to ${walletId}:`, walletConnection)
      setConnection(walletConnection)

      // Store connection in localStorage for persistence
      localStorage.setItem("wallet_connection", JSON.stringify(walletConnection))

      // Refresh to homepage after successful connection
      setTimeout(() => {
        console.log("🔄 Refreshing to homepage after successful connection")
        window.location.href = "/"
      }, 500)

      return walletConnection
    } catch (error: any) {
      console.error(`❌ Failed to connect to ${walletId}:`, error)

      let errorMessage = error.message || "Connection failed"

      // Handle specific error codes with mobile-friendly messages
      if (error.code === 4001) {
        errorMessage = "Connection rejected. Please try again and approve the connection."
      } else if (error.code === -32002) {
        errorMessage = "Connection request pending. Please check your wallet app."
      } else if (error.code === 4902) {
        errorMessage = isMobile()
          ? "Please switch to Base network in your wallet app and try again."
          : "Base network not found. Please add Base network to your wallet."
      } else if (error.message?.includes("not found") || error.message?.includes("not installed")) {
        errorMessage = isMobile()
          ? `${getWalletDisplayName(walletId)} app not found. Please install it from your app store.`
          : error.message
      } else if (isMobile() && (error.message?.includes("app not found") || error.message?.includes("not available"))) {
        errorMessage = `${getWalletDisplayName(walletId)} app not found. Please install it and try again.`
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsConnecting(null)
    }
  }, [])

  const disconnect = useCallback(() => {
    console.log("🔌 Starting wallet disconnect process...")

    // Clear all connection state
    setConnection(null)
    setError(null)

    // Clear localStorage wallet data
    localStorage.removeItem("wallet_connection")
    
    // Add a flag to prevent auto-reconnection
    localStorage.setItem("wallet_disconnected", "true")

    console.log("✅ Wallet disconnected successfully")

    // Force a hard refresh to clear all state
    setTimeout(() => {
      console.log("🔄 Performing hard refresh to homepage")
      // Clear any cached wallet state
      if (typeof window !== "undefined" && window.ethereum) {
        // Remove all event listeners temporarily
        window.ethereum.removeAllListeners?.()
      }
      // Force a complete page reload to homepage
      window.location.href = "/"
    }, 100)
  }, [])

  const getBalance = useCallback(async (): Promise<string> => {
    if (!connection) return "0"

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [connection.address, "latest"],
      })

      const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)
      return balanceInEth.toString()
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }, [connection])

  return {
    connection,
    isConnecting,
    error,
    connectWallet,
    disconnect,
    getBalance,
    isConnected: !!connection,
    formattedAddress: connection ? formatAddress(connection.address) : null,
    setError,
  }
}
