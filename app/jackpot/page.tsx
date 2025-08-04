"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Trophy, Users, Clock, Gift, Star } from "lucide-react"
import { calculateCommunityJackpot, formatJackpotAmount, getWeeklyJackpotInfo } from "@/lib/jackpot-data"

export default function JackpotPage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  const [communityJackpot, setCommunityJackpot] = useState(0)
  const [weeklyInfo, setWeeklyInfo] = useState({
    totalToppings: 0,
    totalPlayers: 0,
    timeUntilDraw: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  })

  // Load community jackpot data
  const loadCommunityJackpot = () => {
    const jackpot = calculateCommunityJackpot()
    setCommunityJackpot(jackpot)
  }

  // Load weekly jackpot info
  const loadWeeklyInfo = () => {
    const info = getWeeklyJackpotInfo()
    setWeeklyInfo(info)
  }

  // Load data on mount and refresh periodically
  useEffect(() => {
    loadCommunityJackpot()
    loadWeeklyInfo()

    // Refresh every second for countdown
    const interval = setInterval(() => {
      loadCommunityJackpot()
      loadWeeklyInfo()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
      <div className="max-w-md mx-auto">
        <Card className="relative bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl mb-6">
          <CardHeader className="text-center pb-4">
            <div className="absolute top-4 left-4 z-10">
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

            {/* Trophy Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-400 p-4 rounded-full border-4 border-yellow-600 shadow-lg">
                <Trophy className="h-12 w-12 text-yellow-800" />
              </div>
            </div>

            <CardTitle className="text-4xl text-red-800 mb-2" style={customFontStyle}>
              Weekly Jackpot
            </CardTitle>
            <p className="text-lg text-gray-700" style={customFontStyle}>
              Collect toppings to win!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Jackpot Amount */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl border-4 border-yellow-600 text-center">
              <p className="text-white text-lg mb-2" style={customFontStyle}>
                Current Jackpot
              </p>
              <p className="text-white text-4xl font-black" style={customFontStyle}>
                {formatJackpotAmount(communityJackpot)} VMF
              </p>
            </div>

            {/* Claim Toppings Button */}
            <div className="text-center">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-green-800 shadow-lg transform hover:scale-105 transition-all"
                style={customFontStyle}
              >
                🍕 Claim Toppings 🍕
              </Button>
            </div>

            {/* Countdown Timer */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-blue-800 text-center" style={customFontStyle}>
                  Next Draw In:
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {weeklyInfo.timeUntilDraw.days}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    DAYS
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {weeklyInfo.timeUntilDraw.hours}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    HRS
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {weeklyInfo.timeUntilDraw.minutes}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    MIN
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {weeklyInfo.timeUntilDraw.seconds}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    SEC
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 text-center mt-2" style={customFontStyle}>
                Draw happens every Sunday at 12pm PST
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <Gift className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-green-600" style={customFontStyle}>
                  Total Toppings
                </p>
                <p className="text-2xl font-bold text-green-800" style={customFontStyle}>
                  {weeklyInfo.totalToppings.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-purple-600" style={customFontStyle}>
                  Players
                </p>
                <p className="text-2xl font-bold text-purple-800" style={customFontStyle}>
                  {weeklyInfo.totalPlayers.toLocaleString()}
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center" style={customFontStyle}>
                🍕 How to Win Toppings 🍕
              </h3>
              <ul className="space-y-2 text-sm text-gray-700" style={customFontStyle}>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Invite friends using your referral link</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Earn 2 toppings for each successful referral</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>More toppings = higher chance to win</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Winner takes the entire jackpot!</span>
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 text-center" style={customFontStyle}>
                📋 Terms & Conditions
              </h3>
              <ul className="space-y-1 text-xs text-yellow-700" style={customFontStyle}>
                <li>• Weekly jackpot drawn every Sunday at 12pm PST</li>
                <li>• Winner selected randomly based on topping count</li>
                <li>• More toppings = higher probability of winning</li>
                <li>• Jackpot resets after each draw</li>
                <li>• Toppings reset after each draw</li>
                <li>• Must have at least 1 topping to be eligible</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ gap: "20px", display: "flex", flexDirection: "column" }}>
              <Link href="/game">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-green-800 shadow-lg transform hover:scale-105 transition-all"
                  style={{
                    ...customFontStyle,
                    letterSpacing: "1px",
                    fontSize: "1.25rem",
                  }}
                >
                  🍕 START PLAYING 🍕
                </Button>
              </Link>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-2 border-red-700 text-red-700 hover:bg-red-50 bg-transparent font-bold py-3"
                  style={{
                    ...customFontStyle,
                    letterSpacing: "1px",
                    fontSize: "1rem",
                  }}
                >
                  🏠 Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
