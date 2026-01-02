
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './components/Button';
import { Resolution, AspectRatio, GeneratedImage, TemplateId, PHOTO_TEMPLATES, PhotoTemplate, Language } from './types';
import { generateProductPhoto } from './services/geminiService';

declare const gsap: any;
declare const ScrollTrigger: any;

const RATES = {
  flash: 0.15,
  pro: 1.25
};

const translations = {
  en: {
    title: "CasStudio",
    subtitle: "Smartphone to Studio",
    landingTitle: "Don't settle for <span>average</span> photos!",
    landingSub: "Rely on CasStudio for year-round editorial photography. Turn your smartphone shots into premium commercial assets.",
    ctaHero: "Explore benefits",
    openStudio: "Open Studio",
    openEdit: "Remaster Studio",
    configure: "Configure Key",
    step1: "Visual Assets",
    step2: "Style Template",
    step3: "Fine-tune & Export",
    uploadProduct: "Upload Product",
    uploadLogo: "Brand Logo (Optional)",
    uploadBackground: "Custom Background (Optional)",
    render: "RENDER PRODUCT",
    workspace: "Workspace",
    resultsDesc: "Isolated renders with unique lighting interpretation.",
    saved: "HISTORY",
    beforeLabel: "RAW MOBILE SHOT",
    afterLabel: "STUDIO MASTERPIECE",
    beforeAfterTitle: "From Raw Snap to <span>Studio Masterpiece</span>",
    beforeAfterSub: "Our AI re-lights, re-textures, and re-imagines your product in high-fidelity environments. No equipment needed.",
    valuePropTitle: "Why choose <span>CasStudio</span>?",
    valuePropSub: "We've removed the barriers between your vision and a professional store-front.",
    valueSpeed: "Instant Rendering",
    valueSpeedDesc: "Get results in under 5 seconds. No more waiting for weeks of post-production.",
    valueCost: "98% Cost Reduction",
    valueCostDesc: "Professional studio results at the price of a coffee. Scale without breaking the bank.",
    valueQuality: "4K Editorial Finish",
    valueQualityDesc: "High-fidelity textures and smart lighting that rivals $2,000 photoshoots.",
    audienceTitle: "Engineered for creators.",
    audienceSub: "We empower those who move fast and value quality without the studio overhead.",
    value1Title: "Home Businesses",
    value1Desc: "Get $2000-quality photoshoots from your living room for the cost of a coffee.",
    value2Title: "E-shop Owners",
    value2Desc: "Instant listings with 4K resolution that matches your store's aesthetic perfectly.",
    value3Title: "Social Sellers",
    value3Desc: "Instagram-ready assets that stop the scroll and drive conversions instantly.",
    contactTitle: "Ready to scale your visuals?",
    contactSub: "Join thousands of brands using CasStudio to dominate their niche.",
    contactBtn: "Get in touch",
    copyright: "© 2024 CasStudio AI. All rights reserved.",
    resetBtn: "Reset All",
    clearHistory: "Clear History",
    errorExpired: "Your API key session expired. Please select it again.",
    errorNoKey: "An API key is required for High-Quality (2K/4K) generation.",
    placeholder: "Describe colors, materials, or environment...",
    customOnly: "Custom Only",
    customDesc: "No template. Fully rely on your custom description to build the scene from scratch.",
    remasterTitle: "AI Correction Studio",
    remasterDesc: "Fix incorrect text, logos, or fonts from previous renders.",
    remasterPrompt: "What needs to be fixed? (e.g., 'Change text to: Pro Hydrate')",
    correctText: "Correct Text Content",
    fontStyle: "Preferred Font Style",
    fixBtn: "REMASTER IMAGE"
  },
  ar: {
    title: "كاس استوديو",
    subtitle: "من الهاتف إلى الاستوديو",
    landingTitle: "لا ترضى بصور <span>متوسطة</span>!",
    landingSub: "اعتمد على كاس استوديو للحصول على تصوير تحريري احترافي. حول لقطات هاتفك إلى أصول تجارية فاخرة.",
    ctaHero: "اكتشف المميزات",
    openStudio: "افتح الاستوديو",
    openEdit: "استوديو التعديل",
    configure: "إعداد المفتاح",
    step1: "الأصول المرئية",
    step2: "قالب النمط",
    step3: "الضبط والتصدير",
    uploadProduct: "رفع المنتج",
    uploadLogo: "شعار العلامة (اختياري)",
    uploadBackground: "خلفية مخصصة (اختياري)",
    render: "بدء المعالجة",
    workspace: "ساحة العمل",
    resultsDesc: "معالجة مستقلة لكل صورة.",
    saved: "السجل",
    beforeLabel: "لقطة جوال خام",
    afterLabel: "تحفة استوديو",
    beforeAfterTitle: "من لقطة خام إلى <span>تحفة استوديو</span>",
    beforeAfterSub: "يقوم ذكاؤنا الاصطناعي بإعادة إضاءة منتجك وتصوره في بيئات عالية الدقة. لا حاجة للمعدات.",
    valuePropTitle: "لماذا تختار <span>كاس استوديو</span>؟",
    valuePropSub: "لقد أزلنا الحواجز بين رؤيتك وبين واجهة متجر احترافية.",
    valueSpeed: "معالجة فورية",
    valueSpeedDesc: "احصل على النتائج في أقل من 5 ثوانٍ. لا مزيد من الانتظار لأسابيع.",
    valueCost: "توفير 98% من التكاليف",
    valueCostDesc: "نتائج استوديو احترافية بسعر كوب قهوة. توسع دون استنزاف ميزانيتك.",
    valueQuality: "دقة 4K احترافية",
    valueQualityDesc: "أنسجة عالية الدقة وإضاءة ذكية تضاهي جلسات التصوير البالغة قيمتها 2000 دولار.",
    audienceTitle: "مصمم للمبدعين.",
    audienceSub: "نحن نمكن أولئك الذين يتحركون بسرعة ويقدرون الجودة دون تكاليف الاستوديو.",
    value1Title: "المشاريع المنزلية",
    value1Desc: "احصل على جلسات تصوير بجودة 2000 دولار من غرفة معيشتك بتكلفة كوب قهوة.",
    value2Title: "أصحاب المتاجر",
    value2Desc: "إدراج فوري للمنتجات بدقة 4K تطابق جمالية متجرك تماماً.",
    value3Title: "البائعين الاجتماعيين",
    value3Desc: "أصول جاهزة لإنستغرام تلفت الأنظار وتزيد المبيعات على الفور.",
    contactTitle: "جاهز لرفع مستوى مرئياتك؟",
    contactSub: "انضم إلى آلاف العلامات التجارية التي تستخدم كاس استوديو.",
    contactBtn: "تواصل معنا",
    copyright: "© 2024 كاس استوديو. جميع الحقوق محفوظة.",
    resetBtn: "إعادة ضبط",
    clearHistory: "مسح السجل",
    errorExpired: "انتهت صلاحية مفتاح API الخاص بك. يرجى اختياره مرة أخرى.",
    errorNoKey: "مفتاح API مطلوب لتوليد الصور بجودة عالية (2K/4K).",
    placeholder: "صف الألوان أو المواد أو البيئة...",
    customOnly: "مخصص فقط",
    customDesc: "بدون قالب. الاعتماد كلياً على وصفك المخصص لبناء المشهد من الصفر.",
    remasterTitle: "استوديو تصحيح الذكاء الاصطناعي",
    remasterDesc: "تصحيح النصوص أو الشعارات أو الخطوط غير الصحيحة من المعالجات السابقة.",
    remasterPrompt: "ما الذي يجب تصحيحه؟ (مثلاً: 'تغيير النص إلى: برو هايدريت')",
    correctText: "محتوى النص الصحيح",
    fontStyle: "نمط الخط المفضل",
    fixBtn: "إعادة معالجة الصورة"
  }
};

