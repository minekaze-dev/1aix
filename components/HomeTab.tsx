import React, { useState, useEffect, useMemo } from 'react';
import { TOP_BRANDS } from '../constants';
import type { Session } from '@supabase/supabase-js';
import type { Article, Comment, AdConfig, Smartphone } from '../types';
import { supabase } from '../lib/supabase';
import { ChatAlt2Icon } from './icons';

interface HomeTabProps {
    onOpenLogin?: () => void;
    onLogout?: () => void;
    session?: Session | null;
    globalSearchQuery?: string;
    articleFilterQuery?: string;
    onSetArticleFilterQuery?: (query: string) => void;
    initialArticle?: Article | null;
    onClearTarget?: () => void;
    articleAd?: AdConfig;
    sidebarAd?: AdConfig;
    smartphones?: Smartphone[];
    onProductSelect?: (phone: Smartphone) => void;
}

interface ExtendedComment extends Comment {
    parent_id?: string;
    replies?: ExtendedComment[];
}

const HomeTab: React.FC<HomeTabProps> = ({ 
    onOpenLogin, 
    onLogout, 
    session, 
    globalSearchQuery = "", 
    articleFilterQuery = "", 
    onSetArticleFilterQuery, 
    initialArticle, 
    onClearTarget,
    articleAd,
    sidebarAd,
    smartphones = [],
    onProductSelect
}) => {
    const [viewArticle, setViewArticle] = useState<Article | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [comments, setComments] = useState<ExtendedComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyText, setReplyText] = useState("");
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleArticlesAfterHero, setVisibleArticlesAfterHero] = useState(10);
    const [articleCommentCounts, setArticleCommentCounts] = useState<Record<string, number>>({});

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

    const fetchCommentCounts = async () => {
        const { data, error } = await supabase.from('comments').select('target_id');
        if (!error && data) {
            const counts: Record<string, number> = {};
            data.forEach(comment => {
                if (comment.target_id) counts[comment.target_id] = (counts[comment.target_id] || 0) + 1;
            });
            setArticleCommentCounts(counts);
        }
    };

    const fetchComments = async (articleId: string) => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('target_id', articleId)
            .order('created_at', { ascending: true });
        
        if (!error && data) setComments(data);
    };

    const parseMarkdown = (text: string) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/&lt;div align="(.*?)"&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div style="text-align: $1">$2</div>')
            .replace(/&lt;span style="(.*?)"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span style="$1">$2</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$2</h2>')
            .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500 my-4">$1</blockquote>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-6 rounded shadow-lg" />');
    };

    useEffect(() => { fetchArticles(); fetchCommentCounts(); }, []);

    useEffect(() => {
        if (viewArticle) {
            const slug = viewArticle.permalink.replace(/^\//, '');
            window.location.hash = `#${slug}`;
            fetchComments(viewArticle.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [viewArticle]);

    useEffect(() => {
        if (initialArticle) {
            setViewArticle(initialArticle);
            onClearTarget?.();
        }
    }, [initialArticle]);

    const handlePostComment = async (parentId: string | null = null) => {
        if (!session) { onOpenLogin?.(); return; }
        const textToPost = parentId ? replyText : newComment;
        if (!textToPost.trim() || !viewArticle) return;

        const payload: any = {
            target_id: viewArticle.id,
            user_id: session.user.id,
            user_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            text: textToPost,
            parent_id: parentId
        };

        const { data, error } = await supabase.from('comments').insert([payload]).select();

        if (!error && data) {
            setComments([...comments, data[0]]);
            if (parentId) {
                setReplyText("");
                setActiveReplyId(null);
            } else {
                setNewComment("");
            }
            fetchCommentCounts();
        } else {
            alert("Gagal mengirim komentar.");
        }
    };

    const handleReplyClick = (commentId: string) => {
        if (!session) { onOpenLogin?.(); return; }
        setActiveReplyId(activeReplyId === commentId ? null : commentId);
        setReplyText("");
    };

    const filteredArticles = useMemo(() => {
        const queryToUse = articleFilterQuery || globalSearchQuery;
        if (!queryToUse) return articles;
        return articles.filter(a => 
            a.title.toLowerCase().includes(queryToUse.toLowerCase()) || 
            a.summary.toLowerCase().includes(queryToUse.toLowerCase()) ||
            a.tags?.toLowerCase().includes(queryToUse.toLowerCase())
        );
    }, [articles, articleFilterQuery, globalSearchQuery]);

    const heroArticles = filteredArticles.slice(0, 2);
    const articlesAfterHero = filteredArticles.slice(2);

    const trendingArticles = useMemo(() => {
        return [...articles].sort((a, b) => {
            const countA = articleCommentCounts[a.id] || 0;
            const countB = articleCommentCounts[b.id] || 0;
            if (countB !== countA) return countB - countA;
            return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
        }).slice(0, 3);
    }, [articles, articleCommentCounts]);

    const commentHierarchy = useMemo(() => {
        const parents = comments.filter(c => !c.parent_id);
        const children = comments.filter(c => c.parent_id);
        return parents.map(p => ({
            ...p,
            replies: children.filter(c => c.parent_id === p.id)
        }));
    }, [comments]);

    const handleBackToHome = () => { setViewArticle(null); window.location.hash = '#/home'; onSetArticleFilterQuery?.(""); };

    const HeroItem = ({ art, isLarge }: { art: Article, isLarge: boolean }) => {
        const commentCount = articleCommentCounts[art.id] || 0;
        return (
            <div className="relative overflow-hidden group cursor-pointer h-full" onClick={() => setViewArticle(art)}>
                <img src={art.cover_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        <span>{art.publish_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-black drop-shadow-md">
                        <ChatAlt2Icon className="w-4 h-4" strokeWidth={2.5} />
                        <span>{commentCount}</span>
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex gap-2 mb-2">
                        {(art.categories || []).slice(0, 2).map(cat => (
                            <span key={cat} className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 uppercase tracking-widest rounded-sm">{cat}</span>
                        ))}
                    </div>
                    <h2 className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'} font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors drop-shadow-lg`}>
                        {art.title}
                    </h2>
                </div>
            </div>
        );
    };

    return (
        <div className="flex lg:gap-8 gap-0 animate-in fade-in duration-700">
            <aside className="hidden lg:block w-[240px] flex-shrink-0 space-y-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">TOP BRAND AWARD</h3>
                    </div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-l-2 border-zinc-100 pl-2">sumber: www.topbrand-award.com</div>
                    <div className="space-y-1">
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
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">TRENDING ARTIKEL</h3>
                    </div>
                    <div className="space-y-2">
                        {trendingArticles.map((art, idx) => (
                            <div key={art.id} onClick={() => setViewArticle(art)} className="group cursor-pointer border-b border-zinc-50 pb-2 last:border-0">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[14px] font-black text-zinc-200 group-hover:text-blue-400 transition-colors leading-none w-4 flex-shrink-0">{idx + 1}</span>
                                    <div className="w-14 h-10 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-50">
                                        <img src={art.cover_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-zinc-800 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 italic">{art.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                         <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">PERANGKAT BARU</h3>
                    </div>
                    <div className="space-y-3">
                        {smartphones.slice(0, 4).map(phone => (
                            <div key={phone.id} onClick={() => onProductSelect?.(phone)} className="flex items-center gap-4 group cursor-pointer border-b border-zinc-50 pb-2 last:border-0">
                                <div className="w-16 h-16 bg-white border border-zinc-100 p-2 flex items-center justify-center rounded-sm flex-shrink-0 group-hover:border-red-600 transition-colors shadow-sm">
                                    <img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">{phone.brand}</span>
                                    <h4 className="text-[11px] font-black text-zinc-800 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{phone.model_name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full">
                    {sidebarAd?.image_url ? (
                      <a href={sidebarAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                         <img src={sidebarAd.image_url} alt="Promo" className="w-full h-auto rounded shadow-md border border-zinc-100" />
                      </a>
                    ) : (
                        <div className="aspect-[240/250] bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shadow-inner rounded-sm">
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span>
                            <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span>
                        </div>
                    )}
                </div>
            </aside>

            <div className="flex-grow w-full">
                {viewArticle ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={handleBackToHome} className="mb-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors group"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>KEMBALI KE BERANDA</button>
                        <div className="mb-4">
                            <div className="flex gap-1 mb-3">{viewArticle.categories?.map(cat => <span key={cat} className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-0.5 uppercase tracking-[0.4em]">{cat}</span>)}</div>
                            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic">{viewArticle.title}</h1>
                        </div>
                        <div className="w-full h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100"><img src={viewArticle.cover_image_url} alt="" className="w-full h-full object-cover"/></div>
                        <div className="prose prose-zinc max-w-none text-zinc-800 leading-loose text-base mb-20">
                            <div className="text-zinc-500 font-bold leading-relaxed italic border-l-3 border-red-600 pl-4 bg-zinc-50 py-4 mb-8">"{viewArticle.summary}"</div>
                            <div className="whitespace-pre-wrap article-view-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(viewArticle.content || '') }} />
                        </div>

                        <div className="w-full my-10">
                          {articleAd?.image_url ? (
                            <a href={articleAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                               <img src={articleAd.image_url} alt="Promo" className="w-full h-auto rounded shadow-lg border border-zinc-100" />
                            </a>
                          ) : (
                            <div className="h-[120px] bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shadow-inner rounded-sm">
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span>
                              <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-zinc-200 pt-12 mb-20">
                            <h3 id="comment-section" className="text-xl font-black uppercase tracking-tighter mb-8 italic">Diskusi & Komentar</h3>
                            
                            <div className="bg-[#f8fafc] border border-zinc-100 p-8 rounded mb-12">
                                {session ? (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0 uppercase">{(session.user.user_metadata?.full_name || session.user.email || 'U').charAt(0)}</div>
                                        <div className="flex-1 space-y-4">
                                            <textarea id="comment-input" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Berikan pendapatmu tentang artikel ini..." className="w-full bg-white border border-zinc-200 p-4 rounded text-sm font-bold outline-none focus:border-red-600 transition-all resize-none" rows={3}/>
                                            <button onClick={() => handlePostComment(null)} className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">KIRIM KOMENTAR</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Anda harus login untuk berkomentar</p><button onClick={onOpenLogin} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">MASUK</button></div>
                                )}
                            </div>

                            <div className="space-y-10">
                                {commentHierarchy.map(c => (
                                    <div key={c.id} className="space-y-6">
                                        <div className="flex gap-4 group">
                                            <div className="w-10 h-10 rounded bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0 uppercase">{c.user_name.charAt(0)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{c.user_name}</span>
                                                    <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{new Date(c.created_at).toLocaleString('id-ID')}</span>
                                                </div>
                                                <p className="text-[13px] font-bold text-zinc-600 leading-relaxed mb-2">{c.text}</p>
                                                <button onClick={() => handleReplyClick(c.id)} className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors">Balas</button>
                                                
                                                {activeReplyId === c.id && (
                                                    <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-sm animate-in slide-in-from-top-1 duration-200">
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0 text-[10px] uppercase">{(session?.user.user_metadata?.full_name || 'U').charAt(0)}</div>
                                                            <div className="flex-1">
                                                                <textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Balas ${c.user_name}...`} className="w-full bg-white border border-zinc-200 p-2 rounded text-[12px] font-bold outline-none focus:border-red-600 transition-all resize-none" rows={2}/>
                                                                <div className="flex gap-2 mt-2">
                                                                    <button onClick={() => handlePostComment(c.id)} className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Kirim</button>
                                                                    <button onClick={() => setActiveReplyId(null)} className="px-4 py-1.5 bg-zinc-200 text-zinc-500 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-300 transition-all">Batal</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {c.replies && c.replies.length > 0 && (
                                            <div className="ml-14 space-y-6 border-l-2 border-zinc-100 pl-6">
                                                {c.replies.map(reply => (
                                                    <div key={reply.id} className="flex gap-4 group">
                                                        <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0 text-[10px] uppercase">{reply.user_name.charAt(0)}</div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tight">{reply.user_name}</span>
                                                                <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{new Date(reply.created_at).toLocaleString('id-ID')}</span>
                                                            </div>
                                                            <p className="text-[12px] font-bold text-zinc-600 leading-relaxed">{reply.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {!loading && heroArticles.length >= 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                                <HeroItem art={heroArticles[0]} isLarge={true} />
                                <HeroItem art={heroArticles[1]} isLarge={true} />
                            </div>
                        )}
                        {articlesAfterHero.length > 0 && (
                            <div className="pt-4">
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter mb-4 italic">Rekomendasi Lainnya</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {articlesAfterHero.slice(0, visibleArticlesAfterHero).map(art => (
                                        <div key={art.id} className="flex gap-4 group cursor-pointer border-b border-zinc-100 py-3 last:border-0" onClick={() => setViewArticle(art)}>
                                            <div className="w-40 h-24 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-sm">
                                                <img src={art.cover_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="flex gap-1 mb-1">
                                                    {(art.categories || []).map(cat => <span key={cat} className="text-[8px] font-black text-red-600 border border-red-600/30 px-1 py-0.5 uppercase tracking-tighter rounded-sm">{cat}</span>)}
                                                </div>
                                                <h4 className="text-base font-black text-zinc-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{art.title}</h4>
                                                
                                                <p className="text-[11px] font-bold text-zinc-500 line-clamp-1 italic mt-1 leading-tight">"{art.summary}"</p>

                                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase mt-2">
                                                    <span>{art.publish_date}</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <ChatAlt2Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
                                                    <span>{articleCommentCounts[art.id] || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {articlesAfterHero.length > visibleArticlesAfterHero && (
                                    <div className="mt-8 text-center"><button onClick={() => setVisibleArticlesAfterHero(prev => prev + 10)} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-sm shadow-md">Tampilkan Lainnya</button></div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`.article-view-body strong { font-weight: 800; color: #000; } .article-view-body em { font-style: italic; } .article-view-body blockquote { margin: 1rem 0; } .article-view-body a { color: #3b82f6; text-decoration: underline; }`}</style>
        </div>
    );
};

export default HomeTab;