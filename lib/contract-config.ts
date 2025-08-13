// Contract addresses for Base Mainnet
export const CONTRACT_ADDRESSES = {
  // Core contracts
  PIZZA_PARTY_CORE: "0x705C974B290db3421ED749cd5838b982bB9B6c51",
  VMF_TOKEN: "0x2213414893259b0C48066Acd1763e7fbA97859E5",
  
  // Legacy contracts (keeping for backward compatibility)
  PIZZA_PARTY: "0xaf32cA0c109318a36aA2e10F38611D5b64b72A03",
  FREE_RANDOMNESS: "0x56507fceCE0d42F269BE7A52575e2e1cb5cAD212",
  FREE_PRICE_ORACLE: "0x28FCF71EBEAc23Ba02c86aF69f289425db56e049",
  

  
  // Chainlink VRF
  CHAINLINK_VRF: "0xefAe49039ADB963b1183869D1632D4CbC8F0603b",
  
  // Fee Abstraction
  PIZZA_PARTY_FEE_ABSTRACTION: "0x90841F5204af9ebB28eF2788189d39ab2c46B7ad"
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
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base'
  ],
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

// PizzaPartyCore contract ABI (complete with topping system)
export const PIZZA_PARTY_CORE_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vmfToken", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause", 
    "type": "error"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"indexed": false, "internalType": "address[]", "name": "winners", "type": "address[]"},
      {"indexed": false, "internalType": "uint256", "name": "jackpot", "type": "uint256"}
    ],
    "name": "DailyWinnersSelected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "dailyJackpot", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "weeklyJackpot", "type": "uint256"}
    ],
    "name": "JackpotUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "blacklisted", "type": "bool"}
    ],
    "name": "PlayerBlacklisted",
    "type": "event"
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
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "referrer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "referred", "type": "address"}
    ],
    "name": "ReferralRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "account", "type": "address"}
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"indexed": false, "internalType": "address[]", "name": "winners", "type": "address[]"},
      {"indexed": false, "internalType": "uint256", "name": "jackpot", "type": "uint256"}
    ],
    "name": "WeeklyWinnersSelected",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "addToDailyJackpot",
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
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "dailyPlayerCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "dailyPlayers",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "pause", "type": "bool"}],
    "name": "emergencyPause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "referrer", "type": "address"}],
    "name": "enterDailyGame",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "getMinimumVMFRequired",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerInfo",
    "outputs": [{"components": [{"internalType": "uint256", "name": "totalToppings", "type": "uint256"}, {"internalType": "uint256", "name": "dailyEntries", "type": "uint256"}, {"internalType": "uint256", "name": "weeklyEntries", "type": "uint256"}, {"internalType": "uint256", "name": "lastEntryTime", "type": "uint256"}, {"internalType": "uint256", "name": "vmfBalance", "type": "uint256"}, {"internalType": "uint256", "name": "lastVmfBalanceCheck", "type": "uint256"}, {"internalType": "uint256", "name": "referrals", "type": "uint256"}, {"internalType": "bool", "name": "isBlacklisted", "type": "bool"}], "internalType": "struct PizzaPartyCore.Player", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerReferralInfo",
    "outputs": [{"internalType": "uint256", "name": "referrals", "type": "uint256"}, {"internalType": "address", "name": "referrer", "type": "address"}],
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
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerVMFBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalToppingsClaimed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWeeklyJackpot",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWeeklyToppingsPool",
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
    "outputs": [{"internalType": "bool", "name": "ready", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isWeeklyDrawReady",
    "outputs": [{"internalType": "bool", "name": "ready", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastDailyDraw",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastWeeklyDraw",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "uint256", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "players",
    "outputs": [{"internalType": "uint256", "name": "totalToppings", "type": "uint256"}, {"internalType": "uint256", "name": "dailyEntries", "type": "uint256"}, {"internalType": "uint256", "name": "weeklyEntries", "type": "uint256"}, {"internalType": "uint256", "name": "lastEntryTime", "type": "uint256"}, {"internalType": "uint256", "name": "vmfBalance", "type": "uint256"}, {"internalType": "uint256", "name": "lastVmfBalanceCheck", "type": "uint256"}, {"internalType": "uint256", "name": "referrals", "type": "uint256"}, {"internalType": "bool", "name": "isBlacklisted", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "referralCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "referrers",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}, {"internalType": "bool", "name": "blacklisted", "type": "bool"}],
    "name": "setPlayerBlacklist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalToppingsClaimed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vmfToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "weeklyToppingsPool",
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
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "weeklyPlayers",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];











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