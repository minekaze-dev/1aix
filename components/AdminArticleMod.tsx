
import React, { useState, useEffect, useMemo } from 'react';
import type { Article, Author } from '../types'; // Import Author type
import { supabase } from '../lib/supabase';

interface AdminArticleModProps {
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
}

type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH';

export default function AdminArticleMod({ onCreateArticle, onEditArticle }: AdminArticleModProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]); // New: State for authors
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<{index: number, name: string} | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setArticles(data);
    setLoading(false);
  };

  // New: Fetch authors
  const fetchAuthors = async () => {
    const { data, error } = await supabase.from('authors').select('*');
    if (error) {
      console.error("Error fetching authors:", error);
    } else {
      setAuthors(data || []);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchAuthors(); // Call fetchAuthors here
    const localCats = localStorage.getItem('1AIX_LOCAL_CATEGORIES');
    if (localCats) {
      setCategories(JSON.parse(localCats));
    } else {
      const initialCats = ["REVIEW", "NEWS", "LEAK", "GAMING", "UPDATE", "UNBOXING", "EVENT"];
      setCategories(initialCats);
      localStorage.setItem('1AIX_LOCAL_CATEGORIES', JSON.stringify(initialCats));
    }
  }, []);

  // New: Function to update a single article field
  const handleUpdateArticleField = async (articleId: string, field: keyof Article, value: any) => {
    try {
      const updatePayload: Partial<Article> = { [field]: value };
      
      // Special handling for author_id to also update author_name
      if (field === 'author_id') {
        const selectedAuthor = authors.find(auth => auth.id === value);
        updatePayload.author_name = selectedAuthor ? selectedAuthor.name : 'Redaksi 1AIX';
        updatePayload.author_id = value === '' ? null : value; // Ensure null if "Redaksi 1AIX" is selected
      }

      const { error } = await supabase
        .from('articles')
        .update(updatePayload)
        .eq('id', articleId);

      if (error) throw error;
      
      // Update local state to reflect change immediately
      setArticles(prevArticles => 
        prevArticles.map(art => 
          art.id === articleId ? { ...art, ...updatePayload } : art
        )
      );
      // alert("Artikel berhasil diperbarui."); // Removed for smoother inline editing experience
    } catch (err: any) {
      console.error("Gagal memperbarui artikel:", err);
      alert("Gagal memperbarui artikel: " + err.message);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!window.confirm('Pindahkan artikel ini ke Sampah?')) return;
    const { error } = await supabase.from('articles').update({ status: 'TRASH' }).eq('id', id);
    if (!error) fetchArticles();
    else alert("Gagal memindahkan ke sampah.");
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('Hapus artikel ini secara PERMANEN dari database?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (!error) fetchArticles();
    else alert("Gagal menghapus permanen.");
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from('articles').update({ status: 'DRAFT' }).eq('id', id);
    if (!error) {
        alert("Artikel dipulihkan sebagai Draft.");
        fetchArticles();
    } else {
        alert("Gagal memulihkan artikel.");
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cleanName = newCatName.trim().toUpperCase();
    if (categories.includes(cleanName)) { alert("Kategori sudah ada!"); return; }
    const updated = [...categories, cleanName];
    setCategories(updated);
    localStorage.setItem('1AIX_LOCAL_CATEGORIES', JSON.stringify(updated));
    setNewCatName("");
  };

  const handleUpdateCategory = () => {
    if (!editingCat || !editingCat.name.trim()) return;
    const updated = [...categories];
    updated[editingCat.index] = editingCat.name.trim().toUpperCase();
    setCategories(updated);
    localStorage.setItem('1AIX_LOCAL_CATEGORIES', JSON.stringify(updated));
    setEditingCat(null);
  };

  const handleDeleteCategory = (index: number) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
    localStorage.setItem('1AIX_LOCAL_CATEGORIES', JSON.stringify(updated));
  };

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'ALL') return articles;
    return articles.filter(a => a.status === activeFilter);
  }, [articles, activeFilter]);

  const counts = useMemo(() => ({
    ALL: articles.length,
    PUBLISHED: articles.filter(a => a.status === 'PUBLISHED').length,
    DRAFT: articles.filter(a => a.status === 'DRAFT').length,
    TRASH: articles.filter(a => a.status === 'TRASH').length,
  }), [articles]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN ARTIKEL</h1><p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA BERITA, REVIEW & KONTEN REDAKSI (DB LIVE)</p></div>
        <div className="flex gap-3">
            <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-zinc-800 transition-all transform active:scale-95 border border-zinc-700"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path></svg>KATEGORI</button>
            <button onClick={onCreateArticle} className="flex items-center gap-3 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>TULIS ARTIKEL BARU</button>
        </div>
      </header>

      {/* Tabs Filter */}
      <div className="flex border-b border-zinc-200 mb-6 gap-8">
        {(['ALL', 'PUBLISHED', 'DRAFT', 'TRASH'] as FilterStatus[]).map(f => (
            <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeFilter === f ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
                {f === 'ALL' ? 'SEMUA' : f} ({counts[f]})
                {activeFilter === f && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in fade-in duration-300"></div>}
            </button>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            <th className="px-8 py-5">JUDUL BERITA</th>
            <th className="px-8 py-5">KATEGORI</th>
            <th className="px-8 py-5">PENULIS</th> {/* New column header */}
            <th className="px-8 py-5">STATUS</th>
            <th className="px-8 py-5">TANGGAL</th>
            <th className="px-8 py-5 text-right">AKSI</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (<tr><td colSpan={6} className="px-8 py-10 text-center animate-pulse">Memuat Artikel Database...</td></tr>) : filteredArticles.length > 0 ? filteredArticles.map(article => (
              <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-zinc-100 rounded overflow-hidden shadow-sm">
                            <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-[11px] font-black text-zinc-900 uppercase truncate max-w-xs">{article.title}</div>
                    </div>
                </td>
                <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                        {(article.categories || []).map(cat => (
                            <span key={cat} className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-100">{cat}</span>
                        ))}
                    </div>
                </td>
                <td className="px-8 py-5"> {/* New: Author select dropdown */}
                    <select
                        value={article.author_id || ''} // Bind to author_id, or empty string for default
                        onChange={(e) => handleUpdateArticleField(article.id, 'author_id', e.target.value)}
                        className="bg-zinc-50 border border-zinc-100 p-2 rounded text-[10px] font-black uppercase outline-none focus:border-blue-500"
                        title="Pilih Penulis"
                    >
                        <option value="">REDAKSI 1AIX</option> {/* Option for default 'Redaksi 1AIX' */}
                        {authors.map(author => (
                            <option key={author.id} value={author.id}>{author.name.toUpperCase()}</option>
                        ))}
                    </select>
                </td>
                <td className="px-8 py-5">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${article.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600' : article.status === 'DRAFT' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                        {article.status}
                    </span>
                </td>
                <td className="px-8 py-5 text-[10px] font-black text-zinc-400">{article.publish_date}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    {article.status === 'TRASH' ? (
                        <>
                            <button onClick={() => handleRestore(article.id)} className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors" title="Restore Artikel"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button>
                            <button onClick={() => handlePermanentDelete(article.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Hapus Permanen"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onEditArticle(article)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                            <button onClick={() => handleSoftDelete(article.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Pindahkan ke Sampah"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (<tr><td colSpan={6} className="px-8 py-20 text-center text-zinc-300 font-black uppercase text-[10px] tracking-widest italic">Tidak ada artikel di filter ini.</td></tr>)}
          </tbody>
        </table>
      </div>
      {showCategoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-zinc-900 px-8 py-6 flex justify-between items-center"><h3 className="text-white text-[12px] font-black uppercase tracking-widest">KATEGORI ARTIKEL</h3><button onClick={() => setShowCategoryModal(false)} className="text-zinc-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button></div><div className="p-8"><div className="flex gap-2 mb-8"><input type="text" placeholder="NAMA KATEGORI BARU..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded text-[11px] font-black uppercase outline-none focus:border-red-500 transition-colors"/><button onClick={handleAddCategory} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-500/20 active:scale-95">TAMBAH</button></div><div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">{categories.map((cat, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded group hover:border-zinc-300 transition-colors">{editingCat?.index === idx ? (<div className="flex-1 flex gap-2"><input type="text" value={editingCat.name} onChange={(e) => setEditingCat({...editingCat, name: e.target.value})} className="flex-1 px-2 py-1 bg-white border border-blue-500 rounded text-[11px] font-black uppercase outline-none" autoFocus/><button onClick={handleUpdateCategory} className="text-blue-600 font-black text-[10px] uppercase">SAVE</button><button onClick={() => setEditingCat(null)} className="text-zinc-400 font-black text-[10px] uppercase">ESC</button></div>) : (<><span className="text-[11px] font-black uppercase text-zinc-700">{cat}</span><div className="flex gap-4"><button onClick={() => setEditingCat({index: idx, name: cat})} className="text-blue-500 hover:text-blue-700 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button><button onClick={() => handleDeleteCategory(idx)} className="text-zinc-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button></div></>)}</div>))}</div></div></div></div>
      )}
    </div>
  );
}
