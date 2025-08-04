# 🍕 Contributing to Pizza Party dApp

Thank you for your interest in contributing to Pizza Party dApp! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### 🐛 Reporting Bugs
- Use the [Bug Report template](/.github/ISSUE_TEMPLATE/bug_report.md)
- Provide detailed steps to reproduce
- Include environment information (browser, wallet, network)
- Add screenshots if applicable

### 💡 Suggesting Features
- Use the [Feature Request template](/.github/ISSUE_TEMPLATE/feature_request.md)
- Describe the problem and proposed solution
- Consider the impact on existing functionality
- Provide use cases and mockups if possible

### 🔒 Security Issues
- Use the [Security Report template](/.github/ISSUE_TEMPLATE/security_report.md)
- **DO NOT** publicly disclose vulnerabilities
- Follow responsible disclosure practices
- Provide detailed reproduction steps

### 🛠️ Code Contributions
- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes
- Test thoroughly
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git
- MetaMask or other Web3 wallet

### Installation
```bash
# Clone the repository
git clone https://github.com/Kingkill666/Pizza-Party.git
cd Pizza-Party

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_VMF_CONTRACT_ADDRESS=0x2213414893259b0C48066Acd1763e7fbA97859E5
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BLOCK_EXPLORER=https://basescan.org
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test files
npm test -- test/basic.test.ts

# Run with coverage
npm run test:coverage
```

### Testing Checklist
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices
- [ ] Test wallet connections
- [ ] Test game functionality
- [ ] Test jackpot calculations
- [ ] Test error scenarios

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Use interfaces for data structures
- Avoid `any` types when possible

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Use proper error boundaries
- Implement proper loading states

### Smart Contracts
- Follow Solidity best practices
- Use OpenZeppelin contracts when possible
- Implement proper access controls
- Add comprehensive tests

### File Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── contracts/          # Smart contracts
└── test/               # Test files
```

## 🎮 Game-Specific Guidelines

### UI Changes
- **DO NOT CHANGE THE UI** unless explicitly requested
- UI is locked and should remain unchanged
- Focus on functionality and logic improvements

### Wallet Integration
- Support multiple wallet providers
- Handle connection errors gracefully
- Provide clear user feedback
- Test on mobile devices

### Game Logic
- Implement proper validation
- Handle edge cases
- Provide clear error messages
- Test with various scenarios

### Jackpot System
- Ensure accurate calculations
- Handle edge cases (no players, etc.)
- Implement proper winner selection
- Test payout scenarios

## 🔒 Security Guidelines

### Smart Contracts
- Follow security best practices
- Use established libraries (OpenZeppelin)
- Implement proper access controls
- Test for common vulnerabilities

### Frontend Security
- Validate all user inputs
- Sanitize data before display
- Implement proper error handling
- Avoid exposing sensitive information

### Wallet Security
- Never request unnecessary permissions
- Handle private keys securely
- Validate wallet connections
- Provide clear security warnings

## 📋 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No breaking changes (unless necessary)
- [ ] Security implications considered

### PR Template
Use the provided [Pull Request template](/.github/PULL_REQUEST_TEMPLATE.md) and fill out all relevant sections.

### Review Process
1. Automated checks must pass
2. Code review by maintainers
3. Testing on multiple environments
4. Security review if applicable
5. Final approval and merge

## 🏷️ Issue Labels

### Bug Reports
- `bug` - General bug
- `high-priority` - Critical issues
- `wallet-connection` - Wallet-related bugs
- `game-logic` - Game mechanics issues
- `ui/ux` - Interface issues
- `mobile` - Mobile-specific issues

### Feature Requests
- `enhancement` - New features
- `gameplay` - Game mechanics
- `wallet-integration` - Wallet features
- `social` - Social features
- `performance` - Performance improvements

### Security
- `security` - Security issues
- `critical` - Critical security vulnerabilities
- `smart-contract` - Contract security
- `frontend-security` - Client-side security

## 🤝 Community Guidelines

### Be Respectful
- Treat all contributors with respect
- Provide constructive feedback
- Avoid personal attacks
- Help newcomers

### Be Helpful
- Answer questions when possible
- Provide detailed explanations
- Share knowledge and resources
- Mentor new contributors

### Be Professional
- Use clear, professional language
- Follow project conventions
- Respond to issues and PRs promptly
- Maintain high code quality

## 📞 Getting Help

### Questions & Discussions
- Use GitHub Discussions for questions
- Search existing issues before posting
- Provide context and details
- Be patient with responses

### Discord Community
- Join our Discord server (link TBD)
- Ask questions in appropriate channels
- Share your work and get feedback
- Connect with other contributors

## 🏆 Recognition

### Contributors
- All contributors will be listed in the README
- Significant contributions will be highlighted
- Contributors will be mentioned in release notes

### Hall of Fame
- Top contributors will be featured
- Special recognition for security researchers
- Community awards for outstanding work

## 📄 License

By contributing to Pizza Party dApp, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Pizza Party dApp! 🍕🎮 