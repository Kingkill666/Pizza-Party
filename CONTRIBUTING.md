# 🤝 Contributing to Pizza Party

Thank you for your interest in contributing to Pizza Party! This document provides guidelines for contributing to our decentralized gaming platform.

## 🎯 How to Contribute

### Bug Reports
- Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include detailed steps to reproduce
- Provide screenshots and environment details
- Check existing issues before reporting

### Feature Requests
- Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the problem and proposed solution
- Consider the impact on existing features
- Provide mockups if applicable

### Security Issues
- Use our [Security Report Template](.github/ISSUE_TEMPLATE/security_report.md)
- **DO NOT** publicly disclose vulnerabilities
- Contact vmf@vmfcoin.com for urgent issues
- Follow responsible disclosure practices

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- MetaMask or other Web3 wallet
- Base Sepolia testnet access

### Local Development
```bash
# Clone the repository
git clone https://github.com/Kingkill666/Pizza-Party.git
cd Pizza-Party

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Compile contracts
npm run compile
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your configuration
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key
BASESCAN_API_KEY=your_api_key
```

## 📝 Code Standards

### Smart Contracts
- **Solidity 0.8.24** - Use latest stable version
- **OpenZeppelin** - Use audited libraries
- **Gas Optimization** - Minimize gas usage
- **Security First** - Follow best practices
- **Documentation** - Comment complex logic

### Frontend
- **TypeScript** - Type safety required
- **React Hooks** - Use functional components
- **Tailwind CSS** - Follow design system
- **Accessibility** - WCAG 2.1 compliance
- **Performance** - Optimize for speed

### Testing
- **Unit Tests** - Test all functions
- **Integration Tests** - Test interactions
- **Security Tests** - Test vulnerabilities
- **Gas Tests** - Monitor gas usage
- **Coverage** - Maintain high coverage

## 🔄 Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Document** your changes

### Pull Request Guidelines
- **Clear Title** - Describe the change
- **Detailed Description** - Explain what and why
- **Screenshots** - For UI changes
- **Tests** - Include new tests
- **Documentation** - Update docs if needed

### Review Process
1. **Automated Checks** - CI/CD pipeline
2. **Code Review** - Team review
3. **Testing** - Manual testing
4. **Security Review** - Security team review
5. **Merge** - Approved changes merged

## 🏷️ Issue Labels

### Bug Reports
- `bug` - General bug
- `critical` - Game-breaking issue
- `high-priority` - Important fix needed
- `needs-reproduction` - Need more info
- `fixed` - Issue resolved

### Features
- `enhancement` - New feature
- `feature-request` - User requested
- `good-first-issue` - Beginner friendly
- `help-wanted` - Needs contributors

### Technical
- `smart-contract` - Contract related
- `frontend` - UI/UX related
- `wallet-integration` - Wallet issues
- `performance` - Speed/optimization
- `security` - Security related

## 🎮 Game-Specific Guidelines

### Smart Contract Contributions
- **Security Audit** - All contracts must be audited
- **Gas Optimization** - Minimize transaction costs
- **Access Control** - Proper permission management
- **Emergency Controls** - Pause/stop functionality
- **Input Validation** - Sanitize all inputs

### Frontend Contributions
- **UI Consistency** - Follow design system
- **Mobile First** - Responsive design
- **Wallet Support** - Multi-wallet compatibility
- **Error Handling** - User-friendly errors
- **Loading States** - Clear feedback

### Testing Contributions
- **Game Logic** - Test all game mechanics
- **Edge Cases** - Test unusual scenarios
- **Security** - Test attack vectors
- **Performance** - Test under load
- **Integration** - Test wallet interactions

## 🚨 Security Guidelines

### Smart Contract Security
- **No Critical Bugs** - Zero tolerance for critical issues
- **Reentrancy Protection** - Use ReentrancyGuard
- **Access Control** - Proper role management
- **Input Validation** - Validate all inputs
- **Emergency Controls** - Pause functionality

### Frontend Security
- **Input Sanitization** - Clean user inputs
- **Wallet Security** - Secure connection protocols
- **Data Validation** - Validate on-chain data
- **Error Handling** - Don't expose sensitive info
- **Rate Limiting** - Prevent spam attacks

### Reporting Security Issues
- **Private Disclosure** - Contact vmf@vmfcoin.com
- **Responsible Disclosure** - Don't publicly disclose
- **Detailed Report** - Include proof of concept
- **Timeline** - Allow time for fix
- **Coordination** - Work with security team

## 📚 Documentation

### Code Documentation
- **Inline Comments** - Explain complex logic
- **Function Documentation** - Describe parameters and returns
- **Contract Documentation** - NatSpec format
- **API Documentation** - Clear endpoint descriptions
- **README Updates** - Keep docs current

### User Documentation
- **Setup Guides** - Clear installation instructions
- **Usage Examples** - Practical examples
- **Troubleshooting** - Common issues and solutions
- **FAQ** - Frequently asked questions
- **Video Tutorials** - Visual guides

## 🏆 Recognition

### Contributor Recognition
- **Contributor Badge** - Special recognition
- **Hall of Fame** - Featured contributors
- **Early Access** - First to try new features
- **Community Recognition** - Public acknowledgment

### Reward System
- **Bug Bounties** - Rewards for security issues
- **Feature Rewards** - Recognition for great ideas
- **Community Points** - Gamified contribution system
- **Special Access** - Beta testing opportunities

## 📞 Contact & Support

### Development Team
- **Email**: vmf@vmfcoin.com
- **Discord**: VMF Crypto Veterans Hub
- **GitHub**: Issues and discussions
- **X/Twitter**: @VMFCryptoHub

### Resources
- **Base Network**: https://base.org
- **VMF Token**: https://vmfcoin.com
- **Documentation**: This repository
- **Community**: Discord and social media

## 🍕 Code of Conduct

### Our Standards
- **Respectful** - Be kind to all contributors
- **Inclusive** - Welcome diverse perspectives
- **Constructive** - Provide helpful feedback
- **Professional** - Maintain professional conduct
- **Collaborative** - Work together effectively

### Enforcement
- **Warning** - First violation gets a warning
- **Temporary Ban** - Repeated violations
- **Permanent Ban** - Severe violations
- **Appeal Process** - Fair review system

## 🎯 Getting Started

### First Contribution
1. **Fork** the repository
2. **Find** a good first issue (labeled `good-first-issue`)
3. **Set up** your development environment
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Beginner-Friendly Issues
- **Documentation** - Update README or docs
- **UI Improvements** - Minor styling changes
- **Bug Fixes** - Simple bug fixes
- **Testing** - Add test cases
- **Localization** - Translation work

## 🚀 Advanced Contributions

### Smart Contract Development
- **New Features** - Add game mechanics
- **Optimization** - Improve gas efficiency
- **Security** - Enhance security measures
- **Integration** - Connect with other protocols
- **Testing** - Comprehensive test suites

### Frontend Development
- **New Pages** - Add game features
- **UI Components** - Reusable components
- **Animations** - Smooth user experience
- **Performance** - Optimize loading times
- **Accessibility** - Improve usability

### DevOps & Infrastructure
- **CI/CD** - Improve deployment pipeline
- **Monitoring** - Add analytics and alerts
- **Security** - Implement security measures
- **Documentation** - Improve technical docs
- **Testing** - Automated testing systems

---

**Thank you for contributing to Pizza Party! 🍕**

*Together, we're building the future of decentralized gaming on Base network.* 