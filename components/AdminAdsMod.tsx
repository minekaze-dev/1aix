import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AdConfig } from '../types';

interface AdminAdsModProps {
  onDataChange?: () => void;
}

const AdminAdsMod: React.FC<AdminAdsModProps> = ({ onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'header' | 'article' | 'sidebar'>('header');
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Record<string, AdConfig>>({
    header: { id: 'header', image_url: '', target_url: '#', title: '', subtitle: '' },
    article: { id: 'article', image_url: '', target_url: '#', title: '', subtitle: '' },
    sidebar: { id: 'sidebar', image_url: '', target_url: '#', title: '', subtitle: '' }
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ads_banners').select('*');
    if (!error && data) {
      const adsMap = data.reduce((acc, curr) => ({ ...acc, [curr.id.toLowerCase()]: curr }), {});
      setAds(prev => ({ ...prev, ...adsMap }));
    }
    setLoading(false);
  };

  const handleUpdateLocal = (type: string, field: keyof AdConfig, value: string) => {
    setAds(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleSave = async (type: 'header' | 'article' | 'sidebar') => {
    const currentAd = ads[type];
    const { error } = await supabase
      .from('ads_banners')
      .upsert({ 
        ...currentAd, 
        id: type, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (!error) {
      alert(`PERUBAHAN IKLAN ${type.toUpperCase()} BERHASIL DITERAPKAN!`);
      if (onDataChange) onDataChange();
    } else {
      alert("GAGAL MENYIMPAN: " + error.message);
    }
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-black text-zinc-300 uppercase tracking-widest">MEMUAT DATA IKLAN...</div>;
  }

  // Component for Ad Configuration Form + Preview
  const AdEditor = ({ type, config }: { type: 'header' | 'article' | 'sidebar', config: AdConfig }) => {
    const dimensionLabel = type === 'header' ? '1000 x 120 PX' : type === 'article' ? '700 x 120 PX' : '240 x 250 PX';
    
    return (
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6 lg:p-10 mb-8 lg:mb-0">
        <div className="border-b border-zinc-50 pb-6 mb-8 lg:hidden">
            <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter flex items-center gap-3">
               <span className="w-2 h-8 bg-red-600 rounded-full"></span>
               IKLAN {type.toUpperCase()}
            </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Side */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL GAMBAR BANNER</label>
              <input 
                type="text" 
                placeholder="https://..." 
                value={config.image_url}
                onChange={(e) => handleUpdateLocal(type, 'image_url', e.target.value)}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">LINK TUJUAN (REDIRECT)</label>
              <input 
                type="text" 
                placeholder="#" 
                value={config.target_url}
                onChange={(e) => handleUpdateLocal(type, 'target_url', e.target.value)}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">JUDUL PROMO (OPSIONAL)</label>
                <input 
                  type="text" 
                  value={config.title || ''}
                  onChange={(e) => handleUpdateLocal(type, 'title', e.target.value)}
                  className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">SUB-JUDUL (OPSIONAL)</label>
                <input 
                  type="text" 
                  value={config.subtitle || ''}
                  onChange={(e) => handleUpdateLocal(type, 'subtitle', e.target.value)}
                  className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={() => handleSave(type)}
              className="w-full py-4 lg:py-5 bg-[#ef4444] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-[0.98]"
            >
              SIMPAN PERUBAHAN {type.toUpperCase()}
            </button>
          </div>

          {/* Preview Side */}
          <div className="space-y-4 lg:space-y-6">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">PREVIEW {type.toUpperCase()} AD</label>
            <div className="bg-[#f8fafc] border border-zinc-100 rounded-xl p-4 lg:p-8 flex flex-col items-center justify-center min-h-[280px] lg:min-h-[340px] shadow-inner relative overflow-hidden">
              {config.image_url ? (
                <div className="w-full space-y-4 animate-in zoom-in-95 duration-300">
                   <img src={config.image_url} alt="Ad Preview" className="w-full h-auto rounded shadow-lg border border-zinc-200 mx-auto max-h-[200px] lg:max-h-[250px] object-contain" />
                   {(config.title || config.subtitle) && (
                     <div className="text-center">
                        <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tighter">{config.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{config.subtitle}</p>
                     </div>
                   )}
                </div>
              ) : (
                <div className="w-full aspect-video border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 gap-3 rounded-lg bg-white/50">
                   <span className="text-[10px] lg:text-[11px] font-black tracking-[0.4em] uppercase">{type} PLACEHOLDER</span>
                   <div className="bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200">
                      <span className="text-[9px] lg:text-[10px] font-black text-zinc-400 italic tracking-widest">{dimensionLabel}</span>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-10 px-4 lg:px-0">
        <div className="mb-6 md:mb-0">
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN IKLAN</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA TAMPILAN BANNER PROMOSI UTAMA & ARTIKEL</p>
        </div>
        
        {/* Desktop Tab Switcher */}
        <div className="hidden lg:flex bg-zinc-100 p-1 rounded-lg">
          {(['header', 'article', 'sidebar'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#1e293b] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <span className="text-[10px]">{tab === 'header' ? 'IKLAN HEADER' : tab === 'article' ? 'IKLAN ARTIKEL' : 'IKLAN SIDEBAR'}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Desktop View: Tabbed */}
      <div className="hidden lg:block">
        <AdEditor type={activeTab} config={ads[activeTab]} />
      </div>

      {/* Mobile View: All Stacked */}
      <div className="lg:hidden space-y-12 px-2">
        <AdEditor type="header" config={ads.header} />
        <AdEditor type="article" config={ads.article} />
        <AdEditor type="sidebar" config={ads.sidebar} />
      </div>
    </div>
  );
};

export default AdminAdsMod;