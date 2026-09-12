import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
    const { t } = useLanguage(); // <--- Enables instant re-render on language change
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', {
                email,
                motDePasse: password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'EMPLOYE') {
                navigate('/employee');
            } else if (user.role === 'TECHNICIEN_IT') {
                navigate('/technician');
            } else {
                navigate('/employee');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('errorCredentials'));
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-4 relative">

            {/* Language Switcher Positioned at the Top Right/Corner */}
            <div className="absolute top-6 right-6">
                <LanguageSwitcher />
            </div>

            {/* Centered White Rounded Card Box with Brand Accent Border */}
            <div className="bg-white/95 backdrop-blur-md w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-t-4 border-t-blue-600 border-x border-b border-blue-100 relative space-y-6">

                {/* Header & Logo Section */}
                <div className="flex flex-col items-center text-center border-b border-gray-100 pb-5 space-y-3">

                    {/* UFC Logo Container */}
                    <div className="w-16 h-16 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-md p-1.5 overflow-hidden">
                        <img
                            src={logoUfc}
                            alt="Logo UFC"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('loginTitle')}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t('loginSubtitle')}</p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium text-center shadow-2xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{t('emailAddress')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
                            placeholder="nom.prenom@ufc.dz"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.99] text-white py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-900/25 cursor-pointer mt-3"
                    >
                        {t('signIn')}
                    </button>
                </form>

            </div>
        </div>
    );
}