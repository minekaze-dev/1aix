
import React from 'react';
import type { Smartphone } from '../types';

interface ProductCardProps {
    phone: Smartphone;
}

const ProductCard: React.FC<ProductCardProps> = ({ phone }) => {
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(phone.price_srp);

    return (
        <article className="bg-white border border-zinc-200 group flex flex-col relative transition-all hover:shadow-2xl hover:border-blue-500">
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">Official</span>
                <span className="bg-zinc-800 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">{phone.tkdn_score}% TKDN</span>
            </div>
            
            <div className="aspect-square overflow-hidden bg-white p-6 flex items-center justify-center relative">
                 <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                <img 
                    src={phone.image_url || 'https://via.placeholder.com/300x400?text=No+Image'} 
                    alt={phone.model_name}
                    className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            
            <div className="p-5 flex-grow border-t border-zinc-100">
                <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic">{phone.brand}</div>
                <h3 className="text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{phone.model_name}</h3>
                <div className="mt-2 text-xs font-black text-zinc-400">{formattedPrice}</div>
                
                <div className="mt-4 pt-4 border-t border-zinc-50 grid grid-cols-2 gap-4 text-[9px] text-zinc-400 uppercase font-black tracking-widest">
                    <div className="flex flex-col">
                        <span className="text-zinc-300 mb-1">Chipset</span>
                        <span className="text-zinc-600 line-clamp-1">{phone.chipset}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-zinc-300 mb-1">Config</span>
                        <span className="text-zinc-600">{phone.ram_storage}</span>
                    </div>
                </div>
            </div>

            <a 
                href={phone.official_store_link} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center py-3 bg-zinc-50 text-zinc-900 font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all"
            >
                View Details
            </a>
        </article>
    );
};

export default ProductCard;
