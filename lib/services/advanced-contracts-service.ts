import { ethers } from 'ethers'
import { 
  CONTRACT_ADDRESSES,
  PIZZA_PARTY_CORE_ABI,
  VMF_TOKEN_ABI
} from '../contract-config'

export class AdvancedContractsService {
  private provider: ethers.Provider
  private signer?: ethers.Signer

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider
    this.signer = signer
  }

  // Core Game Contract
  private getPizzaPartyCoreContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_CORE,
      PIZZA_PARTY_CORE_ABI,
      this.signer || this.provider
    )
  }



  // VMF Token Contract
  private getVMFContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.VMF_TOKEN,
      VMF_TOKEN_ABI,
      this.signer || this.provider
    )
  }

  // ===== CORE GAME FUNCTIONS =====

  async enterDailyGame(referrer?: string) {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.enterDailyGame(referrer || ethers.ZeroAddress)
  }

  async getCurrentGameId(): Promise<number> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getCurrentGameId()
  }

  async getDailyJackpot(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getDailyJackpot()
  }

  async getWeeklyJackpot(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getWeeklyJackpot()
  }

  async getWeeklyToppingsPool(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getWeeklyToppingsPool()
  }

  async getTotalToppingsClaimed(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getTotalToppingsClaimed()
  }

  async getPlayerReferralInfo(playerAddress: string): Promise<{ referrals: bigint, referrer: string }> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getPlayerReferralInfo(playerAddress)
  }

  async getPlayerToppings(playerAddress: string): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getPlayerToppings(playerAddress)
  }

  async isDailyDrawReady(): Promise<boolean> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.isDailyDrawReady()
  }

  async isWeeklyDrawReady(): Promise<boolean> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.isWeeklyDrawReady()
  }

  async getEligibleDailyPlayers(gameId: number): Promise<string[]> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getEligibleDailyPlayers(gameId)
  }

  async getEligibleWeeklyPlayers(gameId: number): Promise<string[]> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getEligibleWeeklyPlayers(gameId)
  }



  // ===== VMF TOKEN FUNCTIONS =====

  async getVMFBalance(address: string): Promise<bigint> {
    const contract = this.getVMFContract()
    return await contract.balanceOf(address)
  }

  async approveVMF(spender: string, amount: bigint) {
    const contract = this.getVMFContract()
    return await contract.approve(spender, amount)
  }

  async getVMFAllowance(owner: string, spender: string): Promise<bigint> {
    const contract = this.getVMFContract()
    return await contract.allowance(owner, spender)
  }

  // ===== UTILITY FUNCTIONS =====

  async getVMFBalanceFormatted(address: string): Promise<string> {
    const balance = await this.getVMFBalance(address)
    return ethers.formatUnits(balance, 18)
  }

  async getDailyJackpotFormatted(): Promise<string> {
    const jackpot = await this.getDailyJackpot()
    return ethers.formatUnits(jackpot, 18)
  }

  async getWeeklyJackpotFormatted(): Promise<string> {
    const jackpot = await this.getWeeklyJackpot()
    return ethers.formatUnits(jackpot, 18)
  }
}
