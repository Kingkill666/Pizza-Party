// Game service for business logic
import { PizzaPartyContract } from '@/lib/contract-interactions'
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'
import { SecurityMonitor } from '@/lib/security-monitor'

export interface GameEntryParams {
  walletAddress: string
  referralCode?: string
  signature: string
  chainId: number
}

export interface GameResult {
  success: boolean
  transactionHash?: string
  gameId?: number
  entryFee?: string
  jackpotAmount?: string
  error?: string
}

export interface GameStatus {
  gameId: number
  isActive: boolean
  endTime: string
  totalPlayers: number
  jackpotAmount: string
  winners: string[]
  dailyWinnersCount: number
  weeklyWinnersCount: number
}

export interface PlayerInfo {
  address: string
  totalToppings: number
  dailyEntries: number
  lastEntryTime: string
  streakDays: number
  referrals: number
  totalRewards: string
  isEligibleForDaily: boolean
}

export interface IGameService {
  enterGame(params: GameEntryParams): Promise<GameResult>
  getGameStatus(gameId: number): Promise<GameStatus>
  getPlayerInfo(address: string): Promise<PlayerInfo>
  checkDailyEligibility(address: string): Promise<boolean>
  getDailyPlayers(): Promise<number>
  getWeeklyPlayers(): Promise<number>
}

export class GameService implements IGameService {
  constructor(
    private contractService: IContractService,
    private securityService: ISecurityService,
    private errorHandler: ErrorHandler
  ) {}

  async enterGame(params: GameEntryParams): Promise<GameResult> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(params.walletAddress)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      if (params.referralCode) {
        const referralValidation = InputValidator.validateReferralCode(params.referralCode)
        if (!referralValidation.valid) {
          throw new Error(referralValidation.error || 'Invalid referral code')
        }
      }

      const chainValidation = InputValidator.validateChainId(params.chainId)
      if (!chainValidation.valid) {
        throw new Error(chainValidation.error || 'Invalid chain ID')
      }

      // Security checks
      if (this.securityService.isUserFlagged(params.walletAddress)) {
        throw new Error('Account temporarily restricted due to suspicious activity')
      }

      const rateLimitStatus = this.securityService.getRateLimitStatus(params.walletAddress, 'GAME_ENTRY')
      if (!rateLimitStatus.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitStatus.resetTime - Date.now()) / 60000)} minutes`)
      }

      // Check daily eligibility
      if (!await this.checkDailyEligibility(params.walletAddress)) {
        throw new Error('Daily entry already completed. Come back tomorrow at 12pm PST!')
      }

      // Track user action
      this.securityService.trackUserAction({
        type: 'GAME_ENTRY',
        userId: params.walletAddress,
        metadata: { timestamp: Date.now() }
      })

      // Contract interaction
      const contract = new PizzaPartyContract()
      const tx = await contract.enterDailyGame(params.referralCode || "", {
        value: "0.001"
      })

      // Record successful entry
      localStorage.setItem(`daily_entry_${params.walletAddress}`, Date.now().toString())

      // Track successful action
      this.securityService.trackUserAction({
        type: 'GAME_ENTRY_SUCCESS',
        userId: params.walletAddress,
        metadata: { transactionHash: tx.hash }
      })

      return {
        success: true,
        transactionHash: tx.hash,
        gameId: 1, // Current game ID
        entryFee: "0.001",
        jackpotAmount: await this.getCurrentJackpot()
      }

    } catch (error: any) {
      console.error('Game entry error:', error)
      
      const userMessage = this.errorHandler.handleError(error, 'GameService.enterGame', 'HIGH')
      
      // Track failed action
      this.securityService.trackUserAction({
        type: 'GAME_ENTRY_FAILED',
        userId: params.walletAddress,
        metadata: { error: error.message }
      })

      return {
        success: false,
        error: userMessage
      }
    }
  }

  async getGameStatus(gameId: number): Promise<GameStatus> {
    try {
      const gameIdValidation = InputValidator.validateGameId(gameId)
      if (!gameIdValidation.valid) {
        throw new Error(gameIdValidation.error || 'Invalid game ID')
      }

      const contract = new PizzaPartyContract()
      const dailyPlayers = await contract.getDailyPlayerCount()
      const weeklyPlayers = await contract.getWeeklyPlayerCount()
      const jackpotAmount = await this.getCurrentJackpot()

      const now = new Date()
      const endTime = new Date(now)
      endTime.setHours(12, 0, 0, 0) // Reset at 12pm PST
      if (endTime <= now) {
        endTime.setDate(endTime.getDate() + 1) // Next day
      }

      return {
        gameId,
        isActive: true,
        endTime: endTime.toISOString(),
        totalPlayers: dailyPlayers || 0,
        jackpotAmount,
        winners: [],
        dailyWinnersCount: 8,
        weeklyWinnersCount: 10
      }

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'GameService.getGameStatus', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  async getPlayerInfo(address: string): Promise<PlayerInfo> {
    try {
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      const totalToppings = parseInt(localStorage.getItem(`toppings_${address}`) || '0')
      const dailyEntries = parseInt(localStorage.getItem(`daily_entries_${address}`) || '0')
      const lastEntryTime = localStorage.getItem(`daily_entry_${address}`) || '0'
      const streakDays = parseInt(localStorage.getItem(`streak_${address}`) || '0')
      const referrals = parseInt(localStorage.getItem(`referrals_${address}`) || '0')
      const totalRewards = localStorage.getItem(`total_rewards_${address}`) || '0'
      const isEligibleForDaily = await this.checkDailyEligibility(address)

      return {
        address,
        totalToppings,
        dailyEntries,
        lastEntryTime: new Date(parseInt(lastEntryTime)).toISOString(),
        streakDays,
        referrals,
        totalRewards,
        isEligibleForDaily
      }

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'GameService.getPlayerInfo', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  async checkDailyEligibility(address: string): Promise<boolean> {
    try {
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        return false
      }

      const today = new Date()
      today.setHours(12, 0, 0, 0) // Reset at 12pm PST
      
      const lastEntry = localStorage.getItem(`daily_entry_${address}`)
      if (lastEntry) {
        const lastEntryDate = new Date(parseInt(lastEntry))
        return lastEntryDate < today
      }
      
      return true

    } catch (error: any) {
      console.error('Error checking daily eligibility:', error)
      return false
    }
  }

  async getDailyPlayers(): Promise<number> {
    try {
      const contract = new PizzaPartyContract()
      const count = await contract.getDailyPlayerCount()
      return count || 0
    } catch (error: any) {
      console.error('Error getting daily players:', error)
      return 0
    }
  }

  async getWeeklyPlayers(): Promise<number> {
    try {
      const contract = new PizzaPartyContract()
      const count = await contract.getWeeklyPlayerCount()
      return count || 0
    } catch (error: any) {
      console.error('Error getting weekly players:', error)
      return 0
    }
  }

  private async getCurrentJackpot(): Promise<string> {
    try {
      // This would typically come from the contract
      // For now, return a placeholder
      return "0.150"
    } catch (error: any) {
      console.error('Error getting jackpot:', error)
      return "0.000"
    }
  }
}

// Service interfaces for dependency injection
export interface IContractService {
  enterDailyGame(referralCode: string, options: any): Promise<any>
  getDailyPlayerCount(): Promise<number>
  getWeeklyPlayerCount(): Promise<number>
}

export interface ISecurityService {
  isUserFlagged(userId: string): boolean
  getRateLimitStatus(userId: string, actionType: string): any
  trackUserAction(action: any): void
} 