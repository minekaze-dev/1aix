
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AdConfig } from '../types';

interface AdminAdsModProps {
  onDataChange?: () => void;
}

const AdminAdsMod: React.FC<AdminAdsModProps> = ({ onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'header' | 'article' | 'sidebar'>('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      // Normalize IDs to lowercase when mapping to state
      const adsMap = data.reduce((acc, curr) => ({ ...acc, [curr.id.toLowerCase()]: curr }), {});
      setAds(prev => ({ ...prev, ...adsMap }));
    } else if (error) {
      console.error("Fetch Ads Error:", error);
    }
    setLoading(false);
  };

  const handleUpdate = (field: keyof AdConfig, value: string) => {
    setAds(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const currentAd = ads[activeTab];
    // Explicitly force lowercase ID on save
    const normalizedId = activeTab.toLowerCase();
    
    const { error } = await supabase
      .from('ads_banners')
      .upsert({ 
        ...currentAd, 
        id: normalizedId, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (!error) {
      alert("PERUBAHAN IKLAN BERHASIL DITERAPKAN!");
      if (onDataChange) onDataChange();
    } else {
      if (error.message.includes('schema cache')) {
        alert("ERROR: Tabel 'ads_banners' belum dibuat di database. Silakan jalankan SQL Script yang disediakan di Dashboard Supabase untuk membuat tabel ini.");
      } else {
        alert("GAGAL MENYIMPAN: " + error.message);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-black text-zinc-300 uppercase tracking-widest">MEMUAT DATA IKLAN...</div>;
  }

  const current = ads[activeTab];

  // Helper untuk mendapatkan teks placeholder ukuran
  const getDimensionLabel = () => {
    if (activeTab === 'header') return '1000 x 120 PX';
    if (activeTab === 'article') return '700 x 120 PX';
    if (activeTab === 'sidebar') return '240 x 250 PX'; // Sidebar is strictly 240x250
    return '';
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN IKLAN</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA TAMPILAN BANNER PROMOSI UTAMA & ARTIKEL</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'header' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            IKLAN HEADER
          </button>
          <button 
            onClick={() => setActiveTab('article')}
            className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'article' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>
            IKLAN ARTIKEL
          </button>
          <button 
            onClick={() => setActiveTab('sidebar')}
            className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sidebar' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            IKLAN SIDEBAR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Side */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL GAMBAR BANNER ({activeTab.toUpperCase()})</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={current.image_url}
              onChange={(e) => handleUpdate('image_url', e.target.value)}
              className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">LINK TUJUAN (REDIRECT)</label>
            <input 
              type="text" 
              placeholder="#" 
              value={current.target_url}
              onChange={(e) => handleUpdate('target_url', e.target.value)}
              className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">JUDUL PROMO (OPSIONAL)</label>
              <input 
                type="text" 
                value={current.title || ''}
                onChange={(e) => handleUpdate('title', e.target.value)}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">SUB-JUDUL (OPSIONAL)</label>
              <input 
                type="text" 
                value={current.subtitle || ''}
                onChange={(e) => handleUpdate('subtitle', e.target.value)}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-[#ef4444] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'MEMPROSES...' : 'TERAPKAN PERUBAHAN'}
          </button>
        </div>

        {/* Preview Side */}
        <div className="space-y-6">
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">PREVIEW {activeTab.toUpperCase()} AD</label>
          <div className="bg-[#f8fafc] border border-zinc-100 rounded-xl p-8 flex flex-col items-center justify-center min-h-[340px] shadow-inner relative overflow-hidden">
            {current.image_url ? (
              <div className="w-full space-y-4 animate-in zoom-in-95 duration-300">
                 <img src={current.image_url} alt="Ad Preview" className="w-full h-auto rounded shadow-lg border border-zinc-200 mx-auto max-h-[250px] object-contain" />
                 {(current.title || current.subtitle) && (
                   <div className="text-center">
                      <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tighter">{current.title}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{current.subtitle}</p>
                   </div>
                 )}
              </div>
            ) : (
              <div className="w-full aspect-video border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 gap-3 rounded-lg bg-white/50">
                 <span className="text-[11px] font-black tracking-[0.4em] uppercase">{activeTab} AD PLACEHOLDER</span>
                 <div className="bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200">
                    <span className="text-[10px] font-black text-zinc-400 italic tracking-widest">{getDimensionLabel()}</span>
                 </div>
                 <div className="w-2/3 flex justify-center gap-1 opacity-20 mt-2">
                   {[...Array(12)].map((_, i) => <div key={i} className="w-1 h-1 bg-zinc-400 rounded-full"></div>)}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdsMod;
