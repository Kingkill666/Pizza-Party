"use client";

import { useFarcasterWallet } from './FarcasterWalletProvider';
import { formatWallet } from '@/lib/utils';

export const FarcasterWalletStatus = () => {
  const { fid, username, wallet, connected } = useFarcasterWallet();

  if (!connected) {
    return (
          <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200" data-testid="farcaster-status">
      <div className="text-center">
        <p className="text-yellow-800 font-bold">🔗 Wallet Connection Required</p>
          <p className="text-yellow-700 text-sm mt-1">
            <a
              href="https://warpcast.com/settings/wallets"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Link one in Warpcast
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200" data-testid="farcaster-status">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-green-800 font-bold">
            Connected via Farcaster: @{username} (FID: {fid})
          </p>
          <p className="text-green-700 text-sm">
            {formatWallet(wallet)}
          </p>
        </div>
      </div>
    </div>
  );
};
