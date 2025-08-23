"use client";

import { FarcasterWalletStatus } from '@/components/FarcasterWalletStatus';
import { FarcasterTestComponent } from '@/components/FarcasterTestComponent';
import { formatWallet } from '@/lib/utils';
import { useFarcasterWallet } from '@/components/FarcasterWalletProvider';

export default function FarcasterIntegrationTestPage() {
  const { fid, username, wallet, connected, loading, error, isFarcasterEnvironment } = useFarcasterWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Farcaster Integration Test</h1>
          <p className="text-gray-600">Testing the complete Farcaster wallet integration</p>
        </div>

        {/* Status Overview */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Integration Status</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">
                {isFarcasterEnvironment ? '✅' : '🌐'}
              </div>
              <div className="text-sm font-medium text-gray-700">Environment</div>
              <div className="text-xs text-gray-500">
                {isFarcasterEnvironment ? 'Farcaster' : 'Regular Web'}
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">
                {connected ? '✅' : '❌'}
              </div>
              <div className="text-sm font-medium text-gray-700">Connected</div>
              <div className="text-xs text-gray-500">
                {connected ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-1">
                {loading ? '🔄' : '✅'}
              </div>
              <div className="text-sm font-medium text-gray-700">Loading</div>
              <div className="text-xs text-gray-500">
                {loading ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl mb-1">
                {error ? '❌' : '✅'}
              </div>
              <div className="text-sm font-medium text-gray-700">Error</div>
              <div className="text-xs text-gray-500">
                {error ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Wallet Details */}
        {connected && (
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Wallet Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">FID:</span>
                <span className="text-blue-600 font-mono">{fid ?? 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Username:</span>
                <span className="text-blue-600">@{username ?? 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Wallet Address:</span>
                <span className="text-blue-600 font-mono text-sm">{formatWallet(wallet)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FarcasterWalletStatus />
          <FarcasterTestComponent />
        </div>

        {/* QA Test Instructions */}
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🧪 QA Testing</h2>
          
          <div className="space-y-3 text-blue-700">
            <p><strong>To run the QA test:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Open browser console (F12)</li>
              <li>Run: <code className="bg-blue-100 px-2 py-1 rounded">runFarcasterQATest()</code></li>
              <li>Check for green indicators</li>
              <li>Test signature functionality</li>
            </ol>
            
            <p className="mt-4 text-sm">
              <strong>Expected Results:</strong> All tests should pass with green indicators, 
              no "Connect Wallet" buttons should be visible, and the Farcaster provider should be detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
