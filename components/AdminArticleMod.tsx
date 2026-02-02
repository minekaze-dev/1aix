
import React, { useState, useEffect, useMemo } from 'react';
import type { Article, Author } from '../types';
import { supabase } from '../lib/supabase';

const WP_SITE = '1aixcms.wordpress.com';

interface AdminArticleModProps {
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
}

type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH';

export default function AdminArticleMod({ onCreateArticle, onEditArticle }: AdminArticleModProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  const fetchArticlesFromWp = async () => {
    setLoading(true);
    try {
      const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts?number=100&status=any`);
      const wpData = await wpRes.json();
      if (wpData && wpData.posts) {
        const mapped = wpData.posts.map((post: any) => ({
          id: post.ID.toString(),
          title: post.title,
          cover_image_url: post.featured_image || 'https://via.placeholder.com/800x400?text=1AIX+News',
          tags: post.tags ? Object.keys(post.tags).map(t => `#${t}`).join(' ') : '',
          permalink: `/news/${post.slug}`,
          publish_date: new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          summary: post.excerpt ? post.excerpt.replace(/<[^>]*>?/gm, '').substring(0, 160) : '',
          content: post.content,
          categories: post.categories ? Object.keys(post.categories).map(c => c.toUpperCase()) : ['NEWS'],
          status: post.status === 'publish' ? 'PUBLISHED' : 'DRAFT',
          created_at: post.date,
          author_name: post.author ? post.author.name : 'REDAKSI 1AIX'
        }));
        setArticles(mapped);
      }
    } catch (err) {
      console.error("WP Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticlesFromWp(); }, []);

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'ALL') return articles;
    return articles.filter(a => a.status === activeFilter);
  }, [articles, activeFilter]);

  const counts = useMemo(() => ({
    ALL: articles.length,
    PUBLISHED: articles.filter(a => a.status === 'PUBLISHED').length,
    DRAFT: articles.filter(a => a.status === 'DRAFT').length,
    TRASH: 0,
  }), [articles]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN ARTIKEL</h1><p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA BERITA VIA WORDPRESS CMS (LIVE SYNC)</p></div>
        <button onClick={onCreateArticle} className="flex items-center gap-3 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 4v16m8-8H4"></path></svg><span>TULIS ARTIKEL BARU</span></button>
      </header>

      <div className="flex border-b border-zinc-200 mb-6 gap-8 overflow-x-auto scrollbar-hide whitespace-nowrap">
        {(['ALL', 'PUBLISHED', 'DRAFT'] as FilterStatus[]).map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeFilter === f ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-900'}`}>{f === 'ALL' ? 'SEMUA' : f} ({counts[f]}){activeFilter === f && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in fade-in duration-300"></div>}</button>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed md:table-auto">
          <thead><tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">JUDUL BERITA</th><th className="px-8 py-5 hidden md:table-cell">KATEGORI</th><th className="px-8 py-5 hidden md:table-cell">PENULIS</th><th className="px-8 py-5 hidden md:table-cell">STATUS</th><th className="px-8 py-5 text-right w-24 md:w-auto">AKSI</th></tr></thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (<tr><td colSpan={5} className="px-8 py-10 text-center animate-pulse">Memuat Artikel WordPress...</td></tr>) : filteredArticles.length > 0 ? filteredArticles.map(article => (
              <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5"><div className="flex items-center gap-4 overflow-hidden"><div className="w-12 h-8 bg-zinc-100 rounded overflow-hidden shadow-sm flex-shrink-0"><img src={article.cover_image_url} alt="" className="w-full h-full object-cover" /></div><div className="text-[11px] font-black text-zinc-900 uppercase truncate">{article.title}</div></div></td>
                <td className="px-8 py-5 hidden md:table-cell"><div className="flex flex-wrap gap-1">{(article.categories || []).map(cat => (<span key={cat} className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-100">{cat}</span>))}</div></td>
                <td className="px-8 py-5 hidden md:table-cell text-[10px] font-black text-zinc-400 uppercase">{article.author_name}</td>
                <td className="px-8 py-5 hidden md:table-cell"><span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${article.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{article.status}</span></td>
                <td className="px-8 py-5 text-right"><button onClick={() => onEditArticle(article)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Edit di WordPress"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button></td>
              </tr>
            )) : (<tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-300 font-black uppercase text-[10px] tracking-widest italic">Tidak ada artikel ditemukan.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
