# Mobile Wallet Connection Testing Guide

## Overview
This guide helps you test the mobile wallet connection functionality for Pizza Party on both mobile and desktop devices.

## Testing Checklist

### Desktop Browser Testing
- [ ] **Chrome** - Test with MetaMask extension
- [ ] **Firefox** - Test with MetaMask extension  
- [ ] **Safari** - Test with WalletConnect QR codes
- [ ] **Edge** - Test with MetaMask extension

### Mobile Browser Testing
- [ ] **iOS Safari** - Test QR code connections
- [ ] **iOS Chrome** - Test QR code connections
- [ ] **Android Chrome** - Test QR code connections
- [ ] **Android Firefox** - Test QR code connections

### Wallet Types Testing
- [ ] **MetaMask** - Desktop extension + Mobile app
- [ ] **Coinbase Wallet** - Desktop extension + Mobile app
- [ ] **Trust Wallet** - Mobile app only
- [ ] **Rainbow Wallet** - Mobile app only
- [ ] **Phantom** - Desktop extension + Mobile app

### Connection Methods Testing
- [ ] **QR Code** - Mobile wallet scanning
- [ ] **Deep Links** - Direct app opening
- [ ] **Browser Extension** - Desktop wallet detection
- [ ] **WalletConnect** - Universal QR code

### Error Scenarios Testing
- [ ] **No Wallet Installed** - Proper error message
- [ ] **User Rejects Connection** - Proper handling
- [ ] **Network Issues** - Fallback behavior
- [ ] **Wrong Network** - Chain switching
- [ ] **Mobile Browser Limitations** - Graceful degradation

## Step-by-Step Testing Process

### 1. Desktop Testing
1. Open Pizza Party website on desktop browser
2. Click "Connect Wallet" button
3. Select wallet from dropdown
4. Approve connection in wallet extension
5. Verify wallet address displays correctly
6. Test disconnecting and reconnecting

### 2. Mobile Testing
1. Open Pizza Party website on mobile browser
2. Click "Connect Wallet" button
3. Scan QR code with mobile wallet app
4. Approve connection in wallet app
5. Verify wallet address displays correctly
6. Test disconnecting and reconnecting

### 3. QR Code Testing
1. Ensure QR code is clearly visible
2. Test with different mobile wallets
3. Verify QR code updates if connection fails
4. Test QR code timeout behavior

### 4. Error Handling Testing
1. Try connecting without wallet installed
2. Reject connection in wallet
3. Test with poor network connection
4. Switch networks in wallet
5. Test with unsupported wallets

## Expected Behaviors

### Desktop
- Wallet extension popup appears
- Connection is established quickly
- Wallet address displays in UI
- Disconnect button works properly

### Mobile
- QR code appears clearly
- Mobile wallet app opens via deep link
- Connection establishes after approval
- Wallet address displays correctly
- Disconnect functionality works

### Error Messages
- Clear, user-friendly error messages
- Specific guidance for mobile vs desktop
- Suggestions for wallet installation
- Network error handling

## Troubleshooting

### Common Issues
1. **QR Code Not Scanning**
   - Ensure good lighting
   - Check wallet app is updated
   - Try different mobile wallet

2. **Connection Fails**
   - Check network connection
   - Verify wallet is on correct network
   - Try refreshing the page

3. **Wallet Not Detected**
   - Install wallet extension/app
   - Enable wallet in browser
   - Check wallet permissions

### Debug Information
- Check browser console for errors
- Verify WalletConnect project ID
- Test with different browsers
- Check mobile device compatibility

## Success Criteria
- [ ] All major wallets connect successfully
- [ ] Mobile QR codes work reliably
- [ ] Error messages are helpful
- [ ] Connection persists across page reloads
- [ ] Disconnect functionality works
- [ ] Network switching works properly 