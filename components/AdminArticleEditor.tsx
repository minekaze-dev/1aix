
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Article } from '../types';

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
    status: 'DRAFT',
    ...article
  });

  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const localCats = localStorage.getItem('1AIX_LOCAL_CATEGORIES');
    if (localCats) {
      setDynamicCategories(JSON.parse(localCats));
    } else {
      setDynamicCategories(["REVIEW", "NEWS", "LEAK", "GAMING", "UPDATE", "UNBOXING", "EVENT"]);
    }
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
        case 'QUOTE': newContent = `${before}\n> ${selection}${after}`; break;
        case 'UL': newContent = `${before}\n- ${selection}${after}`; break;
        case 'OL': newContent = `${before}\n1. ${selection}${after}`; break;
        case 'H': newContent = `${before}\n## ${selection}${after}`; break;
        case 'IMAGE': newContent = `${before}![Deskripsi Gambar](URL_GAMBAR)${after}`; break;
        case 'LEFT': newContent = `${before}<div align="left">${selection}</div>${after}`; break;
        case 'CENTER': newContent = `${before}<div align="center">${selection}</div>${after}`; break;
        case 'RIGHT': newContent = `${before}<div align="right">${selection}</div>${after}`; break;
        case 'JUSTIFY': newContent = `${before}<div align="justify">${selection}</div>${after}`; break;
        case 'SIZE': newContent = `${before}<span style="font-size: ${param}">${selection}</span>${after}`; break;
        default: return;
      }

      setFormData(prev => ({ ...prev, content: newContent }));
      pushHistory(newContent);
      
      setTimeout(() => {
        textarea.focus();
        if (selection !== 'Teks Anda') {
            textarea.setSelectionRange(start, start + newContent.length - before.length - after.length);
        }
      }, 0);
  }, [pushHistory]);

  useEffect(() => {
    if (history.length === 0) {
        setHistory([formData.content || '']);
        setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.key === 'b') {
                e.preventDefault();
                insertText('B');
            } else if (e.key === 'i') {
                e.preventDefault();
                insertText('I');
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, insertText]);

  useEffect(() => {
    if (formData.title && !article) {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, permalink: `/news/${slug}` }));
    }
  }, [formData.title, article]);

  const handleTagsChange = (val: string) => {
    const words = val.split(/\s+/);
    const formatted = words.map(w => {
        if (!w) return '';
        if (w.startsWith('#')) return w.replace(/#+/g, '#');
        return '#' + w;
    }).join(' ');
    setFormData({ ...formData, tags: formatted });
  };

  const handleSave = (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title) {
        alert("Judul wajib diisi!");
        return;
    }
    setIsSaving(true);
    const newArticle = {
        ...formData,
        id: article?.id || `art-${Date.now()}`,
        status: status,
        created_at: article?.created_at || new Date().toISOString()
    } as Article;

    const localArticles = localStorage.getItem('1AIX_LOCAL_ARTICLES');
    let articles: Article[] = localArticles ? JSON.parse(localArticles) : [];
    
    if (article) {
        articles = articles.map(a => a.id === article.id ? newArticle : a);
    } else {
        articles.unshift(newArticle);
    }

    localStorage.setItem('1AIX_LOCAL_ARTICLES', JSON.stringify(articles));
    
    setTimeout(() => {
        setIsSaving(false);
        alert(status === 'PUBLISHED' ? 'Artikel berhasil diterbitkan!' : 'Draft berhasil disimpan!');
        onClose();
    }, 800);
  };

  const renderContent = (content: string) => {
      if (!content) return 'Mulailah mengetik isi berita Anda...';
      
      return content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&lt;div align="(.*?)"&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div style="text-align: $1">$2</div>')
          .replace(/&lt;span style="(.*?)"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span style="$1">$2</span>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>')
          .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
          .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$1</h2>')
          .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500">$1</blockquote>')
          .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
          .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-4 rounded shadow-lg" />');
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900">TULIS ARTIKEL</h2>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={() => handleSave('DRAFT')} disabled={isSaving} className="text-zinc-500 hover:text-zinc-900 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50">SIMPAN DRAFT</button>
             <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="bg-[#ef4444] hover:bg-red-600 text-white px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50">TERBITKAN SEKARANG</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Form (Left) */}
        <div className="w-[50%] bg-[#f4f7f9] border-r border-zinc-200 overflow-y-auto p-12 scrollbar-hide">
             <div className="max-w-[600px] mx-auto space-y-8">
                {/* Title */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
                    <label className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-4 block">JUDUL ARTIKEL</label>
                    <input type="text" placeholder="Ketik Judul Berita Disini..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-3xl font-black uppercase tracking-tighter text-zinc-900 border-none outline-none placeholder:text-zinc-200 bg-transparent"/>
                </div>

                {/* Permalink */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 block">PERMALINK / URL SLUG</label>
                    <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-sm border border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400">1AIX.COM</span>
                      <input 
                          type="text" 
                          placeholder="/news/judul-berita" 
                          value={formData.permalink} 
                          onChange={(e) => setFormData({...formData, permalink: e.target.value})} 
                          className="flex-1 bg-transparent text-[11px] font-black text-zinc-800 outline-none uppercase tracking-widest"
                      />
                    </div>
                </div>

                {/* Summary Field */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">RINGKASAN (SUMMARY)</label>
                    <textarea 
                        rows={3} 
                        placeholder="Ketik ringkasan singkat berita..." 
                        value={formData.summary} 
                        onChange={(e) => setFormData({...formData, summary: e.target.value})} 
                        className="w-full text-sm font-bold text-zinc-600 border-none outline-none placeholder:text-zinc-200 bg-transparent resize-none leading-relaxed"
                    />
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-4">COVER IMAGE URL</span>
                        <input type="url" placeholder="https://..." value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded text-[11px] font-bold text-zinc-700 outline-none focus:border-blue-500 transition-colors"/>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-4">HASHTAG TAGS</span>
                        <input type="text" placeholder="#gadget #review" value={formData.tags} onChange={(e) => handleTagsChange(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded text-[11px] font-bold text-zinc-700 outline-none focus:border-blue-500 transition-colors"/>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-4">TANGGAL TAYANG</span>
                        <input type="date" value={formData.publish_date} onChange={(e) => setFormData({...formData, publish_date: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded text-[11px] font-bold text-zinc-700 outline-none focus:border-blue-500 transition-colors"/>
                    </div>
                </div>

                {/* Multi Category */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-4">PILIH KATEGORI (BISA MULTI)</span>
                    <div className="flex flex-wrap gap-2">
                        {dynamicCategories.map(cat => {
                            const isActive = (formData.categories || []).includes(cat as any);
                            return (
                                <button key={cat} onClick={() => {
                                    const current = formData.categories || [];
                                    setFormData({ ...formData, categories: current.includes(cat as any) ? current.filter(c => c !== cat) : [...current, cat as any] });
                                }} className={`px-4 py-2 border rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900'}`}>{cat}</button>
                            );
                        })}
                    </div>
                </div>

                {/* Toolbar & Writing Area */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-md flex flex-col">
                    <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                        <button onClick={() => insertText('B')} title="Bold (Ctrl+B)" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 font-bold">B</button>
                        <button onClick={() => insertText('I')} title="Italic (Ctrl+I)" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 italic font-serif">I</button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('LEFT')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"></path></svg></button>
                        <button onClick={() => insertText('CENTER')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16"></path></svg></button>
                        <button onClick={() => insertText('RIGHT')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M4 18h16"></path></svg></button>
                        <button onClick={() => insertText('JUSTIFY')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('QUOTE')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 font-serif font-black text-xl">"</button>
                        <button onClick={() => insertText('UL')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"></path></svg></button>
                        <button onClick={() => insertText('OL')} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 6h10M10 12h10M10 18h10M4 6h1v4m-1 0h2m-2 4h2a1 1 0 011 1v1a1 1 0 01-1 1H4v1h2"></path></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <select onChange={(e) => insertText('SIZE', e.target.value)} className="h-9 px-2 bg-transparent text-[10px] font-black uppercase outline-none text-zinc-500 cursor-pointer hover:text-zinc-900">
                            <option value="">SIZE</option>
                            <option value="12px">12PX</option>
                            <option value="16px">16PX</option>
                            <option value="20px">20PX</option>
                            <option value="24px">24PX</option>
                            <option value="32px">32PX</option>
                        </select>
                        <button onClick={handleUndo} className="ml-auto w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-400 hover:text-zinc-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5"></path></svg></button>
                    </div>
                    <textarea ref={textareaRef} rows={20} placeholder="Tulis narasi berita Anda disini..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') pushHistory(formData.content || ''); }} className="w-full p-10 outline-none text-zinc-800 text-sm leading-relaxed scrollbar-hide bg-white min-h-[500px]"/>
                </div>
             </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-[#ffffff] overflow-y-auto p-12 scrollbar-hide flex items-start justify-center shadow-inner">
            <div className="w-full max-w-[700px] bg-white">
                <div className="pb-12 border-b border-zinc-100">
                    <div className="flex gap-1 mb-6">
                        {(formData.categories || []).map(cat => <span key={cat} className="text-[9px] font-black text-red-600 border border-red-600 px-2 py-0.5 rounded-sm uppercase tracking-widest">{cat}</span>)}
                    </div>
                    <h1 className="text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic break-words">{formData.title || 'JUDUL BERITA'}</h1>
                    <div className="flex flex-wrap gap-2 mb-10">
                        {formData.tags?.split(' ').map(tag => tag.trim() && <span key={tag} className="text-[10px] font-black text-blue-600">{tag}</span>)}
                    </div>
                    <div className="space-y-8">
                        {formData.cover_image_url && <div className="aspect-video overflow-hidden rounded shadow-2xl"><img src={formData.cover_image_url} className="w-full h-full object-cover" /></div>}
                        <div className="prose prose-zinc max-w-none">
                            <div className="text-zinc-400 font-bold leading-relaxed italic border-l-4 border-red-600 pl-6 py-2 bg-zinc-50 rounded-r mb-8">{formData.summary || 'Summary akan muncul di sini...'}</div>
                            <div className="text-zinc-800 text-base leading-loose whitespace-pre-wrap article-preview-body" dangerouslySetInnerHTML={{ __html: renderContent(formData.content || '') }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .article-preview-body strong { font-weight: 800; color: #000; }
        .article-preview-body em { font-style: italic; }
        .article-preview-body div[style] { margin: 0.25em 0; }
        .article-preview-body span[style] { display: inline-block; }
        .article-preview-body blockquote { margin: 0.25rem 0; padding-top: 0.125rem; padding-bottom: 0.125rem; }
      `}</style>
    </div>
  );
};

export default AdminArticleEditor;
