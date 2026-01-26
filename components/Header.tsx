
import React from 'react';
import type { Brand } from '../types';

interface HeaderProps {
    activeTab: string;
    onSelectBrand?: (brand: Brand | null) => void;
    onGoHome?: () => void;
    onGoToCatalog?: () => void;
    onGoToCompare?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onSelectBrand, onGoHome, onGoToCatalog, onGoToCompare }) => {
    const brands: Brand[] = [
        "Samsung", "Xiaomi", "Apple", "Oppo", "Vivo", "Realme", "Infinix", "Poco",
        "Tecno", "Itel", "Iqoo", "Asus", "Redmagic", "Honor", "Motorola", "Huawei"
    ];

    return (
        <header className="w-full max-w-[1000px] flex flex-col shadow-xl z-50">
            {/* Top Header - Black Section - Maintained at h-16 */}
            <div className="bg-[#0b0b0b] text-white h-16 flex items-center justify-between px-6">
                {/* Logo Image / Home Button - Enlarged from h-10 to h-13 (52px) */}
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

                {/* Search Bar */}
                <div className="flex-1 max-w-[280px] mx-8 relative">
                    <input 
                        type="text" 
                        placeholder="CARI HP..." 
                        className="w-full bg-[#1a1a1a] border border-zinc-800 px-10 py-1.5 text-[10px] focus:border-zinc-700 outline-none transition-all uppercase tracking-widest font-black placeholder-zinc-700 text-zinc-300 rounded-sm"
                    />
                    <svg className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                {/* Navigation Links - 3 Menus Only */}
                <nav className="flex items-center gap-8">
                    <button 
                        onClick={() => onGoToCompare ? onGoToCompare() : (window.location.hash = '#/bandingkan')}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors ${activeTab === 'Bandingkan' ? 'text-blue-500' : 'text-zinc-400'}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        COMPARE
                    </button>
                    <button 
                        onClick={() => onGoToCatalog ? onGoToCatalog() : (window.location.hash = '#/katalog')}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors ${activeTab === 'Katalog' ? 'text-blue-500' : 'text-zinc-400'}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        KATALOG
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/coming-soon'}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors ${activeTab === 'Segera Rilis' ? 'text-blue-500' : 'text-zinc-400'}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        TKDN MONITOR
                    </button>
                </nav>
            </div>

            {/* Brand Bar - Reduced height to h-12 */}
            <div className="w-full flex items-stretch h-12 border-b border-zinc-200">
                {/* Left Section (Gray) */}
                <div className="bg-[#a3a3a3] px-4 flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#ef4444]" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    OFFICIAL BRAND
                </div>
                
                {/* Middle Section (Brand Grid 2 rows x 8 cols) */}
                <div className="flex-1 bg-[#f1f5f9] px-2 py-0.5 grid grid-cols-8 items-center gap-x-2">
                    {brands.map(brand => (
                        <button 
                            key={brand} 
                            onClick={() => onSelectBrand && onSelectBrand(brand)}
                            className="text-[9px] font-black text-zinc-700 hover:text-blue-600 uppercase tracking-tighter transition-colors text-center truncate"
                        >
                            {brand}
                        </button>
                    ))}
                </div>

                {/* Right Section (Blue) */}
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
