import React, { useState, useEffect } from 'react';
import type { Smartphone, Brand, Article } from './types';
import { TOP_BRANDS } from './constants';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { DisplayScreenIcon, CameraShutterIcon, CpuChipIcon, BatteryFullIcon } from './components/icons'; // Import new icons

interface CatalogTabProps {
    items: Smartphone[];
    selectedBrand: Brand | null;
    setSelectedBrand: (brand: Brand | null) => void;
    minPrice: number;
    setMinPrice: (val: number) => void;
    maxPrice: number;
    setMaxPrice: (val: number) => void;
    searchQuery: string; // Now receives global searchQuery
    setSearchQuery: (q: string) => void; // Can also set global searchQuery
    onOpenLogin?: () => void;
    onLogout?: () => void;
    session?: Session | null;
    initialProduct?: Smartphone | null;
    onClearTarget?: () => void;
}

const SpecRow = ({ label, value }: { label: string; value?: string | number }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex border-b border-zinc-100 last:border-0 min-h-[40px]">
            <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 flex items-center"><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">{label}</span></div>
            <div className="w-2/3 px-4 py-2.5 flex items-center"><span className="text-[11px] font-black text-zinc-800 uppercase leading-normal">{value}</span></div>
        </div>
    );
};

// FIX: Added explicit interface for SpecSectionProps and used React.FC
interface SpecSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const SpecSection: React.FC<SpecSectionProps> = ({ icon, title, children }) => {
    const hasContent = React.Children.toArray(children).some(child => child !== null);
    if (!hasContent) return null;
    return (
        <div className="flex flex-col md:flex-row border border-zinc-200 mb-6 bg-white overflow-hidden rounded-sm shadow-sm group">
            <div className="w-full md:w-[160px] bg-white p-4 flex flex-col items-center justify-center md:border-r border-zinc-200 border-b md:border-b-0 transition-colors group-hover:bg-zinc-50">
                <div className="mb-3 transition-colors">
                    {icon}
                </div>
                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center leading-tight">{title}</h3>
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
};

// Helper to extract values from spec strings
const extractValue = (text: string | undefined, regex: RegExp, defaultValue: string = '') => {
    if (!text) return defaultValue;
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : defaultValue;
};

const CatalogTab: React.FC<CatalogTabProps> = ({ 
    items, selectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, searchQuery, setSearchQuery, onOpenLogin, onLogout, session, initialProduct, onClearTarget
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Smartphone | null>(null);
    const [ratings, setRatings] = useState<Record<string, { likes: number, dislikes: number }>>({});
    const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});
    const [sidebarArticles, setSidebarArticles] = useState<Article[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(false);

    const fetchRatings = async () => {
        const { data, error } = await supabase.from('ratings').select('*');
        if (!error && data) {
            const mapped = data.reduce((acc: any, curr: any) => {
                acc[curr.target_id] = { likes: curr.likes, dislikes: curr.dislikes }; // Corrected property name
                return acc;
            }, {});
            setRatings(mapped);
        }
    };

    const fetchSidebarArticles = async () => {
        setArticlesLoading(true);
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'PUBLISHED')
            .order('publish_date', { ascending: false })
            .limit(3); // Changed from 5 to 3
        
        if (!error && data) setSidebarArticles(data);
        setArticlesLoading(false);
    };

    useEffect(() => {
        fetchRatings();
        fetchSidebarArticles();
        const localVotes = localStorage.getItem('1AIX_USER_VOTES');
        if (localVotes) setUserVotes(JSON.parse(localVotes));
    }, []);

