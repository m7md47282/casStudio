
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES, PhotoTemplate } from "../types";

/**
 * Generates a professional product photo using Gemini models.
 * Each call is strictly independent and stateless.
 */
export const generateProductPhoto = async (params: GenerationParams): Promise<string> => {
  const { prompt, templateId, resolution, aspectRatio, base64Image, logoBase64 } = params;
  
  // Create a fresh instance for every single call to ensure zero state shared between generations
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = (resolution === Resolution.R2K || resolution === Resolution.R4K) 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  // Construct the final prompt specifically for this individual job
  const selectedTemplate = PHOTO_TEMPLATES.find(t => t.id === templateId);
  
  let finalPrompt = selectedTemplate ? selectedTemplate.promptBase : 'Professional studio product photography.';
  
  // Check localstorage fallback for user templates if not in static list
  if (!selectedTemplate && templateId && templateId !== 'none') {
    const saved = localStorage.getItem('cas_user_templates');
    if (saved) {
      const userTemplates: PhotoTemplate[] = JSON.parse(saved);
      const userT = userTemplates.find(t => t.id === templateId);
      if (userT) finalPrompt = userT.promptBase;
    }
  }

  if (prompt && prompt.trim()) {
    finalPrompt += ` Additional unique scene context: ${prompt}.`;
  }

  if (logoBase64) {
    finalPrompt += ` ACTION: Place the provided secondary logo image onto the product in the primary photo. Replace any existing visible branding with this exact logo. Maintain photorealistic perspective, lighting, and texture integration.`;
  }
  
  finalPrompt += " QUALITY CONTROL: Ensure the original product structure is preserved. Integrate it naturally into the new professional environment. Output must be high-end commercial quality with sharp focus.";

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
    }

    // Add logo image if present - scoped only to this request
    if (logoBase64) {
      parts.push({
        inlineData: {
          data: logoBase64.split(',')[1],
          mimeType: 'image/png',
        },
      });
      parts.push({ text: "REFERENCED LOGO: Apply this to the product above." });
    }

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
