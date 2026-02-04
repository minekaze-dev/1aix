
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TOP_BRANDS } from '../constants';
import type { Session } from '@supabase/supabase-js';
import type { Article, Comment, AdConfig, Smartphone } from '../types';
import { supabase } from '../lib/supabase';
import { ChatAlt2Icon } from './icons';

interface ThreadedComment extends Comment {
    parent_id?: string | null;
    user_id?: string;
}

const CommentItem: React.FC<{ 
    comment: ThreadedComment, 
    isReply?: boolean,
    replyingToId: string | null,
    replyText: string,
    setReplyText: (val: string) => void,
    handlePostComment: (parentId: string | null) => void,
    handleUpdateComment: (commentId: string, newText: string) => void,
    handleOpenReply: (commentId: string) => void,
    setReplyingToId: (val: string | null) => void,
    replyInputRef: React.RefObject<HTMLTextAreaElement | null>,
    replyComments: ThreadedComment[],
    session: Session | null
}> = ({ 
    comment, 
    isReply = false, 
    replyingToId, 
    replyText, 
    setReplyText, 
    handlePostComment, 
    handleUpdateComment,
    handleOpenReply, 
    setReplyingToId, 
    replyInputRef,
    replyComments,
    session
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const isOwner = session?.user?.id === comment.user_id;

    const onEditSave = () => {
        if (!editText.trim()) return;
        handleUpdateComment(comment.id, editText);
        setIsEditing(false);
    };

    // Masking Admin Name
    const isAdmin = comment.user_name === 'Mimin 1AIX' || comment.user_name === 'RIFKI' || comment.user_name === 'ADMIN';
    const displayUserName = isAdmin ? 'Mimin 1AIX' : comment.user_name;

    return (
        <div id={`comment-${comment.id}`} className={`flex gap-4 group transition-all scroll-mt-24 ${isReply ? 'ml-14 mt-4 border-l-2 border-zinc-100 pl-6' : 'mt-10'}`}>
            <div className={`w-11 h-11 rounded-sm ${isAdmin ? 'bg-zinc-900' : 'bg-red-600'} text-white flex items-center justify-center font-black flex-shrink-0 uppercase text-lg shadow-md border ${isAdmin ? 'border-zinc-800' : 'border-red-500/20'}`}>
                {displayUserName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-black uppercase tracking-tight ${isAdmin ? 'text-red-600' : 'text-zinc-900'}`}>{displayUserName}</span>
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded-sm">
                            {new Date(comment.created_at).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isOwner && !isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-[9px] font-black text-zinc-400 uppercase hover:text-blue-600 transition-colors tracking-widest flex items-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                EDIT
                            </button>
                        )}
                        {!isReply && !isEditing && (
                            <button 
                                onClick={() => handleOpenReply(comment.id)}
                                className="text-[9px] font-black text-zinc-400 uppercase hover:text-red-600 transition-colors tracking-widest flex items-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5"></path></svg>
                                REPLY
                            </button>
                        )}
                    </div>
                </div>
                <div className={`bg-white border ${isAdmin ? 'border-red-100 shadow-[0_0_10px_rgba(239,68,68,0.05)]' : 'border-zinc-100'} p-4 rounded-sm shadow-sm hover:border-zinc-200 transition-colors`}>
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded-sm text-[13px] font-bold outline-none focus:border-red-600 resize-none" rows={2}/>
                            <div className="flex gap-2">
                                <button onClick={onEditSave} className="px-4 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">SIMPAN</button>
                                <button onClick={() => { setIsEditing(false); setEditText(comment.text); }} className="px-4 py-1.5 bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-widest rounded-sm">BATAL</button>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-[13px] font-bold ${isAdmin ? 'text-zinc-800' : 'text-zinc-700'} leading-relaxed italic`}>
                            {comment.text}
                        </p>
                    )}
                </div>
                {replyingToId === comment.id && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-zinc-50 p-4 rounded-sm border border-zinc-100 shadow-inner">
                            <textarea ref={replyInputRef} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Tulis balasan Anda di sini..." className="w-full bg-white border border-zinc-200 p-3 rounded-sm text-sm font-bold outline-none focus:border-red-600 transition-all resize-none shadow-sm" rows={2}/>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => handlePostComment(comment.id)} className="px-6 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 shadow-lg active:scale-95 transition-all">BALAS SEKARANG</button>
                                <button onClick={() => setReplyingToId(null)} className="px-6 py-2 bg-white text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-sm hover:text-zinc-900 border border-zinc-200">BATAL</button>
                            </div>
                        </div>
                    </div>
                )}
                {replyComments.filter(r => r.parent_id === comment.id).map(reply => (
                    <CommentItem key={reply.id} comment={reply} isReply={true} replyingToId={replyingToId} replyText={replyText} setReplyText={setReplyText} handlePostComment={handlePostComment} handleUpdateComment={handleUpdateComment} handleOpenReply={handleOpenReply} setReplyingToId={setReplyingToId} replyInputRef={replyInputRef} replyComments={replyComments} session={session}/>
                ))}
            </div>
        </div>
    );
};

