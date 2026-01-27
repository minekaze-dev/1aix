
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
    author_name: 'Redaksi 1AIX', // Default fallback name
    author_id: null, // New: Default to null
    status: 'DRAFT',
    ...article
  });

  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<string[]>([]
  );
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
    
    // Fetch authors directly from Supabase, not local storage
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
        if (next.length > 50) next.shift(); // Keep history to max 50 items
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
            const quotedSelection = selection.split('\n').map(line => `> ${line}`).join('\n');
            // Add newlines around the quote for proper block separation if not already there
            newContent = `${before}${before.endsWith('\n') || before === '' ? '' : '\n\n'}${quotedSelection}${after.startsWith('\n') || after === '' ? '' : '\n\n'}${after}`;
            break;
        case 'UL': newContent = `${before}\n- ${selection}${after}`; break;
        case 'OL': newContent = `${before}\n1. ${selection}${after}`; break;
        case 'IMAGE': newContent = `${before}![Deskripsi Gambar](URL_GAMBAR)${after}`; break;
        case 'LINK': newContent = `${before}[${selection}](URL_ANDA_DI_SINI)${after}`; break; // New: Link tool
        case 'LEFT': newContent = `${before}<div align="left">${selection}</div>${after}`; break;
        case 'CENTER': newContent = `${before}<div align="center">${selection}</div>${after}`; break;
        case 'RIGHT': newContent = `${before}<div align="right">${selection}</div>${after}`; break;
        case 'JUSTIFY': newContent = `${before}<div align="justify">${selection}</div>${after}`; break;
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
    if (textareaRef.current) {
        pushHistory(formData.content || '');
    }
  }, [formData.content]); // Track content changes for history

  // Permalink otomatis dari Judul
  useEffect(() => {
    if (formData.title && !article) { // Only auto-generate permalink for new articles
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
    setFormData(prev => ({ ...prev, tags: formatted }));
  };

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
          // Ensure author_id is null if 'Redaksi 1AIX' is selected (empty string value), otherwise use the selected ID
          author_id: formData.author_id === '' ? null : formData.author_id 
        };
        
        if (article?.id) {
            const { error } = await supabase.from('articles').update(payload).eq('id', article.id);
            if (error) throw error;
        } else {
            // When inserting, make sure 'id' is not in payload if it's auto-generated.
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

  // Helper to encode a URL for the href attribute, safely handling HTML special characters.
  const encodeUrlForHref = (url: string): string => {
      // Step 1: Fully HTML-decode the URL string first to revert any &lt;, &gt;, &amp;
      // This handles cases where the URL itself might contain HTML entities from previous escaping.
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = url;
      let rawUrl = tempDiv.textContent || tempDiv.innerText || url;

      // Step 2: Aggressively URI-encode all special characters.
      // This is crucial to prevent any HTML from breaking out of the href attribute.
      // `encodeURIComponent` correctly encodes <, >, &, ", ', space, etc., to %xx.
      let encoded = encodeURIComponent(rawUrl);

      // Step 3: Selectively decode characters that are safe and necessary for URL structure
      // to make the href attribute functional and readable.
      // Importantly, we DO NOT decode %3C (<), %3E (>), %22 ("), %27 ('), etc. here.
      encoded = encoded.replace(/%3A/g, ':')  // :
                       .replace(/%2F/g, '/')  // /
                       .replace(/%3F/g, '?')  // ?
                       .replace(/%3D/g, '=')  // =
                       .replace(/%26/g, '&')  // &
                       .replace(/%23/g, '#'); // #

      return encoded;
  };

  const renderContent = (content: string) => {
      if (!content) return '<p class="text-zinc-400 italic">Pratinjau konten Anda akan muncul di sini...</p>';
      
      // Step 1: Initial HTML escaping for security. This converts all literal < > & to entities.
      let processedContent = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      // Step 2: Handle custom div/span alignments (which rely on raw HTML-like syntax).
      // These specific patterns are parsed before general markdown links.
      processedContent = processedContent
          .replace(/&lt;div align="(.*?)"&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div style="text-align: $1">$2</div>')
          .replace(/&lt;span style="(.*?)"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span style="$1">$2</span>'); // Corrected closing tag from </div> to </span>

      // Step 3: Process markdown links. This must happen before bold/italic to prevent internal formatting in URLs.
      // `linkText` and `url` here are already HTML-escaped from Step 1.
      processedContent = processedContent.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
          const safeUrl = encodeUrlForHref(url); // `encodeUrlForHref` will handle the full HTML-decode and then URI-encode
          return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      });

      // Step 4: Process bold and italic formatting. This happens after link processing.
      processedContent = processedContent
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>');

      // Step 5: Process other markdown elements
      processedContent = processedContent
          .replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: 900; margin: 0.5em 0;">$1</h1>')
          .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: 900; margin: 0.5em 0;">$2</h2>')
          .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-zinc-200 pl-4 italic text-zinc-500 my-4">$1</blockquote>')
          .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
          .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full my-6 rounded shadow-lg" />');
          
      return processedContent;
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900">REDAKSI ARTIKEL</h2>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={() => handleSave('DRAFT')} disabled={isSaving} className="text-zinc-500 hover:text-zinc-900 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50">SIMPAN DRAFT</button>
             <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="bg-[#ef4444] hover:bg-red-600 text-white px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50">TERBITKAN SEKARANG</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Side */}
        <div className="w-[50%] bg-[#f4f7f9] border-r border-zinc-200 overflow-y-auto p-12 scrollbar-hide">
             <div className="max-w-[650px] mx-auto space-y-8 pb-32">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 space-y-6">
                    <div>
                        <label className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-4 block">JUDUL ARTIKEL</label>
                        <input type="text" placeholder="Ketik Judul Berita..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-2xl font-black uppercase tracking-tighter text-zinc-900 border-b border-zinc-100 pb-2 outline-none placeholder:text-zinc-200 bg-transparent"/>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">COVER IMAGE URL</label>
                            <input type="text" placeholder="https://..." value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded text-[11px] font-bold outline-none focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">PENULIS (AUTHOR)</label>
                            <select 
                                value={formData.author_id || ''} // Bind to author_id
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedAuthor = authors.find(auth => auth.id === selectedId);
                                    setFormData(prev => ({
                                        ...prev,
                                        author_id: selectedId === '' ? null : selectedId, // Set to null if 'Redaksi 1AIX' is selected
                                        author_name: selectedId === '' ? 'Redaksi 1AIX' : selectedAuthor?.name || 'Redaksi 1AIX'
                                    }));
                                }} 
                                className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded text-[11px] font-black uppercase outline-none focus:border-blue-500"
                            >
                                <option value="">REDAKSI 1AIX</option> {/* Option for default 'Redaksi 1AIX' without an ID */}
                                {authors.map(auth => (
                                    <option key={auth.id} value={auth.id}>{auth.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">TANGGAL PUBLIKASI</label>
                            <input type="date" value={formData.publish_date} onChange={(e) => setFormData({...formData, publish_date: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded text-[11px] font-bold outline-none focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 block">HASHTAGS (TAGS)</label>
                            <input type="text" placeholder="#SAMSUNG #GADGET" value={formData.tags} onChange={(e) => handleTagsChange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded text-[11px] font-bold outline-none focus:border-blue-500 text-blue-600"/>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block">KATEGORI ARTIKEL</label>
                    <div className="flex flex-wrap gap-2">
                        {dynamicCategories.map(cat => (
                            <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-2 text-[10px] font-black rounded-sm border transition-all ${formData.categories?.includes(cat as any) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">RINGKASAN (SUMMARY)</label>
                    <textarea rows={3} placeholder="Ketik ringkasan singkat berita..." value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} className="w-full text-sm font-bold text-zinc-600 border-none outline-none placeholder:text-zinc-200 bg-transparent resize-none leading-relaxed"/>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-md flex flex-col">
                    <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                        <button onClick={() => insertText('B')} title="Bold (CTRL+B)" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 font-bold">B</button>
                        <button onClick={() => insertText('I')} title="Italic (CTRL+I)" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600 italic font-serif">I</button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('QUOTE')} title="Quote" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h10M7 16h10M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </button>
                        <button onClick={() => insertText('UL')} title="Bullet List" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path><circle cx="2" cy="6" r="1" fill="currentColor"/><circle cx="2" cy="12" r="1" fill="currentColor"/><circle cx="2" cy="18" r="1" fill="currentColor"/></svg></button>
                        <button onClick={() => insertText('OL')} title="Numbered List" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 6h13M7 12h13M7 18h13" strokeWidth="2.5" strokeLinecap="round"></path><text x="0" y="7" fontSize="8" fontWeight="black">1</text><text x="0" y="13" fontSize="8" fontWeight="black">2</text></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('LEFT')} title="Rata Kiri" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('CENTER')} title="Rata Tengah" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <button onClick={() => insertText('RIGHT')} title="Rata Kanan" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M4 18h16" strokeWidth="2.5" strokeLinecap="round"></path></svg></button>
                        <div className="h-5 w-px bg-zinc-200 self-center mx-1"></div>
                        <button onClick={() => insertText('IMAGE')} title="Tambah Gambar" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button>
                        <button onClick={() => insertText('LINK')} title="Tambah Link" className="w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.795-1.795m11.524-1.524a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path></svg>
                        </button>
                        <button onClick={handleUndo} title="Undo (CTRL+Z)" className="ml-auto w-9 h-9 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-400 hover:text-zinc-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></button>
                    </div>
                    <textarea 
                        ref={textareaRef} 
                        rows={20} 
                        placeholder="Tulis konten berita Anda di sini..." 
                        value={formData.content} 
                        onChange={(e) => setFormData({...formData, content: e.target.value})} 
                        onKeyDown={handleKeyDown}
                        className="w-full p-10 outline-none text-zinc-800 text-sm leading-relaxed scrollbar-hide bg-white min-h-[500px]"
                    />
                </div>
             </div>
        </div>

        {/* Live Preview Side */}
        <div className="flex-1 bg-white overflow-y-auto p-12 scrollbar-hide flex items-start justify-center shadow-inner">
            <div className="w-full max-w-[700px] pb-40">
                <div className="pb-12">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(formData.categories || []).map(c => (
                            <span key={c} className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-0.5 uppercase tracking-[0.4em]">{c}</span>
                        ))}
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-6 italic break-words">
                        {formData.title || 'JUDUL BERITA'}
                    </h1>
                    <div className="flex items-center justify-between border-y border-zinc-100 py-3 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">{(formData.author_name || '1').charAt(0)}</div>
                            <div>
                                <div className="text-[10px] font-black uppercase text-zinc-900 leading-none mb-0.5">{formData.author_name || 'Redaksi 1AIX'}</div>
                                <div className="text-[8px] font-bold text-zinc-400 uppercase leading-none">{formData.publish_date}</div>
                            </div>
                        </div>
                    </div>

                    {formData.summary && (
                         <div className="text-zinc-500 font-bold leading-relaxed italic border-l-4 border-red-600 pl-4 bg-zinc-50 py-4 mb-8">
                            "{formData.summary}"
                        </div>
                    )}

                    {formData.cover_image_url && (
                        <div className="w-full aspect-video rounded-sm overflow-hidden mb-10 shadow-lg bg-zinc-50 border border-zinc-100">
                            <img src={formData.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover"/>
                        </div>
                    )}
                    
                    <div className="prose prose-zinc max-w-none">
                        <div 
                            className="text-zinc-800 text-base leading-loose whitespace-pre-wrap article-preview-body" 
                            dangerouslySetInnerHTML={{ __html: renderContent(formData.content || '') }} 
                        />
                    </div>

                    {formData.tags && (
                        <div className="mt-12 pt-6 border-t border-zinc-50 text-[10px] font-black text-blue-600 uppercase tracking-widest italic">
                            {formData.tags}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .article-preview-body strong { font-weight: 900; color: #111; }
        .article-preview-body em { font-style: italic; color: #444; }
        .article-preview-body h1, .article-preview-body h2 { font-family: inherit; margin-top: 1.5rem; margin-bottom: 1rem; line-height: 1.2; }
        .article-preview-body blockquote { font-size: 1.1em; color: #666; background: #f9fafb; margin: 1.5rem 0; }
        .article-preview-body li { margin-bottom: 0.5rem; }
        .article-preview-body img { margin: 2rem 0; display: block; width: 100%; border-radius: 4px; }
        .article-preview-body a { color: #3b82f6; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default AdminArticleEditor;
