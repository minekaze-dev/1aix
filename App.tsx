
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { BRANDS, PRICE_RANGES, NEWS_UPDATES, DUMMY_SMARTPHONES } from './constants';
import type { Smartphone, Brand } from './types';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import CatalogTab from './components/CatalogTab';
import ComingSoonTab from './components/ComingSoonTab';
import ComparisonTab from './components/ComparisonTab';
import Footer from './components/Footer';

export default function App() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || 'home');

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '') || 'home';
      setRoute(currentHash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('smartphones').select('*').order('launch_date_indo', { ascending: false });
        if (error) throw error;
        
        // Merge Supabase data with dummy data for preview
        const fetchedData = data || [];
        // Use a Map to deduplicate by id if necessary
        const combined = [...DUMMY_SMARTPHONES, ...fetchedData];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        setSmartphones(unique);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to dummy data on error
        setSmartphones(DUMMY_SMARTPHONES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeTab = useMemo(() => {
    switch(route) {
      case 'home': return 'Home';
      case 'katalog': return 'Katalog';
      case 'coming-soon': return 'Segera Rilis';
      case 'bandingkan': return 'Bandingkan';
      default: return 'Home';
    }
  }, [route]);

  const handleGoToCatalog = () => {
    setSelectedBrand(null); // Clear brand filter for "All Brands"
    window.location.hash = '#/katalog';
  };

  const handleGoHome = () => {
    setSelectedBrand(null);
    window.location.hash = '#/home';
  };

  const handleGoToCompare = () => {
    window.location.hash = '#/bandingkan';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0b0b] text-blue-500">
        <div className="text-center flex flex-col items-center">
            <img 
                src="https://i.imgur.com/8LtVd3P.jpg" 
                alt="1AIX Logo" 
                className="h-20 w-auto object-contain mb-4 brightness-110 animate-pulse"
            />
            <p className="text-zinc-600 text-xs uppercase tracking-[0.5em] animate-pulse">Loading Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-zinc-900 font-sans flex flex-col items-center selection:bg-blue-600 selection:text-white">
      {/* Centered Header */}
      <Header 
        activeTab={activeTab} 
        onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            window.location.hash = '#/katalog';
        }}
        onGoHome={handleGoHome}
        onGoToCatalog={handleGoToCatalog}
        onGoToCompare={handleGoToCompare}
      />
      
      {/* Red News Ticker - Background updated to #d41525 */}
      <div className="w-full max-w-[1000px] bg-[#d41525] shadow-md border-b border-[#b0111e] overflow-hidden">
        <div className="flex items-center h-10">
            <div className="inline-block animate-marquee px-4 font-black text-[10px] text-white uppercase tracking-widest italic whitespace-nowrap">
            {NEWS_UPDATES.map((news, i) => (
                <span key={i} className="mx-4">
                {news} <span className="text-white/30 ml-4">//</span>
                </span>
            ))}
            {NEWS_UPDATES.map((news, i) => (
                <span key={i + 'copy'} className="mx-4">
                {news} <span className="text-white/30 ml-4">//</span>
                </span>
            ))}
            </div>
        </div>
      </div>

      {/* Main Content Area - 1000px */}
      <main className="max-w-[1000px] w-full flex-grow py-8 bg-white shadow-sm border-x border-zinc-200 px-6">
        {activeTab === 'Home' && <HomeTab />}
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
          />
        )}
        {activeTab === 'Segera Rilis' && <ComingSoonTab items={smartphones} />}
        {activeTab === 'Bandingkan' && <ComparisonTab items={smartphones} />}
      </main>

      {/* Centered Footer */}
      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
