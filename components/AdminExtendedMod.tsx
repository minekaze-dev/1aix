
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BRANDS } from '../constants';
import { supabase } from '../lib/supabase';

interface TkdnItem {
  id: string; // This `id` is mapped to `cert_number` in fetchDataFromAi
  brand: string;
  codename: string;
  marketing_name: string;
  tkdn_score: number;
  cert_number: string;
  cert_date: string;
  status: 'UPCOMING' | 'RELEASED';
}

interface AdminExtendedModProps {
  onDataChange?: () => void; // Added onDataChange prop
}

const AdminExtendedMod: React.FC<AdminExtendedModProps> = ({ onDataChange }) => {
  const [data, setData] = useState<TkdnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const itemsPerPage = 10;

  const fetchExistingData = async () => {
    // This function is still used internally by AdminExtendedMod to populate its own table
    // when first loaded or after a local publish.
    // The ComingSoonTab now gets its data from App.tsx via props.
    const { data: dbData, error } = await supabase.from('tkdn_monitor').select('*').order('cert_date', { ascending: false });
    if (error) {
        console.error("Error fetching existing TKDN data:", error);
    } else {
        setData(dbData || []);
    }
  };

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchDataFromAi = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Simulate/Extract the latest smartphone TKDN certification data from https://tkdn.kemenperin.go.id for the Indonesian market.
      Criteria:
      1. Date: ONLY entries from January 2026 onwards.
      2. Score: TKDN score MUST be > 35%.
      3. Brands: ONLY from this list: ${BRANDS.join(', ')}.
      4. Translation: Convert technical codenames into their actual Marketing Names (e.g. "SM-S958" to "Galaxy S26 Ultra").
      5. Quantity: Provide exactly 20 items.
      Return strictly raw JSON array of objects.
      Fields: brand, codename, marketing_name, tkdn_score (number), cert_number, cert_date (YYYY-MM-DD), status (UPCOMING or RELEASED).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsedRaw = JSON.parse(response.text || '[]');
      const parsed = parsedRaw.map((item: any, idx: number) => ({
        ...item,
        id: item.cert_number || `tkdn-${Date.now()}-${idx}` // Ensure id is cert_number for consistency
      }));
      
      setData(parsed);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof TkdnItem, value: any) => {
    const newData = data.map(item => item.id === id ? { ...item, [field]: value } : item);
    setData(newData);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Hapus baris ini secara permanen dari database TKDN Monitor? Tindakan ini tidak bisa dibatalkan.")) return;
    
    try {
        const { error } = await supabase
            .from('tkdn_monitor')
            .delete()
            .eq('cert_number', id); // 'id' from the TkdnItem state is actually the cert_number

        if (error) throw error;
        
        // Update local state
        setData(data.filter(item => item.id !== id));
        alert("Data berhasil dihapus dari database.");
        
        // Notify parent to refresh all data, including ComingSoonTab's TKDN data
        onDataChange?.(); 

    } catch (err: any) {
        console.error("Gagal menghapus item TKDN:", err);
        alert("Gagal menghapus data dari database: " + err.message);
    }
  };

  const handlePublish = async () => {
    if (data.length === 0) return;
    setIsPublishing(true);
    
    try {
        // Prepare payload, ensuring 'id' (which is just a UI key) is not sent to DB, 
        // as 'cert_number' is the PK for upsert.
        const payload = data.map(({ id, ...rest }) => ({ ...rest })); 
        
        const { error } = await supabase
            .from('tkdn_monitor')
            .upsert(payload, { onConflict: 'cert_number' }); // Use cert_number as unique key for upsert

        if (error) throw error;
        alert("DATA BERHASIL DISINKRONISASI KE LIVE DB!");
        fetchExistingData(); // Re-fetch to show latest data in AdminExtendedMod
        onDataChange?.(); // Notify parent to refresh all data, including ComingSoonTab
    } catch (err: any) {
        console.error(err);
        alert("Gagal sinkronisasi: " + err.message);
    } finally {
        setIsPublishing(false);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1 flex items-center gap-3">
            1AIX EXTENDED
            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-widest leading-none">AI POWERED</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">DATABASE MONITOR TKDN & SERTIFIKASI</p>
        </div>
        <div className="flex gap-3">
            <button onClick={fetchDataFromAi} disabled={loading || isPublishing} className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>}
                SCAN LIVE KEMENPERIN (AI)
            </button>
            {data.length > 0 && <button onClick={handlePublish} disabled={loading || isPublishing} className="flex items-center gap-3 px-8 py-4 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">{isPublishing ? 'SYNCING...' : 'PUBLISH TO LIVE DB'}</button>}
        </div>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <table className="w-full text-left border-collapse flex-grow">
          <thead><tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]"><th className="px-8 py-4">BRAND & MARKETING NAME</th><th className="px-8 py-4">CODENAME</th><th className="px-8 py-4">NO. SERTIFIKAT</th><th className="px-8 py-4">SKOR TKDN</th><th className="px-8 py-4">TGL VERIFIKASI</th><th className="px-8 py-4 text-right">AKSI</th></tr></thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={6} className="px-8 py-32 text-center text-zinc-300 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Scanning feed...</td></tr>
            ) : currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-8 py-4">
                    <div className="flex flex-col gap-1.5">
                        <input 
                            type="text" 
                            value={item.brand} 
                            onChange={(e) => handleUpdateItem(item.id, 'brand', e.target.value.toUpperCase())}
                            className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-transparent border-b border-zinc-100 focus:border-red-300 outline-none w-full"
                            title="Edit Brand Manual"
                        />
                        <input 
                            type="text" 
                            value={item.marketing_name} 
                            onChange={(e) => handleUpdateItem(item.id, 'marketing_name', e.target.value)}
                            className="text-[12px] font-black text-zinc-900 uppercase tracking-tight bg-transparent border-b border-zinc-100 focus:border-blue-300 outline-none w-full"
                            title="Edit Nama Pemasaran"
                        />
                    </div>
                </td>
                <td className="px-8 py-4 text-[10px] font-mono text-zinc-400">{item.codename}</td>
                <td className="px-8 py-4 text-[10px] font-mono text-zinc-400">{item.cert_number}</td>
                <td className="px-8 py-4"><div className="text-xs font-black text-zinc-800 underline decoration-blue-500 decoration-2 underline-offset-4">{item.tkdn_score}%</div></td>
                <td className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase">{item.cert_date}</td>
                <td className="px-8 py-4 text-right">
                    <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                        title="Hapus data ini"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
              </tr>
            ))}
            {!loading && currentItems.length === 0 && (
              <tr><td colSpan={6} className="px-8 py-32 text-center text-zinc-200 font-black uppercase text-xs tracking-widest italic">Tidak ada data monitor.</td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (<div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between"><div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PAGE {currentPage} OF {totalPages}</div><div className="flex gap-2"><button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase rounded disabled:opacity-30">PREV</button><button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase rounded disabled:opacity-30">NEXT</button></div></div>)}
      </div>
    </div>
  );
};

export default AdminExtendedMod;
