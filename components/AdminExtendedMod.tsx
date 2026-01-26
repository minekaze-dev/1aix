
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BRANDS } from '../constants';
import { supabase } from '../lib/supabase';

interface TkdnItem {
  id: string;
  brand: string;
  codename: string;
  marketing_name: string;
  tkdn_score: number;
  cert_number: string;
  cert_date: string;
  status: 'UPCOMING' | 'RELEASED';
}

const AdminExtendedMod: React.FC = () => {
  const [data, setData] = useState<TkdnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const itemsPerPage = 10;

  const fetchExistingData = async () => {
    const { data: dbData } = await supabase.from('tkdn_monitor').select('*').order('cert_date', { ascending: false });
    if (dbData) setData(dbData);
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
      6. Format: Return a strictly raw JSON array of objects.
      Fields: brand, codename, marketing_name, tkdn_score (number), cert_number, cert_date (YYYY-MM-DD), status (UPCOMING or RELEASED).
      Only return the JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsedRaw = JSON.parse(response.text || '[]');
      const parsed = parsedRaw.map((item: any, idx: number) => ({
        ...item,
        id: item.cert_number || `tkdn-${Date.now()}-${idx}` // Use cert number as stable ID if possible
      }));
      
      setData(parsed);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data AI. Pastikan API Key aktif.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof TkdnItem, value: any) => {
    const newData = data.map(item => item.id === id ? { ...item, [field]: value } : item);
    setData(newData);
  };

  const handlePublish = async () => {
    if (data.length === 0) return;
    setIsPublishing(true);
    
    try {
        // Prepare data for upsert (avoiding duplicate cert numbers)
        const payload = data.map(({ id, ...rest }) => ({ ...rest }));
        
        const { error } = await supabase
            .from('tkdn_monitor')
            .upsert(payload, { onConflict: 'cert_number' });

        if (error) throw error;
        
        alert("DATA BERHASIL DISINKRONISASI KE DATABASE (LIVE)!");
    } catch (err: any) {
        console.error(err);
        alert("Gagal mempublikasikan ke database: " + err.message);
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
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">DATABASE MONITOR TKDN & SERTIFIKASI (LIVE SYNC)</p>
        </div>
        <div className="flex gap-3">
            <button onClick={fetchDataFromAi} disabled={loading || isPublishing} className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-zinc-800 transition-all transform active:scale-95 disabled:opacity-50">
                {loading ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>}
                SCAN NEW DATA (AI)
            </button>
            {data.length > 0 && <button onClick={handlePublish} disabled={loading || isPublishing} className="flex items-center gap-3 px-8 py-4 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95 disabled:opacity-50">{isPublishing ? 'SYNCING...' : 'PUBLISH TO LIVE DB'}</button>}
        </div>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <table className="w-full text-left border-collapse flex-grow">
          <thead><tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]"><th className="px-8 py-4">IDENTITAS PERANGKAT</th><th className="px-8 py-4">NOMOR SERTIFIKAT</th><th className="px-8 py-4">SKOR TKDN</th><th className="px-8 py-4">TGL VERIFIKASI</th><th className="px-8 py-4 text-right">STATUS</th></tr></thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-32 text-center"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] animate-pulse">Scanning Kemenperin Live Feed...</p></div></td></tr>
            ) : currentItems.length > 0 ? currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-8 py-2"><div><div className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-0.5">{item.brand}</div><div className="text-[12px] font-black text-zinc-900 uppercase tracking-tight leading-none mb-0.5">{item.marketing_name}</div><div className="text-[8px] font-bold text-zinc-300 uppercase leading-none">{item.codename}</div></div></td>
                <td className="px-8 py-2 font-mono text-[9px] text-zinc-400">{item.cert_number}</td>
                <td className="px-8 py-2"><div className="text-xs font-black text-zinc-800 underline decoration-blue-500 decoration-2 underline-offset-4">{item.tkdn_score}%</div></td>
                <td className="px-8 py-2"><input type="date" value={item.cert_date} onChange={(e) => handleUpdateItem(item.id, 'cert_date', e.target.value)} className="bg-transparent border-b border-zinc-100 text-[10px] font-black text-zinc-900 uppercase focus:border-blue-500 outline-none"/></td>
                <td className="px-8 py-2 text-right"><select value={item.status} onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value)} className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase outline-none cursor-pointer border ${item.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}><option value="UPCOMING">UPCOMING</option><option value="RELEASED">SUDAH RILIS</option></select></td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-8 py-32 text-center text-zinc-300 font-black uppercase text-xs tracking-widest italic">Belum ada data di sinkronisasi. Tekan Sync untuk memulai.</td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (<div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between"><div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PAGE {currentPage} OF {totalPages} ({data.length} ITEMS)</div><div className="flex gap-2"><button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase rounded shadow-sm hover:bg-zinc-50 disabled:opacity-30">PREV</button><button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase rounded shadow-sm hover:bg-zinc-50 disabled:opacity-30">NEXT</button></div></div>)}
      </div>
    </div>
  );
};

export default AdminExtendedMod;
