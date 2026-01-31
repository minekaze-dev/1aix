import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Smartphone, Brand, Article, AdConfig } from './types';
import Header from './components/Header';
import CatalogTab from './components/CatalogTab';
import ComingSoonTab from './components/ComingSoonTab';
import ComparisonTab from './components/ComparisonTab';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import HomeTab from './components/HomeTab';

const AboutPage = () => (
    <div className="animate-in fade-in duration-700 py-12 max-w-[900px] mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">TENTANG 1AIX</h1>
            <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
        </div>
        <div className="space-y-8">
            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
                    1AIX ADALAH PLATFORM REFERENSI GADGET INDEPENDEN YANG BERFOKUS PADA PASAR SMARTPHONE DI INDONESIA. KAMI HADIR UNTUK MEMBERIKAN INFORMASI AKURAT MENGENAI SPESIFIKASI TEKNIS, HARGA SRP RESMI, SERTA STATUS REGULASI TKDN (TINGKAT KOMPONEN DALAM NEGERI) DARI SETIAP PERANGKAT YANG BEREDAR RESMI DI TANAH AIR.
                </p>
            </div>
            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">MISI KAMI</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
                    MISI UTAMA KAMI ADALAH MEMBANTU KONSUMEN INDONESIA DALAM MEMBUAT KEPUTUSAN PEMBELIAN YANG LEBIH CERDAS DENGAN MENYEDIAKAN DATABASE PERBANDINGAN YANG KOMPREHENSIF, TRANSPARAN, DAN MUDAH DIAKSES OLEH SIAPAPUN.
                </p>
            </div>
            <div className="text-center mt-12">
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] italic">
                    POWERED BY 1AIX ENGINE v5.8
                </p>
            </div>
        </div>
    </div>
);

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

            <div className="mt-16 text-center max-w-xl mx-auto">
                <div className="flex gap-2 items-center justify-center mb-4">
                    <span className="text-red-600 font-black text-lg leading-tight">Q:</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 text-zinc-900 leading-tight">
                        BAGAIMANA CARA MENGHUBUNGI 1AIX?
                    </h3>
                </div>
                <p className="text-base font-bold text-zinc-500 leading-relaxed">
                    ANDA BISA MENGIRIMKAN PERTANYAHAN, MASUKAN, ATAU KERJASAMA KE ALAMAT EMAIL RESMI KAMI: 
                    <a href="mailto:1aix.team@gmail.com" className="text-red-600 hover:text-red-700 transition-colors underline ml-1">1AIX.TEAM@GMAIL.COM</a>.
                </p>
            </div>
        </div>
    );
};

