
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
                setMessage('Pendaftaran berhasil! Silahkan cek email Anda untuk konfirmasi.');
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
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col gap-4">
                            <img 
                                src="https://i.imgur.com/8LtVd3P.jpg" 
                                alt="1AIX Logo" 
                                className="h-10 w-auto object-contain self-start brightness-0 grayscale opacity-90"
                            />
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-2">
                                    {view === 'message' ? 'EMAIL TERKIRIM' : (isLogin ? 'SELAMAT DATANG' : isRegister ? 'DAFTAR AKUN' : 'RESET PASSWORD')}
                                </h3>
                                <div className="h-1 w-8 bg-red-600"></div>
                            </div>
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
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}

                                <button type="submit" disabled={loading} className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 transition-all rounded-sm shadow-xl disabled:opacity-50 active:scale-[0.98]">
                                    {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK' : isRegister ? 'BUAT AKUN' : 'KIRIM INSTRUKSI')}
                                </button>
                                
                                <div className="text-center pt-2">
                                    {isLogin && (
                                         <button type="button" onClick={() => setView('forgot_password')} className="text-[9px] font-black text-zinc-400 hover:text-red-600 uppercase tracking-widest">LUPA PASSWORD?</button>
                                    )}
                                </div>
                            </form>

                             <div className="mt-10 text-[10px] font-black text-center text-zinc-400 uppercase tracking-widest space-y-2">
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
