// Contract addresses for Base Mainnet
export const CONTRACT_ADDRESSES = {
  PIZZA_PARTY: "0xaf32cA0c109318a36aA2e10F38611D5b64b72A03",
  FREE_RANDOMNESS: "0x56507fceCE0d42F269BE7A52575e2e1cb5cAD212",
  FREE_PRICE_ORACLE: "0x28FCF71EBEAc23Ba02c86aF69f289425db56e049",
  VMF_TOKEN: "0x2213414893259b0C48066Acd1763e7fbA97859E5"
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

// PizzaParty contract ABI (simplified for frontend use)
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
  }
] 