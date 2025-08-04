# Contributing to Pizza Party dApp

## 🍕 Welcome Contributors!

Thank you for your interest in contributing to Pizza Party dApp! This document provides guidelines for contributing to our decentralized gaming platform.

## 🎯 **DO NOT CHANGE THE UI!!!**

**IMPORTANT:** The UI is locked and should not be modified unless explicitly requested. All contributions should focus on:
- Backend functionality
- Smart contract improvements
- Security enhancements
- Documentation updates
- Testing improvements

## 📋 **Contribution Guidelines**

### **Before You Start**
1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Read the security guidelines** below
4. **Follow the coding standards**

### **Security-First Development**

#### **Smart Contract Contributions**
- ✅ **Security audit required** for all contract changes
- ✅ **Test coverage** must be 90%+ for new functions
- ✅ **Gas optimization** required for all new functions
- ✅ **Input validation** must be comprehensive
- ✅ **Access control** must be properly implemented

#### **Frontend Contributions**
- ✅ **Input sanitization** required for all user inputs
- ✅ **Wallet security** must be maintained
- ✅ **On-chain data** must be used for critical operations
- ✅ **Error handling** must be comprehensive

### **Code Standards**

#### **Solidity Standards**
```solidity
// ✅ Good: Comprehensive input validation
function enterGame(string memory referralCode) external {
    require(bytes(referralCode).length <= MAX_LENGTH, "Code too long");
    require(_isValidFormat(referralCode), "Invalid format");
    // ... rest of function
}

// ❌ Bad: Missing validation
function enterGame(string memory referralCode) external {
    // No validation
    // ... rest of function
}
```

#### **TypeScript Standards**
```typescript
// ✅ Good: Proper error handling
const handleWalletConnect = async (walletId: string) => {
  try {
    await connectWallet(walletId);
  } catch (error) {
    console.error('Wallet connection failed:', error);
    // Handle error appropriately
  }
};

// ❌ Bad: No error handling
const handleWalletConnect = async (walletId: string) => {
  await connectWallet(walletId); // No error handling
};
```

### **Testing Requirements**

#### **Smart Contract Tests**
- **Unit tests** for all new functions
- **Integration tests** for complex interactions
- **Security tests** for vulnerability checks
- **Gas tests** for optimization verification

#### **Frontend Tests**
- **Component tests** for UI components
- **Integration tests** for wallet connections
- **Security tests** for input validation
- **Performance tests** for optimization

### **Documentation Standards**

#### **Code Documentation**
```solidity
/**
 * @dev Enter the daily game with referral code
 * @param referralCode Optional referral code for rewards
 * @notice Requires sufficient VMF token balance
 * @notice Rate limited to prevent abuse
 */
function enterDailyGame(string memory referralCode) external {
    // Implementation
}
```

#### **API Documentation**
```typescript
/**
 * @api {POST} /api/game/enter Enter Daily Game
 * @apiName EnterGame
 * @apiGroup Game
 * @apiParam {string} referralCode Optional referral code
 * @apiSuccess {object} result Game entry result
 * @apiError {string} error Error message
 */
```

## 🚀 **Development Workflow**

### **1. Issue Creation**
- Use the appropriate issue template
- Provide detailed description
- Include reproduction steps
- Specify security impact

### **2. Branch Naming**
```
feature/security-enhancement
bugfix/race-condition-fix
docs/api-documentation
test/coverage-improvement
```

### **3. Commit Messages**
```
feat: add enhanced randomness generation
fix: resolve race condition in jackpot updates
docs: update API documentation
test: add security test coverage
```

### **4. Pull Request Process**
1. **Create PR** with detailed description
2. **Add security checklist** completion
3. **Include test coverage** report
4. **Request review** from security team
5. **Address feedback** promptly

## 🔐 **Security Guidelines**

### **Critical Security Rules**
1. **Never expose private keys** in code or logs
2. **Always validate inputs** from external sources
3. **Use secure randomness** for critical operations
4. **Implement proper access control** for admin functions
5. **Test for common vulnerabilities** (reentrancy, overflow, etc.)

### **Security Checklist**
- [ ] Input validation implemented
- [ ] Access control verified
- [ ] Gas optimization checked
- [ ] Reentrancy protection confirmed
- [ ] State consistency maintained
- [ ] Error handling comprehensive
- [ ] Security tests added
- [ ] Documentation updated

## 📊 **Quality Standards**

### **Code Quality**
- **Linting** must pass
- **Type checking** must pass
- **Test coverage** must be 90%+
- **Documentation** must be comprehensive

### **Security Quality**
- **Vulnerability scan** must pass
- **Security audit** required for major changes
- **Gas optimization** verified
- **Access control** properly implemented

### **Performance Quality**
- **Gas usage** optimized
- **Response time** acceptable
- **Memory usage** efficient
- **Scalability** considered

## 🎯 **Community Goals**

### **GitHub Engagement Targets**
- **Stars:** 50+ (from 0)
- **Contributors:** 10+ (from 1)
- **Security Reports:** 5+ per month
- **Audit Coverage:** 95%+

### **Security Score Targets**
- **Current:** 47.25%
- **Target:** 85%+ after external audits
- **Production Ready:** 90%+

## 🤝 **Getting Help**

### **Discussions**
- Use GitHub Discussions for questions
- Tag security team for security issues
- Use appropriate labels for visibility

### **Security Issues**
- **Private disclosure:** security@pizzaparty.com
- **Public issues:** Use security vulnerability template
- **Emergency:** Contact security team directly

### **Code Reviews**
- **Security team** reviews all contract changes
- **Frontend team** reviews UI-related changes
- **Documentation team** reviews docs

## 📝 **License**

By contributing to Pizza Party dApp, you agree that your contributions will be licensed under the MIT License.

---

**Remember: DO NOT CHANGE THE UI!!!** ✅

Thank you for contributing to making Pizza Party dApp more secure and robust! 🍕 