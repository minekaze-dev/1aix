
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Article, Smartphone } from '../types';

interface Bookmark {
    target_id: string;
    target_type: 'article' | 'smartphone';
}

interface ActivityLog {
    id: string;
    type: 'COMMENT' | 'REPLY';
    text: string;
    target_id: string;
    target_title: string;
    target_permalink: string;
    sender_name?: string;
    created_at: string;
}

interface ProfileTabProps {
    session: Session | null;
    smartphones: Smartphone[];
    articles: Article[];
    onProductSelect?: (phone: Smartphone) => void;
    onArticleSelect?: (article: Article) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ session, smartphones, articles, onProductSelect, onArticleSelect }) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const fetchBookmarks = async () => {
        if (!session) return;
        const { data, error } = await supabase.from('user_bookmarks').select('target_id, target_type').eq('user_id', session.user.id);
        if (!error && data) setBookmarks(data);
    };

    const fetchActivityLog = async () => {
        if (!session) return;
        try {
            const { data: myComments } = await supabase
                .from('comments')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const { data: allMyCommentIds } = await supabase.from('comments').select('id').eq('user_id', session.user.id);
            const myIds = allMyCommentIds?.map(c => c.id) || [];
            
            let myReplies: any[] = [];
            if (myIds.length > 0) {
                const { data: replies } = await supabase
                    .from('comments')
                    .select('*')
                    .in('parent_id', myIds)
                    .neq('user_id', session.user.id) 
                    .order('created_at', { ascending: false })
                    .limit(10);
                myReplies = replies || [];
            }

            const combined: ActivityLog[] = [];

            myComments?.forEach(c => {
                const art = articles.find(a => a.id === c.target_id);
                if (art) {
                    combined.push({
                        id: c.id,
                        type: 'COMMENT',
                        text: c.text,
                        target_id: c.target_id,
                        target_title: art.title,
                        target_permalink: art.permalink,
                        created_at: c.created_at
                    });
                }
            });

            myReplies.forEach(r => {
                const art = articles.find(a => a.id === r.target_id);
                if (art) {
                    combined.push({
                        id: r.id,
                        type: 'REPLY',
                        text: r.text,
                        target_id: r.target_id,
                        target_title: art.title,
                        target_permalink: art.permalink,
                        sender_name: r.user_name,
                        created_at: r.created_at
                    });
                }
            });

            const sorted = combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setActivities(sorted);
            
            if (sorted.length > 0) {
                localStorage.setItem(`1AIX_LAST_ACT_${session.user.id}`, Date.now().toString());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const removeBookmark = async (id: string, type: 'article' | 'smartphone') => {
        if (!session) return;
        const { error } = await supabase.from('user_bookmarks').delete().eq('user_id', session.user.id).eq('target_id', id).eq('target_type', type);
        if (!error) setBookmarks(prev => prev.filter(b => !(b.target_id === id && b.target_type === type)));
    };

    const handleUpdateName = async () => {
        if (!session || !displayName.trim()) return;
        setIsSavingName(true);
        try {
            const { error: profileError } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', session.user.id);
            if (profileError) throw profileError;
            const { error: authError } = await supabase.auth.updateUser({ data: { full_name: displayName } });
            if (authError) throw authError;
            setIsEditingName(false);
            alert("Nama berhasil diperbarui!");
        } catch (err: any) {
            alert("Gagal memperbarui nama: " + err.message);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleActivityClick = (act: ActivityLog) => {
        const art = articles.find(a => a.id === act.target_id);
        if (art) {
            onArticleSelect?.(art);
            setTimeout(() => {
                window.location.hash = `#${art.permalink.replace(/^\//, '')}#comment-${act.id}`;
            }, 300);
        }
    };

    useEffect(() => { 
        if (session) {
            setLoading(true);
            Promise.all([fetchBookmarks(), fetchActivityLog()]).finally(() => setLoading(false));
            setDisplayName(session.user.user_metadata?.full_name || '');
        }
    }, [session]);

    const bookmarkedArticles = articles.filter(a => bookmarks.some(b => b.target_id === a.id && b.target_type === 'article'));
    const bookmarkedPhones = smartphones.filter(p => bookmarks.some(b => b.target_id === p.id && b.target_type === 'smartphone'));

    if (!session) return <div className="py-20 text-center font-black uppercase text-zinc-300 tracking-widest">Silahkan login untuk mengakses profil.</div>;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-12">
                <div className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">USER DASHBOARD</div>
                <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">PROFIL PENGGUNA</h1>
                <div className="mt-6 flex items-center gap-6 p-6 bg-zinc-50 border border-zinc-100 rounded-sm">
                    <div className="w-16 h-16 bg-zinc-900 text-white flex items-center justify-center font-black text-2xl rounded-full shadow-lg">
                        {(displayName || session.user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="px-4 py-2 bg-white border border-red-600 rounded-sm font-black uppercase text-sm outline-none w-full sm:max-w-xs" autoFocus />
                                <div className="flex gap-2">
                                    <button onClick={handleUpdateName} disabled={isSavingName} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 disabled:opacity-50">{isSavingName ? 'SAVING...' : 'SIMPAN'}</button>
                                    <button onClick={() => { setIsEditingName(false); setDisplayName(session.user.user_metadata?.full_name || ''); }} className="px-4 py-2 bg-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-300">BATAL</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="text-xl font-black text-zinc-900 uppercase italic tracking-tight">{displayName || 'Anonymous User'}</div>
                                <button onClick={() => setIsEditingName(true)} className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors" title="Edit Nama"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                            </div>
                        )}
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{session.user.email}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                <div>
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">AKTIFITAS TERBARU</h3>
                    </div>
                    {loading ? <div className="animate-pulse space-y-4"><div className="h-10 bg-zinc-50 rounded"></div><div className="h-10 bg-zinc-50 rounded"></div></div> : activities.length > 0 ? (
                        <div className="space-y-3">
                            {activities.map(act => (
                                <div key={act.id} onClick={() => handleActivityClick(act)} className="p-4 bg-white border border-zinc-100 rounded-sm hover:border-emerald-600 transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'COMMENT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {act.type === 'COMMENT' ? 
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg> :
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5"/></svg>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-black text-zinc-900 uppercase tracking-tight leading-tight mb-1">
                                                {act.type === 'COMMENT' ? 
                                                    `Anda baru saja beri komentar pada artikel ` : 
                                                    <span className="text-emerald-600 font-black">{act.sender_name} membalas komentar Anda pada artikel </span>
                                                }
                                                <span className="text-blue-600 group-hover:underline italic">"{act.target_title}"</span>
                                            </p>
                                            <p className="text-[11px] font-bold text-zinc-400 italic line-clamp-1">"{act.text}"</p>
                                            <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest mt-2 block">{new Date(act.created_at).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-sm">
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Belum ada aktifitas komentar.</span>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">GADGET FAVORIT</h3>
                    </div>
                    {loading ? <div className="animate-pulse h-20 bg-zinc-50 rounded"></div> : bookmarkedPhones.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {bookmarkedPhones.map(phone => (
                                <div key={phone.id} className="bg-white border border-zinc-100 rounded-sm p-4 relative group hover:border-blue-200 transition-all shadow-sm">
                                    <button onClick={() => removeBookmark(phone.id, 'smartphone')} className="absolute top-2 right-2 text-zinc-200 hover:text-red-500 transition-colors z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    <div onClick={() => onProductSelect?.(phone)} className="cursor-pointer">
                                        <div className="aspect-square bg-zinc-50 flex items-center justify-center p-4 mb-4 rounded-sm"><img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" /></div>
                                        <div className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">{phone.brand}</div>
                                        <h4 className="text-[12px] font-black text-zinc-800 uppercase tracking-tight line-clamp-1">{phone.model_name}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border-2 border-dashed border-zinc-100 bg-zinc-50/50 rounded-sm">
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Belum Ada Gadget Disimpan</span>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">ARTIKEL DISIMPAN</h3>
                    </div>
                    {loading ? <div className="animate-pulse h-20 bg-zinc-50 rounded"></div> : bookmarkedArticles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {bookmarkedArticles.map(art => (
                                <div key={art.id} className="flex gap-4 bg-white border border-zinc-100 rounded-sm p-4 relative group hover:border-blue-200 transition-all shadow-sm">
                                    <button onClick={() => removeBookmark(art.id, 'article')} className="absolute top-4 right-4 text-zinc-200 hover:text-red-500 transition-colors z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    <div onClick={() => onArticleSelect?.(art)} className="flex gap-4 cursor-pointer flex-1 min-w-0">
                                        <div className="w-24 h-16 bg-zinc-100 rounded overflow-hidden flex-shrink-0"><img src={art.cover_image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" /></div>
                                        <div className="flex flex-col justify-center min-w-0 pr-8">
                                            <h4 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1 italic">{art.title}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{art.publish_date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border-2 border-dashed border-zinc-100 bg-zinc-50/50 rounded-sm">
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Belum Ada Artikel Disimpan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
