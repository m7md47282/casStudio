
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
}

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
  // PROFESSIONAL / STUDIO
  {
    id: 'studio_session',
    label: { en: 'Full Studio', ar: 'استوديو كامل' },
    category: { en: 'Pro Studio', ar: 'استوديو احترافي' },
    description: { 
      en: 'Complete pro photoshoot look. Multi-light setup with premium props and softboxes.', 
      ar: 'مظهر جلسة تصوير كاملة. إعداد إضاءة متعددة مع ملحقات فاخرة وصناديق إضاءة ناعمة.' 
    },
    promptBase: 'A full professional high-end studio photoshoot session. The product is the center of a curated editorial set, cinematic lighting, multiple softboxes, luxury aesthetic, sharp commercial photography.'
  },
  {
    id: 'product_macro',
    label: { en: 'Macro Zoom', ar: 'تكبير ماكرو' },
    category: { en: 'Pro Studio', ar: 'استوديو احترافي' },
    description: { 
      en: 'Extreme detail focus. Best for showing craftsmanship, fine textures, and material quality.', 
      ar: 'تركيز فائق على التفاصيل. الأفضل لإظهار الحرفية والملامس الدقيقة وجودة المواد.' 
    },
    promptBase: 'Extreme macro close-up photography of the product, shallow depth of field, focusing on intricate textures and material quality, crisp details, professional lighting.'
  },
  
  // APPAREL
  {
    id: 'tshirt_male',
    label: { en: 'Male Model', ar: 'عارض أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Urban fashion look. Professional model in a minimalist high-end studio.', 
      ar: 'مظهر أزياء حضري. عارض محترف في استوديو بسيط وراقي.' 
    },
    promptBase: 'A professional male fashion model wearing the garment, standing in a minimalist high-end studio with soft rim lighting, urban fashion aesthetic.'
  },
  {
    id: 'tshirt_female',
    label: { en: 'Female Model', ar: 'عارضة أزياء' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Elegant catalog style. Clean background with soft professional lighting.', 
      ar: 'أسلوب كتالوج أنيق. خلفية نظيفة مع إضاءة احترافية ناعمة.' 
    },
    promptBase: 'A professional female fashion model wearing the garment, elegant pose, clean studio background, professional catalogue lighting.'
  },
  {
    id: 'apparel_active',
    label: { en: 'Gym / Active', ar: 'رياضي' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'High-energy gym environment. Dynamic lighting with a focus on performance and fit.', 
      ar: 'بيئة صالة ألعاب رياضية عالية الطاقة. إضاءة ديناميكية مع التركيز على الأداء والقياس.' 
    },
    promptBase: 'Athletic apparel photography in a modern high-end gym, dynamic contrast lighting, focus on fabric performance and fit, professional sports catalog style.'
  },
  {
    id: 'apparel_street',
    label: { en: 'Street Style', ar: 'نمط الشارع' },
    category: { en: 'Apparel', ar: 'ملابس' },
    description: { 
      en: 'Candid urban look. Set against concrete or graffiti in natural daylight.', 
      ar: 'مظهر حضري عفوي. موضوع أمام الخرسانة أو الجرافيتي في ضوء النهار الطبيعي.' 
    },
    promptBase: 'Street style fashion photography, urban city background, concrete textures, natural golden hour sunlight, lifestyle aesthetic.'
  },

  // FOOD & BEVERAGE
  {
    id: 'food_rustic',
    label: { en: 'Rustic Table', ar: 'طاولة ريفية' },
    category: { en: 'Food', ar: 'طعام' },
    description: { 
      en: 'Warm, organic feel. Set on a dark wooden table with scattered ingredients.', 
      ar: 'شعور دافئ وعضوي. يوضع على طاولة خشبية داكنة مع مكونات متناثرة.' 
    },
    promptBase: 'Gourmet food photography on a dark rustic wooden table, overhead shot, scattered fresh ingredients, warm natural window lighting, organic cozy aesthetic.'
  },
  {
    id: 'food_bakery',
    label: { en: 'Artisan Bakery', ar: 'مخبز يدوي' },
    category: { en: 'Food', ar: 'طعام' },
    description: { 
      en: 'Soft flour dust and warm oven light. Perfect for breads and pastries.', 
      ar: 'غبار دقيق ناعم وضوء فرن دافئ. مثالي للخبز والمعجنات.' 
    },
    promptBase: 'Professional bakery photography, warm glowing oven light, light dust of flour in the air, rustic kitchen background, artisan bread aesthetic.'
  },
  {
    id: 'food_beverage',
    label: { en: 'Liquid Splash', ar: 'رذاذ سائل' },
    category: { en: 'Food', ar: 'طعام' },
    description: { 
      en: 'Dynamic splash effect. High-speed photography look for drinks and cocktails.', 
      ar: 'تأثير رذاذ ديناميكي. مظهر تصوير عالي السرعة للمشروبات والكوكتيلات.' 
    },
    promptBase: 'High-speed beverage photography, dynamic liquid splash, crystal clear ice cubes, vibrant colors, professional bar lighting, refreshing look.'
  },

  // ELECTRONICS & TECH
  {
    id: 'tech_minimal',
    label: { en: 'Cyber Minimal', ar: 'سايبر بسيط' },
    category: { en: 'Electronics', ar: 'إلكترونيات' },
    description: { 
      en: 'Futuristic and dark. Blue rim lights on a matte black background.', 
      ar: 'مستقبلي وداكن. أضواء حافة زرقاء على خلفية سوداء مطفأة.' 
    },
    promptBase: 'Futuristic product photography for electronics, dark matte background, sharp neon blue rim lighting, floating particles, tech-noir aesthetic.'
  },
  {
    id: 'tech_gaming',
    label: { en: 'Gamer Setup', ar: 'إعداد لاعب' },
    category: { en: 'Electronics', ar: 'إلكترونيات' },
    description: { 
      en: 'Aggressive RGB lighting. Dark environment with neon glows.', 
      ar: 'إضاءة RGB قوية. بيئة داكنة مع توهجات نيون.' 
    },
    promptBase: 'Professional gaming setup background, RGB led lighting, aggressive angles, mechanical aesthetic, dark gaming room vibe.'
  },
  {
    id: 'tech_office',
    label: { en: 'Clean Desk', ar: 'مكتب نظيف' },
    category: { en: 'Electronics', ar: 'إلكترونيات' },
    description: { 
      en: 'Productivity focused. Bright minimalist wooden desk with natural plant accents.', 
      ar: 'مركز على الإنتاجية. مكتب خشبي بسيط ومشرق مع لمسات نباتية طبيعية.' 
    },
    promptBase: 'Modern minimalist office desk setup, light wood texture, green plants, soft natural morning light, productive and clean workspace aesthetic.'
  },

  // LUXURY & COSMETICS
  {
    id: 'luxury_jewelry',
    label: { en: 'Velvet Glow', ar: 'توهج مخملي' },
    category: { en: 'Beauty & Luxury', ar: 'جمال وفخامة' },
    description: { 
      en: 'Plush and premium. Focused on diamond-like sparkles and elegant reflections.', 
      ar: 'فاخر وممتاز. يركز على لمعان الألماس والانعكاسات الأنيقة.' 
    },
    promptBase: 'Luxury jewelry photography on a plush dark velvet surface, focused diamond-like sparkle highlights, soft bokeh background, elegant reflections.'
  },
  {
    id: 'cosmetic_spa',
    label: { en: 'Zen Spa', ar: 'سبا هادئ' },
    category: { en: 'Beauty & Luxury', ar: 'جمال وفخامة' },
    description: { 
      en: 'Tranquil and natural. Water ripples, stones, and botanical elements.', 
      ar: 'هادئ وطبيعي. تموجات ماء، أحجار، وعناصر نباتية.' 
    },
    promptBase: 'Zen-style cosmetic product photography, natural stone pedestal, soft water ripples in the background, eucalyptus leaves, morning sunlight.'
  },
  {
    id: 'cosmetic_marble',
    label: { en: 'Marble Chic', ar: 'رخام أنيق' },
    category: { en: 'Beauty & Luxury', ar: 'جمال وفخامة' },
    description: { 
      en: 'High-end bathroom aesthetic. White marble with gold accents.', 
      ar: 'جمالية حمام راقٍ. رخام أبيض مع لمسات ذهبية.' 
    },
    promptBase: 'Elegant cosmetic product photography, polished white marble surface, gold accents, soft vanity lighting, luxury skincare brand aesthetic.'
  },

  // HOME & LIVING
  {
    id: 'home_living',
    label: { en: 'Living Room', ar: 'غرفة المعيشة' },
    category: { en: 'Home', ar: 'المنزل' },
    description: { 
      en: 'Cozy and inviting. Scandinavian style with soft pillows and natural light.', 
      ar: 'مريح وجذاب. أسلوب اسكندنافي مع وسائد ناعمة وضوء طبيعي.' 
    },
    promptBase: 'Interior lifestyle photography, modern Scandinavian living room, soft fabric textures, warm natural lighting from a nearby window, cozy home vibe.'
  },
  {
    id: 'home_bedroom',
    label: { en: 'Nightstand', ar: 'طاولة السرير' },
    category: { en: 'Home', ar: 'المنزل' },
    description: { 
      en: 'Intimate and warm. Set on a wooden nightstand with a glowing lamp.', 
      ar: 'حميم ودافئ. يوضع على طاولة سرير خشبية مع مصباح متوهج.' 
    },
    promptBase: 'Cozy bedroom lifestyle shot, wooden nightstand, soft bokeh of a warm bed-side lamp, intimate and peaceful atmosphere.'
  },

  // FOOTWEAR
  {
    id: 'shoes_studio',
    label: { en: 'Sneaker Hero', ar: 'لقطة حذاء' },
    category: { en: 'Footwear', ar: 'أحذية' },
    description: { 
      en: 'Dynamic floating shot. High contrast studio lighting for sneakers.', 
      ar: 'لقطة طائرة ديناميكية. إضاءة استوديو عالية التباين للأحذية الرياضية.' 
    },
    promptBase: 'Professional sneaker photography, floating in mid-air, dynamic angle, high-contrast studio lighting, sharp focus on materials and sole, clean background.'
  },
  {
    id: 'shoes_street',
    label: { en: 'Urban Pavement', ar: 'رصيف حضري' },
    category: { en: 'Footwear', ar: 'أحذية' },
    description: { 
      en: 'Lifestyle walking shot. Asphalt textures and urban street vibe.', 
      ar: 'لقطة مشي عصرية. ملامس أسفلت وجو شارع حضري.' 
    },
    promptBase: 'Lifestyle footwear photography, walking on urban asphalt, stylish socks visible, blurred city street background, natural daylight.'
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
