// Prize service for prize-related operations
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'
import { SecurityMonitor } from '@/lib/security-monitor'

export interface ClaimToppingsParams {
  amount: number
  walletAddress: string
  signature: string
}

export interface ClaimToppingsResult {
  success: boolean
  transactionHash?: string
  claimedAmount?: number
  weeklyJackpot?: string
  remainingToppings?: number
  error?: string
}

export interface PrizeHistory {
  address: string
  prizes: Prize[]
  totalWon: string
}

export interface Prize {
  type: 'daily' | 'weekly'
  amount: string
  transactionHash: string
  timestamp: string
  gameId: number
}

export interface IPrizeService {
  claimToppings(params: ClaimToppingsParams): Promise<ClaimToppingsResult>
  getPrizeHistory(address: string): Promise<PrizeHistory>
  getWeeklyJackpot(): Promise<string>
  getClaimableToppings(address: string): Promise<number>
}

export class PrizeService implements IPrizeService {
  constructor(
    private contractService: IContractService,
    private securityService: ISecurityService,
    private errorHandler: ErrorHandler
  ) {}

  async claimToppings(params: ClaimToppingsParams): Promise<ClaimToppingsResult> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(params.walletAddress)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      const amountValidation = InputValidator.validateAmount(params.amount)
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error || 'Invalid amount')
      }

      if (params.amount <= 0 || params.amount > 100) {
        throw new Error('Invalid topping amount')
      }

      // Security checks
      if (this.securityService.isUserFlagged(params.walletAddress)) {
        throw new Error('Account temporarily restricted due to suspicious activity')
      }

      const rateLimitStatus = this.securityService.getRateLimitStatus(params.walletAddress, 'PRIZE_CLAIM')
      if (!rateLimitStatus.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitStatus.resetTime - Date.now()) / 60000)} minutes`)
      }

      // Track user action
      this.securityService.trackUserAction({
        type: 'PRIZE_CLAIM_ATTEMPT',
        userId: params.walletAddress,
        metadata: { amount: params.amount }
      })

      // Check available toppings
      const availableToppings = await this.getClaimableToppings(params.walletAddress)
      if (availableToppings < params.amount) {
        throw new Error(`Insufficient toppings. Available: ${availableToppings}`)
      }

      // Simulate contract interaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      const weeklyJackpot = await this.getWeeklyJackpot()

      // Update local storage
      const currentToppings = parseInt(localStorage.getItem(`toppings_${params.walletAddress}`) || '0')
      const newToppings = currentToppings - params.amount
      localStorage.setItem(`toppings_${params.walletAddress}`, newToppings.toString())

      // Track successful claim
      this.securityService.trackUserAction({
        type: 'PRIZE_CLAIM_SUCCESS',
        userId: params.walletAddress,
        metadata: { amount: params.amount, transactionHash: mockTxHash }
      })

      return {
        success: true,
        transactionHash: mockTxHash,
        claimedAmount: params.amount,
        weeklyJackpot,
        remainingToppings: newToppings
      }

    } catch (error: any) {
      console.error('Prize claim error:', error)
      
      const userMessage = this.errorHandler.handleError(error, 'PrizeService.claimToppings', 'HIGH')
      
      // Track failed claim
      this.securityService.trackUserAction({
        type: 'PRIZE_CLAIM_FAILED',
        userId: params.walletAddress,
        metadata: { error: error.message }
      })

      return {
        success: false,
        error: userMessage
      }
    }
  }

  async getPrizeHistory(address: string): Promise<PrizeHistory> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      // Mock prize history (in real app, this would come from blockchain events)
      const mockPrizes: Prize[] = [
        {
          type: 'daily',
          amount: '0.0125',
          transactionHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          gameId: 1
        }
      ]

      const totalWon = mockPrizes.reduce((sum, prize) => sum + parseFloat(prize.amount), 0).toString()

      return {
        address,
        prizes: mockPrizes,
        totalWon
      }

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'PrizeService.getPrizeHistory', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  async getWeeklyJackpot(): Promise<string> {
    try {
      // Mock weekly jackpot (in real app, this would come from contract)
      return '0.500'
    } catch (error: any) {
      console.error('Error getting weekly jackpot:', error)
      return '0.000'
    }
  }

  async getClaimableToppings(address: string): Promise<number> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        return 0
      }

      // Calculate claimable toppings from localStorage
      let totalToppings = 0

      // Daily Play (1 topping)
      const lastEntry = localStorage.getItem(`daily_entry_${address}`)
      if (lastEntry) {
        const lastEntryDate = new Date(parseInt(lastEntry))
        const today = new Date()
        today.setHours(12, 0, 0, 0) // Reset at 12pm PST
        
        if (lastEntryDate < today) {
          totalToppings += 1
        }
      } else {
        totalToppings += 1 // First time user
      }

      // VMF Holdings (3 toppings per 10 VMF minimum)
      const balance = parseFloat(localStorage.getItem(`balance_${address}`) || '0')
      if (balance >= 10) {
        totalToppings += 3
      }

      // Referrals (1 topping per referral)
      const referrals = parseInt(localStorage.getItem(`referrals_${address}`) || '0')
      totalToppings += referrals

      // 7-Day Streak (1 topping)
      const streak = parseInt(localStorage.getItem(`streak_${address}`) || '0')
      if (streak >= 7) {
        totalToppings += 1
      }

      return totalToppings

    } catch (error: any) {
      console.error('Error calculating toppings:', error)
      return 0
    }
  }
}

// Service interfaces for dependency injection
export interface IContractService {
  // Contract service methods would be defined here
}

export interface ISecurityService {
  isUserFlagged(userId: string): boolean
  getRateLimitStatus(userId: string, actionType: string): any
  trackUserAction(action: any): void
} 