
import React, { useState, useEffect } from 'react';
import { TOP_BRANDS } from '../constants';
import type { Session } from '@supabase/supabase-js';
import type { Article } from '../types';

interface HomeTabProps {
    onOpenLogin?: () => void;
    session?: Session | null;
}

const HomeTab: React.FC<HomeTabProps> = ({ onOpenLogin, session }) => {
    const [viewArticle, setViewArticle] = useState<Article | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const localArticles = localStorage.getItem('1AIX_LOCAL_ARTICLES');
        if (localArticles) {
            const parsed: Article[] = JSON.parse(localArticles);
            // Only show published ones on home
            setArticles(parsed.filter(a => a.status === 'PUBLISHED'));
        }
    }, []);

    // Get the two newest articles for the featured hero section
    const heroArticles = articles.slice(0, 2);
    const latestArticles = articles.slice(2, 6);

    return (
        <div className="flex gap-8 animate-in fade-in duration-700">
            {/* PERSISTENT SIDEBAR - 240px */}
            <aside className="w-[240px] flex-shrink-0 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"></path></svg>
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
                    <div className="mb-8 px-1">
                        <a href="https://www.topbrand-award.com/" target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest hover:text-blue-600 transition-colors italic">
                            Source: topbrand-award.com
                        </a>
                    </div>

                    <button 
                        onClick={() => session ? (window.location.hash = '#/admin') : onOpenLogin?.()}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900 text-white hover:bg-blue-600 transition-colors group rounded-sm shadow-lg"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                {session ? 'MENU ADMIN' : 'LOGIN / MASUK'}
                            </span>
                        </div>
                        <svg className="w-3 h-3 text-zinc-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
                
                <div className="bg-[#f8f9fa] p-6 border border-zinc-100 rounded shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Trending Now</h4>
                    <div className="space-y-4">
                        {articles.slice(0, 3).map(art => (
                            <div key={art.id} onClick={() => setViewArticle(art)} className="group cursor-pointer">
                                <p className="text-[10px] font-black text-zinc-800 leading-tight uppercase tracking-tight group-hover:text-blue-600 truncate">{art.title}</p>
                                <span className="text-[8px] font-bold text-zinc-300 uppercase mt-1 block">{art.publish_date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* DYNAMIC CONTENT AREA */}
            <div className="flex-grow">
                {viewArticle ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button 
                            onClick={() => setViewArticle(null)}
                            className="mb-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            KEMBALI KE BERANDA
                        </button>

                        <div className="mb-4">
                            <div className="flex gap-1 mb-3">
                                {viewArticle.categories?.map(cat => (
                                    <span key={cat} className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-0.5 uppercase tracking-[0.4em]">{cat}</span>
                                ))}
                            </div>
                            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic">{viewArticle.title}</h1>
                            
                            <div className="flex items-center justify-between border-y border-zinc-100 py-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">1A</div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-900 uppercase tracking-wider leading-none">Redaksi 1AIX</span>
                                        <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">{viewArticle.publish_date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100">
                            <img 
                                src={viewArticle.cover_image_url} 
                                alt="" 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="prose prose-zinc max-w-none text-zinc-800 leading-loose text-base">
                            <div className="text-zinc-500 font-bold leading-relaxed italic border-l-3 border-red-600 pl-4 bg-zinc-50 py-4 mb-8">
                                "{viewArticle.summary}"
                            </div>
                            <div 
                                className="whitespace-pre-wrap article-content-rendered"
                                dangerouslySetInnerHTML={{ 
                                    __html: (viewArticle.content || '')
                                        .replace(/<div align="(.*?)">([\s\S]*?)<\/div>/g, '<div style="text-align: $1">$2</div>')
                                        .replace(/<span style="(.*?)">([\s\S]*?)<\/span>/g, '<span style="$1">$2</span>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/_(.*?)_/g, '<em>$1</em>')
                                        .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
                                        .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$1</h2>')
                                        .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500 my-4">$1</blockquote>')
                                        .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
                                        .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                                        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-6 rounded shadow-lg" />')
                                }} 
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-8 border-t border-zinc-100 mb-12">
                            {viewArticle.tags?.split(' ').map(tag => (
                                <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-500 font-black text-[9px] uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {/* Featured Hero Area */}
                        {heroArticles.length > 0 && (
                            <div className="grid grid-cols-2 gap-px border border-zinc-200 rounded overflow-hidden shadow-sm">
                                {heroArticles.map((art, idx) => (
                                    <div 
                                        key={art.id}
                                        className={`relative h-[360px] overflow-hidden group cursor-pointer ${idx > 0 ? 'border-l border-zinc-200' : ''}`}
                                        onClick={() => setViewArticle(art)}
                                    >
                                        <img src={art.cover_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        {idx === 0 && <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest shadow-md">Editor's Pick</div>}
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="text-zinc-400 text-[9px] font-bold uppercase mb-1">{art.publish_date} // {art.categories?.[0]}</div>
                                            <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase group-hover:text-blue-400 transition-colors">{art.title}</h2>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-l-3 border-red-600 pl-3">
                                <h3 className="text-sm font-black italic uppercase tracking-tighter">Latest Technology News</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                {latestArticles.length > 0 ? latestArticles.map(art => (
                                    <div key={art.id} className="flex gap-4 group cursor-pointer" onClick={() => setViewArticle(art)}>
                                        <div className="w-32 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-sm">
                                            <img src={art.cover_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black text-red-600 uppercase mb-1">{art.categories?.[0]}</div>
                                            <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{art.title}</h4>
                                            <div className="text-[8px] font-bold text-zinc-400 uppercase mt-2">{art.publish_date}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-20 text-center text-zinc-300 font-black uppercase text-[10px] tracking-widest italic">
                                        Belum ada konten berita baru hari ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTab;
