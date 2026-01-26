
import React, { useState, useEffect, useMemo } from 'react';
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
    // Technical Fields
    dimensions_weight: '',
    material: '',
    colors: '',
    network: 'GSM / HSPA / LTE / 5G',
    wifi: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, dual-band, Wi-Fi Direct',
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
    sensors: '',
    usb_type: 'USB Type-C 2.0',
    audio: 'Loudspeaker, 3.5mm jack',
    features_extra: ''
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
    return smartphones.filter(p => {
        const matchesSearch = p.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = filterBrand === "ALL" || p.brand === filterBrand;
        return matchesSearch && matchesBrand;
    });
  }, [smartphones, searchQuery, filterBrand]);

  const handleEdit = (phone: Smartphone) => { 
    setFormData({ ...initialFormState, ...phone }); 
    setEditingId(phone.id); 
    setShowForm(true); 
  };
  
  const handleAddNew = () => { 
    setFormData(initialFormState); 
    setEditingId(null); 
    setShowForm(true); 
  };

  const handleAiAutoFill = async () => {
    if (!formData.model_name || !formData.brand) { alert("Masukkan Nama Brand dan Model terlebih dahulu!"); return; }
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate complete technical specifications for "${formData.brand} ${formData.model_name}" for the Indonesian market.
      Return a STRICT JSON object with these keys:
      market_category (Flagship/Mid-range/Entry-level), release_month, release_year, chipset, ram_storage, dimensions_weight, material, colors, network, wifi, display_type, os, cpu, gpu, camera_main, camera_video_main, camera_selfie, camera_video_selfie, battery_capacity, charging, sensors, usb_type, audio, features_extra, tkdn_score (number), price_srp (number).
      Ensure data is as accurate as possible for the Indonesian official version.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt, 
        config: { responseMimeType: "application/json" } 
      });
      
      const aiData = JSON.parse(response.text || '{}');
      setFormData(prev => ({ ...prev, ...aiData }));
    } catch (err) { 
        console.error(err); 
        alert("AI gagal mengambil data. Periksa koneksi atau model HP.");
    } finally { 
        setIsAiLoading(false); 
    }
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

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredSmartphones.length) return;

    const newSmartphones = [...smartphones];
    const currentItem = filteredSmartphones[index];
    const targetItem = filteredSmartphones[targetIndex];
    
    const realIdx1 = newSmartphones.findIndex(s => s.id === currentItem.id);
    const realIdx2 = newSmartphones.findIndex(s => s.id === targetItem.id);

    [newSmartphones[realIdx1], newSmartphones[realIdx2]] = [newSmartphones[realIdx2], newSmartphones[realIdx1]];
    
    setSmartphones(newSmartphones);
    setIsDirty(true);
  };

  const saveOrdering = async () => {
    if (!isDirty) return;
    setIsSavingOrder(true);
    try {
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
            alert("Berhasil diperbarui!");
        } else {
            const { id, ...payload } = formData;
            const { error } = await supabase.from('smartphones').insert([payload]);
            if (error) throw error;
            alert("Berhasil ditambahkan ke katalog!");
        }
        setShowForm(false);
        fetchSmartphones(true);
        if (onDataChange) onDataChange();
    } catch (err) { console.error(err); alert("Gagal menyimpan data ke database."); } finally { setIsSubmitting(false); }
  };

  const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-6 pt-6 first:pt-0">
        <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] border-l-4 border-red-600 pl-4 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
  );

  const FormInput = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: any, onChange: (val: any) => void, type?: string, placeholder?: string }) => (
    <label className="block">
        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">{label}</span>
        <input 
            type={type} 
            value={value || ''} 
            onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
            placeholder={placeholder}
            className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500 transition-colors"
        />
    </label>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">GADGET MOD</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">MANAJEMEN KATALOG SMARTPHONE</p>
        </div>
        {!showForm && (
            <div className="flex gap-3">
                {isDirty && (
                    <button onClick={saveOrdering} disabled={isSavingOrder} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-sm shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">{isSavingOrder ? 'SAVING...' : 'SIMPAN URUTAN'}</button>
                )}
                <button onClick={handleAddNew} className="px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-95">TAMBAH HP BARU</button>
            </div>
        )}
      </header>

      {showForm ? (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-10 max-w-5xl mx-auto mb-20 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-10 border-b border-zinc-50 pb-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-tighter">{editingId ? 'EDIT SPESIFIKASI' : 'INPUT SPESIFIKASI BARU'}</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-12 divide-y divide-zinc-50">
            <div className="flex justify-end pb-4">
              <button type="button" onClick={handleAiAutoFill} disabled={isAiLoading || !formData.model_name} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg">{isAiLoading ? 'GENERATING...' : 'AI ASSISTANCE AUTO-FILL'}</button>
            </div>

            <FormSection title="IDENTITAS UTAMA">
                <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">OFFICIAL BRAND</span>
                    <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value as Brand})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500">{BRANDS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}</select>
                </label>
                <FormInput label="NAMA MODEL" value={formData.model_name} onChange={v => setFormData({...formData, model_name: v})} placeholder="Galaxy S25 Ultra" />
                <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">KATEGORI PASAR</span>
                    <select value={formData.market_category} onChange={e => setFormData({...formData, market_category: e.target.value as MarketCategory})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500">{CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select>
                </label>
                <FormInput label="HARGA SRP (IDR)" type="number" value={formData.price_srp} onChange={v => setFormData({...formData, price_srp: v})} />
                <FormInput label="OFFICIAL STORE LINK" value={formData.official_store_link} onChange={v => setFormData({...formData, official_store_link: v})} />
                <FormInput label="IMAGE URL" value={formData.image_url} onChange={v => setFormData({...formData, image_url: v})} />
            </FormSection>

            <FormSection title="BODY & MATERIAL">
                <FormInput label="DIMENSI / BERAT" value={formData.dimensions_weight} onChange={v => setFormData({...formData, dimensions_weight: v})} placeholder="164.4 x 77.9 x 7.9 mm, 200g" />
                <FormInput label="MATERIAL" value={formData.material} onChange={v => setFormData({...formData, material: v})} placeholder="Glass front, plastic frame..." />
                <FormInput label="WARNA" value={formData.colors} onChange={v => setFormData({...formData, colors: v})} placeholder="Titanium Black, Gray, Silver" />
            </FormSection>

            <FormSection title="CONNECTIVITY & DISPLAY">
                <FormInput label="JARINGAN" value={formData.network} onChange={v => setFormData({...formData, network: v})} placeholder="GSM / HSPA / LTE / 5G" />
                <FormInput label="WIFI" value={formData.wifi} onChange={v => setFormData({...formData, wifi: v})} placeholder="Wi-Fi 802.11 a/b/g/n/ac/6e/7" />
                <FormInput label="TIPE LAYAR" value={formData.display_type} onChange={v => setFormData({...formData, display_type: v})} placeholder="6.7-inch Super AMOLED, 120Hz..." />
            </FormSection>

            <FormSection title="PLATFORM (INTERNAL)">
                <FormInput label="OS" value={formData.os} onChange={v => setFormData({...formData, os: v})} placeholder="Android 15, One UI 7" />
                <FormInput label="CHIPSET" value={formData.chipset} onChange={v => setFormData({...formData, chipset: v})} placeholder="Exynos 1330 (5nm)" />
                <FormInput label="CPU" value={formData.cpu} onChange={v => setFormData({...formData, cpu: v})} placeholder="Octa-core (2x2.4 GHz...)" />
                <FormInput label="GPU" value={formData.gpu} onChange={v => setFormData({...formData, gpu: v})} placeholder="Mali-G68 MP2" />
                <FormInput label="RAM / ROM" value={formData.ram_storage} onChange={v => setFormData({...formData, ram_storage: v})} placeholder="8GB RAM / 256GB STORAGE" />
            </FormSection>

            <FormSection title="CAMERA">
                <FormInput label="KAMERA UTAMA" value={formData.camera_main} onChange={v => setFormData({...formData, camera_main: v})} placeholder="50 MP, f/1.8 (wide)..." />
                <FormInput label="VIDEO UTAMA" value={formData.camera_video_main} onChange={v => setFormData({...formData, camera_video_main: v})} />
                <FormInput label="KAMERA SELFIE" value={formData.camera_selfie} onChange={v => setFormData({...formData, camera_selfie: v})} placeholder="13 MP, f/2.0 (wide)" />
                <FormInput label="VIDEO SELFIE" value={formData.camera_video_selfie} onChange={v => setFormData({...formData, camera_video_selfie: v})} />
            </FormSection>

            <FormSection title="BATTERY & HARDWARE">
                <FormInput label="KAPASITAS BATERAI" value={formData.battery_capacity} onChange={v => setFormData({...formData, battery_capacity: v})} placeholder="5000 mAh" />
                <FormInput label="CHARGING" value={formData.charging} onChange={v => setFormData({...formData, charging: v})} placeholder="25W Wired" />
                <FormInput label="SENSORS" value={formData.sensors} onChange={v => setFormData({...formData, sensors: v})} placeholder="Fingerprint, Accelerometer..." />
                <FormInput label="TIPE USB" value={formData.usb_type} onChange={v => setFormData({...formData, usb_type: v})} placeholder="USB Type-C 2.0" />
                <FormInput label="AUDIO" value={formData.audio} onChange={v => setFormData({...formData, audio: v})} placeholder="Loudspeaker, 3.5mm jack" />
                <FormInput label="FITUR EXTRA" value={formData.features_extra} onChange={v => setFormData({...formData, features_extra: v})} placeholder="NFC, IP54 Resistance..." />
            </FormSection>

            <FormSection title="ADMINISTRASI & STATUS">
                <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">STATUS RILIS</span>
                    <select value={formData.release_status} onChange={e => setFormData({...formData, release_status: e.target.value as ReleaseStatus})} className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"><option value="Tersedia">TERSEDIA</option><option value="Pre-Order">PRE-ORDER</option><option value="Segera Rilis">SEGERA RILIS</option></select>
                </label>
                <FormInput label="SKOR TKDN (%)" type="number" value={formData.tkdn_score} onChange={v => setFormData({...formData, tkdn_score: v})} />
                <FormInput label="BULAN RILIS" value={formData.release_month} onChange={v => setFormData({...formData, release_month: v})} />
                <FormInput label="TAHUN RILIS" value={formData.release_year} onChange={v => setFormData({...formData, release_year: v})} />
                <FormInput label="URUTAN PRIORITAS" type="number" value={formData.order_rank} onChange={v => setFormData({...formData, order_rank: v})} />
            </FormSection>

            <div className="flex justify-end gap-4 pt-10 border-t border-zinc-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase rounded-sm hover:bg-zinc-200 transition-colors">BATAL</button>
                <button type="submit" disabled={isSubmitting} className="px-16 py-4 bg-[#ef4444] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-sm shadow-xl disabled:opacity-50 transition-all active:scale-95">{isSubmitting ? 'SAVING...' : 'SYNC TO DATABASE'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                 <div className="relative flex-1 max-w-sm">
                    <input type="text" placeholder="Cari model..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded text-[10px] font-black uppercase outline-none focus:border-blue-500"/>
                    <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"></path></svg>
                 </div>
                 <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="bg-white border border-zinc-200 py-2.5 px-4 rounded text-[10px] font-black uppercase outline-none">
                    <option value="ALL">SEMUA BRAND</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                 </select>
                 {isDirty && <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 animate-pulse uppercase tracking-widest border border-blue-100">URUTAN BERUBAH. SIMPAN SEKARANG.</div>}
              </div>
           </div>
           <table className="w-full text-left border-collapse">
             <thead><tr className="bg-white border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">POSISI</th><th className="px-8 py-5">SMARTPHONE</th><th className="px-8 py-5">PRICE SRP</th><th className="px-8 py-5">STATUS</th><th className="px-8 py-5 text-right">AKSI</th></tr></thead>
             <tbody className="divide-y divide-zinc-50">
                {loading ? (<tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse font-black text-zinc-300 uppercase text-[10px] tracking-widest">Memuat Database...</td></tr>) : filteredSmartphones.length > 0 ? filteredSmartphones.map((phone, idx) => (
                    <tr key={phone.id} className="hover:bg-zinc-50/50 group transition-all duration-300">
                        <td className="px-8 py-5">
                            <div className="flex gap-2">
                                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className={`w-8 h-8 border rounded flex items-center justify-center transition-all ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'border-zinc-200 text-zinc-400 hover:border-blue-500 hover:text-blue-500'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg></button>
                                <button onClick={() => handleMove(idx, 'down')} disabled={idx === filteredSmartphones.length - 1} className={`w-8 h-8 border rounded flex items-center justify-center transition-all ${idx === filteredSmartphones.length - 1 ? 'opacity-20 cursor-not-allowed' : 'border-zinc-200 text-zinc-400 hover:border-blue-500 hover:text-blue-500'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg></button>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-100 rounded p-1 flex items-center justify-center"><img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" /></div>
                                <div><div className="text-[11px] font-black text-zinc-900 uppercase leading-none mb-1">{phone.model_name}</div><div className="text-[9px] font-black text-red-600 uppercase tracking-widest">{phone.brand}</div></div>
                            </div>
                        </td>
                        <td className="px-8 py-5"><div className="text-[11px] font-black text-blue-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(phone.price_srp)}</div></td>
                        <td className="px-8 py-5"><span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${phone.release_status === 'Tersedia' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{phone.release_status}</span></td>
                        <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(phone)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                                <button onClick={() => handleDelete(phone.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
