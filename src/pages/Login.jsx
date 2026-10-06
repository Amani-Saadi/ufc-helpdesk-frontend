
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
    const { t } = useLanguage();

    const [emailInput, setEmailInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Prevent accidental double submission
        if (isLoading) {
            return;
        }

        setError('');
        setIsLoading(true);

        // Remove accidental spaces around email/password
        const cleanEmail = emailInput.trim();
        const cleanPassword = password.trim();

        console.log('LOGIN DEBUG:', {
            email: cleanEmail,
            passwordLength: cleanPassword.length,
            passwordChars: [...cleanPassword].map((c) =>
                c.charCodeAt(0)
            )
        });

        try {
            const response = await api.post('/auth/login', {
                email: cleanEmail,
                motDePasse: cleanPassword
            });

            console.log('FULL RESPONSE DATA:', response.data);

            // Get token from backend response
            const token =
                response.data?.token ||
                response.data?.accessToken ||
                response.data?.data?.token;

            // Backend returns "utilisateur"
            const user =
                response.data?.utilisateur ||
                response.data?.user ||
                response.data?.data?.utilisateur ||
                response.data?.data?.user;

            console.log('USER OBJECT:', user);

            console.log(
                'UTILISATEUR CONTENT:',
                JSON.stringify(user, null, 2)
            );

            if (!token) {
                setError(
                    'الباك إند لم يرسل التوكن! تحقق من شكل الاستجابة في الـ Console.'
                );
                return;
            }

            if (!user) {
                setError(
                    'Connexion réussie, mais les informations utilisateur sont absentes de la réponse du serveur.'
                );

                console.error(
                    'USER OBJECT IS UNDEFINED. Backend response:',
                    response.data
                );

                return;
            }

            // Save authentication information
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Get user's email
            const userEmail = (
                user?.email ||
                user?.emailUtilisateur ||
                cleanEmail ||
                ''
            )
                .trim()
                .toLowerCase();

            // Get user's role
            const role = (
                user?.role ||
                user?.type ||
                user?.typeUtilisateur ||
                user?.roleUtilisateur ||
                ''
            )
                .trim()
                .toUpperCase();

            console.log('DETECTED ROLE/EMAIL:', {
                role,
                userEmail,
                user
            });

            /*
             * ============================
             * REDIRECTION
             * ============================
             */

            // ADMIN
            if (
                role.includes('ADMIN') ||
                userEmail.includes('admin')
            ) {
                console.log('REDIRECT → /admin');

                navigate('/admin', {
                    replace: true
                });

                return;
            }

            // TECHNICIEN
            if (
                role.includes('TECH') ||
                userEmail.includes('tech')
            ) {
                console.log('REDIRECT → /technician');

                navigate('/technician', {
                    replace: true
                });

                return;
            }

            // EMPLOYÉ / CENTRE
            if (
                role.includes('EMPLOYE') ||
                role.includes('EMPLOYEE') ||
                role.includes('CENTRE')
            ) {
                console.log('REDIRECT → /centre');

                navigate('/centre', {
                    replace: true
                });

                return;
            }

            // Unknown role
            console.error('UNKNOWN USER ROLE:', {
                role,
                userEmail,
                user
            });

            setError(
                `Rôle utilisateur non reconnu : ${role || 'aucun rôle'}`
            );

        } catch (err) {
            console.error(
                'LOGIN ERROR DETAILS:',
                err.response || err
            );

            setError(
                err.response?.data?.message ||
                t('errorCredentials')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-4 relative">

            {/* Language Switcher */}
            <div className="absolute top-6 right-6">
                <LanguageSwitcher />
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-md w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-t-4 border-t-blue-600 border-x border-b border-blue-100 relative space-y-6">

                {/* Header */}
                <div className="flex flex-col items-center text-center border-b border-gray-100 pb-5 space-y-3">

                    {/* UFC Logo */}
                    <div className="w-16 h-16 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-md p-1.5 overflow-hidden">
                        <img
                            src={logoUfc}
                            alt="Logo UFC"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {t('loginTitle')}
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('loginSubtitle')}
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium text-center shadow-2xs">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                            {t('emailAddress')}
                        </label>

                        <input
                            type="email"
                            autoComplete="email"
                            value={emailInput}
                            onChange={(e) =>
                                setEmailInput(e.target.value)
                            }
                            required
                            disabled={isLoading}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm disabled:opacity-60"
                            placeholder="nom.prenom@ufc.dz"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                            {t('password')}
                        </label>

                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            disabled={isLoading}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm disabled:opacity-60"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.99] disabled:bg-blue-700 disabled:opacity-70 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-900/25 cursor-pointer disabled:cursor-not-allowed mt-3"
                    >
                        {isLoading
                            ? 'Connexion...'
                            : t('signIn')}
                    </button>

                </form>
            </div>
        </div>
    );
}