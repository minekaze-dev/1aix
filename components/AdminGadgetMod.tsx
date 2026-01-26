
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BRANDS } from '../constants';
import type { Smartphone, Brand, ReleaseStatus, MarketCategory } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';

interface AdminGadgetModProps {
  onDataChange?: () => void;
}

const CATEGORIES: MarketCategory[] = ["Entry-level", "Mid-range", "Flagship"];

const AdminGadgetMod: React.FC<AdminGadgetModProps> = ({ onDataChange }) => {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("ALL");
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState: Partial<Smartphone> = {
    brand: 'Samsung',
    model_name: '',
    market_category: 'Mid-range',
    release_status: 'Tersedia',
    release_month: 'Januari',
    release_year: new Date().getFullYear().toString(),
    launch_date_indo: new Date().toISOString().split('T')[0],
    tkdn_score: 35,
    order_rank: 0,
    chipset: '',
    ram_storage: '',
    price_srp: 0,
    image_url: '',
    official_store_link: '',
    network: 'GSM / HSPA / LTE / 5G',
    wifi: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct',
    display_type: '',
    os: '',
    cpu: '',
    gpu: '',
    camera_main: '',
    camera_video_main: '',
    camera_selfie: '',
    camera_video_selfie: '',
    battery_capacity: '',
    charging: '',
    sensors: 'Fingerprint (under display), accelerometer, gyro, proximity, compass, barometer',
    usb_type: 'USB Type-C, OTG',
    audio: 'Stereo speakers',
    features_extra: 'NFC, Bluetooth, IP68'
  };

  const [formData, setFormData] = useState<Partial<Smartphone>>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortPhones = (data: Smartphone[]) => {
    return [...data].sort((a, b) => {
        const rA = a.order_rank ?? 0;
        const rB = b.order_rank ?? 0;
        if (rB !== rA) return rB - rA;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const fetchSmartphones = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smartphones')
        .select('*');
      
      if (error) throw error;
      setSmartphones(sortPhones(data || []));
      setIsDirty(false);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchSmartphones(); }, []);

  const filteredSmartphones = useMemo(() => {
    const list = smartphones.filter(p => {
        const matchesSearch = p.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = filterBrand === "ALL" || p.brand === filterBrand;
        return matchesSearch && matchesBrand;
    });
    // Jangan di-sort ulang di useMemo agar posisi swap lokal terjaga
    return list;
  }, [smartphones, searchQuery, filterBrand]);

  const handleEdit = (phone: Smartphone) => { setFormData(phone); setEditingId(phone.id); setShowForm(true); };
  const handleAddNew = () => { setFormData(initialFormState); setEditingId(null); setShowForm(true); };

  const handleAiAutoFill = async () => {
    if (!formData.model_name || !formData.brand) { alert("Masukkan Nama Brand dan Model terlebih dahulu!"); return; }
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate technical specifications for "${formData.brand} ${formData.model_name}" as sold in the Indonesian market. 
      Return a STRICT JSON object with these keys:
      market_category, release_month, release_year, chipset, ram_storage, dimensions_weight, material, colors, network, wifi, display_type, os, cpu, gpu, camera_main, camera_video_main, camera_selfie, camera_video_selfie, battery_capacity, charging, sensors, usb_type, audio, features_extra, tkdn_score, price_srp, image_url, official_store_link.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt, 
        config: { responseMimeType: "application/json" } 
      });
      
      const aiData = JSON.parse(response.text || '{}');
      setFormData(prev => ({ ...prev, ...aiData }));
    } catch (err) { console.error(err); } finally { setIsAiLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus smartphone ini secara permanen?')) return;
    try {
        const { error } = await supabase.from('smartphones').delete().eq('id', id);
        if (error) throw error;
        fetchSmartphones(true);
        if (onDataChange) onDataChange();
    } catch (err) { alert("Gagal menghapus."); }
  };

  // Hanya memindah posisi di STATE LOKAL agar tidak mental
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredSmartphones.length) return;

    const newSmartphones = [...smartphones];
    // Cari index asli di array smartphones (karena filtered bisa beda index)
    const currentItem = filteredSmartphones[index];
    const targetItem = filteredSmartphones[targetIndex];
    
    const realIdx1 = newSmartphones.findIndex(s => s.id === currentItem.id);
    const realIdx2 = newSmartphones.findIndex(s => s.id === targetItem.id);

    // Swap posisi di array
    [newSmartphones[realIdx1], newSmartphones[realIdx2]] = [newSmartphones[realIdx2], newSmartphones[realIdx1]];
    
    setSmartphones(newSmartphones);
    setIsDirty(true);
  };

  const saveOrdering = async () => {
    if (!isDirty) return;
    setIsSavingOrder(true);
    try {
      // Kita tetapkan order_rank berdasarkan urutan di layar saat ini
      // Menggunakan urutan terbalik: item pertama dapet rank tertinggi
      const total = smartphones.length;
      const updates = smartphones.map((phone, idx) => {
          return supabase
            .from('smartphones')
            .update({ order_rank: total - idx })
            .eq('id', phone.id);
      });

      await Promise.all(updates);
      alert("URUTAN BERHASIL DISIMPAN!");
      setIsDirty(false);
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan urutan.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (editingId) {
            const { error } = await supabase.from('smartphones').update(formData).eq('id', editingId);
            if (error) throw error;
        } else {
            const { id, ...payload } = formData;
            const { error } = await supabase.from('smartphones').insert([payload]);
            if (error) throw error;
        }
        setShowForm(false);
        fetchSmartphones(true);
        if (onDataChange) onDataChange();
    } catch (err) { console.error(err); alert("Gagal menyimpan."); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">GADGET MOD</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">MODUL MANAJEMEN DATABASE</p>
        </div>
        {!showForm && (
            <div className="flex gap-3">
                {isDirty && (
                    <button 
                        onClick={saveOrdering} 
                        disabled={isSavingOrder}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSavingOrder ? 'SAVING...' : 'SIMPAN URUTAN'}
                    </button>
                )}
                <button 
                    onClick={handleAddNew} 
                    className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-95"
                >
                    TAMBAH HP BARU
                </button>
            </div>
        )}
      </header>

      {showForm ? (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8 max-w-5xl mx-auto mb-20">
          <div className="flex items-center justify-between mb-10 border-b border-zinc-50 pb-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-tighter">{editingId ? 'EDIT HP' : 'INPUT HP BARU'}</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="flex justify-end">
              <button type="button" onClick={handleAiAutoFill} disabled={isAiLoading || !formData.model_name} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-indigo-700 disabled:opacity-50 transition-all">{isAiLoading ? 'GENERATING...' : 'AI ASSISTANCE AUTO-FILL'}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] border-l-4 border-red-600 pl-4 mb-4">IDENTITAS PRODUK</h3>
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">OFFICIAL BRAND</span><select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value as Brand})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none">{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></label>
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NAMA MODEL</span><input type="text" required value={formData.model_name} onChange={e => setFormData({...formData, model_name: e.target.value})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none"/></label>
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">KATEGORI PASAR</span><select value={formData.market_category} onChange={e => setFormData({...formData, market_category: e.target.value as MarketCategory})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select></label>
                </div>
                <div className="space-y-6 pt-10">
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">STATUS RILIS</span><select value={formData.release_status} onChange={e => setFormData({...formData, release_status: e.target.value as ReleaseStatus})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none"><option value="Tersedia">TERSEDIA</option><option value="Pre-Order">PRE-ORDER</option><option value="Segera Rilis">SEGERA RILIS</option></select></label>
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">URUTAN PRIORITAS (RANKING)</span><input type="number" value={formData.order_rank || 0} onChange={e => setFormData({...formData, order_rank: Number(e.target.value)})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black outline-none"/></label>
                  <label className="block"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">HARGA SRP (IDR)</span><input type="number" required value={formData.price_srp} onChange={e => setFormData({...formData, price_srp: Number(e.target.value)})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black outline-none"/></label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase rounded-sm">BATAL</button>
                <button type="submit" disabled={isSubmitting} className="px-16 py-4 bg-[#ef4444] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-sm shadow-xl disabled:opacity-50">{isSubmitting ? 'SAVING...' : 'SYNC TO DB'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                 <div className="relative flex-1 max-w-sm">
                    <input type="text" placeholder="Cari model..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded text-[10px] font-black uppercase outline-none focus:border-blue-500"/>
                    <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2"></path></svg>
                 </div>
                 <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="bg-white border border-zinc-200 py-2.5 px-4 rounded text-[10px] font-black uppercase outline-none">
                    <option value="ALL">SEMUA BRAND</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                 </select>
                 {isDirty && <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 animate-pulse uppercase tracking-widest border border-blue-100">URUTAN TELAH BERUBAH. SILAKAN SIMPAN.</div>}
              </div>
              <div className="text-[10px] font-black text-zinc-400 uppercase">{filteredSmartphones.length} ITEMS</div>
           </div>
           <table className="w-full text-left border-collapse">
             <thead><tr className="bg-white border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">POSISI</th><th className="px-8 py-5">SMARTPHONE</th><th className="px-8 py-5">PRICE SRP</th><th className="px-8 py-5">STATUS</th><th className="px-8 py-5 text-right">AKSI</th></tr></thead>
             <tbody className="divide-y divide-zinc-50">
                {loading ? (<tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse font-black text-zinc-300 uppercase text-[10px] tracking-widest">Memuat Database...</td></tr>) : filteredSmartphones.length > 0 ? filteredSmartphones.map((phone, idx) => (
                    <tr key={phone.id} className="hover:bg-zinc-50/50 group transition-all duration-300">
                        <td className="px-8 py-5">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleMove(idx, 'up')}
                                    disabled={idx === 0}
                                    className={`w-10 h-10 border rounded-sm flex items-center justify-center transition-all ${idx === 0 ? 'border-zinc-50 text-zinc-100 opacity-50 cursor-not-allowed' : 'border-zinc-200 text-zinc-400 hover:border-blue-500 hover:text-blue-500 shadow-sm bg-white active:scale-90'}`}
                                    title="Naikkan Urutan"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path></svg>
                                </button>
                                <button 
                                    onClick={() => handleMove(idx, 'down')}
                                    disabled={idx === filteredSmartphones.length - 1}
                                    className={`w-10 h-10 border rounded-sm flex items-center justify-center transition-all ${idx === filteredSmartphones.length - 1 ? 'border-zinc-50 text-zinc-100 opacity-50 cursor-not-allowed' : 'border-zinc-200 text-zinc-400 hover:border-blue-500 hover:text-blue-500 shadow-sm bg-white active:scale-90'}`}
                                    title="Turunkan Urutan"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-100 rounded-sm p-1 flex items-center justify-center shadow-inner">
                                    <img src={phone.image_url} alt={phone.model_name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-zinc-900 uppercase leading-none mb-1">{phone.model_name}</div>
                                    <div className="text-[9px] font-black text-red-600 uppercase tracking-widest">{phone.brand}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5"><div className="text-[11px] font-black text-blue-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(phone.price_srp)}</div></td>
                        <td className="px-8 py-5"><span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${phone.release_status === 'Tersedia' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{phone.release_status}</span></td>
                        <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(phone)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Edit Data"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" strokeWidth="2"></path></svg></button>
                                <button onClick={() => handleDelete(phone.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Hapus Data"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button>
                            </div>
                        </td>
                    </tr>
                )) : (<tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-300 font-black uppercase text-[10px] tracking-widest italic">Tidak ada data ditemukan.</td></tr>)}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default AdminGadgetMod;
