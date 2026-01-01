
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES } from "../types";

export const generateProductPhoto = async (params: GenerationParams): Promise<string> => {
  const { prompt, templateId, resolution, aspectRatio, base64Image } = params;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = (resolution === Resolution.R2K || resolution === Resolution.R4K) 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  // Construct the final prompt from template + custom user input
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

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contents },
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

    throw new Error("No image was returned by the model.");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
