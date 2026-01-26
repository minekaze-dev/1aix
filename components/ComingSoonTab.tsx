
import React from 'react';
import type { Smartphone } from '../types';

interface ComingSoonTabProps {
    items: Smartphone[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ items }) => {
    const upcoming = items.filter(i => i.release_status === "Segera Rilis" || i.release_status === "Pre-Order");

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-red-600 pl-4">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 italic uppercase tracking-tighter leading-none">TKDN Monitor</h2>
                    <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-black mt-1">Real-time Certification Tracking</p>
                </div>
                <div className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 uppercase animate-pulse">Live Tracking</div>
            </div>

            <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fcfcfc] border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Brand / Model</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">TKDN Score</th>
                            <th className="px-6 py-4">Prediction</th>
                            <th className="px-4 py-4">Model Code</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {upcoming.length > 0 ? upcoming.map(phone => (
                            <tr key={phone.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-black text-zinc-900 uppercase text-xs">{phone.brand}</div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase">{phone.model_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-sm shadow-sm ${phone.release_status === 'Pre-Order' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {phone.release_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-black text-blue-600 text-xs">
                                    {phone.tkdn_score}%
                                </td>
                                <td className="px-6 py-4 font-black text-zinc-600 uppercase text-[10px] tracking-widest">
                                    {phone.prediction_quarter || 'TBA'}
                                </td>
                                <td className="px-4 py-4 font-mono text-zinc-300 text-[10px]">
                                    {phone.model_code || '-'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-24 text-center text-zinc-300 font-black uppercase text-xs tracking-widest">
                                    No certifications found in recent database logs
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ComingSoonTab;
