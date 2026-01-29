import React, { useState, useRef, useEffect } from 'react';
import type { Smartphone } from '../types';

interface ComparisonTabProps {
    items: Smartphone[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ items, selectedIds, setSelectedIds }) => {
    const [showThirdDevice, setShowThirdDevice] = useState(selectedIds.length > 2);
    const [searchQueries, setSearchQueries] = useState<string[]>(['', '', '']);
    const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
    const searchRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

    const availablePhones = items.filter(i => i.release_status === "Tersedia");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeSearchSlot !== null && searchRefs[activeSearchSlot].current && !searchRefs[activeSearchSlot].current?.contains(event.target as Node)) {
                setActiveSearchSlot(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeSearchSlot]);

    const handleSelect = (index: number, phone: Smartphone) => {
        const newIds = [...selectedIds];
        newIds[index] = phone.id;
        setSelectedIds(newIds);
        
        const newQueries = [...searchQueries];
        newQueries[index] = '';
        setSearchQueries(newQueries);
        
        setActiveSearchSlot(null);
    };

    const handleSearchChange = (index: number, val: string) => {
        const newQueries = [...searchQueries];
        newQueries[index] = val;
        setSearchQueries(newQueries);
    };

    const addDeviceSlot = () => {
        if (!showThirdDevice) {
            setShowThirdDevice(true);
            setSelectedIds([...selectedIds, '']);
        }
    };

    const removeDeviceSlot = () => {
        setShowThirdDevice(false);
        setSelectedIds(selectedIds.slice(0, 2));
    };

    const selectedPhones = selectedIds.map(id => items.find(p => p.id === id)).filter(Boolean) as Smartphone[];

    const specGroups = [
        { title: "BODY & MATERIAL", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>, fields: [
            { label: "DIMENSI / BERAT", field: "dimensions_weight" },
            { label: "MATERIAL", field: "material" },
            { label: "WARNA", field: "colors" }
        ]},
        { title: "CONNECTIVITY", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>, fields: [
            { label: "JARINGAN", field: "network" },
            { label: "WIFI", field: "wifi" }
        ]},
        { title: "DISPLAY", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>, fields: [
            { label: "TIPE LAYAR", field: "display_type" }
        ]},
        { title: "PLATFORM", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>, fields: [
            { label: "OS", field: "os" },
            { label: "CHIPSET", field: "chipset" },
            { label: "CPU", field: "cpu" },
            { label: "GPU", field: "gpu" }
        ]},
        { title: "MEMORY", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>, fields: [
            { label: "RAM / ROM", field: "ram_storage" }
        ]},
        { title: "CAMERA", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>, fields: [
            { label: "UTAMA (BELAKANG)", field: "camera_main" },
            { label: "VIDEO UTAMA", field: "camera_video_main" },
            { label: "SELFIE (DEPAN)", field: "camera_selfie" },
            { label: "VIDEO SELFIE", field: "camera_video_selfie" }
        ]},
        { title: "BATTERY", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>, fields: [
            { label: "KAPASITAS", field: "battery_capacity" },
            { label: "CHARGING", field: "charging" }
        ]},
        { title: "HARDWARE", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>, fields: [
            { label: "SENSOR", field: "sensors" },
            { label: "TIPE USB", field: "usb_type" },
            { label: "AUDIO", field: "audio" },
            { label: "FITUR LAIN", field: "features_extra" }
        ]}
    ];

    const DesktopHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
        <tr className="bg-[#f8fafc] border-y border-zinc-200">
            <td colSpan={showThirdDevice ? 4 : 3} className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="text-zinc-400 scale-110">{icon}</div>
                    <span className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">{title}</span>
                </div>
            </td>
        </tr>
    );

    const DesktopRow = ({ label, field }: { label: string, field: keyof Smartphone }) => {
        return (
            <tr className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest w-[200px] align-top bg-white border-r border-zinc-100 group-hover:text-blue-600 break-words leading-tight">
                    {label}
                </td>
                {selectedIds.map((id, idx) => {
                    const phone = items.find(p => p.id === id);
                    return (
                        <td key={idx} className={`px-6 py-4 text-[11px] font-bold text-zinc-800 uppercase align-top ${idx > 0 ? 'border-l border-zinc-100' : ''} break-words leading-normal`}>
                            {phone && phone[field] ? String(phone[field]) : <span className="text-zinc-200">-</span>}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1000px] mx-auto">
            <div className="mb-12">
                <div className="text-[11px] font-black text-[#ef4444] uppercase tracking-[0.4em] mb-2">ANALISIS SPESIFIKASI</div>
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none">SIDE-BY-SIDE</h1>
                <div className="h-0.5 w-full bg-zinc-100 mt-6"></div>
            </div>

            {/* Device Selector Slots */}
            <div className={`grid ${showThirdDevice ? 'grid-cols-3' : 'grid-cols-2'} gap-4 md:gap-6 mb-12 transition-all duration-500`}>
                {selectedIds.map((selectedId, idx) => {
                    const phone = items.find(p => p.id === selectedId);
                    const query = searchQueries[idx];
                    const filtered = query.length >= 1 
                        ? availablePhones.filter(p => 
                            p.model_name.toLowerCase().includes(query.toLowerCase()) || 
                            p.brand.toLowerCase().includes(query.toLowerCase())
                          ).slice(0, 8)
                        : [];

                    return (
                        <div key={idx} className="bg-white border border-zinc-100 shadow-sm p-4 md:p-8 flex flex-col items-center justify-between min-h-[320px] md:min-h-[420px] relative group hover:border-blue-200 transition-all rounded-sm">
                            {idx === 2 && (
                                <button onClick={removeDeviceSlot} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors z-10">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                            <div className="w-full flex flex-col items-center flex-grow justify-center mb-6">
                                {phone ? (
                                    <div className="text-center animate-in zoom-in-95 duration-300">
                                        <div className="bg-[#fcfcfc] w-24 h-24 md:w-44 md:h-44 rounded-sm p-2 md:p-4 flex items-center justify-center mb-4 md:mb-6">
                                            <img src={phone.image_url} alt={phone.model_name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-xl" />
                                        </div>
                                        <div className="text-[8px] md:text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 leading-none">{phone.brand} OFFICIAL</div>
                                        <h3 className="text-sm md:text-lg font-black text-zinc-900 uppercase tracking-tight leading-tight">{phone.model_name}</h3>
                                        <div className="text-blue-600 font-black text-xs md:text-sm mt-2">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(phone.price_srp)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4 md:mb-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-6 h-6 md:w-8 md:h-8 text-zinc-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 group-hover:text-zinc-500 transition-colors">CARI GADGET</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-full relative" ref={searchRefs[idx]}>
                                <div className="relative">
                                    <input type="text" placeholder="MODEL HP..." value={query} onChange={(e) => handleSearchChange(idx, e.target.value)} onFocus={() => setActiveSearchSlot(idx)} className="w-full bg-white border border-zinc-200 py-3 md:py-4 pl-8 md:pl-10 pr-2 md:pr-4 text-[9px] md:text-[10px] font-black uppercase text-zinc-800 tracking-widest focus:border-blue-500 outline-none hover:bg-zinc-50 transition-colors shadow-sm rounded-sm" />
                                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-3 h-3 md:w-4 md:h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                </div>
                                {activeSearchSlot === idx && filtered.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-zinc-200 shadow-2xl rounded-sm overflow-hidden z-[100] animate-in slide-in-from-bottom-2 duration-200">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {filtered.map(p => (
                                                <button key={p.id} onClick={() => handleSelect(idx, p)} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-50 last:border-0">
                                                    <div className="w-10 h-10 bg-zinc-100 p-1 flex items-center justify-center rounded-sm"><img src={p.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" /></div>
                                                    <div className="flex flex-col"><span className="text-[10px] font-black text-zinc-900 uppercase leading-none">{p.model_name}</span><span className="text-[8px] font-bold text-red-600 uppercase tracking-widest mt-1">{p.brand}</span></div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Comparison Output */}
            {selectedPhones.length >= 1 ? (
                <>
                    {/* Mobile View: Individual Stacked Tables */}
                    <div className="lg:hidden space-y-12 mb-20">
                        {selectedIds.filter(id => !!id).map((id, pIdx) => {
                            const phone = items.find(p => p.id === id);
                            if (!phone) return null;
                            return (
                                <div key={pIdx} className="bg-white border border-zinc-200 shadow-xl overflow-hidden rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-zinc-400 uppercase tracking-widest mb-0.5">{phone.brand} OFFICIAL</span>
                                            <span className="text-[13px] font-black uppercase tracking-tight leading-none">{phone.model_name}</span>
                                        </div>
                                        <div className="bg-blue-600 px-2 py-1 rounded-sm text-[8px] font-black tracking-widest">DEVICE #{pIdx + 1}</div>
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {specGroups.map((group, gIdx) => (
                                                <React.Fragment key={gIdx}>
                                                    <tr className="bg-[#f8fafc] border-y border-zinc-100">
                                                        <td colSpan={2} className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-zinc-300 scale-90">{group.icon}</div>
                                                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em]">{group.title}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {group.fields.map((field, fIdx) => (
                                                        phone[field.field as keyof Smartphone] ? (
                                                            <tr key={fIdx} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                                                                <td className="px-5 py-3 w-[40%] text-[8px] font-black text-zinc-400 uppercase tracking-wider align-top leading-tight border-r border-zinc-50">{field.label}</td>
                                                                <td className="px-5 py-3 text-[10px] font-bold text-zinc-800 uppercase align-top leading-normal break-words">{String(phone[field.field as keyof Smartphone])}</td>
                                                            </tr>
                                                        ) : null
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View: Side-by-Side Table */}
                    <div className="hidden lg:block bg-white border border-zinc-200 shadow-2xl overflow-hidden rounded-sm animate-in fade-in slide-in-from-top-4 duration-500 mb-20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-900 text-white">
                                    <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] w-[200px] border-r border-white/5">FITUR / SPEK</th>
                                    {selectedIds.map((id, idx) => {
                                        const phone = items.find(p => p.id === id);
                                        return (
                                            <th key={idx} className={`px-6 py-6 text-[12px] font-black uppercase tracking-tight text-center ${idx > 0 ? 'border-l border-white/5' : ''}`}>
                                                {phone ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] text-zinc-500 tracking-widest leading-none mb-1">{phone.brand}</span>
                                                        <span className="leading-tight break-words">{phone.model_name}</span>
                                                    </div>
                                                ) : '...'}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {specGroups.map((group, idx) => (
                                    <React.Fragment key={idx}>
                                        <DesktopHeader title={group.title} icon={group.icon} />
                                        {group.fields.map(f => <DesktopRow key={f.field} label={f.label} field={f.field as keyof Smartphone} />)}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="py-24 text-center border-2 border-dashed border-zinc-100 bg-zinc-50/50 rounded-sm">
                    <div className="text-zinc-300 font-black uppercase text-[11px] tracking-[0.5em] mb-4">AWAITING INPUT</div>
                    <p className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest max-w-[400px] mx-auto leading-relaxed">PILIH DUA PERANGKAT UNTUK MULAI MEMBANDINGKAN SPESIFIKASI LENGKAP SECARA MENDALAM</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTab;