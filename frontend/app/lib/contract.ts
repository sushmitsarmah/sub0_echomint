/**
 * Contract integration for EchoMint NFT
 * Handles minting and interaction with the deployed smart contract
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { getCurrentNetwork } from '../config/networks';
import { getPolkadotSigner } from './wallet';
import contractMetadata from '../contracts/echomint_nft.json';

export interface MintParams {
  to: string; // H160 address
  coin: string;
  mood: MoodState;
}

export enum MoodState {
  Bullish = 'Bullish',
  Bearish = 'Bearish',
  Neutral = 'Neutral',
  Volatile = 'Volatile',
  PositiveSentiment = 'PositiveSentiment',
  NegativeSentiment = 'NegativeSentiment',
}

export class ContractService {
  private api: ApiPromise | null = null;
  private contract: ContractPromise | null = null;
  public contractAddress: string;
  private rpcUrl: string;

  constructor() {
    const network = getCurrentNetwork();
    this.contractAddress = network.contractAddress || '';
    this.rpcUrl = network.rpcUrl;

    if (!this.contractAddress) {
      throw new Error('Contract address not configured for current network');
    }
  }

  /**
   * Initialize connection to the blockchain
   */
  async connect() {
    if (this.api) return this.api;

    try {
      const provider = new WsProvider(this.rpcUrl);
      this.api = await ApiPromise.create({ provider });

      // Create contract instance
      this.contract = new ContractPromise(this.api, contractMetadata, this.contractAddress);

      return this.api;
    } catch (error) {
      console.error('Failed to connect to blockchain:', error);
      throw new Error('Failed to connect to blockchain');
    }
  }

  /**
   * Disconnect from blockchain
   */
  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.contract = null;
    }
  }

  /**
   * Mint a new NFT
   * @param account - Connected account from LunoKit
   * @param params - Minting parameters
   */
  async mint(account: any, params: MintParams): Promise<string> {
    try {
      await this.connect();

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      console.log('Minting NFT with params:', params);
      console.log('Contract address:', this.contractAddress);
      console.log('Account address:', account.address);

      // Get the Polkadot.js signer directly from the extension
      const polkadotSigner = await getPolkadotSigner(account.address);

      // Convert mood enum to contract format (enum variant)
      const moodMapping: Record<MoodState, string> = {
        [MoodState.Bullish]: 'Bullish',
        [MoodState.Bearish]: 'Bearish',
        [MoodState.Neutral]: 'Neutral',
        [MoodState.Volatile]: 'Volatile',
        [MoodState.PositiveSentiment]: 'PositiveSentiment',
        [MoodState.NegativeSentiment]: 'NegativeSentiment',
      };

      console.log('Submitting mint transaction...');

      // Use reasonable gas limits for pallet-revive
      const gasLimit = this.api?.registry.createType('WeightV2', {
        refTime: this.api?.registry.createType('Compact<u64>', 100000000000), // 100 billion
        proofSize: this.api?.registry.createType('Compact<u64>', 131072), // 128 KB
      }) as any;

      const storageDepositLimit = null;

      // Call the mint function
      // The contract expects: mint(to: H160, coin: String, initial_mood: MoodState)
      const tx = this.contract.tx.mint(
        { gasLimit, storageDepositLimit },
        params.to,
        params.coin,
        { [moodMapping[params.mood]]: null }
      );

      // Sign and send the transaction using the Polkadot.js signer
      const result = await tx.signAndSend(account.address, { signer: polkadotSigner });

      console.log('Mint transaction submitted:', result.toString());

      return result.toString();
    } catch (error) {
      console.error('Minting error:', error);
      throw error;
    }
  }

  /**
   * Get NFT metadata by token ID
   */
  async getMetadata(tokenId: number, callerAddress: string): Promise<any> {
    try {
      await this.connect();

      if (!this.contract || !this.api) {
        throw new Error('Contract not initialized');
      }

      const gasLimit = this.api?.registry.createType('WeightV2', {
        refTime: this.api?.registry.createType('Compact<u64>', 100000000000),
        proofSize: this.api?.registry.createType('Compact<u64>', 131072),
      }) as any;

      const { result, output } = await this.contract.query.getMetadata(
        callerAddress,
        { gasLimit, storageDepositLimit: null },
        tokenId
      );

      if (result.isErr) {
        throw new Error('Query failed');
      }

      return output?.toJSON();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  /**
   * Get owner of a token
   */
  async ownerOf(tokenId: number, callerAddress: string): Promise<string> {
    try {
      await this.connect();

      if (!this.contract || !this.api) {
        throw new Error('Contract not initialized');
      }

      const gasLimit = this.api?.registry.createType('WeightV2', {
        refTime: this.api?.registry.createType('Compact<u64>', 100000000000),
        proofSize: this.api?.registry.createType('Compact<u64>', 131072),
      }) as any;

      const { result, output } = await this.contract.query.ownerOf(
        callerAddress,
        { gasLimit, storageDepositLimit: null },
        tokenId
      );

      if (result.isErr) {
        throw new Error('Query failed');
      }

      return output?.toString() || '';
    } catch (error) {
      console.error('Error fetching owner:', error);
      throw error;
    }
  }

  /**
   * Get balance of an owner
   */
  async balanceOf(owner: string, callerAddress: string): Promise<number> {
    try {
      await this.connect();

      if (!this.contract || !this.api) {
        throw new Error('Contract not initialized');
      }

      const gasLimit = this.api?.registry.createType('WeightV2', {
        refTime: this.api?.registry.createType('Compact<u64>', 100000000000),
        proofSize: this.api?.registry.createType('Compact<u64>', 131072),
      }) as any;

      const { result, output } = await this.contract.query.balanceOf(
        callerAddress,
        { gasLimit, storageDepositLimit: null },
        owner
      );

      if (result.isErr) {
        throw new Error('Query failed');
      }

      return Number(output || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}

// Singleton instance
let contractService: ContractService | null = null;

export function getContractService(): ContractService {
  if (!contractService) {
    contractService = new ContractService();
  }
  return contractService;
}
