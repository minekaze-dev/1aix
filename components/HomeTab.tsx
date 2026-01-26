
import React from 'react';
import { TOP_BRANDS } from '../constants';

const HomeTab: React.FC = () => {
    return (
        <div className="flex gap-8 animate-in fade-in duration-700">
            {/* Left Sidebar: Top Brands Only */}
            <aside className="w-[260px] flex-shrink-0 space-y-12">
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
                
                {/* Secondary Sidebar Widget */}
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

            {/* Main Section: News Content */}
            <div className="flex-grow space-y-8">
                {/* Hero Split */}
                <div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                    <div className="relative h-[360px] overflow-hidden group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Main News" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">Editor's Pick</div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">21 Januari 2026 // Review</div>
                            <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">Xiaomi 17 Ultra Leica Edition review: Beyond photography limits</h2>
                        </div>
                    </div>
                    <div className="relative h-[360px] overflow-hidden group cursor-pointer border-l border-zinc-200">
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
                            <div key={i} className="flex gap-4 group cursor-pointer">
                                <div className="w-32 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 rounded">
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
                <div className="w-full h-32 bg-[#f8f9fa] border border-dashed border-zinc-200 flex items-center justify-center relative rounded">
                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Section Advertisement</span>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;
