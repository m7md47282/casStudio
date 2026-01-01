
"use server";

import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES } from "../types";

export async function generateProductPhotoAction(params: GenerationParams): Promise<{ imageUrl: string; tokensUsed: number; modelType: 'flash' | 'pro' }> {
  const { prompt, templateId, resolution, aspectRatio, base64Image } = params;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isPro = resolution === Resolution.R2K || resolution === Resolution.R4K;
  const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const selectedTemplate = PHOTO_TEMPLATES.find(t => t.id === templateId);
  let finalPrompt = selectedTemplate ? selectedTemplate.promptBase : 'Professional studio product photography.';
  
  if (prompt && prompt.trim()) {
    finalPrompt += ` Additional scene context: ${prompt}.`;
  }
  
  finalPrompt += " Ensure the original product from the image is preserved and integrated naturally into the new professional scene. High quality, commercially viable, sharp focus.";

  try {
    const contents: any[] = [];
    
    if (base64Image) {
      contents.push({
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: 'image/png',
        },
      });
    }

    contents.push({ text: finalPrompt });

    // Pre-calculate tokens
    const tokenCountResponse = await ai.models.countTokens({
      model: modelName,
      contents: [{ parts: contents }]
    });
    const tokensUsed = tokenCountResponse.totalTokens || 0;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contents },
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
          return {
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            tokensUsed,
            modelType: isPro ? 'pro' : 'flash'
          };
        }
      }
    }

    throw new Error("No image was returned by the model.");
  } catch (error: any) {
    console.error("Gemini Server Action Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw new Error("The studio encountered an error rendering your image.");
  }
}
