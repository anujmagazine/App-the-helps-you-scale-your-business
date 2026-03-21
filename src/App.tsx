import { useState, useRef } from "react";
import { 
  Upload, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Loader2,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { analyzeBusiness, ScalingAnalysis } from "./services/gemini";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScalingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!url && !file) {
      setError("Please provide a website URL or upload a PDF document.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let pdfBase64 = undefined;
      let pdfMimeType = undefined;

      if (file) {
        pdfBase64 = await fileToBase64(file);
        pdfMimeType = file.type;
      }

      const analysis = await analyzeBusiness(url || undefined, pdfBase64, pdfMimeType);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">ScaleUp AI</h1>
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">
            Business Model Deconstruction • v1.0
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-zinc-900">
            Scale from 1 to 100 with <span className="text-emerald-600">Precision</span>.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Upload your business brochure or provide a website URL. Our AI will deconstruct your model, identify scaling bottlenecks, and provide actionable strategies for growth.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <h3 className="font-semibold text-zinc-900">Website URL</h3>
            </div>
            <div className="relative">
              <input
                type="url"
                placeholder="https://yourbusiness.com"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h3 className="font-semibold text-zinc-900">Business PDF</h3>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                file ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50"
              )}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 size={18} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <Upload size={24} />
                  <span className="text-sm">Click to upload brochure or docs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleAnalyze}
            disabled={loading || (!url && !file)}
            className="group relative px-8 py-4 bg-zinc-900 text-white rounded-full font-semibold text-lg flex items-center gap-3 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing Business...</span>
              </>
            ) : (
              <>
                <span>Generate Scaling Strategy</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-12 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Business Model & Example */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-10 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-8 text-emerald-600 uppercase tracking-widest text-xs font-bold">
                    <Zap size={14} />
                    <span>Business Model Deconstruction</span>
                  </div>
                  <div className="prose prose-zinc max-w-none">
                    <ReactMarkdown>{result.businessModel}</ReactMarkdown>
                  </div>
                </section>

                <section className="bg-zinc-900 p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp size={120} />
                  </div>
                  <div className="flex items-center gap-2 mb-8 text-emerald-400 uppercase tracking-widest text-xs font-bold relative z-10">
                    <ChevronRight size={14} />
                    <span>The Customer Journey (Example)</span>
                  </div>
                  <div className="prose prose-invert max-w-none relative z-10 font-serif text-xl leading-relaxed opacity-90">
                    <ReactMarkdown>{result.example}</ReactMarkdown>
                  </div>
                </section>
              </div>

              {/* Scaling Blockers */}
              <section>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="text-amber-500" size={28} />
                  Scaling Blockers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.scalingBlockers.map((blocker, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 bg-white border border-zinc-200 rounded-2xl flex gap-4 items-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-zinc-700 font-medium leading-snug">{blocker}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Actionable Ideas */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <TrendingUp className="text-emerald-600" size={28} />
                    The 1-to-100 Growth Roadmap
                  </h3>
                  <div className="px-4 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Actionable Strategies
                  </div>
                </div>
                <div className="space-y-4">
                  {result.actionableIdeas.map((idea, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="group bg-white border border-zinc-200 p-6 rounded-3xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                    >
                      <div className="sm:w-1/4">
                        <div className={cn(
                          "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2",
                          idea.impact === "High" ? "bg-red-100 text-red-700" :
                          idea.impact === "Medium" ? "bg-blue-100 text-blue-700" :
                          "bg-zinc-100 text-zinc-700"
                        )}>
                          {idea.impact} Impact
                        </div>
                        <h4 className="font-bold text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">
                          {idea.title}
                        </h4>
                      </div>
                      <div className="sm:w-3/4 text-zinc-600 leading-relaxed">
                        {idea.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Footer Note */}
              <footer className="text-center pt-12 pb-6 border-t border-zinc-200">
                <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
                  ScaleUp AI • Powered by Gemini 3.1 Pro
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
