// VMF Token contract utilities - VMF is on BASE NETWORK!
export const VMF_CONTRACT_ADDRESS = "0x2213414893259b0c48066acd1763e7fba97859e5"

// Base network RPC endpoints (VMF is on Base!)
export const BASE_RPC_ENDPOINTS = [
  "https://mainnet.base.org",
  "https://base-mainnet.g.alchemy.com/v2/demo",
  "https://base.gateway.tenderly.co",
  "https://base-rpc.publicnode.com",
]

// Ethereum RPC endpoints (for comparison)
export const ETH_RPC_ENDPOINTS = [
  "https://eth-mainnet.g.alchemy.com/v2/demo",
  "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "https://cloudflare-eth.com",
  "https://rpc.ankr.com/eth",
]

// ERC-20 ABI for basic token operations
export const VMF_ABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  // symbol
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  // name
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  // totalSupply
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  // transfer
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
]

// VMF Token decimals (typically 18 for most ERC-20 tokens)
export const VMF_DECIMALS = 18

// Helper function to format VMF balance from wei to human readable
export const formatVMFBalance = (balanceWei: string): number => {
  const balance = BigInt(balanceWei)
  const divisor = BigInt(10 ** VMF_DECIMALS)
  const result = Number(balance) / Number(divisor)
  return Math.floor(result * 100) / 100 // Round to 2 decimal places
}

// Helper function to convert VMF amount to wei
export const vmfToWei = (amount: number): string => {
  const multiplier = BigInt(10 ** VMF_DECIMALS)
  const amountWei = (BigInt(Math.floor(amount * 100)) * multiplier) / BigInt(100)
  return amountWei.toString()
}

// Get VMF balance for an address
export const getVMFBalance = async (address: string, provider: any): Promise<number> => {
  try {
    // Create contract instance
    const contract = new provider.eth.Contract(VMF_ABI, VMF_CONTRACT_ADDRESS)

    // Call balanceOf function
    const balanceWei = await contract.methods.balanceOf(address).call()

    // Convert to human readable format
    return formatVMFBalance(balanceWei)
  } catch (error) {
    console.error("Error fetching VMF balance:", error)
    throw error
  }
}

// Get VMF token info
export const getVMFTokenInfo = async (provider: any) => {
  try {
    const contract = new provider.eth.Contract(VMF_ABI, VMF_CONTRACT_ADDRESS)

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
      contract.methods.totalSupply().call(),
    ])

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatVMFBalance(totalSupply),
      contractAddress: VMF_CONTRACT_ADDRESS,
    }
  } catch (error) {
    console.error("Error fetching VMF token info:", error)
    throw error
  }
}

// Transfer VMF tokens (for future use)
export const transferVMF = async (to: string, amount: number, provider: any, fromAddress: string): Promise<string> => {
  try {
    const contract = new provider.eth.Contract(VMF_ABI, VMF_CONTRACT_ADDRESS)
    const amountWei = vmfToWei(amount)

    // Estimate gas
    const gasEstimate = await contract.methods.transfer(to, amountWei).estimateGas({
      from: fromAddress,
    })

    // Send transaction
    const result = await contract.methods.transfer(to, amountWei).send({
      from: fromAddress,
      gas: gasEstimate,
    })

    return result.transactionHash
  } catch (error) {
    console.error("Error transferring VMF:", error)
    throw error
  }
}

// Check if address has minimum VMF balance
export const hasMinimumVMF = async (address: string, minimumAmount: number, provider: any): Promise<boolean> => {
  try {
    const balance = await getVMFBalance(address, provider)
    return balance >= minimumAmount
  } catch (error) {
    console.error("Error checking minimum VMF balance:", error)
    return false
  }
}

// Simulate VMF balance for demo purposes
export const simulateVMFBalance = (address: string): number => {
  // Create deterministic but varied balances based on address
  const addressHash = address.toLowerCase()
  const lastChar = addressHash.slice(-1)
  const secondLastChar = addressHash.slice(-2, -1)

  let simulatedBalance = 0

  if (lastChar >= "0" && lastChar <= "3") {
    simulatedBalance = 0 // 25% chance of having 0 VMF
  } else if (lastChar >= "4" && lastChar <= "7") {
    simulatedBalance = Math.floor(Math.random() * 10) + 1 // 1-10 VMF
  } else if (lastChar >= "8" && lastChar <= "b") {
    simulatedBalance = Math.floor(Math.random() * 100) + 10 // 10-110 VMF
  } else {
    simulatedBalance = Math.floor(Math.random() * 1000) + 100 // 100-1100 VMF
  }

  // Add some randomness based on second last character
  if (secondLastChar >= "8") {
    simulatedBalance += Math.floor(Math.random() * 50)
  }

  return simulatedBalance
}

