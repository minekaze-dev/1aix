import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-[1000px] bg-[#0b0b0b] text-white py-10 lg:py-6 border-t border-zinc-900 shadow-2xl">
            <div className="px-6 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">
                
                {/* Section Menu: Bersusun di tengah pada mobile, rata kanan pada desktop */}
                <div className="flex flex-col items-center lg:items-end gap-4 lg:gap-2 order-1 lg:order-2"> 
                    <button 
                        onClick={() => window.location.hash = '#/faq'} 
                        className="text-[10px] lg:text-[8px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] lg:tracking-widest"
                    >
                        FAQ
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/tentang'} 
                        className="text-[10px] lg:text-[8px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] lg:tracking-widest"
                    >
                        TENTANG 1AIX
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/kebijakan'} 
                        className="text-[10px] lg:text-[8px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] lg:tracking-widest"
                    >
                        KEBIJAKAN 1AIX
                    </button>
                    <button 
                        onClick={() => window.location.hash = '#/syarat-ketentuan'} 
                        className="text-[10px] lg:text-[8px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] lg:tracking-widest"
                    >
                        SYARAT & KETENTUAN
                    </button>
                </div>

                {/* Section Branding & Copyright: Di bawah menu pada mobile, rata kiri pada desktop */}
                <div className="flex flex-col items-center lg:flex-row lg:items-center gap-4 order-2 lg:order-1">
                    <div className="w-10 h-10 border border-zinc-800 rounded flex items-center justify-center text-zinc-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <span className="text-[12px] lg:text-[11px] font-black uppercase tracking-[0.3em] lg:tracking-widest text-white leading-none mb-2 lg:mb-1">1AIX TEKNOLOGI</span>
                        <span className="text-[9px] font-bold text-zinc-600 tracking-widest leading-relaxed lg:leading-none max-w-[280px] lg:max-w-none">
                            &copy; {new Date().getFullYear()} 1AIX | Referensi Smartphone Resmi Indonesia
                        </span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;