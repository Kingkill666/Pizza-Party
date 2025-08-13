// Contract addresses for Base Mainnet
export const CONTRACT_ADDRESSES = {
  // Core contracts
  PIZZA_PARTY_CORE: "0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460",
  VMF_TOKEN: "0x2213414893259b0C48066Acd1763e7fbA97859E5",
  
  // Legacy contracts (keeping for backward compatibility)
  PIZZA_PARTY: "0xaf32cA0c109318a36aA2e10F38611D5b64b72A03",
  FREE_RANDOMNESS: "0x56507fceCE0d42F269BE7A52575e2e1cb5cAD212",
  FREE_PRICE_ORACLE: "0x28FCF71EBEAc23Ba02c86aF69f289425db56e049",
  
  // New Advanced Modular Contracts
  PIZZA_PARTY_REFERRAL: "0xb976e0400e88f78AA85029D138fFD11A65de9CE8",
  PIZZA_PARTY_DYNAMIC_PRICING: "0x0F5a91907039eecebEA78ad2d327C7521d4F7892",
  PIZZA_PARTY_LOYALTY: "0xC8a44e0587f7BeDa623b75DF5415E85Bf1163ac7",
  PIZZA_PARTY_ADVANCED_RANDOMNESS: "0xCcF33C77A65849e19Df6e66A9daEBC112D5BDBCE",
  PIZZA_PARTY_ANALYTICS: "0xf32156203A70Bbf1e3db6C664F3F7eA8310a8841",
  PIZZA_PARTY_WEEKLY_CHALLENGES: "0x87fee21FB855Ae44600B79b38709E4587f5b60CF",
  
  // Chainlink VRF
  CHAINLINK_VRF: "0xefAe49039ADB963b1183869D1632D4CbC8F0603b"
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 8453,
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
}

