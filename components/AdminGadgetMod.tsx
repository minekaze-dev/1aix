
import React, { useState, useEffect, useMemo } from 'react';
import { BRANDS } from '../constants';
import type { Smartphone, Brand, ReleaseStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AdminGadgetModProps {
  onDataChange?: () => void;
}

const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const AdminGadgetMod: React.FC<AdminGadgetModProps> = ({ onDataChange }) => {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("ALL");

  // Form State
  const initialFormState: Partial<Smartphone> = {
    brand: 'Samsung',
    model_name: '',
    release_status: 'Tersedia',
    release_month: 'Januari',
    release_year: new Date().getFullYear().toString(),
    launch_date_indo: new Date().toISOString().split('T')[0],
    tkdn_score: 35,
    chipset: '',
    ram_storage: '',
    price_srp: 0,
    image_url: '',
    official_store_link: '',
    dimensions_weight: '',
    material: '',
    colors: '',
    network: 'GSM / HSPA / LTE / 5G',
    wifi: '',
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
    usb_type: '',
    audio: '',
    features_extra: ''
  };

  const [formData, setFormData] = useState<Partial<Smartphone>>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSmartphones();
  }, []);

  const fetchSmartphones = async () => {
    setLoading(true);
    const localSaved = localStorage.getItem('1AIX_LOCAL_PHONES');
    const localData: Smartphone[] = localSaved ? JSON.parse(localSaved) : [];
    setSmartphones(localData);
    setLoading(false);
  };

  const filteredSmartphones = useMemo(() => {
    return smartphones.filter(p => {
        const matchesSearch = p.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = filterBrand === "ALL" || p.brand === filterBrand;
        return matchesSearch && matchesBrand;
    });
  }, [smartphones, searchQuery, filterBrand]);

  const handleEdit = (phone: Smartphone) => {
    setFormData(phone);
    setEditingId(phone.id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(true);
  };

  const handleAiAutoFill = async () => {
    if (!formData.model_name || !formData.brand) {
      alert("Masukkan Nama Brand dan Model terlebih dahulu!");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate technical specifications for the smartphone "${formData.brand} ${formData.model_name}" as sold in Indonesia. 
      Return the data in the following JSON format strictly.
      Fields: release_month (e.g. "Januari"), release_year (e.g. "2024"), chipset, ram_storage, dimensions_weight, material, colors, network, wifi, display_type, os, cpu, gpu, camera_main, camera_video_main, camera_selfie, camera_video_selfie, battery_capacity, charging, sensors, usb_type, audio, features_extra, tkdn_score (number), price_srp (number), image_url.
      Only return the raw JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const aiData = JSON.parse(response.text || '{}');
      setFormData(prev => ({ ...prev, ...aiData, brand: prev.brand, model_name: prev.model_name }));
    } catch (error) {
      alert("AI Auto-fill failed. Please fill manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus smartphone ini dari katalog?')) return;
    
    const localSaved = localStorage.getItem('1AIX_LOCAL_PHONES');
    if (localSaved) {
        const localData: Smartphone[] = JSON.parse(localSaved);
        const filtered = localData.filter(p => p.id !== id);
        localStorage.setItem('1AIX_LOCAL_PHONES', JSON.stringify(filtered));
    }

    fetchSmartphones();
    if (onDataChange) onDataChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { 
        ...formData, 
        id: editingId || `local-${Date.now()}`,
        created_at: new Date().toISOString()
    } as Smartphone;

    const localSaved = localStorage.getItem('1AIX_LOCAL_PHONES');
    let localData: Smartphone[] = localSaved ? JSON.parse(localSaved) : [];
    
    if (editingId) {
        localData = localData.map(p => p.id === editingId ? payload : p);
    } else {
        localData.unshift(payload);
    }
    
    localStorage.setItem('1AIX_LOCAL_PHONES', JSON.stringify(localData));
    
    setTimeout(() => {
        setIsSubmitting(false);
        setShowForm(false);
        fetchSmartphones();
        if (onDataChange) onDataChange();
        alert(editingId ? 'Berhasil diperbarui secara Lokal!' : 'Berhasil ditayangkan secara Lokal!');
    }, 500);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">GADGET MOD</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">MODUL MANAJEMEN KATALOG (UJI COBA OFFLINE)</p>
        </div>
        {!showForm && (
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            TAMBAH HP BARU
          </button>
        )}
      </header>

      {showForm ? (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-10">
          <div className="flex items-center justify-between mb-10 border-b border-zinc-50 pb-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-tighter">
              {editingId ? 'EDIT SMARTPHONE' : 'INPUT SMARTPHONE BARU'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] border-l-4 border-red-600 pl-4">IDENTITAS PRODUK</h3>
                 <button 
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={isAiLoading || !formData.model_name}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale"
                 >
                    {isAiLoading ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    )}
                    AI CREATION
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">OFFICIAL BRAND</span>
                    <select 
                      value={formData.brand} 
                      onChange={e => setFormData({...formData, brand: e.target.value as Brand})}
                      className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase focus:border-red-600 outline-none"
                    >
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NAMA MODEL</span>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Galaxy S24 Ultra"
                      value={formData.model_name} 
                      onChange={e => setFormData({...formData, model_name: e.target.value})}
                      className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase focus:border-red-600 outline-none placeholder-zinc-300"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">BULAN RILIS</span>
                        <select 
                        value={formData.release_month} 
                        onChange={e => setFormData({...formData, release_month: e.target.value})}
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-xs font-black uppercase focus:border-red-600 outline-none"
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">TAHUN RILIS</span>
                        <input 
                        type="text" 
                        placeholder="2024"
                        value={formData.release_year} 
                        onChange={e => setFormData({...formData, release_year: e.target.value})}
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none placeholder-zinc-300"
                        />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">STATUS RILIS</span>
                    <select 
                      value={formData.release_status} 
                      onChange={e => setFormData({...formData, release_status: e.target.value as ReleaseStatus})}
                      className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase focus:border-red-600 outline-none"
                    >
                      <option value="Tersedia">TERSEDIA</option>
                      <option value="Pre-Order">PRE-ORDER</option>
                      <option value="Segera Rilis">SEGERA RILIS</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">HARGA SRP (IDR)</span>
                      <input 
                        type="number" 
                        required
                        value={formData.price_srp} 
                        onChange={e => setFormData({...formData, price_srp: Number(e.target.value)})}
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">SKOR TKDN (%)</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.tkdn_score} 
                        onChange={e => setFormData({...formData, tkdn_score: Number(e.target.value)})}
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <label className="block">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">COVER IMAGE URL</span>
                  <input 
                    type="url" 
                    required
                    placeholder="https://..."
                    value={formData.image_url} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none placeholder-zinc-300"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] mb-6 border-l-4 border-red-600 pl-4">SPESIFIKASI UTAMA</h3>
              <div className="grid grid-cols-2 gap-8">
                <label className="block">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">CHIPSET</span>
                  <input 
                    type="text" 
                    placeholder="Snapdragon 8 Gen 3"
                    value={formData.chipset} 
                    onChange={e => setFormData({...formData, chipset: e.target.value})}
                    className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">RAM / STORAGE</span>
                  <input 
                    type="text" 
                    placeholder="12GB / 256GB"
                    value={formData.ram_storage} 
                    onChange={e => setFormData({...formData, ram_storage: e.target.value})}
                    className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:border-red-600 outline-none"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] mb-6 border-l-4 border-red-600 pl-4">PRODUK DETAIL</h3>
              <div className="grid grid-cols-3 gap-6">
                 {[
                   { label: 'DIMENSI & BERAT', field: 'dimensions_weight' },
                   { label: 'MATERIAL BODY', field: 'material' },
                   { label: 'PILIHAN WARNA', field: 'colors' },
                   { label: 'TIPE LAYAR', field: 'display_type' },
                   { label: 'SISTEM OPERASI', field: 'os' },
                   { label: 'PROSESOR (CPU)', field: 'cpu' },
                   { label: 'GRAFIS (GPU)', field: 'gpu' },
                   { label: 'KAMERA UTAMA', field: 'camera_main' },
                   { label: 'KAMERA SELFIE', field: 'camera_selfie' },
                   { label: 'BATERAI', field: 'battery_capacity' },
                   { label: 'PENGISIAN DAYA', field: 'charging' },
                   { label: 'SENSOR', field: 'sensors' },
                   { label: 'AUDIO', field: 'audio' },
                   { label: 'USB TYPE', field: 'usb_type' },
                   { label: 'FITUR EKSTRA', field: 'features_extra' },
                 ].map(spec => (
                   <label key={spec.field} className="block">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">{spec.label}</span>
                      <input 
                        type="text" 
                        value={(formData as any)[spec.field] || ''} 
                        onChange={e => setFormData({...formData, [spec.field]: e.target.value})}
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-3 rounded-sm text-[11px] font-black focus:border-red-600 outline-none"
                      />
                   </label>
                 ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-100">
               <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all"
               >
                 BATAL
               </button>
               <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-[#ef4444] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-sm hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
               >
                 {isSubmitting ? 'MEMPROSES...' : 'TAYANGKAN KE KATALOG'}
               </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
           {/* FILTER BAR */}
           <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                    <div className="relative flex-1 max-w-sm">
                         <input 
                            type="text" 
                            placeholder="Cari model..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-md text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all"
                         />
                         <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <select 
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className="bg-white border border-zinc-200 py-2.5 px-4 rounded-md text-[10px] font-black uppercase outline-none focus:border-blue-500"
                    >
                        <option value="ALL">SEMUA BRAND</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="text-[10px] font-black text-zinc-400 uppercase">
                    {filteredSmartphones.length} PRODUK DITEMUKAN
                </div>
           </div>

           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                 <th className="px-8 py-5">SMARTPHONE</th>
                 <th className="px-8 py-5">PRICE SRP</th>
                 <th className="px-8 py-5">STATUS</th>
                 <th className="px-8 py-5">TKDN</th>
                 <th className="px-8 py-5 text-right">AKSI</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-50">
               {loading ? (
                 <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] animate-pulse">Memuat Katalog Lokal...</td>
                 </tr>
               ) : filteredSmartphones.length > 0 ? filteredSmartphones.map(phone => (
                 <tr key={phone.id} className="hover:bg-zinc-50/50 transition-colors group">
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-100 rounded-sm p-1 flex items-center justify-center">
                          <img src={phone.image_url} alt={phone.model_name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-zinc-900 uppercase leading-none mb-1">{phone.model_name}</div>
                          <div className="text-[9px] font-black text-red-600 uppercase tracking-widest">{phone.brand}</div>
                        </div>
                      </div>
                   </td>
                   <td className="px-8 py-5">
                      <div className="text-[11px] font-black text-blue-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(phone.price_srp)}
                      </div>
                   </td>
                   <td className="px-8 py-5">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${phone.release_status === 'Tersedia' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {phone.release_status}
                      </span>
                   </td>
                   <td className="px-8 py-5">
                      <div className="text-[11px] font-black text-zinc-400">{phone.tkdn_score}%</div>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(phone)}
                          className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(phone.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                   </td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Katalog Masih Kosong</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default AdminGadgetMod;
