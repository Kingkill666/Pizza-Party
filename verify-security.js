#!/usr/bin/env node

/**
 * Security Verification Script
 * 
 * This script performs automated security checks on the Pizza Party dApp
 * to ensure all security features are properly implemented and functioning.
 */

const fs = require('fs');
const path = require('path');

// Security check results
const securityChecks = {
  smartContract: {},
  frontend: {},
  configuration: {},
  dependencies: {}
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Smart Contract Security Checks
 */
function checkSmartContractSecurity() {
  logInfo('Checking Smart Contract Security...');
  
  const contractPath = path.join(__dirname, 'contracts', 'PizzaParty.sol');
  
  if (!fs.existsSync(contractPath)) {
    logError('PizzaParty.sol contract not found');
    return false;
  }
  
  const contractContent = fs.readFileSync(contractPath, 'utf8');
  
  // Check for ReentrancyGuard
  if (contractContent.includes('ReentrancyGuard')) {
    logSuccess('ReentrancyGuard protection found');
    securityChecks.smartContract.reentrancyGuard = true;
  } else {
    logError('ReentrancyGuard protection missing');
    securityChecks.smartContract.reentrancyGuard = false;
  }
  
  // Check for Ownable
  if (contractContent.includes('Ownable')) {
    logSuccess('Ownable access control found');
    securityChecks.smartContract.ownable = true;
  } else {
    logError('Ownable access control missing');
    securityChecks.smartContract.ownable = false;
  }
  
  // Check for Pausable
  if (contractContent.includes('Pausable')) {
    logSuccess('Pausable emergency controls found');
    securityChecks.smartContract.pausable = true;
  } else {
    logError('Pausable emergency controls missing');
    securityChecks.smartContract.pausable = false;
  }
  
  // Check for input validation
  if (contractContent.includes('require(') || contractContent.includes('revert')) {
    logSuccess('Input validation found');
    securityChecks.smartContract.inputValidation = true;
  } else {
    logWarning('Input validation may be insufficient');
    securityChecks.smartContract.inputValidation = false;
  }
  
  // Check for blacklist functionality
  if (contractContent.includes('blacklist') || contractContent.includes('Blacklisted')) {
    logSuccess('Blacklist functionality found');
    securityChecks.smartContract.blacklist = true;
  } else {
    logWarning('Blacklist functionality not found');
    securityChecks.smartContract.blacklist = false;
  }
  
  // Check for emergency withdrawal
  if (contractContent.includes('emergencyWithdraw')) {
    logSuccess('Emergency withdrawal function found');
    securityChecks.smartContract.emergencyWithdraw = true;
  } else {
    logError('Emergency withdrawal function missing');
    securityChecks.smartContract.emergencyWithdraw = false;
  }
  
  return true;
}

/**
 * Frontend Security Checks
 */
function checkFrontendSecurity() {
  logInfo('Checking Frontend Security...');
  
  // Check for on-chain data usage
  const jackpotDataPath = path.join(__dirname, 'lib', 'jackpot-data.ts');
  
  if (fs.existsSync(jackpotDataPath)) {
    const jackpotContent = fs.readFileSync(jackpotDataPath, 'utf8');
    
    if (jackpotContent.includes('localStorage') && jackpotContent.includes('calculateCommunityJackpot')) {
      logSuccess('On-chain jackpot calculations found');
      securityChecks.frontend.onChainData = true;
    } else {
      logWarning('May be using off-chain calculations');
      securityChecks.frontend.onChainData = false;
    }
  }
  
  // Check for input sanitization
  const gamePagePath = path.join(__dirname, 'app', 'game', 'page.tsx');
  
  if (fs.existsSync(gamePagePath)) {
    const gameContent = fs.readFileSync(gamePagePath, 'utf8');
    
    if (gameContent.includes('validation') || gameContent.includes('sanitize')) {
      logSuccess('Input validation/sanitization found');
      securityChecks.frontend.inputValidation = true;
    } else {
      logWarning('Input validation may be insufficient');
      securityChecks.frontend.inputValidation = false;
    }
  }
  
  // Check for wallet security
  const walletConfigPath = path.join(__dirname, 'lib', 'wallet-config.ts');
  
  if (fs.existsSync(walletConfigPath)) {
    const walletContent = fs.readFileSync(walletConfigPath, 'utf8');
    
    if (walletContent.includes('WALLETS') && walletContent.includes('isMobile')) {
      logSuccess('Multi-wallet security configuration found');
      securityChecks.frontend.walletSecurity = true;
    } else {
      logWarning('Wallet security configuration may be incomplete');
      securityChecks.frontend.walletSecurity = false;
    }
  }
  
  return true;
}

/**
 * Configuration Security Checks
 */
function checkConfigurationSecurity() {
  logInfo('Checking Configuration Security...');
  
  // Check for environment variables
  const envExamplePath = path.join(__dirname, 'env.example');
  
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    if (envContent.includes('PRIVATE_KEY') && envContent.includes('BASESCAN_API_KEY')) {
      logSuccess('Environment configuration template found');
      securityChecks.configuration.envTemplate = true;
    } else {
      logWarning('Environment configuration may be incomplete');
      securityChecks.configuration.envTemplate = false;
    }
  }
  
  // Check for Hardhat configuration
  const hardhatConfigPath = path.join(__dirname, 'hardhat.config.ts');
  
  if (fs.existsSync(hardhatConfigPath)) {
    const hardhatContent = fs.readFileSync(hardhatConfigPath, 'utf8');
    
    if (hardhatContent.includes('base') && hardhatContent.includes('baseSepolia')) {
      logSuccess('Network configuration found');
      securityChecks.configuration.networkConfig = true;
    } else {
      logWarning('Network configuration may be incomplete');
      securityChecks.configuration.networkConfig = false;
    }
  }
  
  return true;
}

