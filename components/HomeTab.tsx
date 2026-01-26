
import React, { useState } from 'react';
import { TOP_BRANDS } from '../constants';

const HomeTab: React.FC = () => {
    const [viewArticle, setViewArticle] = useState<boolean>(false);

    return (
        <div className="flex gap-8 animate-in fade-in duration-700">
            {/* PERSISTENT SIDEBAR - REDUCED TO 240px */}
            <aside className="w-[240px] flex-shrink-0 space-y-8">
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
                
                <div className="bg-[#f8f9fa] p-6 border border-zinc-100 rounded">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Trending News</h4>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="group cursor-pointer">
                                <p className="text-[10px] font-black text-zinc-800 leading-tight uppercase tracking-tight group-hover:text-blue-600">Rumor: iPhone 17 Slim akan memiliki layar 6.6 inci...</p>
                                <span className="text-[8px] font-bold text-zinc-300 uppercase mt-1 block">2 hours ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* DYNAMIC CONTENT AREA */}
            <div className="flex-grow">
                {viewArticle ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Header Detail */}
                        <button 
                            onClick={() => setViewArticle(false)}
                            className="mb-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            KEMBALI KE BERANDA
                        </button>

                        <div className="mb-4">
                            <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-3">REVIEW EXCLUSIVE</div>
                            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic">Xiaomi 17 Ultra Leica Edition review: Beyond photography limits</h1>
                            
                            <div className="flex items-center justify-between border-y border-zinc-100 py-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">1A</div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-900 uppercase tracking-wider leading-none">Redaksi 1AIX</span>
                                        <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Jan 21, 2026 // 124 Shares</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                    </button>
                                    <button className="p-2 bg-blue-800 text-white rounded-sm hover:bg-blue-900 transition-colors">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Professional Sized Image */}
                        <div className="w-full h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100">
                            <img 
                                src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1200" 
                                alt="Xiaomi 17 Ultra" 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed text-sm">
                            <p className="mb-6 font-bold text-zinc-900 border-l-3 border-red-600 pl-4 bg-zinc-50 py-3 italic">
                                "Xiaomi kembali mendefinisikan apa yang mungkin dilakukan oleh sebuah kamera smartphone. Kolaborasi dengan Leica kini mencapai puncaknya pada seri 17 Ultra."
                            </p>
                            
                            <p className="mb-6">
                                Setelah penantian panjang, Xiaomi akhirnya merilis flagship terkuat mereka untuk tahun 2026. Xiaomi 17 Ultra Leica Edition bukan sekadar smartphone dengan kamera yang bagus; ini adalah kamera profesional yang kebetulan memiliki fitur telepon. Dengan sensor utama berukuran 1.2 inci—yang terbesar di industri saat ini—perangkat ini menjanjikan performa low-light yang belum pernah ada sebelumnya.
                            </p>

                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-4 mt-8 italic">Lensa Summilux Generasi Ke-4</h3>
                            <p className="mb-10">
                                Optik tetap menjadi fokus utama. Lensa Summilux yang digunakan memiliki aperture variabel dari f/1.4 hingga f/4.0, memberikan kontrol kedalaman bidang (bokeh) yang natural layaknya kamera mirrorless. Dalam pengujian kami di kondisi malam hari Jakarta, noise hampir tidak terlihat.
                            </p>
                        </div>

                        {/* Social Tags */}
                        <div className="flex flex-wrap gap-2 pt-8 border-t border-zinc-100 mb-12">
                            {['XIAOMI', 'LEICA', 'REVIEW', 'FLAGSHIP', '2026'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-500 font-black text-[9px] uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white cursor-pointer transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Comments Section Placeholder */}
                        <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 mb-6">34 Komentar Pengguna</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0"></div>
                                    <div className="flex-grow">
                                        <textarea 
                                            placeholder="Tulis opini kamu tentang flagship ini..." 
                                            className="w-full bg-white border border-zinc-200 p-4 text-[11px] font-bold uppercase tracking-widest focus:border-blue-500 outline-none min-h-[80px] rounded-sm"
                                        ></textarea>
                                        <button className="mt-2 px-6 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-zinc-900 transition-colors shadow-md">
                                            KIRIM KOMENTAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {/* Hero Split */}
                        <div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                            <div 
                                className="relative h-[360px] overflow-hidden group cursor-pointer"
                                onClick={() => setViewArticle(true)}
                            >
                                <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Main News" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest shadow-md">Editor's Pick</div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">21 Januari 2026 // Review</div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">Xiaomi 17 Ultra Leica Edition review: Beyond photography limits</h2>
                                </div>
                            </div>
                            <div 
                                className="relative h-[360px] overflow-hidden group cursor-pointer border-l border-zinc-200"
                                onClick={() => setViewArticle(true)}
                            >
                                <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Secondary News" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">News // 34 Comments</div>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">Samsung Galaxy S26 Ultra design leaks show sharp edges return</h3>
                                </div>
                            </div>
                        </div>

                        {/* News Feed Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-l-3 border-red-600 pl-3">
                                <h3 className="text-sm font-black italic uppercase tracking-tighter">Latest Technology News</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => setViewArticle(true)}>
                                        <div className="w-32 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-sm">
                                            <img src={`https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300&sig=${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="News Thumbnail" />
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black text-red-600 uppercase mb-1">Smartphone News</div>
                                            <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors">Poco F7 Pro targets record-breaking TKDN score in latest certification</h4>
                                            <div className="text-[8px] font-bold text-zinc-400 uppercase mt-2">Jan 20, 2026 // 8 Comments</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ad Space */}
                        <div className="w-full h-32 bg-[#f8f9fa] border border-dashed border-zinc-200 flex items-center justify-center relative rounded-sm">
                            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Section Advertisement</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTab;
