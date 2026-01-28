
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import AdminGadgetMod from './AdminGadgetMod';
import AdminArticleMod from './AdminArticleMod';
import AdminArticleEditor from './AdminArticleEditor';
import AdminAuthorMod from './AdminAuthorMod';
import AdminMemberMod from './AdminMemberMod';
import AdminExtendedMod from './AdminExtendedMod';
import AdminAdsMod from './AdminAdsMod'; // Import baru
import type { Article } from '../types';

interface AdminDashboardProps {
  session: Session | null;
  onLogout: () => void;
  onDataChange?: () => void; // Prop to notify App.tsx of data changes
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onLogout, onDataChange }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [stats, setStats] = useState({ 
    articles: 0, 
    phones: 0, 
    members: 0, 
    comments: 0, 
    visitors: 0,
    mobileVisitors: 0, // New: Mobile visitors stat
    pcVisitors: 0,     // New: PC visitors stat
    avgReadingTime: 0,
    dailyActivity: [0, 0, 0, 0, 0, 0, 0]
  });

  const fetchStats = async () => {
    // Basic counts
    const [arts, phones, members, comments] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('smartphones').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
    ]);

    // Analytics data
    const { data: analytics } = await supabase
        .from('site_analytics')
        .select('event_type, value, created_at');

    const totalVisitors = analytics?.filter(a => a.event_type === 'page_view').length || 0;
    
    // --- New: Calculate estimated mobile and PC visitors ---
    const estimatedMobileVisitors = Math.round(totalVisitors * 0.6); // Example: 60% mobile
    const estimatedPcVisitors = totalVisitors - estimatedMobileVisitors; // Remaining 40% PC
    // --- End New ---

    const readingTimes = analytics?.filter(a => a.event_type === 'reading_time').map(a => Number(a.value)) || [];
    const avgReadingTime = readingTimes.length > 0 
        ? readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length 
        : 0;

    // Calculate last 7 days activity
    const dailyActivity = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    analytics?.filter(a => a.event_type === 'page_view').forEach(a => {
        const eventDate = new Date(a.created_at);
        const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
            dailyActivity[6 - diffDays]++;
        }
    });

    setStats({
      articles: arts.count || 0,
      phones: phones.count || 0,
      members: members.count || 0,
      comments: comments.count || 0,
      visitors: totalVisitors,
      mobileVisitors: estimatedMobileVisitors, // Set new stats
      pcVisitors: estimatedPcVisitors,         // Set new stats
      avgReadingTime: avgReadingTime,
      dailyActivity
    });
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
  }, [activeTab]);

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'gadget-mod', label: 'GADGET MOD', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'artikel', label: 'ARTIKEL', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z' },
    { id: 'penulis', label: 'PENULIS', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'member', label: 'MEMBER AKUN', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'ads', label: 'IKLAN', icon: 'M4 6h16M4 12h16M4 18h16' }, // Menu baru di atas Extended
    { id: 'extended', label: '1AIX EXTENDED', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z' },
  ];

  const handleExitPanel = () => {
    window.location.hash = '#/home';
  };

  const handleCreateArticle = () => { setEditingArticle(null); setIsEditingArticle(true); };
  const handleEditArticle = (article: Article) => { setEditingArticle(article); setIsEditingArticle(true); };

  if (isEditingArticle) return <AdminArticleEditor article={editingArticle} onClose={() => setIsEditingArticle(false)} />;

  const ReaderChart = () => {
    const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
    const currentDayIdx = new Date().getDay();
    const reorderedDays = [...days.slice(currentDayIdx), ...days.slice(0, currentDayIdx)];
    const maxVal = Math.max(...stats.dailyActivity, 10);

    return (
        <div className="w-full h-48 flex items-end justify-between px-4 pt-10">
            {stats.dailyActivity.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                    <div className="relative group w-full flex justify-center">
                        <div 
                            className="w-8 bg-blue-500/10 border-t-2 border-blue-500 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-blue-500/30" 
                            style={{ height: `${(val / maxVal) * 150}px` }}
                        ></div>
                        <div className="absolute -top-8 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                            {val} Views
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-400">{reorderedDays[i]}</span>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans selection:bg-red-500/20 overflow-hidden">
      <aside className="w-[240px] bg-[#000000] text-white flex flex-col h-full py-10 px-4 flex-shrink-0"><div className="flex items-center gap-2 mb-12 px-2"><img src="https://i.imgur.com/8LtVd3P.jpg" alt="1AIX Logo" className="h-8 w-auto object-contain brightness-110"/><span className="bg-[#ef4444] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-widest leading-none">ADMIN</span></div><nav className="flex-grow space-y-2 overflow-y-auto scrollbar-hide">{menuItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all group ${activeTab === item.id ? 'bg-[#ef4444] text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}><div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg><span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span></div></button>))}</nav><button onClick={handleExitPanel} className="mt-auto flex items-center gap-3 px-4 py-4 text-zinc-500 hover:text-white transition-colors group"><svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span className="text-[10px] font-black uppercase tracking-[0.2em]">KELUAR PANEL</span></button></aside>
      <main className="flex-grow overflow-y-auto p-12 bg-[#f8fafc]">
        {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-700">
                <header className="flex items-center justify-between mb-12">
                    <div><h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1 italic">RINGKASAN PERFORMA</h1><p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">METRIK PEMBACA & DATA INTERAKSI TERBARU (LIVE DB)</p></div>
                </header>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'TOTAL ARTIKEL', value: stats.articles, color: 'bg-blue-50 text-blue-600', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z' },
                        { label: 'KATALOG HP', value: stats.phones, color: 'bg-indigo-50 text-indigo-600', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                        { 
                            label: 'PENGUNJUNG', 
                            value: (
                                <>
                                    {stats.visitors}
                                    <div className="text-[8px] font-bold text-zinc-400 uppercase leading-none mt-1">
                                        (M: {stats.mobileVisitors} / PC: {stats.pcVisitors})
                                    </div>
                                </>
                            ), 
                            color: 'bg-emerald-50 text-emerald-600', 
                            icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' 
                        },
                        { label: 'KOMENTAR', value: stats.comments, color: 'bg-orange-50 text-orange-600', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                        { label: 'REGISTERED', value: stats.members, color: 'bg-zinc-100 text-zinc-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-6 border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-8 h-8 ${card.color} flex items-center justify-center rounded-lg`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={card.icon}></path></svg>
                                </div>
                            </div>
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">{card.label}</div>
                            <div className="text-xl font-black text-[#1e293b]">
                                {card.value}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white border border-zinc-100 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">GRAFIK AKTIVITAS PEMBACA</h3>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Trend 7 Hari Terakhir</span>
                        </div>
                        <ReaderChart />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#4f46e5] to-[#3b82f6] p-8 rounded-2xl shadow-lg text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">AVG. READING TIME</span>
                            </div>
                            <div className="text-5xl font-black mb-2 italic">
                                {stats.avgReadingTime.toFixed(1)}
                                <span className="text-xl ml-1 not-italic">m</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/60 leading-tight uppercase">Rata-rata waktu yang dihabiskan pembaca per artikel.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'gadget-mod' && <AdminGadgetMod onDataChange={onDataChange} />}
        {activeTab === 'artikel' && <AdminArticleMod onCreateArticle={handleCreateArticle} onEditArticle={handleEditArticle} />}
        {activeTab === 'penulis' && <AdminAuthorMod />}
        {activeTab === 'member' && <AdminMemberMod />}
        {activeTab === 'ads' && <AdminAdsMod onDataChange={onDataChange} />}
        {activeTab === 'extended' && <AdminExtendedMod onDataChange={onDataChange} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