interface HomeTabProps {
    articles: Article[];
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

const HomeTab: React.FC<HomeTabProps> = ({ 
    articles, onOpenLogin, onLogout, session, globalSearchQuery = "", 
    articleFilterQuery = "", onSetArticleFilterQuery, initialArticle, 
    onClearTarget, articleAd, sidebarAd, smartphones = [], onProductSelect 
}) => {
    const [viewArticle, setViewArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<ThreadedComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [articleCommentCounts, setArticleCommentCounts] = useState<Record<string, number>>({});
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    const fetchCommentCounts = async () => {
        const { data, error } = await supabase.from('comments').select('target_id');
        if (!error && data) {
            const counts: Record<string, number> = {};
            data.forEach(comment => { if (comment.target_id) counts[comment.target_id] = (counts[comment.target_id] || 0) + 1; });
            setArticleCommentCounts(counts);
        }
    };

    const fetchComments = async (articleId: string) => {
        const { data, error } = await supabase.from('comments').select('*').eq('target_id', articleId).order('created_at', { ascending: true });
        if (!error && data) {
            setComments(data);
            // Handle scrolling to comment if hash exists
            const hash = window.location.hash;
            if (hash.includes('#comment-')) {
                const commentId = hash.split('#comment-').pop();
                setTimeout(() => {
                    const el = document.getElementById(`comment-${commentId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-4', 'rounded-sm');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-4'), 3000);
                    }
                }, 800);
            }
        }
    };

    const checkBookmarkStatus = async (articleId: string) => {
        if (!session) return;
        const { data } = await supabase.from('user_bookmarks').select('*').eq('user_id', session.user.id).eq('target_id', articleId).eq('target_type', 'article').maybeSingle();
        setIsBookmarked(!!data);
    };

    const toggleBookmark = async () => {
        if (!session) { onOpenLogin?.(); return; }
        if (!viewArticle) return;
        if (isBookmarked) {
            await supabase.from('user_bookmarks').delete().eq('user_id', session.user.id).eq('target_id', viewArticle.id).eq('target_type', 'article');
            setIsBookmarked(false);
        } else {
            await supabase.from('user_bookmarks').insert([{ user_id: session.user.id, target_id: viewArticle.id, target_type: 'article' }]);
            setIsBookmarked(true);
        }
    };

    useEffect(() => { fetchCommentCounts(); }, []);
    useEffect(() => { 
        if (viewArticle) { 
            const slug = viewArticle.permalink.replace(/^\//, ''); 
            if (!window.location.hash.includes('#comment-')) {
                window.location.hash = `#${slug}`; 
            }
            checkBookmarkStatus(viewArticle.id); 
            fetchComments(viewArticle.id); 
        } 
    }, [viewArticle, session]);

    useEffect(() => { 
        if (initialArticle) { 
            setViewArticle(initialArticle); 
            onClearTarget?.(); 
        } 
    }, [initialArticle, onClearTarget]);

    const handlePostComment = async (parentId: string | null = null) => {
        if (!session?.user) { onOpenLogin?.(); return; }
        
        const textToPost = parentId ? replyText : newComment;
        if (!textToPost.trim() || !viewArticle) return;

        const isAdminUser = session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';
        const userNameToSave = isAdminUser ? 'Mimin 1AIX' : (session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');

        try {
            const payload: any = { 
                target_id: viewArticle.id, 
                user_id: session.user.id, 
                user_name: userNameToSave, 
                text: textToPost 
            };
            if (parentId) payload.parent_id = parentId;

            const { data, error } = await supabase.from('comments').insert([payload]).select();
            
            if (!error && data && data.length > 0) { 
                setComments(prev => [...prev, data[0]]); 
                if (parentId) { 
                    setReplyText(""); 
                    setReplyingToId(null); 
                } else {
                    setNewComment(""); 
                }
                fetchCommentCounts(); 
            } else {
                console.error("Comment Insert Error:", error);
                alert(`Gagal mengirim komentar: ${error?.message || 'Database error'}`);
            }
        } catch (err: any) {
            console.error("Comment System Error:", err);
            alert("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
        }
    };

    const handleUpdateComment = async (commentId: string, newText: string) => {
        if (!session?.user) return;
        try {
            const { error } = await supabase.from('comments').update({ text: newText }).eq('id', commentId).eq('user_id', session.user.id);
            if (!error) {
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: newText } : c));
            } else {
                alert("Gagal memperbarui komentar.");
            }
        } catch (err) {
            console.error("Comment Update Error:", err);
        }
    };

    const handleOpenReply = (commentId: string) => { setReplyingToId(commentId); setReplyText(""); setTimeout(() => replyInputRef.current?.focus(), 100); };
    const handleBackToHome = () => { setViewArticle(null); window.location.hash = '#/home'; onSetArticleFilterQuery?.(""); };
    const handleShareArticle = () => { const url = window.location.href; const text = `${viewArticle?.title} - Baca selengkapnya di 1AIX!`; if (navigator.share) navigator.share({ title: '1AIX News', text, url }).catch(() => {}); else { navigator.clipboard.writeText(url); alert("LINK ARTIKEL BERHASIL DISALIN!"); } };

    const filteredArticles = useMemo(() => {
        const queryToUse = articleFilterQuery || globalSearchQuery;
        if (!queryToUse) return articles;
        return articles.filter(a => a.title.toLowerCase().includes(queryToUse.toLowerCase()) || a.summary.toLowerCase().includes(queryToUse.toLowerCase()));
    }, [articles, articleFilterQuery, globalSearchQuery]);

    const heroArticles = filteredArticles.slice(0, 2);
    const articlesAfterHero = filteredArticles.slice(2);
    const displayedArticlesAfterHero = articlesAfterHero.slice(0, visibleCount);
    
    const parentComments = useMemo(() => comments.filter(c => !c.parent_id), [comments]);
    const replyComments = useMemo(() => comments.filter(c => c.parent_id), [comments]);
    const popularArticles = useMemo(() => [...articles].sort((a, b) => (articleCommentCounts[b.id] || 0) - (articleCommentCounts[a.id] || 0)).slice(0, 3), [articles, articleCommentCounts]);

    return (
        <div className="flex gap-8 animate-in fade-in duration-700">
            <aside className="w-[240px] flex-shrink-0 space-y-10 hidden lg:block">
                <div>
                    <div className="flex items-center gap-3 mb-1"><svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg><h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">TOP BRAND INDONESIA</h3></div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-l-2 border-zinc-100 pl-2">sumber: www.topbrand-award.com</div>
                    <div className="space-y-1">{TOP_BRANDS.map((brand, idx) => (<div key={brand.name} className="px-1 py-1.5 flex items-center justify-between border-b border-zinc-50 group cursor-pointer hover:bg-zinc-50 transition-colors"><div className="flex items-center gap-4"><span className="text-[10px] font-black text-zinc-300 w-4">#{idx + 1}</span><span className="text-[11px] font-black text-zinc-700 tracking-wide uppercase group-hover:text-blue-600">{brand.name}</span></div><span className="text-[10px] font-black text-blue-500/60">{brand.share}</span></div>))}</div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1"><ChatAlt2Icon className="w-5 h-5 text-red-600" strokeWidth={2.5} /><h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">ARTIKEL POPULER</h3></div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-4 border-l-2 border-zinc-100 pl-2">DISKUSI TERHANGAT</div>
                    <div className="space-y-3">{popularArticles.map((art) => (<div key={art.id} onClick={() => setViewArticle(art)} className="group cursor-pointer border-b border-zinc-50 pb-3 last:border-0"><div className="flex gap-3 items-start"><div className="w-16 h-10 flex-shrink-0 bg-zinc-100 rounded-sm overflow-hidden border border-zinc-100"><img src={art.cover_image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" /></div><div className="flex-1 min-w-0"><h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 italic mb-1.5">{art.title}</h4><div className="flex items-center gap-1.5 text-zinc-300"><ChatAlt2Icon className="w-2.5 h-2.5" strokeWidth={3} /><span className="text-[9px] font-black">{articleCommentCounts[art.id] || 0}</span></div></div></div></div>))}</div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-4"><svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg><h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">PERANGKAT BARU</h3></div>
                    <div className="space-y-0">{smartphones.slice(0, 3).map(phone => (<div key={phone.id} onClick={() => onProductSelect?.(phone)} className="flex items-center gap-6 group cursor-pointer border-b border-zinc-100/50 py-1.5 last:border-0 transition-all hover:bg-zinc-50/50"><div className="w-24 h-24 bg-white border border-zinc-100 p-2 flex items-center justify-center rounded-sm flex-shrink-0 group-hover:border-red-600 transition-all shadow-sm"><img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" /></div><div className="flex flex-col min-w-0"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1.5">{phone.brand}</span><h4 className="text-[13px] font-black text-zinc-800 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{phone.model_name}</h4><span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{phone.release_month} {phone.release_year}</span></div></div>))}</div>
                </div>
                <div className="w-full">{sidebarAd?.image_url ? (<a href={sidebarAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full"><img src={sidebarAd.image_url} alt="Promo" className="w-full h-auto rounded shadow-md border border-zinc-100" /></a>) : (<div className="aspect-[240/250] bg-[#f1f5f9] border border-zinc-100 flex flex-col items-center justify-center shadow-inner rounded-sm"><span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2 opacity-50">ADVERTISEMENT</span><span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-xl">PARTNER SPACE</span></div>)}</div>
            </aside>
            <div className="flex-grow">
                {viewArticle ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={handleBackToHome} className="mb-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors group"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>KEMBALI KE BERANDA</button>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex gap-1">{(viewArticle.categories || []).map(cat => <span key={cat} className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-0.5 uppercase tracking-[0.4em]">{cat}</span>)}</div>
                                <div className="flex items-center gap-1">
                                    {/* AUTHOR NAME SECTION */}
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 border-r border-zinc-100 pr-3 hidden sm:inline-block">
                                        BY {viewArticle.author_name}
                                    </span>
                                    <button onClick={toggleBookmark} className={`p-2 transition-colors ${isBookmarked ? 'text-red-600' : 'text-zinc-300 hover:text-red-600'}`} title="SIMPAN KE FAVORIT">
                                        <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </button>
                                    <button onClick={handleShareArticle} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="BAGIKAN ARTIKEL"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic">{viewArticle.title}</h1>
                        </div>
                        <div className="w-full h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100"><img src={viewArticle.cover_image_url} alt="" className="w-full h-full object-cover"/></div>
                        <div className="mb-16"><div className="article-view-body" dangerouslySetInnerHTML={{ __html: viewArticle.content }} /></div>
                        <div className="flex flex-wrap items-center gap-4 mb-12 pt-6 border-t border-zinc-50">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BAGIKAN:</span>
                            <div className="flex gap-2">
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#1877f2] text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-sm">Facebook</a>
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(viewArticle.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#000000] text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-sm border border-zinc-800">X (Twitter)</a>
                                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(viewArticle.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#25d366] text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-sm">WhatsApp</a>
                            </div>
                        </div>
                        
                        {/* TAGS SECTION */}
                        {viewArticle.tags && (
                            <div className="mb-10 flex flex-wrap gap-2">
                                {viewArticle.tags.split(' ').filter(t => t.startsWith('#')).map((tag, idx) => (
                                    <span key={idx} className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-sm hover:bg-zinc-200 transition-colors cursor-default border border-zinc-200/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="hidden lg:block mb-16">{articleAd?.image_url ? (<a href={articleAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden shadow-md"><img src={articleAd.image_url} alt="Ads" className="w-full h-auto object-cover max-h-[120px] rounded-sm" /></a>) : (<div className="h-[120px] bg-[#f8fafc] border border-zinc-100 flex flex-col items-center justify-center shadow-inner rounded-sm"><span className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em] mb-2 opacity-50">ADVERTISEMENT</span><span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-xl opacity-60">PARTNER SPACE</span></div>)}</div>
                        <div className="border-t border-zinc-100 pt-12 mb-32"><div className="flex items-center gap-3 mb-8"><ChatAlt2Icon className="w-6 h-6 text-red-600" strokeWidth={2.5} /><h3 className="text-xl font-black uppercase tracking-tighter italic">Diskusi & Komentar</h3></div>
                            <div className="bg-[#f8fafc] border border-zinc-100 p-8 rounded-sm mb-12"><div className="flex gap-4"><div className="w-12 h-12 rounded-sm bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0 text-xl shadow-lg border border-red-500/20">{session ? (session.user.user_metadata?.full_name || session.user.email || 'U').charAt(0).toUpperCase() : '?'}</div><div className="flex-1 space-y-4"><textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Berikan pendapatmu tentang artikel ini..." className="w-full bg-white border border-zinc-100 p-6 rounded-sm text-sm font-bold outline-none focus:border-red-600 transition-all shadow-sm resize-none" rows={3}/><button onClick={() => handlePostComment(null)} className="px-10 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all rounded-sm shadow-xl active:scale-95">KIRIM KOMENTAR</button></div></div></div>
                            <div className="space-y-4">{parentComments.map(comment => (<CommentItem key={comment.id} comment={comment} replyingToId={replyingToId} replyText={replyText} setReplyText={setReplyText} handlePostComment={handlePostComment} handleUpdateComment={handleUpdateComment} handleOpenReply={handleOpenReply} setReplyingToId={setReplyingToId} replyInputRef={replyInputRef} replyComments={replyComments} session={session}/>))}{comments.length === 0 && (<div className="text-center py-10 opacity-20"><span className="text-[10px] font-black uppercase tracking-[0.5em]">Belum Ada Komentar</span></div>)}</div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {articles.length === 0 ? <div className="text-center py-20 font-black text-zinc-200 animate-pulse uppercase tracking-[0.5em]">Loading News...</div> : (<>
                            {heroArticles.length > 0 && (<div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm h-[280px]">{heroArticles.map((art) => (<div key={art.id} className="relative h-full overflow-hidden group cursor-pointer border-l border-zinc-200" onClick={() => setViewArticle(art)}><img src={art.cover_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div><div className="absolute top-4 left-4 flex flex-wrap gap-1">{(art.categories || []).map(cat => (<span key={cat} className="text-[7px] font-black text-white bg-red-600 px-1.5 py-0.5 uppercase tracking-widest rounded-sm shadow-md border border-red-500/20">{cat}</span>))}</div><div className="absolute bottom-6 left-6 right-6"><div className="flex items-center gap-2 mb-2"><span className="text-[7.5px] font-black text-zinc-300 uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded-sm">{art.publish_date}</span></div><h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors drop-shadow-xl">{art.title}</h2></div></div>))}</div>)}
                            {articlesAfterHero.length > 0 && (<div className="pt-8"><h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter mb-4 italic">Rekomendasi Artikel Lainnya</h3><div className="grid grid-cols-1 gap-4">{displayedArticlesAfterHero.map(art => (<div key={art.id} className="flex gap-4 group cursor-pointer border-b border-zinc-100 pb-4 last:border-0" onClick={() => setViewArticle(art)}><div className="w-36 h-20 md:w-40 md:h-24 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-sm shadow-sm border border-zinc-100"><img src={art.cover_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" /></div><div className="flex flex-col justify-center min-w-0"><div className="flex gap-1 mb-1 flex-wrap">{(art.categories || []).map(cat => (<span key={cat} className="text-[7px] md:text-[8px] font-black text-red-600 border border-red-600/30 px-1 py-0.5 uppercase tracking-tighter rounded-sm">{cat}</span>))}</div><h4 className="text-base md:text-lg font-black text-zinc-900 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 italic">{art.title}</h4><p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight line-clamp-1 mt-1">{art.summary}</p><div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase mt-2"><div className="flex items-center gap-1"><ChatAlt2Icon className="w-3 h-3" strokeWidth={3} /><span>{articleCommentCounts[art.id] || 0}</span></div><span className="opacity-30">•</span><span>{art.publish_date}</span></div></div></div>))}</div>
                            {articlesAfterHero.length > visibleCount && (
                                <div className="pt-8 flex justify-center">
                                    <button onClick={() => setVisibleCount(prev => prev + 10)} className="px-12 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-red-600 transition-all shadow-xl active:scale-95">MUAT LEBIH BANYAK</button>
                                </div>
                            )}
                            </div>)}
                        </>)}
                    </div>
                )}
            </div>
            <style>{`
                .article-view-body { font-family: 'Inter', sans-serif; font-size: 1.05rem; line-height: 1.8; color: #1a1a1a; }
                .article-view-body h1, .article-view-body h2, .article-view-body h3, .article-view-body h4 { font-family: 'Roboto', sans-serif; font-weight: 900 !important; text-transform: uppercase; line-height: 1.2; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #000; letter-spacing: -0.025em; }
                .article-view-body h1 { font-size: 2.5rem; }
                .article-view-body h2 { font-size: 2rem; }
                .article-view-body h3 { font-size: 1.5rem; }
                .article-view-body h4 { font-size: 1.25rem; }
                .article-view-body p { margin-bottom: 1.5rem; }
                .article-view-body strong { font-weight: 800; color: #000; }
                .article-view-body em { font-style: italic; }
                .article-view-body a { color: #ef4444; font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(239, 68, 68, 0.3); transition: all 0.2s; }
                .article-view-body a:hover { color: #b91c1c; border-bottom-color: #b91c1c; }
                .article-view-body img { border-radius: 4px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); margin: 2.5rem 0; display: block; max-width: 100%; height: auto; }
                .article-view-body blockquote { font-size: 1.15rem; font-style: italic; color: #4a5568; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 6px solid #ef4444; background-color: #f8fafc; border-radius: 0 4px 4px 0; font-weight: 500; }
                .article-view-body ul, .article-view-body ol { margin-bottom: 2rem; padding-left: 1.5rem; }
                .article-view-body ul li { list-style-type: disc; margin-bottom: 0.75rem; }
                .article-view-body ol li { list-style-type: decimal; margin-bottom: 0.75rem; }
                .article-view-body li::marker { color: #ef4444; font-weight: 900; }
                .article-view-body iframe { width: 100% !important; aspect-ratio: 16/9; margin: 2.5rem 0; border-radius: 4px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .aligncenter { text-align: center; margin-left: auto; margin-right: auto; }
                .alignleft { float: left; margin-right: 1.5rem; margin-bottom: 1rem; }
                .alignright { float: right; margin-left: 1.5rem; margin-bottom: 1rem; }
                .wp-block-image { margin-bottom: 2.5rem; }
                .wp-block-image figcaption { font-size: 0.8rem; text-align: center; color: #718096; margin-top: 0.5rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
};

export default HomeTab;
