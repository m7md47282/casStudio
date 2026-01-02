
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/Button';
import { Resolution, AspectRatio, GeneratedImage, TemplateId, PHOTO_TEMPLATES, Language } from '../types';
import { generateProductPhotoAction } from './actions';

// Price per 1M tokens (estimated for simulation)
const RATES = {
  flash: 0.15, // $0.15 per 1M tokens
  pro: 1.25    // $1.25 per 1M tokens
};

const translations = {
  en: {
    title: "CasStudio",
    subtitle: "AI-Powered E-Commerce Assets",
    configure: "Configure Key",
    step1: "Source Image",
    step2: "Style Template",
    step3: "Fine-tune & Export",
    upload: "Upload Product",
    change: "CHANGE PHOTO",
    customOnly: "Custom Only",
    customDesc: "No template. Fully rely on your custom description to build the scene from scratch.",
    context: "Custom Context (Optional)",
    placeholder: "Describe colors, materials, or environment...",
    quality: "Quality",
    format: "Format",
    render: "RENDER PRODUCT",
    rendering: "RENDERING ON BACKEND...",
    workspace: "Workspace",
    resultsDesc: "Professional renders powered by Server Actions",
    saved: "SAVED",
    awaiting: "Awaiting Inputs",
    processingDesc: "CasStudio is re-lighting your product in a professional environment",
    proMastered: "PRO MASTERED",
    totalUsage: "Total Usage",
    estCost: "Est. Cost",
    tokens: "Tokens",
    errorSelect: "Please select a template or describe your scene.",
    errorExpired: "Your API key session expired. Please select it again.",
    errorGeneric: "Generation failed. Try a different image."
  },
  ar: {
    title: "كاس استوديو",
    subtitle: "أصول التجارة الإلكترونية بالذكاء الاصطناعي",
    configure: "إعداد المفتاح",
    step1: "صورة المنتج",
    step2: "قالب النمط",
    step3: "الضبط والتصدير",
    upload: "رفع المنتج",
    change: "تغيير الصورة",
    customOnly: "تخصيص فقط",
    customDesc: "بدون قالب. الاعتماد كلياً على وصفك المخصص لبناء المشهد من الصفر.",
    context: "سياق مخصص (اختياري)",
    placeholder: "صف الألوان أو المواد أو البيئة...",
    quality: "الجودة",
    format: "التنسيق",
    render: "بدء المعالجة",
    rendering: "جاري المعالجة على الخادم...",
    workspace: "ساحة العمل",
    resultsDesc: "صور احترافية مدعومة بإجراءات الخادم",
    saved: "محفوظ",
    awaiting: "بانتظار المدخلات",
    processingDesc: "يقوم كاس استوديو بإعادة إضاءة منتجك في بيئة احترافية",
    proMastered: "إتقان احترافي",
    totalUsage: "إجمالي الاستخدام",
    estCost: "التكلفة التقديرية",
    tokens: "رمز",
    errorSelect: "يرجى اختيار قالب أو وصف المشهد الخاص بك.",
    errorExpired: "انتهت صلاحية مفتاح API الخاص بك. يرجى اختياره مرة أخرى.",
    errorGeneric: "فشلت عملية التوليد. حاول باستخدام صورة أخرى."
  }
};