const PolicyPage = () => (
    <div className="animate-in fade-in duration-700 py-12 max-w-[900px] mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">KEBIJAKAN PRIVASI</h1>
            <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
        </div>
        <div className="space-y-6">
            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Pengantar</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Privasi Anda adalah prioritas kami di 1AIX. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda menggunakan layanan kami. Dengan mengakses atau menggunakan platform kami, Anda menyetujui praktik data yang dijelaskan dalam Kebijakan Privasi ini.
                </p>
            </div>
            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Informasi yang Kami Kumpulkan</h3>
                <div className="text-[11px] font-bold text-zinc-500 leading-relaxed space-y-3">
                    <p>Kami hanya mengumpulkan informasi yang diperlukan untuk menyediakan layanan yang optimal dan meningkatkan pengalaman pengguna:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><b>Data Akun:</b> Saat Anda mendaftar atau login, kami mengumpulkan alamat email dan nama tampilan (display name) Anda. Password Anda disimpan dalam bentuk terenkripsi dan tidak dapat diakses oleh kami.</li>
                        <li><b>Data Interaksi:</b> Informasi tentang interaksi Anda dengan fitur-fitur platform, seperti komentar yang Anda posting atau artikel yang Anda baca.</li>
                        <li><b>Data Analitik:</b> Data anonim tentang penggunaan situs web (misalnya, jumlah pengunjung, waktu membaca) untuk analisis kinerja dan peningkatan fitur.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

const TermsPage = () => (
    <div className="animate-in fade-in duration-700 py-12 max-w-[900px] mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">SYARAT & KETENTUAN</h1>
            <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
        </div>
        <div className="space-y-6">
            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Persetujuan Penggunaan</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Dengan mengakses dan menggunakan layanan 1AIX, Anda secara otomatis menyetujui semua Syarat & Ketentuan yang berlaku.
                </p>
            </div>
        </div>
    </div>
);

interface TkdnItem {
  cert_number: string;
  brand: string;
  codename: string;
  marketing_name: string;
  tkdn_score: number;
  cert_date: string;
  status: 'UPCOMING' | 'RELEASED';
  created_at?: string;
  is_visible?: boolean;
}

export default function App() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tkdnMonitorData, setTkdnMonitorData] = useState<TkdnItem[]>([]);
  const [ads, setAds] = useState<Record<string, AdConfig>>({});
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || '');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // New state for mobile bottom nav visibility
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(false);

  // State for comparison
  const [comparisonIds, setComparisonIds] = useState<string[]>(['', '']);

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [homeTabArticleFilterQuery, setHomeTabArticleFilterQuery] = useState("");
  const [targetProduct, setTargetProduct] = useState<Smartphone | null>(null);
  const [targetArticle, setTargetArticle] = useState<Article | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Logic: Only count page_view once per device per day
    const today = new Date().toDateString();
    const lastVisitLog = localStorage.getItem('1AIX_LAST_VISIT_LOG');
    if (lastVisitLog !== today) {
      supabase.from('site_analytics').insert([{ event_type: 'page_view', value: 1 }]).then();
      localStorage.setItem('1AIX_LAST_VISIT_LOG', today);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '') || '';
      setRoute(currentHash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync route slug to targetProduct state (Fix for double click)
  useEffect(() => {
    if (route.startsWith('katalog/') && smartphones.length > 0) {
        const parts = route.split('/');
        if (parts.length > 1) {
            const modelSlug = parts.slice(1).join('/');
            const found = smartphones.find(p => p.model_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === modelSlug);
            if (found && targetProduct?.id !== found.id) {
                setTargetProduct(found);
                setSelectedBrand(found.brand);
            }
        }
    } else if (route === 'katalog' || route === '') {
        if (targetProduct) setTargetProduct(null);
    }
  }, [route, smartphones]);

  const isAdmin = useMemo(() => {
    return session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';
  }, [session]);

  const sortSmartphones = (data: Smartphone[]) => {
    return [...data].sort((a, b) => {
        const rA = a.order_rank ?? 0;
        const rB = b.order_rank ?? 0;
        if (rB !== rA) return rB - rA;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [phonesRes, articlesRes, tkdnRes, adsRes] = await Promise.all([
        supabase.from('smartphones').select('*'),
        supabase.from('articles').select('*').eq('status', 'PUBLISHED').order('publish_date', { ascending: false }),
        supabase.from('tkdn_monitor').select('*').eq('is_visible', true).order('cert_date', { ascending: false }),
        supabase.from('ads_banners').select('*')
      ]);

      if (phonesRes.error) throw phonesRes.error;
      if (articlesRes.error) throw articlesRes.error;
      if (tkdnRes.error) throw tkdnRes.error;

      const allPhones = sortSmartphones(phonesRes.data || []);
      const allArticles = articlesRes.data || [];

      setSmartphones(allPhones);
      setArticles(allArticles);
      setTkdnMonitorData(tkdnRes.data || []);
      
      if (!adsRes.error && adsRes.data) {
        const adsMap = adsRes.data.reduce((acc, curr) => ({ ...acc, [curr.id.toLowerCase()]: curr }), {});
        setAds(adsMap);
      }
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
    if (route.startsWith('news/')) return 'Home';
    if (route.startsWith('katalog/') && route.split('/').length > 1) return 'Katalog';
    switch(route) {
      case '':
      case 'home': return 'Home';
      case 'katalog': return 'Katalog';
      case 'coming-soon': return 'Segera Rilis';
      case 'bandingkan': return 'Bandingkan';
      case 'admin': return 'Admin';
      case 'faq': return 'FAQ';
      case 'tentang': return 'Tentang';
      case 'kebijakan': return 'Kebijakan';
      case 'syarat-ketentuan': return 'Syarat & Ketentuan';
      default: return 'Home';
    }
  }, [route]);

  const resetAllSearchFilters = useCallback(() => {
    setSearchQuery("");
    setHomeTabArticleFilterQuery("");
    setTargetProduct(null);
    setTargetArticle(null);
  }, []);

  const handleGoToCatalog = () => {
    setSelectedBrand(null);
    resetAllSearchFilters();
    window.location.hash = '#/katalog';
  };

  const handleGoHome = () => {
    setSelectedBrand(null);
    resetAllSearchFilters();
    setTargetArticle(null); 
    window.location.hash = ''; // Clears the hash to show 1aix.site/
  };

  const handleGoToCompare = () => {
    resetAllSearchFilters();
    window.location.hash = '#/bandingkan';
  };

  const handleCompareProduct = (productId: string) => {
    setComparisonIds([productId, '']);
    window.location.hash = '#/bandingkan';
  };

  const handleOpenAuth = () => { setShowAuthModal(true); };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        setSession(null); 
        resetAllSearchFilters(); 
        window.location.hash = '';
    } catch (error) {
        console.error("Logout Error:", error);
    }
  };

  const handleProductSelect = (phone: Smartphone) => {
    setSearchQuery(""); 
    setHomeTabArticleFilterQuery(""); 
    const slug = phone.model_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    window.location.hash = `#/katalog/${slug}`;
  };

  const handleArticleSelect = (article: Article) => {
    setTargetArticle(article);
    setSearchQuery(""); 
    setHomeTabArticleFilterQuery(""); 
    window.location.hash = `#${article.permalink.replace(/^\//, '')}`;
  };

  const trendingNewsForMarquee = useMemo(() => {
    if (articles.length === 0) {
        return ["SISTEM DATABASE 1AIX TELAH AKTIF SEPENUHNYA", "SELURUH HARGA SRP BERSUMBER DARI STORE RESMI"];
    }
    return articles.slice(0, 3).map(article => article.title.toUpperCase());
  }, [articles]);

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
        return <AdminDashboard session={session} onLogout={handleLogout} onDataChange={() => fetchData(true)} />;
    } else {
        window.location.hash = '';
        return null;
    }
  }

  const headerAd = ads['header'];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-zinc-900 font-sans flex flex-col items-center selection:bg-blue-600 selection:text-white pb-20 lg:pb-0">
      <Header 
        activeTab={activeTab} 
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => { 
            setSelectedBrand(brand); 
            setTargetProduct(null); // PENTING: Reset produk terpilih saat ganti brand
            window.location.hash = '#/katalog'; 
        }}
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
            {trendingNewsForMarquee.map((news, i) => (
                <span key={i} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            {trendingNewsForMarquee.map((news, i) => (
                <span key={i + 'copy'} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            </div>
        </div>
      </div>

      <div className="w-full max-w-[1000px] mt-px hidden lg:block">
        {headerAd?.image_url ? (
          <a href={headerAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden">
            <img src={headerAd.image_url} alt="Promo" className="w-full h-auto max-h-[120px] object-cover" />
          </a>
        ) : (
          <div className="h-[120px] bg-zinc-100 border-x border-zinc-200 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span>
            <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span>
          </div>
        )}
      </div>

      <main className="max-w-[1000px] w-full flex-grow py-8 bg-white shadow-sm border-x border-zinc-200 px-6">
        {activeTab === 'Home' && (
            <HomeTab 
                onOpenLogin={handleOpenAuth} 
                onLogout={handleLogout} 
                session={session} 
                globalSearchQuery={searchQuery} 
                articleFilterQuery={homeTabArticleFilterQuery} 
                onSetArticleFilterQuery={setHomeTabArticleFilterQuery} 
                initialArticle={targetArticle}
                onClearTarget={() => setTargetArticle(null)}
                articleAd={ads['article']}
                sidebarAd={ads['sidebar']}
                smartphones={smartphones}
                onProductSelect={handleProductSelect}
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
            sidebarAd={ads['sidebar']}
            onCompareProduct={handleCompareProduct}
          />
        )}
        {activeTab === 'Segera Rilis' && <ComingSoonTab items={smartphones} publishedAiData={tkdnMonitorData} />}
        {activeTab === 'Bandingkan' && <ComparisonTab items={smartphones} selectedIds={comparisonIds} setSelectedIds={setComparisonIds} />}
        {activeTab === 'FAQ' && <FaqPage />}
        {activeTab === 'Tentang' && <AboutPage />}
        {activeTab === 'Kebijakan' && <PolicyPage />}
        {activeTab === 'Syarat & Ketentuan' && <TermsPage />}
      </main>

      <Footer />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1001] flex flex-col items-center">
        {/* Toggle Arrow - Center Position with Rounded Inverted Trapezium Shape using SVG */}
        <button 
          onClick={() => setIsBottomNavVisible(!isBottomNavVisible)}
          className="relative w-20 h-8 flex items-center justify-center transition-all active:scale-95 group"
        >
          {/* Rounded Trapezium Shape Background */}
          <svg className="absolute inset-0 w-full h-full text-zinc-900 drop-shadow-2xl" viewBox="0 0 80 32" preserveAspectRatio="none">
            <path 
              d="M 0,32 L 80,32 L 64,4 Q 60,0 52,0 L 28,0 Q 20,0 16,4 L 0,32 Z" 
              fill="currentColor" 
            />
          </svg>
          
          {/* Toggle Icon */}
          <svg 
            className={`w-5 h-5 text-white relative z-10 transition-transform duration-300 ${isBottomNavVisible ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>

        {/* Navbar Body */}
        <div className={`w-full bg-[#0b0b0b] text-white border-t border-zinc-800 transition-all duration-500 ease-in-out shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] ${isBottomNavVisible ? 'translate-y-0 opacity-100 h-16' : 'translate-y-full opacity-0 h-0 overflow-hidden'}`}>
          <div className="flex h-full items-center justify-around px-2">
            <button 
              onClick={handleGoHome}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'Home' ? 'text-red-500' : 'text-zinc-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">BERANDA</span>
            </button>
            <button 
              onClick={handleGoToCompare}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'Bandingkan' ? 'text-blue-500' : 'text-zinc-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">COMPARE</span>
            </button>
            <button 
              onClick={handleGoToCatalog}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'Katalog' ? 'text-red-500' : 'text-zinc-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">KATALOG</span>
            </button>
            <button 
              onClick={() => { window.location.hash = '#/coming-soon'; }}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'Segera Rilis' ? 'text-blue-500' : 'text-zinc-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">TKDN</span>
            </button>
            {isAdmin && (
              <button 
                onClick={() => { window.location.hash = '#/admin'; }}
                className={`flex flex-col items-center gap-1 flex-1 transition-colors ${(activeTab as string) === 'Admin' ? 'text-red-500' : 'text-zinc-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span className="text-[8px] font-black uppercase tracking-widest">ADMIN</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Fix for double password reveal icon in browsers like Edge */
        input::-ms-reveal,
        input::-ms-clear {
            display: none;
        }
      `}</style>
    </div>
  );
}