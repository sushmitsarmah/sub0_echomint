import { PinataSDK } from 'pinata';
import type { MarketDataSnapshot } from './arkiv';
import { generateNFTImage } from './ai-image';

/**
 * OpenSea-compatible NFT Metadata standard
 * https://docs.opensea.io/docs/metadata-standards
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Initialize Pinata SDK
 */
function getPinataClient() {
  const jwt = import.meta.env.VITE_PINATA_JWT || import.meta.env.PINATA_JWT;
  const gateway = import.meta.env.VITE_GATEWAY_URL || 'gateway.pinata.cloud';

  if (!jwt) {
    throw new Error('Pinata JWT not configured. Please set VITE_PINATA_JWT in .env');
  }

  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway,
  });
}

/**
 * Calculate mood based on market data
 */
function calculateMood(marketData: MarketDataSnapshot): string {
  const { priceChangePercent24h, volume24h } = marketData;

  if (priceChangePercent24h > 5) return 'Bullish';
  if (priceChangePercent24h < -5) return 'Bearish';
  if (Math.abs(priceChangePercent24h) > 10) return 'Volatile';
  if (priceChangePercent24h > 0) return 'Positive';
  if (priceChangePercent24h < 0) return 'Negative';
  return 'Neutral';
}

// Image generation is now in ai-image.ts
// Re-export for backward compatibility
export { generateNFTImage } from './ai-image';

/**
 * Upload image to IPFS via Pinata SDK
 * @returns IPFS hash (CID)
 */
export async function uploadImageToIPFS(
  imageBlob: Blob,
  fileName: string
): Promise<string> {
  try {
    console.log('📤 Uploading image to IPFS via Pinata...');

    const pinata = getPinataClient();

    // Convert Blob to File
    const file = new File([imageBlob], fileName, { type: imageBlob.type });

    // Upload file to Pinata
    const upload = await pinata.upload.public.file(file);

    console.log(`✅ Image uploaded to IPFS: ${upload.cid}`);
    return upload.cid;
  } catch (error) {
    console.error('❌ Error uploading image to IPFS:', error);
    throw error;
  }
}

/**
 * Create OpenSea-compatible metadata
 */
export function createNFTMetadata(
  symbol: string,
  marketData: MarketDataSnapshot,
  mood: string,
  imageIPFSHash: string
): NFTMetadata {
  return {
    name: `EchoMint ${symbol} - ${mood}`,
    description: `A living NFT that reflects the ${symbol} market sentiment. This NFT was minted at $${marketData.price.toFixed(2)} with a ${mood} mood based on ${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}% 24h change. Data sourced from Arkiv Network.`,
    image: `ipfs://${imageIPFSHash}`,
    external_url: 'https://echomint.xyz',
    attributes: [
      {
        trait_type: 'Token',
        value: symbol,
      },
      {
        trait_type: 'Mood',
        value: mood,
      },
      {
        trait_type: 'Mint Price',
        value: `$${marketData.price.toFixed(2)}`,
      },
      {
        trait_type: '24h Change',
        value: `${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%`,
      },
      {
        trait_type: 'Volume 24h',
        value: marketData.volume24h,
      },
      {
        trait_type: 'Market Cap',
        value: marketData.marketCap,
      },
      {
        trait_type: 'Mint Timestamp',
        value: new Date(marketData.timestamp).toISOString(),
      },
    ],
  };
}

/**
 * Upload metadata JSON to IPFS via Pinata SDK
 * @returns IPFS hash (CID) of the metadata
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata,
  fileName: string
): Promise<string> {
  try {
    console.log('📤 Uploading metadata to IPFS via Pinata...');

    const pinata = getPinataClient();

    // Upload JSON to Pinata
    const upload = await pinata.upload.public.json(metadata);

    console.log(`✅ Metadata uploaded to IPFS: ${upload.cid}`);
    return upload.cid;
  } catch (error) {
    console.error('❌ Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Complete NFT preparation pipeline:
 * 1. Generate image based on market data
 * 2. Upload image to IPFS
 * 3. Create metadata
 * 4. Upload metadata to IPFS
 * @returns Metadata IPFS URI (ipfs://...)
 */
export async function prepareNFTForMinting(
  symbol: string,
  marketData: MarketDataSnapshot
): Promise<{ metadataURI: string; metadata: NFTMetadata; imageUrl: string }> {
  try {
    console.log(`🎨 Preparing NFT for ${symbol}...`);

    // Calculate mood
    const mood = calculateMood(marketData);
    console.log(`   Mood: ${mood}`);

    // Generate image
    console.log('   Generating image...');
    const imageBlob = await generateNFTImage(symbol, marketData, mood);

    // Upload image to IPFS
    const imageIPFSHash = await uploadImageToIPFS(
      imageBlob,
      `echomint-${symbol}-${Date.now()}.png`
    );

    // Create metadata
    const metadata = createNFTMetadata(symbol, marketData, mood, imageIPFSHash);

    // Upload metadata to IPFS
    const metadataIPFSHash = await uploadMetadataToIPFS(
      metadata,
      `echomint-${symbol}-${Date.now()}.json`
    );

    const metadataURI = `ipfs://${metadataIPFSHash}`;

    // Construct gateway URL for displaying the image
    const gateway = import.meta.env.VITE_GATEWAY_URL || 'gateway.pinata.cloud';
    const imageUrl = `https://${gateway}/ipfs/${imageIPFSHash}`;

    console.log(`✅ NFT prepared successfully!`);
    console.log(`   Metadata URI: ${metadataURI}`);
    console.log(`   Image URL: ${imageUrl}`);

    return { metadataURI, metadata, imageUrl };
  } catch (error) {
    console.error('❌ Error preparing NFT:', error);
    throw error;
  }
}
