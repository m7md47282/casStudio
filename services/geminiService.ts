
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, Resolution, PHOTO_TEMPLATES, PhotoTemplate } from "../types";

export const generateProductPhoto = async (params: GenerationParams): Promise<string> => {
  const { prompt, templateId, resolution, aspectRatio, base64Image } = params;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = (resolution === Resolution.R2K || resolution === Resolution.R4K) 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  // Construct the final prompt
  // NOTE: In the current structure, geminiService doesn't have access to App's userTemplates state directly.
  // We'll search in static templates first. If not found, we rely on the prompt being passed or we'd need to pass the template object.
  // To fix this cleanly, let's find the template from a merged list passed or handle prompt construction in App.tsx.
  // Let's assume for simplicity we try to find it in default templates, otherwise the finalPrompt will use standard base.
  
  const selectedTemplate = PHOTO_TEMPLATES.find(t => t.id === templateId);
  
  // If template is userCreated, the UI should have merged the base already? 
  // No, let's make the service more robust by accepting the full promptBase if templateId is custom.
  // Actually, a better pattern is to let the service just handle the prompt provided.
  
  let finalPrompt = selectedTemplate ? selectedTemplate.promptBase : 'Professional studio product photography.';
  
  // If it's a user template, it won't be in static PHOTO_TEMPLATES.
  // Let's check localstorage here as a fallback or assume the caller should have resolved it.
  if (!selectedTemplate && templateId && templateId !== 'none') {
    const saved = localStorage.getItem('cas_user_templates');
    if (saved) {
      const userTemplates: PhotoTemplate[] = JSON.parse(saved);
      const userT = userTemplates.find(t => t.id === templateId);
      if (userT) finalPrompt = userT.promptBase;
    }
  }

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
