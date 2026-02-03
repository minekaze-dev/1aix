
import React, { useState, useEffect } from 'react';
import type { Smartphone, Brand, AdConfig } from '../types';
import { TOP_BRANDS } from '../constants';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DisplayScreenIcon, CameraShutterIcon, CpuChipIcon, BatteryFullIcon } from './icons';

interface CatalogTabProps {
    items: Smartphone[];
    selectedBrand: Brand | null;
    setSelectedBrand: (brand: Brand | null) => void;
    minPrice: number;
    setMinPrice: (val: number) => void;
    maxPrice: number;
    setMaxPrice: (val: number) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    onOpenLogin?: () => void;
    onLogout?: () => void;
    session?: Session | null;
    initialProduct?: Smartphone | null;
    onClearTarget?: () => void;
    sidebarAd?: AdConfig;
    onCompareProduct?: (productId: string) => void;
}

const SpecRow = ({ label, value }: { label: string; value?: string | number }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex border-b border-zinc-100 last:border-0 min-h-[45px]">
            <div className="w-1/3 bg-[#f8fafc] px-4 py-3 flex items-center">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">{label}</span>
            </div>
            <div className="w-2/3 px-4 py-3 flex items-center">
                <span className="text-[11px] font-black text-zinc-800 uppercase leading-normal">{value}</span>
            </div>
        </div>
    );
};

interface SpecSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const SpecSection: React.FC<SpecSectionProps> = ({ icon, title, children }) => {
    const hasContent = React.Children.toArray(children).some(child => child !== null);
    if (!hasContent) return null;
    return (
        <div className="flex flex-col md:flex-row border border-zinc-200 mb-4 bg-white overflow-hidden rounded-sm shadow-sm group">
            <div className="w-full md:w-[160px] bg-white p-4 flex flex-col items-center justify-center md:border-r border-zinc-200 border-b md:border-b-0 transition-colors group-hover:bg-zinc-50">
                <div className="mb-3 text-zinc-300 group-hover:text-blue-500 transition-colors">
                    {icon}
                </div>
                <h3 className="text-[9px] font-black text-red-600 uppercase tracking-widest text-center leading-tight">{title}</h3>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
};

const CatalogTab: React.FC<CatalogTabProps> = ({ 
    items, selectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, searchQuery, setSearchQuery, onOpenLogin, onLogout, session, initialProduct, onClearTarget,
    sidebarAd, onCompareProduct
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Smartphone | null>(null);
    const [ratings, setRatings] = useState<Record<string, { likes: number, dislikes: number }>>({});
    const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
    const [showLoginWarning, setShowLoginWarning] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const handleHashRouting = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/katalog/') && hash.split('/').length >= 3) {
                const slug = hash.split('/').pop();
                const found = items.find(p => 
                    p.model_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug || 
                    p.id === slug
                );
                if (found) {
                    setSelectedProduct(found);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (hash === '#/katalog') {
                setSelectedProduct(null);
            }
        };

        handleHashRouting();
        window.addEventListener('hashchange', handleHashRouting);
        return () => window.removeEventListener('hashchange', handleHashRouting);
    }, [items]);

    const refreshRatingCounts = async (productId: string) => {
        try {
            const [likesRes, dislikesRes] = await Promise.all([
                supabase.from('product_votes').select('*', { count: 'exact', head: true }).eq('target_id', productId).eq('vote_type', 'like'),
                supabase.from('product_votes').select('*', { count: 'exact', head: true }).eq('target_id', productId).eq('vote_type', 'dislike')
            ]);
            setRatings(prev => ({ ...prev, [productId]: { likes: likesRes.count || 0, dislikes: dislikesRes.count || 0 } }));
            if (session?.user) {
                const { data } = await supabase.from('product_votes').select('vote_type').eq('target_id', productId).eq('user_id', session.user.id).maybeSingle();
                setUserVote(data?.vote_type || null);
            } else setUserVote(null);
        } catch (err) { console.error("Error refreshing ratings:", err); }
    };

    const checkBookmarkStatus = async (productId: string) => {
        if (!session) return;
        const { data } = await supabase.from('user_bookmarks').select('*').eq('user_id', session.user.id).eq('target_id', productId).eq('target_type', 'smartphone').maybeSingle();
        setIsBookmarked(!!data);
    };

