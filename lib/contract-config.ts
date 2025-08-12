// Contract configuration for deployed Pizza Party contracts on Base Mainnet
// This file centralizes all contract addresses and ABIs for the frontend

// Deployed contract addresses on Base mainnet
export const CONTRACT_ADDRESSES = {
  PIZZA_PARTY: "0xc33f4c5102Bf1cF44bFa5A1678170ebC6F242D6A", // Update with actual deployed address
  FREE_RANDOMNESS: "0x3Cb2Bbd8E8bB540Af789E7aed7922f8340f640e5", // Update with actual deployed address
  FREE_PRICE_ORACLE: "0x519f3E234F1E6728191eaBfF938C06b6BF980ccE", // Update with actual deployed address
}

// Network configuration for Base Mainnet
export const NETWORK_CONFIG = {
  BASE_MAINNET: {
    chainId: 8453,
    chainName: "Base",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org", "https://base-mainnet.g.alchemy.com/v2/demo"],
    blockExplorerUrls: ["https://basescan.org"],
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

// ERC-20 ABI for VMF token operations
export const VMF_TOKEN_ABI = [
  // balanceOf
  { inputs: [{ name: "_owner", type: "address" }], name: "balanceOf", outputs: [{ name: "balance", type: "uint256" }], stateMutability: "view", type: "function" },
  // approve
  { inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  // transfer
  { inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  // transferFrom
  { inputs: [{ name: "_from", type: "address" }, { name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transferFrom", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  // allowance
  { inputs: [{ name: "_owner", type: "address" }, { name: "_spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
]

// Helper function to get contract URLs
export const getContractUrl = (contractName: keyof typeof CONTRACT_ADDRESSES): string => {
  const address = CONTRACT_ADDRESSES[contractName]
  return `https://basescan.org/address/${address}`
}

export const CONTRACT_URLS = {
  PIZZA_PARTY: getContractUrl("PIZZA_PARTY"),
  FREE_RANDOMNESS: getContractUrl("FREE_RANDOMNESS"),
  FREE_PRICE_ORACLE: getContractUrl("FREE_PRICE_ORACLE"),
} 