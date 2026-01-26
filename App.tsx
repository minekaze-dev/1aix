
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NEWS_UPDATES } from './constants';
import type { Smartphone, Brand, Article } from './types';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import CatalogTab from './components/CatalogTab';
import ComingSoonTab from './components/ComingSoonTab';
import ComparisonTab from './components/ComparisonTab';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

const FaqPage = () => {
    const faqs = [
        {
            q: "APA ITU SKOR TKDN DI 1AIX?",
            a: "TKDN (Tingkat Komponen Dalam Negeri) adalah nilai persentase kandungan lokal pada perangkat telekomunikasi yang beredar resmi di Indonesia sesuai regulasi Kemenperin."
        },
        {
            q: "SEBERAPA AKURAT HARGA SRP YANG DITAMPILKAN?",
            a: "Harga SRP (Suggested Retail Price) diambil dari data resmi peluncuran brand. Harga di toko retail mungkin bervariasi tergantung promo dan wilayah."
        },
        {
            q: "APAKAH DATA SPESIFIKASI SELALU TERUPDATE?",
            a: "Ya, sistem kami melakukan sinkronisasi berkala dengan database brand global dan sertifikasi lokal untuk memastikan data teknis tetap akurat."
        },
        {
            q: "BAGAIMANA CARA MEMBANDINGKAN DUA HP?",
            a: "Masuk ke menu 'Katalog', pilih perangkat yang diinginkan, lalu tekan tombol 'Compare'. Anda bisa memilih hingga 2 perangkat secara side-by-side."
        },
        {
            q: "APA MAKSUD STATUS 'SEGERA RILIS'?",
            a: "Status ini berarti perangkat telah terdeteksi masuk database TKDN namun belum diluncurkan secara retail di pasar Indonesia."
        },
        {
            q: "APAKAH ADA APLIKASI MOBILE 1AIX?",
            a: "Saat ini layanan kami berbasis web-app yang dioptimalkan untuk performa mobile (PWA)."
        }
    ];

    return (
        <div className="animate-in fade-in duration-700 py-12 max-w-[900px] mx-auto">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">FREQUENTLY ASKED QUESTIONS</h1>
                <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex gap-2 mb-4">
                            <span className="text-red-600 font-black text-[12px] leading-tight">Q:</span>
                            <h3 className="text-[12px] font-black uppercase tracking-tight text-zinc-900 leading-tight">
                                {faq.q}
                            </h3>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-500 leading-relaxed pl-6 border-l border-zinc-200">
                            {faq.a}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PolicyPage = () => (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-8 border-l-4 border-red-600 pl-4">KEBIJAKAN 1AIX</h1>
        <div className="prose prose-zinc max-w-none text-zinc-600">
            <p className="font-bold uppercase text-sm mb-6">PRIVASI ANDA ADALAH PRIORITAS KAMI. KAMI HANYA MENGUMPULKAN DATA YANG DIPERLUKAN UNTUK PENGALAMAN INTERAKSI KOMUNITAS YANG LEBIH BAIK.</p>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-4">PENGUMPULAN DATA</h3>
            <p className="text-sm font-bold leading-relaxed uppercase mb-6">KAMI MENYIMPAN ALAMAT EMAIL DAN NAMA PENGGUNA UNTUK KEPERLUAN LOGIN DAN PENULISAN KOMENTAR. DATA ANDA TIDAK AKAN PERNAH DIBERIKAN KEPADA PIHAK KETIGA TANPA IZIN.</p>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-4">KEAMANAN</h3>
            <p className="text-sm font-bold leading-relaxed uppercase">SISTEM KAMI MENGGUNAKAN INFRASTRUKTUR SUPABASE UNTUK MENJAMIN KEAMANAN DATA PENGGUNA DAN ENKRIPSI PASSWORD YANG AMAN.</p>
        </div>
    </div>
);

const TermsPage = () => (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-8 border-l-4 border-red-600 pl-4">SYARAT & KETENTUAN</h1>
        <div className="prose prose-zinc max-w-none text-zinc-600">
            <p className="font-bold uppercase text-sm mb-6">DENGAN MENGGUNAKAN LAYANAN 1AIX, ANDA SETUJU UNTUK MEMATUHI SELURUH ATURAN YANG BERLAKU DI BAWAH INI.</p>
            <ul className="space-y-4">
                <li className="text-sm font-bold uppercase leading-relaxed">1. PENGGUNA DILARANG MEMBERIKAN KOMENTAR YANG MENGANDUNG SARA, PENGHINAAN, ATAU HOAX.</li>
                <li className="text-sm font-bold uppercase leading-relaxed">2. SELURUH DATA SPESIFIKASI DISEDIAKAN SEYBAGAI REFERENSI, KAMI TIDAK BERTANGGUNG JAWAB ATAS PERUBAHAN MENDADAK DARI BRAND.</li>
                <li className="text-sm font-bold uppercase leading-relaxed">3. PENYALAHGUNAAN AKUN ATAU PERCOBAAN PERETASAN AKAN MENGAKIBATKAN BLOKIR PERMANEN.</li>
            </ul>
        </div>
    </div>
);

export default function App() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || 'home');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Target item for direct navigation from search
  const [targetProduct, setTargetProduct] = useState<Smartphone | null>(null);
  const [targetArticle, setTargetArticle] = useState<Article | null>(null);

  // Sync with Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tracking page visit
  useEffect(() => {
    supabase.from('site_analytics').insert([{ event_type: 'page_view', value: 1 }]).then();
  }, []);

  const isAdmin = useMemo(() => {
    return session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';
  }, [session]);

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '') || 'home';
      setRoute(currentHash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper untuk sorting smartphone agar konsisten dengan Admin Panel
  const sortSmartphones = (data: Smartphone[]) => {
    return [...data].sort((a, b) => {
        const rA = a.order_rank ?? 0;
        const rB = b.order_rank ?? 0;
        // Primary sort: Order Rank (Descending)
        if (rB !== rA) return rB - rA;
        // Secondary sort: Created At (Newest)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [phonesRes, articlesRes] = await Promise.all([
        supabase.from('smartphones').select('*'),
        supabase.from('articles').select('*').eq('status', 'PUBLISHED').order('publish_date', { ascending: false })
      ]);

      if (phonesRes.error) throw phonesRes.error;
      if (articlesRes.error) throw articlesRes.error;

      setSmartphones(sortSmartphones(phonesRes.data || []));
      setArticles(articlesRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeTab = useMemo(() => {
    switch(route) {
      case 'home': return 'Home';
      case 'katalog': return 'Katalog';
      case 'coming-soon': return 'Segera Rilis';
      case 'bandingkan': return 'Bandingkan';
      case 'admin': return 'Admin';
      case 'faq': return 'FAQ';
      case 'kebijakan': return 'Kebijakan';
      case 'syarat-ketentuan': return 'Syarat & Ketentuan';
      default: return 'Home';
    }
  }, [route]);

  const handleGoToCatalog = () => {
    setSelectedBrand(null);
    window.location.hash = '#/katalog';
  };

  const handleGoHome = () => {
    setSelectedBrand(null);
    window.location.hash = '#/home';
  };

  const handleGoToCompare = () => {
    window.location.hash = '#/bandingkan';
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        setSession(null); 
        window.location.hash = '#/home';
    } catch (error) {
        console.error("Logout Error:", error);
    }
  };

  const handleProductSelect = (phone: Smartphone) => {
    setTargetProduct(phone);
    setSelectedBrand(phone.brand);
    setSearchQuery("");
    window.location.hash = '#/katalog';
  };

  const handleArticleSelect = (article: Article) => {
    setTargetArticle(article);
    setSearchQuery("");
    window.location.hash = '#/home';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0b0b] text-blue-500">
        <div className="text-center flex flex-col items-center">
            <img src="https://i.imgur.com/8LtVd3P.jpg" alt="1AIX Logo" className="h-20 w-auto object-contain mb-4 brightness-110 animate-pulse"/>
            <p className="text-zinc-600 text-xs uppercase tracking-[0.5em] animate-pulse">Initializing 1AIX DB</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'Admin') {
    if (isAdmin) {
        return (
            <AdminDashboard 
                session={session} 
                onLogout={handleLogout} 
                onDataChange={() => fetchData(true)}
            />
        );
    } else {
        window.location.hash = '#/home';
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-zinc-900 font-sans flex flex-col items-center selection:bg-blue-600 selection:text-white">
      <Header 
        activeTab={activeTab} 
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => { setSelectedBrand(brand); window.location.hash = '#/katalog'; }}
        onGoHome={handleGoHome}
        onGoToCatalog={handleGoToCatalog}
        onGoToCompare={handleGoToCompare}
        onOpenLogin={handleOpenAuth}
        onLogout={handleLogout}
        session={session}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        smartphones={smartphones}
        articles={articles}
        onProductSelect={handleProductSelect}
        onArticleSelect={handleArticleSelect}
      />
      
      <div className="w-full max-w-[1000px] bg-[#d41525] shadow-md border-b border-[#b0111e] overflow-hidden">
        <div className="flex items-center h-10">
            <div className="inline-block animate-marquee px-4 font-black text-[10px] text-white uppercase tracking-widest italic whitespace-nowrap">
            {NEWS_UPDATES.map((news, i) => (
                <span key={i} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            {NEWS_UPDATES.map((news, i) => (
                <span key={i + 'copy'} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            </div>
        </div>
      </div>

      <main className="max-w-[1000px] w-full flex-grow py-8 bg-white shadow-sm border-x border-zinc-200 px-6">
        {activeTab === 'Home' && (
            <HomeTab 
                onOpenLogin={handleOpenAuth} 
                onLogout={handleLogout} 
                session={session} 
                searchQuery={searchQuery}
                initialArticle={targetArticle}
                onClearTarget={() => setTargetArticle(null)}
            />
        )}
        {activeTab === 'Katalog' && (
          <CatalogTab 
            items={smartphones} 
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenLogin={handleOpenAuth}
            onLogout={handleLogout}
            session={session}
            initialProduct={targetProduct}
            onClearTarget={() => setTargetProduct(null)}
          />
        )}
        {activeTab === 'Segera Rilis' && <ComingSoonTab items={smartphones} />}
        {activeTab === 'Bandingkan' && <ComparisonTab items={smartphones} />}
        {activeTab === 'FAQ' && <FaqPage />}
        {activeTab === 'Kebijakan' && <PolicyPage />}
        {activeTab === 'Syarat & Ketentuan' && <TermsPage />}
      </main>

      <Footer />

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
