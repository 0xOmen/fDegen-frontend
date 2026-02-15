import { EvmAdapter, baseSepolia } from '@openzeppelin/ui-builder-adapter-evm';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { NetworkErrorNotificationProvider, Toaster } from '@openzeppelin/ui-components';
import { AdapterProvider, WalletStateProvider } from '@openzeppelin/ui-react';
import type { ContractAdapter, NativeConfigLoader, NetworkConfig } from '@openzeppelin/ui-types';
import { appConfigService, logger } from '@openzeppelin/ui-utils';

import { App } from './App';

import './styles.css';

/*@@ADAPTER_BOOTSTRAP_IMPORTS_INJECTION_POINT@@*/

// The specific NetworkConfig for this exported form.
const exportedNetworkConfig = baseSepolia;

// Function to resolve the single adapter for the exported app.
const resolveAdapter = async (nc: NetworkConfig): Promise<ContractAdapter> => {
  if (nc.id === exportedNetworkConfig.id) {
    // The network config type matches what the adapter expects at generation time
    const adapter = new EvmAdapter(nc as typeof exportedNetworkConfig);
    /*@@ADAPTER_BOOTSTRAP_CODE_INJECTION_POINT@@*/
    return adapter;
  }
  // This path should ideally not be reached in a single-form export context
  // if nc.id always matches exportedNetworkConfig.id.
  logger.error(
    'ExportedApp',
    `Adapter resolution failed: NetworkConfig ID mismatch. Expected ${exportedNetworkConfig.id}, got ${nc.id}`
  );
  // Fallback or error handling: Re-throw or return a dummy/null adapter if absolutely necessary,
  // but this indicates a fundamental issue in how the exported app is configured or used.
  throw new Error(`Adapter resolution failed for network ID: ${nc.id}`);
};

// Function to get the network config by ID, specific to this exported app.
const getNetworkConfigById = (id: string) => {
  if (id === exportedNetworkConfig.id) {
    return exportedNetworkConfig;
  }
  logger.warn(
    '[ExportedApp:getNetworkConfigById]',
    `getNetworkConfigById called with unexpected ID: ${id}. This app is configured for ${exportedNetworkConfig.id}.`
  );
  return null;
};

// Use Vite's import.meta.glob to find all potential kit config files.
// Expecting them to be .ts files as per convention.
const kitConfigImporters = import.meta.glob('./config/wallet/*.config.ts');

/**
 * Dynamically loads kit-specific native configuration files from the exported
 * application's `src/config/wallet/` directory using Vite's import.meta.glob.
 * @param relativePath - The conventional relative path (e.g., './config/wallet/rainbowkit.config.ts').
 * @returns A Promise resolving to the configuration object or null if not found/error.
 */
const loadAppConfigModule: NativeConfigLoader = async (relativePath: string) => {
  const importerToCall = kitConfigImporters[relativePath];

  if (importerToCall) {
    try {
      const module = (await importerToCall()) as { default?: Record<string, unknown> } & Record<
        string,
        unknown
      >;
      return module.default || module;
    } catch {
      return null;
    }
  } else {
    return null;
  }
};

async function startApp() {
  // Initialize AppConfigService, attempting to load from app.config.json first,
  // then potentially from Vite env vars if the exported app is built with Vite and sets them.
  // For typical exported apps, app.config.json will be the primary configuration source.
  await appConfigService.initialize([
    { type: 'json', path: '/app.config.json' }, // Primary config source for exported apps
    { type: 'viteEnv', env: import.meta.env }, // Secondary, if any vite env vars are set during a build of the exported app
  ]);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <NetworkErrorNotificationProvider>
        <AdapterProvider resolveAdapter={resolveAdapter}>
          <WalletStateProvider
            initialNetworkId={exportedNetworkConfig.id}
            getNetworkConfigById={getNetworkConfigById}
            loadConfigModule={loadAppConfigModule}
          >
            <App />
          </WalletStateProvider>
        </AdapterProvider>
        <Toaster position="top-right" />
      </NetworkErrorNotificationProvider>
    </React.StrictMode>
  );
}

void startApp();
