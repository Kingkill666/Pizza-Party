// Global TypeScript declarations for Farcaster Wallet Provider

declare global {
  interface Window {
    __FarcasterWalletProvider?: {
      fid: number | null;
      username: string | null;
      avatar: string | null;
      wallet: string | null;
      signer: any;
      signMessage: (message: string) => Promise<string>;
      loading: boolean;
      connected: boolean;
      error: string | null;
      isFarcasterEnvironment: boolean;
    };
    farcasterSdk?: any;
    farcaster?: any;
    Warpcast?: any;
  }
}

export {};
