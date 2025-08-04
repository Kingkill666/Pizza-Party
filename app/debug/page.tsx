"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Wallet, Coins, Network, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useVMFBalance } from "@/hooks/useVMFBalance"
import { VMFDebugTool } from "@/components/VMFDebugTool"

export default function DebugPage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  const { connection, isConnected, error: walletError, getBalance } = useWallet()
  const { balance, formattedBalance, isLoading: vmfLoading, error: vmfError, refetch } = useVMFBalance()

  const [ethBalance, setEthBalance] = useState<string>("0")
  const [isLoadingEth, setIsLoadingEth] = useState(false)

  const fetchEthBalance = async () => {
    if (!isConnected) return

    setIsLoadingEth(true)
    try {
      const balance = await getBalance()
      setEthBalance(balance)
    } catch (error) {
      console.error("Error fetching ETH balance:", error)
    } finally {
      setIsLoadingEth(false)
    }
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl mb-6">
          <CardHeader className="text-center pb-4">
            <div className="absolute top-4 left-4">
              <Link href="/">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white hover:bg-gray-100 text-black border-2 border-gray-300 rounded-xl shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <CardTitle className="text-3xl text-red-800" style={customFontStyle}>
              🔧 Debug Console 🔧
            </CardTitle>
            <p className="text-gray-600" style={customFontStyle}>
              Wallet & Contract Information
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Wallet Connection Status */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800" style={customFontStyle}>
                  Wallet Connection
                </h3>
              </div>

              {isConnected ? (
                <div className="space-y-2">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-green-800" style={customFontStyle}>
                      <strong>Status:</strong> Connected ✅
                    </p>
                    <p className="text-sm text-green-800" style={customFontStyle}>
                      <strong>Wallet:</strong> {connection?.walletName}
                    </p>
                    <p className="text-sm text-green-800 font-mono">
                      <strong>Address:</strong> {connection?.address}
                    </p>
                    <p className="text-sm text-green-800" style={customFontStyle}>
                      <strong>Chain ID:</strong> {connection?.chainId}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded-lg">
                  <p className="text-sm text-red-800" style={customFontStyle}>
                    <strong>Status:</strong> Not Connected ❌
                  </p>
                  {walletError && (
                    <p className="text-xs text-red-700 mt-2" style={customFontStyle}>
                      <strong>Error:</strong> {walletError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ETH Balance */}
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-purple-800" style={customFontStyle}>
                    ETH Balance
                  </h3>
                </div>
                <Button
                  onClick={fetchEthBalance}
                  disabled={!isConnected || isLoadingEth}
                  size="sm"
                  variant="outline"
                  className="border-purple-300 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingEth ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-lg font-bold text-purple-800" style={customFontStyle}>
                  {isLoadingEth ? "Loading..." : `${Number.parseFloat(ethBalance).toFixed(4)} ETH`}
                </p>
              </div>
            </div>

            {/* VMF Balance */}
            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800" style={customFontStyle}>
                    VMF Token Balance
                  </h3>
                </div>
                <Button
                  onClick={refetch}
                  disabled={!isConnected || vmfLoading}
                  size="sm"
                  variant="outline"
                  className="border-green-300 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 ${vmfLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="bg-white p-3 rounded-lg">
                {vmfLoading ? (
                  <p className="text-lg font-bold text-green-800" style={customFontStyle}>
                    Loading...
                  </p>
                ) : vmfError ? (
                  <p className="text-sm text-red-600" style={customFontStyle}>
                    Error: {vmfError}
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-green-800" style={customFontStyle}>
                      {formattedBalance} VMF
                    </p>
                    <p className="text-sm text-gray-600">
                      {balance >= 1 ? "✅ Sufficient for game entry" : "❌ Need at least $1 worth of VMF to play"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* VMF Debug Tool */}
            <VMFDebugTool />

            {/* Local Storage Debug */}
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-3" style={customFontStyle}>
                🗄️ Local Storage Data
              </h3>

              <div className="bg-white p-3 rounded-lg">
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <strong>Wallet Connection:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {localStorage.getItem("wallet_connection") || "None"}
                    </pre>
                  </div>

                  <div>
                    <strong>Today's Entries:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {Object.keys(localStorage)
                        .filter((key) => key.startsWith("pizza_entry_") && key.includes(new Date().toDateString()))
                        .map((key) => `${key}: ${localStorage.getItem(key)}`)
                        .join("\n") || "None"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Data Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                style={customFontStyle}
              >
                🗑️ Clear All Data & Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
