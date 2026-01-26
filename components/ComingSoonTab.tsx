
import React from 'react';
import type { Smartphone } from '../types';

interface ComingSoonTabProps {
    items: Smartphone[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ items }) => {
    // Upcoming devices filter
    const upcoming = items.filter(i => i.release_status === "Segera Rilis" || i.release_status === "Pre-Order");

    return (
        <div className="w-full animate-in fade-in duration-700">
            {/* MAIN MONITOR AREA - SIDEBAR REMOVED TO MAXIMIZE WIDTH */}
            <div className="space-y-12">
                {/* Page Title Section */}
                <div>
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">SERTIFIKASI PEMERINTAH</div>
                    <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">TKDN MONITOR</h1>
                </div>

                {/* Database Monitor Container */}
                <div className="border border-zinc-200 rounded-sm overflow-hidden shadow-sm bg-white">
                    {/* Header bar with Live badge */}
                    <div className="bg-[#0f172a] h-14 flex items-center justify-between px-6">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">DATABASE PANTAUAN SERTIFIKASI</span>
                        <div className="bg-[#3b82f6] text-white text-[9px] font-black px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg">
                            LIVE FEED V5.5
                        </div>
                    </div>

                    {/* Table Structure */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#f8fafc] border-b border-zinc-100">
                                <tr className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                    <th className="px-6 py-5 text-left font-black">IDENTITAS PERANGKAT</th>
                                    <th className="px-6 py-5 text-left font-black">NO. SERTIFIKAT</th>
                                    <th className="px-6 py-5 text-left font-black">STATUS RILIS</th>
                                    <th className="px-6 py-5 text-left font-black">NILAI TKDN</th>
                                    <th className="px-6 py-5 text-left font-black">TGL VERIFIKASI</th>
                                    <th className="px-6 py-5 text-left font-black">JENDELA RILIS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {upcoming.length > 0 ? upcoming.map(phone => (
                                    <tr key={phone.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="text-[13px] font-black text-zinc-900 uppercase leading-tight mb-1">{phone.brand}</div>
                                            <div className="text-[12px] font-black text-zinc-900 uppercase leading-tight mb-1">{phone.model_name}</div>
                                            <div className="text-[10px] font-bold text-zinc-300 uppercase">{phone.model_code || 'SM-M556B'}</div>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-[10px] text-zinc-400">
                                            {phone.postel_cert || '98122/SDPPI/2024'}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fef3c7] border border-[#fde68a] text-[#d97706] rounded-sm shadow-sm group cursor-help">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="text-[9px] font-black uppercase tracking-wider">UPCOMING</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[12px] font-black text-zinc-900 underline decoration-blue-500 decoration-2 underline-offset-4">{phone.tkdn_score}%</span>
                                        </td>
                                        <td className="px-6 py-6 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                                            {phone.launch_date_indo || '2024-05-10'}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="bg-zinc-100 px-3 py-1.5 inline-block rounded-sm">
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{phone.prediction_quarter || 'Q2 2024'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-32 text-center text-zinc-300 font-black uppercase text-xs tracking-widest italic">
                                            Memuat database sertifikasi...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Data Disclaimer / Pernyataan Data Box */}
                <div className="bg-[#f8fafc] border border-zinc-100 p-8 rounded-sm flex items-start gap-6">
                    <div className="w-10 h-10 bg-[#fef3c7] flex items-center justify-center rounded-sm flex-shrink-0 text-[#d97706] shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em] mb-2">PERNYATAAN DATA</h4>
                        <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tight">
                            Seluruh data TKDN bersumber secara resmi dari database <strong className="text-zinc-500">kemenperin.go.id</strong>. Nama pemasaran smartphone di pasar Indonesia mungkin memiliki perbedaan signifikan dengan penamaan model global. Informasi rilis adalah prediksi berdasarkan riwayat pendaftaran sertifikat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonTab;
