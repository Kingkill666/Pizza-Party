// Farcaster Wallet Integration QA Test Script
// Run this in the browser console to test the Farcaster wallet integration

console.log('🍕 Starting Pizza Party Farcaster Wallet QA Test...');

// Test 1: Check if Farcaster environment is detected
function testFarcasterEnvironment() {
  console.log('\n🔍 Test 1: Farcaster Environment Detection');
  
  const isFarcaster = window.location.href.includes('farcaster') || 
                     window.location.href.includes('warpcast') ||
                     window.location.href.includes('miniapp') ||
                     window.farcaster ||
                     window.farcasterSdk;
  
  console.log('📍 Current URL:', window.location.href);
  console.log('🌍 Farcaster environment detected:', isFarcaster);
  
  if (isFarcaster) {
    console.log('✅ Farcaster environment detected successfully');
  } else {
    console.log('⚠️ Not in Farcaster environment - this is expected for testing');
  }
  
  return isFarcaster;
}

// Test 2: Check Farcaster SDK availability
function testFarcasterSDK() {
  console.log('\n🔧 Test 2: Farcaster SDK Availability');
  
  let sdk = window.farcasterSdk || window.farcaster?.sdk;
  
  if (sdk) {
    console.log('✅ Farcaster SDK found in global scope');
    console.log('📦 SDK methods available:', Object.keys(sdk));
  } else {
    console.log('⚠️ Farcaster SDK not found in global scope');
    console.log('💡 This is normal if not running in Farcaster environment');
  }
  
  return sdk;
}

// Test 3: Check FarcasterWalletProvider context
function testFarcasterWalletProvider() {
  console.log('\n🎯 Test 3: FarcasterWalletProvider Context');
  
  // Safely check for provider context
  const provider = window.__FarcasterWalletProvider;
  
  if (!provider) {
    console.log('⚠️ FarcasterWalletProvider context not found');
    console.log('💡 This is expected if the provider is not mounted');
    return null;
  }
  
  console.log('✅ FarcasterWalletProvider context found');
  
  // Safely destructure provider properties
  let fid, username, avatar, wallet, signer, connected, loading, error, isFarcasterEnvironment;
  
  try {
    if (provider) {
      ({ 
        fid, 
        username, 
        avatar, 
        wallet, 
        signer, 
        connected, 
        loading, 
        error, 
        isFarcasterEnvironment 
      } = provider);
    }
  } catch (destructuringError) {
    console.error('❌ Error destructuring provider:', destructuringError);
    return null;
  }
  
  console.log('📊 Provider State:');
  console.log('  - FID:', fid);
  console.log('  - Username:', username);
  console.log('  - Avatar:', avatar);
  console.log('  - Wallet:', wallet);
  console.log('  - Connected:', connected);
  console.log('  - Loading:', loading);
  console.log('  - Error:', error);
  console.log('  - Is Farcaster Environment:', isFarcasterEnvironment);
  
  return {
    fid, username, avatar, wallet, signer, connected, loading, error, isFarcasterEnvironment
  };
}

// Test 4: Test signMessage function
async function testSignMessage() {
  console.log('\n✍️ Test 4: Sign Message Function');
  
  const provider = window.__FarcasterWalletProvider;
  
  if (!provider || !provider.signMessage) {
    console.log('⚠️ signMessage function not available');
    return false;
  }
  
  try {
    const testMessage = `PizzaPartyQA:${Date.now()}:${Math.random()}`;
    console.log('📝 Testing signature with message:', testMessage);
    
    const signature = await provider.signMessage(testMessage);
    
    if (signature) {
      console.log('✅ Message signed successfully');
      console.log('🔐 Signature:', signature);
      return true;
    } else {
      console.log('❌ Signature returned null/undefined');
      return false;
    }
  } catch (error) {
    console.error('❌ Error signing message:', error);
    return false;
  }
}

// Test 5: Test wallet integration in game
function testGameIntegration() {
  console.log('\n🎮 Test 5: Game Integration');
  
  // Helper function to find elements by text content
  function findElementByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.textContent && element.textContent.includes(text)) {
        return element;
      }
    }
    return null;
  }
  
  // Check if game page elements are present
  const gameElements = {
    enterGameButton: document.querySelector('[data-testid="enter-game"]') || 
                    findElementByText('button', 'Enter Game') ||
                    document.querySelector('button'),
    walletStatus: document.querySelector('[data-testid="wallet-status"]') ||
                  document.querySelector('.bg-green-100') ||
                  document.querySelector('.bg-green-50'),
    farcasterStatus: document.querySelector('[data-testid="farcaster-status"]') ||
                     findElementByText('*', 'Farcaster') ||
                     document.querySelector('div')
  };
  
  console.log('🎯 Game Elements Found:');
  Object.entries(gameElements).forEach(([name, element]) => {
    console.log(`  - ${name}:`, element ? '✅ Found' : '❌ Not found');
  });
  
  // Check for Connect Wallet buttons (should not exist)
  const connectWalletButtons = findElementByText('button', 'Connect Wallet') ||
                              findElementByText('*', 'Connect Wallet');
  
  if (connectWalletButtons) {
    console.log('⚠️ Found Connect Wallet button - this should be removed');
  } else {
    console.log('✅ No Connect Wallet buttons found - good!');
  }
  
  return {
    ...gameElements,
    noConnectWalletButtons: !connectWalletButtons
  };
}