    const toggleBookmark = async () => {
        if (!session) { onOpenLogin?.(); return; }
        if (!selectedProduct) return;
        if (isBookmarked) {
            await supabase.from('user_bookmarks').delete().eq('user_id', session.user.id).eq('target_id', selectedProduct.id).eq('target_type', 'smartphone');
            setIsBookmarked(false);
        } else {
            await supabase.from('user_bookmarks').insert([{ user_id: session.user.id, target_id: selectedProduct.id, target_type: 'smartphone' }]);
            setIsBookmarked(true);
        }
    };

    useEffect(() => { if (selectedProduct) { setShowLoginWarning(false); refreshRatingCounts(selectedProduct.id); checkBookmarkStatus(selectedProduct.id); } }, [selectedProduct, session]);

    const handleRating = async (id: string, type: 'like' | 'dislike') => {
        if (!session) { setShowLoginWarning(true); setTimeout(() => setShowLoginWarning(false), 5000); return; }
        setShowLoginWarning(false);
        try {
            if (userVote === type) await supabase.from('product_votes').delete().eq('target_id', id).eq('user_id', session.user.id);
            else await supabase.from('product_votes').upsert({ target_id: id, user_id: session.user.id, vote_type: type }, { onConflict: 'user_id,target_id' });
            await refreshRatingCounts(id);
        } catch (err) { console.error("Critical Rating Error:", err); }
    };

    const handleShareProduct = () => { const url = window.location.href; const text = `Cek spesifikasi dan harga resmi ${selectedProduct?.brand} ${selectedProduct?.model_name} di 1AIX!`; if (navigator.share) navigator.share({ title: '1AIX Gadget', text, url }).catch(() => {}); else { navigator.clipboard.writeText(url); alert("LINK PRODUK BERHASIL DISALIN!"); } };
    const filtered = items.filter(i => (!selectedBrand || i.brand.toLowerCase() === selectedBrand.toLowerCase()) && (i.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || i.brand.toLowerCase().includes(searchQuery.toLowerCase())) && (minPrice === 0 || i.price_srp >= minPrice) && (maxPrice === 0 || i.price_srp <= maxPrice));
    
