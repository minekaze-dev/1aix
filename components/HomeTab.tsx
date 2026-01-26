
import React, { useState, useEffect, useMemo } from 'react';
import { TOP_BRANDS } from '../constants';
import type { Session } from '@supabase/supabase-js';
import type { Article, Comment } from '../types';
import { supabase } from '../lib/supabase';

interface HomeTabProps {
    onOpenLogin?: () => void;
    onLogout?: () => void;
    session?: Session | null;
    searchQuery?: string;
    initialArticle?: Article | null;
    onClearTarget?: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onOpenLogin, onLogout, session, searchQuery = "", initialArticle, onClearTarget }) => {
    const [viewArticle, setViewArticle] = useState<Article | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'PUBLISHED')
            .order('publish_date', { ascending: false });
        
        if (!error && data) setArticles(data);
        setLoading(false);
    };

    const fetchComments = async (articleId: string) => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('target_id', articleId)
            .order('created_at', { ascending: false });
        
        if (!error && data) setComments(data);
    };

    // Parser markdown sederhana untuk menampilkan format tebal & miring
    const parseMarkdown = (text: string) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/&lt;div align="(.*?)"&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div style="text-align: $1">$2</div>')
            .replace(/&lt;span style="(.*?)"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span style="$1">$2</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$1</h2>')
            .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500">$1</blockquote>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-4 rounded shadow-lg" />');
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        if (viewArticle) {
            const startTime = Date.now();
            return () => {
                const duration = (Date.now() - startTime) / 1000;
                if (duration > 3) {
                    supabase.from('site_analytics').insert([{
                        event_type: 'reading_time',
                        value: Math.min(duration / 60, 15)
                    }]).then();
                }
            };
        }
    }, [viewArticle]);

    useEffect(() => {
        if (initialArticle) {
            setViewArticle(initialArticle);
            onClearTarget?.();
        }
    }, [initialArticle, onClearTarget]);

    useEffect(() => {
        if (viewArticle) {
            fetchComments(viewArticle.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [viewArticle]);

    const handlePostComment = async () => {
        if (!session) {
            onOpenLogin?.();
            return;
        }
        if (!newComment.trim() || !viewArticle) return;

        const payload = {
            target_id: viewArticle.id,
            user_id: session.user.id,
            user_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            text: newComment
        };

        const { data, error } = await supabase.from('comments').insert([payload]).select();

        if (!error && data) {
            setComments([data[0], ...comments]);
            setNewComment("");
        } else {
            alert("Gagal mengirim komentar. Pastikan Anda sudah login.");
        }
    };

    const handleShare = (platform: string) => {
        const url = window.location.origin + '/#' + viewArticle?.permalink;
        const text = viewArticle?.title || "Cek berita gadget terbaru di 1AIX!";
        if (platform === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
        else if (platform === 'tw') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        else { navigator.clipboard.writeText(url); alert("Link disalin!"); }
    };

    const filteredArticles = useMemo(() => {
        if (!searchQuery) return articles;
        return articles.filter(a => 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.tags?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [articles, searchQuery]);

    const heroArticles = filteredArticles.slice(0, 2);
    const latestArticles = filteredArticles.slice(2, 8);
    const trendingArticles = articles.slice(0, 5);

    return (
        <div className="flex gap-8 animate-in fade-in duration-700">
            <aside className="w-[240px] flex-shrink-0 space-y-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">TOP BRAND AWARD</h3>
                    </div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-l-2 border-zinc-100 pl-2">sumber: www.topbrand-award.com</div>
                    
                    <div className="space-y-1 mb-2">
                        {TOP_BRANDS.map((brand, idx) => (
                            <div key={brand.name} className="px-1 py-1.5 flex items-center justify-between border-b border-zinc-50 group cursor-pointer hover:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-4"><span className="text-[10px] font-black text-zinc-300 w-4">#{idx + 1}</span><span className="text-[11px] font-black text-zinc-700 tracking-wide uppercase group-hover:text-blue-600">{brand.name}</span></div>
                                <div className="flex items-center gap-1.5"><svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg><span className="text-[10px] font-black text-blue-500/60">{brand.share}</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">TRENDING NEWS</h3>
                    </div>
                    <div className="space-y-4">
                        {trendingArticles.map((art, idx) => (
                            <div 
                                key={art.id} 
                                onClick={() => setViewArticle(art)}
                                className="group cursor-pointer border-b border-zinc-50 pb-4 last:border-0"
                            >
                                <div className="flex gap-3">
                                    <span className="text-xl font-black text-zinc-100 group-hover:text-blue-100 transition-colors leading-none">{idx + 1}</span>
                                    <h4 className="text-[11px] font-black text-zinc-700 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 italic">
                                        {art.title}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <div className="flex-grow">
                {viewArticle ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={() => setViewArticle(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors group"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>KEMBALI KE BERANDA</button>
                        <div className="mb-4">
                            <div className="flex gap-1 mb-3">{viewArticle.categories?.map(cat => <span key={cat} className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-0.5 uppercase tracking-[0.4em]">{cat}</span>)}</div>
                            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic">{viewArticle.title}</h1>
                            <div className="flex items-center justify-between border-y border-zinc-100 py-3 mb-8">
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">{(viewArticle.author_name || '1').charAt(0)}</div><div className="flex flex-col"><span className="text-[10px] font-black text-zinc-900 uppercase tracking-wider leading-none">{viewArticle.author_name || 'Redaksi 1AIX'}</span><span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">{viewArticle.publish_date}</span></div></div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleShare('wa')} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                                    <button onClick={() => handleShare('tw')} className="p-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100"><img src={viewArticle.cover_image_url} alt="" className="w-full h-full object-cover"/></div>
                        <div className="prose prose-zinc max-w-none text-zinc-800 leading-loose text-base mb-20">
                            <div className="text-zinc-500 font-bold leading-relaxed italic border-l-3 border-red-600 pl-4 bg-zinc-50 py-4 mb-8">"{viewArticle.summary}"</div>
                            <div className="whitespace-pre-wrap article-view-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(viewArticle.content || '') }} />
                        </div>
                        <div className="border-t border-zinc-200 pt-12 mb-20">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Diskusi & Komentar</h3>
                            <div className="bg-[#f8fafc] border border-zinc-100 p-8 rounded mb-12">
                                {session ? (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0">{(session.user.user_metadata?.full_name || session.user.email || 'U').charAt(0).toUpperCase()}</div>
                                        <div className="flex-1 space-y-4"><textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Berikan pendapatmu tentang artikel ini..." className="w-full bg-white border border-zinc-200 p-4 rounded text-sm font-bold outline-none focus:border-red-600 transition-all resize-none" rows={3}/><button onClick={handlePostComment} className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">KIRIM KOMENTAR</button></div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Anda harus login untuk berkomentar</p><button onClick={onOpenLogin} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">MASUK PANEL</button></div>
                                )}
                            </div>
                            <div className="space-y-8">
                                {comments.map(c => (
                                    <div key={c.id} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded bg-zinc-200 text-zinc-500 flex items-center justify-center font-black flex-shrink-0 uppercase">{c.user_name.charAt(0)}</div>
                                        <div><div className="flex items-center gap-3 mb-1"><span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{c.user_name}</span><span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{new Date(c.created_at).toLocaleString('id-ID')}</span></div><p className="text-[13px] font-bold text-zinc-600 leading-relaxed">{c.text}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {loading ? <div className="text-center py-20 font-black text-zinc-200 animate-pulse uppercase tracking-[0.5em]">Loading News...</div> : (
                            <>
                                {heroArticles.length > 0 && (
                                    <div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                                        {heroArticles.map((art) => (
                                            <div key={art.id} className="relative h-[360px] overflow-hidden group cursor-pointer border-l border-zinc-200" onClick={() => setViewArticle(art)}>
                                                <img src={art.cover_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <div className="flex gap-2 mb-2">
                                                        {(art.categories || []).map(cat => (
                                                            <span key={cat} className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 uppercase tracking-widest rounded-sm">{cat}</span>
                                                        ))}
                                                    </div>
                                                    <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">{art.publish_date}</div>
                                                    <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">{art.title}</h2>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-8">{latestArticles.map(art => (
                                    <div key={art.id} className="flex gap-4 group cursor-pointer" onClick={() => setViewArticle(art)}>
                                        <div className="w-32 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-sm"><img src={art.cover_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" /></div>
                                        <div>
                                            <div className="flex gap-1 mb-1">
                                                {(art.categories || []).map(cat => (
                                                    <span key={cat} className="text-[7px] font-black text-red-600 border border-red-600/30 px-1 py-0.5 uppercase tracking-tighter rounded-sm">{cat}</span>
                                                ))}
                                            </div>
                                            <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{art.title}</h4>
                                            <div className="text-[8px] font-bold text-zinc-400 uppercase mt-2">{art.publish_date}</div>
                                        </div>
                                    </div>
                                ))}</div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style>{`.article-view-body strong { font-weight: 800; color: #000; } .article-view-body em { font-style: italic; } .article-view-body blockquote { margin: 1rem 0; }`}</style>
        </div>
    );
};

export default HomeTab;
