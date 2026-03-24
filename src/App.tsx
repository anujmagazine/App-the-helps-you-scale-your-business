import { useState, useRef, useEffect } from "react";
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
  Zap,
  Download,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { analyzeBusiness, ScalingAnalysis } from "./services/gemini";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import { domToCanvas } from "modern-screenshot";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation,
  Link
} from "react-router-dom";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">ScaleUp AI</h1>
        </Link>
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">
          Business Model Deconstruction • v1.0
        </div>
      </div>
    </header>
  );
}

function Home() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

    try {
      let pdfBase64 = undefined;
      let pdfMimeType = undefined;

      if (file) {
        pdfBase64 = await fileToBase64(file);
        pdfMimeType = file.type;
      }

      const analysis = await analyzeBusiness(url || undefined, pdfBase64, pdfMimeType);
      navigate("/results", { state: { result: analysis } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
    </main>
  );
}

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ScalingAnalysis | null;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) {
      navigate("/");
    }
  }, [result, navigate]);

  if (!result) return null;

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      const element = resultsRef.current;
      
      console.log("Starting PDF generation with modern-screenshot...");
      
      // Use modern-screenshot to capture the element
      // It handles modern CSS like oklch much better than html2canvas
      let canvas;
      try {
        canvas = await domToCanvas(element, {
          scale: 1,
          backgroundColor: "#F8F9FA",
          filter: (node) => {
            if (node instanceof HTMLElement) {
              // Exclude buttons, links, and elements with 'no-print' class from the PDF
              if (node.tagName === 'BUTTON' || node.tagName === 'A' || node.classList.contains('no-print')) return false;
            }
            return true;
          },
          onCloneNode: (cloned) => {
            if (cloned instanceof HTMLElement) {
              // Remove transforms that might interfere with capture
              const allElements = cloned.querySelectorAll('*');
              allElements.forEach(el => {
                if (el instanceof HTMLElement) {
                  el.style.transform = 'none';
                  el.style.transition = 'none';
                  el.style.animation = 'none';
                }
              });
            }
          }
        });
      } catch (captureError: any) {
        throw new Error(`DOM capture failed: ${captureError.message || "Unknown capture error"}`);
      }
      
      if (!canvas) throw new Error("Canvas generation failed");

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      
      // Initialize jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add pages
      try {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
        
        // Sanitize filename
        const safeCompanyName = (result.companyName || 'analysis').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        pdf.save(`scaling-strategy-${safeCompanyName}.pdf`);
      } catch (pdfError: any) {
        throw new Error(`PDF assembly failed: ${pdfError.message || "Unknown PDF error"}`);
      }
      
    } catch (err: any) {
      console.error("PDF Generation Error:", err);
      setError(`Error: ${err.message || "Failed to generate PDF"}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Analysis
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 pb-20"
      >
        <div ref={resultsRef} className="space-y-12">
          <div className="border-b-4 border-zinc-900 pb-10 mb-10">
            <div className="max-w-4xl">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.95] mb-6">
                Scaling Strategy Report: <span className="text-emerald-600">{result.companyName}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-6 text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">Business Deconstruction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">Growth Roadmap</span>
                </div>
                <div className="text-sm font-mono ml-auto">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-8 no-print">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold text-base hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Download size={20} />
              )}
              <span>{downloading ? "Generating Report..." : "Download Full Strategy PDF"}</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
              <AlertTriangle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Business Model */}
          <section className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
              Business Model Deconstruction
            </h3>
          </div>
          <div className="prose prose-zinc max-w-none prose-lg">
            <ReactMarkdown>{result.businessModel}</ReactMarkdown>
          </div>
        </section>

        {/* Customer Journeys */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-zinc-900 text-emerald-400 rounded-xl flex items-center justify-center">
              <ChevronRight size={20} />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900">
              Prominent Customer Journeys
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {result.customerJourneys.map((journey, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden border border-white/5 flex flex-col"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <TrendingUp size={120} />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-emerald-400 mb-6 relative z-10">
                  {journey.title}
                </h4>
                <div className="prose prose-invert max-w-none relative z-10 prose-sm text-zinc-100 leading-relaxed flex-grow">
                  <ReactMarkdown>{journey.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

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
                className="p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    blocker.priority === "High" ? "bg-red-100 text-red-700" :
                    blocker.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {blocker.priority} Priority
                  </div>
                </div>
                <p className="text-zinc-700 font-medium leading-snug">{blocker.title}</p>
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
          <div className="space-y-6">
            {result.actionableIdeas.map((idea, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="group bg-white border border-zinc-200 p-8 rounded-[2rem] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        idea.impact === "High" ? "bg-red-100 text-red-700" :
                        idea.impact === "Medium" ? "bg-blue-100 text-blue-700" :
                        "bg-zinc-100 text-zinc-700"
                      )}>
                        {idea.impact} Impact
                      </div>
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        {idea.probabilityOfSuccess} Success
                      </div>
                    </div>
                    <h4 className="font-black text-2xl text-zinc-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {idea.title}
                    </h4>
                  </div>
                  
                  <div className="lg:w-2/3 space-y-6">
                    <div className="text-zinc-600 text-lg leading-relaxed">
                      {idea.description}
                    </div>
                    
                    <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <AlertTriangle size={14} className="text-amber-500" />
                        Risk Assessment: Why it might fail
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed italic">
                        {idea.whyItMightFail}
                      </p>
                    </div>
                  </div>
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
        </div>
      </motion.div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
