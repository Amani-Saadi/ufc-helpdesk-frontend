import { useLanguage } from '../hooks/useLanguage';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <button
                type="button"
                onClick={() => setLocale('fr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    locale === 'fr' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
            >
                FR
            </button>
            <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    locale === 'en' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => setLocale('ar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    locale === 'ar' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
            >
                عربي
            </button>
        </div>
    );
}