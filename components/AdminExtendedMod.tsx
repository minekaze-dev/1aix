import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BRANDS } from '../constants';
import { supabase } from '../lib/supabase';
import type { Brand } from '../types';

interface TkdnItem {
  id: string; // This `id` is mapped to `cert_number` in fetchDataFromAi
  brand: string;
  codename: string;
  marketing_name: string;
  tkdn_score: number;
  cert_number: string;
  cert_date: string;
  status: 'UPCOMING' | 'RELEASED';
  source?: 'AI' | 'MANUAL' | 'PUBLISHED_DB'; // New optional property to differentiate data origin
  created_at?: string;
  is_visible?: boolean; // New: Added for public visibility control
}

interface AdminExtendedModProps {
  onDataChange?: () => void; // Added onDataChange prop
}

// Helper function to format release date into quarter or actual date
const formatReleasePeriod = (dateString: string, status: 'UPCOMING' | 'RELEASED'): string => {
  if (!dateString) return 'N/A';
  
  if (status === 'RELEASED') {
    return dateString; // Display exact date if released
  }

  // For 'UPCOMING', parse date to quarter
  try {
    const [year, month] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month)) return dateString; // Fallback if date is invalid

    let quarter;
    if (month >= 1 && month <= 3) quarter = 'Q1';
    else if (month >= 4 && month <= 6) quarter = 'Q2';
    else if (month >= 7 && month <= 9) quarter = 'Q3';
    else quarter = 'Q4';

    return `${quarter} ${year}`;
  } catch (e) {
    console.warn("Failed to parse date for quarter prediction:", dateString, e);
    return dateString; // Fallback to original string on error
  }
};


