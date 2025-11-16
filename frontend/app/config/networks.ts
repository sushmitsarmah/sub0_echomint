/**
 * Network configurations for EchoMint deployment
 */

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  type: 'development' | 'testnet' | 'mainnet';
  explorer?: string;
  faucet?: string;
  chainId: string;
  nativeToken: string;
  description: string;
  contractAddress?: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  local: {
    name: 'Local Node',
    rpcUrl: 'ws://127.0.0.1:9944',
    type: 'development',
    chainId: 'local',
    nativeToken: 'UNIT',
    description: 'Local Substrate contracts node for development',
  },
  passet: {
    name: 'Passet Hub',
    rpcUrl: 'wss://testnet-passet-hub.polkadot.io',
    type: 'testnet',
    explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpasset-hub-paseo.ibp.network#/explorer',
    faucet: 'https://faucet.polkadot.io/?parachain=1111',
    chainId: 'passet-hub',
    nativeToken: 'PAS',
    description: 'Passet Hub (Parachain 1111) - Official ink! v6 testnet on Paseo - Recommended for Sub0 Hackathon',
    contractAddress: import.meta.env.VITE_PASSET_CONTRACT_ADDRESS,
  },
  rococo: {
    name: 'Rococo Contracts',
    rpcUrl: 'wss://rococo-contracts-rpc.polkadot.io',
    type: 'testnet',
    explorer: 'https://rococo.subscan.io',
    faucet: 'https://paritytech.github.io/polkadot-testnet-faucet/',
    chainId: 'rococo-contracts',
    nativeToken: 'ROC',
    description: 'Rococo testnet for smart contracts',
    contractAddress: import.meta.env.VITE_ROCOCO_CONTRACT_ADDRESS,
  },
  kusama: {
    name: 'Kusama',
    rpcUrl: 'wss://kusama-rpc.polkadot.io',
    type: 'mainnet',
    explorer: 'https://kusama.subscan.io',
    chainId: 'kusama',
    nativeToken: 'KSM',
    description: 'Kusama production network',
    contractAddress: import.meta.env.VITE_KUSAMA_CONTRACT_ADDRESS,
  },
};

/**
 * Get the current network based on environment
 */
export function getCurrentNetwork(): NetworkConfig {
  const networkName = import.meta.env.VITE_NETWORK || 'passet';
  return NETWORKS[networkName] || NETWORKS.passet;
}

/**
 * Get network by name
 */
export function getNetwork(name: string): NetworkConfig | undefined {
  return NETWORKS[name];
}

/**
 * Get all available networks
 */
export function getAllNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}

/**
 * Get testnet networks only
 */
export function getTestnetNetworks(): NetworkConfig[] {
  return getAllNetworks().filter((n) => n.type === 'testnet');
}
