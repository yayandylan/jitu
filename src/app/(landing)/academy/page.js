"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// PERBAIKAN: Import Link dari next/link
import Link from 'next/link'; 
import { 
  BookOpen, Clock, ArrowLeft, ArrowRight, 
  Crown, Star, Flame, Loader2, Zap, CheckCircle2,
  Share2, ThumbsUp, MessageCircle, Link2, Facebook, Sparkles
} from 'lucide-react';

function AcademyContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [copied, setCopied] = useState(false);

  // DATA ARTIKEL PANJANG, INFORMATIF, & PREMIUM
  const articles = [
    {
      id: "1",
      title: "Strategi Scale-Up Iklan Meta 2026: Era AI Otomatis",
      desc: "Berhenti melakukan setting manual yang rumit. Biarkan algoritma Meta dan AI Jitu bekerja secara sinergis untuk mencari pembeli yang tepat.",
      tag: "HOT", cat: "Strategy", read: "10 Min", date: "28 Jan 2026",
      rating: 4.9, totalVotes: 1240,
      content: {
        intro: "Selamat datang di masa depan pemasaran digital. Di tahun 2026, kunci sukses Meta Ads bukan lagi terletak pada teknis 'Media Buying', melainkan pada 'Creative Intelligence'.",
        sections: [
          {
            h: "1. Kehancuran Struktur Interest Sempit",
            p: "Dulu kita sibuk membagi puluhan interest ke dalam Ad Set yang berbeda. Sekarang, Meta Advantage+ bekerja paling optimal saat diberikan audiens yang 'Broad'. Pixel Jitu Digital sudah dilatih untuk mengenali sinyal pembeli dari perilaku mereka, bukan sekadar interest yang mereka klik. Fokuslah pada Broad Targeting dan biarkan sistem melakukan optimasi."
          },
          {
            h: "2. Creative Testing: Bahan Bakar Utama AI",
            p: "Karena audiens dibuat broad, maka filter utama Bapak adalah konten kreatif. AI Jitu Riset Produk bisa memberikan Bapak data 'Pain Points' pembeli. Gunakan data tersebut untuk membuat 3 jenis Hook video: Emosional, Statistik, dan Testimonial. Masukkan semua variasi ini ke dalam satu Campaign CBO (Campaign Budget Optimization) dan lihat mana yang menang."
          }
        ],
        conclusion: "Jangan melawan mesin, tapi berikan mesin tersebut data kreatif yang berkualitas. Jitu Digital hadir untuk memastikan data yang Bapak masukkan adalah data yang valid secara market."
      }
    },
    {
      id: "2",
      title: "Psikologi Warna Landing Page: Rahasia Konversi Tinggi",
      desc: "Temukan alasan ilmiah di balik penggunaan warna Biru Elektrik dan Gold Jitu untuk meningkatkan kepercayaan pembeli produk digital.",
      tag: "TRENDING", cat: "Design", read: "7 Min", date: "27 Jan 2026",
      rating: 4.8, totalVotes: 856,
      content: {
        intro: "Otak manusia memproses warna 60.000 kali lebih cepat daripada teks. Pilihan warna Anda menentukan apakah pengunjung akan tinggal atau pergi dalam 3 detik pertama.",
        sections: [
          {
            h: "1. Biru Elektrik: Sinyal Keamanan & Teknologi",
            p: "Dalam psikologi neuro-marketing, warna biru dengan saturasi tinggi (Electric Blue) memicu pelepasan oksitosin. Hal ini menciptakan rasa aman dan percaya. Untuk produk digital seperti SaaS atau E-Course, warna ini sangat krusial karena pembeli tidak bisa melihat fisik barangnya, sehingga 'Rasa Percaya' adalah satu-satunya mata uang Anda."
          },
          {
            h: "2. Emas (Gold): Aksen Eksklusivitas",
            p: "Warna emas memberikan kesan premium dan langka. Gunakan aksen emas Jitu pada elemen krusial seperti tombol 'Daftar Sekarang' atau badge 'Premium Member'. Namun, gunakan dengan rasio 10% saja. Terlalu banyak emas justru akan membuat Landing Page terlihat berat dan kuno. Keseimbangan adalah kunci kemewahan."
          }
        ],
        conclusion: "Warna adalah silent salesman Anda. Pastikan Landing Page Anda berbicara dengan bahasa visual yang tepat."
      }
    }
  ];

  useEffect(() => {
    if (articleId) {
      const found = articles.find(a => a.id === articleId);
      setSelectedArticle(found);
    }
    setLoading(false);
  }, [articleId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- TAMPILAN DETAIL ARTIKEL (SAAT DIKLIK) ---
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Kembali ke List Strategi
        </button>
        
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            {/* Header Detail */}
            <div className="p-10 md:p-16 space-y-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">{selectedArticle.tag}</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{selectedArticle.date} • {selectedArticle.read} Baca</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight italic tracking-tighter uppercase italic">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} className={s <= Math.round(selectedArticle.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                        ))}
                        <span className="ml-2 text-xs font-bold text-slate-900">{selectedArticle.rating}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({selectedArticle.totalVotes} votes)</span>
                    </div>
                </div>
            </div>

            {/* Isi Konten Panjang */}
            <div className="p-10 md:p-16 pt-10 space-y-12">
                <p className="text-xl font-medium text-slate-600 leading-relaxed italic border-l-4 border-amber-400 pl-8">
                  "{selectedArticle.content.intro}"
                </p>

                <div className="space-y-12">
                    {selectedArticle.content.sections.map((sec, i) => (
                        <div key={i} className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{sec.h}</h3>
                            <p className="text-lg font-normal text-slate-500 leading-loose">{sec.p}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                    <Zap className="absolute top-4 right-4 text-white/5" size={100} />
                    <h4 className="text-lg font-bold text-amber-400 uppercase italic">Kesimpulan Jitu</h4>
                    <p className="text-slate-300 leading-relaxed font-normal">{selectedArticle.content.conclusion}</p>
                </div>

                {/* Engagement: Rating & Share */}
                <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sangat Bermanfaat? Beri Rating Bapak</p>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                  key={star} 
                                  onClick={() => setUserRating(star)}
                                  className={`p-2 rounded-xl transition-all ${userRating >= star ? 'bg-amber-100 text-amber-600 scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                >
                                    <Star size={20} fill={userRating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                           {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Link2 size={16} />}
                           {copied ? "Berhasil Disalin" : "Salin Link"}
                        </button>
                        <a href={`https://wa.me/?text=Strategi ini gila banget, wajib baca: ${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
                            <MessageCircle size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN LIST ARTIKEL (UTAMA) ---
  return (
    <div className="space-y-12">
      {/* Header Premium Academy */}
      <div className="bg-[#0A0C10] rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl border border-amber-500/10 group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-amber-400/20">
              <Crown size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Jitu Intelligence Academy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-tight">Pusat <span className="font-extrabold text-amber-400 italic">Strategi</span></h1>
          <p className="text-slate-500 max-w-xl text-base md:text-lg font-normal leading-relaxed">Strategi winning yang diriset langsung oleh AI Jitu Digital dari ribuan data market harian.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((art) => (
          <div key={art.id} className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between">
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{art.tag}</span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star size={12} fill="currentColor" /> {art.rating}
                    </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{art.title}</h3>
                <p className="text-sm text-slate-400 font-normal leading-relaxed italic">"{art.desc}"</p>
             </div>
             <div className="flex justify-between items-center pt-10 mt-10 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{art.read} Baca</span>
                <Link href={`/academy?id=${art.id}`} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                  Pelajari Strategi <ArrowRight size={16}/>
                </Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrapper Suspense (Penting untuk useSearchParams di Next.js)
export default function JituAcademyPage() {
  return (
    <div className="max-w-[1400px] mx-auto pb-20 pt-4 px-4 md:px-10 font-sans antialiased text-slate-900">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>}>
        <AcademyContent />
      </Suspense>
    </div>
  );
}