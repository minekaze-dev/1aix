
import React, { useState, useEffect } from 'react';

interface Member {
  id: string;
  email: string;
  display_name: string;
  joined_at: string;
  status: 'ACTIVE' | 'BANNED';
}

const AdminMemberMod: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const local = localStorage.getItem('1AIX_LOCAL_USERS');
    if (local) {
      setMembers(JSON.parse(local));
    } else {
        const dummyMembers = [
            { id: 'usr-1', email: 'budi@gmail.com', display_name: 'Budi Santoso', joined_at: '2024-05-10', status: 'ACTIVE' as const },
            { id: 'usr-2', email: 'ani@yahoo.com', display_name: 'Ani Fitriani', joined_at: '2024-05-12', status: 'ACTIVE' as const },
        ];
        setMembers(dummyMembers);
        localStorage.setItem('1AIX_LOCAL_USERS', JSON.stringify(dummyMembers));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm('Hapus akun ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem('1AIX_LOCAL_USERS', JSON.stringify(updated));
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MEMBER AKUN</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">PANTAU PENGGUNA TERDAFTAR & MODERASI AKUN</p>
        </div>
        <div className="bg-white border border-zinc-100 px-6 py-3 rounded-sm shadow-sm flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TOTAL REGISTERED</span>
            <span className="text-xl font-black text-blue-600">{members.length}</span>
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
            {members.map(member => (
              <tr key={member.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:bg-zinc-200">
                            {member.display_name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-black text-zinc-900 uppercase">{member.display_name}</span>
                    </div>
                </td>
                <td className="px-8 py-5 text-[11px] font-black text-zinc-400">{member.email}</td>
                <td className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase">{member.joined_at}</td>
                <td className="px-8 py-5">
                   <span className="text-[8px] font-black px-2 py-1 rounded-sm uppercase bg-emerald-100 text-emerald-600">
                    {member.status}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => handleDelete(member.id)} className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest hover:underline transition-colors">HAPUS PERMANEN</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMemberMod;