// VMF Token ABI (ERC-20 standard)
export const VMF_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyCore contract ABI (new modular core)
export const PIZZA_PARTY_CORE_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "PlayerEntered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "enterDailyGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentDailyJackpot",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentWeeklyJackpot",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentGameId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDailyDrawReady",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isWeeklyDrawReady",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "getEligibleDailyPlayers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "getEligibleWeeklyPlayers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerToppings",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinimumVMFRequired",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyReferral contract ABI
export const PIZZA_PARTY_REFERRAL_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "createReferralCode",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "referralCode", "type": "string"}],
    "name": "processReferralCode",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "referralCode", "type": "string"}],
    "name": "getReferralCodeInfo",
    "outputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "uint256", "name": "uses", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRewards", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserReferralData",
    "outputs": [
      {"internalType": "string", "name": "referralCode", "type": "string"},
      {"internalType": "uint256", "name": "totalReferrals", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRewards", "type": "uint256"},
      {"internalType": "bool", "name": "isBlacklisted", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyDynamicPricing contract ABI
export const PIZZA_PARTY_DYNAMIC_PRICING_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_vmfToken", "type": "address"},
      {"internalType": "address", "name": "_priceOracle", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "calculateDynamicEntryFee",
    "outputs": [
      {"internalType": "uint256", "name": "feeAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "vmfPrice", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentEntryFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVMFPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "collectEntryFee",
    "outputs": [{"internalType": "uint256", "name": "feeAmount", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// PizzaPartyLoyalty contract ABI
export const PIZZA_PARTY_LOYALTY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "points", "type": "uint256"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "awardLoyaltyPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "awardEntryPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "awardSpendingPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "points", "type": "uint256"}
    ],
    "name": "redeemPoints",
    "outputs": [{"internalType": "uint256", "name": "rewardAmount", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserLoyaltyData",
    "outputs": [
      {"internalType": "uint256", "name": "totalPoints", "type": "uint256"},
      {"internalType": "uint256", "name": "currentTier", "type": "uint256"},
      {"internalType": "uint256", "name": "streakDays", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRewards", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyAdvancedRandomness contract ABI
export const PIZZA_PARTY_ADVANCED_RANDOMNESS_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "startNewRound",
    "outputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "roundId", "type": "uint256"},
      {"internalType": "bytes32", "name": "entropyHash", "type": "bytes32"}
    ],
    "name": "commitEntropy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "roundId", "type": "uint256"},
      {"internalType": "bytes32", "name": "entropy", "type": "bytes32"},
      {"internalType": "bytes32", "name": "salt", "type": "bytes32"}
    ],
    "name": "revealEntropy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}],
    "name": "completeRound",
    "outputs": [{"internalType": "bytes32", "name": "finalSeed", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRoundInfo",
    "outputs": [
      {"internalType": "uint256", "name": "roundId", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "commitPhaseEnd", "type": "uint256"},
      {"internalType": "uint256", "name": "revealPhaseEnd", "type": "uint256"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "uint256", "name": "_totalContributors", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEntropy", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "seed", "type": "bytes32"}],
    "name": "generateRandomNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyAnalytics contract ABI
export const PIZZA_PARTY_ANALYTICS_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "player", "type": "address"},
      {"internalType": "string", "name": "activity", "type": "string"},
      {"internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "recordPlayerActivity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address[]", "name": "players", "type": "address[]"}],
    "name": "processPlayerBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerAnalytics",
    "outputs": [
      {"internalType": "uint256", "name": "totalActivities", "type": "uint256"},
      {"internalType": "uint256", "name": "lastActivity", "type": "uint256"},
      {"internalType": "uint256", "name": "totalValue", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnalyticsSummary",
    "outputs": [
      {"internalType": "uint256", "name": "totalPlayers", "type": "uint256"},
      {"internalType": "uint256", "name": "totalActivities", "type": "uint256"},
      {"internalType": "uint256", "name": "totalValue", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// PizzaPartyWeeklyChallenges contract ABI
export const PIZZA_PARTY_WEEKLY_CHALLENGES_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "rewardAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "createChallenge",
    "outputs": [{"internalType": "uint256", "name": "challengeId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "challengeId", "type": "uint256"}],
    "name": "joinChallenge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "challengeId", "type": "uint256"}],
    "name": "completeChallenge",
    "outputs": [{"internalType": "uint256", "name": "rewardAmount", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "challengeId", "type": "uint256"}],
    "name": "getChallengeInfo",
    "outputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "rewardAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserChallengeData",
    "outputs": [
      {"internalType": "uint256", "name": "totalChallenges", "type": "uint256"},
      {"internalType": "uint256", "name": "completedChallenges", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRewards", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// Legacy PizzaParty contract ABI (keeping for backward compatibility)
export const PIZZA_PARTY_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_vmfToken", "type": "address"},
      {"internalType": "address", "name": "_randomnessContract", "type": "address"},
      {"internalType": "address", "name": "_priceOracle", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "PlayerEntered",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "string", "name": "referralCode", "type": "string"}],
    "name": "enterDailyGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentDailyJackpot",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentWeeklyJackpot",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DAILY_ENTRY_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DAILY_WINNERS_COUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WEEKLY_WINNERS_COUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "dailyPlayerCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "weeklyPlayerCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentEntryFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentVMFPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalToppings", "type": "uint256"},
          {"internalType": "uint256", "name": "dailyEntries", "type": "uint256"},
          {"internalType": "uint256", "name": "weeklyEntries", "type": "uint256"},
          {"internalType": "uint256", "name": "lastEntryTime", "type": "uint256"},
          {"internalType": "uint256", "name": "streakDays", "type": "uint256"},
          {"internalType": "uint256", "name": "lastStreakUpdate", "type": "uint256"},
          {"internalType": "bool", "name": "isBlacklisted", "type": "bool"},
          {"internalType": "uint256", "name": "lastVMFHoldingsCheck", "type": "uint256"},
          {"internalType": "uint256", "name": "loyaltyPoints", "type": "uint256"},
          {"internalType": "uint256", "name": "totalOrders", "type": "uint256"},
          {"internalType": "uint256", "name": "weeklyChallengesCompleted", "type": "uint256"},
          {"internalType": "uint256", "name": "jackpotEntries", "type": "uint256"},
          {"internalType": "uint256", "name": "lastRewardClaim", "type": "uint256"},
          {"internalType": "bool", "name": "hasCompletedFirstOrder", "type": "bool"},
          {"internalType": "uint256", "name": "dailyRewardsClaimed", "type": "uint256"},
          {"internalType": "uint256", "name": "lastSecurityCheck", "type": "uint256"},
          {"internalType": "bool", "name": "isRateLimited", "type": "bool"}
        ],
        "internalType": "struct PizzaParty.Player",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "awardStreakBonus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "awardVMFHoldingsToppings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createReferralCode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// FreeRandomness contract ABI (simplified)
export const FREE_RANDOMNESS_ABI = [
  {
    "inputs": [],
    "name": "getCurrentRound",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}],
    "name": "getFinalRandomNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// FreePriceOracle contract ABI (simplified)
export const FREE_PRICE_ORACLE_ABI = [
  {
    "inputs": [],
    "name": "getVMFPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRequiredVMFForDollar",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] 