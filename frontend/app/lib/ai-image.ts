/**
 * AI Image Generation for NFTs
 * Uses Google Gemini API via server-side route
 */

import type { MarketDataSnapshot } from './arkiv';

/**
 * Professional AI image prompts for each mood state
 * Based on EchoMint design specifications
 */
const MOOD_PROMPTS: Record<string, string> = {
  Bullish: `A vibrant, futuristic artwork symbolizing a rising {{COIN}} market. Bright upward motion, glowing lines, neon highlights, optimistic energy bursting upward like a sunrise over a digital landscape. Abstract crystal textures, smooth gradients, and an aura of acceleration. Ultra-detailed, high contrast, cinematic lighting.`,

  Bearish: `Dark, moody abstract art representing a falling {{COIN}} market. Sharp downward angles, fractured surfaces, red embers fading into shadows. Digital storm aesthetic, glitch fractures, a sense of descent and pressure. Heavy contrast, minimal ambient light.`,

  Neutral: `A serene and balanced visual representation of {{COIN}} market neutrality. Soft gradients, smooth geometric forms, evenly distributed symmetry. Calm floating shapes, pastel tones, gentle illumination. Minimalist digital art with a tranquil atmosphere.`,

  Volatile: `A chaotic and extremely energetic abstract artwork symbolizing high volatility for {{COIN}}. Glitch distortions, swirling lines, explosive contrasts, rapidly shifting layers. Electric neon pulses, fragmented geometry, unstable digital patterns. High-intensity visual noise.`,

  PositiveSentiment: `A warm and uplifting digital artwork capturing strong positive sentiment around {{COIN}}. Golden ambient lighting, soft glow particles, smooth organic shapes expanding outward. Radiant harmony, uplifting atmosphere, optimistic impression.`,

  NegativeSentiment: `A dark, corrupted digital art style expressing negative sentiment for {{COIN}}. Static noise textures, warped shapes, shadowy gradients, subtle glitch corruption. An unsettling digital tension, cold atmosphere, fragmented shadows.`,
};

/**
 * Generate AI image prompt based on market data and mood
 */
function generateImagePrompt(symbol: string, marketData: MarketDataSnapshot, mood: string): string {
  // Get the prompt template for this mood
  const promptTemplate = MOOD_PROMPTS[mood] || MOOD_PROMPTS.Neutral;

  // Replace {{COIN}} with the actual symbol
  const prompt = promptTemplate.replace(/\{\{COIN\}\}/g, symbol);

  return prompt;
}

/**
 * Generate canvas-based fallback image
 */
function generateCanvasImage(
  symbol: string,
  marketData: MarketDataSnapshot,
  mood: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Mood color mapping
    const moodColors: Record<string, string> = {
      Bullish: '#10b981',
      Bearish: '#ef4444',
      Neutral: '#6b7280',
      Volatile: '#f59e0b',
      PositiveSentiment: '#3b82f6',
      NegativeSentiment: '#8b5cf6',
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
 * Generate NFT image using AI (with fallback to canvas)
 * @param symbol - Cryptocurrency symbol (e.g., "SOL", "BTC")
 * @param marketData - Current market data from Arkiv
 * @param mood - Calculated mood state
 * @returns Image blob
 */
export async function generateNFTImage(
  symbol: string,
  marketData: MarketDataSnapshot,
  mood: string
): Promise<Blob> {
  try {
    // Generate AI prompt
    const prompt = generateImagePrompt(symbol, marketData, mood);
    console.log('🎨 Generating AI image with prompt:', prompt);

    // Call image generation API
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        numberOfImages: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }

    const data = await response.json();

    if (!data.success || !data.image) {
      throw new Error('No image data received from API');
    }

    // Convert base64 to Blob
    const base64Data = data.image;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('✅ AI image generated successfully');
    return new Blob([bytes], { type: data.mimeType || 'image/png' });
  } catch (aiError) {
    console.warn('⚠️ AI generation failed, falling back to canvas:', aiError);

    // Fallback to canvas-based generation
    return await generateCanvasImage(symbol, marketData, mood);
  }
}
