import { useEffect, useState } from 'react';

import { Footer } from '@openzeppelin/ui-components';
import {
  useDerivedAccountStatus,
  useDerivedSwitchChainStatus,
  useWalletState,
} from '@openzeppelin/ui-react';
import { WalletConnectionWithSettings } from '@openzeppelin/ui-renderer';
import type { ContractAdapter } from '@openzeppelin/ui-types';

import GeneratedForm from './components/GeneratedForm';

/** Base Sepolia chain ID – this app only allows transactions on this network. */
const BASE_SEPOLIA_CHAIN_ID = 84532;

/**
 * App Component
 *
 * Main application component that wraps the form.
 * Uses useWalletState to get the active adapter.
 * Caches the adapter once available to prevent form remounts during wallet connection.
 * Enforces Base Sepolia: when the wallet is connected on another chain, we prompt to switch
 * and block transactions until the user is on Base Sepolia.
 */
export function App() {
  const { activeAdapter } = useWalletState();
  const { isConnected: isWalletConnectedForForm, chainId } = useDerivedAccountStatus();
  const { switchChain, isSwitching: isSwitchingChain } = useDerivedSwitchChainStatus();

  const isCorrectChain =
    chainId === undefined || chainId === BASE_SEPOLIA_CHAIN_ID;

  const requestSwitchToBaseSepolia = () => {
    switchChain?.({ chainId: BASE_SEPOLIA_CHAIN_ID });
  };

  // Persist the adapter used by the form once it first becomes available to avoid remounts
  const [adapterForForm, setAdapterForForm] = useState<ContractAdapter | null>(null);

  useEffect(() => {
    if (activeAdapter) {
      setAdapterForForm((prev) => prev ?? activeAdapter);
    }
  }, [activeAdapter]);

  return (
    <div className="app">
      <header className="header border-b px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/OZ-Logo-BlackBG.svg" alt="OpenZeppelin Logo" className="h-6 w-auto" />
            <div className="h-5 border-l border-gray-300 mx-1"></div>
            <div>
              <h1 className="text-base font-medium">approve_address_uint256</h1>
              <p className="text-xs text-muted-foreground">
                Form for interacting with blockchain contracts
              </p>
            </div>
          </div>
          <WalletConnectionWithSettings />
        </div>
      </header>

      <main className="main">
        <div className="container">
          {adapterForForm ? (
            <GeneratedForm
              adapter={adapterForForm}
              isWalletConnected={isWalletConnectedForForm}
              isCorrectChain={isCorrectChain}
              onSwitchToBaseSepolia={requestSwitchToBaseSepolia}
              isSwitchingChain={isSwitchingChain}
            />
          ) : (
            <div className="app-loading">Loading adapter...</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
