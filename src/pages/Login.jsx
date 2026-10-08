import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Login() {
    const { t } = useLanguage(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for eye toggle
    const [error, setError] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/auth/login', {
                email,
                motDePasse: password
            });

            // Extract data handling flexible backend naming conventions (user/utilisateur, token/accessToken)
            const responseData = response.data;
            const token = responseData.token || responseData.accessToken;
            const user = responseData.user || responseData.utilisateur || responseData.foundUser;
            
            // Debug logs to verify what the backend is sending back
            console.log("FULL USER OBJECT RECEIVED:", user);
            console.log("DETECTED ROLE:", user?.role);

            if (!token) {
                throw new Error("Token missing from server response");
            }

            localStorage.setItem('token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Normalize role, name, and email for safe fallback checks
            const role = user?.role?.toUpperCase() || '';
            const userName = (user?.nom || user?.name || user?.fullName || '').toLowerCase();
            const userEmail = (user?.email || '').toLowerCase();

            // List of all specified technicians (Arabic names and Latin variations/emails)
            const technicianIdentifiers = [
                'صفية', 'safia',
                'عبد الرؤوف', 'abderouf',
                'كريمة', 'karima',
                'سميرة', 'samira',
                'لمياء', 'lamia',
                'منير', 'mounir',
                'عبد الرحمن', 'abderahmane',
                'جميلة', 'djamila', 'djamilia',
                'سهيلة', 'souhila',
                'سامية', 'samia',
                'مصطفى', 'mustapha'
            ];

            // Evaluate if user is a technician either by system role or their specific identity
            const isTechnician = 
                role.includes('TECHNICIEN') || 
                role.includes('TECH') || 
                role.includes('TECHNICIAN') || 
                role.includes('IT') ||
                technicianIdentifiers.some(tech => userName.includes(tech) || userEmail.includes(tech));

            if (isTechnician) {
                navigate('/technician');
            } else if (role === 'ADMIN' || role === 'ADMINISTRATEUR') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || err.message || t('errorCredentials'));
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
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
                            placeholder="nom.prenom@ufc.dz"
                        />
                    </div>

                    {/* Password Input with Eye Toggle */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{t('password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    /* Eye Off Icon */
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    /* Eye Icon */
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
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

            {/* Change Password Modal (Included if triggered from here) */}
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
}