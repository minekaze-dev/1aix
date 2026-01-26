
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from './icons';

type ViewType = 'login' | 'register' | 'forgot_password' | 'message';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [view, setView] = useState<ViewType>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            } else if (view === 'register') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { 
                        data: { full_name: displayName || email.split('@')[0] },
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;
                setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.');
                setView('message');
            } else if (view === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage('Instruksi reset password telah dikirim ke email Anda.');
                setView('message');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const isLogin = view === 'login';
    const isRegister = view === 'register';
    const isForgotPassword = view === 'forgot_password';

    return (
        <div 
            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden transform transition-all border border-zinc-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-2">
                                {view === 'message' ? 'EMAIL TERKIRIM' : (isLogin ? 'LOGIN PANEL' : isRegister ? 'DAFTAR AKUN' : 'RESET PASSWORD')}
                            </h3>
                            <div className="h-1 w-8 bg-red-600"></div>
                        </div>
                        <button onClick={onClose} className="text-zinc-300 hover:text-zinc-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {view === 'message' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest leading-relaxed mb-10">{message}</p>
                            <button onClick={() => setView('login')} className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 transition-colors rounded-sm">
                                KEMBALI KE LOGIN
                            </button>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {isRegister && (
                                    <div className="relative">
                                        <UserCircleIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Nama Lengkap" 
                                            value={displayName} 
                                            onChange={(e) => setDisplayName(e.target.value)} 
                                            required 
                                            className="w-full pl-11 pr-4 py-4 bg-[#f8fafc] border border-zinc-100 rounded-sm text-[13px] font-semibold outline-none focus:border-red-600 focus:bg-white transition-all text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" 
                                        />
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <EnvelopeIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                     <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full pl-11 pr-4 py-4 bg-[#f8fafc] border border-zinc-100 rounded-sm text-[13px] font-semibold outline-none focus:border-red-600 focus:bg-white transition-all text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" 
                                    />
                                </div>
                                
                                {!isForgotPassword && (
                                    <div className="relative">
                                         <LockClosedIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="Password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                            className="w-full pl-11 pr-12 py-4 bg-[#f8fafc] border border-zinc-100 rounded-sm text-[13px] font-semibold outline-none focus:border-red-600 focus:bg-white transition-all text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.13-5.326m9.416.521c.746.565 1.436 1.213 2.054 1.934m1.076 2.053A10.05 10.05 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-1.391 0-2.704-.23-3.926-.654m12.426-14L3 3m3.343 3.343a3 3 0 114.242 4.242"/></svg>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}

                                <button type="submit" disabled={loading} className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 transition-all rounded-sm shadow-xl disabled:opacity-50 active:scale-[0.98]">
                                    {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK PANEL' : isRegister ? 'BUAT AKUN' : 'KIRIM INSTRUKSI')}
                                </button>
                                
                                <div className="text-center pt-2">
                                    {isLogin && (
                                         <button type="button" onClick={() => setView('forgot_password')} className="text-[9px] font-black text-zinc-400 hover:text-red-600 uppercase tracking-widest">LUPA PASSWORD?</button>
                                    )}
                                </div>
                            </form>

                             <div className="mt-10 text-[9px] font-black text-center text-zinc-400 uppercase tracking-widest space-y-2">
                                {isLogin && (
                                    <p>BELUM PUNYA AKUN? <button onClick={() => setView('register')} className="text-red-600 hover:underline">DAFTAR SEKARANG</button></p>
                                )}
                                {isRegister && (
                                     <p>SUDAH PUNYA AKUN? <button onClick={() => setView('login')} className="text-red-600 hover:underline">LOGIN DISINI</button></p>
                                )}
                                {isForgotPassword && (
                                     <p>INGAT PASSWORD? <button onClick={() => setView('login')} className="text-red-600 hover:underline">KEMBALI KE LOGIN</button></p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
