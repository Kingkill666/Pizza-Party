# Farcaster Wallet Integration Guide

Pizza Party now fully supports Farcaster wallets with **auto-detection, signer integration, and seamless UX**. This guide will help developers set up the Farcaster wallet environment in their own forks.

---

## 1. Install Dependencies

Make sure you have the Farcaster SDK / Neynar client installed:

```bash
npm install @neynar/nodejs-sdk @farcaster/frame-verification ethers
```

---

## 2. Set Up Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key_here
```

---

## 3. Wrap Your App With Provider

In `app/layout.tsx` or `_app.tsx`:

```tsx
import { FarcasterWalletProvider } from './components/FarcasterWalletProvider';

export default function App({ Component, pageProps }) {
  return (
    <FarcasterWalletProvider>
      <Component {...pageProps} />
    </FarcasterWalletProvider>
  );
}
```

---

## 4. Use the Farcaster Wallet Hook

Anywhere in your app:

```tsx
import { useFarcasterWallet } from './components/FarcasterWalletProvider';

function GameHeader() {
  const { fid, username, wallet, connected, signMessage, avatar } = useFarcasterWallet();

  if (!connected) {
    return (
      <div>
        ⚠️ No wallet linked. 
        <a href="https://warpcast.com/settings/wallets" target="_blank" rel="noreferrer">
          Link one in Warpcast
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt="pfp" className="w-8 h-8 rounded-full" />
      <span>Connected via Farcaster: @{username} (FID: {fid})</span>
    </div>
  );
}
```

---

## 5. Sign Transactions / Messages

Use the `signMessage()` function to create offchain signatures:

```ts
const signature = await signMessage(`PizzaPartyDailyPlay:${fid}:${Date.now()}`);
```

> This allows daily plays or lightweight actions without touching the blockchain.

---

## 6. Invite Friends by Farcaster Username

Instead of using wallet addresses, resolve invites using `fid → username`:

```ts
const userInfo = await client.lookupUserByFid(invitedFid);
console.log(userInfo.username); // use this for social invites
```

---

## 7. Fallback for Non-Farcaster Users

The provider automatically falls back to a regular Ethereum wallet if no Farcaster wallet is detected. Make sure to handle this in your UI.

---

## ✅ Summary

* Auto-detects Farcaster environment
* Resolves FID, username, avatar, wallet
* Signer integration for transactions
* Offchain signatures for daily plays
* Social-native invites
* Fallback to standard wallet
