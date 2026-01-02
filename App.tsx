
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
    placeholder: "Describe colors, materials, or environment..."
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
    placeholder: "صف الألوان أو المواد أو البيئة..."
  }
};

const BeforeAfterSlider: React.FC<{ lang: Language }> = ({ lang }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const t = translations[lang];

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 cursor-ew-resize select-none"
      onMouseDown={() => (isResizing.current = true)}
      onMouseUp={() => (isResizing.current = false)}
      onMouseLeave={() => (isResizing.current = false)}
      onMouseMove={handleMove}
      onTouchStart={() => (isResizing.current = true)}
      onTouchEnd={() => (isResizing.current = false)}
      onTouchMove={handleMove}
    >
      {/* After Image (Mastered) */}
      <div className="absolute inset-0 bg-slate-200">
        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-400 italic">PRO_MASTER_VIEW</div>
        {/* Placeholder gradient for "Mastered" feel */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-white flex flex-col items-center justify-center p-12 text-center">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-4xl mb-4">💎</div>
            <p className="text-xl font-bold text-slate-900 mb-2">High-Fidelity Render</p>
            <p className="text-sm text-slate-500 max-w-xs">Sharp textures, ray-traced lighting, and professional props.</p>
        </div>
      </div>

      {/* Before Image (Raw) */}
      <div 
        className="absolute inset-0 bg-slate-300 pointer-events-none border-r-2 border-white shadow-xl"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-500 italic">RAW_MOBILE_VIEW</div>
        {/* Placeholder for "Raw" feel */}
        <div className="absolute inset-0 bg-slate-400/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-12 text-center" style={{ width: containerRef.current?.offsetWidth }}>
            <div className="w-32 h-32 bg-slate-200 rounded-3xl flex items-center justify-center text-4xl mb-4 opacity-50 grayscale">📷</div>
            <p className="text-xl font-bold text-slate-600 mb-2">Smartphone Capture</p>
            <p className="text-sm text-slate-500 max-w-xs">Dull lighting, distracting background, and low contrast.</p>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest z-10 border border-white/20">
        {t.beforeLabel}
      </div>
      <div className="absolute top-6 right-6 px-3 py-1.5 bg-indigo-600/80 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest z-10 border border-white/20">
        {t.afterLabel}
      </div>

      {/* Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-50">
          <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
      setError(err.message === "API_KEY_EXPIRED" ? t.errorExpired : "Failed.");
    } finally { setIsGenerating(false); }
  };

  const LandingPage = () => (
    <div className={`min-h-screen bg-white selection:bg-indigo-100 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('studio')}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110">C</div>
          <span className="font-bold text-lg tracking-tighter">CasStudio</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs font-bold uppercase text-slate-400 hover:text-black transition-colors">{lang === 'en' ? 'Arabic' : 'English'}</button>
          <button onClick={() => setView('studio')} className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all active:scale-95">{t.openStudio}</button>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="hero-text mb-20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">about<sup>[01]</sup></p>
          <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-slate-900 mb-8 leading-[1.05]" 
              dangerouslySetInnerHTML={{ __html: t.landingTitle }}></h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">{t.landingSub}</p>
          <button onClick={() => setView('studio')} className="group flex items-center gap-3 mx-auto px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold hover:bg-slate-50 transition-all">
            {t.ctaHero}
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>

        <div className="hero-cards relative h-[600px] max-w-6xl mx-auto mt-12 grid grid-cols-12 items-center gap-4">
          <div className="col-span-3 h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative translate-y-12">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-left text-white">
               <p className="text-xs font-medium opacity-70 mb-2">Editorial Style</p>
               <p className="text-xl font-medium leading-tight">Professional lighting on velvet texture.</p>
            </div>
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold italic">STUDIO_RENDER_01</div>
          </div>
          <div className="col-span-3 h-[450px] bg-indigo-50 rounded-[2.5rem] p-8 flex flex-col justify-center gap-6 shadow-xl">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">📸</div>
             <p className="text-lg font-medium text-indigo-900 text-left">Scale your brand <br/> with AI visuals.</p>
             <div className="flex gap-2">
               <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center"></div>
               <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">▶</div>
             </div>
          </div>
          <div className="col-span-3 h-[380px] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl -translate-y-8">
             <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold italic">STUDIO_RENDER_02</div>
          </div>
          <div className="col-span-3 h-[420px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl translate-y-4 relative">
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">4K MASTER</div>
             <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold italic">STUDIO_RENDER_03</div>
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER SECTION */}
      <section className="reveal-section py-32 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 reveal-item space-y-8">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">services<sup>[02]</sup></p>
               <h2 className="text-5xl font-medium tracking-tight text-slate-900 leading-tight" 
                   dangerouslySetInnerHTML={{ __html: t.beforeAfterTitle }}></h2>
               <p className="text-lg text-slate-500 leading-relaxed">{t.beforeAfterSub}</p>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">RE-LIGHTING</p>
                    <p className="text-sm font-bold text-slate-800">Dynamic 3D Shadows</p>
                 </div>
                 <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">TEXTURING</p>
                    <p className="text-sm font-bold text-slate-800">High-Fidelity Cloth</p>
                 </div>
               </div>

               <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">✨</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Speed</p>
                      <p className="text-lg font-medium text-slate-900">3.4 seconds / studio render</p>
                    </div>
                 </div>
                 <button onClick={() => setView('studio')} className="group flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full text-xs font-bold hover:bg-slate-100 transition-all">
                    Open Studio
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

      {/* Added Value Section */}
      <section className="value-prop-section py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">benefits<sup>[03]</sup></p>
          <h2 className="text-5xl font-medium tracking-tight text-slate-900 mb-6 leading-tight" 
              dangerouslySetInnerHTML={{ __html: t.valuePropTitle }}></h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t.valuePropSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="value-prop-item space-y-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600 font-bold">01</div>
            <h3 className="text-xl font-bold text-slate-900">{t.valueSpeed}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{t.valueSpeedDesc}</p>
          </div>
          <div className="value-prop-item space-y-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600 font-bold">02</div>
            <h3 className="text-xl font-bold text-slate-900">{t.valueCost}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{t.valueCostDesc}</p>
          </div>
          <div className="value-prop-item space-y-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600 font-bold">03</div>
            <h3 className="text-xl font-bold text-slate-900">{t.valueQuality}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{t.valueQualityDesc}</p>
          </div>
        </div>
      </section>

      <section className="audience-section py-32 px-6 max-w-7xl mx-auto text-center border-t border-slate-100">
        <h2 className="text-4xl font-medium text-slate-900 mb-4">{t.audienceTitle}</h2>
        <p className="text-slate-500 mb-20">{t.audienceSub}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: t.value1Title, desc: t.value1Desc, icon: "🏠" },
             { title: t.value2Title, desc: t.value2Desc, icon: "📦" },
             { title: t.value3Title, desc: t.value3Desc, icon: "🔥" }
           ].map((item, i) => (
             <div key={i} className="audience-card p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left">
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      <section className="py-32 px-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#312e81,transparent)] opacity-40"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl font-medium text-white mb-6 leading-tight">{t.contactTitle}</h2>
          <p className="text-slate-400 text-lg mb-12">{t.contactSub}</p>
          <button onClick={() => setView('studio')} className="group flex items-center gap-4 mx-auto px-8 py-4 bg-white rounded-full text-sm font-bold hover:scale-105 transition-all">
            Start Generating
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-45">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">C</div>
             <div className="text-left">
               <p className="font-bold text-lg leading-none mb-1">CasStudio</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subtitle}</p>
             </div>
           </div>
           <div className="flex gap-12">
             <div className="flex flex-col gap-3 items-start">
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Platform</p>
               <a href="#" onClick={() => setView('studio')} className="text-sm font-medium text-slate-500 hover:text-black">Open Studio</a>
               <a href="#" className="text-sm font-medium text-slate-500 hover:text-black">API Access</a>
             </div>
             <div className="flex flex-col gap-3 items-start">
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Connect</p>
               <a href="#" className="text-sm font-medium text-slate-500 hover:text-black">Instagram</a>
               <a href="#" className="text-sm font-medium text-slate-500 hover:text-black">Terms of Service</a>
             </div>
           </div>
        </div>
        <p className="text-center mt-20 text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">{t.copyright}</p>
      </footer>
    </div>
  );

  if (view === 'landing') return <LandingPage />;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 transition-all ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg font-bold">C</div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-slate-200 ml-auto">
            <p className="text-sm font-black text-slate-900">{stats.totalTokens.toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span></p>
          </div>
          <Button variant="outline" onClick={() => window.aistudio?.openSelectKey()} className="hidden md:flex text-sm">{t.configure}</Button>
          <button onClick={() => setView('landing')} className="text-xs font-bold uppercase text-slate-400">Home</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-8 max-w-screen-2xl mx-auto w-full">
        <aside className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 h-fit lg:sticky lg:top-[88px]">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">1</span>
              {t.step1}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.uploadProduct}</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-2xl p-4 bg-slate-50 transition-all ${selectedImage ? 'border-black bg-white' : 'border-slate-200 hover:border-slate-400'}`}>
                    {selectedImage ? <img src={selectedImage} className="w-full h-32 object-contain" /> : <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-300"><span className="text-2xl">📸</span><p className="text-[10px] font-bold uppercase">Click to upload</p></div>}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.uploadLogo}</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-2xl p-4 bg-slate-50 transition-all ${selectedLogo ? 'border-black bg-white' : 'border-slate-200'}`}>
                    {selectedLogo ? <img src={selectedLogo} className="w-full h-12 object-contain" /> : <div className="h-12 flex flex-col items-center justify-center gap-1 text-slate-300"><p className="text-[10px] font-bold uppercase">Brand Logo</p></div>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">2</span>
              {t.step2}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedTemplate('none')} className={`col-span-2 p-3 text-[11px] font-bold rounded-xl border transition-all ${selectedTemplate === 'none' ? 'bg-black text-white border-black' : 'bg-slate-50 border-slate-100'}`}>Custom Prompt Only</button>
              {PHOTO_TEMPLATES.slice(0, 8).map(template => (
                <button key={template.id} onClick={() => setSelectedTemplate(template.id)} className={`p-3 text-left text-[10px] font-bold rounded-xl border transition-all ${selectedTemplate === template.id ? 'bg-black text-white border-black' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  {template.label[lang] || template.label.en}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">3</span>
              {t.step3}
            </h2>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-24 p-4 text-sm rounded-2xl border border-slate-100 focus:ring-2 focus:ring-black outline-none bg-slate-50" />
            <div className="grid grid-cols-2 gap-2">
               <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="p-3 text-xs font-bold rounded-xl border border-slate-100 bg-white">
                 <option value={Resolution.R1K}>1K Studio</option>
                 <option value={Resolution.R2K}>2K Premium</option>
                 <option value={Resolution.R4K}>4K Ultra</option>
               </select>
               <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="p-3 text-xs font-bold rounded-xl border border-slate-100 bg-white">
                 {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl">{error}</div>}
            <Button onClick={handleGenerate} className="w-full py-4 text-sm font-bold bg-black text-white hover:bg-slate-800 rounded-2xl" isLoading={isGenerating}>
              {isGenerating ? "PROCESSING..." : t.render}
            </Button>
          </section>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl font-medium tracking-tight text-slate-900">{t.workspace}</h2>
            <span className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500">{results.length} SAVED</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {isGenerating && (
              <div className="aspect-square bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendering masterpiece</p>
                </div>
              </div>
            )}
            {results.map((img) => (
              <div key={img.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-2xl">
                <div className="relative aspect-square bg-slate-50">
                  <img src={img.url} className="w-full h-full object-contain" />
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { const link = document.createElement('a'); link.href = img.url; link.download = `cas-${img.id}.png`; link.click(); }} 
                            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{img.templateLabel}</p>
                      <h3 className="text-lg font-bold text-slate-900">"{img.prompt || 'Clean Session'}"</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full uppercase">{img.resolution} • {img.aspectRatio}</span>
                     {img.hasLogo && <span className="px-3 py-1 bg-black text-white text-[9px] font-black rounded-full uppercase">Branded</span>}
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