const ImageMagnifier: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const magnifierHeight = 200;
  const magnifierWidth = 200;
  const zoomLevel = 2.5;

  return (
    <div
      className="relative w-full h-full cursor-crosshair overflow-hidden"
      onMouseEnter={(e) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
      }}
      onMouseMove={(e) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.pageXOffset;
        const y = e.pageY - top - window.pageYOffset;
        setXY([x, y]);
      }}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />

      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            border: "2px solid #6366f1",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            backgroundPosition: `${-x * zoomLevel + magnifierWidth / 2}px ${-y * zoomLevel + magnifierHeight / 2}px`,
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default function CasStudioPage() {
  const [lang, setLang] = useState<Language>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
    };
    checkKey();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (selectedTemplate === 'none' && !prompt.trim()) {
      setError(t.errorSelect);
      return;
    }

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
      const response = await generateProductPhotoAction({
        prompt,
        templateId: selectedTemplate !== 'none' ? selectedTemplate : undefined,
        resolution,
        aspectRatio,
        base64Image: selectedImage || undefined,
      });

      const selectedT = PHOTO_TEMPLATES.find(t => t.id === selectedTemplate);
      const templateLabel = selectedT ? selectedT.label[lang] : (lang === 'en' ? 'Custom' : 'مخصص');
      const displayPrompt = prompt.trim() ? `${templateLabel}: ${prompt}` : templateLabel;

      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: response.imageUrl,
        prompt: displayPrompt,
        timestamp: Date.now(),
        tokensUsed: response.tokensUsed,
        modelType: response.modelType
      };

      setResults(prev => [newResult, ...prev]);
    } catch (err: any) {
      if (err.message === "API_KEY_EXPIRED") {
        setError(t.errorExpired);
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        setError(err.message || t.errorGeneric);
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 transition-all ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-slate-200 ml-auto rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-6">
            <div className="text-right rtl:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.totalUsage}</p>
              <p className="text-sm font-black text-slate-900">{stats.totalTokens.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{t.tokens}</span></p>
            </div>
            <div className="text-right rtl:text-left">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{t.estCost}</p>
              <p className="text-sm font-black text-indigo-600">${stats.totalCost.toFixed(4)} <span className="text-[10px] text-indigo-400 font-normal">USD</span></p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setLang('en')} className={`px-2 py-1 text-[10px] font-bold rounded ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>EN</button>
            <button onClick={() => setLang('ar')} className={`px-2 py-1 text-[10px] font-bold rounded ${lang === 'ar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>AR</button>
          </div>

          <Button variant="outline" onClick={() => window.aistudio?.openSelectKey()} className="hidden md:flex text-sm whitespace-nowrap">
            {t.configure}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-8 max-w-screen-2xl mx-auto w-full">
        <aside className="w-full lg:w-[420px] flex flex-col gap-6 shrink-0 h-fit lg:sticky lg:top-[88px]">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">1</span>
              {t.step1}
            </h2>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white ${selectedImage ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300'}`}>
                {selectedImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">{t.change}</div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <p className="text-xs text-slate-500 font-bold uppercase">{t.upload}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">2</span>
              {t.step2}
            </h2>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="relative group/tooltip">
                <button 
                  onClick={() => setSelectedTemplate('none')}
                  className={`w-full p-3 text-xs font-bold rounded-xl border transition-all ${selectedTemplate === 'none' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                  {t.customOnly}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none border border-slate-700">
                  {t.customDesc}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
              </div>

              {Object.entries(categorizedTemplates).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 bg-slate-50/50 p-1 rounded">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(template => (
                      <div key={template.id} className="relative group/tooltip">
                        <button
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`w-full p-3 text-left rtl:text-right text-[11px] leading-tight rounded-xl border transition-all flex flex-col gap-1 h-full ${selectedTemplate === template.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                        >
                          <span className="font-bold">{template.label[lang]}</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none border border-slate-700">
                          <p className="font-bold text-indigo-400 mb-1 uppercase text-[9px] tracking-widest">{template.label[lang]}</p>
                          {template.description[lang]}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600 font-bold">3</span>
              {t.step3}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.context}</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full h-24 p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t.quality}</label>
                  <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white">
                    <option value={Resolution.R1K}>1K Standard</option>
                    <option value={Resolution.R2K}>2K Studio</option>
                    <option value={Resolution.R4K}>4K Ultra</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{t.format}</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 bg-white">
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100">{error}</div>}
              <Button onClick={handleGenerate} className="w-full py-4 text-sm font-bold shadow-xl shadow-indigo-100" isLoading={isGenerating}>
                {isGenerating ? t.rendering : t.render}
              </Button>
            </div>
          </section>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{t.workspace}</h2>
              <p className="text-sm text-slate-500 font-medium mt-2">{t.resultsDesc}</p>
            </div>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">{results.length} {t.saved}</span>
          </div>

          {results.length === 0 && !isGenerating ? (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-white/50">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{t.awaiting}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
              {isGenerating && (
                <div className="aspect-square bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white animate-pulse" />
                  <div className="relative z-10 flex flex-col items-center text-center px-8">
                     <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                     <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">{lang === 'en' ? 'Rendering...' : 'جاري المعالجة...'}</p>
                     <p className="text-slate-400 text-xs mt-2 font-medium">{t.processingDesc}</p>
                  </div>
                </div>
              )}
              {results.map((img) => (
                <div key={img.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl">
                  <div className="relative flex-1 bg-slate-50 min-h-[400px]">
                    <ImageMagnifier src={img.url} alt={img.prompt} />
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-0 group-hover:opacity-100 transition-all z-20">
                      <Button variant="secondary" className="rounded-full shadow-lg h-12 w-12 p-0" onClick={() => downloadImage(img.url, `cas-studio-${img.id}.png`)}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-3">
                       <h3 className="text-sm font-black text-slate-800 leading-tight flex-1">"{img.prompt}"</h3>
                       <span className="text-[10px] font-black text-slate-400 uppercase shrink-0">{new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex gap-2">
                       <span className="text-[9px] font-black tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">{t.proMastered}</span>
                       <span className="text-[9px] font-black tracking-widest bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{img.tokensUsed} {t.tokens}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Noto Sans Arabic', sans-serif; }
      `}} />
    </div>
  );
}
