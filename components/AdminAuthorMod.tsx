
import React, { useState, useEffect } from 'react';

interface Author {
  id: string;
  name: string;
  role: 'ADMIN' | 'AUTHOR';
  email: string;
  created_at: string;
}

const AdminAuthorMod: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<Author>>({
    name: '',
    role: 'AUTHOR',
    email: ''
  });

  useEffect(() => {
    const local = localStorage.getItem('1AIX_LOCAL_AUTHORS');
    if (local) {
      setAuthors(JSON.parse(local));
    } else {
        const initial = [{ id: '1', name: 'Redaksi 1AIX', role: 'ADMIN' as const, email: 'redaksi@1aix.com', created_at: new Date().toISOString() }];
        setAuthors(initial);
        localStorage.setItem('1AIX_LOCAL_AUTHORS', JSON.stringify(initial));
    }
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    const newAuthor = {
      ...formData,
      id: `auth-${Date.now()}`,
      created_at: new Date().toISOString()
    } as Author;
    const updated = [newAuthor, ...authors];
    setAuthors(updated);
    localStorage.setItem('1AIX_LOCAL_AUTHORS', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ name: '', role: 'AUTHOR', email: '' });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Hapus penulis ini?')) return;
    const updated = authors.filter(a => a.id !== id);
    setAuthors(updated);
    localStorage.setItem('1AIX_LOCAL_AUTHORS', JSON.stringify(updated));
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN PENULIS</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA TIM REDAKSI & HAK AKSES</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-red-600 transition-all transform active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          TAMBAH PENULIS
        </button>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">NAMA PENULIS</th>
              <th className="px-8 py-5">EMAIL</th>
              <th className="px-8 py-5">ROLE</th>
              <th className="px-8 py-5 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {authors.map(author => (
              <tr key={author.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5 text-[11px] font-black text-zinc-900 uppercase">{author.name}</td>
                <td className="px-8 py-5 text-[11px] font-black text-zinc-400">{author.email}</td>
                <td className="px-8 py-5">
                   <span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${author.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {author.role}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => handleDelete(author.id)} className="p-2 text-zinc-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-10">
                <h3 className="text-xl font-black text-zinc-800 uppercase tracking-tighter mb-8">TAMBAH PENULIS BARU</h3>
                <div className="space-y-6">
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NAMA LENGKAP</span>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-sm font-black uppercase outline-none focus:border-red-500" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">EMAIL AKTIF</span>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-sm font-black outline-none focus:border-red-500" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">HAK AKSES (ROLE)</span>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'ADMIN' | 'AUTHOR'})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-sm font-black uppercase outline-none focus:border-red-500">
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </label>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase rounded">BATAL</button>
                        <button onClick={handleSave} className="flex-1 py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded shadow-lg shadow-red-500/20">DAFTARKAN</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthorMod;
