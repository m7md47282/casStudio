
export enum Resolution {
  R1K = '1K',
  R2K = '2K',
  R4K = '4K'
}

export enum AspectRatio {
  A1_1 = '1:1',
  A3_4 = '3:4',
  A4_3 = '4:3',
  A9_16 = '9:16',
  A16_9 = '16:9'
}

export type Language = 'en' | 'ar';

export type TemplateId = 
  | 'none'
  | 'tshirt_male' 
  | 'tshirt_female' 
  | 'tshirt_flat' 
  | 'tshirt_closeup' 
  | 'generic_studio' 
  | 'generic_closeup';

export interface PhotoTemplate {
  id: TemplateId;
  label: { en: string; ar: string };
  category: { en: string; ar: string };
  description: { en: string; ar: string };
  promptBase: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  tokensUsed: number;
  modelType: 'flash' | 'pro';
}

export interface GenerationParams {
  prompt?: string;
  templateId?: TemplateId;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  base64Image?: string;
}

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
  {
    id: 'tshirt_male',
    label: { en: 'Male Model', ar: 'عارض أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Places your product on a professional male model in a high-end studio.', 
      ar: 'يضع منتجك على عارض أزياء محترف في استوديو راقٍ.' 
    },
    promptBase: 'A professional male fashion model wearing the t-shirt, standing in a minimalist high-end studio with soft rim lighting, urban fashion aesthetic'
  },
  {
    id: 'tshirt_female',
    label: { en: 'Female Model', ar: 'عارضة أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Visualizes the product on a professional female model with elegant lighting.', 
      ar: 'يعرض المنتج على عارضة أزياء محترفة مع إضاءة أنيقة.' 
    },
    promptBase: 'A professional female fashion model wearing the t-shirt, elegant pose, clean studio background, professional catalogue lighting'
  },
  {
    id: 'tshirt_flat',
    label: { en: 'Flat Lay', ar: 'تصوير مسطح' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Classic flat-lay photography on a neutral surface, perfect for catalogs.', 
      ar: 'تصوير مسطح كلاسيكي على سطح محايد، مثالي للكتالوجات.' 
    },
    promptBase: 'A professional apparel flat lay of the t-shirt on a neutral textured surface, perfectly folded, soft top-down shadows, e-commerce style'
  },
  {
    id: 'tshirt_closeup',
    label: { en: 'Fabric Detail', ar: 'تفاصيل النسيج' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Focuses on the stitching, texture, and material quality of the garment.', 
      ar: 'يركز على الخياطة والملمس وجودة مادة الملابس.' 
    },
    promptBase: 'Macro extreme close-up of the t-shirt fabric texture and collar detail, shallow depth of field, sharp focus on stitching, premium quality feel'
  },
  {
    id: 'generic_studio',
    label: { en: 'Studio Pro', ar: 'استوديو احترافي' },
    category: { en: 'General', ar: 'عام' },
    description: { 
      en: 'Clean, versatile studio shot for any physical product.', 
      ar: 'لقطة استوديو نظيفة ومتعددة الاستخدامات لأي منتج مادي.' 
    },
    promptBase: 'Professional product photography in a clean studio setting, cinematic pedestal lighting, soft gradients in background, commercial look'
  },
  {
    id: 'generic_closeup',
    label: { en: 'Hero Shot', ar: 'لقطة مقربة' },
    category: { en: 'General', ar: 'عام' },
    description: { 
      en: 'Artistic macro shot highlighting craftsmanship and material details.', 
      ar: 'لقطة ماكرو فنية تبرز الحرفية وتفاصيل المواد.' 
    },
    promptBase: 'Tight close-up macro shot of the product highlighting premium materials and craftsmanship, artistic bokeh background, sharp details'
  }
];

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
