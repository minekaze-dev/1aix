
import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

            {/* Bagian Hubungi 1AIX yang terhighlight */}
            <div className="mt-16 text-center max-w-xl mx-auto">
                <div className="flex gap-2 items-center justify-center mb-4">
                    <span className="text-red-600 font-black text-lg leading-tight">Q:</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 leading-tight">
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

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Bagaimana Kami Menggunakan Informasi Anda</h3>
                <div className="text-[11px] font-bold text-zinc-500 leading-relaxed space-y-3">
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Untuk mengelola akun Anda dan memfasilitasi login.</li>
                        <li>Untuk mempublikasikan komentar dan kontribusi Anda di bawah nama tampilan Anda.</li>
                        <li>Untuk menganalisis tren penggunaan dan meningkatkan fungsionalitas platform.</li>
                        <li>Untuk mematuhi kewajiban hukum.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Pembagian Data</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Alamat email Anda tidak akan pernah dibagikan kepada pihak ketiga untuk tujuan pemasaran. Nama tampilan dan komentar Anda bersifat publik di platform. Kami menggunakan infrastruktur Supabase untuk keamanan data dan otentikasi.
                </p>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Keamanan Data</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Kami berkomitmen untuk melindungi data Anda dengan langkah-langkah keamanan yang sesuai, termasuk enkripsi password. Meskipun demikian, tidak ada sistem yang sepenuhnya aman, dan kami tidak dapat menjamin keamanan mutlak.
                </p>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Hak Anda</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Anda memiliki hak untuk mengakses, mengubah, atau menghapus informasi pribadi Anda. Untuk permintaan tersebut, silakan hubungi kami.
                </p>
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
                    Dengan mengakses dan menggunakan layanan 1AIX, Anda secara otomatis menyetujui semua Syarat & Ketentuan yang berlaku. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, mohon untuk tidak menggunakan layanan kami.
                </p>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Kewajiban Pengguna</h3>
                <div className="text-[11px] font-bold text-zinc-500 leading-relaxed space-y-3">
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Dilarang keras menyebarkan konten yang mengandung unsur SARA, kebencian, pornografi, atau informasi palsu (hoax).</li>
                        <li>Dilarang melakukan tindakan peretasan atau percobaan akses tidak sah ke sistem kami.</li>
                        <li>Pengguna bertanggung jawab penuh atas setiap komentar atau kontribusi yang diposting.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Informasi Produk</h3>
                <div className="text-[11px] font-bold text-zinc-500 leading-relaxed space-y-3">
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Semua data spesifikasi smartphone, TKDN, dan harga SRP disajikan sebagai referensi berdasarkan data resmi.</li>
                        <li>Kami tidak bertanggung jawab atas perubahan spesifikasi, harga, atau ketersediaan produk oleh pihak brand.</li>
                        <li>Pengguna disarankan untuk selalu memverifikasi informasi dengan sumber resmi brand terkait.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Pelanggaran & Sanksi</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    Setiap pelanggaran terhadap Syarat & Ketentuan ini dapat mengakibatkan penangguhan atau pemblokiran akun secara permanen, serta penghapusan konten yang melanggar. Kami berhak mengambil tindakan hukum jika diperlukan.
                </p>
            </div>

            <div className="bg-[#f8fafc]/50 p-8 rounded-sm border border-zinc-100 shadow-sm">
                <h3 className="text-[12px] font-black uppercase tracking-tight text-red-600 leading-tight mb-4">Perubahan Ketentuan</h3>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    1AIX berhak untuk mengubah atau memperbarui Syarat & Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan layanan kami setelah perubahan tersebut merupakan bentuk persetujuan Anda terhadap ketentuan yang baru.
                </p>
            </div>
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
  
  // Global search for Header and CatalogTab
  const [searchQuery, setSearchQuery] = useState(""); 
  // Local search for HomeTab articles (e.g., from Popular Tags)
  const [homeTabArticleFilterQuery, setHomeTabArticleFilterQuery] = useState("");

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

  // Function to reset all search-related states
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
    window.location.hash = '#/home';
  };

  const handleGoToCompare = () => {
    resetAllSearchFilters();
    window.location.hash = '#/bandingkan';
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        setSession(null); 
        resetAllSearchFilters(); // Reset search on logout as well
        window.location.hash = '#/home';
    } catch (error) {
        console.error("Logout Error:", error);
    }
  };

  const handleProductSelect = (phone: Smartphone) => {
    setTargetProduct(phone);
    setSelectedBrand(phone.brand);
    setSearchQuery(""); // Clear global search on product select
    setHomeTabArticleFilterQuery(""); // Clear article filter
    window.location.hash = '#/katalog';
  };

  const handleArticleSelect = (article: Article) => {
    setTargetArticle(article);
    setSearchQuery(""); // Clear global search on article select
    setHomeTabArticleFilterQuery(""); // Clear article filter
    window.location.hash = '#/home';
  };

  // Memoized content for the marquee - NOW LIMITED TO 3
  const trendingNewsForMarquee = useMemo(() => {
    if (articles.length === 0) {
        return ["SISTEM DATABASE 1AIX TELAH AKTIF SEPENUHNYA", "SELURUH HARGA SRP BERSUMBER DARI STORE RESMI"];
    }
    // Take the top 3 articles and format their titles
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
            {trendingNewsForMarquee.map((news, i) => (
                <span key={i} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            {/* Repeat for seamless loop */}
            {trendingNewsForMarquee.map((news, i) => (
                <span key={i + 'copy'} className="mx-4">{news} <span className="text-white/30 ml-4">//</span></span>
            ))}
            </div>
        </div>
      </div>

      {/* Banner Ads Section (Main Banner) */}
      <div className="w-full max-w-[1000px] mt-px">
        <div className="h-[120px] bg-zinc-100 border-x border-zinc-200 flex flex-col items-center justify-center shadow-inner">
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span>
          <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span>
        </div>
      </div>

      <main className="max-w-[1000px] w-full flex-grow py-8 bg-white shadow-sm border-x border-zinc-200 px-6">
        {activeTab === 'Home' && (
            <HomeTab 
                onOpenLogin={handleOpenAuth} 
                onLogout={handleLogout} 
                session={session} 
                globalSearchQuery={searchQuery} // Pass global search to HomeTab
                articleFilterQuery={homeTabArticleFilterQuery} // Pass local filter for articles
                onSetArticleFilterQuery={setHomeTabArticleFilterQuery} // Pass setter for local article filter
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
            searchQuery={searchQuery} // CatalogTab uses global search query
            setSearchQuery={setSearchQuery} // And can modify it
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
