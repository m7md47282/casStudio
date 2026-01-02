
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
    configure: "Configure Key",
    step1: "Visual Assets",
    step2: "Style Template",
    step3: "Fine-tune & Export",
    uploadProduct: "Upload Product",
    uploadLogo: "Brand Logo (Optional)",
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
    customDesc: "No template. Fully rely on your custom description to build the scene from scratch."
  },
  ar: {
    title: "كاس استوديو",
    subtitle: "من الهاتف إلى الاستوديو",
    landingTitle: "لا ترضى بصور <span>متوسطة</span>!",
    landingSub: "اعتمد على كاس استوديو للحصول على تصوير تحريري احترافي. حول لقطات هاتفك إلى أصول تجارية فاخرة.",
    ctaHero: "اكتشف المميزات",
    openStudio: "افتح الاستوديو",
    configure: "إعداد المفتاح",
    step1: "الأصول المرئية",
    step2: "قالب النمط",
    step3: "الضبط والتصدير",
    uploadProduct: "رفع المنتج",
    uploadLogo: "شعار العلامة",
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
    customDesc: "بدون قالب. الاعتماد كلياً على وصفك المخصص لبناء المشهد من الصفر."
  }
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
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
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
    // Mandatory key check for high-quality models if we're in studio
    const checkKeyOnMount = async () => {
      if (view === 'studio' && window.aistudio) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setSelectedImage(reader.result as string);
        else setSelectedLogo(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) { setError(lang === 'en' ? "Upload product." : "ارفع المنتج."); return; }
    
    // Check key selection for Gemini 3 Pro mandatory requirement
    if (resolution === Resolution.R2K || resolution === Resolution.R4K) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Proceed after trigger as per race condition guidelines
        }
      }
    }

    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateProductPhoto({
        prompt, templateId: selectedTemplate !== 'none' ? selectedTemplate : undefined,
        resolution, aspectRatio, base64Image: selectedImage, logoBase64: selectedLogo || undefined,
      });
      const selectedT = PHOTO_TEMPLATES.find(t => t.id === selectedTemplate);
      const isPro = resolution === Resolution.R2K || resolution === Resolution.R4K;
      setResults(prev => [{
        id: Date.now().toString(), url: imageUrl, prompt,
        templateLabel: selectedT ? selectedT.label[lang] : (lang === 'en' ? 'Custom' : 'مخصص'),
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
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('studio')}>
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
          <button onClick={() => setView('studio')} className="group flex items-center gap-3 mx-auto px-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold hover:bg-slate-50 transition-all">
            {t.ctaHero}
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>

        <div className="block md:hidden mb-12">
          <div className="aspect-[4/5] bg-slate-100 rounded-3xl shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-left text-white">
               <p className="text-[10px] font-medium opacity-70 mb-1">Curation Preview</p>
               <p className="text-xl font-medium leading-tight">Professional lighting everywhere.</p>
            </div>
          </div>
        </div>

        <div className="hidden md:grid hero-cards relative h-[600px] max-w-6xl mx-auto mt-12 grid-cols-12 items-center gap-4">
          <div className="col-span-3 h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative translate-y-12">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-left text-white">
               <p className="text-xs font-medium opacity-70 mb-2">Editorial Style</p>
               <p className="text-xl font-medium leading-tight">Professional lighting on velvet texture.</p>
            </div>
          </div>
          <div className="col-span-3 h-[450px] bg-indigo-50 rounded-[2.5rem] p-8 flex flex-col justify-center gap-6 shadow-xl">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <p className="text-lg font-medium text-indigo-900 text-left">Scale your brand <br/> with AI visuals.</p>
          </div>
          <div className="col-span-3 h-[380px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl -translate-y-8">
             <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold italic tracking-tighter">STUDIO_RENDER</div>
          </div>
          <div className="col-span-3 h-[420px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl translate-y-4 relative">
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">4K MASTER</div>
          </div>
        </div>
      </section>

      <section className="reveal-section py-16 md:py-32 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
            <div className="flex-1 reveal-item space-y-6 md:space-y-8">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">services<sup>[02]</sup></p>
               <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 leading-tight" 
                   dangerouslySetInnerHTML={{ __html: t.beforeAfterTitle }}></h2>
               <p className="text-base md:text-lg text-slate-500 leading-relaxed">{t.beforeAfterSub}</p>
               
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                 <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm space-y-1 md:space-y-2">
                    <p className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest">RE-LIGHTING</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800">Dynamic 3D Shadows</p>
                 </div>
                 <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm space-y-1 md:space-y-2">
                    <p className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest">TEXTURING</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800">High-Fidelity Cloth</p>
                 </div>
               </div>

               <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-4 md:gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Speed</p>
                      <p className="text-base md:text-lg font-medium text-slate-900">3.4 seconds / studio render</p>
                    </div>
                 </div>
                 <button onClick={() => setView('studio')} className="group flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-full text-[10px] md:text-xs font-bold hover:bg-slate-100 transition-all">
                    {t.openStudio}
                    <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                 </button>
               </div>
            </div>
            
            <div className="flex-1 w-full reveal-item">
              <BeforeAfterSlider lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <section className="value-prop-section py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">benefits<sup>[03]</sup></p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4 md:mb-6 leading-tight" 
              dangerouslySetInnerHTML={{ __html: t.valuePropTitle }}></h2>
          <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">{t.valuePropSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { id: '01', title: t.valueSpeed, desc: t.valueSpeedDesc },
            { id: '02', title: t.valueCost, desc: t.valueCostDesc },
            { id: '03', title: t.valueQuality, desc: t.valueQualityDesc }
          ].map((v, i) => (
            <div key={i} className="value-prop-item space-y-4 md:space-y-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl text-indigo-600 font-bold">{v.id}</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900">{v.title}</h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-32 px-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#312e81,transparent)] opacity-40"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-medium text-white mb-4 md:mb-6 leading-tight">{t.contactTitle}</h2>
          <p className="text-sm md:text-lg text-slate-400 mb-8 md:mb-12 leading-relaxed">{t.contactSub}</p>
          <button onClick={() => setView('studio')} className="group flex items-center gap-4 mx-auto px-6 md:px-8 py-3 md:py-4 bg-white rounded-full text-xs md:text-sm font-bold hover:scale-105 transition-all">
            Start Generating
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-45">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      </section>

      <footer className="py-12 md:py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">C</div>
             <div className="text-left">
               <p className="font-bold text-base md:text-lg leading-none mb-1">CasStudio</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subtitle}</p>
             </div>
           </div>
        </div>
        <p className="text-center mt-12 md:mt-20 text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">{t.copyright}</p>
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
            <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-tight leading-tight">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-slate-200 ml-auto">
            <p className="text-sm font-black text-slate-900">{stats.totalTokens.toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span></p>
          </div>
          <Button variant="outline" onClick={() => window.aistudio?.openSelectKey()} className="hidden md:flex text-xs py-1.5 px-3">{t.configure}</Button>
          <button onClick={() => setView('landing')} className="text-[10px] md:text-xs font-bold uppercase text-slate-400">Home</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 md:gap-8 max-w-screen-2xl mx-auto w-full">
        <aside className="w-full lg:w-[380px] xl:w-[400px] flex flex-col gap-4 md:gap-6 shrink-0 h-fit lg:sticky lg:top-[88px]">
          <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">1</span>
              {t.step1}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.uploadProduct}</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl md:rounded-2xl p-4 bg-slate-50 transition-all ${selectedImage ? 'border-black bg-white' : 'border-slate-200 hover:border-slate-400'}`}>
                    {selectedImage ? <img src={selectedImage} className="w-full h-24 md:h-32 object-contain" /> : (
                      <div className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 text-slate-300">
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase">Click to upload</p>
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
                        <p className="text-[9px] md:text-[10px] font-bold uppercase">Brand Logo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">2</span>
              {t.step2}
            </h2>
            
            <div className="space-y-4 md:space-y-6 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="relative group/tooltip">
                <button 
                  onClick={() => setSelectedTemplate('none')}
                  className={`w-full p-2.5 md:p-3 text-[10px] md:text-xs font-bold rounded-xl border transition-all ${selectedTemplate === 'none' ? 'bg-black text-white border-black shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'}`}
                >
                  {t.customOnly}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-56 p-2 md:p-3 bg-slate-900 text-white text-[10px] md:text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none border border-slate-700">
                  {t.customDesc}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
              </div>

              {Object.entries(categorizedTemplates).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-[8px] md:text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-2 px-1">
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(template => (
                      <div key={template.id} className="relative group/tooltip">
                        <button
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`w-full p-2 md:p-3 text-left text-[9px] md:text-[10px] font-bold rounded-xl border transition-all h-full min-h-[40px] md:min-h-0 ${selectedTemplate === template.id ? 'bg-black text-white border-black shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                        >
                          {template.label[lang] || template.label.en}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-56 p-2 md:p-3 bg-slate-900 text-white text-[10px] md:text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none border border-slate-700">
                          <p className="font-bold text-indigo-400 mb-1 uppercase text-[8px] md:text-[9px] tracking-widest">{template.label[lang] || template.label.en}</p>
                          {template.description[lang] || template.description.en}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">3</span>
              {t.step3}
            </h2>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-20 md:h-24 p-3 md:p-4 text-xs md:text-sm rounded-xl md:rounded-2xl border border-slate-100 focus:ring-2 focus:ring-black outline-none bg-slate-50 transition-all" />
            <div className="grid grid-cols-2 gap-2">
               <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="p-2 md:p-3 text-[10px] md:text-xs font-bold rounded-xl border border-slate-100 bg-white outline-none">
                 <option value={Resolution.R1K}>1K Studio</option>
                 <option value={Resolution.R2K}>2K Premium</option>
                 <option value={Resolution.R4K}>4K Ultra</option>
               </select>
               <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="p-2 md:p-3 text-[10px] md:text-xs font-bold rounded-xl border border-slate-100 bg-white outline-none">
                 {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            {error && <div className="p-2 md:p-3 bg-red-50 text-red-500 text-[9px] md:text-[10px] font-bold rounded-lg md:rounded-xl">{error}</div>}
            <Button onClick={handleGenerate} className="w-full py-3 md:py-4 text-xs md:text-sm font-bold bg-black text-white hover:bg-slate-800 rounded-xl md:rounded-2xl transition-all" isLoading={isGenerating}>
              {isGenerating ? "PROCESSING..." : t.render}
            </Button>
          </section>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-slate-900 leading-none">{t.workspace}</h2>
              <p className="text-[10px] md:text-sm text-slate-400 font-medium mt-1 md:mt-2">{t.resultsDesc}</p>
            </div>
            <span className="self-start md:self-auto px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] md:text-xs font-bold text-slate-500">{results.length} SAVED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {isGenerating && (
              <div className="aspect-square bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-slate-50 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 text-center">Rendering masterpiece</p>
                </div>
              </div>
            )}
            {results.map((img) => (
              <div key={img.id} className="group bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl">
                <div className="relative aspect-square bg-slate-50">
                  <img src={img.url} className="w-full h-full object-contain" alt={img.prompt} />
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { const link = document.createElement('a'); link.href = img.url; link.download = `cas-${img.id}.png`; link.click(); }} 
                            className="w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg>
                    </button>
                  </div>
                </div>
                <div className="p-5 md:p-8">
                  <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <p className="text-[8px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">{img.templateLabel}</p>
                    <h3 className="text-sm md:text-lg font-bold text-slate-900 leading-snug line-clamp-2">"{img.prompt || 'Clean Session'}"</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-2 md:px-3 py-1 bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-black rounded-full uppercase">{img.resolution} • {img.aspectRatio}</span>
                     {img.hasLogo && <span className="px-2 md:px-3 py-1 bg-black text-white text-[8px] md:text-[9px] font-black rounded-full uppercase">Branded</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
