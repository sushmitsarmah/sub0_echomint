import pinataSDK from '@pinata/sdk';
import type { MarketDataSnapshot } from './arkiv';

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
 * Initialize Pinata client
 */
function getPinataClient() {
  const apiKey = process.env.PINATA_API_KEY;
  const secretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!apiKey || !secretApiKey) {
    throw new Error('Pinata API keys not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env');
  }

  return new pinataSDK(apiKey, secretApiKey);
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

/**
 * Generate NFT image based on market data and mood
 * For now, this creates a simple data URL with mood visualization
 * In production, you would call an AI image generation API
 */
export async function generateNFTImage(
  symbol: string,
  marketData: MarketDataSnapshot,
  mood: string
): Promise<Blob> {
  // Create a canvas to generate the image
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Mood color mapping
  const moodColors: Record<string, string> = {
    Bullish: '#10b981', // green
    Bearish: '#ef4444', // red
    Neutral: '#6b7280', // gray
    Volatile: '#f59e0b', // orange
    Positive: '#3b82f6', // blue
    Negative: '#8b5cf6', // purple
  };

  const backgroundColor = moodColors[mood] || '#6b7280';

  // Draw background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 1000);

  // Draw symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(symbol, 500, 300);

  // Draw price
  ctx.font = 'bold 80px Arial';
  ctx.fillText(`$${marketData.price.toFixed(2)}`, 500, 450);

  // Draw mood
  ctx.font = 'bold 60px Arial';
  ctx.fillText(mood, 500, 600);

  // Draw 24h change
  const changeColor = marketData.priceChangePercent24h > 0 ? '#10b981' : '#ef4444';
  ctx.fillStyle = changeColor;
  ctx.font = 'bold 50px Arial';
  ctx.fillText(
    `${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%`,
    500,
    720
  );

  // Draw timestamp
  ctx.fillStyle = '#ffffff80';
  ctx.font = '30px Arial';
  ctx.fillText(new Date(marketData.timestamp).toLocaleString(), 500, 900);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create image blob'));
      }
    }, 'image/png');
  });
}

/**
 * Upload image to IPFS via Pinata
 * @returns IPFS hash (CID)
 */
export async function uploadImageToIPFS(
  imageBlob: Blob,
  fileName: string
): Promise<string> {
  try {
    console.log('📤 Uploading image to IPFS via Pinata...');

    const pinata = getPinataClient();

    // Convert blob to readable stream (Pinata expects a readable stream)
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await pinata.pinFileToIPFS(buffer as any, {
      pinataMetadata: {
        name: fileName,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    console.log(`✅ Image uploaded to IPFS: ${result.IpfsHash}`);
    return result.IpfsHash;
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
 * Upload metadata JSON to IPFS via Pinata
 * @returns IPFS hash (CID) of the metadata
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata,
  fileName: string
): Promise<string> {
  try {
    console.log('📤 Uploading metadata to IPFS via Pinata...');

    const pinata = getPinataClient();

    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: fileName,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });

    console.log(`✅ Metadata uploaded to IPFS: ${result.IpfsHash}`);
    return result.IpfsHash;
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
): Promise<{ metadataURI: string; metadata: NFTMetadata }> {
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

    console.log(`✅ NFT prepared successfully!`);
    console.log(`   Metadata URI: ${metadataURI}`);

    return { metadataURI, metadata };
  } catch (error) {
    console.error('❌ Error preparing NFT:', error);
    throw error;
  }
}
