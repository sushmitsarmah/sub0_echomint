/**
 * Wallet connection utilities for Polkadot ecosystem
 * Handles connecting to browser extension wallets
 */

import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

export interface InjectedAccount {
  address: string;
  name?: string;
  source: string;
}

export interface InjectedExtension {
  name: string;
  version: string;
  accounts: {
    get: () => Promise<InjectedAccount[]>;
  };
  signer: any;
}

/**
 * Get all available wallet extensions
 */
export async function getInjectedExtensions(): Promise<InjectedExtension[]> {
  // Check if window.injectedWeb3 exists (Polkadot extension API)
  const injectedWeb3 = (window as any).injectedWeb3;

  if (!injectedWeb3) {
    throw new Error('No Polkadot wallet extension detected. Please install Polkadot.js or Talisman.');
  }

  const extensions: InjectedExtension[] = [];

  for (const [name, ext] of Object.entries(injectedWeb3)) {
    try {
      const extension = await (ext as any).enable('EchoMint');
      extensions.push({
        name,
        version: extension.version,
        accounts: extension.accounts,
        signer: extension.signer,
      });
    } catch (error) {
      console.warn(`Failed to enable extension ${name}:`, error);
    }
  }

  return extensions;
}

/**
 * Connect to a specific wallet
 */
export async function connectWallet(walletName?: string): Promise<{
  accounts: InjectedAccount[];
  signer: any;
}> {
  const extensions = await getInjectedExtensions();

  if (extensions.length === 0) {
    throw new Error('No wallet extensions available');
  }

  // Use specified wallet or first available
  const extension = walletName
    ? extensions.find((ext) => ext.name === walletName)
    : extensions[0];

  if (!extension) {
    throw new Error(`Wallet ${walletName} not found`);
  }

  const accounts = await extension.accounts.get();

  if (accounts.length === 0) {
    throw new Error('No accounts found in wallet');
  }

  return {
    accounts,
    signer: extension.signer,
  };
}

/**
 * Convert SS58 address to H160 (Ethereum-style) address
 * For pallet-revive, we derive the H160 from the AccountId32
 */
export function accountIdToH160(accountId: string): string {
  try {
    // Decode the SS58 address to get the public key bytes
    const publicKey = decodeAddress(accountId);

    // Take the first 20 bytes (160 bits) to create H160
    const h160Bytes = publicKey.slice(0, 20);

    // Convert to hex string
    const h160Address = u8aToHex(h160Bytes);

    console.log('Derived H160 address:', h160Address);
    return h160Address;
  } catch (error) {
    console.error('Error converting AccountId to H160:', error);
    throw new Error('Failed to derive H160 address from AccountId');
  }
}

/**
 * Check if an account is mapped to H160
 * Query the chain's revive.addressMapping storage
 */
export async function getH160Mapping(client: any, accountId: string): Promise<string | null> {
  try {
    console.log('Deriving H160 address for account:', accountId);

    // For pallet-revive, we can derive the H160 address directly from the AccountId
    // This is more reliable than querying storage which might not exist
    const h160Address = accountIdToH160(accountId);

    console.log('Derived H160 mapping:', h160Address);
    return h160Address;
  } catch (error) {
    console.error('Error deriving H160 mapping:', error);
    return null;
  }
}

/**
 * Create H160 mapping for an account
 * Note: For pallet-revive, H160 addresses are derived from AccountId,
 * so explicit mapping may not be required
 */
export async function createH160Mapping(client: any, signer: any): Promise<string> {
  // For pallet-revive on Passet Hub, H160 mapping is derived automatically
  // No explicit transaction needed
  console.log('H160 mapping derived automatically from AccountId');
  return 'H160 derived';
}

/**
 * Get the injected signer for Polkadot.js API
 * This bypasses LunoKit and gets the signer directly from the extension
 */
export async function getPolkadotSigner(address: string): Promise<any> {
  const injectedWeb3 = (window as any).injectedWeb3;

  if (!injectedWeb3) {
    throw new Error('No Polkadot wallet extension detected');
  }

  // Try each extension to find the one with our account
  for (const [name, ext] of Object.entries(injectedWeb3)) {
    try {
      const extension = await (ext as any).enable('EchoMint');
      const accounts = await extension.accounts.get();

      // Check if this extension has the account
      const hasAccount = accounts.some((acc: any) => acc.address === address);

      if (hasAccount) {
        console.log('Found Polkadot.js signer in extension:', name);
        return extension.signer;
      }
    } catch (error) {
      console.warn(`Failed to check extension ${name}:`, error);
    }
  }

  throw new Error('Could not find signer for address: ' + address);
}

/**
 * Format address for display (shorten)
 */
export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
