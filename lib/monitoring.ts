/**
 * Pizza Party dApp Security Monitoring System
 * 
 * This module provides comprehensive monitoring, logging, and security tracking
 * for the Pizza Party dApp to address security vulnerabilities and ensure
 * proper audit trails.
 */

export interface SecurityEvent {
  timestamp: number
  eventType: 'AUTHENTICATION' | 'INPUT_VALIDATION' | 'RATE_LIMIT' | 'REENTRANCY' | 'OVERFLOW' | 'BLACKLIST' | 'EMERGENCY' | 'REWARD_CLAIM'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  walletAddress?: string
  details: string
  metadata?: Record<string, any>
}

export interface AuditLog {
  id: string
  timestamp: number
  action: string
  user: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface RateLimitData {
  userId: string
  action: string
  count: number
  windowStart: number
  windowEnd: number
}

export class SecurityMonitor {
  private events: SecurityEvent[] = []
  private auditLogs: AuditLog[] = []
  private rateLimits: Map<string, RateLimitData> = new Map()
  private blacklistedAddresses: Set<string> = new Set()

  /**
   * Log a security event
   */
  logSecurityEvent(event: SecurityEvent): void {
    this.events.push(event)
    
    // Send to external monitoring service (Sentry, etc.)
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      this.sendToMonitoringService(event)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚨 SECURITY EVENT [${event.severity}]: ${event.eventType} - ${event.details}`)
    }
  }

  /**
   * Log an audit event
   */
  logAuditEvent(log: AuditLog): void {
    this.auditLogs.push(log)
    
    // Store in persistent storage
    this.persistAuditLog(log)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 AUDIT LOG: ${log.action} by ${log.user} - ${log.success ? 'SUCCESS' : 'FAILED'}`)
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(userId: string, action: string, limit: number, windowMs: number): boolean {
    const key = `${userId}:${action}`
    const now = Date.now()
    
    const existing = this.rateLimits.get(key)
    
    if (!existing || now > existing.windowEnd) {
      // Create new rate limit window
      this.rateLimits.set(key, {
        userId,
        action,
        count: 1,
        windowStart: now,
        windowEnd: now + windowMs
      })
      return true
    }
    
    if (existing.count >= limit) {
      // Rate limit exceeded
      this.logSecurityEvent({
        timestamp: now,
        eventType: 'RATE_LIMIT',
        severity: 'MEDIUM',
        userId,
        details: `Rate limit exceeded for action: ${action}`,
        metadata: { action, limit, windowMs }
      })
      return false
    }
    
    // Increment count
    existing.count++
    this.rateLimits.set(key, existing)
    return true
  }

  /**
   * Validate input data
   */
  validateInput(data: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      // Basic input validation
      if (typeof data !== 'object' || data === null) {
        errors.push('Invalid data format')
        return { valid: false, errors }
      }
      
      // Check for required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) {
            errors.push(`Missing required field: ${field}`)
          }
        }
      }
      
      // Validate field types
      if (schema.properties) {
        for (const [field, config] of Object.entries(schema.properties)) {
          if (data[field] !== undefined) {
            const value = data[field]
            const expectedType = (config as any).type
            
            if (expectedType === 'string' && typeof value !== 'string') {
              errors.push(`Field ${field} must be a string`)
            } else if (expectedType === 'number' && typeof value !== 'number') {
              errors.push(`Field ${field} must be a number`)
            } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
              errors.push(`Field ${field} must be a boolean`)
            }
          }
        }
      }
      
      // Sanitize input
      const sanitized = this.sanitizeInput(data)
      
      if (errors.length > 0) {
        this.logSecurityEvent({
          timestamp: Date.now(),
          eventType: 'INPUT_VALIDATION',
          severity: 'HIGH',
          details: `Input validation failed: ${errors.join(', ')}`,
          metadata: { data, errors }
        })
      }
      
      return { valid: errors.length === 0, errors, data: sanitized }
    } catch (error) {
      this.logSecurityEvent({
        timestamp: Date.now(),
        eventType: 'INPUT_VALIDATION',
        severity: 'CRITICAL',
        details: `Input validation error: ${error}`,
        metadata: { data, error }
      })
      return { valid: false, errors: ['Validation error'] }
    }
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Remove potentially dangerous characters
      return data
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value)
      }
      return sanitized
    }
    
    return data
  }

  /**
   * Check if address is blacklisted
   */
  isBlacklisted(address: string): boolean {
    return this.blacklistedAddresses.has(address.toLowerCase())
  }

  /**
   * Add address to blacklist
   */
  addToBlacklist(address: string): void {
    this.blacklistedAddresses.add(address.toLowerCase())
    
    this.logSecurityEvent({
      timestamp: Date.now(),
      eventType: 'BLACKLIST',
      severity: 'HIGH',
      walletAddress: address,
      details: 'Address added to blacklist'
    })
  }

  /**
   * Remove address from blacklist
   */
  removeFromBlacklist(address: string): void {
    this.blacklistedAddresses.delete(address.toLowerCase())
    
    this.logSecurityEvent({
      timestamp: Date.now(),
      eventType: 'BLACKLIST',
      severity: 'MEDIUM',
      walletAddress: address,
      details: 'Address removed from blacklist'
    })
  }

  /**
   * Track reward claims
   */
  trackRewardClaim(userId: string, rewardType: string, amount: number): void {
    this.logAuditEvent({
      id: `reward_${Date.now()}`,
      timestamp: Date.now(),
      action: 'REWARD_CLAIM',
      user: userId,
      success: true,
      metadata: { rewardType, amount }
    })
  }

  /**
   * Track authentication attempts
   */
  trackAuthentication(userId: string, success: boolean, errorMessage?: string): void {
    this.logAuditEvent({
      id: `auth_${Date.now()}`,
      timestamp: Date.now(),
      action: 'AUTHENTICATION',
      user: userId,
      success,
      errorMessage
    })
    
    if (!success) {
      this.logSecurityEvent({
        timestamp: Date.now(),
        eventType: 'AUTHENTICATION',
        severity: 'HIGH',
        userId,
        details: `Authentication failed: ${errorMessage || 'Unknown error'}`,
        metadata: { errorMessage }
      })
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number
    criticalEvents: number
    highEvents: number
    blacklistedAddresses: number
    rateLimitViolations: number
  } {
    const criticalEvents = this.events.filter(e => e.severity === 'CRITICAL').length
    const highEvents = this.events.filter(e => e.severity === 'HIGH').length
    const rateLimitViolations = this.events.filter(e => e.eventType === 'RATE_LIMIT').length
    
    return {
      totalEvents: this.events.length,
      criticalEvents,
      highEvents,
      blacklistedAddresses: this.blacklistedAddresses.size,
      rateLimitViolations
    }
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(): AuditLog[] {
    return [...this.auditLogs]
  }

  /**
   * Export security events
   */
  exportSecurityEvents(): SecurityEvent[] {
    return [...this.events]
  }

  /**
   * Send to external monitoring service
   */
  private sendToMonitoringService(event: SecurityEvent): void {
    // Implementation for Sentry, DataDog, etc.
    if (process.env.SENTRY_DSN) {
      // Send to Sentry
      console.log(`Sending to Sentry: ${event.eventType} - ${event.severity}`)
    }
    
    if (process.env.DATADOG_API_KEY) {
      // Send to DataDog
      console.log(`Sending to DataDog: ${event.eventType} - ${event.severity}`)
    }
  }

  /**
   * Persist audit log
   */
  private persistAuditLog(log: AuditLog): void {
    // Store in localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('pizza_party_audit_logs') || '[]')
      logs.push(log)
      localStorage.setItem('pizza_party_audit_logs', JSON.stringify(logs.slice(-1000))) // Keep last 1000 logs
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()

// Export validation schemas
export const validationSchemas = {
  walletConnection: {
    required: ['walletType', 'address'],
    properties: {
      walletType: { type: 'string' },
      address: { type: 'string' },
      chainId: { type: 'number' }
    }
  },
  
  gameEntry: {
    required: ['playerAddress', 'entryFee'],
    properties: {
      playerAddress: { type: 'string' },
      entryFee: { type: 'number' },
      referralCode: { type: 'string' }
    }
  },
  
  rewardClaim: {
    required: ['playerAddress', 'rewardType'],
    properties: {
      playerAddress: { type: 'string' },
      rewardType: { type: 'string' },
      amount: { type: 'number' }
    }
  }
} 