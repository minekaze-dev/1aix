
import React from 'react';
import type { Smartphone, Brand } from '../types';
import { TOP_BRANDS } from '../constants';
import ProductCard from './ProductCard';

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

const CatalogTab: React.FC<CatalogTabProps> = ({ 
    items, selectedBrand, setSelectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, searchQuery
}) => {
    // Filtered items for display
    const filtered = items.filter(i => {
        const matchesBrand = !selectedBrand || i.brand.toLowerCase() === selectedBrand.toLowerCase();
        const matchesSearch = i.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              i.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = minPrice === 0 || i.price_srp >= minPrice;
        const matchesMaxPrice = maxPrice === 0 || i.price_srp <= maxPrice;
        
        return matchesBrand && matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    return (
        <div className="space-y-8">
            <div className="flex gap-8">
                {/* Left: Sidebar */}
                <aside className="w-[260px] flex-shrink-0 space-y-12">
                    {/* Top Brand Award Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">TOP BRAND AWARD</h3>
                        </div>
                        <div className="space-y-1">
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
                    </div>

                    {/* Rentang Harga Filter Section */}
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4444] mb-8">RENTANG HARGA</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MINIMAL</label>
                                <div className="bg-[#f1f5f9] border border-zinc-100 p-4">
                                    <input 
                                        type="number" 
                                        value={minPrice || ''} 
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="bg-transparent w-full text-zinc-800 text-sm font-black focus:outline-none" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">MAKSIMAL</label>
                                <div className="bg-[#f1f5f9] border border-zinc-100 p-4">
                                    <input 
                                        type="number" 
                                        value={maxPrice || ''} 
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="bg-transparent w-full text-zinc-800 text-sm font-black focus:outline-none" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right: Content Area */}
                <div className="flex-grow">
                    {selectedBrand ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Brand Header */}
                            <div className="flex items-end justify-between border-b border-zinc-100 pb-6">
                                <div>
                                    <div className="text-[9px] font-black text-[#ef4444] uppercase tracking-[0.3em] mb-1">OFFICIAL BRAND</div>
                                    <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">
                                        KATALOG <span className="text-zinc-900">{selectedBrand}</span>
                                    </h2>
                                </div>
                                <div className="bg-zinc-50 border border-zinc-100 px-4 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                    {filtered.length} DEVICES
                                </div>
                            </div>

                            {/* Catalog Grid (More compact cards for specific brand view) */}
                            {filtered.length > 0 ? (
                                <div className="grid grid-cols-4 gap-6">
                                    {filtered.map(phone => (
                                        <div key={phone.id} className="group cursor-pointer">
                                            <div className="bg-[#f8f9fa] border border-zinc-100 aspect-[3/4] p-6 flex items-center justify-center relative transition-all group-hover:shadow-lg group-hover:border-blue-500">
                                                <div className="absolute top-2 right-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 leading-none">
                                                    {phone.release_status === 'Tersedia' ? 'T' : 'S'}
                                                </div>
                                                <img 
                                                    src={phone.image_url} 
                                                    alt={phone.model_name}
                                                    className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                                                />
                                            </div>
                                            <h4 className="mt-3 text-[10px] font-black text-zinc-800 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                                                {phone.model_name}
                                            </h4>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center border border-dashed border-zinc-200">
                                    <p className="text-zinc-300 font-black uppercase text-xs tracking-widest">No devices found in this range</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Header Advertisement */}
                            <div className="w-full h-24 bg-[#f8f9fa] border border-dashed border-zinc-200 flex items-center justify-center relative rounded">
                                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Header Advertisement</span>
                            </div>

                            {/* Hero Split */}
                            <div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                                <div className="relative h-[320px] overflow-hidden group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Main" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">Review</div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">2026-01-21 // 105 Comments</div>
                                        <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">Xiaomi 17 Ultra Leica Edition review</h2>
                                    </div>
                                </div>
                                <div className="relative h-[320px] overflow-hidden group cursor-pointer border-l border-zinc-200">
                                    <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Secondary" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">Review // 34 Comments</div>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">Moto G Power (2026) review</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Catalog Grid */}
                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black italic uppercase tracking-tighter border-l-3 border-red-600 pl-3">Latest Listings</h2>
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{filtered.length} Items Listed</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {filtered.map(phone => (
                                        <ProductCard key={phone.id} phone={phone} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogTab;
