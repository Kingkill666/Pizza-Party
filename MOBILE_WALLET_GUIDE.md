# 📱 Mobile Wallet Connection Guide

## Supported Wallets

### MetaMask Mobile
- **App Store**: [MetaMask for iOS](https://apps.apple.com/app/metamask/id1438144202)
- **Play Store**: [MetaMask for Android](https://play.google.com/store/apps/details?id=io.metamask)
- **Deep Link**: `metamask://`
- **Universal Link**: `https://metamask.app.link/`

### Coinbase Wallet
- **App Store**: [Coinbase Wallet for iOS](https://apps.apple.com/app/coinbase-wallet/id1278383455)
- **Play Store**: [Coinbase Wallet for Android](https://play.google.com/store/apps/details?id=org.toshi)
- **Deep Link**: `coinbasewallet://`
- **Universal Link**: `https://wallet.coinbase.com/`

### Trust Wallet
- **App Store**: [Trust Wallet for iOS](https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409)
- **Play Store**: [Trust Wallet for Android](https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp)
- **Deep Link**: `trust://`
- **Universal Link**: `https://link.trustwallet.com/`

### Rainbow
- **App Store**: [Rainbow for iOS](https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021)
- **Play Store**: [Rainbow for Android](https://play.google.com/store/apps/details?id=me.rainbow)
- **Deep Link**: `rainbow://`
- **Universal Link**: `https://rnbwapp.com/`

### Phantom
- **App Store**: [Phantom for iOS](https://apps.apple.com/app/phantom-crypto-wallet/id1598432977)
- **Play Store**: [Phantom for Android](https://play.google.com/store/apps/details?id=app.phantom)
- **Deep Link**: `phantom://`
- **Universal Link**: `https://phantom.app/ul/`

## Connection Methods

### Method 1: Direct App Connection
1. **Open your wallet app** (MetaMask, Coinbase, etc.)
2. **Navigate to the browser/dApp section**
3. **Enter the Pizza Party URL**: `https://your-domain.com`
4. **Try connecting** using the wallet's built-in browser

### Method 2: Deep Link Connection
1. **Click "Connect Wallet"** on Pizza Party
2. **Select your wallet** from the list
3. **Allow the deep link** to open your wallet app
4. **Approve the connection** in your wallet

### Method 3: Manual URL Entry
1. **Copy the Pizza Party URL**
2. **Open your wallet app**
3. **Go to browser/dApp section**
4. **Paste the URL and visit**
5. **Try connecting again**

## Troubleshooting Common Issues

### "No Web3 wallet detected"
**Solution:**
1. Make sure you have the wallet app installed
2. Try opening the site directly in your wallet's browser
3. Check if you're using the correct wallet app

### "Connection rejected"
**Solution:**
1. Check your wallet app for pending connection requests
2. Approve the connection in your wallet
3. Try refreshing the page and connecting again

### "Base network not found"
**Solution:**
1. Add Base Mainnet network to your wallet:
   - **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
2. Switch to Base Mainnet network in your wallet
3. Try connecting again

### "Connection request pending"
**Solution:**
1. Check your wallet app for pending requests
2. Approve or reject the pending connection
3. Wait a few seconds and try again

### "App not found"
**Solution:**
1. Install the wallet app from your device's app store
2. Make sure you're using the official app
3. Try the manual URL entry method

## Network Configuration

### Base Mainnet (Production)
```json
{
  "chainId": "0x14A34",
  "chainName": "Base",
  "nativeCurrency": {
    "name": "Ethereum",
    "symbol": "ETH",
    "decimals": 18
  },
  "rpcUrls": ["https://mainnet.base.org"],
"blockExplorerUrls": ["https://basescan.org"]
}
```

### Base Mainnet (Production)
```json
{
  "chainId": "0x2105",
  "chainName": "Base",
  "nativeCurrency": {
    "name": "Ethereum", 
    "symbol": "ETH",
    "decimals": 18
  },
  "rpcUrls": ["https://mainnet.base.org"],
  "blockExplorerUrls": ["https://basescan.org"]
}
```

## Security Best Practices

### Wallet Security
1. **Use official apps only** - Download from official app stores
2. **Keep apps updated** - Regular updates include security patches
3. **Enable biometric security** - Use fingerprint/face ID when available
4. **Backup your wallet** - Write down recovery phrases securely

### Connection Security
1. **Verify the website** - Check the URL is correct
2. **Review permissions** - Only approve necessary connections
3. **Disconnect when done** - Clear connections after use
4. **Monitor transactions** - Check for unexpected activity

### Network Security
1. **Verify network details** - Double-check chain ID and RPC URL
2. **Use official RPC endpoints** - Avoid third-party RPC providers
3. **Test with small amounts** - Start with small transactions
4. **Keep private keys secure** - Never share recovery phrases

## Getting Testnet ETH

### Base Mainnet
Base Mainnet uses real ETH and VMF tokens. No faucet needed.

### How to Get Testnet ETH
1. **Visit a faucet** from the list above
2. **Connect your wallet** to the faucet
3. **Request testnet ETH** (usually 0.1-0.5 ETH)
4. **Wait for confirmation** (usually 1-5 minutes)
5. **Check your wallet** for the received ETH

## Performance Tips

### Optimize Connection Speed
1. **Use stable internet** - Avoid public WiFi for transactions
2. **Close other apps** - Free up device memory
3. **Update wallet app** - Latest versions are faster
4. **Clear cache** - Remove old data periodically

### Reduce Gas Costs
1. **Choose optimal times** - Gas prices vary throughout the day
2. **Use gas estimation** - Let wallet estimate optimal gas
3. **Batch transactions** - Combine multiple actions when possible
4. **Monitor gas prices** - Wait for lower gas periods

## Support and Resources

### Official Documentation
- **Pizza Party Docs**: [GitHub Repository](https://github.com/Kingkill666/Pizza-Party)
- **Base Network**: [Base Documentation](https://docs.base.org/)
- **Wallet Guides**: [MetaMask](https://metamask.io/learn/), [Coinbase](https://help.coinbase.com/)

### Community Support
- **Discord**: Join our community for help
- **GitHub Issues**: Report bugs and request features
- **Twitter**: Follow for updates and announcements

### Emergency Contacts
- **Security Issues**: Report to security@pizzaparty.com
- **Technical Support**: support@pizzaparty.com
- **Bug Reports**: Create GitHub issue

## Advanced Features

### Multi-Wallet Support
- **Multiple wallets** can be used on the same device
- **Switch between wallets** without disconnecting
- **Import/export accounts** between wallet apps
- **Hardware wallet integration** for enhanced security

### Mobile-Specific Features
- **Touch-optimized UI** for mobile devices
- **Biometric authentication** for wallet access
- **Push notifications** for transaction updates
- **Offline mode** for viewing wallet data

### Cross-Platform Sync
- **Cloud backup** for wallet data
- **Multi-device sync** for account access
- **Recovery options** for lost devices
- **Migration tools** between wallet apps 