const HeroImages = {
  Tshirt: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center p-8">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center">
          <svg className="w-4/5 h-4/5 text-slate-700 opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5V7C4 7 4 10 6 12L12 15L18 12C20 10 20 7 20 7V5L12 2Z" />
            <rect x="7" y="14" width="10" height="8" rx="1" />
          </svg>
        </div>
        <div className="absolute bottom-6 left-6 text-white/40 text-[8px] font-bold tracking-[0.3em] uppercase">Product Isolation — 01</div>
      </div>
    </div>
  ),
  Model: () => (
    <div className="w-full h-full bg-[#E5E1DD] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 flex items-end justify-center">
        <div className="w-3/4 h-5/6 bg-slate-900 rounded-t-full opacity-90 relative">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#F5F0EA] rounded-full"></div>
        </div>
      </div>
      <div className="absolute top-6 right-6 text-slate-400 text-[8px] font-bold tracking-[0.3em] uppercase">Lifestyle Render — 02</div>
    </div>
  ),
  Vases: () => (
    <div className="w-full h-full bg-[#F2EDE7] flex items-center justify-center p-4">
       <div className="flex gap-4 items-end">
         <div className="w-12 h-16 bg-white rounded-t-full shadow-lg border border-slate-100"></div>
         <div className="w-20 h-20 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
           <div className="w-8 h-8 bg-[#F2EDE7] rounded-full"></div>
         </div>
         <div className="w-14 h-24 bg-white rounded-t-full shadow-lg border border-slate-100"></div>
       </div>
       <div className="absolute bottom-6 right-6 text-slate-400 text-[8px] font-bold tracking-[0.3em] uppercase">Interior Props — 03</div>
    </div>
  )
};

