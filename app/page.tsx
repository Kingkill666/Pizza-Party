"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ExternalLink, AlertCircle, X } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import {
  WALLETS,
  isMobile,
  isIOS,
  isAndroid,
  isFarcaster,
  initMobileOptimizations,
} from "@/lib/wallet-config"
import { WalletStatus } from "@/components/WalletStatus"

export default function HomePage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isFarcaster: false,
  })

  const { connection, isConnecting, error, connectWallet, disconnect, isConnected, formattedAddress, setError } =
    useWallet()

  // Initialize mobile optimizations and device detection
  useEffect(() => {
    initMobileOptimizations()

    setDeviceInfo({
      isMobile: isMobile(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isFarcaster: isFarcaster(),
    })

    window.scrollTo(0, 0)
  }, [])

  // Handle page refresh and wallet disconnection
  useEffect(() => {
    // Clear toppings data on page reload/refresh when wallet is not connected
    if (!isConnected) {
      console.log("🔌 Wallet not connected - clearing toppings data on page load/reload")
      const keysToRemove = [
        'claimed_toppings_week_',
        'daily_players_',
        'weekly_players_',
        'daily_entry_',
        'referral_code_',
        'streak_count_',
        'last_play_date_',
        'legacy_toppings_',
        'claimed_toppings_',
        'pizza_toppings_',
        'pizza_entry_',
        'pizza_referrer_stats_'
      ]
      
      // Remove all toppings-related data
      Object.keys(localStorage).forEach(key => {
        keysToRemove.forEach(prefix => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
            console.log(`🗑️ Removed ${key} from localStorage on page load/reload`)
          }
        })
      })
    }
  }, [isConnected])

  // Handle page reloads specifically - runs on every page load
  useEffect(() => {
    // Clear toppings data immediately on page load if wallet is not connected
    const clearToppingsOnReload = () => {
      // Check if wallet is connected by looking for wallet data
      const hasWalletData = localStorage.getItem('wagmi.connected') || 
                           localStorage.getItem('wagmi.wallet') ||
                           localStorage.getItem('wagmi.account')
      
      if (!hasWalletData) {
        console.log("🔄 Page reload detected - clearing toppings data (no wallet data found)")
        const keysToRemove = [
          'claimed_toppings_week_',
          'daily_players_',
          'weekly_players_',
          'daily_entry_',
          'referral_code_',
          'streak_count_',
          'last_play_date_',
          'legacy_toppings_',
          'claimed_toppings_',
          'pizza_toppings_',
          'pizza_entry_',
          'pizza_referrer_stats_'
        ]
        
        Object.keys(localStorage).forEach(key => {
          keysToRemove.forEach(prefix => {
            if (key.startsWith(prefix)) {
              localStorage.removeItem(key)
              console.log(`🗑️ Removed ${key} from localStorage on page reload`)
            }
          })
        })
      }
    }

    // Run immediately on component mount
    clearToppingsOnReload()
  }, []) // Empty dependency array - runs only on mount

  const handleWalletConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setShowWalletModal(false)
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const handleDisconnect = () => {
    console.log("🔌 handleDisconnect called")
    console.log("🔌 Calling disconnect function")
    
    // Clear all toppings and wallet data from localStorage
    const keysToRemove = [
      'claimed_toppings_week_',
      'daily_players_',
      'weekly_players_',
      'daily_entry_',
      'referral_code_',
      'streak_count_',
      'last_play_date_',
      'legacy_toppings_',
      'claimed_toppings_',
      'pizza_toppings_',
      'pizza_entry_',
      'pizza_referrer_stats_'
    ]
    
    // Remove all toppings-related data
    Object.keys(localStorage).forEach(key => {
      keysToRemove.forEach(prefix => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
          console.log(`🗑️ Removed ${key} from localStorage`)
        }
      })
    })
    
    // Disconnect the wallet
    disconnect()
    console.log("🔌 disconnect function called")
    
    // Force page refresh to homepage after a short delay to ensure disconnect completes
    setTimeout(() => {
      console.log("🔄 Refreshing page for true disconnect - returning to homepage")
      window.location.href = "/"
    }, 100)
  }

  return (
    <div
      className="min-h-screen p-2 sm:p-4"
      style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        minHeight: deviceInfo.isMobile ? "calc(var(--vh, 1vh) * 100)" : "100vh",
      }}
    >
      <div className="max-w-md mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl">
          <CardContent className="p-4 sm:p-6 text-center">
            {/* MASSIVE Pizza Party Title - Mobile optimized */}
            <div className="mb-4">
              <div
                className="text-8xl font-black transform -rotate-3 drop-shadow-2xl"
                style={{
                  ...customFontStyle,
                  color: "#DC2626",
                  textShadow: "4px 4px 0px #991B1B, 8px 8px 0px #7F1D1D, 12px 12px 20px rgba(0,0,0,0.5)",
                  letterSpacing: "3px",
                  fontWeight: "900",
                  WebkitTextStroke: "2px #450A0A",
                  background: "linear-gradient(45deg, #DC2626, #EF4444, #F87171)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 6px #DC2626)",
                }}
              >
                PIZZA
              </div>
              <div style={{ height: "10px" }}></div>
              <div
                className="text-8xl font-black transform -rotate-3 drop-shadow-2xl"
                style={{
                  ...customFontStyle,
                  color: "#DC2626",
                  textShadow: "4px 4px 0px #991B1B, 8px 8px 0px #7F1D1D, 12px 12px 20px rgba(0,0,0,0.5)",
                  letterSpacing: "3px",
                  fontWeight: "900",
                  WebkitTextStroke: "2px #450A0A",
                  background: "linear-gradient(45deg, #DC2626, #EF4444, #F87171)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 6px #DC2626)",
                }}
              >
                PARTY
              </div>
            </div>

            {/* Pizza Visual - Mobile optimized with transparent background */}
            <div className="flex justify-center items-center mb-4">
              <Image
                src={deviceInfo.isMobile ? "/images/pizza-transparent-mobile.png" : "/images/pizza-final.png"}
                alt="Delicious pizza with pepperoni, green peppers, and olives"
                width={deviceInfo.isMobile ? 144 : 192}
                height={deviceInfo.isMobile ? 144 : 192}
                className="drop-shadow-2xl"
                priority
                style={{
                  background: "transparent",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                }}
              />
            </div>

            {/* Call to Action */}
            <div className="bg-white border-4 border-black p-3 mb-6 transform rotate-1 rounded-2xl">
              <p
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-800"
                style={{
                  ...customFontStyle,
                  letterSpacing: "1px",
                }}
              >
                Play to win a slice!
                <br />
                <span className="text-xl sm:text-2xl lg:text-3xl">8 Slices, 8 Winners!</span>
              </p>
            </div>

            {/* Play Button - Mobile optimized */}
            <Link href="/game">
              <Button
                className="w-full bg-red-700 hover:bg-red-800 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-red-900 shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                style={{
                  ...customFontStyle,
                  letterSpacing: "1px",
                  fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                  minHeight: deviceInfo.isMobile ? "56px" : "auto", // Better touch target
                  marginBottom: "15px"
                }}
              >
                🍕 START PLAYING 🍕
              </Button>
            </Link>

            {/* All Buttons with Equal Spacing */}
            <div className="flex flex-col" style={{ gap: '15px' }}>
              <Link href="/jackpot">
                <Button
                  className="w-full bg-red-700 hover:bg-red-800 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-red-900 shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                  style={{
                    ...customFontStyle,
                    letterSpacing: "1px",
                    fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                    minHeight: deviceInfo.isMobile ? "56px" : "auto",
                  }}
                >
                  🏆 Weekly Jackpot 🏆
                </Button>
              </Link>

              {/* Wallet Connection Button */}
              <WalletStatus
                isConnected={isConnected}
                walletName={connection?.walletName}
                formattedAddress={formattedAddress}
                onConnect={() => setShowWalletModal(true)}
                onDisconnect={handleDisconnect}
                customFontStyle={customFontStyle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Modal - Mobile optimized */}
        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="max-w-xl mx-auto bg-white border-4 border-red-800 rounded-3xl max-h-[90vh] overflow-y-auto m-2">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-red-800 text-center" style={customFontStyle}>
                🍕 Connect Your Wallet 🍕
              </DialogTitle>
              <p className="text-center text-gray-600 mt-2 text-sm" style={customFontStyle}>
                {deviceInfo.isMobile
                  ? "Choose your wallet to connect"
                  : "Choose your preferred wallet to connect to Pizza Party"}
              </p>
            </DialogHeader>

            <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
              {/* Error Display with Mobile Instructions */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-sm" style={customFontStyle}>
                      Connection Failed
                    </p>
                    <div className="text-red-700 text-xs mt-1 whitespace-pre-line" style={customFontStyle}>
                      {error}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Mobile-specific instructions */}
              {deviceInfo.isMobile && (
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                    📱 Mobile Connection Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-700" style={customFontStyle}>
                    <li>• Open your wallet app first</li>
                    <li>• Use the browser inside your wallet app</li>
                    <li>• Visit this page from within the wallet</li>
                    <li>• Then try connecting</li>
                  </ul>
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1" style={customFontStyle}>
                      Current URL to copy:
                    </p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {typeof window !== "undefined" ? window.location.href : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Show all wallets on both mobile and desktop */}
              {WALLETS.map((wallet) => (
                <Button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isConnecting === wallet.id}
                  className={`w-full p-4 sm:p-4 rounded-xl border-2 border-gray-200 text-white font-bold text-left flex items-center justify-between hover:scale-105 transition-all min-h-[60px] sm:min-h-[70px] touch-manipulation ${wallet.color}`}
                  style={customFontStyle}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-4">
                    {wallet.iconImage ? (
                      <Image
                        src={wallet.iconImage || "/placeholder.svg"}
                        alt={`${wallet.name} icon`}
                        width={24}
                        height={24}
                        className="w-6 h-6 sm:w-6 sm:h-6 mr-3 sm:mr-3 flex-shrink-0 rounded"
                      />
                    ) : (
                      <span className="text-2xl sm:text-2xl mr-3 sm:mr-3 flex-shrink-0">{wallet.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-lg sm:text-lg font-bold mb-1 sm:mb-1">{wallet.name}</div>
                      {/* Only show description on desktop */}
                      {!deviceInfo.isMobile && (
                        <div className="text-xs sm:text-xs opacity-90 leading-relaxed whitespace-normal">
                          {wallet.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isConnecting === wallet.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <ExternalLink className="h-4 w-4 sm:h-4 sm:w-4" />
                    )}
                  </div>
                </Button>
              ))}

              {/* Info Section */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mt-6">
                <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                  🔒 Why Connect Your Wallet?
                </h3>
                <ul className="space-y-1 text-sm text-blue-700" style={customFontStyle}>
                  <li>• Earn VMF tokens and toppings</li>
                  <li>• Participate in daily & weekly jackpots</li>
                  <li>• Track your game history</li>
                  <li>• Secure and decentralized</li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
                <p className="text-xs text-yellow-800 text-center" style={customFontStyle}>
                  🛡️ Your wallet connection is secure and encrypted. We never store your private keys.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
