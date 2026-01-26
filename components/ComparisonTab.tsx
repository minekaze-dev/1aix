
import React, { useState } from 'react';
import type { Smartphone } from '../types';

interface ComparisonTabProps {
    items: Smartphone[];
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ items }) => {
    const [phone1Id, setPhone1Id] = useState<string>('');
    const [phone2Id, setPhone2Id] = useState<string>('');

    const phone1 = items.find(i => i.id === phone1Id);
    const phone2 = items.find(i => i.id === phone2Id);

    const availablePhones = items.filter(i => i.release_status === "Tersedia");

    const SpecRow = ({ label, val1, val2, highlightOnDiff = false }: { label: string, val1?: string | number, val2?: string | number, highlightOnDiff?: boolean }) => {
        const isDifferent = highlightOnDiff && val1 !== val2;
        return (
            <tr className="border-b border-zinc-100">
                <td className="px-6 py-4 bg-[#fcfcfc] text-zinc-400 font-black uppercase text-[9px] w-1/4 tracking-widest">{label}</td>
                <td className={`px-6 py-4 font-black text-xs w-3/8 ${isDifferent ? 'text-blue-600' : 'text-zinc-800'}`}>{val1 || '-'}</td>
                <td className={`px-6 py-4 font-black text-xs w-3/8 border-l border-zinc-50 ${isDifferent ? 'text-blue-600' : 'text-zinc-800'}`}>{val2 || '-'}</td>
            </tr>
        );
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-4 mb-10">
                <h2 className="text-2xl font-black text-zinc-900 italic uppercase tracking-tighter leading-none">Head-to-Head</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 shadow-sm">
                <div className="bg-white p-6 space-y-3">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Smartphone A</label>
                    <select 
                        value={phone1Id} 
                        onChange={(e) => setPhone1Id(e.target.value)}
                        className="w-full bg-[#fcfcfc] border border-zinc-100 p-3 text-zinc-800 text-xs font-black uppercase focus:border-blue-600 outline-none transition-colors"
                    >
                        <option value="">Select Device...</option>
                        {availablePhones.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model_name}</option>)}
                    </select>
                </div>
                <div className="bg-white p-6 space-y-3">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Smartphone B</label>
                    <select 
                        value={phone2Id} 
                        onChange={(e) => setPhone2Id(e.target.value)}
                        className="w-full bg-[#fcfcfc] border border-zinc-100 p-3 text-zinc-800 text-xs font-black uppercase focus:border-blue-600 outline-none transition-colors"
                    >
                        <option value="">Select Device...</option>
                        {availablePhones.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model_name}</option>)}
                    </select>
                </div>
            </div>

            {phone1Id && phone2Id ? (
                <div className="bg-white border border-zinc-200 overflow-hidden shadow-md">
                    <table className="w-full text-left">
                        <tbody>
                            <SpecRow label="Brand" val1={phone1?.brand} val2={phone2?.brand} />
                            <SpecRow label="Model" val1={phone1?.model_name} val2={phone2?.model_name} />
                            <SpecRow label="RAM / ROM" val1={phone1?.ram_storage} val2={phone2?.ram_storage} highlightOnDiff />
                            <SpecRow label="Chipset" val1={phone1?.chipset} val2={phone2?.chipset} highlightOnDiff />
                            <SpecRow label="TKDN Score" val1={phone1?.tkdn_score ? `${phone1.tkdn_score}%` : undefined} val2={phone2?.tkdn_score ? `${phone2.tkdn_score}%` : undefined} />
                            <SpecRow label="SRP Price" val1={phone1?.price_srp ? new Intl.NumberFormat('id-ID').format(phone1.price_srp) : undefined} val2={phone2?.price_srp ? new Intl.NumberFormat('id-ID').format(phone2.price_srp) : undefined} highlightOnDiff />
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-24 text-center border border-dashed border-zinc-200 bg-white">
                    <div className="text-zinc-300 font-black uppercase text-xs tracking-[0.5em]">Compare Mode Inactive</div>
                    <p className="text-zinc-400 text-[10px] mt-2 font-bold uppercase">Select two devices to generate report</p>
                </div>
            )}
        </section>
    );
};

export default ComparisonTab;