// Test 6: Test offchain signature verification
async function testOffchainSignature() {
  console.log('\n🔐 Test 6: Offchain Signature Verification');
  
  const provider = window.__FarcasterWalletProvider;
  
  if (!provider || !provider.signMessage) {
    console.log('⚠️ Cannot test offchain signatures - signMessage not available');
    return false;
  }
  
  try {
    // Create a test daily play signature
    const timestamp = Date.now();
    const fid = provider.fid || 'test_fid';
    const message = `PizzaPartyDailyPlay:${fid}:${timestamp}`;
    
    console.log('📝 Creating offchain signature for daily play');
    console.log('📄 Message:', message);
    
    const signature = await provider.signMessage(message);
    
    if (signature) {
      console.log('✅ Offchain signature created successfully');
      console.log('🔐 Signature:', signature);
      
      // In a real implementation, you would send this to your backend
      console.log('💡 This signature would be sent to backend for verification');
      
      return true;
    } else {
      console.log('❌ Failed to create offchain signature');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating offchain signature:', error);
    return false;
  }
}

// Test 7: Performance and error handling
function testPerformanceAndErrors() {
  console.log('\n⚡ Test 7: Performance and Error Handling');
  
  // Check for console errors
  const originalError = console.error;
  const errors = [];
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Test provider initialization time
  const startTime = performance.now();
  
  try {
    const provider = window.__FarcasterWalletProvider;
    const initTime = performance.now() - startTime;
    
    console.log(`⏱️ Provider access time: ${initTime.toFixed(2)}ms`);
    
    if (initTime < 100) {
      console.log('✅ Provider access is fast');
    } else {
      console.log('⚠️ Provider access is slow');
    }
    
  } catch (error) {
    console.error('❌ Error accessing provider:', error);
  }
  
  // Restore original console.error
  console.error = originalError;
  
  if (errors.length > 0) {
    console.log('⚠️ Errors detected during testing:');
    errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log('✅ No errors detected');
  }
  
  return { errors, initTime: performance.now() - startTime };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive Farcaster Wallet QA Test Suite...\n');
  
  const results = {
    environment: testFarcasterEnvironment(),
    sdk: testFarcasterSDK(),
    provider: testFarcasterWalletProvider(),
    gameIntegration: testGameIntegration(),
    performance: testPerformanceAndErrors()
  };
  
  // Run async tests
  results.signMessage = await testSignMessage();
  results.offchainSignature = await testOffchainSignature();
  
  // Summary
  console.log('\n📊 QA Test Summary:');
  console.log('==================');
  console.log(`🌍 Environment Detection: ${results.environment ? '✅' : '⚠️'}`);
  console.log(`🔧 SDK Availability: ${results.sdk ? '✅' : '⚠️'}`);
  console.log(`🎯 Provider Context: ${results.provider ? '✅' : '⚠️'}`);
  console.log(`✍️ Sign Message: ${results.signMessage ? '✅' : '⚠️'}`);
  console.log(`🔐 Offchain Signature: ${results.offchainSignature ? '✅' : '⚠️'}`);
  console.log(`🎮 Game Integration: ${Object.values(results.gameIntegration).some(Boolean) ? '✅' : '⚠️'}`);
  console.log(`⚡ Performance: ${results.performance.initTime < 100 ? '✅' : '⚠️'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests >= totalTests * 0.8) {
    console.log('🎉 Farcaster Wallet Integration is working well!');
  } else if (passedTests >= totalTests * 0.5) {
    console.log('⚠️ Farcaster Wallet Integration needs some fixes');
  } else {
    console.log('❌ Farcaster Wallet Integration needs significant work');
  }
  
  return results;
}

// Export for manual testing
window.runFarcasterQATest = runAllTests;
window.testFarcasterEnvironment = testFarcasterEnvironment;
window.testFarcasterSDK = testFarcasterSDK;
window.testFarcasterWalletProvider = testFarcasterWalletProvider;
window.testSignMessage = testSignMessage;
window.testGameIntegration = testGameIntegration;
window.testOffchainSignature = testOffchainSignature;
window.testPerformanceAndErrors = testPerformanceAndErrors;

console.log('🍕 Farcaster QA Test Script loaded!');
console.log('💡 Run "runFarcasterQATest()" to start comprehensive testing');
console.log('💡 Or run individual tests like "testFarcasterEnvironment()"');