const AdminExtendedMod: React.FC<AdminExtendedModProps> = ({ onDataChange }) => {
  const [data, setData] = useState<TkdnItem[]>([]); // All working items
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const itemsPerPage = 10;

  const [showManualEntryForm, setShowManualEntryForm] = useState(false);
  const [newManualEntry, setNewManualEntry] = useState<Partial<TkdnItem>>({
    brand: 'Samsung',
    codename: '',
    marketing_name: '',
    tkdn_score: 0,
    cert_number: '',
    cert_date: new Date().toISOString().split('T')[0],
    status: 'UPCOMING',
    is_visible: false, // Default to not visible
  });
  const [manualEntryError, setManualEntryError] = useState('');

  const [currentFilterSource, setCurrentFilterSource] = useState<'ALL' | 'AI' | 'MANUAL' | 'PUBLISHED_DB'>('ALL');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // New state for selected items

  const fetchExistingData = async () => {
    setLoading(true); // Indicate loading when fetching from DB
    const { data: dbData, error } = await supabase.from('tkdn_monitor').select('*').order('cert_date', { ascending: false });
    if (error) {
        console.error("Error fetching existing TKDN data:", error);
    } else {
        // Mark data from DB as 'PUBLISHED_DB' and set selection based on `is_visible`
        const fetchedItems = dbData.map(item => ({
            ...item,
            id: item.cert_number,
            source: 'PUBLISHED_DB',
            is_visible: item.is_visible ?? true // Default to true if not set
        })) || [];
        setData(fetchedItems);

        // Re-populate selectedItems based on fetched `is_visible` status
        const initialSelected = new Set<string>();
        fetchedItems.forEach(item => {
            if (item.is_visible) {
                initialSelected.add(item.id);
            }
        });
        setSelectedItems(initialSelected);
    }
    setLoading(false);
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
        contents: [{text: prompt}],
        config: { responseMimeType: "application/json" }
      });

      const parsedRaw = JSON.parse(response.text || '[]');
      const newAiItems = parsedRaw.map((item: any) => ({
        ...item,
        id: item.cert_number, // Use cert_number as ID for consistency
        source: 'AI' as 'AI', // Mark as AI-generated
        is_visible: false, // AI-generated items are not visible by default
      }));
      
      setData(prevData => {
        // Filter out existing AI-generated items and merge with new AI items
        const nonAiItems = prevData.filter(item => item.source !== 'AI');
        
        // Merge new AI items, prioritizing updates if cert_number already exists from a previous AI scan
        const mergedAiItemsMap = new Map(newAiItems.map(item => [item.cert_number, item]));
        
        const finalItems: TkdnItem[] = [];
        // Add non-AI items, ensuring no duplicates with new AI items by cert_number
        for (const item of nonAiItems) {
            if (!mergedAiItemsMap.has(item.cert_number)) {
                finalItems.push(item);
            }
        }
        // Add all new AI items
        for (const item of newAiItems) {
            finalItems.push(item);
        }
        
        return finalItems;
      });
      // Do NOT clear selectedItems, because non-AI items might remain selected.
      // New AI items are not selected by default (is_visible: false).
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof TkdnItem, value: any) => {
    setData(prevData =>
      prevData.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddManualEntry = () => {
    setManualEntryError('');
    if (!newManualEntry.brand || !newManualEntry.marketing_name || !newManualEntry.cert_number || !newManualEntry.cert_date) {
      setManualEntryError('Semua kolom wajib diisi kecuali Codename');
      return;
    }

    // Check for duplicate cert_number in current data
    if (data.some(item => item.cert_number === newManualEntry.cert_number)) {
      setManualEntryError('Nomor Sertifikat sudah ada dalam daftar. Harap gunakan yang unik.');
      return;
    }

    const newItem: TkdnItem = {
      ...newManualEntry,
      id: newManualEntry.cert_number!, // Use cert_number as ID for consistency
      tkdn_score: newManualEntry.tkdn_score ?? 0,
      source: 'MANUAL', // Mark as manually added
      is_visible: false, // Manual items are not visible by default
    } as TkdnItem;

    setData(prevData => [...prevData, newItem]);
    setNewManualEntry({
      brand: 'Samsung', codename: '', marketing_name: '', tkdn_score: 0,
      cert_number: '', cert_date: new Date().toISOString().split('T')[0], status: 'UPCOMING',
      is_visible: false,
    });
    setShowManualEntryForm(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Hapus baris ini secara permanen dari database TKDN Monitor? Tindakan ini tidak bisa dibatalkan.")) return;
    
    try {
        const itemToDelete = data.find(item => item.id === id);
        if (!itemToDelete) {
            alert("Item tidak ditemukan.");
            return;
        }

        // Only attempt to delete from DB if it's a published item
        // If an item is `PUBLISHED_DB`, it means it exists in the Supabase `tkdn_monitor` table.
        // We delete it there. If it's `AI` or `MANUAL`, it only exists in client-side `data` state.
        const { error } = await supabase
            .from('tkdn_monitor')
            .delete()
            .eq('cert_number', id); // 'id' from the TkdnItem state is actually the cert_number

        if (error) throw error;
        alert("Data berhasil dihapus dari database.");
        onDataChange?.(); // Notify parent to refresh all data, including ComingSoonTab's TKDN data
        
        // Update local state regardless
        setData(data.filter(item => item.id !== id));
        setSelectedItems(prev => { // Also remove from selection
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });

    } catch (err: any) {
        console.error("Gagal menghapus item TKDN:", err);
        alert("Gagal menghapus data dari database: " + err.message);
    }
  };

  const handlePublish = async () => {
    // If there's no data in the admin panel, nothing to process for visibility.
    if (data.length === 0 && selectedItems.size === 0) {
      alert("Tidak ada data di tabel admin untuk diproses.");
      return;
    }
    setIsPublishing(true);
    
    try {
        // Construct the full payload for UPSERT.
        // For each item in `data` (all items currently visible in the admin table),
        // determine its `is_visible` status based on `selectedItems`.
        const payload = data.map(item => {
            const { id, source, ...rest } = item; // Remove client-side only fields
            return {
                ...rest,
                is_visible: selectedItems.has(id), // Set is_visible based on selection
            };
        });
        
        // UPSERT all items. This will insert new items, update existing ones,
        // and crucially, set `is_visible` for all.
        const { error } = await supabase
            .from('tkdn_monitor')
            .upsert(payload, { onConflict: 'cert_number' }); // Use cert_number as unique key for upsert

        if (error) throw error;
        alert("DATA PILIHAN BERHASIL DISINKRONISASI KE LIVE DB!");
        // Clear selection and re-fetch data to reflect updated `is_visible` status from DB
        setSelectedItems(new Set()); 
        fetchExistingData(); 
        onDataChange?.(); // Notify parent to refresh all data, including ComingSoonTab
    } catch (err: any) {
        console.error(err);
        alert("Gagal sinkronisasi: " + err.message);
    } finally {
        setIsPublishing(false);
    }
  };

  const filteredData = useMemo(() => {
    if (currentFilterSource === 'ALL') return data;
    return data.filter(item => item.source === currentFilterSource);
  }, [data, currentFilterSource]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const sourceFilterButtons = [
    { label: 'SEMUA', value: 'ALL' },
    { label: 'AI-GENERATED', value: 'AI' },
    { label: 'MANUAL INPUT', value: 'MANUAL' },
    { label: 'PUBLISHED', value: 'PUBLISHED_DB' },
  ];

  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const areAllCurrentItemsSelected = useMemo(() => {
    return currentItems.length > 0 && currentItems.every(item => selectedItems.has(item.id));
  }, [currentItems, selectedItems]);

  const handleSelectAllToggle = () => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (areAllCurrentItemsSelected) {
        currentItems.forEach(item => newSet.delete(item.id));
      } else {
        currentItems.forEach(item => newSet.add(item.id));
      }
      return newSet;
    });
  };

  const publishButtonText = useMemo(() => {
    if (isPublishing) return '...';
    return `PUBLISH (${selectedItems.size})`;
  }, [isPublishing, selectedItems.size]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1 flex items-center gap-3">
            1AIX EXTENDED
            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-widest leading-none">AI POWERED</span>
          </h1>
          <p className="hidden lg:block text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">DATABASE MONITOR TKDN & SERTIFIKASI</p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 lg:gap-3">
            <button onClick={fetchDataFromAi} disabled={loading || isPublishing} className="col-span-2 md:col-span-1 flex items-center justify-center gap-3 px-4 lg:px-6 py-3.5 lg:py-4 bg-zinc-900 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>}
                <span className="truncate">SCAN (AI)</span>
            </button>
            <button 
                onClick={() => setShowManualEntryForm(!showManualEntryForm)} 
                className="flex items-center justify-center gap-2 px-4 lg:px-6 py-3.5 lg:py-4 bg-blue-600 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
                <span className="truncate">TAMBAH</span>
            </button>
            <button onClick={handlePublish} disabled={isPublishing || loading} className="flex items-center justify-center gap-2 px-4 lg:px-8 py-3.5 lg:py-4 bg-[#ef4444] text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">
                <span className="truncate uppercase">{publishButtonText}</span>
            </button>
        </div>
      </header>

      {showManualEntryForm && (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8 mb-8 animate-in slide-in-from-top-5 duration-300">
          <h3 className="text-xl font-black text-zinc-800 uppercase tracking-tighter mb-6">INPUT MANUAL TKDN</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">BRAND</span>
              <select
                value={newManualEntry.brand}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, brand: e.target.value as Brand })}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              >
                {BRANDS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NAMA PEMASARAN</span>
              <input
                type="text"
                value={newManualEntry.marketing_name}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, marketing_name: e.target.value })}
                placeholder="Galaxy S26 Ultra"
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">CODENAME (Opsional)</span>
              <input
                type="text"
                value={newManualEntry.codename}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, codename: e.target.value })}
                placeholder="SM-S958"
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NOMOR SERTIFIKAT</span>
              <input
                type="text"
                value={newManualEntry.cert_number}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, cert_number: e.target.value })}
                placeholder="01234/SP/V/2026"
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">SKOR TKDN (%)</span>
              <input
                type="number"
                value={newManualEntry.tkdn_score}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, tkdn_score: Number(e.target.value) })}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">TANGGAL VERIFIKASI</span>
              <input
                type="date"
                value={newManualEntry.cert_date}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, cert_date: e.target.value })}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">STATUS</span>
              <select
                value={newManualEntry.status}
                onChange={(e) => setNewManualEntry({ ...newManualEntry, status: e.target.value as 'UPCOMING' | 'RELEASED' })}
                className="w-full bg-[#f8fafc] border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-blue-500"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="RELEASED">RELEASED</option>
              </select>
            </label>
          </div>
          {manualEntryError && <p className="text-red-500 text-sm mt-4">{manualEntryError}</p>}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowManualEntryForm(false)}
              className="px-8 py-3 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase rounded-sm hover:bg-zinc-200 transition-colors"
            >
              BATAL
            </button>
            <button
              type="button"
              onClick={handleAddManualEntry}
              className="px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase rounded-sm shadow-lg shadow-blue-500/20 active:scale-95"
            >
              SIMPAN ENTRI
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-200 pb-4">
        {sourceFilterButtons.map(btn => (
          <button
            key={btn.value}
            onClick={() => setCurrentFilterSource(btn.value as any)}
            className={`px-4 py-2 text-[10px] font-black uppercase rounded-sm transition-all ${
              currentFilterSource === btn.value
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
        {selectedItems.size > 0 && (
          <span className="ml-auto flex items-center gap-2 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 uppercase tracking-widest border border-blue-100 rounded-sm">
            {selectedItems.size} SELECTED
            <button onClick={() => setSelectedItems(new Set())} className="text-blue-400 hover:text-blue-700 ml-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </span>
        )}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <table className="w-full text-left border-collapse flex-grow table-fixed md:table-auto">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <th className="px-4 py-4 w-10 md:w-12 text-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-3 w-3 text-blue-600 rounded"
                  checked={areAllCurrentItemsSelected}
                  onChange={handleSelectAllToggle}
                />
              </th>
              <th className="px-4 py-4">BRAND & MARKETING NAME</th>
              <th className="px-4 py-4 w-20 md:w-auto">CODENAME</th>
              <th className="px-4 py-4 hidden md:table-cell">NO. SERTIFIKAT</th>
              <th className="px-4 py-4 hidden md:table-cell">SKOR TKDN</th>
              <th className="px-4 py-4 w-24 md:w-auto">STATUS</th>
              <th className="px-4 py-4 hidden md:table-cell">PERKIRAAN RILIS</th>
              <th className="px-4 py-4 text-right w-16 md:w-auto">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={8} className="px-8 py-32 text-center text-zinc-300 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Scanning feed...</td></tr>
            ) : currentItems.length > 0 ? currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-4 py-4 w-10 md:w-12 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600 rounded"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleItemSelection(item.id)}
                  />
                </td>
                <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 overflow-hidden">
                        <input 
                            type="text" 
                            value={item.brand} 
                            onChange={(e) => handleUpdateItem(item.id, 'brand', e.target.value.toUpperCase())}
                            className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-widest bg-transparent border-b border-zinc-100 focus:border-red-300 outline-none w-full truncate"
                            title="Edit Brand Manual"
                        />
                        <input 
                            type="text" 
                            value={item.marketing_name} 
                            onChange={(e) => handleUpdateItem(item.id, 'marketing_name', e.target.value)}
                            className="text-[11px] md:text-[12px] font-black text-zinc-900 uppercase tracking-tight bg-transparent border-b border-zinc-100 focus:border-blue-300 outline-none w-full truncate md:whitespace-normal"
                            title="Edit Nama Pemasaran"
                        />
                    </div>
                </td>
                <td className="px-4 py-4 text-[9px] md:text-[10px] font-mono text-zinc-400 truncate">{item.codename}</td>
                <td className="px-4 py-4 text-[10px] font-mono text-zinc-400 hidden md:table-cell">{item.cert_number}</td>
                <td className="px-4 py-4 hidden md:table-cell"><div className="text-xs font-black text-zinc-800 underline decoration-blue-500 decoration-2 underline-offset-4">{item.tkdn_score}%</div></td>
                <td className="px-4 py-4">
                    <select
                        value={item.status}
                        onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value as 'UPCOMING' | 'RELEASED')}
                        className={`text-[8px] font-black px-1.5 md:px-2 py-1 rounded-sm uppercase appearance-none cursor-pointer w-full text-center ${item.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}
                        title="Edit Status Rilis"
                    >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="RELEASED">RELEASED</option>
                    </select>
                </td>
                <td className="px-4 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-tight hidden md:table-cell">
                    {formatReleasePeriod(item.cert_date, item.status)}
                </td>
                <td className="px-4 py-4 text-right">
                    <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 md:p-2 text-zinc-300 hover:text-red-500 transition-colors"
                        title="Hapus data ini"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-8 py-32 text-center text-zinc-200 font-black uppercase text-xs tracking-widest italic">Tidak ada data monitor.</td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (<div className="p-4 md:p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between"><div className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">PAGE {currentPage} OF {totalPages}</div><div className="flex gap-2"><button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 md:px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[9px] md:text-[10px] font-black uppercase rounded disabled:opacity-30">PREV</button><button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 md:px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[9px] md:text-[10px] font-black uppercase rounded disabled:opacity-30">NEXT</button></div></div>)}
      </div>
    </div>
  );
};

export default AdminExtendedMod;