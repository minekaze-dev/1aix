
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NEWS_UPDATES } from './constants';
import type { Smartphone, Brand } from './types';
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

export default function App() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || 'home');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

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

  const isAdmin = useMemo(() => {
    // Update: Added rifki.mau@gmail.com as admin
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smartphones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSmartphones(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setSmartphones([]);
    } finally {
      setLoading(false);
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
        setSession(null); // Force clear session state for immediate UI update
        window.location.hash = '#/home';
    } catch (error) {
        console.error("Logout Error:", error);
    }
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
                onDataChange={fetchData}
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
        {activeTab === 'Home' && <HomeTab onOpenLogin={handleOpenAuth} onLogout={handleLogout} session={session} />}
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
          />
        )}
        {activeTab === 'Segera Rilis' && <ComingSoonTab items={smartphones} />}
        {activeTab === 'Bandingkan' && <ComparisonTab items={smartphones} />}
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
