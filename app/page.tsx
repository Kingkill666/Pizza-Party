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
    disconnect()
    console.log("🔌 disconnect function called")
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
                Play to win a slice
                <br />
                of the pie!
              </p>
            </div>

            {/* Play Button - Mobile optimized */}
            <Link href="/game">
              <Button
                className="w-full bg-red-700 hover:bg-red-800 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-red-900 shadow-lg transform hover:scale-105 transition-all mb-6 touch-manipulation"
                style={{
                  ...customFontStyle,
                  letterSpacing: "1px",
                  fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                  minHeight: deviceInfo.isMobile ? "56px" : "auto", // Better touch target
                }}
              >
                🍕 START PLAYING 🍕
              </Button>
            </Link>

            {/* Navigation */}
            <div className="flex flex-col gap-4">
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

              {/* Wallet Connection Status */}
              {!isConnected ? (
                <Button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full bg-white text-red-700 border-2 border-red-700 hover:bg-red-50 text-lg font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                  style={{
                    ...customFontStyle,
                    letterSpacing: "1px",
                    fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                    minHeight: deviceInfo.isMobile ? "56px" : "auto",
                  }}
                >
                  💳 Connect Wallet
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="w-full bg-green-100 text-green-800 border-2 border-green-600 text-lg font-bold py-3 px-6 rounded-xl shadow-lg touch-manipulation flex items-center justify-center"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                      minHeight: deviceInfo.isMobile ? "56px" : "auto",
                    }}
                  >
                    ✅ Connected {formattedAddress}
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-2 border-red-700 shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: deviceInfo.isMobile ? "1.1rem" : "1.25rem",
                      minHeight: deviceInfo.isMobile ? "56px" : "auto",
                    }}
                  >
                    🔌 Disconnect
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Modal - Mobile optimized */}
        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="max-w-xl mx-auto bg-white border-4 border-red-800 rounded-3xl max-h-[90vh] overflow-y-auto m-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-800 text-center">
                Connect Your Wallet
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 p-4">
              {WALLETS.map((wallet) => (
                <Button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isConnecting === wallet.id}
                  className={`w-full p-4 text-lg font-bold rounded-xl border-2 transition-all transform hover:scale-105 ${
                    wallet.color
                  } ${isConnecting === wallet.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    ...customFontStyle,
                    letterSpacing: "1px",
                    minHeight: deviceInfo.isMobile ? "64px" : "auto",
                  }}
                >
                  <span className="text-2xl mr-3">{wallet.icon}</span>
                  {wallet.name}
                  {isConnecting === wallet.id && (
                    <div className="ml-3 animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                </Button>
              ))}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="mr-2" />
                  {error}
                </div>
              )}

              {/* Mobile Connection Tips */}
              {deviceInfo.isMobile && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                  <p className="font-bold mb-2">📱 Mobile Connection Tips:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Make sure your wallet app is installed</li>
                    <li>• Try opening the link in your wallet's browser</li>
                    <li>• If it doesn't work, try copying the URL to your wallet</li>
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
