import type { Route } from "./+types/generate-image";
import { GoogleGenAI } from "@google/genai";

/**
 * 🔴 SERVER-ONLY API ROUTE
 * POST /api/generate-image
 *
 * Generate AI images using Google Gemini API
 * Accepts a prompt and returns a base64 encoded image
 */
export async function action({ request }: Route.ActionArgs) {
  try {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, numberOfImages = 1 } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Initialize Google GenAI client (using Gemini API)
    const ai = new GoogleGenAI({ vertexai: false, apiKey });

    // Generate image
    const response = await ai.models.generateImages({
      model: "gemini-2.5-flash-image",
      prompt,
      config: {
        numberOfImages,
        includeRaiReason: true,
      },
    });

    // Check if images were generated
    if (!response?.generatedImages || response.generatedImages.length === 0) {
      return Response.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Extract image data (base64 encoded)
    const imageBytes = response.generatedImages[0]?.image?.imageBytes;

    if (!imageBytes) {
      return Response.json(
        { error: "No image data found in response" },
        { status: 500 }
      );
    }

    // Return the base64 encoded image
    return Response.json({
      success: true,
      image: imageBytes,
      mimeType: "image/png",
      prompt,
      raiReason: response.generatedImages[0]?.raiFilteredReason || null,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