// Direct balance reading from BASE network (where VMF actually lives!)
export const getVMFBalanceBase = async (walletAddress: string): Promise<string> => {
  console.log(`🚀 BASE NETWORK QUERY for ${walletAddress}`)
  console.log(`📄 Contract: ${VMF_CONTRACT_ADDRESS}`)

  // Clean address format
  const cleanAddress = walletAddress.toLowerCase().replace("0x", "")
  const callData = `0x70a08231000000000000000000000000${cleanAddress}`

  console.log(`📞 Call data: ${callData}`)

  // Try each Base RPC endpoint
  for (let i = 0; i < BASE_RPC_ENDPOINTS.length; i++) {
    const rpcUrl = BASE_RPC_ENDPOINTS[i]
    console.log(`🔗 Trying Base RPC ${i + 1}: ${rpcUrl}`)

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: VMF_CONTRACT_ADDRESS,
              data: callData,
            },
            "latest",
          ],
          id: Date.now(),
        }),
      })

      if (!response.ok) {
        console.log(`❌ Base RPC ${i + 1} HTTP error: ${response.status}`)
        continue
      }

      const data = await response.json()
      console.log(`📥 Base RPC ${i + 1} response:`, data)

      if (data.error) {
        console.log(`❌ Base RPC ${i + 1} error:`, data.error)
        continue
      }

      if (data.result && data.result !== "0x" && data.result !== "0x0") {
        const balanceHex = data.result
        console.log(`✅ Base RPC ${i + 1} success! Raw balance: ${balanceHex}`)

        // Convert hex to decimal
        const balanceWei = BigInt(balanceHex)
        const balanceEth = Number(balanceWei) / Math.pow(10, VMF_DECIMALS)

        console.log(`💰 Converted balance: ${balanceEth} VMF`)
        return balanceEth.toString()
      } else {
        console.log(`⚠️ Base RPC ${i + 1} returned empty result: ${data.result}`)
      }
    } catch (error) {
      console.log(`❌ Base RPC ${i + 1} failed:`, error)
      continue
    }
  }

  console.log("❌ All Base RPC endpoints failed")
  return "0"
}

// Direct balance reading from blockchain (bypasses wallet provider completely)
export const getVMFBalanceDirect = async (walletAddress: string): Promise<string> => {
  console.log(`🚀 DIRECT BLOCKCHAIN QUERY for ${walletAddress}`)
  console.log(`📄 Contract: ${VMF_CONTRACT_ADDRESS}`)

  // Clean address format
  const cleanAddress = walletAddress.toLowerCase().replace("0x", "")
  const callData = `0x70a08231000000000000000000000000${cleanAddress}`

  console.log(`📞 Call data: ${callData}`)

  // Try each RPC endpoint until one works
  for (let i = 0; i < ETH_RPC_ENDPOINTS.length; i++) {
    const rpcUrl = ETH_RPC_ENDPOINTS[i]
    console.log(`🔗 Trying RPC ${i + 1}: ${rpcUrl}`)

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: VMF_CONTRACT_ADDRESS,
              data: callData,
            },
            "latest",
          ],
          id: Date.now(),
        }),
      })

      if (!response.ok) {
        console.log(`❌ RPC ${i + 1} HTTP error: ${response.status}`)
        continue
      }

      const data = await response.json()
      console.log(`📥 RPC ${i + 1} response:`, data)

      if (data.error) {
        console.log(`❌ RPC ${i + 1} error:`, data.error)
        continue
      }

      if (data.result && data.result !== "0x" && data.result !== "0x0") {
        const balanceHex = data.result
        console.log(`✅ RPC ${i + 1} success! Raw balance: ${balanceHex}`)

        // Convert hex to decimal
        const balanceWei = BigInt(balanceHex)
        const balanceEth = Number(balanceWei) / Math.pow(10, VMF_DECIMALS)

        console.log(`💰 Converted balance: ${balanceEth} VMF`)
        return balanceEth.toString()
      } else {
        console.log(`⚠️ RPC ${i + 1} returned empty result: ${data.result}`)
      }
    } catch (error) {
      console.log(`❌ RPC ${i + 1} failed:`, error)
      continue
    }
  }

  console.log("❌ All RPC endpoints failed")
  return "0"
}

