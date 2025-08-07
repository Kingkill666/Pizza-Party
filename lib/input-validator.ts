// Enhanced input validation system
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export class InputValidator {
  private static readonly VALIDATION_RULES = {
    walletAddress: /^0x[a-fA-F0-9]{40}$/,
    referralCode: /^[a-zA-Z0-9]{6,12}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    amount: /^\d+(\.\d{1,18})?$/,
    gameId: /^\d+$/,
    timestamp: /^\d{10,13}$/,
    chainId: /^\d+$/
  };

  private static readonly ATTACK_PATTERNS = [
    '<script>', 'javascript:', 'data:', 'vbscript:', 'onload=', 'onerror=',
    'eval(', 'document.cookie', 'localStorage', 'sessionStorage',
    'window.', 'document.', 'location.', 'history.'
  ];

  private static readonly MAX_LENGTHS = {
    walletAddress: 42,
    referralCode: 12,
    email: 254,
    amount: 20,
    gameId: 10,
    timestamp: 13,
    chainId: 10,
    general: 100
  };

  static validateWalletAddress(address: string): ValidationResult {
    if (!address || typeof address !== 'string') {
      return { valid: false, error: 'Invalid wallet address format' };
    }

    if (address.length !== 42) {
      return { valid: false, error: 'Wallet address must be 42 characters' };
    }

    if (!this.VALIDATION_RULES.walletAddress.test(address)) {
      return { valid: false, error: 'Invalid wallet address format' };
    }

    // Check for zero address
    if (address === '0x0000000000000000000000000000000000000000') {
      return { valid: false, error: 'Zero address not allowed' };
    }

    // Check for attack patterns
    if (this.containsAttackPatterns(address)) {
      return { valid: false, error: 'Invalid wallet address content' };
    }

    return { valid: true, sanitizedValue: address.toLowerCase() };
  }

  static validateReferralCode(code: string): ValidationResult {
    if (!code || typeof code !== 'string') {
      return { valid: false, error: 'Invalid referral code format' };
    }

    if (code.length < 6 || code.length > 12) {
      return { valid: false, error: 'Referral code must be 6-12 characters' };
    }

    if (!this.VALIDATION_RULES.referralCode.test(code)) {
      return { valid: false, error: 'Referral code contains invalid characters' };
    }

    // Check for attack patterns
    if (this.containsAttackPatterns(code)) {
      return { valid: false, error: 'Invalid referral code content' };
    }

    return { valid: true, sanitizedValue: code.toUpperCase() };
  }

  static validateAmount(amount: string | number): ValidationResult {
    const amountStr = amount.toString();
    
    if (!this.VALIDATION_RULES.amount.test(amountStr)) {
      return { valid: false, error: 'Invalid amount format' };
    }

    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (numAmount > 1000) {
      return { valid: false, error: 'Amount exceeds maximum limit of 1000' };
    }

    // Check for precision issues
    if (amountStr.includes('.') && amountStr.split('.')[1].length > 18) {
      return { valid: false, error: 'Amount has too many decimal places' };
    }

    return { valid: true, sanitizedValue: amountStr };
  }

  static validateGameId(gameId: string | number): ValidationResult {
    const gameIdStr = gameId.toString();
    
    if (!this.VALIDATION_RULES.gameId.test(gameIdStr)) {
      return { valid: false, error: 'Invalid game ID format' };
    }

    const numGameId = parseInt(gameIdStr);
    if (isNaN(numGameId) || numGameId <= 0) {
      return { valid: false, error: 'Game ID must be a positive number' };
    }

    if (numGameId > 999999999) {
      return { valid: false, error: 'Game ID too large' };
    }

    return { valid: true, sanitizedValue: gameIdStr };
  }

  static validateChainId(chainId: string | number): ValidationResult {
    const chainIdStr = chainId.toString();
    
    if (!this.VALIDATION_RULES.chainId.test(chainIdStr)) {
      return { valid: false, error: 'Invalid chain ID format' };
    }

    const numChainId = parseInt(chainIdStr);
    if (isNaN(numChainId)) {
      return { valid: false, error: 'Chain ID must be a number' };
    }

    // Allow only specific chain IDs
    const allowedChainIds = [1, 8453, 84532]; // Ethereum, Base, Base Sepolia
    if (!allowedChainIds.includes(numChainId)) {
      return { valid: false, error: 'Chain ID not supported' };
    }

    return { valid: true, sanitizedValue: chainIdStr };
  }

  static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Invalid email format' };
    }

    if (email.length > this.MAX_LENGTHS.email) {
      return { valid: false, error: 'Email too long' };
    }

    if (!this.VALIDATION_RULES.email.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check for attack patterns
    if (this.containsAttackPatterns(email)) {
      return { valid: false, error: 'Invalid email content' };
    }

    return { valid: true, sanitizedValue: email.toLowerCase() };
  }

  static validateTimestamp(timestamp: string | number): ValidationResult {
    const timestampStr = timestamp.toString();
    
    if (!this.VALIDATION_RULES.timestamp.test(timestampStr)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    const numTimestamp = parseInt(timestampStr);
    if (isNaN(numTimestamp)) {
      return { valid: false, error: 'Timestamp must be a number' };
    }

    const now = Date.now();
    const minTimestamp = now - (365 * 24 * 60 * 60 * 1000); // 1 year ago
    const maxTimestamp = now + (24 * 60 * 60 * 1000); // 1 day in future

    if (numTimestamp < minTimestamp || numTimestamp > maxTimestamp) {
      return { valid: false, error: 'Timestamp out of valid range' };
    }

    return { valid: true, sanitizedValue: timestampStr };
  }

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocol
      .replace(/data:/gi, '') // Remove data protocol
      .replace(/vbscript:/gi, '') // Remove VBScript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/eval\s*\(/gi, '') // Remove eval function
      .replace(/document\./gi, '') // Remove document access
      .replace(/window\./gi, '') // Remove window access
      .replace(/localStorage/gi, '') // Remove localStorage access
      .replace(/sessionStorage/gi, '') // Remove sessionStorage access
      .slice(0, this.MAX_LENGTHS.general); // Limit length

    return sanitized;
  }

  private static containsAttackPatterns(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return this.ATTACK_PATTERNS.some(pattern => 
      lowerInput.includes(pattern.toLowerCase())
    );
  }

  static validateObject(obj: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    try {
      // Check for required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in obj)) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      // Validate field types and values
      if (schema.properties) {
        for (const [field, config] of Object.entries(schema.properties)) {
          if (obj[field] !== undefined) {
            const value = obj[field];
            const fieldConfig = config as FieldConfig;
            
            // Type validation
            if (fieldConfig.type === 'string' && typeof value !== 'string') {
              errors.push(`Field ${field} must be a string`);
            } else if (fieldConfig.type === 'number' && typeof value !== 'number') {
              errors.push(`Field ${field} must be a number`);
            } else if (fieldConfig.type === 'boolean' && typeof value !== 'boolean') {
              errors.push(`Field ${field} must be a boolean`);
            }

            // Custom validation
            if (fieldConfig.validate) {
              const validation = fieldConfig.validate(value);
              if (!validation.valid) {
                errors.push(`Field ${field}: ${validation.error}`);
              } else {
                sanitized[field] = validation.sanitizedValue || value;
              }
            } else {
              sanitized[field] = value;
            }
          }
        }
      }

      if (errors.length > 0) {
        return { valid: false, error: errors.join(', ') };
      }

      return { valid: true, sanitizedValue: sanitized };
    } catch (error) {
      return { valid: false, error: 'Validation error occurred' };
    }
  }
}

export interface ValidationSchema {
  required?: string[];
  properties?: Record<string, FieldConfig>;
}

export interface FieldConfig {
  type: 'string' | 'number' | 'boolean';
  validate?: (value: any) => ValidationResult;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
} 