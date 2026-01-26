
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-[1000px] bg-[#0b0b0b] text-white py-12 border-t border-zinc-900 shadow-2xl">
            <div className="flex flex-col items-center">
                <div className="mb-6 cursor-pointer" onClick={() => window.location.hash = '#/home'}>
                    <img 
                        src="https://i.imgur.com/8LtVd3P.jpg" 
                        alt="1AIX Logo" 
                        className="h-10 w-auto object-contain brightness-110"
                    />
                </div>
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.6em]">GSMARENA ID // 1AIX PORTAL</div>
                <div className="mt-6 flex gap-10">
                    <a href="#/katalog" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Katalog</a>
                    <a href="#/bandingkan" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Bandingkan</a>
                    <a href="#/coming-soon" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">TKDN Monitor</a>
                </div>
                <div className="mt-10 text-[9px] font-bold text-zinc-800 uppercase tracking-widest border-t border-zinc-900 pt-6 w-full text-center">
                    &copy; {new Date().getFullYear()} 1AIX DATA SYSTEMS. ALL RIGHTS RESERVED.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