/**
 * Dependency Security Checks
 */
function checkDependencySecurity() {
  logInfo('Checking Dependency Security...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for security-related dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies['@openzeppelin/contracts']) {
      logSuccess('OpenZeppelin contracts found');
      securityChecks.dependencies.openzeppelin = true;
    } else {
      logError('OpenZeppelin contracts missing');
      securityChecks.dependencies.openzeppelin = false;
    }
    
    if (dependencies['hardhat']) {
      logSuccess('Hardhat development framework found');
      securityChecks.dependencies.hardhat = true;
    } else {
      logError('Hardhat development framework missing');
      securityChecks.dependencies.hardhat = false;
    }
    
    if (dependencies['@nomicfoundation/hardhat-toolbox']) {
      logSuccess('Hardhat toolbox found');
      securityChecks.dependencies.hardhatToolbox = true;
    } else {
      logWarning('Hardhat toolbox missing');
      securityChecks.dependencies.hardhatToolbox = false;
    }
  }
  
  return true;
}

/**
 * Generate Security Report
 */
function generateSecurityReport() {
  logInfo('Generating Security Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      smartContract: Object.values(securityChecks.smartContract).filter(Boolean).length,
      frontend: Object.values(securityChecks.frontend).filter(Boolean).length,
      configuration: Object.values(securityChecks.configuration).filter(Boolean).length,
      dependencies: Object.values(securityChecks.dependencies).filter(Boolean).length
    },
    details: securityChecks,
    recommendations: []
  };
  
  // Generate recommendations
  if (!securityChecks.smartContract.reentrancyGuard) {
    report.recommendations.push('Implement ReentrancyGuard protection');
  }
  
  if (!securityChecks.smartContract.ownable) {
    report.recommendations.push('Implement Ownable access control');
  }
  
  if (!securityChecks.smartContract.pausable) {
    report.recommendations.push('Implement Pausable emergency controls');
  }
  
  if (!securityChecks.smartContract.emergencyWithdraw) {
    report.recommendations.push('Implement emergency withdrawal function');
  }
  
  if (!securityChecks.dependencies.openzeppelin) {
    report.recommendations.push('Add OpenZeppelin contracts dependency');
  }
  
  // Save report
  const reportPath = path.join(__dirname, 'security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Security report saved to ${reportPath}`);
  
  return report;
}

/**
 * Display Security Summary
 */
function displaySecuritySummary() {
  logInfo('Security Check Summary:');
  
  const totalChecks = Object.values(securityChecks).flatMap(Object.values).length;
  const passedChecks = Object.values(securityChecks).flatMap(Object.values).filter(Boolean).length;
  const failedChecks = totalChecks - passedChecks;
  
  log(`Total Checks: ${totalChecks}`, 'blue');
  log(`Passed: ${passedChecks}`, 'green');
  log(`Failed: ${failedChecks}`, 'red');
  
  if (failedChecks === 0) {
    logSuccess('All security checks passed!');
  } else {
    logWarning(`${failedChecks} security issues found. Please review recommendations.`);
  }
}

/**
 * Main Security Verification Function
 */
function main() {
  log('🔒 Pizza Party Security Verification', 'blue');
  log('=====================================', 'blue');
  
  try {
    // Run all security checks
    checkSmartContractSecurity();
    checkFrontendSecurity();
    checkConfigurationSecurity();
    checkDependencySecurity();
    
    // Generate and display report
    const report = generateSecurityReport();
    displaySecuritySummary();
    
    // Exit with appropriate code
    const hasFailures = Object.values(securityChecks).some(category => 
      Object.values(category).some(check => check === false)
    );
    
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    logError(`Security verification failed: ${error.message}`);
    process.exit(1);
  }
}

// Run security verification if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkSmartContractSecurity,
  checkFrontendSecurity,
  checkConfigurationSecurity,
  checkDependencySecurity,
  generateSecurityReport,
  displaySecuritySummary
}; 