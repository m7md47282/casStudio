
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES, PhotoTemplate } from "../types";

/**
 * Generates or edits a product photo using Gemini models.
 * Handles Studio (generation), Remaster (fixing artifacts), and Upscale (resolution enhancement).
 */
export const generateProductPhoto = async (params: GenerationParams): Promise<string> => {
  const { prompt, templateId, resolution, aspectRatio, base64Image, logoBase64, backgroundBase64 } = params;
  
  // Create a fresh instance for every single call to ensure zero state shared
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isPro = resolution === Resolution.R2K || resolution === Resolution.R4K;
  const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const selectedTemplate = PHOTO_TEMPLATES.find(t => t.id === templateId);
  let finalPrompt = selectedTemplate ? selectedTemplate.promptBase : 'Professional high-end commercial product photography.';
  
  // Logic for Remaster/Upscale detection based on prompt prefixes or absence of template
  const isUpscale = prompt?.includes("STRICT UPSCALE TASK");
  const isRemaster = prompt?.includes("REMASTER TASK");

  if (isUpscale) {
    finalPrompt = prompt; // Use the specialized upscale prompt directly
  } else if (isRemaster) {
    finalPrompt = prompt; // Use the specialized remaster prompt directly
  } else {
    // Normal Studio mode
    if (prompt && prompt.trim()) {
      finalPrompt += ` Additionally, follow these specific details: ${prompt}.`;
    }
    
    if (backgroundBase64) {
      finalPrompt += ` BACKGROUND MERGING: Seamlessly place the product from the source image into the provided custom background. Ensure realistic contact shadows and environmental lighting matching.`;
    }
  }

  // Handle logo placement instruction globally if provided
  if (logoBase64 && !isUpscale) {
    finalPrompt += ` BRANDING: Place the provided logo image onto the product. Replace any existing branding. Match the surface curvature, lighting, and texture for a 100% photorealistic result.`;
  }
  
  // Strict Quality Enforcement
  if (!isUpscale) {
    finalPrompt += `\nSTRICT QUALITY GUIDELINES:
    1. Preserve the product's core identity, shape, and silhouette.
    2. Render in ${resolution} resolution with editorial-grade sharpness.
    3. Ensure physically accurate lighting and shadows.
    4. Output must be commercial-ready with zero AI artifacts.`;
  }

  try {
    const parts: any[] = [];
    
    if (base64Image) {
      parts.push({
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "SOURCE IMAGE: This is the reference for the task." });
    }

    if (backgroundBase64 && !isUpscale && !isRemaster) {
      parts.push({
        inlineData: {
          data: backgroundBase64.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "CUSTOM BACKGROUND: Use this environment." });
    }

    if (logoBase64 && !isUpscale) {
      parts.push({
        inlineData: {
          data: logoBase64.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "BRAND LOGO: Apply this to the product." });
    }

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          ...(isPro ? { imageSize: resolution } : {}),
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Generation completed but returned no image data.");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
