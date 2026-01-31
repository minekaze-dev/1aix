import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Article, Author } from '../types';
import { supabase } from '../lib/supabase';

interface AdminArticleEditorProps {
  article: Article | null;
  onClose: () => void;
}

const AdminArticleEditor: React.FC<AdminArticleEditorProps> = ({ article, onClose }) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    cover_image_url: '',
    tags: '',
    permalink: '/news/',
    publish_date: new Date().toISOString().split('T')[0],
    summary: '',
    content: '',
    categories: [],
    author_name: 'Redaksi 1AIX',
    author_id: null,
    status: 'DRAFT',
    ...article
  });

  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const fetchCats = () => {
        const localCats = localStorage.getItem('1AIX_LOCAL_CATEGORIES');
        if (localCats) {
            setDynamicCategories(JSON.parse(localCats));
        } else {
            setDynamicCategories(["REVIEW", "NEWS", "LEAK", "GAMING", "UPDATE", "UNBOXING", "EVENT"]);
        }
    };
    
    const fetchAuthors = async () => {
        const { data, error } = await supabase.from('authors').select('*');
        if (error) {
            console.error("Error fetching authors:", error);
        } else {
            setAuthors(data || []);
        }
    };

    fetchCats();
    fetchAuthors();
  }, []);

  const pushHistory = useCallback((newContent: string) => {
    setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        const next = [...sliced, newContent];
        if (next.length > 50) next.shift();
        return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
        const prevContent = history[historyIndex - 1];
        setFormData(prev => ({ ...prev, content: prevContent }));
        setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history]);

  const insertText = useCallback((type: string, param?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const selection = text.substring(start, end) || 'Teks Anda';
      
      let newContent = "";
      switch(type) {
        case 'B': newContent = `${before}**${selection}**${after}`; break;
        case 'I': newContent = `${before}_${selection}_${after}`; break;
        case 'QUOTE': 
            newContent = `${before}${before.endsWith('\n') || before === '' ? '' : '\n'}> ${selection}${after.startsWith('\n') ? '' : '\n'}${after}`;
            break;
        case 'UL': newContent = `${before}\n- ${selection}${after}`; break;
        case 'OL': newContent = `${before}\n1. ${selection}${after}`; break;
        case 'IMAGE': newContent = `${before}\n![Deskripsi Gambar](URL_GAMBAR)\n${after}`; break;
        case 'LINK': newContent = `${before}[${selection}](URL_ANDA_DI_SINI)${after}`; break;
        case 'LEFT': newContent = `${before}\n<div align="left">\n${selection}\n</div>\n${after}`; break;
        case 'CENTER': newContent = `${before}\n<div align="center">\n${selection}\n</div>\n${after}`; break;
        case 'RIGHT': newContent = `${before}\n<div align="right">\n${selection}\n</div>\n${after}`; break;
        case 'JUSTIFY': newContent = `${before}\n<div align="justify">\n${selection}\n</div>\n${after}`; break;
        case 'H': newContent = `${before}\n## ${selection}${after}`; break;
        default: return;
      }

      setFormData(prev => ({ ...prev, content: newContent }));
      pushHistory(newContent);
      setTimeout(() => { 
        textarea.focus(); 
        const newPos = start + (newContent.length - before.length - after.length);
        textarea.setSelectionRange(newPos, newPos); 
      }, 0);
  }, [pushHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            handleUndo();
        } else if (e.key === 'b' || e.key === 'B') {
            e.preventDefault();
            insertText('B');
        } else if (e.key === 'i' || e.key === 'I') {
            e.preventDefault();
            insertText('I');
        }
    }
  };

  useEffect(() => { if (history.length === 0) { setHistory([formData.content || '']); setHistoryIndex(0); } }, []);
  
  useEffect(() => {
    if (formData.title && !article) {
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, permalink: `/news/${slug}` }));
    }
  }, [formData.title, article]);

  const toggleCategory = (cat: string) => {
    const current = formData.categories || [];
    const updated = current.includes(cat as any) 
        ? current.filter(c => c !== cat) 
        : [...current, cat];
    setFormData(prev => ({ ...prev, categories: updated as any }));
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title) { alert("Judul wajib diisi!"); return; }
    setIsSaving(true);
    
    try {
        const payload = { 
          ...formData, 
          status,
          author_id: formData.author_id === '' ? null : formData.author_id 
        };
        
        if (article?.id) {
            const { error } = await supabase.from('articles').update(payload).eq('id', article.id);
            if (error) throw error;
        } else {
            const { id, ...newPayload } = payload;
            const { error } = await supabase.from('articles').insert([newPayload]);
            if (error) throw error;
        }
        alert(status === 'PUBLISHED' ? 'Artikel berhasil diterbitkan!' : 'Draft berhasil disimpan!');
        onClose();
    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan data ke database.");
    } finally {
        setIsSaving(false);
    }
  };

  const encodeUrlForHref = (url: string): string => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = url;
      let rawUrl = tempDiv.textContent || tempDiv.innerText || url;
      let encoded = encodeURIComponent(rawUrl);
      encoded = encoded.replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&').replace(/%23/g, '#');
      return encoded;
  };

  const renderContent = (content: string) => {
      if (!content) return '<p class="text-zinc-400 italic">Pratinjau konten Anda akan muncul di sini...</p>';
      
      let processedContent = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      processedContent = processedContent
          .replace(/&lt;div align="(.*?)"&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div style="text-align: $1">$2</div>')
          .replace(/&lt;span style="(.*?)"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span style="$1">$2</span>');

      processedContent = processedContent
          .replace(/!\[(.*?)\]\s?\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-6 rounded shadow-lg block h-auto" />');

      processedContent = processedContent.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
          const safeUrl = encodeUrlForHref(url);
          return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      });

      processedContent = processedContent
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>');

      processedContent = processedContent
          .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
          .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$1</h2>')
          .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500 my-4">$1</blockquote>')
          .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
          .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
          .replace(/\n/g, '<br/>');
          
      return processedContent;
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      <header className="h-16 bg-white border-b border-zinc-200 px-4 lg:px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 lg:gap-6">
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 truncate">REDAKSI ARTIKEL</h2>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
             <button onClick={() => handleSave('DRAFT')} disabled={isSaving} className="text-zinc-500 hover:text-zinc-900 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50">DRAFT</button>
             <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="bg-[#ef4444] hover:bg-red-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-sm text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 lg:gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50">PUBLISH</button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-[50%] h-[60%] lg:h-full bg-[#f4f7f9] border-b lg:border-b-0 lg:border-r border-zinc-200 overflow-y-auto p-4 lg:p-12 scrollbar-hide">
             <div className="max-w-[700px] mx-auto space-y-6 lg:space-y-8 pb-32">
                
                {/* Form Section Utama */}
                <div className="bg-white p-6 lg:p-10 rounded-xl shadow-sm border border-zinc-100 space-y-8">
                    <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block">JUDUL ARTIKEL</label>
                        <input type="text" placeholder="Ketik Judul Berita..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-xl lg:text-3xl font-black uppercase tracking-tighter text-zinc-900 border-b border-zinc-100 pb-3 outline-none placeholder:text-zinc-200 bg-transparent"/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                        <div>
                            <label className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">COVER IMAGE URL</label>
                            <input type="text" placeholder="https://..." value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-[10px] lg:text-[11px] font-bold outline-none focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">PENULIS (AUTHOR)</label>
                            <select value={formData.author_id || ''} onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedAuthor = authors.find(auth => auth.id === selectedId);
                                    setFormData(prev => ({ ...prev, author_id: selectedId === '' ? null : selectedId, author_name: selectedId === '' ? 'Redaksi 1AIX' : selectedAuthor?.name || 'Redaksi 1AIX' }));
                                }} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-[10px] lg:text-[11px] font-black uppercase outline-none focus:border-blue-500">
                                <option value="">REDAKSI 1AIX</option>
                                {authors.map(auth => (
                                    <option key={auth.id} value={auth.id}>{auth.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">TANGGAL PUBLIKASI</label>
                            <input type="date" value={formData.publish_date} onChange={(e) => setFormData({...formData, publish_date: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-[10px] lg:text-[11px] font-black outline-none focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">HASHTAGS (TAGS)</label>
                            <input type="text" placeholder="#SAMSUNG #GADGET" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value.toUpperCase()})} className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded text-[10px] lg:text-[11px] font-black outline-none focus:border-blue-500"/>
                        </div>
                    </div>
                </div>

                {/* Kategori Section */}
                <div className="bg-white p-6 lg:p-10 rounded-xl shadow-sm border border-zinc-100">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 block">KATEGORI ARTIKEL</label>
                    <div className="flex flex-wrap gap-3">
                        {dynamicCategories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => toggleCategory(cat)}
                                className={`px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all ${formData.categories?.includes(cat as any) ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 lg:p-10 rounded-xl shadow-sm border border-zinc-100">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 block">RINGKASAN (SUMMARY)</label>
                    <textarea 
                        rows={3} 
                        placeholder="Ketik ringkasan singkat berita..." 
                        value={formData.summary} 
                        onChange={(e) => setFormData({...formData, summary: e.target.value})} 
                        className="w-full bg-[#f8fafc] border border-zinc-100 p-6 rounded text-sm font-bold outline-none focus:border-blue-500 resize-none"
                    />
                </div>

                {/* Editor Content Utama */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-md flex flex-col">
                    <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                        <button onClick={() => insertText('B')} title="Bold" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 font-bold text-xs">B</button>
                        <button onClick={() => insertText('I')} title="Italic" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 italic font-serif text-xs">I</button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('UL')} title="Bullet List" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('OL')} title="Numbered List" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 font-black text-[10px]">1.</button>
                        <button onClick={() => insertText('QUOTE')} title="Quote" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H17.017C15.9124 14 15.017 13.1046 15.017 12V10C15.017 8.89543 15.9124 8 17.017 8H19.017C20.1216 8 21.017 8.89543 21.017 10V16.017C21.017 18.7784 18.7784 21 16.017 21H14.017ZM3.01701 21L3.01701 18C3.01701 16.8954 3.91244 16 5.01701 16H8.01701V14H6.01701C4.91244 14 4.01701 13.1046 4.01701 12V10C4.01701 8.89543 4.91244 8 6.01701 8H8.01701C9.12158 8 10.017 8.89543 10.017 10V16.017C10.017 18.7784 7.77844 21 5.01701 21H3.01701Z"></path></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('LEFT')} title="Rata Kiri" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('CENTER')} title="Rata Tengah" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('RIGHT')} title="Rata Kanan" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('JUSTIFY')} title="Justify" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('IMAGE')} title="Tambah Gambar" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button>
                        <button onClick={() => insertText('LINK')} title="Tambah Link" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.795-1.795m11.524-1.524a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path></svg></button>
                    </div>
                    <textarea ref={textareaRef} rows={12} placeholder="Tulis konten berita Anda di sini..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} onKeyDown={handleKeyDown} className="w-full p-6 lg:p-12 outline-none text-zinc-800 text-xs lg:text-sm leading-relaxed scrollbar-hide bg-white min-h-[400px] lg:min-h-[600px]"/>
                </div>
             </div>
        </div>

        {/* Live Preview Panel */}
        <div className="w-full lg:flex-1 h-[40%] lg:h-full bg-white overflow-y-auto p-6 lg:p-16 scrollbar-hide flex items-start justify-center shadow-inner border-t lg:border-t-0 lg:border-l border-zinc-100">
            <div className="w-full max-w-[700px] pb-40">
                <div className="pb-12">
                    <h1 className="text-2xl lg:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic break-words">{formData.title || 'JUDUL BERITA'}</h1>
                    
                    {/* Live Preview Cover Image */}
                    {formData.cover_image_url && (
                        <div className="w-full h-48 lg:h-80 overflow-hidden rounded-sm mb-10 shadow-lg border border-zinc-100">
                            <img src={formData.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="prose prose-zinc max-w-none">
                        <div className="text-zinc-800 text-sm lg:text-base leading-loose whitespace-pre-wrap article-preview-body" dangerouslySetInnerHTML={{ __html: renderContent(formData.content || '') }} />
                    </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .article-preview-body strong { font-weight: 900; color: #111; }
        .article-preview-body em { font-style: italic; color: #444; }
        .article-preview-body blockquote { font-size: 1.1em; color: #666; border-left: 4px solid #ef4444; padding-left: 1.5rem; margin: 2rem 0; font-style: italic; }
        .article-preview-body img { margin: 2.5rem 0; display: block; max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .article-preview-body a { color: #3b82f6; text-decoration: underline; }
        .article-preview-body li { margin-left: 1.5rem; display: list-item; }
      `}</style>
    </div>
  );
};

export default AdminArticleEditor;