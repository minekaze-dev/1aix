import React, { useState, useEffect, useRef } from 'react';
import type { Brand, Smartphone, Article } from '../types';
import type { Session } from '@supabase/supabase-js';
import { SearchIcon, UserCircleIcon, MenuIcon, XIcon } from './icons';

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
    smartphones?: Smartphone[];
    articles?: Article[];
    onProductSelect?: (phone: Smartphone) => void;
    onArticleSelect?: (article: Article) => void;
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
    smartphones = [],
    articles = [],
    onProductSelect,
    onArticleSelect
}) => {
    const brands: Brand[] = [
        "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco",
        "Tecno", "Itel", "Iqoo", "Asus", "Redmagic", "Honor", "Motorola", "Huawei"
    ];

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const isAdmin = session?.user?.email === 'admin@1aix.com' || session?.user?.email === 'rifki.mau@gmail.com';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
                if (window.innerWidth < 1024) setIsMobileSearchOpen(false);
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

    const showDropdown = (isSearchFocused || isMobileSearchOpen) && (filteredPhones.length > 0 || filteredArticles.length > 0);

    const handleBrandSelect = (brand: Brand) => {
        onSelectBrand?.(brand);
        setIsMenuOpen(false);
        window.location.hash = '#/katalog';
    };

    return (
        <header className="w-full max-w-[1000px] flex flex-col shadow-xl z-50">
            {/* Top Header - Black Section */}
            <div className="bg-[#0b0b0b] text-white h-16 flex items-center justify-between px-4 lg:px-6">
                {/* Logo Section */}
                <div 
                  className="flex items-center cursor-pointer select-none transition-opacity hover:opacity-80" 
                  onClick={() => {
                    if (onGoHome) onGoHome();
                    else window.location.hash = '#/home';
                  }}
                >
                    <img 
                        src="https://i.imgur.com/8LtVd3P.jpg" 
                        alt="1AIX Logo" 
                        className="h-[44px] lg:h-[52px] w-auto object-contain brightness-110"
                    />
                </div>

                {/* Center Search Bar (Desktop) */}
                <div className="flex-1 max-w-[400px] mx-4 hidden lg:flex items-center h-full relative" ref={searchRef}>
                    <div className="relative group w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10">
                            <SearchIcon className="w-4 h-4" />
                        </div>
                        <input 
                            type="text"
                            placeholder="CARI GADGET ATAU ARTIKEL..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-zinc-600 focus:bg-black transition-all"
                        />
                    </div>
                    {showDropdown && !isMobileSearchOpen && (
                        <SearchDropdown 
                            phones={filteredPhones} 
                            articles={filteredArticles} 
                            onProductSelect={onProductSelect} 
                            onArticleSelect={onArticleSelect} 
                            onClose={() => setIsSearchFocused(false)} 
                        />
                    )}
                </div>

                {/* Right Navigation & Auth */}
                <div className="flex items-center gap-2 lg:gap-6">
                    {/* Desktop Nav Links */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <button 
                            onClick={() => onGoToCompare ? onGoToCompare() : (window.location.hash = '#/bandingkan')}
                            className={`flex items-center gap-2 group transition-colors ${activeTab === 'Bandingkan' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">COMPARE</span>
                        </button>
                        <button 
                            onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                            className={`flex items-center gap-2 group transition-colors ${activeTab === 'Katalog' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">KATALOG</span>
                        </button>
                    </nav>

                    {/* Mobile Only: Search Toggle */}
                    <button 
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className="p-2 text-zinc-400 hover:text-white lg:hidden"
                    >
                        <SearchIcon className="w-7 h-7" />
                    </button>

                    {/* Login/Profile Icon */}
                    <button 
                        onClick={session ? onLogout : onOpenLogin}
                        className={`p-1 transition-all active:scale-95 ${session ? 'text-blue-500' : 'text-red-600'}`}
                    >
                        <UserCircleIcon className="w-8 h-8 lg:w-9 lg:h-9" />
                    </button>

                    {/* Hamburger Menu (Mobile) */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 text-zinc-300 hover:text-white lg:hidden"
                    >
                        {isMenuOpen ? <XIcon className="w-9 h-9" /> : <MenuIcon className="w-9 h-9" />}
                    </button>

                    {/* Desktop Logout Button */}
                    <div className="hidden lg:block h-8 w-px bg-zinc-800 mx-2 self-center"></div>
                    {session && (
                        <button 
                            onClick={onLogout}
                            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-sm transition-all group"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path></svg>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">LOGOUT</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Search Input (Visible when toggled) */}
            {isMobileSearchOpen && (
                <div className="bg-[#1a1a1a] p-4 lg:hidden border-b border-zinc-800 animate-in slide-in-from-top duration-300 relative" ref={searchRef}>
                    <input 
                        type="text"
                        placeholder="CARI GADGET ATAU ARTIKEL..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        autoFocus
                        className="w-full bg-black border border-zinc-700 rounded-sm py-3 px-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-600"
                    />
                    {showDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-0 bg-white shadow-2xl z-[100] border-b border-zinc-200">
                             <SearchDropdown 
                                phones={filteredPhones} 
                                articles={filteredArticles} 
                                onProductSelect={(p) => { onProductSelect?.(p); setIsMobileSearchOpen(false); }} 
                                onArticleSelect={(a) => { onArticleSelect?.(a); setIsMobileSearchOpen(false); }} 
                                onClose={() => setIsMobileSearchOpen(false)} 
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Hamburger Brand Menu (Mobile) */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] bg-black/90 backdrop-blur-md animate-in slide-in-from-right duration-300 flex flex-col p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                         <img src="https://i.imgur.com/8LtVd3P.jpg" alt="1AIX" className="h-10 w-auto brightness-110" />
                         <button onClick={() => setIsMenuOpen(false)} className="text-red-600"><XIcon className="w-10 h-10" /></button>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 border-l-2 border-red-600 pl-4">KATALOG BRAND HP</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {brands.map(brand => (
                                <button 
                                    key={brand}
                                    onClick={() => handleBrandSelect(brand)}
                                    className={`py-4 px-4 bg-white/5 border border-white/10 rounded-sm text-white text-[11px] font-black uppercase tracking-widest text-left hover:bg-white/10 transition-colors ${selectedBrand === brand ? 'border-red-600 text-red-600' : ''}`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                        <button onClick={() => { window.location.hash = '#/home'; setIsMenuOpen(false); }} className="text-zinc-400 text-left font-black text-xs uppercase tracking-widest py-2">HOME FEED</button>
                        {isAdmin && <button onClick={() => { window.location.hash = '#/admin'; setIsMenuOpen(false); }} className="text-red-500 text-left font-black text-xs uppercase tracking-widest py-2">ADMIN PANEL</button>}
                    </div>
                </div>
            )}

            {/* Desktop Brand Bar - Hidden on Mobile */}
            <div className="w-full hidden lg:flex items-stretch h-14 border-b border-zinc-200">
                <div className="bg-[#a3a3a3] px-4 flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#ef4444]" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    OFFICIAL BRAND
                </div>
                
                <div className="flex-1 bg-[#f1f5f9] flex justify-center items-center px-4 overflow-hidden">
                    <div className="grid grid-cols-8 gap-x-6 gap-y-1 content-center">
                        {brands.map(brand => {
                            const isActive = selectedBrand === brand;
                            return (
                                <button 
                                    key={brand} 
                                    onClick={() => onSelectBrand && onSelectBrand(brand)}
                                    className={`text-[10px] font-black uppercase tracking-tighter transition-colors text-center px-0.5 truncate flex items-center justify-center h-5 ${isActive ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                                >
                                    {brand}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button 
                    onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                    className="bg-[#3b82f6] px-4 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors flex-shrink-0"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    ALL BRAND
                </button>
            </div>
        </header>
    );
};

const SearchDropdown = ({ phones, articles, onProductSelect, onArticleSelect, onClose }: any) => (
    <div className="absolute top-[calc(100%-1px)] lg:top-[calc(100%-8px)] left-0 right-0 bg-white shadow-2xl border lg:border-zinc-200 lg:rounded-sm overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
        {phones.length > 0 && (
            <div className="p-3">
                <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-2">GADGETS</div>
                {phones.map((phone: any) => (
                    <button 
                        key={phone.id}
                        onClick={() => onProductSelect?.(phone)}
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

        {articles.length > 0 && (
            <div className={`p-3 ${phones.length > 0 ? 'border-t border-zinc-100' : ''}`}>
                <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-2">ARTIKEL</div>
                {articles.map((art: any) => (
                    <button 
                        key={art.id}
                        onClick={() => onArticleSelect?.(art)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 transition-colors text-left group"
                    >
                        <div className="w-5 h-5 flex items-center justify-center text-zinc-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <span className="text-[10px] font-black text-zinc-700 uppercase leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">{art.title}</span>
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default Header;