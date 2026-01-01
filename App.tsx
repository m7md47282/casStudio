
import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Resolution, AspectRatio, GeneratedImage, TemplateId, PHOTO_TEMPLATES } from './types';
import { generateProductPhoto } from './services/geminiService';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('none');
  const [resolution, setResolution] = useState<Resolution>(Resolution.R1K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.A1_1);
  const [error, setError] = useState<string | null>(null);

  // Mandatory step: check for API key on mount to ensure user is ready for high-quality models
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
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
    // If no template and no prompt, error out
    if (selectedTemplate === 'none' && !prompt.trim()) {
      setError("Please select a template or describe your scene.");
      return;
    }

    // Ensure API key is selected when upgrading to high-quality models like gemini-3-pro-image-preview
    if (resolution === Resolution.R2K || resolution === Resolution.R4K) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assume success after triggering dialog to mitigate race conditions
        }
      }
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateProductPhoto({
        prompt,
        templateId: selectedTemplate !== 'none' ? selectedTemplate : undefined,
        resolution,
        aspectRatio,
        base64Image: selectedImage || undefined,
      });

      const templateLabel = PHOTO_TEMPLATES.find(t => t.id === selectedTemplate)?.label || 'Custom';
      const displayPrompt = prompt.trim() ? `${templateLabel}: ${prompt}` : templateLabel;

      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: displayPrompt,
        timestamp: Date.now(),
      };

      setResults(prev => [newResult, ...prev]);
    } catch (err: any) {
      // If the API key is invalid or missing, prompt the user to re-select
      if (err.message === "API_KEY_EXPIRED") {
        setError("Your API key session expired. Please select it again.");
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError("Generation failed. Check your prompt or try a different image.");
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CasStudio</h1>
            <p className="text-xs text-slate-500 font-medium">AI-Powered E-Commerce Assets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.aistudio?.openSelectKey()} className="hidden md:flex text-sm">
            Configure Key
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-8 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          {/* Step 1: Image Upload */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600">1</span>
              Source Image
            </h2>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white ${selectedImage ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300'}`}>
                {selectedImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">CHANGE PHOTO</div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <p className="text-xs text-slate-500 font-bold uppercase">Upload Product</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 2: Templates */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600">2</span>
              Style Template
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedTemplate('none')}
                className={`p-3 text-xs font-bold rounded-xl border transition-all ${selectedTemplate === 'none' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
              >
                Custom Only
              </button>
              {PHOTO_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-3 text-left text-[11px] leading-tight rounded-xl border transition-all flex flex-col gap-1 ${selectedTemplate === template.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                  <span className={`uppercase text-[9px] tracking-tighter ${selectedTemplate === template.id ? 'text-indigo-200' : 'text-slate-400'}`}>{template.category}</span>
                  <span className="font-bold">{template.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Custom Details & Settings */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-600">3</span>
              Fine-tune & Export
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom Context (Optional)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe colors, materials, or environment to blend with template..."
                  className="w-full h-24 p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quality</label>
                  <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 outline-none bg-white">
                    <option value={Resolution.R1K}>1K Standard</option>
                    <option value={Resolution.R2K}>2K Studio</option>
                    <option value={Resolution.R4K}>4K Ultra</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Format</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full p-2 text-xs font-bold rounded-lg border border-slate-200 outline-none bg-white">
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100">{error}</div>}

              <Button onClick={handleGenerate} className="w-full py-4 text-sm font-bold shadow-xl shadow-indigo-100" isLoading={isGenerating}>
                {isGenerating ? 'RENDERING...' : 'RENDER PRODUCT'}
              </Button>
            </div>
          </section>
        </aside>

        {/* Results Workspace */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Workspace</h2>
              <p className="text-sm text-slate-500 font-medium">Professional renders based on your product uploads</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">{results.length} SAVED</span>
            </div>
          </div>

          {results.length === 0 && !isGenerating ? (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-white/50">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Awaiting Studio Inputs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
              {isGenerating && (
                <div className="aspect-square bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white animate-pulse" />
                  <div className="relative z-10 flex flex-col items-center text-center px-8">
                     <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                     <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">Rendering...</p>
                     <p className="text-slate-400 text-xs mt-2 font-medium">CasStudio is re-lighting your product in a professional studio</p>
                  </div>
                </div>
              )}
              {results.map((img) => (
                <div key={img.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:border-indigo-100">
                  <div className="relative flex-1 bg-slate-50 min-h-[400px]">
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
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
                       <span className="text-[9px] font-black tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">2400 DPI</span>
                       <span className="text-[9px] font-black tracking-widest bg-indigo-50 text-indigo-600 px-2 py-1 rounded">MASTERED</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
