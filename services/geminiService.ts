
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES, PhotoTemplate } from "../types";

/**
 * Generates a professional product photo using Gemini models.
 * Each call is strictly independent and stateless.
 */
export const generateProductPhoto = async (params: GenerationParams): Promise<string> => {
  const { prompt, templateId, resolution, aspectRatio, base64Image, logoBase64, backgroundBase64 } = params;
  
  // Create a fresh instance for every single call to ensure zero state shared between generations
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = (resolution === Resolution.R2K || resolution === Resolution.R4K) 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  // Construct the final prompt specifically for this individual job
  const selectedTemplate = PHOTO_TEMPLATES.find(t => t.id === templateId);
  
  let finalPrompt = selectedTemplate ? selectedTemplate.promptBase : 'Professional high-end commercial studio product photography.';
  
  // Check localstorage fallback for user templates if not in static list
  if (!selectedTemplate && templateId && templateId !== 'none') {
    const saved = localStorage.getItem('cas_user_templates');
    if (saved) {
      const userTemplates: PhotoTemplate[] = JSON.parse(saved);
      const userT = userTemplates.find(t => t.id === templateId);
      if (userT) finalPrompt = userT.promptBase;
    }
  }

  // Inject additional custom context if provided
  if (prompt && prompt.trim()) {
    finalPrompt += ` Additionally, follow these specific details: ${prompt}.`;
  }

  // Handle background merging instruction
  if (backgroundBase64) {
    finalPrompt += ` BACKGROUND MERGING INSTRUCTION: Place the product from the SOURCE PRODUCT IMAGE into the provided CUSTOM BACKGROUND IMAGE. Seamlessly blend the product into the background. Adjust lighting on the product to match the background environment. Create realistic shadows and reflections where the product meets the background surface. The final image must look like a professional composite where the product was always there.`;
  }

  // Handle logo placement instruction
  if (logoBase64) {
    finalPrompt += ` BRANDING INSTRUCTION: Place the provided secondary logo image onto the product in the final photo. Replace any existing visible branding with this exact logo. Maintain photorealistic perspective, matching curvature, lighting, and texture integration for a seamless result.`;
  }
  
  // Global Quality Control
  finalPrompt += `\nSTRICT QUALITY GUIDELINES:
  1. Maintain the original product's exact shape, silhouette, and core design features from the source image.
  2. Seamlessly integrate the product into the environment with realistic contact shadows and light reflections.
  3. Ensure 8k resolution detail, sharp focus, and zero noise.
  4. Output must look like a high-end commercial asset suitable for a luxury e-shop or magazine.`;

  try {
    const parts: any[] = [];
    
    // Add main product image - scoped only to this request
    if (base64Image) {
      parts.push({
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "SOURCE PRODUCT IMAGE: This is the product to be re-photographed." });
    }

    // Add background image if present
    if (backgroundBase64) {
      parts.push({
        inlineData: {
          data: backgroundBase64.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "CUSTOM BACKGROUND IMAGE: Use this as the environment for the product." });
    }

    // Add logo image if present - scoped only to this request
    if (logoBase64) {
      parts.push({
        inlineData: {
          data: logoBase64.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "BRAND LOGO: Apply this logo to the product surface naturally." });
    }

    // The core prompt
    parts.push({ text: finalPrompt });

    // One-shot execution (no chat context) ensures isolation
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          ...(modelName === 'gemini-3-pro-image-preview' ? { imageSize: resolution } : {}),
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

    throw new Error("Isolated generation job completed but returned no image data.");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    console.error("Gemini Isolated Generation Error:", error);
    throw error;
  }
};
