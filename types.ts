
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
  label: string;
  category: string;
  promptBase: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
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
    label: 'Male Model',
    category: 'T-Shirt',
    promptBase: 'A professional male fashion model wearing the t-shirt, standing in a minimalist high-end studio with soft rim lighting, urban fashion aesthetic'
  },
  {
    id: 'tshirt_female',
    label: 'Female Model',
    category: 'T-Shirt',
    promptBase: 'A professional female fashion model wearing the t-shirt, elegant pose, clean studio background, professional catalogue lighting'
  },
  {
    id: 'tshirt_flat',
    label: 'Flat Lay',
    category: 'T-Shirt',
    promptBase: 'A professional apparel flat lay of the t-shirt on a neutral textured surface, perfectly folded, soft top-down shadows, e-commerce style'
  },
  {
    id: 'tshirt_closeup',
    label: 'Fabric Detail',
    category: 'T-Shirt',
    promptBase: 'Macro extreme close-up of the t-shirt fabric texture and collar detail, shallow depth of field, sharp focus on stitching, premium quality feel'
  },
  {
    id: 'generic_studio',
    label: 'Studio Pro',
    category: 'General',
    promptBase: 'Professional product photography in a clean studio setting, cinematic pedestal lighting, soft gradients in background, commercial look'
  },
  {
    id: 'generic_closeup',
    label: 'Product Detail',
    category: 'General',
    promptBase: 'Tight close-up macro shot of the product highlighting premium materials and craftsmanship, artistic bokeh background, sharp details'
  }
];