    useEffect(() => {
        if (initialProduct) {
            setSelectedProduct(initialProduct);
            onClearTarget?.();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [initialProduct, onClearTarget]);

    const handleRating = async (id: string, type: 'like' | 'dislike') => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
            alert("Harap login terlebih dahulu untuk memberikan penilaian.");
            onOpenLogin?.();
            return;
        }

        const currentGlobal = ratings[id] || { likes: 0, dislikes: 0 };
        const currentUserVote = userVotes[id];

        let newLikes = currentGlobal.likes;
        let newDislikes = currentGlobal.dislikes;

        if (currentUserVote === type) {
            newLikes = type === 'like' ? Math.max(0, newLikes - 1) : newLikes;
            newDislikes = type === 'dislike' ? Math.max(0, newDislikes - 1) : newDislikes;
            const newUserVotes = { ...userVotes };
            delete newUserVotes[id];
            setUserVotes(newUserVotes);
            localStorage.setItem('1AIX_USER_VOTES', JSON.stringify(newUserVotes));
        } else {
            if (currentUserVote) {
                if (type === 'like') { 
                    newLikes += 1; 
                    newDislikes = Math.max(0, newDislikes - 1); 
                } else { 
                    newDislikes += 1; 
                    newLikes = Math.max(0, newLikes - 1); 
                }
            } else {
                if (type === 'like') newLikes += 1;
                else newDislikes += 1;
            }
            const updatedUser = { ...userVotes, [id]: type };
            setUserVotes(updatedUser);
            localStorage.setItem('1AIX_USER_VOTES', JSON.stringify(updatedUser));
        }

        setRatings(prev => ({ ...prev, [id]: { likes: newLikes, dislikes: newDislikes } }));

        try {
            await supabase.from('ratings').upsert({
                target_id: id,
                likes: newLikes,
                dislikes: newDislikes
            }, { onConflict: 'target_id' });
        } catch (err) {
            console.error("Critical Rating Error:", err);
        }
    };

