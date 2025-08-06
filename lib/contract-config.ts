// Contract configuration for deployed Pizza Party contracts on Base Sepolia
// This file centralizes all contract addresses and ABIs for the frontend

// Deployed contract addresses on Base Sepolia testnet
export const CONTRACT_ADDRESSES = {
  PIZZA_PARTY: "0xc33f4c5102Bf1cF44bFa5A1678170ebC6F242D6A",
  FREE_RANDOMNESS: "0x3Cb2Bbd8E8bB540Af789E7aed7922f8340f640e5",
  FREE_PRICE_ORACLE: "0x519f3E234F1E6728191eaBfF938C06b6BF980ccE",
}

// Network configuration for Base Sepolia
export const NETWORK_CONFIG = {
  BASE_SEPOLIA: {
    chainId: 84532,
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org", "https://base-sepolia.g.alchemy.com/v2/demo"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
}

// Contract ABIs (simplified for frontend use)
export const PIZZA_PARTY_ABI = [
  // Player data
  { inputs: [{ name: "player", type: "address" }], name: "getPlayerData", outputs: [{ name: "", type: "tuple" }], stateMutability: "view", type: "function" },
  // Jackpots
  { inputs: [], name: "getDailyJackpot", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getWeeklyJackpot", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  // Entry fees
  { inputs: [], name: "getCurrentEntryFee", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  // Game entry
  { inputs: [{ name: "referralCode", type: "string" }], name: "enterDailyGame", outputs: [], stateMutability: "payable", type: "function" },
  // Referrals
  { inputs: [], name: "createReferralCode", outputs: [{ name: "", type: "string" }], stateMutability: "nonpayable", type: "function" },
  // Rewards
  { inputs: [], name: "awardVMFHoldingsToppings", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "awardStreakBonus", outputs: [], stateMutability: "nonpayable", type: "function" },
]

export const FREE_PRICE_ORACLE_ABI = [
  { inputs: [], name: "getVMFPrice", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
]

export const FREE_RANDOMNESS_ABI = [
  { inputs: [], name: "getRandomNumber", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
]

// Helper function to get contract URLs
export const getContractUrl = (contractName: keyof typeof CONTRACT_ADDRESSES): string => {
  const address = CONTRACT_ADDRESSES[contractName]
  return `https://sepolia.basescan.org/address/${address}`
}

export const CONTRACT_URLS = {
  PIZZA_PARTY: getContractUrl("PIZZA_PARTY"),
  FREE_RANDOMNESS: getContractUrl("FREE_RANDOMNESS"),
  FREE_PRICE_ORACLE: getContractUrl("FREE_PRICE_ORACLE"),
} 