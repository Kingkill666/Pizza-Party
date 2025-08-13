# 🔑 BaseScan API Key Setup Guide

## 📋 Why You Need a BaseScan API Key

To verify your smart contracts on BaseScan (the Base mainnet block explorer), you need a valid API key. This allows people to:
- ✅ Read your contract source code
- ✅ Interact with your contracts directly from BaseScan
- ✅ View contract ABI and functions
- ✅ Verify contract security and transparency

## 🚀 How to Get Your BaseScan API Key

### Step 1: Visit BaseScan
1. Go to [BaseScan.org](https://basescan.org)
2. Click on your wallet address in the top right (or connect wallet)
3. If you don't have an account, create one

### Step 2: Access API Keys
1. Click on your profile/account
2. Look for "API Keys" or "Developer" section
3. Click "Create API Key"

### Step 3: Create API Key
1. Give your API key a name (e.g., "Pizza Party Contracts")
2. Select the appropriate permissions (read access is usually sufficient)
3. Click "Create"
4. **Copy the API key** - you'll need this for verification

## 🔧 Setting Up the API Key

### Option 1: Environment Variable (Recommended)
Add this to your `.env` file:
```bash
BASESCAN_API_KEY=your_api_key_here
```

### Option 2: Direct in Hardhat Config
Update your `hardhat.config.ts`:
```typescript
etherscan: {
  apiKey: {
    base: "your_api_key_here", // Replace with your actual API key
  },
  // ... rest of config
}
```

## 🎯 Alternative: Manual Verification

If you prefer to verify contracts manually:

### Step 1: Visit Each Contract
Go to each contract address on BaseScan and click "Contract" tab

### Step 2: Click "Verify and Publish"
1. Click "Verify and Publish" button
2. Select "Solidity (Single file)" or "Solidity (Standard-Json-Input)"
3. Enter your contract details

### Step 3: Upload Source Code
1. Copy your contract source code
2. Paste it into the verification form
3. Enter constructor arguments
4. Submit for verification

## 📋 Manual Verification Details

Here are the constructor arguments for each contract:

### 🍕 Core Contracts
- **PizzaPartyCore**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5"]`

### 🔗 Advanced Modular Contracts
- **PizzaPartyReferral**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5"]`
- **PizzaPartyDynamicPricing**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5", "0xAA43fE819C0103fE820c04259929b3f344AfBfa3"]`
- **PizzaPartyLoyalty**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5"]`
- **PizzaPartyAdvancedRandomness**: `[]` (no arguments)
- **PizzaPartyAnalytics**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5"]`
- **PizzaPartyWeeklyChallenges**: `["0x2213414893259b0C48066Acd1763e7fbA97859E5"]`

### 🔧 Legacy/Support Contracts
- **FreeRandomness**: `[]` (no arguments)
- **FreePriceOracle**: `[]` (no arguments)
- **UniswapPriceOracle**: `[]` (no arguments)
- **SecureReferralSystem**: `["0xF64dF5C5c399c051210f02309A6cB12cB7797e88"]`
- **ChainlinkVRF**: `["0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed", "1", "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", "2500000", "3", "1"]`
- **MockVMF**: `[]` (no arguments)

## 🔗 Contract Addresses for Manual Verification

### 🍕 Core Contracts
- **PizzaPartyCore**: https://basescan.org/address/0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460

### 🔗 Advanced Modular Contracts
- **PizzaPartyReferral**: https://basescan.org/address/0xb976e0400e88f78AA85029D138fFD11A65de9CE8
- **PizzaPartyDynamicPricing**: https://basescan.org/address/0x0F5a91907039eecebEA78ad2d327C7521d4F7892
- **PizzaPartyLoyalty**: https://basescan.org/address/0xC8a44e0587f7BeDa623b75DF5415E85Bf1163ac7
- **PizzaPartyAdvancedRandomness**: https://basescan.org/address/0xCcF33C77A65849e19Df6e66A9daEBC112D5BDBCE
- **PizzaPartyAnalytics**: https://basescan.org/address/0xf32156203A70Bbf1e3db6C664F3F7eA8310a8841
- **PizzaPartyWeeklyChallenges**: https://basescan.org/address/0x87fee21FB855Ae44600B79b38709E4587f5b60CF

### 🔧 Legacy/Support Contracts
- **FreeRandomness**: https://basescan.org/address/0xF64dF5C5c399c051210f02309A6cB12cB7797e88
- **FreePriceOracle**: https://basescan.org/address/0xAA43fE819C0103fE820c04259929b3f344AfBfa3
- **UniswapPriceOracle**: https://basescan.org/address/0xA5deaebA77225546dE3C363F695319356E33B7D6
- **SecureReferralSystem**: https://basescan.org/address/0xDfFa13C23786ecf2Fc681e74e351b05c9C33f367
- **ChainlinkVRF**: https://basescan.org/address/0xefAe49039ADB963b1183869D1632D4CbC8F0603b
- **MockVMF**: https://basescan.org/address/0x8349a17aa324628C5018fDF8aE24399Bb5EA7D8C

## ⚠️ Important Notes

1. **API Key Security**: Never commit your API key to version control
2. **Rate Limits**: BaseScan has rate limits, so verification may take time
3. **Constructor Arguments**: Make sure to use the exact format shown above
4. **Compiler Version**: Use Solidity 0.8.24 for all contracts
5. **Optimization**: Use optimizer with 1 run for smaller contracts

## 🎯 Next Steps

1. Get your BaseScan API key
2. Add it to your `.env` file
3. Run the verification script again: `npx hardhat run scripts/verify-all-contracts.js --network base`

Or manually verify each contract using the links and details above.
