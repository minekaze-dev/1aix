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
import ProfileTab from './components/ProfileTab';

const WP_SITE = '1aixcms.wordpress.com';

// Helper untuk membersihkan entitas HTML (seperti &amp; menjadi &)
const decodeHtml = (html: string): string => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Helper untuk mengubah ID numerik WordPress ke format UUID valid agar bisa masuk ke kolom UUID Supabase
const wpIdToUuid = (id: number | string): string => {
  const s = String(id).padStart(32, '0');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
};

export default function App() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tkdnMonitorData, setTkdnMonitorData] = useState<any[]>([]);
  const [ads, setAds] = useState<Record<string, AdConfig>>({});
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || 'home');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>(['', '']);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [targetArticle, setTargetArticle] = useState<Article | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
        const newRoute = window.location.hash.replace(/^#\/?/, '') || 'home';
        setRoute(newRoute);
    };
    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) window.location.hash = '#/home';
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAdmin = useMemo(() => {
    return session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';
  }, [session]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [phonesRes, tkdnRes, adsRes] = await Promise.all([
        supabase.from('smartphones').select('*'),
        supabase.from('tkdn_monitor').select('*').eq('is_visible', true).order('cert_date', { ascending: false }),
        supabase.from('ads_banners').select('*')
      ]);

      // FETCH ARTIKEL DARI WORDPRESS API
      let wpArticles: Article[] = [];
      try {
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts?number=50`);
        const wpData = await wpRes.json();
        if (wpData && wpData.posts) {
          wpArticles = wpData.posts.map((post: any) => ({
            id: wpIdToUuid(post.ID),
            title: decodeHtml(post.title), // Decode entitas HTML pada judul
            summary: post.excerpt ? decodeHtml(post.excerpt.replace(/<[^>]*>?/gm, '')).substring(0, 160) : '', // Decode ringkasan
            content: post.content, 
            cover_image_url: post.featured_image || 'https://via.placeholder.com/800x400?text=1AIX+News',
            tags: post.tags ? Object.keys(post.tags).map(t => `#${t}`).join(' ') : '', // MEMASUKKAN TAGS DARI WP
            publish_date: new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            categories: post.categories ? Object.values(post.categories).map((cat: any) => cat.name.toUpperCase()) : ['NEWS'],
            permalink: `/news/${post.slug}`,
            author_name: post.author ? post.author.name : 'REDAKSI 1AIX',
            status: 'PUBLISHED'
          }));
        }
      } catch (e) {
        console.error("WP Sync Error:", e);
      }

      setSmartphones(phonesRes.data || []);
      setArticles(wpArticles);
      setTkdnMonitorData(tkdnRes.data || []);
      if (!adsRes.error && adsRes.data) {
        setAds(adsRes.data.reduce((acc, curr) => ({ ...acc, [curr.id.toLowerCase()]: curr }), {}));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeTab = useMemo(() => {
    const r = route.toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'bandingkan') return 'Bandingkan';
    if (r === 'profile') return 'Profil';
    if (r === 'coming-soon') return 'Segera Rilis';
    if (r === 'katalog' || r.startsWith('katalog/')) return 'Katalog';
    if (r === 'home' || r === '' || r.startsWith('news/')) return 'Home';
    return 'Home';
  }, [route]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0b0b]">
        <img src="https://i.imgur.com/8LtVd3P.jpg" alt="1AIX" className="h-16 animate-pulse"/>
      </div>
    );
  }

  if (activeTab === 'Admin' && isAdmin) {
    return (
      <AdminDashboard 
        session={session} 
        onLogout={async () => { await supabase.auth.signOut(); setSession(null); window.location.hash = ''; }} 
        onDataChange={() => fetchData(true)}
        articles={articles}
      />
    );
  }

  const handleProductSelect = (p: Smartphone) => {
    window.location.hash = `#/katalog/${p.model_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  const handleArticleSelect = (a: Article) => {
    setTargetArticle(a);
    window.location.hash = `#${a.permalink.replace(/^\//, '')}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center pb-20 lg:pb-0">
      <Header 
        activeTab={activeTab} 
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => { setSelectedBrand(brand); window.location.hash = '#/katalog'; }}
        onGoHome={() => { setSelectedBrand(null); window.location.hash = '#/home'; }}
        onGoToCatalog={() => { setSelectedBrand(null); window.location.hash = '#/katalog'; }}
        onOpenLogin={() => setShowAuthModal(true)}
        onLogout={async () => { await supabase.auth.signOut(); setSession(null); window.location.hash = ''; }}
        session={session}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        smartphones={smartphones}
        articles={articles}
        onProductSelect={handleProductSelect}
        onArticleSelect={handleArticleSelect}
      />

      {/* RUNNING TEXT */}
      <div className="w-full max-w-[1000px] bg-red-600 h-10 flex items-center overflow-hidden border-x border-red-700 shadow-inner">
        <div className="flex-1 relative flex items-center h-full">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
                {articles.slice(0, 5).map((art, i) => (
                    <span key={i} className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/50">//</span> {art.title}
                    </span>
                ))}
                {articles.slice(0, 5).map((art, i) => (
                    <span key={`dup-${i}`} className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/50">//</span> {art.title}
                    </span>
                ))}
            </div>
        </div>
      </div>

      {/* ADS HEADER WITH PLACEHOLDER - HIDDEN ON MOBILE */}
      <div className="hidden lg:block w-full max-w-[1000px] px-6 lg:px-0">
        {ads['header']?.image_url ? (
            <a href={ads['header'].target_url} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden shadow-md">
                <img src={ads['header'].image_url} alt="Ads" className="w-full h-auto object-cover max-h-[120px]" />
            </a>
        ) : (
            <div className="h-[120px] bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shadow-inner rounded-sm">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span>
                <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span>
            </div>
        )}
      </div>
      
      <main className="max-w-[1000px] w-full flex-grow py-8 bg-white shadow-sm border-x border-zinc-200 px-6">
        {activeTab === 'Home' && (
            <HomeTab 
                articles={articles}
                session={session} 
                globalSearchQuery={searchQuery} 
                initialArticle={targetArticle}
                onClearTarget={() => setTargetArticle(null)}
                smartphones={smartphones}
                onProductSelect={handleProductSelect}
                sidebarAd={ads['sidebar']}
                articleAd={ads['article']}
            />
        )}
        {activeTab === 'Katalog' && (
          <CatalogTab 
            items={smartphones} 
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            session={session}
            sidebarAd={ads['sidebar']}
            minPrice={minPrice} 
            setMinPrice={setMinPrice} 
            maxPrice={maxPrice} 
            setMaxPrice={setMaxPrice}
          />
        )}
        {activeTab === 'Segera Rilis' && <ComingSoonTab items={smartphones} publishedAiData={tkdnMonitorData} />}
        {activeTab === 'Bandingkan' && <ComparisonTab items={smartphones} selectedIds={comparisonIds} setSelectedIds={setComparisonIds} />}
        {activeTab === 'Profil' && <ProfileTab session={session} smartphones={smartphones} articles={articles} onProductSelect={handleProductSelect} onArticleSelect={handleArticleSelect} />}
      </main>

      <Footer />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* MOBILE BOTTOM NAV - NON-FLOATING (FULL WIDTH & SNAPPED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] pointer-events-auto">
        <nav className="w-full bg-[#0b0b0b] text-white flex items-center justify-around py-3.5 px-2 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.3)] border-t border-white/10">
          <button onClick={() => { window.location.hash = '#/home'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Home' ? 'text-red-500' : 'text-zinc-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[8px] font-black uppercase tracking-tighter">BERANDA</span>
          </button>
          <button onClick={() => { window.location.hash = '#/bandingkan'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Bandingkan' ? 'text-red-500' : 'text-zinc-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="text-[8px] font-black uppercase tracking-tighter">COMPARE</span>
          </button>
          <button onClick={() => { window.location.hash = '#/katalog'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Katalog' ? 'text-red-500' : 'text-zinc-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>
            <span className="text-[8px] font-black uppercase tracking-tighter">KATALOG</span>
          </button>
          <button onClick={() => { window.location.hash = '#/coming-soon'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Segera Rilis' ? 'text-red-500' : 'text-zinc-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-[8px] font-black uppercase tracking-tighter">TKDN</span>
          </button>
          {session && (
            isAdmin ? (
              <button onClick={() => { window.location.hash = '#/admin'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Admin' ? 'text-red-500' : 'text-zinc-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-tighter">ADMIN</span>
              </button>
            ) : (
              <button onClick={() => { window.location.hash = '#/profile'; }} className={`flex flex-col items-center gap-1.5 min-w-[60px] ${activeTab === 'Profil' ? 'text-red-500' : 'text-zinc-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-tighter">PROFIL</span>
              </button>
            )
          )}
        </nav>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-flex; animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
