import { ethers } from 'ethers'
import { 
  CONTRACT_ADDRESSES,
  PIZZA_PARTY_CORE_ABI,
  PIZZA_PARTY_REFERRAL_ABI,
  PIZZA_PARTY_DYNAMIC_PRICING_ABI,
  PIZZA_PARTY_LOYALTY_ABI,
  PIZZA_PARTY_ADVANCED_RANDOMNESS_ABI,
  PIZZA_PARTY_ANALYTICS_ABI,
  PIZZA_PARTY_WEEKLY_CHALLENGES_ABI,
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

  // Referral System Contract
  private getReferralContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_REFERRAL,
      PIZZA_PARTY_REFERRAL_ABI,
      this.signer || this.provider
    )
  }

  // Dynamic Pricing Contract
  private getDynamicPricingContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_DYNAMIC_PRICING,
      PIZZA_PARTY_DYNAMIC_PRICING_ABI,
      this.signer || this.provider
    )
  }

  // Loyalty System Contract
  private getLoyaltyContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_LOYALTY,
      PIZZA_PARTY_LOYALTY_ABI,
      this.signer || this.provider
    )
  }

  // Advanced Randomness Contract
  private getAdvancedRandomnessContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_ADVANCED_RANDOMNESS,
      PIZZA_PARTY_ADVANCED_RANDOMNESS_ABI,
      this.signer || this.provider
    )
  }

  // Analytics Contract
  private getAnalyticsContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_ANALYTICS,
      PIZZA_PARTY_ANALYTICS_ABI,
      this.signer || this.provider
    )
  }

  // Weekly Challenges Contract
  private getWeeklyChallengesContract() {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_WEEKLY_CHALLENGES,
      PIZZA_PARTY_WEEKLY_CHALLENGES_ABI,
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

  async enterDailyGame() {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.enterDailyGame()
  }

  async getCurrentGameId(): Promise<number> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.getCurrentGameId()
  }

  async getDailyJackpot(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.currentDailyJackpot()
  }

  async getWeeklyJackpot(): Promise<bigint> {
    const contract = this.getPizzaPartyCoreContract()
    return await contract.currentWeeklyJackpot()
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

  // ===== REFERRAL SYSTEM FUNCTIONS =====

  async createReferralCode(): Promise<string> {
    const contract = this.getReferralContract()
    return await contract.createReferralCode()
  }

  async processReferralCode(referralCode: string): Promise<boolean> {
    const contract = this.getReferralContract()
    return await contract.processReferralCode(referralCode)
  }

  async getReferralCodeInfo(referralCode: string) {
    const contract = this.getReferralContract()
    return await contract.getReferralCodeInfo(referralCode)
  }

  async getUserReferralData(userAddress: string) {
    const contract = this.getReferralContract()
    return await contract.getUserReferralData(userAddress)
  }

  // ===== DYNAMIC PRICING FUNCTIONS =====

  async calculateDynamicEntryFee() {
    const contract = this.getDynamicPricingContract()
    return await contract.calculateDynamicEntryFee()
  }

  async getCurrentEntryFee(): Promise<bigint> {
    const contract = this.getDynamicPricingContract()
    return await contract.getCurrentEntryFee()
  }

  async getVMFPrice(): Promise<bigint> {
    const contract = this.getDynamicPricingContract()
    return await contract.getVMFPrice()
  }

  async collectEntryFee(userAddress: string): Promise<bigint> {
    const contract = this.getDynamicPricingContract()
    return await contract.collectEntryFee(userAddress)
  }

  // ===== LOYALTY SYSTEM FUNCTIONS =====

  async awardLoyaltyPoints(userAddress: string, points: number, reason: string) {
    const contract = this.getLoyaltyContract()
    return await contract.awardLoyaltyPoints(userAddress, points, reason)
  }

  async awardEntryPoints(userAddress: string) {
    const contract = this.getLoyaltyContract()
    return await contract.awardEntryPoints(userAddress)
  }

  async awardSpendingPoints(userAddress: string, amount: bigint) {
    const contract = this.getLoyaltyContract()
    return await contract.awardSpendingPoints(userAddress, amount)
  }

  async redeemPoints(userAddress: string, points: number): Promise<bigint> {
    const contract = this.getLoyaltyContract()
    return await contract.redeemPoints(userAddress, points)
  }

  async getUserLoyaltyData(userAddress: string) {
    const contract = this.getLoyaltyContract()
    return await contract.getUserLoyaltyData(userAddress)
  }

  // ===== ADVANCED RANDOMNESS FUNCTIONS =====

  async startNewRound(): Promise<number> {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.startNewRound()
  }

  async commitEntropy(roundId: number, entropyHash: string) {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.commitEntropy(roundId, entropyHash)
  }

  async revealEntropy(roundId: number, entropy: string, salt: string) {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.revealEntropy(roundId, entropy, salt)
  }

  async completeRound(roundId: number): Promise<string> {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.completeRound(roundId)
  }

  async getCurrentRoundInfo() {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.getCurrentRoundInfo()
  }

  async generateRandomNumber(seed: string): Promise<bigint> {
    const contract = this.getAdvancedRandomnessContract()
    return await contract.generateRandomNumber(seed)
  }

  // ===== ANALYTICS FUNCTIONS =====

  async recordPlayerActivity(playerAddress: string, activity: string, value: bigint) {
    const contract = this.getAnalyticsContract()
    return await contract.recordPlayerActivity(playerAddress, activity, value)
  }

  async processPlayerBatch(playerAddresses: string[]) {
    const contract = this.getAnalyticsContract()
    return await contract.processPlayerBatch(playerAddresses)
  }

  async getPlayerAnalytics(playerAddress: string) {
    const contract = this.getAnalyticsContract()
    return await contract.getPlayerAnalytics(playerAddress)
  }

  async getAnalyticsSummary() {
    const contract = this.getAnalyticsContract()
    return await contract.getAnalyticsSummary()
  }

  // ===== WEEKLY CHALLENGES FUNCTIONS =====

  async createChallenge(title: string, description: string, rewardAmount: bigint, duration: number): Promise<number> {
    const contract = this.getWeeklyChallengesContract()
    return await contract.createChallenge(title, description, rewardAmount, duration)
  }

  async joinChallenge(challengeId: number) {
    const contract = this.getWeeklyChallengesContract()
    return await contract.joinChallenge(challengeId)
  }

  async completeChallenge(challengeId: number): Promise<bigint> {
    const contract = this.getWeeklyChallengesContract()
    return await contract.completeChallenge(challengeId)
  }

  async getChallengeInfo(challengeId: number) {
    const contract = this.getWeeklyChallengesContract()
    return await contract.getChallengeInfo(challengeId)
  }

  async getUserChallengeData(userAddress: string) {
    const contract = this.getWeeklyChallengesContract()
    return await contract.getUserChallengeData(userAddress)
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

  async getCurrentEntryFeeFormatted(): Promise<string> {
    const fee = await this.getCurrentEntryFee()
    return ethers.formatUnits(fee, 18)
  }

  async getVMFPriceFormatted(): Promise<string> {
    const price = await this.getVMFPrice()
    return ethers.formatUnits(price, 18)
  }
}
