"use client";

import { useEffect, useState } from 'react';
import { FarcasterWalletStatus } from '@/components/FarcasterWalletStatus';
import { FarcasterTestComponent } from '@/components/FarcasterTestComponent';

export default function QATestPage() {
  const [qaResults, setQaResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runQATest = async () => {
    setIsLoading(true);
    
    // Load the QA script
    const script = document.createElement('script');
    script.src = '/scripts/farcaster-qa-test-v2.js';
    script.onload = () => {
      // Run the test after a short delay to ensure everything is loaded
      setTimeout(() => {
        if (window.runFarcasterQATestV2) {
          window.runFarcasterQATestV2().then((results: any) => {
            setQaResults(results);
            setIsLoading(false);
          });
        } else {
          setQaResults({ error: 'QA script not loaded properly' });
          setIsLoading(false);
        }
      }, 1000);
    };
    script.onerror = () => {
      setQaResults({ error: 'Failed to load QA script' });
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    // Auto-run QA test on page load
    runQATest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 QA Test Results</h1>
          <p className="text-gray-600">Automated testing of Farcaster wallet integration</p>
        </div>

        {/* Manual Test Button */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
          <button
            onClick={runQATest}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg"
          >
            {isLoading ? 'Running QA Test...' : '🔄 Re-run QA Test'}
          </button>
        </div>

        {/* QA Results */}
        {qaResults && (
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 QA Test Results</h2>
            
            {qaResults.error ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800">❌ Error: {qaResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">
                      {qaResults.environment ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Environment</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">
                      {qaResults.sdk ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-700">SDK</div>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-1">
                      {qaResults.provider ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Provider</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-1">
                      {qaResults.signMessage ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Sign Message</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Game Integration:</h3>
                  <div className="space-y-2 text-sm">
                    <div>Enter Game Button: {qaResults.gameIntegration?.enterGameButton ? '✅ Found' : '❌ Not found'}</div>
                    <div>Wallet Status: {qaResults.gameIntegration?.walletStatus ? '✅ Found' : '❌ Not found'}</div>
                    <div>Farcaster Status: {qaResults.gameIntegration?.farcasterStatus ? '✅ Found' : '❌ Not found'}</div>
                    <div>No Connect Wallet Buttons: {qaResults.gameIntegration?.noConnectWalletButtons ? '✅ Good' : '⚠️ Found'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FarcasterWalletStatus />
          <FarcasterTestComponent />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-4">💡 Manual Testing</h2>
          
          <div className="space-y-3 text-blue-700">
            <p><strong>To test manually in browser console:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Open browser console (F12)</li>
              <li>Run: <code className="bg-blue-100 px-2 py-1 rounded">runFarcasterQATestV2()</code></li>
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
