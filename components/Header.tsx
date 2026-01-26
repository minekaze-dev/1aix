
import React from 'react';
import type { Brand } from '../types';
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
    onSearchChange
}) => {
    const brands: Brand[] = [
        "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco",
        "Tecno", "Itel", "Iqoo", "Asus", "Redmagic", "Honor", "Motorola", "Huawei"
    ];

    const isAdmin = session?.user?.email === 'admin@1aix.com';

    return (
        <header className="w-full max-w-[1000px] flex flex-col shadow-xl z-50">
            {/* Top Header - Black Section */}
            <div className="bg-[#0b0b0b] text-white h-16 flex items-center justify-between px-6">
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
                        className="h-[52px] w-auto object-contain brightness-110"
                    />
                </div>

                {/* Center Search Bar */}
                <div className="flex-1 max-w-[200px] mx-4 hidden lg:block">
                    <div className="relative group">
                        <input 
                            type="text"
                            placeholder="CARI..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onFocus={() => {
                                if (window.location.hash !== '#/katalog') {
                                    window.location.hash = '#/katalog';
                                }
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm py-2 pl-9 pr-4 text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-blue-500 focus:bg-black transition-all"
                        />
                        <svg className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-6">
                    <button 
                        onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                        className={`flex items-center gap-2 group transition-colors ${activeTab === 'Katalog' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">KATALOG</span>
                    </button>

                    <button 
                        onClick={() => onGoToCompare ? onGoToCompare() : (window.location.hash = '#/bandingkan')}
                        className={`flex items-center gap-2 group transition-colors ${activeTab === 'Bandingkan' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">COMPARE</span>
                    </button>

                    <button 
                        onClick={() => window.location.hash = '#/coming-soon'}
                        className={`flex items-center gap-2 group transition-colors ${activeTab === 'Segera Rilis' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">TKDN MONITOR</span>
                    </button>

                    {isAdmin && (
                        <button 
                            onClick={() => window.location.hash = '#/admin'}
                            className={`flex items-center gap-2 group transition-colors ${activeTab === 'Admin' ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">PANEL</span>
                        </button>
                    )}

                    {session ? (
                         <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-sm transition-all group"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l4-4m4 4H7"></path></svg>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">LOGOUT</span>
                        </button>
                    ) : (
                        <button 
                            onClick={onOpenLogin}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-all shadow-lg shadow-blue-600/20"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">LOGIN</span>
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