    const handleProductSelect = (phone: Smartphone) => { 
        const slug = phone.model_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); 
        window.location.hash = `#/katalog/${slug}`; 
    };

    return (
        <div className="flex gap-8">
            <aside className="w-[240px] flex-shrink-0 space-y-10 hidden lg:block">
                <div>
                    <div className="flex items-center gap-3 mb-1"><svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg><h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">TOP BRAND INDONESIA</h3></div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-l-2 border-zinc-100 pl-2">sumber: www.topbrand-award.com</div>
                    <div className="space-y-1 mb-8">{TOP_BRANDS.map((brand, idx) => (<div key={brand.name} className="px-1 py-1.5 flex items-center justify-between border-b border-zinc-50 group cursor-pointer hover:bg-zinc-50 transition-colors"><div className="flex items-center gap-4"><span className="text-[10px] font-black text-zinc-300 w-4">#{idx + 1}</span><span className="text-[11px] font-black text-zinc-700 tracking-wide uppercase group-hover:text-blue-600">{brand.name}</span></div><span className="text-[10px] font-black text-blue-500/60">{brand.share}</span></div>))}</div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-4"><svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg><h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">PERANGKAT BARU</h3></div>
                    <div className="space-y-0">{items.slice(0, 3).map(phone => (<div key={phone.id} onClick={() => handleProductSelect(phone)} className="flex items-center gap-6 group cursor-pointer border-b border-zinc-100/50 py-1.5 last:border-0 transition-all hover:bg-zinc-50/50"><div className="w-24 h-24 bg-white border border-zinc-100 p-2 flex items-center justify-center rounded-sm flex-shrink-0 group-hover:border-red-600 transition-all shadow-sm"><img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" /></div><div className="flex flex-col min-w-0"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1.5">{phone.brand}</span><h4 className="text-[13px] font-black text-zinc-800 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{phone.model_name}</h4><span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{phone.release_month} {phone.release_year}</span></div></div>))}</div>
                </div>
                <div className="w-full">{sidebarAd?.image_url ? (<a href={sidebarAd.target_url} target="_blank" rel="noopener noreferrer" className="block w-full"><img src={sidebarAd.image_url} alt="Promo" className="w-full h-auto rounded shadow-md border border-zinc-100" /></a>) : (<div className="aspect-[240/250] bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shadow-inner rounded-sm"><span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ADVERTISEMENT</span><span className="text-zinc-400 font-black uppercase tracking-widest text-xl">PARTNER SPACE</span></div>)}</div>
            </aside>
            <div className="flex-grow min-w-0">
                {selectedProduct ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => { setSelectedProduct(null); window.location.hash = '#/katalog'; }} className="mb-8 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors group">
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            KEMBALI KE {selectedBrand || selectedProduct.brand.toUpperCase()}
                        </button>
                        
                        <div className="flex flex-col md:flex-row gap-8 md:items-stretch items-start">
                            <div className="w-full md:w-[220px] flex-shrink-0 flex flex-col">
                                <div className="bg-[#f8f9fa] border border-zinc-100 p-4 flex items-center justify-center rounded-sm shadow-sm aspect-square md:aspect-auto flex-grow">
                                    <img src={selectedProduct.image_url} alt={selectedProduct.model_name} className="w-full h-auto max-h-[220px] object-contain mix-blend-multiply drop-shadow-md" />
                                </div>
                                <div className="mt-2 text-center flex-shrink-0"><span className="text-[7px] font-bold text-zinc-300 uppercase tracking-widest leading-none">Image: GSMArena</span></div>
                            </div>
                            
                            <div className="flex-1 flex flex-col w-full min-w-0">
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] leading-none">{selectedProduct.brand} Official</div>
                                            <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter leading-none">{selectedProduct.release_status}</div>
                                            {selectedProduct.market_category && <div className="bg-zinc-900 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter leading-none border border-zinc-700">{selectedProduct.market_category}</div>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={toggleBookmark} className={`p-2 transition-colors ${isBookmarked ? 'text-red-600' : 'text-zinc-300 hover:text-red-600'}`} title="SIMPAN KE FAVORIT">
                                                <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                            </button>
                                            <button onClick={handleShareProduct} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="BAGIKAN"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                                        </div>
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 truncate">{selectedProduct.model_name}</h1>
                                    
                                    <div className="py-6 mb-6 border-y border-zinc-100 flex flex-col items-center justify-center bg-zinc-50/50 rounded-sm">
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">ESTIMASI HARGA PASAR</div>
                                        <div className="text-3xl font-black text-blue-600 tracking-tighter italic">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedProduct.price_srp).replace('Rp', 'Rp ')}
                                        </div>
                                        <div className="mt-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center px-6 leading-relaxed max-w-[500px]">
                                            * HARGA PASAR DAPAT BERUBAH SEWAKTU-WAKTU TERGANTUNG WILAYAH DAN KEBIJAKAN TOKO RETAIL. DATA SRP RESMI SAAT PELUNCURAN.
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-auto mb-2">
                                    <div className="flex items-center justify-center py-4 bg-[#1a1a1a] text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-sm shadow-md cursor-default border border-zinc-800">
                                        SPESIFIKASI
                                    </div>
                                    <button 
                                        onClick={() => onCompareProduct ? onCompareProduct(selectedProduct.id) : (window.location.hash = '#/bandingkan')} 
                                        className="flex items-center justify-center py-4 bg-[#3b82f6] text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all rounded-sm shadow-md active:scale-[0.98]"
                                    >
                                        COMPARE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center my-14">
                            <div className="h-px bg-zinc-100 flex-1"></div>
                            <span className="mx-8 text-[11px] font-black text-zinc-300 uppercase tracking-[0.5em]">SPESIFIKASI LENGKAP</span>
                            <div className="h-px bg-zinc-100 flex-1"></div>
                        </div>

                        <div className="space-y-4 mb-20 max-w-4xl mx-auto">
                            <SpecSection title="BODY & MATERIAL" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}>
                                <SpecRow label="DIMENSI / BERAT" value={selectedProduct.dimensions_weight} />
                                <SpecRow label="MATERIAL" value={selectedProduct.material} />
                                <SpecRow label="WARNA" value={selectedProduct.colors} />
                            </SpecSection>
                            <SpecSection title="CONNECTIVITY" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>}>
                                <SpecRow label="JARINGAN" value={selectedProduct.network} />
                                <SpecRow label="WIFI" value={selectedProduct.wifi} />
                            </SpecSection>
                            <SpecSection title="DISPLAY" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9.75 17L9 20l-1 1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}>
                                <SpecRow label="TIPE LAYAR" value={selectedProduct.display_type} />
                            </SpecSection>
                            <SpecSection title="PLATFORM" icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>}>
                                <SpecRow label="OS" value={selectedProduct.os} />
                                <SpecRow label="CHIPSET" value={selectedProduct.chipset} />
                                <SpecRow label="CPU" value={selectedProduct.cpu} />
                                <SpecRow label="GPU" value={selectedProduct.gpu} />
                            </SpecSection>
                            <SpecSection title="MEMORY" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75"></path></svg>}>
                                <SpecRow label="RAM / ROM" value={selectedProduct.ram_storage} />
                            </SpecSection>
                            <SpecSection title="CAMERA" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"></path></svg>}>
                                <SpecRow label="UTAMA" value={selectedProduct.camera_main} />
                                <SpecRow label="SELFIE" value={selectedProduct.camera_selfie} />
                            </SpecSection>
                            <SpecSection title="BATTERY" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>}>
                                <SpecRow label="KAPASITAS" value={selectedProduct.battery_capacity} />
                                <SpecRow label="CHARGING" value={selectedProduct.charging} />
                            </SpecSection>
                            <SpecSection title="HARDWARE & FEATURES" icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}>
                                <SpecRow label="SENSOR" value={selectedProduct.sensors} />
                                <SpecRow label="TIPE USB" value={selectedProduct.usb_type} />
                                <SpecRow label="AUDIO" value={selectedProduct.audio} />
                                <SpecRow label="FITUR LAIN" value={selectedProduct.features_extra} />
                            </SpecSection>
                        </div>

                        <div className="flex flex-col items-center py-16 bg-white border-t border-zinc-100">
                            <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-[0.4em] mb-10">BERI PENILAIAN</h3>
                            {showLoginWarning && !session && (<div className="w-full max-w-md bg-[#ef4444] text-white py-3 px-6 rounded-md mb-8 animate-in fade-in zoom-in-95 duration-300 shadow-lg text-center"><span className="text-[11px] font-black uppercase tracking-widest">MAAF, ANDA HARUS LOGIN TERLEBIH DAHULU.</span></div>)}
                            <div className="flex gap-20">
                                <div className="flex flex-col items-center">
                                    <button onClick={() => handleRating(selectedProduct.id, 'like')} className={`w-28 h-28 rounded-full bg-white shadow-2xl flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-all mb-6 group border-2 ${userVote === 'like' ? 'border-blue-500 bg-blue-50 ring-8 ring-blue-100' : 'border-zinc-50'}`}>
                                        <svg className={`w-12 h-12 ${userVote === 'like' ? 'fill-blue-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                                    </button>
                                    <span className={`text-2xl font-black tracking-tighter ${userVote === 'like' ? 'text-blue-600' : 'text-zinc-300'}`}>{ratings[selectedProduct.id]?.likes || 0}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <button onClick={() => handleRating(selectedProduct.id, 'dislike')} className={`w-28 h-28 rounded-full bg-white shadow-2xl flex items-center justify-center text-zinc-400 hover:scale-110 active:scale-95 transition-all mb-6 group border-2 ${userVote === 'dislike' ? 'border-zinc-800 bg-zinc-50 ring-8 ring-zinc-100' : 'border-zinc-50'}`}>
                                        <svg className={`w-12 h-12 ${userVote === 'dislike' ? 'fill-zinc-800' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/></svg>
                                    </button>
                                    <span className={`text-2xl font-black tracking-tighter ${userVote === 'dislike' ? 'text-zinc-800' : 'text-zinc-300'}`}>{ratings[selectedProduct.id]?.dislikes || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-end justify-between border-b border-zinc-100 pb-6">
                            <div>
                                <div className="text-[10px] font-black text-[#ef4444] uppercase tracking-[0.3em] mb-1">{selectedBrand ? 'BRAND CATALOG' : 'ALL SMARTPHONES'}</div>
                                <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">KATALOG <span className="text-zinc-900">{selectedBrand || 'SEMUA BRAND'}</span></h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filtered.map(phone => (
                                <div key={phone.id} className="group cursor-pointer" onClick={() => handleProductSelect(phone)}>
                                    <div className="bg-[#f1f1f1] aspect-square p-4 flex items-center justify-center relative transition-all group-hover:bg-[#e8e8e8] rounded-sm shadow-sm overflow-hidden">
                                        <img src={phone.image_url} alt={phone.model_name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h4 className="mt-3 text-[10px] font-black text-zinc-700 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{phone.brand} {phone.model_name}</h4>
                                </div>
                            ))}
                        </div>
                        {filtered.length === 0 && (
                            <div className="py-24 text-center">
                                <span className="text-zinc-300 font-black uppercase text-xs tracking-widest italic">Tidak ada gadget yang sesuai filter pencarian.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogTab;
