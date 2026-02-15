import { useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent } from '@openzeppelin/ui-components';
import { ContractActionBar, ContractStateWidget, TransactionForm } from '@openzeppelin/ui-renderer';
import type {
  ContractAdapter,
  ContractSchema,
  RenderFormSchema,
} from '@openzeppelin/ui-types';
import { cn } from '@openzeppelin/ui-utils';

// Props for GeneratedForm
interface GeneratedFormProps {
  adapter: ContractAdapter;
  isWalletConnected?: boolean;
  /** True when wallet is on Base Sepolia (or not connected). When false and connected, transactions are blocked. */
  isCorrectChain?: boolean;
  /** Callback to request wallet to switch to Base Sepolia. */
  onSwitchToBaseSepolia?: () => void;
  /** True while a chain switch is in progress. */
  isSwitchingChain?: boolean;
}

// Shared contract address (FDegen)
const CONTRACT_ADDRESS = '0xA18A39F7f5Fa1A6d4aD6B67f6d5578D4002E2f98';

const sharedLayout = {
  columns: 1 as const,
  spacing: 'normal' as const,
  labelPosition: 'top' as const,
};
const sharedValidation = {
  mode: 'onChange' as const,
  showErrors: 'inline' as const,
};

/**
 * Generated Transaction Form for FDegen contract (Approve, Mint, MintAndSend, Send).
 *
 * This component renders forms for interacting with the blockchain contract.
 * It uses the shared renderer package which ensures consistent behavior
 * with the preview in the builder app.
 */
