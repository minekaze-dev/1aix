
import React, { useState, useEffect } from 'react';
import type { Author } from '../types';
import { supabase } from '../lib/supabase';

const AdminAuthorMod: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Author>>({
    name: '',
    role: 'AUTHOR',
    email: ''
  });

  const fetchAuthors = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        setAuthors(data || []);
    } catch (err) {
        console.error("Error fetching authors:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
        alert("Nama dan Email wajib diisi!");
        return;
    }
    
    try {
        if (editingId) {
            const { error } = await supabase
                .from('authors')
                .update({ 
                    name: formData.name, 
                    role: formData.role, 
                    email: formData.email 
                })
                .eq('id', editingId);
            if (error) throw error;
            alert("Data penulis berhasil diperbarui.");
        } else {
            const { error } = await supabase
                .from('authors')
                .insert([{ 
                    name: formData.name, 
                    role: formData.role, 
                    email: formData.email 
                }]);
            if (error) throw error;
            alert("Penulis baru berhasil didaftarkan.");
        }
        
        fetchAuthors();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', role: 'AUTHOR', email: '' });
    } catch (err: any) {
        console.error("Save error:", err);
        alert("Gagal menyimpan data: " + (err.message || "Email mungkin sudah terdaftar."));
    }
  };

  const handleEdit = (author: Author) => {
    setFormData({ name: author.name, role: author.role, email: author.email });
    setEditingId(author.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus penulis ini secara permanen dari database?')) return;
    try {
        const { error } = await supabase.from('authors').delete().eq('id', id);
        if (error) throw error;
        setAuthors(authors.filter(a => a.id !== id));
        alert("Penulis telah dihapus.");
    } catch (err) {
        console.error("Delete error:", err);
        alert("Gagal menghapus penulis.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight mb-1">MANAJEMEN PENULIS</h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">KELOLA TIM REDAKSI & HAK AKSES (DATABASE LIVE)</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', role: 'AUTHOR', email: '' }); }}
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
            {loading ? (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center animate-pulse">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Memuat Data Penulis...</span>
                    </td>
                </tr>
            ) : authors.length > 0 ? authors.map(author => (
              <tr key={author.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5 text-[11px] font-black text-zinc-900 uppercase">{author.name}</td>
                <td className="px-8 py-5 text-[11px] font-black text-zinc-400">{author.email}</td>
                <td className="px-8 py-5">
                   <span className={`text-[8px] font-black px-2 py-1 rounded-sm uppercase ${author.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {author.role}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(author)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                    <button onClick={() => handleDelete(author.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Belum ada penulis terdaftar.</span>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-10">
                <h3 className="text-xl font-black text-zinc-800 uppercase tracking-tighter mb-8">{editingId ? 'EDIT PENULIS' : 'TAMBAH PENULIS BARU'}</h3>
                <div className="space-y-6">
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">NAMA LENGKAP</span>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-red-500" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">EMAIL AKTIF</span>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-sm text-sm font-black outline-none focus:border-red-500" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">HAK AKSES (ROLE)</span>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'ADMIN' | 'AUTHOR'})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-sm text-sm font-black uppercase outline-none focus:border-red-500">
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </label>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setShowForm(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase rounded-sm">BATAL</button>
                        <button onClick={handleSave} className="flex-1 py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-sm shadow-lg shadow-red-500/20">{editingId ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN'}</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthorMod;
