
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-[1000px] bg-[#0b0b0b] text-white py-6 border-t border-zinc-900 shadow-2xl">
            <div className="px-6 flex items-center justify-between">
                {/* Left Section: Support Info */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-zinc-800 rounded flex items-center justify-center text-zinc-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">SUPPORT BY GSMARENA</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">&copy; {new Date().getFullYear()} 1AIX</span>
                    </div>
                </div>

                {/* Right Section: Links */}
                <div className="flex items-center gap-12">
                    <button 
                        onClick={() => window.location.hash = '#/faq'} 
                        className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        FAQ
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/kebijakan'} 
                        className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        KEBIJAKAN 1AIX
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/syarat-ketentuan'} 
                        className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        SYARAT & KETENTUAN
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
