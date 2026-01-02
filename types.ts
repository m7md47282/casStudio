
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
  | string
  | 'none'
  | 'studio_session'
  | 'product_macro'
  | 'tshirt_male' 
  | 'tshirt_female' 
  | 'tshirt_flat'
  | 'apparel_active'
  | 'apparel_street'
  | 'food_rustic'
  | 'food_modern'
  | 'food_bakery'
  | 'food_beverage'
  | 'tech_minimal'
  | 'tech_gaming'
  | 'tech_office'
  | 'luxury_jewelry'
  | 'cosmetic_spa'
  | 'cosmetic_marble'
  | 'home_living'
  | 'home_bedroom'
  | 'shoes_studio'
  | 'shoes_street';

export interface PhotoTemplate {
  id: TemplateId;
  label: { en: string; ar: string };
  category: { en: string; ar: string };
  description: { en: string; ar: string };
  promptBase: string;
  isUserCreated?: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  templateLabel: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  hasLogo: boolean;
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
  logoBase64?: string;
  backgroundBase64?: string;
}

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
  // PROFESSIONAL / STUDIO
  {
    id: 'studio_session',
    label: { en: 'White Studio', ar: 'استوديو أبيض' },
    category: { en: 'Pro Studio', ar: 'استوديو احترافي' },
    description: { 
      en: 'Pure minimalist white background. Perfect for e-commerce and clean brand listings.', 
      ar: 'خلفية بيضاء بسيطة ونقية. مثالية للتجارة الإلكترونية وقوائم العلامات التجارية النظيفة.' 
    },
    promptBase: 'Professional high-end commercial product photography. The product is placed in a pure, clean, minimalist white studio environment with a subtle seamless horizon. Bright, even high-key lighting using multiple softboxes. No harsh shadows. Sharp focus on the product textures. 8k resolution, editorial e-commerce quality.'
  },
  {
    id: 'product_macro',
    label: { en: 'Macro Detail', ar: 'تفاصيل ماكرو' },
    category: { en: 'Pro Studio', ar: 'استوديو احترافي' },
    description: { 
      en: 'Extreme detail focus. Best for showing craftsmanship and fine material textures.', 
      ar: 'تركيز فائق على التفاصيل. الأفضل لإظهار الحرفية وملامس المواد الدقيقة.' 
    },
    promptBase: 'Extreme macro close-up product photography. Super shallow depth of field with creamy bokeh background. Focus is pin-sharp on the most intricate details and textures of the product. Professional studio macro lighting setup, high-fidelity capture, 8k resolution.'
  },
  
  // APPAREL
  {
    id: 'tshirt_male',
    label: { en: 'Male Editorial', ar: 'عارض أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Professional male model in a high-end minimalist studio setting.', 
      ar: 'عارض أزياء محترف في استوديو بسيط وراقي.' 
    },
    promptBase: 'High-end fashion editorial. A professional male model is wearing the product. The setting is a minimalist architectural studio with large windows and soft natural directional light. Cinematic composition, sharp focus on fabric drapes and fit, 8k resolution.'
  },
  {
    id: 'tshirt_female',
    label: { en: 'Female Editorial', ar: 'عارضة أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Elegant catalog style. Clean background with soft professional studio lighting.', 
      ar: 'أسلوب كتالوج أنيق. خلفية نظيفة مع إضاءة استوديو احترافية ناعمة.' 
    },
    promptBase: 'Professional female fashion model wearing the product. Elegant studio pose, neutral grey background, high-key professional catalog lighting. Sharp focus on garment details, luxury fashion photography style, 8k resolution.'
  },
  {
    id: 'apparel_active',
    label: { en: 'Performance', ar: 'أداء رياضي' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'High-energy gym environment. Focus on performance and athletic fit.', 
      ar: 'بيئة صالة رياضية عالية الطاقة. تركيز على الأداء والقياس الرياضي.' 
    },
    promptBase: 'Athletic apparel performance photography. Set in a modern, high-tech luxury gym. Dynamic high-contrast lighting, sharp focus on technical fabric textures and sweat-wicking details. Energetic atmosphere, professional sports brand aesthetic.'
  },

  // FOOD & BEVERAGE
  {
    id: 'food_rustic',
    label: { en: 'Rustic Gourmet', ar: 'طعام ريفي' },
    category: { en: 'Food', ar: 'طعام' },
    description: { 
      en: 'Warm, organic feel. Set on aged oak with natural ingredient accents.', 
      ar: 'شعور دافئ وعضوي. يوضع على خشب البلوط المعتق مع لمسات من المكونات الطبيعية.' 
    },
    promptBase: 'Professional gourmet food photography. Product is styled on an aged rustic oak table. Natural side window lighting creating soft shadows. Garnished with scattered fresh raw ingredients. Organic, warm, appetizing aesthetic, 8k resolution.'
  },
  {
    id: 'food_beverage',
    label: { en: 'Liquid Action', ar: 'حركة السوائل' },
    category: { en: 'Food', ar: 'طعام' },
    description: { 
      en: 'Dynamic splash effect. Professional high-speed drink photography.', 
      ar: 'تأثير رذاذ ديناميكي. تصوير مشروبات احترافي عالي السرعة.' 
    },
    promptBase: 'High-speed beverage action photography. Dynamic, crystal-clear liquid splash caught in mid-air. Studio lighting setup with fast flash duration. Vibrant colors, refreshing atmosphere, commercial drink advertisement style.'
  },

  // ELECTRONICS & TECH
  {
    id: 'tech_minimal',
    label: { en: 'Tech Noir', ar: 'تقنية داكنة' },
    category: { en: 'Electronics', ar: 'إلكترونيات' },
    description: { 
      en: 'Futuristic and dark. Precision rim lighting on matte surfaces.', 
      ar: 'مستقبلي وداكن. إضاءة حافة دقيقة على الأسطح المطفأة.' 
    },
    promptBase: 'Futuristic tech product photography. Dark matte carbon fiber background. Sharp neon cyan and magenta rim lighting. Floating holographic UI elements. High-end gadget commercial aesthetic, 8k resolution, cinematic tech-noir vibe.'
  },

  // LUXURY & COSMETICS
  {
    id: 'luxury_jewelry',
    label: { en: 'Diamond Sparkle', ar: 'بريق الماس' },
    category: { en: 'Beauty & Luxury', ar: 'جمال وفخامة' },
    description: { 
      en: 'Premium sparkle focus. Elegant reflections on black silk.', 
      ar: 'تركيز على البريق الفاخر. انعكاسات أنيقة على الحرير الأسود.' 
    },
    promptBase: 'Luxury high-end jewelry photography. Product is resting on a black liquid silk fabric. Intense point-light sources creating multiple star-burst sparkles. Elegant caustic reflections, deep blacks, sharp focus, 8k resolution.'
  },
  {
    id: 'cosmetic_spa',
    label: { en: 'Botanical Zen', ar: 'زن نباتي' },
    category: { en: 'Beauty & Luxury', ar: 'جمال وفخامة' },
    description: { 
      en: 'Tranquil and natural. Water ripples and soft botanical elements.', 
      ar: 'هادئ وطبيعي. تموجات ماء ولمسات نباتية ناعمة.' 
    },
    promptBase: 'Tranquil cosmetic product photography. Product is placed on a wet stone pedestal. Soft rippling water in the foreground. Diffused morning sunlight through eucalyptus leaves. Clean, organic, peaceful spa aesthetic.'
  },

  // HOME & LIVING
  {
    id: 'home_living',
    label: { en: 'Modern Scandi', ar: 'مودرن اسكندنافي' },
    category: { en: 'Home', ar: 'المنزل' },
    description: { 
      en: 'Bright and cozy. Scandinavian living room with natural light.', 
      ar: 'مشرق ومريح. غرفة معيشة اسكندنافية مع ضوء طبيعي.' 
    },
    promptBase: 'Interior design lifestyle photography. Product is integrated into a bright modern Scandinavian living room. Soft neutral color palette, natural afternoon sunlight from a large window. High-quality furniture, cozy and aspirational atmosphere.'
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
