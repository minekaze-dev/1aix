import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Article, Smartphone } from '../types';

interface Bookmark {
    target_id: string;
    target_type: 'article' | 'smartphone';
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
    const [loading, setLoading] = useState(true);
    
    // State untuk edit nama
    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const fetchBookmarks = async () => {
        if (!session) return;
        setLoading(true);
        const { data, error } = await supabase.from('user_bookmarks').select('target_id, target_type').eq('user_id', session.user.id);
        if (!error && data) setBookmarks(data);
        setLoading(false);
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
            // 1. Update Tabel Profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ display_name: displayName })
                .eq('id', session.user.id);
            
            if (profileError) throw profileError;

            // 2. Update Auth Metadata agar Header ikut terupdate
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: displayName }
            });

            if (authError) throw authError;

            setIsEditingName(false);
            alert("Nama berhasil diperbarui!");
        } catch (err: any) {
            alert("Gagal memperbarui nama: " + err.message);
        } finally {
            setIsSavingName(false);
        }
    };

    useEffect(() => { 
        fetchBookmarks(); 
        if (session) {
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
                                <input 
                                    type="text" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="px-4 py-2 bg-white border border-red-600 rounded-sm font-black uppercase text-sm outline-none w-full sm:max-w-xs"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleUpdateName}
                                        disabled={isSavingName}
                                        className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isSavingName ? 'SAVING...' : 'SIMPAN'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setDisplayName(session.user.user_metadata?.full_name || '');
                                        }}
                                        className="px-4 py-2 bg-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-300"
                                    >
                                        BATAL
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="text-xl font-black text-zinc-900 uppercase italic tracking-tight">{displayName || 'Anonymous User'}</div>
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                                    title="Edit Nama"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </button>
                            </div>
                        )}
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{session.user.email}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                {/* Bookmarked Gadgets */}
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

                {/* Bookmarked Articles */}
                <div>
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
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