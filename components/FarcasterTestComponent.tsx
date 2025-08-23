"use client";

import { useFarcasterWallet } from './FarcasterWalletProvider';
import { formatWallet } from '@/lib/utils';
import { Button } from './ui/button';

export const FarcasterTestComponent = () => {
  const { fid, username, wallet, connected, signMessage } = useFarcasterWallet();

  const testSignature = async () => {
    if (!signMessage) return alert('No signer available!');
    
    try {
      const message = `PizzaPartyTest:${fid}:${Date.now()}`;
      console.log('🧪 Testing signature with message:', message);
      
      const signature = await signMessage(message);
      console.log('✅ Test signature successful:', signature);
      
      alert(`Test signature successful!\nMessage: ${message}\nSignature: ${signature}`);
    } catch (error) {
      console.error('❌ Test signature failed:', error);
      alert(`Test signature failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 Farcaster Wallet Test</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-medium">Connected:</span>
          <span className={connected ? 'text-green-600' : 'text-red-600'}>
            {connected ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        {connected && (
          <>
            <div className="flex justify-between">
              <span className="font-medium">FID:</span>
              <span className="text-blue-600">{fid ?? 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Username:</span>
              <span className="text-blue-600">{username ?? 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Wallet:</span>
              <span className="text-blue-600 font-mono text-sm">
                {formatWallet(wallet)}
              </span>
            </div>
          </>
        )}
        
        {connected && (
          <Button 
            onClick={testSignature}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            🧪 Test Signature
          </Button>
        )}
      </div>
    </div>
  );
};
