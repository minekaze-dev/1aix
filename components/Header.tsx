
import React, { useState, useEffect, useRef } from 'react';
import type { Brand, Smartphone, Article } from '../types'; // FIX: Added Smartphone and Article types
import type { Session } from '@supabase/supabase-js';

interface HeaderProps {
    activeTab: string;
    selectedBrand?: Brand | null;
    onSelectBrand?: (brand: Brand | null) => void;
    onGoHome?: () => void;
    onGoToCatalog?: () => void;
    onGoToCompare?: () => void;
    onOpenLogin?: () => void;
    onLogout?: () => void;
    session?: Session | null;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    smartphones?: Smartphone[]; // FIX: Added missing prop
    articles?: Article[]; // FIX: Added missing prop
    onProductSelect?: (phone: Smartphone) => void; // FIX: Added missing prop
    onArticleSelect?: (article: Article) => void; // FIX: Added missing prop
}

const Header: React.FC<HeaderProps> = ({ 
    activeTab, 
    selectedBrand,
    onSelectBrand, 
    onGoHome, 
    onGoToCatalog, 
    onGoToCompare, 
    onOpenLogin,
    onLogout,
    session,
    searchQuery = "",
    onSearchChange,
    smartphones = [], // FIX: Destructure with default value
    articles = [], // FIX: Destructure with default value
    onProductSelect, // FIX: Destructure
    onArticleSelect // FIX: Destructure
}) => {
    const brands: Brand[] = [
        "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco",
        "Tecno", "Itel", "Iqoo", "Asus", "Redmagic", "Honor", "Motorola", "Huawei"
    ];

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const isAdmin = session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredPhones = searchQuery.length > 1 
        ? smartphones.filter(p => 
            p.model_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    const filteredArticles = searchQuery.length > 1
        ? articles.filter(a => 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.summary.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    const showDropdown = isSearchFocused && (filteredPhones.length > 0 || filteredArticles.length > 0);

    return (
        <header className="w-full max-w-[1000px] flex flex-col shadow-xl z-50">
            {/* Top Header - Black Section */}
            <div className="bg-[#0b0b0b] text-white h-16 flex items-center justify-between">
                {/* Logo Section */}
                <div 
                  className="flex items-center cursor-pointer select-none transition-opacity hover:opacity-80 px-6 h-full" 
                  onClick={() => {
                    if (onGoHome) onGoHome();
                    else window.location.hash = '#/home';
                  }}
                >
                    <img 
                        src="https://i.imgur.com/8LtVd3P.jpg" 
                        alt="1AIX Logo" 
                        className="h-[52px] w-auto object-contain brightness-110"
                    />
                </div>

                {/* Center Search Bar Container - Refined Centering */}
                <div className="flex-1 max-w-[400px] mx-4 hidden lg:flex items-center h-full relative" ref={searchRef}>
                    <div className="relative group w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input 
                            type="text"
                            placeholder="CARI GADGET ATAU ARTIKEL..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            // Removed automatic navigation to #/katalog on focus
                            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-zinc-600 focus:bg-black transition-all"
                        />
                    </div>

                    {/* Search Dropdown */}
                    {showDropdown && (
                        <div className="absolute top-[calc(100%-8px)] left-0 right-0 bg-white shadow-2xl border border-zinc-200 rounded-sm overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                            {filteredPhones.length > 0 && (
                                <div className="p-2">
                                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-1">GADGETS</div>
                                    {filteredPhones.map(phone => (
                                        <button 
                                            key={phone.id}
                                            onClick={() => {
                                                onProductSelect?.(phone);
                                                setIsSearchFocused(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 bg-zinc-100 p-1 flex items-center justify-center rounded-sm">
                                                <img src={phone.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-zinc-900 uppercase leading-none group-hover:text-blue-600 transition-colors">{phone.model_name}</span>
                                                <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest mt-1">{phone.brand}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredArticles.length > 0 && (
                                <div className={`p-2 ${filteredPhones.length > 0 ? 'border-t border-zinc-100' : ''}`}>
                                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-1">ARTIKEL</div>
                                    {filteredArticles.map(art => (
                                        <button 
                                            key={art.id}
                                            onClick={() => {
                                                onArticleSelect?.(art);
                                                setIsSearchFocused(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 transition-colors text-left group"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center text-zinc-300">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-700 uppercase leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">{art.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center h-full">
                    <button 
                        onClick={() => onGoToCompare ? onGoToCompare() : (window.location.hash = '#/bandingkan')}
                        className={`flex items-center gap-2 px-4 h-full group transition-all relative ${activeTab === 'Bandingkan' ? 'bg-white/5 text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">COMPARE</span>
                        {activeTab === 'Bandingkan' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600"></div>}
                    </button>

                    <button 
                        onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                        className={`flex items-center gap-2 px-4 h-full group transition-all relative ${activeTab === 'Katalog' ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className={`w-4 h-4 ${activeTab === 'Katalog' ? 'text-red-600' : 'text-zinc-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <rect x="4" y="4" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="14" y="4" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="4" y="14" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="14" y="14" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">KATALOG</span>
                        {activeTab === 'Katalog' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600"></div>}
                    </button>

                    <button 
                        onClick={() => window.location.hash = '#/coming-soon'}
                        className={`flex items-center gap-2 px-4 h-full group transition-all relative ${activeTab === 'Segera Rilis' ? 'bg-white/5 text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">TKDN MONITOR</span>
                        {activeTab === 'Segera Rilis' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600"></div>}
                    </button>

                    {isAdmin && (
                        <button 
                            onClick={() => window.location.hash = '#/admin'}
                            className={`flex items-center gap-2 px-4 h-full group transition-all relative ${activeTab === 'Admin' ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">DASHBOARD</span>
                        </button>
                    )}

                    {/* Divider and Profile/Logout Icon */}
                    <div className="h-8 w-px bg-zinc-800 mx-2 self-center"></div>

                    {session ? (
                         <button 
                            onClick={onLogout}
                            className="flex items-center justify-center w-12 h-full hover:bg-white/5 transition-all text-red-600 group"
                            title="LOGOUT"
                        >
                            {/* Ikon Logout (Panah Keluar) */}
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    ) : (
                        <button 
                            onClick={onOpenLogin}
                            className="flex items-center justify-center w-12 h-full hover:bg-white/5 transition-all text-red-600 group"
                            title="MASUK"
                        >
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    )}
                </nav>
            </div>

            {/* Brand Bar */}
            <div className="w-full flex items-stretch h-14 border-b border-zinc-200">
                <div className="bg-[#a3a3a3] px-4 flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#ef4444]" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    OFFICIAL BRAND
                </div>
                
                <div className="flex-1 bg-[#f1f5f9] grid grid-cols-8 grid-rows-2 items-center px-1">
                    {brands.map(brand => {
                        const isActive = selectedBrand === brand;
                        return (
                            <button 
                                key={brand} 
                                onClick={() => onSelectBrand && onSelectBrand(brand)}
                                className={`text-[10px] font-black uppercase tracking-tighter transition-colors text-center px-0.5 truncate h-full flex items-center justify-center ${isActive ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                {brand}
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                    className="bg-[#3b82f6] px-4 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors flex-shrink-0"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    ALL BRAND
                </button>
            </div>
        </header>
    );
};

export default Header;
