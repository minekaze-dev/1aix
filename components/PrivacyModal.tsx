import React from 'react';

interface ModalProps {
    onClose: () => void;
}

const PrivacyModal: React.FC<ModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col transform transition-all border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-100">Kebijakan Privasi</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="px-6 py-4 flex-grow max-h-[70vh] overflow-y-auto text-gray-300 space-y-4 text-sm">
                    <p>Privasi Anda penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana Jabodetabek Way mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
                    
                    <h3 className="text-lg font-semibold text-gray-100 pt-2">1. Informasi yang Kami Kumpulkan</h3>
                    <ul className="list-disc list-outside ml-6 space-y-1">
                        <li><strong>Informasi yang Anda Berikan:</strong> Saat Anda berkontribusi membuat panduan atau berpartisipasi dalam forum, kami mengumpulkan konten yang Anda kirimkan, seperti teks, judul, dan nama kontributor yang Anda masukkan.</li>
                        <li><strong>Informasi Anonim:</strong> Kami tidak memerlukan pendaftaran akun. Identitas Anda di forum (voting, reporting) adalah "Guest" atau nama yang Anda masukkan, yang tidak terhubung dengan informasi pribadi Anda. Kami tidak melacak alamat IP atau data pribadi lainnya.</li>
                        <li><strong>Data Penggunaan:</strong> Kami dapat mengumpulkan informasi non-pribadi tentang bagaimana Anda berinteraksi dengan layanan kami, seperti panduan mana yang dilihat, untuk meningkatkan platform.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-100 pt-2">2. Penggunaan Informasi</h3>
                    <p>Informasi yang kami kumpulkan digunakan untuk:</p>
                    <ul className="list-disc list-outside ml-6 space-y-1">
                        <li>Menyediakan, mengoperasikan, dan memelihara layanan kami.</li>
                        <li>Menampilkan konten kontribusi Anda kepada pengguna lain.</li>
                        <li>Memahami dan menganalisis bagaimana Anda menggunakan layanan kami untuk perbaikan.</li>
                        <li>Melakukan moderasi konten dan menegakkan Syarat & Ketentuan kami.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-100 pt-2">3. Pembagian Informasi</h3>
                    <p>Kami tidak menjual atau menyewakan informasi pribadi Anda. Data Anda disimpan di backend kami yang didukung oleh Supabase. Kami tidak membagikan data kontribusi Anda dengan pihak ketiga lainnya di luar fungsi inti platform.</p>

                    <h3 className="text-lg font-semibold text-gray-100 pt-2">4. Keamanan Data</h3>
                    <p>Kami mengambil langkah-langkah yang wajar untuk melindungi informasi yang Anda kirimkan. Namun, tidak ada sistem yang 100% aman, dan kami tidak dapat menjamin keamanan mutlak data Anda.</p>

                    <h3 className="text-lg font-semibold text-gray-100 pt-2">5. Perubahan Kebijakan</h3>
                    <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan apa pun dengan memposting kebijakan baru di halaman ini. Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala.</p>

                </div>
                 <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
                     <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;