const BeforeAfterSlider: React.FC<{ lang: Language }> = ({ lang }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const t = translations[lang];

  const handleMove = (e: React.MouseEvent | React.TouchEvent | any) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video md:aspect-[16/9] w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 cursor-ew-resize select-none"
      onMouseDown={() => (isResizing.current = true)}
      onMouseUp={() => (isResizing.current = false)}
      onMouseLeave={() => (isResizing.current = false)}
      onMouseMove={handleMove}
      onTouchStart={() => (isResizing.current = true)}
      onTouchEnd={() => (isResizing.current = false)}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-white flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <div className="w-16 h-16 md:w-32 md:h-32 bg-white rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center mb-2 md:mb-4">
              <svg className="w-8 h-8 md:w-16 md:h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-sm md:text-xl font-bold text-slate-900 mb-1">High-Fidelity Render</p>
            <p className="text-[10px] md:text-sm text-slate-500 max-w-xs px-4">Sharp textures, ray-traced lighting, and professional props.</p>
        </div>
      </div>

      <div 
        className="absolute inset-0 bg-slate-300 pointer-events-none border-r-2 border-white shadow-xl overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="absolute inset-0 bg-slate-400/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 md:p-12 text-center" style={{ width: containerRef.current?.offsetWidth }}>
            <div className="w-16 h-16 md:w-32 md:h-32 bg-slate-200 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2 md:mb-4 opacity-50 grayscale">
              <svg className="w-8 h-8 md:w-16 md:h-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="text-sm md:text-xl font-bold text-slate-600 mb-1">Smartphone Capture</p>
            <p className="text-[10px] md:text-sm text-slate-500 max-w-xs px-4">Dull lighting, distracting background, and low contrast.</p>
        </div>
      </div>

      <div className="absolute top-4 left-4 md:top-6 md:left-6 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest z-10 border border-white/20">
        {t.beforeLabel}
      </div>
      <div className="absolute top-4 right-4 md:top-6 md:right-6 px-2 py-1 bg-indigo-600/80 backdrop-blur-md rounded-full text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest z-10 border border-white/20">
        {t.afterLabel}
      </div>

      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-10 md:h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 md:border-4 border-slate-50">
          <svg className="w-3 h-3 md:w-5 md:h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path d="M11 5l-7 7 7 7M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'studio' | 'remaster'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [correctText, setCorrectText] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('none');
  const [resolution, setResolution] = useState<Resolution>(Resolution.R1K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.A1_1);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  const stats = useMemo(() => {
    const totalTokens = results.reduce((acc, curr) => acc + curr.tokensUsed, 0);
    const totalCost = results.reduce((acc, curr) => {
      const rate = RATES[curr.modelType] / 1000000;
      return acc + (curr.tokensUsed * rate);
    }, 0);
    return { totalTokens, totalCost };
  }, [results]);

  const categorizedTemplates = useMemo(() => {
    const groups: Record<string, typeof PHOTO_TEMPLATES> = {};
    PHOTO_TEMPLATES.forEach(template => {
      const cat = template.category[lang];
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(template);
    });
    return groups;
  }, [lang]);

  useEffect(() => {
    const checkKeyOnMount = async () => {
      if ((view === 'studio' || view === 'remaster') && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
    };
    checkKeyOnMount();
  }, [view]);

  useEffect(() => {
    if (view === 'landing' && typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(".hero-text > *", { y: 60, opacity: 0, duration: 1, stagger: 0.2, ease: "power4.out" });
      gsap.from(".hero-cards > div", { y: 100, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.5 });
      gsap.to(".hero-cards > div:nth-child(odd)", { y: -20, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-cards > div:nth-child(even)", { y: 20, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

      gsap.from(".reveal-item", {
        scrollTrigger: { trigger: ".reveal-section", start: "top 80%" },
        scale: 0.9, opacity: 0, duration: 1, stagger: 0.3, ease: "power2.out"
      });
      gsap.from(".value-prop-item", {
        scrollTrigger: { trigger: ".value-prop-section", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
      });
      gsap.from(".audience-card", {
        scrollTrigger: { trigger: ".audience-section", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)"
      });
    }
  }, [view]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setSelectedImage(reader.result as string);
        else if (type === 'logo') setSelectedLogo(reader.result as string);
        else setSelectedBackground(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) { setError(lang === 'en' ? "Upload product." : "ارفع المنتج."); return; }
    
    if (resolution === Resolution.R2K || resolution === Resolution.R4K) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
    }

    setIsGenerating(true);
    setError(null);
    try {
      // Construction for Remaster mode if applicable
      let combinedPrompt = prompt;
      if (view === 'remaster') {
        combinedPrompt = `REMASTER TASK: Fix the following visual artifacts in the provided image. `;
        if (correctText) combinedPrompt += `CORRECT TEXT: The text on the product should be "${correctText}". `;
        if (fontStyle) combinedPrompt += `FONT STYLE: Use a ${fontStyle} typeface. `;
        combinedPrompt += `MAINTAIN CONSISTENCY: Keep the product shape, lighting, and background exactly as they are in the source image, only update the specified artifacts. `;
        if (prompt) combinedPrompt += `Additional context: ${prompt}`;
      }

      const imageUrl = await generateProductPhoto({
        prompt: combinedPrompt, 
        templateId: view === 'remaster' ? 'none' : (selectedTemplate !== 'none' ? selectedTemplate : undefined),
        resolution, 
        aspectRatio, 
        base64Image: selectedImage, 
        logoBase64: selectedLogo || undefined,
        backgroundBase64: selectedBackground || undefined,
      });
      const selectedT = PHOTO_TEMPLATES.find(t => t.id === selectedTemplate);
      const isPro = resolution === Resolution.R2K || resolution === Resolution.R4K;
      setResults(prev => [{
        id: Date.now().toString(), url: imageUrl, prompt: combinedPrompt,
        templateLabel: view === 'remaster' ? (lang === 'en' ? 'Remaster' : 'إعادة معالجة') : (selectedT ? selectedT.label[lang] : (lang === 'en' ? 'Custom' : 'مخصص')),
        resolution, aspectRatio, hasLogo: !!selectedLogo,
        timestamp: Date.now(), tokensUsed: isPro ? 3500 : 1800, modelType: isPro ? 'pro' : 'flash'
      }, ...prev]);
    } catch (err: any) {
      if (err.message === "API_KEY_EXPIRED" || err.message?.includes("Requested entity was not found")) {
        setError(t.errorExpired);
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        setError(err.message || "Generation failed.");
      }
    } finally { setIsGenerating(false); }
  };

  const LandingPage = () => (
    <div className={`min-h-screen bg-white selection:bg-indigo-100 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110">C</div>
          <span className="font-bold text-base md:text-lg tracking-tighter">CasStudio</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-[10px] md:text-xs font-bold uppercase text-slate-400 hover:text-black transition-colors">{lang === 'en' ? 'Arabic' : 'English'}</button>
          <button onClick={() => setView('studio')} className="px-4 md:px-6 py-2 md:py-2.5 bg-black text-white rounded-full text-[10px] md:text-xs font-bold hover:bg-slate-800 transition-all active:scale-95">{t.openStudio}</button>
        </div>
      </nav>

      <section className="pt-24 md:pt-40 pb-12 md:pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="hero-text mb-12 md:mb-20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">about<sup>[01]</sup></p>
          <h1 className="text-4xl md:text-8xl font-medium tracking-tight text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]" 
              dangerouslySetInnerHTML={{ __html: t.landingTitle }}></h1>
          <p className="text-sm md:text-lg text-slate-500 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">{t.landingSub}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setView('studio')} className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-white border border-slate-900 rounded-full text-xs font-bold hover:bg-slate-800 transition-all">
              {t.openStudio}
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </button>
            <button onClick={() => setView('remaster')} className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-full text-xs font-bold hover:bg-slate-50 transition-all">
              {t.openEdit}
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </button>
          </div>
        </div>

        <div className="hidden md:grid hero-cards relative h-[600px] max-w-6xl mx-auto mt-12 grid-cols-12 items-center gap-4">
          <div className="col-span-3 h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative translate-y-12">
            <HeroImages.Tshirt />
          </div>
          <div className="col-span-3 h-[450px] bg-indigo-50 rounded-[2.5rem] overflow-hidden shadow-xl">
             <HeroImages.Model />
          </div>
          <div className="col-span-3 h-[380px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl -translate-y-8 relative">
             <HeroImages.Vases />
          </div>
          <div className="col-span-3 h-[420px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl translate-y-4 relative flex flex-col items-center justify-center">
             <div className="p-8 text-center text-white space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">Stop the scroll with <span className="text-indigo-400">editorial</span> finish.</h3>
                <button onClick={() => setView('studio')} className="px-6 py-2 bg-indigo-600 rounded-full text-[10px] font-bold uppercase hover:bg-indigo-500 transition-all">Launch Studio</button>
             </div>
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-20 px-6 border-t border-slate-100">
        <p className="text-center text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">{t.copyright}</p>
      </footer>
    </div>
  );

  if (view === 'landing') return <LandingPage />;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 transition-all ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg font-bold">C</div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-xl font-bold text-slate-900 tracking-tight leading-tight">{t.title}</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-tight leading-tight">{view === 'studio' ? t.subtitle : t.remasterTitle}</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
          <button 
            onClick={() => setView('studio')} 
            className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${view === 'studio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            STUDIO
          </button>
          <button 
            onClick={() => setView('remaster')} 
            className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${view === 'remaster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            REMASTER
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="outline" onClick={() => window.aistudio?.openSelectKey()} className="hidden md:flex text-xs py-1.5 px-3">{t.configure}</Button>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-[10px] font-bold uppercase text-slate-400">{lang === 'en' ? 'AR' : 'EN'}</button>
          <button onClick={() => setView('landing')} className="text-[10px] md:text-xs font-bold uppercase text-slate-400">Home</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 md:gap-8 max-w-screen-2xl mx-auto w-full">
        <aside className="w-full lg:w-[380px] xl:w-[400px] flex flex-col gap-4 md:gap-6 shrink-0 h-fit lg:sticky lg:top-[88px]">
          <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">1</span>
              {view === 'remaster' ? (lang === 'en' ? 'Upload Image to Fix' : 'رفع الصورة للتصحيح') : t.step1}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.uploadProduct}</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl md:rounded-2xl p-4 bg-slate-50 transition-all ${selectedImage ? 'border-black bg-white' : 'border-slate-200 hover:border-slate-400'}`}>
                    {selectedImage ? <img src={selectedImage} className="w-full h-32 md:h-40 object-contain" /> : (
                      <div className="h-32 md:h-40 flex flex-col items-center justify-center gap-2 text-slate-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <p className="text-[10px] font-bold uppercase">Source Image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.uploadLogo}</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl md:rounded-2xl p-3 bg-slate-50 transition-all ${selectedLogo ? 'border-black bg-white' : 'border-slate-200'}`}>
                    {selectedLogo ? <img src={selectedLogo} className="w-full h-10 md:h-12 object-contain" /> : (
                      <div className="h-10 md:h-12 flex flex-col items-center justify-center gap-1 text-slate-300">
                        <p className="text-[9px] md:text-[10px] font-bold uppercase">Correct Logo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {view === 'studio' && (
            <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">2</span>
                {t.step2}
              </h2>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                <button onClick={() => setSelectedTemplate('none')} className={`w-full p-2.5 text-[10px] font-bold rounded-xl border transition-all ${selectedTemplate === 'none' ? 'bg-black text-white border-black' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                  {t.customOnly}
                </button>
                {Object.entries(categorizedTemplates).map(([category, templates]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-[9px] font-black uppercase text-slate-300 tracking-widest px-1">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {templates.map(template => (
                        <button key={template.id} onClick={() => setSelectedTemplate(template.id)} className={`w-full p-2 text-left text-[10px] font-bold rounded-xl border transition-all ${selectedTemplate === template.id ? 'bg-black text-white' : 'bg-white border-slate-100'}`}>
                          {template.label[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">{view === 'studio' ? '3' : '2'}</span>
              {view === 'studio' ? t.step3 : (lang === 'en' ? 'Correction Details' : 'تفاصيل التصحيح')}
            </h2>
            
            {view === 'remaster' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t.correctText}</label>
                  <input value={correctText} onChange={(e) => setCorrectText(e.target.value)} placeholder="e.g., 'Fresh Orange Juice'" className="w-full p-3 text-sm rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t.fontStyle}</label>
                  <input value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} placeholder="e.g., 'Modern Serif', 'Bold Sans'" className="w-full p-3 text-sm rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-black" />
                </div>
              </>
            )}

            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={view === 'remaster' ? t.remasterPrompt : t.placeholder} className="w-full h-24 p-3 text-sm rounded-xl border border-slate-100 focus:ring-2 focus:ring-black outline-none bg-slate-50 transition-all" />
            
            <div className="grid grid-cols-2 gap-2">
               <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="p-2 text-xs font-bold rounded-xl border border-slate-100 bg-white">
                 <option value={Resolution.R1K}>1K Render</option>
                 <option value={Resolution.R2K}>2K Studio</option>
                 <option value={Resolution.R4K}>4K Ultra</option>
               </select>
               <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="p-2 text-xs font-bold rounded-xl border border-slate-100 bg-white">
                 {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            {error && <div className="p-2 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl">{error}</div>}
            <Button onClick={handleGenerate} className="w-full py-4 text-sm font-bold bg-black text-white hover:bg-slate-800 rounded-2xl" isLoading={isGenerating}>
              {isGenerating ? "PROCESSING..." : (view === 'studio' ? t.render : t.fixBtn)}
            </Button>
          </section>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text