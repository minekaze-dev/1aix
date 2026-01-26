
import React, { useState, useEffect } from 'react';
import type { Smartphone, Brand } from '../types';
import { TOP_BRANDS } from '../constants';

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
}

const SpecRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex border-b border-zinc-100 last:border-0 min-h-[40px]">
            <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 flex items-center">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">
                    {label}
                </span>
            </div>
            <div className="w-2/3 px-4 py-2.5 flex items-center">
                <span className="text-[11px] font-black text-zinc-800 uppercase leading-normal">
                    {value}
                </span>
            </div>
        </div>
    );
};

const SpecSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => {
    const hasContent = React.Children.toArray(children).some(child => child !== null);
    if (!hasContent) return null;

    return (
        <div className="flex flex-col md:flex-row border border-zinc-200 mb-6 bg-white overflow-hidden rounded-sm shadow-sm">
            <div className="w-full md:w-[200px] bg-white p-6 flex flex-col items-center justify-center md:border-r border-zinc-200 border-b md:border-b-0">
                <div className="text-zinc-400 mb-3 scale-110">{icon}</div>
                <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest text-center">
                    {title}
                </h3>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

const CatalogTab: React.FC<CatalogTabProps> = ({ 
    items, selectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, searchQuery
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Smartphone | null>(null);

    useEffect(() => {
        setSelectedProduct(null);
    }, [selectedBrand, searchQuery, minPrice, maxPrice]);

    const filtered = items.filter(i => {
        const matchesBrand = !selectedBrand || i.brand.toLowerCase() === selectedBrand.toLowerCase();
        const matchesSearch = i.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              i.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = minPrice === 0 || i.price_srp >= minPrice;
        const matchesMaxPrice = maxPrice === 0 || i.price_srp <= maxPrice;
        
        return matchesBrand && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    if (selectedProduct) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1000px] mx-auto">
                <div className="flex flex-col md:flex-row gap-12 mb-12">
                    <div className="md:w-1/3">
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="mb-8 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            KEMBALI KE {selectedBrand || 'KATALOG'}
                        </button>

                        <div className="bg-[#f8f9fa] border border-zinc-100 p-12 flex items-center justify-center rounded-sm">
                            <img 
                                src={selectedProduct.image_url} 
                                alt={selectedProduct.model_name}
                                className="w-full max-w-[280px] h-auto object-contain mix-blend-multiply drop-shadow-xl"
                            />
                        </div>
                    </div>

                    <div className="md:w-2/3 flex flex-col justify-end">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em]">{selectedProduct.brand} Official</div>
                                <div className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">{selectedProduct.release_status}</div>
                            </div>
                            <h1 className="text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-4">{selectedProduct.model_name}</h1>
                            <div className="flex items-center gap-6">
                                <div className="text-3xl font-black text-blue-600">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedProduct.price_srp)}
                                </div>
                                <div className="bg-zinc-50 border border-zinc-200 px-4 py-1.5 rounded-sm flex flex-col">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">TKDN Score</span>
                                    <span className="text-xs font-black text-zinc-900">{selectedProduct.tkdn_score}%</span>
                                </div>
                            </div>
                        </div>

                        <a 
                            href={selectedProduct.official_store_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-5 bg-zinc-900 text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-blue-600 transition-colors rounded-sm shadow-lg"
                        >
                            BELI SEKARANG (OFFICIAL STORE)
                        </a>
                    </div>
                </div>

                <div className="space-y-4">
                    <SpecSection title="BODY & MATERIAL" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}><SpecRow label="DIMENSI / BERAT" value={selectedProduct.dimensions_weight} /><SpecRow label="MATERIAL" value={selectedProduct.material} /><SpecRow label="WARNA" value={selectedProduct.colors} /></SpecSection>
                    <SpecSection title="CONNECTIVITY" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>}><SpecRow label="JARINGAN" value={selectedProduct.network} /><SpecRow label="WIFI" value={selectedProduct.wifi} /></SpecSection>
                    <SpecSection title="DISPLAY" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}><SpecRow label="TIPE LAYAR" value={selectedProduct.display_type} /></SpecSection>
                    <SpecSection title="PLATFORM" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>}><SpecRow label="OS" value={selectedProduct.os} /><SpecRow label="CHIPSET" value={selectedProduct.chipset} /><SpecRow label="CPU" value={selectedProduct.cpu} /><SpecRow label="GPU" value={selectedProduct.gpu} /></SpecSection>
                    <SpecSection title="MEMORY" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>}><SpecRow label="RAM / ROM" value={selectedProduct.ram_storage} /></SpecSection>
                    <SpecSection title="CAMERA" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}><SpecRow label="UTAMA (BELAKANG)" value={selectedProduct.camera_main} /><SpecRow label="VIDEO BELAKANG" value={selectedProduct.camera_video_main} /><SpecRow label="SELFIE (DEPAN)" value={selectedProduct.camera_selfie} /><SpecRow label="VIDEO DEPAN" value={selectedProduct.camera_video_selfie} /></SpecSection>
                    <SpecSection title="BATTERY" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}><SpecRow label="KAPASITAS" value={selectedProduct.battery_capacity} /><SpecRow label="CHARGING" value={selectedProduct.charging} /></SpecSection>
                    <SpecSection title="HARDWARE & FEATURES" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}><SpecRow label="SENSOR" value={selectedProduct.sensors} /><SpecRow label="TIPE USB" value={selectedProduct.usb_type} /><SpecRow label="AUDIO" value={selectedProduct.audio} /><SpecRow label="FITUR LAIN" value={selectedProduct.features_extra} /></SpecSection>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-8">
            <aside className="w-[260px] flex-shrink-0 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">TOP BRAND AWARD</h3>
                    </div>
                    <div className="space-y-1 mb-2">
                        {TOP_BRANDS.map((brand, idx) => (
                            <div key={brand.name} className="px-1 py-1.5 flex items-center justify-between border-b border-zinc-50 group cursor-pointer hover:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-zinc-300 w-4">#{idx + 1}</span>
                                    <span className="text-[11px] font-black text-zinc-700 tracking-wide uppercase group-hover:text-blue-600">{brand.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    <span className="text-[10px] font-black text-blue-500/60">{brand.share}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Official Source Link */}
                    <div className="mb-8 px-1">
                        <a href="https://www.topbrand-award.com/" target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest hover:text-blue-600 transition-colors italic">
                            Source: topbrand-award.com
                        </a>
                    </div>

                    <button className="w-full flex items-center justify-between p-4 bg-zinc-900 text-white hover:bg-blue-600 transition-colors group rounded-sm shadow-lg">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">LOGIN / MASUK</span>
                        </div>
                        <svg className="w-3 h-3 text-zinc-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4444] mb-8">RENTANG HARGA</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MINIMAL</label>
                            <div className="bg-[#f1f5f9] border border-zinc-100 p-4 rounded-sm">
                                <input type="number" value={minPrice || ''} onChange={(e) => setMinPrice(Number(e.target.value))} className="bg-transparent w-full text-zinc-800 text-sm font-black focus:outline-none placeholder-zinc-300" placeholder="0"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MAKSIMAL</label>
                            <div className="bg-[#f1f5f9] border border-zinc-100 p-4 rounded-sm">
                                <input type="number" value={maxPrice || ''} onChange={(e) => setMaxPrice(Number(e.target.value))} className="bg-transparent w-full text-zinc-800 text-sm font-black focus:outline-none placeholder-zinc-300" placeholder="0"/>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-grow">
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-end justify-between border-b border-zinc-100 pb-6">
                        <div>
                            <div className="text-[9px] font-black text-[#ef4444] uppercase tracking-[0.3em] mb-1">
                                {selectedBrand ? 'BRAND CATALOG' : 'ALL SMARTPHONES'}
                            </div>
                            <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">
                                KATALOG <span className="text-zinc-900">{selectedBrand || 'SEMUA BRAND'}</span>
                            </h2>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-100 px-4 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest rounded-sm">
                            {filtered.length} DEVICES
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-4 gap-6">
                            {filtered.map(phone => (
                                <div key={phone.id} className="group cursor-pointer" onClick={() => setSelectedProduct(phone)}>
                                    <div className="bg-[#f1f1f1] aspect-square p-4 flex items-center justify-center relative transition-all group-hover:bg-[#e8e8e8] rounded-sm shadow-sm">
                                        <div className="absolute top-1.5 right-1.5 bg-black text-white text-[8px] font-black w-4 h-4 flex items-center justify-center leading-none rounded-sm">{phone.release_status === 'Tersedia' ? 'T' : 'S'}</div>
                                        <img src={phone.image_url} alt={phone.model_name} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                                    </div>
                                    <h4 className="mt-3 text-[10px] font-black text-zinc-700 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{phone.brand} {phone.model_name}</h4>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center border border-dashed border-zinc-200 rounded">
                            <p className="text-zinc-300 font-black uppercase text-xs tracking-widest italic">No devices found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogTab;
