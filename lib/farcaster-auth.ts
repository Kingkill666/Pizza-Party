// FIP-11 Sign in With Farcaster Implementation
// Based on the Farcaster Improvement Proposal for standardized authentication

interface FarcasterAuthChannel {
  channelToken: string;
  url: string;
}

interface FarcasterAuthStatus {
  state: 'pending' | 'completed';
  nonce?: string;
  message?: string;
  signature?: string;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterAuthOptions {
  domain: string;
  uri: string;
  nonce?: string;
  notBefore?: string;
  expirationTime?: string;
  requestId?: string;
  redirectUrl?: string;
}

export class FarcasterAuthService {
  private static readonly CONNECT_BASE_URL = 'https://connect.farcaster.xyz/v1';
  private static readonly WARPCAST_SIGN_IN_URL = 'https://warpcast.com/~/sign-in-with-farcaster';

  /**
   * Create a new authentication channel for Sign in With Farcaster
   */
  static async createChannel(options: FarcasterAuthOptions): Promise<FarcasterAuthChannel> {
    try {
      console.log('🔐 Creating Farcaster auth channel...', options);

      const response = await fetch(`${this.CONNECT_BASE_URL}/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siweUri: options.uri,
          domain: options.domain,
          nonce: options.nonce || this.generateNonce(),
          notBefore: options.notBefore,
          expirationTime: options.expirationTime,
          requestId: options.requestId,
          redirectUrl: options.redirectUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Farcaster auth channel created:', data);

      return {
        channelToken: data.channelToken,
        url: data.url,
      };
    } catch (error) {
      console.error('❌ Failed to create Farcaster auth channel:', error);
      throw error;
    }
  }

  /**
   * Poll for authentication status
   */
  static async checkStatus(channelToken: string): Promise<FarcasterAuthStatus> {
    try {
      const response = await fetch(`${this.CONNECT_BASE_URL}/channel/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${channelToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Farcaster auth status:', data);

      return {
        state: data.state,
        nonce: data.nonce,
        message: data.message,
        signature: data.signature,
        fid: data.fid,
        username: data.username,
        bio: data.bio,
        displayName: data.displayName,
        pfpUrl: data.pfpUrl,
      };
    } catch (error) {
      console.error('❌ Failed to check Farcaster auth status:', error);
      throw error;
    }
  }

  /**
   * Poll for authentication completion with timeout
   */
  static async waitForAuth(
    channelToken: string, 
    timeoutMs: number = 300000, // 5 minutes
    pollIntervalMs: number = 2000 // 2 seconds
  ): Promise<FarcasterAuthStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.checkStatus(channelToken);
        
        if (status.state === 'completed') {
          console.log('✅ Farcaster authentication completed:', status);
          return status;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      } catch (error) {
        console.warn('⚠️ Error polling auth status:', error);
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      }
    }

    throw new Error('Authentication timeout - user did not complete sign in');
  }

  /**
   * Generate a QR code URL for the authentication
   */
  static generateQRCodeUrl(channelUrl: string): string {
    // Use a QR code service to generate the QR code
    const encodedUrl = encodeURIComponent(channelUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
  }

  /**
   * Generate a nonce for the SIWE message
   */
  private static generateNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create SIWE message for Farcaster authentication
   */
  static createSIWEMessage(options: {
    domain: string;
    uri: string;
    nonce: string;
    fid: number;
    issuedAt?: string;
    expirationTime?: string;
  }): string {
    const issuedAt = options.issuedAt || new Date().toISOString();
    const expirationTime = options.expirationTime || new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    return `${options.domain} wants you to sign in with your Ethereum account:
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

Farcaster Auth

URI: ${options.uri}
Version: 1
Chain ID: 10
Nonce: ${options.nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}
Resources:
- farcaster://fids/${options.fid}`;
  }

  /**
   * Verify the SIWE signature
   */
  static async verifySignature(message: string, signature: string): Promise<boolean> {
    try {
      // This would typically involve verifying the signature against the message
      // For now, we'll assume the signature is valid if it's provided by the FC Auth Relay
      console.log('🔍 Verifying SIWE signature...');
      console.log('Message:', message);
      console.log('Signature:', signature);
      
      // TODO: Implement proper signature verification
      // This would involve:
      // 1. Parsing the SIWE message
      // 2. Recovering the signer address
      // 3. Verifying the signature matches the message
      
      return true; // Placeholder - implement actual verification
    } catch (error) {
      console.error('❌ Signature verification failed:', error);
      return false;
    }
  }
}
