export const handleWalletError = (error: any) => {
  console.error('Wallet connection error:', {
    message: error.message,
    type: error.name,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    timestamp: new Date().toISOString()
  })

  // Show user-friendly error message
  const errorMessage = error.message.includes('User rejected')
    ? 'Connection cancelled'
    : error.message.includes('No wallet found')
    ? 'No wallet detected. Please install a wallet extension or use a mobile wallet.'
    : error.message.includes('Network')
    ? 'Network error. Please check your connection and try again.'
    : 'Failed to connect wallet. Please try again.'

  return errorMessage
}

export const handleMobileWalletError = (error: any) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    if (error.message.includes('User rejected')) {
      return 'Connection cancelled by user'
    }
    if (error.message.includes('No wallet found')) {
      return 'No mobile wallet detected. Please install MetaMask, Coinbase Wallet, or another mobile wallet app.'
    }
    if (error.message.includes('QR')) {
      return 'QR code connection failed. Please try scanning again or use a different wallet.'
    }
    return 'Mobile wallet connection failed. Please try again or use a different wallet app.'
  }
  
  return handleWalletError(error)
} 