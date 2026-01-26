
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  is_blocked?: boolean;
}

const AdminMemberMod: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus profil akun ini secara permanen dari database? Tindakan ini tidak bisa dibatalkan.')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update state lokal setelah berhasil hapus di DB
      setMembers(prev => prev.filter(m => m.id !== id));
      alert("Profil pengguna berhasil dihapus.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus profil dari database.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MEMBER AKUN</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">PANTAU PENGGUNA TERDAFTAR & MODERASI AKUN (LIVE DB)</p>
        </div>
        <div className="bg-white border border-zinc-100 px-6 py-3 rounded-sm shadow-sm flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TOTAL REGISTERED</span>
            <span className={`text-xl font-black ${loading ? 'animate-pulse text-zinc-200' : 'text-blue-600'}`}>
                {members.length}
            </span>
        </div>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">NAMA PENGGUNA</th>
              <th className="px-8 py-5">EMAIL</th>
              <th className="px-8 py-5">TGL BERGABUNG</th>
              <th className="px-8 py-5">STATUS</th>
              <th className="px-8 py-5 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center animate-pulse">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Menyingkronkan Data Database...</span>
                    </td>
                </tr>
            ) : members.length > 0 ? (
                members.map(member => (
                  <tr key={member.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">
                                {(member.display_name || 'U').charAt(0)}
                            </div>
                            <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{member.display_name || 'Anonymous User'}</span>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-black text-zinc-400">{member.email || 'Hidden Email'}</td>
                    <td className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase">
                        {member.created_at ? new Date(member.created_at).toISOString().split('T')[0] : '-'}
                    </td>
                    <td className="px-8 py-5">
                       <span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${member.is_blocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {member.is_blocked ? 'BANNED' : 'ACTIVE'}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(member.id)} 
                        className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest hover:underline transition-colors active:scale-95"
                      >
                        HAPUS PERMANEN
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Belum ada member terdaftar di database.</span>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMemberMod;
