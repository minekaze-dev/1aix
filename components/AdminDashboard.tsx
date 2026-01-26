
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import AdminGadgetMod from './AdminGadgetMod';
import AdminArticleMod from './AdminArticleMod';
import AdminArticleEditor from './AdminArticleEditor';
import AdminAuthorMod from './AdminAuthorMod';
import AdminMemberMod from './AdminMemberMod';
import AdminExtendedMod from './AdminExtendedMod';
import type { Article } from '../types';

interface AdminDashboardProps {
  session: Session | null;
  onLogout: () => void;
  onDataChange?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onLogout, onDataChange }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'gadget-mod', label: 'GADGET MOD', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'artikel', label: 'ARTIKEL', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z' },
    { id: 'penulis', label: 'PENULIS', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'member', label: 'MEMBER AKUN', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'iklan', label: 'IKLAN', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { id: 'extended', label: '1AIX EXTENDED', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setIsEditingArticle(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditingArticle(true);
  };

  const handleCloseEditor = () => {
    setIsEditingArticle(false);
    setEditingArticle(null);
  };

  if (isEditingArticle) {
    return <AdminArticleEditor article={editingArticle} onClose={handleCloseEditor} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans selection:bg-red-500/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#000000] text-white flex flex-col h-full py-10 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-12 px-2">
           <img 
                src="https://i.imgur.com/8LtVd3P.jpg" 
                alt="1AIX Logo" 
                className="h-8 w-auto object-contain brightness-110"
            />
            <span className="bg-[#ef4444] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-widest leading-none">ADMIN</span>
        </div>

        <nav className="flex-grow space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all group ${
                activeTab === item.id ? 'bg-[#ef4444] text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 px-4 py-4 text-zinc-500 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">KELUAR PANEL</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-12 bg-[#f8fafc]">
        {activeTab === 'dashboard' && (
          <>
            <header className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">RINGKASAN PERFORMA</h1>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">METRIK PEMBACA & DATA KATALOG TERBARU</p>
              </div>
              <div className="flex bg-white border border-zinc-100 rounded-lg p-1 shadow-sm">
                {['DAILY', 'WEEKLY', 'MONTHLY'].map((period) => (
                  <button
                    key={period}
                    className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                      period === 'WEEKLY' ? 'bg-[#4f46e5] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </header>

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-6 mb-12">
              {[
                { label: 'TOTAL ARTIKEL', value: '0', color: 'bg-blue-100 text-blue-600', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z' },
                { label: 'KATALOG HP', value: '4', color: 'bg-indigo-100 text-indigo-600', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                { label: 'AKUN MEMBER', value: '2', color: 'bg-purple-100 text-purple-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { label: 'LIVE MONITOR', value: '0', color: 'bg-emerald-100 text-emerald-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 border border-zinc-100 rounded-2xl shadow-sm relative group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 ${card.color} flex items-center justify-center rounded-xl shadow-inner`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}></path>
                        </svg>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        <span className="text-[10px] font-black uppercase">+0%</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{card.label}</div>
                  <div className="text-4xl font-black text-[#1e293b]">{card.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'gadget-mod' && (
          <AdminGadgetMod onDataChange={onDataChange} />
        )}

        {activeTab === 'artikel' && (
          <AdminArticleMod onCreateArticle={handleCreateArticle} onEditArticle={handleEditArticle} />
        )}

        {activeTab === 'penulis' && (
          <AdminAuthorMod />
        )}

        {activeTab === 'member' && (
          <AdminMemberMod />
        )}

        {activeTab === 'extended' && (
          <AdminExtendedMod />
        )}

        {activeTab !== 'dashboard' && activeTab !== 'gadget-mod' && activeTab !== 'artikel' && activeTab !== 'penulis' && activeTab !== 'member' && activeTab !== 'extended' && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-zinc-500 uppercase tracking-[0.5em] font-black">
            MODUL {activeTab} SEGERA HADIR
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
