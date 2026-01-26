
import React, { useState, useEffect } from 'react';
import type { Article } from '../types';

interface AdminArticleModProps {
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
}

const AdminArticleMod: React.FC<AdminArticleModProps> = ({ onCreateArticle, onEditArticle }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localArticles = localStorage.getItem('1AIX_LOCAL_ARTICLES');
    if (localArticles) {
      setArticles(JSON.parse(localArticles));
    }
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm('Hapus artikel ini?')) return;
    const newArticles = articles.filter(a => a.id !== id);
    localStorage.setItem('1AIX_LOCAL_ARTICLES', JSON.stringify(newArticles));
    setArticles(newArticles);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN ARTIKEL</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA BERITA, REVIEW & KONTEN REDAKSI</p>
        </div>
        <button 
          onClick={onCreateArticle}
          className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          TULIS ARTIKEL BARU
        </button>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">JUDUL BERITA</th>
              <th className="px-8 py-5">KATEGORI</th>
              <th className="px-8 py-5">STATUS</th>
              <th className="px-8 py-5">TANGGAL</th>
              <th className="px-8 py-5 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-10 text-center animate-pulse">Memuat Artikel...</td></tr>
            ) : articles.length > 0 ? articles.map(article => (
              <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-zinc-100 rounded overflow-hidden">
                      <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] font-black text-zinc-900 uppercase truncate max-w-xs">{article.title}</div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-1">
                    {(article.categories || []).map(cat => (
                        <span key={cat} className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded-sm">{cat}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${article.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-[10px] font-black text-zinc-400">{article.publish_date}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEditArticle(article)} className="p-2 text-zinc-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                    <button onClick={() => handleDelete(article.id)} className="p-2 text-zinc-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-300 font-black uppercase text-[10px] tracking-widest">Belum ada artikel.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminArticleMod;