export default function GeneratedForm({
  adapter,
  isWalletConnected,
  isCorrectChain = true,
  onSwitchToBaseSepolia,
  isSwitchingChain = false,
}: GeneratedFormProps) {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [loadError, _setLoadError] = useState<Error | null>(null);

  const showWrongNetwork = isWalletConnected && !isCorrectChain;

  // Approve form schema
  const approveFormSchema: RenderFormSchema = useMemo(() => {
    return {
      layout: sharedLayout,
      validation: sharedValidation,
      theme: {},
      functionId: 'approve_address_uint256',
      title: 'Approve Form',
      description: 'Form for interacting with the Approve function.',
      contractAddress: CONTRACT_ADDRESS,
      id: 'form-approve_address_uint256',
      fields: [
        {
          id: 'field-kzn61zp',
          name: 'spender',
          label: 'Spender',
          type: 'blockchain-address',
          placeholder: '0x2472FCd582b6f48D4977b6b1AD44Ad7a0B444827',
          helperText: '',
          defaultValue: '',
          validation: { required: true },
          width: 'full',
          transforms: {},
          originalParameterType: 'address',
          isHardcoded: true,
          hardcodedValue: '0x2472FCd582b6f48D4977b6b1AD44Ad7a0B444827',
        },
        {
          id: 'field-cgug6zo',
          name: 'value',
          label: 'Value',
          type: 'bigint',
          placeholder: 'Enter Value',
          helperText: '',
          defaultValue: '',
          validation: { required: true },
          width: 'full',
          transforms: {},
          originalParameterType: 'uint256',
        },
      ],
      submitButton: {
        text: 'Execute Approve Form',
        loadingText: 'Processing...',
        variant: 'primary',
      },
      defaultValues: {
        spender: '0x2472FCd582b6f48D4977b6b1AD44Ad7a0B444827',
        value: '',
      },
    };
  }, []);

  // Mint form schema (no args; contract mints 100000 to caller)
  const mintFormSchema: RenderFormSchema = useMemo(() => {
    return {
      layout: sharedLayout,
      validation: sharedValidation,
      theme: {},
      functionId: 'mint_',
      title: 'Mint',
      description: 'Mint 100000 tokens to the caller.',
      contractAddress: CONTRACT_ADDRESS,
      id: 'form-mint',
      fields: [],
      submitButton: {
        text: 'Execute Mint',
        loadingText: 'Processing...',
        variant: 'primary',
      },
      defaultValues: {},
    };
  }, []);

  // MintAndSend form schema (recipient address; contract mints 100000 and sends to address)
  const mintAndSendFormSchema: RenderFormSchema = useMemo(() => {
    return {
      layout: sharedLayout,
      validation: sharedValidation,
      theme: {},
      functionId: 'mintAndSend_address',
      title: 'Mint And Send',
      description: 'Mint 100000 tokens and send them to the specified address.',
      contractAddress: CONTRACT_ADDRESS,
      id: 'form-mintAndSend',
      fields: [
        {
          id: 'field-mintAndSend-to',
          name: 'to',
          label: 'Recipient address',
          type: 'blockchain-address',
          placeholder: '0x...',
          helperText: '',
          defaultValue: '',
          validation: { required: true },
          width: 'full',
          transforms: {},
          originalParameterType: 'address',
        },
      ],
      submitButton: {
        text: 'Execute Mint And Send',
        loadingText: 'Processing...',
        variant: 'primary',
      },
      defaultValues: { to: '' },
    };
  }, []);

  // Send (Transfer) form schema (recipient address + amount)
  const sendFormSchema: RenderFormSchema = useMemo(() => {
    return {
      layout: sharedLayout,
      validation: sharedValidation,
      theme: {},
      functionId: 'transfer_address_uint256',
      title: 'Send',
      description: 'Transfer a specified amount of tokens to an address.',
      contractAddress: CONTRACT_ADDRESS,
      id: 'form-send',
      fields: [
        {
          id: 'field-send-to',
          name: 'to',
          label: 'Recipient address',
          type: 'blockchain-address',
          placeholder: '0x...',
          helperText: '',
          defaultValue: '',
          validation: { required: true },
          width: 'full',
          transforms: {},
          originalParameterType: 'address',
        },
        {
          id: 'field-send-value',
          name: 'value',
          label: 'Amount',
          type: 'bigint',
          placeholder: 'Enter amount',
          helperText: '',
          defaultValue: '',
          validation: { required: true },
          width: 'full',
          transforms: {},
          originalParameterType: 'uint256',
        },
      ],
      submitButton: {
        text: 'Execute Send',
        loadingText: 'Processing...',
        variant: 'primary',
      },
      defaultValues: { to: '', value: '' },
    };
  }, []);

  // Contract schema for FDegen (mint, mintAndSend, transfer, approve, etc.)
  const contractSchema: ContractSchema = useMemo(() => {
    return {
      ecosystem: 'evm',
      name: 'ContractFromABI',
      address: CONTRACT_ADDRESS,
      functions: [
        {
          id: 'DOMAIN_SEPARATOR_',
          name: 'DOMAIN_SEPARATOR',
          displayName: 'D O M A I N_ S E P A R A T O R',
          inputs: [],
          outputs: [
            {
              name: '',
              type: 'bytes32',
              displayName: 'Parameter (bytes32)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'allowance_address_address',
          name: 'allowance',
          displayName: 'Allowance',
          inputs: [
            {
              name: 'owner',
              type: 'address',
              displayName: 'Owner',
            },
            {
              name: 'spender',
              type: 'address',
              displayName: 'Spender',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'uint256',
              displayName: 'Parameter (uint256)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'approve_address_uint256',
          name: 'approve',
          displayName: 'Approve',
          inputs: [
            {
              name: 'spender',
              type: 'address',
              displayName: 'Spender',
            },
            {
              name: 'value',
              type: 'uint256',
              displayName: 'Value',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'bool',
              displayName: 'Parameter (bool)',
            },
          ],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
        {
          id: 'balanceOf_address',
          name: 'balanceOf',
          displayName: 'Balance Of',
          inputs: [
            {
              name: 'account',
              type: 'address',
              displayName: 'Account',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'uint256',
              displayName: 'Parameter (uint256)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'decimals_',
          name: 'decimals',
          displayName: 'Decimals',
          inputs: [],
          outputs: [
            {
              name: '',
              type: 'uint8',
              displayName: 'Parameter (uint8)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'eip712Domain_',
          name: 'eip712Domain',
          displayName: 'Eip712 Domain',
          inputs: [],
          outputs: [
            {
              name: 'fields',
              type: 'bytes1',
              displayName: 'Fields',
            },
            {
              name: 'name',
              type: 'string',
              displayName: 'Name',
            },
            {
              name: 'version',
              type: 'string',
              displayName: 'Version',
            },
            {
              name: 'chainId',
              type: 'uint256',
              displayName: 'Chain Id',
            },
            {
              name: 'verifyingContract',
              type: 'address',
              displayName: 'Verifying Contract',
            },
            {
              name: 'salt',
              type: 'bytes32',
              displayName: 'Salt',
            },
            {
              name: 'extensions',
              type: 'uint256[]',
              displayName: 'Extensions',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'mint_',
          name: 'mint',
          displayName: 'Mint',
          inputs: [],
          outputs: [],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
        {
          id: 'mintAndSend_address',
          name: 'mintAndSend',
          displayName: 'Mint And Send',
          inputs: [
            {
              name: 'to',
              type: 'address',
              displayName: 'To',
            },
          ],
          outputs: [],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
        {
          id: 'name_',
          name: 'name',
          displayName: 'Name',
          inputs: [],
          outputs: [
            {
              name: '',
              type: 'string',
              displayName: 'Parameter (string)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'nonces_address',
          name: 'nonces',
          displayName: 'Nonces',
          inputs: [
            {
              name: 'owner',
              type: 'address',
              displayName: 'Owner',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'uint256',
              displayName: 'Parameter (uint256)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'permit_address_address_uint256_uint256_uint8_bytes32_bytes32',
          name: 'permit',
          displayName: 'Permit',
          inputs: [
            {
              name: 'owner',
              type: 'address',
              displayName: 'Owner',
            },
            {
              name: 'spender',
              type: 'address',
              displayName: 'Spender',
            },
            {
              name: 'value',
              type: 'uint256',
              displayName: 'Value',
            },
            {
              name: 'deadline',
              type: 'uint256',
              displayName: 'Deadline',
            },
            {
              name: 'v',
              type: 'uint8',
              displayName: 'V',
            },
            {
              name: 'r',
              type: 'bytes32',
              displayName: 'R',
            },
            {
              name: 's',
              type: 'bytes32',
              displayName: 'S',
            },
          ],
          outputs: [],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
        {
          id: 'symbol_',
          name: 'symbol',
          displayName: 'Symbol',
          inputs: [],
          outputs: [
            {
              name: '',
              type: 'string',
              displayName: 'Parameter (string)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'totalSupply_',
          name: 'totalSupply',
          displayName: 'Total Supply',
          inputs: [],
          outputs: [
            {
              name: '',
              type: 'uint256',
              displayName: 'Parameter (uint256)',
            },
          ],
          type: 'function',
          stateMutability: 'view',
          modifiesState: false,
        },
        {
          id: 'transfer_address_uint256',
          name: 'transfer',
          displayName: 'Transfer',
          inputs: [
            {
              name: 'to',
              type: 'address',
              displayName: 'To',
            },
            {
              name: 'value',
              type: 'uint256',
              displayName: 'Value',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'bool',
              displayName: 'Parameter (bool)',
            },
          ],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
        {
          id: 'transferFrom_address_address_uint256',
          name: 'transferFrom',
          displayName: 'Transfer From',
          inputs: [
            {
              name: 'from',
              type: 'address',
              displayName: 'From',
            },
            {
              name: 'to',
              type: 'address',
              displayName: 'To',
            },
            {
              name: 'value',
              type: 'uint256',
              displayName: 'Value',
            },
          ],
          outputs: [
            {
              name: '',
              type: 'bool',
              displayName: 'Parameter (bool)',
            },
          ],
          type: 'function',
          stateMutability: 'nonpayable',
          modifiesState: true,
        },
      ],
    };
  }, []);

  const contractAddress = CONTRACT_ADDRESS;

  // TODO: Enable this useEffect as a fallback?
  // If the adapter supports runtime schema loading (e.g., via Etherscan)
  // and the injected schema is missing or invalid, this could attempt to load it.
  /*
  useEffect(() => {
    setLoadError(null);
    setContractSchema(null);

    if (contractAddress) {
      adapter
        .loadContract(contractAddress)
        .then(setContractSchema)
        .catch((err: unknown) => {
          // Catch error during contract loading
          logger.error('GeneratedForm', 'Error loading contract schema:', err);
          // Create a new Error object if caught value is not already one
          const errorToSet =
            err instanceof Error ? err : new Error('Failed to load contract state');
          setLoadError(errorToSet);
          setContractSchema(null);
        });
    } else {
      setContractSchema(null);
    }
  }, [contractAddress, adapter]);
  */

  // Decide which schema to use: prioritize injected, fallback maybe later?
  const schemaToUse = contractSchema; // Sticking to injected schema for now

  const toggleWidget = () => {
    setIsWidgetVisible((prev: boolean) => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Contract Action Bar - consistent with builder app */}
      {adapter.networkConfig && (
        <ContractActionBar
          networkConfig={adapter.networkConfig}
          contractAddress={contractAddress}
          onToggleContractState={toggleWidget}
          isWidgetExpanded={isWidgetVisible}
        />
      )}

      {/* Wrong network: block transactions and prompt to switch to Base Sepolia */}
      {showWrongNetwork && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription className="mt-2 flex flex-wrap items-center gap-3">
            <span>
              This app only supports Base Sepolia (chain ID 84532). Please switch your wallet to Base
              Sepolia to send transactions.
            </span>
            {onSwitchToBaseSepolia && (
              <Button
                variant="default"
                size="sm"
                onClick={onSwitchToBaseSepolia}
                disabled={isSwitchingChain}
              >
                {isSwitchingChain ? 'Switching…' : 'Switch to Base Sepolia'}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        {/* Contract State Widget on the left side - always mounted to prevent remount churn */}
        {contractAddress && (
          <div
            className={cn(
              'shrink-0 transition-all',
              isWidgetVisible ? 'md:w-80 md:mr-6' : 'md:w-0'
            )}
          >
            <div className="sticky top-4">
              <ContractStateWidget
                contractSchema={schemaToUse}
                contractAddress={contractAddress}
                adapter={adapter}
                isVisible={isWidgetVisible}
                onToggle={toggleWidget}
                error={loadError}
              />
            </div>
          </div>
        )}

        {/* Main forms on the right side – only when on correct chain so transactions are blocked otherwise */}
        <div className="flex-1 space-y-6">
          {!showWrongNetwork && (
            <>
          <Card>
            <CardContent className="space-y-4">
              <TransactionForm
                schema={approveFormSchema}
                contractSchema={contractSchema}
                adapter={adapter}
                isWalletConnected={isWalletConnected}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <TransactionForm
                schema={mintFormSchema}
                contractSchema={contractSchema}
                adapter={adapter}
                isWalletConnected={isWalletConnected}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <TransactionForm
                schema={mintAndSendFormSchema}
                contractSchema={contractSchema}
                adapter={adapter}
                isWalletConnected={isWalletConnected}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <TransactionForm
                schema={sendFormSchema}
                contractSchema={contractSchema}
                adapter={adapter}
                isWalletConnected={isWalletConnected}
              />
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