// Etherscan API backup method
export const getVMFBalanceEtherscan = async (walletAddress: string): Promise<string> => {
  try {
    console.log("🔍 Trying Etherscan API backup...")

    const apiUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${VMF_CONTRACT_ADDRESS}&address=${walletAddress}&tag=latest&apikey=YourApiKeyToken`

    const response = await fetch(apiUrl)
    const data = await response.json()

    console.log("📥 Etherscan response:", data)

    if (data.status === "1" && data.result) {
      const balanceWei = BigInt(data.result)
      const balanceEth = Number(balanceWei) / Math.pow(10, VMF_DECIMALS)
      console.log(`✅ Etherscan balance: ${balanceEth} VMF`)
      return balanceEth.toString()
    }

    return "0"
  } catch (error) {
    console.error("❌ Etherscan API failed:", error)
    return "0"
  }
}

// Simplified Web3 provider backup - removed problematic fetch
export const getVMFBalanceWeb3 = async (walletAddress: string): Promise<string> => {
  try {
    console.log("🌐 Trying Web3 provider backup...")

    // Check if we have a wallet provider available
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("🔗 Using wallet provider for balance check...")

      // Use the wallet's provider instead of external RPC
      const callData = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`

      const result = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: VMF_CONTRACT_ADDRESS,
            data: callData,
          },
          "latest",
        ],
      })

      console.log("📥 Wallet provider result:", result)

      if (result && result !== "0x" && result !== "0x0") {
        const balance = BigInt(result)
        const balanceFormatted = (Number(balance) / Math.pow(10, VMF_DECIMALS)).toString()
        console.log(`✅ Wallet provider balance: ${balanceFormatted} VMF`)
        return balanceFormatted
      }
    }

    console.log("⚠️ No wallet provider available or returned empty result")
    return "0"
  } catch (error) {
    console.error("❌ Web3 backup failed:", error)
    return "0"
  }
}

// Ultimate balance reader - tries Base network first (where VMF actually is!)
export const getVMFBalanceUltimate = async (walletAddress: string): Promise<string> => {
  console.log("🎯 === ULTIMATE VMF BALANCE READER ===")
  console.log(`📍 Target wallet: ${walletAddress}`)
  console.log(`📄 VMF contract: ${VMF_CONTRACT_ADDRESS}`)
  console.log(`🌐 VMF is on BASE NETWORK!`)

  const methods = [
    {
      name: "Base Network Query (PRIMARY)",
      fn: () => getVMFBalanceBase(walletAddress),
    },
    {
      name: "Web3 Provider Backup",
      fn: () => getVMFBalanceWeb3(walletAddress),
    },
    {
      name: "Direct Blockchain Query (Ethereum)",
      fn: () => getVMFBalanceDirect(walletAddress),
    },
    {
      name: "Etherscan API Backup",
      fn: () => getVMFBalanceEtherscan(walletAddress),
    },
  ]

  for (const method of methods) {
    try {
      console.log(`🔄 Attempting: ${method.name}`)
      const balance = await method.fn()

      if (balance && balance !== "0" && !isNaN(Number(balance)) && Number(balance) > 0) {
        console.log(`✅ ${method.name} SUCCESS: ${balance} VMF`)
        return balance
      } else {
        console.log(`⚠️ ${method.name} returned: ${balance}`)
      }
    } catch (error) {
      console.log(`❌ ${method.name} failed:`, error)
      // Continue to next method instead of throwing
      continue
    }
  }

  console.log("❌ ALL METHODS FAILED - Returning 0 for demo purposes")
  console.log("🔍 In production, this would indicate:")
  console.log("   - Wallet has no VMF tokens")
  console.log("   - Network connectivity issues")
  console.log("   - All RPC endpoints are down")

  // Return 0 instead of throwing an error
  return "0"
}

// Test function to verify your specific wallet - now with better error handling
export const testYourWallet = async (): Promise<void> => {
  console.log("🧪 === TESTING YOUR SPECIFIC WALLET ===")
  const yourWallet = "0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"

  console.log(`📍 Testing wallet: ${yourWallet}`)
  console.log(`📄 VMF contract: ${VMF_CONTRACT_ADDRESS}`)

  try {
    const balance = await getVMFBalanceUltimate(yourWallet)
    console.log(`💰 Result: ${balance} VMF`)

    if (balance !== "0") {
      console.log("✅ SUCCESS! Balance reading works!")
    } else {
      console.log("⚠️ No balance found - this could be normal if wallet has no VMF")
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error)
    console.log("🔧 This is now handled gracefully in the app")
  }
}