    const filtered = items.filter(i => {
        const matchesBrand = !selectedBrand || i.brand.toLowerCase() === selectedBrand.toLowerCase();
        // CatalogTab uses the global searchQuery
        const matchesSearch = i.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || i.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = minPrice === 0 || i.price_srp >= minPrice;
        const matchesMaxPrice = maxPrice === 0 || i.price_srp <= maxPrice;
        return matchesBrand && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    return (
        <div className="flex gap-8">
            <aside className="w-[240px] flex-shrink-0 space-y-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 leading-tight">TOP BRAND INDONESIA</h3>
                    </div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-l-2 border-zinc-100 pl-2">sumber: www.topbrand-award.com</div>

                    <div className="space-y-1 mb-8">{TOP_BRANDS.map((brand, idx) => (<div key={brand.name} className="px-1 py-1.5 flex items-center justify-between border-b border-zinc-50 group cursor-pointer hover:bg-zinc-50 transition-colors"><div className="flex items-center gap-4"><span className="text-[10px] font-black text-zinc-300 w-4">#{idx + 1}</span><span className="text-[11px] font-black text-zinc-700 tracking-wide uppercase group-hover:text-blue-600">{brand.name}</span></div><span className="text-[10px] font-black text-blue-500/60">{brand.share}</span></div>))}</div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">TRENDING NEWS</h3>
                    </div>
                    <div className="space-y-4">
                        {sidebarArticles.map((art, idx) => (
                            <div 
                                key={art.id} 
                                onClick={() => window.location.hash = '#/home'}
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

                <div><h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4444] mb-8">RENTANG HARGA</h3><div className="space-y-6"><div><label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MINIMAL</label><input type="number" value={minPrice || ''} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full bg-[#f1f5f9] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:outline-none" placeholder="0"/></div><div><label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MAKSIMAL</label><input type="number" value={maxPrice || ''} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full bg-[#f1f5f9] border border-zinc-100 p-4 rounded-sm text-sm font-black focus:outline-none" placeholder="0"/></div></div></div>
            </aside>

            <div className="flex-grow">
                {selectedProduct ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => setSelectedProduct(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>KEMBALI KE {selectedBrand || 'KATALOG'}</button>
                        <div className="flex flex-col md:flex-row gap-8 items-end">
                            <div className="md:w-[220px] flex-shrink-0">
                                <div className="bg-[#f8f9fa] border border-zinc-100 p-4 flex items-center justify-center rounded-sm">
                                    <img src={selectedProduct.image_url} alt={selectedProduct.model_name} className="w-full h-auto max-h-[240px] object-contain mix-blend-multiply drop-shadow-md" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-end">
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] leading-none">{selectedProduct.brand} Official</div>
                                        <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter leading-none">{selectedProduct.release_status}</div>
                                        {selectedProduct.market_category && <div className="bg-zinc-900 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter leading-none border border-zinc-700">{selectedProduct.market_category}</div>}
                                    </div>
                                    <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-3">{selectedProduct.model_name}</h1>
                                    
                                    {/* Short Spec Summary (UPDATED LAYOUT TO ICON-LEFT TEXT-RIGHT) */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 mb-6 border-y border-zinc-100">
                                        {/* Display */}
                                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-sm">
                                            <DisplayScreenIcon className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-[14px] font-black text-zinc-800 leading-none">
                                                    {extractValue(selectedProduct.display_type, /(\d+\.?\d*)-inch/)}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-400 uppercase leading-tight mt-1">
                                                    {extractValue(selectedProduct.display_type, /(\d+x\d+\s*pixels)/)}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Camera */}
                                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-sm">
                                            <CameraShutterIcon className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-[14px] font-black text-zinc-800 leading-none">
                                                    {extractValue(selectedProduct.camera_main, /(\d+\s*MP)/)}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-400 uppercase leading-tight mt-1">
                                                    {extractValue(selectedProduct.camera_video_main, /(\d+p)/)}
                                                </div>
                                            </div>
                                        </div>
                                        {/* RAM / Chipset */}
                                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-sm">
                                            <CpuChipIcon className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-[14px] font-black text-zinc-800 leading-none">
                                                    {extractValue(selectedProduct.ram_storage, /(\d+GB\s*RAM|\d+GB)/)}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-400 uppercase leading-tight mt-1">
                                                    {selectedProduct.chipset}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Battery */}
                                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-sm">
                                            <BatteryFullIcon className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-[14px] font-black text-zinc-800 leading-none">
                                                    {selectedProduct.battery_capacity}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-400 uppercase leading-tight mt-1">
                                                    {extractValue(selectedProduct.charging, /(\d+W)/)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* End Short Spec Summary */}
                                    
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <a 
                                                href={selectedProduct.official_store_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-center py-3 bg-zinc-900 text-white font-black uppercase text-[9px] tracking-widest hover:bg-red-600 transition-colors rounded-sm shadow-md"
                                            >
                                                WEBSITE OFFICIAL
                                            </a>
                                            <button 
                                                onClick={() => window.location.hash = '#/bandingkan'} 
                                                className="flex items-center justify-center py-3 bg-blue-600 text-white font-black uppercase text-[9px] tracking-widest hover:bg-blue-700 transition-colors rounded-sm shadow-md"
                                            >
                                                COMPARE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center my-10"><div className="h-px bg-zinc-100 flex-1"></div><span className="mx-6 text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">SPESIFIKASI LENGKAP</span><div className="h-px bg-zinc-100 flex-1"></div></div>
                        <div className="space-y-2 mb-16">
                            {/* FIX: Ensure `SpecSection` components correctly pass `children` implicitly within the JSX structure */}
                            <SpecSection title="BODY & MATERIAL" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}>
                                <SpecRow label="DIMENSI / BERAT" value={selectedProduct.dimensions_weight} />
                                <SpecRow label="MATERIAL" value={selectedProduct.material} />
                                <SpecRow label="WARNA" value={selectedProduct.colors} />
                            </SpecSection>
                            <SpecSection title="CONNECTIVITY" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>}>
                                <SpecRow label="JARINGAN" value={selectedProduct.network} />
                                <SpecRow label="WIFI" value={selectedProduct.wifi} />
                            </SpecSection>
                            <SpecSection title="DISPLAY" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9.75 17L9 20l-1 1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}>
                                <SpecRow label="TIPE LAYAR" value={selectedProduct.display_type} />
                            </SpecSection>
                            <SpecSection title="PLATFORM" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>}>
                                <SpecRow label="OS" value={selectedProduct.os} />
                                <SpecRow label="CHIPSET" value={selectedProduct.chipset} />
                                <SpecRow label="CPU" value={selectedProduct.cpu} />
                                <SpecRow label="GPU" value={selectedProduct.gpu} />
                            </SpecSection>
                            <SpecSection title="MEMORY" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75"></path></svg>}>
                                <SpecRow label="RAM / ROM" value={selectedProduct.ram_storage} />
                            </SpecSection>
                            <SpecSection title="CAMERA" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"></path></svg>}>
                                <SpecRow label="UTAMA" value={selectedProduct.camera_main} />
                                <SpecRow label="SELFIE" value={selectedProduct.camera_selfie} />
                            </SpecSection>
                            <SpecSection title="BATTERY" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>}>
                                <SpecRow label="KAPASITAS" value={selectedProduct.battery_capacity} />
                                <SpecRow label="CHARGING" value={selectedProduct.charging} />
                            </SpecSection>
                            <SpecSection title="HARDWARE & FEATURES" icon={<svg className="w-6 h-6 text-zinc-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}>
                                <SpecRow label="SENSOR" value={selectedProduct.sensors} />
                                <SpecRow label="TIPE USB" value={selectedProduct.usb_type} />
                                <SpecRow label="AUDIO" value={selectedProduct.audio} />
                                <SpecRow label="FITUR LAIN" value={selectedProduct.features_extra} />
                            </SpecSection>
                        </div>
                        <div className="flex flex-col items-center py-12 bg-white border-t border-zinc-100">
                            <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-[0.4em] mb-12">BERI PENILAIAN</h3>
                            <div className="flex gap-16">
                                <div className="flex flex-col items-center"><button onClick={() => handleRating(selectedProduct.id, 'like')} className={`w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-all mb-6 group border ${userVotes[selectedProduct.id] === 'like' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-blue-50'}`}><svg className={`w-10 h-10 ${userVotes[selectedProduct.id] === 'like' ? 'fill-blue-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg></button><span className={`text-2xl font-black tracking-tighter ${userVotes[selectedProduct.id] === 'like' ? 'text-blue-600' : 'text-blue-600/40'}`}>{ratings[selectedProduct.id]?.likes || 0}</span></div>
                                <div className="flex flex-col items-center"><button onClick={() => handleRating(selectedProduct.id, 'dislike')} className={`w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-zinc-400 hover:scale-110 active:scale-95 transition-all mb-6 group border ${userVotes[selectedProduct.id] === 'dislike' ? 'border-zinc-800 bg-zinc-50 ring-4 ring-zinc-100' : 'border-zinc-50'}`}><svg className={`w-10 h-10 ${userVotes[selectedProduct.id] === 'dislike' ? 'fill-zinc-800' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/></svg></button><span className={`text-2xl font-black tracking-tighter ${userVotes[selectedProduct.id] === 'dislike' ? 'text-zinc-800' : 'text-zinc-400'}`}>{ratings[selectedProduct.id]?.dislikes || 0}</span></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-end justify-between border-b border-zinc-100 pb-6"><div><div className="text-[9px] font-black text-[#ef4444] uppercase tracking-[0.3em] mb-1">{selectedBrand ? 'BRAND CATALOG' : 'ALL SMARTPHONES'}</div><h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">KATALOG <span className="text-zinc-900">{selectedBrand || 'SEMUA BRAND'}</span></h2></div></div>
                        <div className="grid grid-cols-4 gap-4">{filtered.map(phone => (<div key={phone.id} className="group cursor-pointer" onClick={() => setSelectedProduct(phone)}><div className="bg-[#f1f1f1] aspect-square p-4 flex items-center justify-center relative transition-all group-hover:bg-[#e8e8e8] rounded-sm shadow-sm"><img src={phone.image_url} alt={phone.model_name} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" /></div><h4 className="mt-2 text-[10px] font-black text-zinc-700 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{phone.brand} {phone.model_name}</h4></div>))}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogTab;