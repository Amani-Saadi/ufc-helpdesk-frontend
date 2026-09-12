import { useLanguage } from '../hooks/useLanguage';


export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-sm">
            <button
                type="button"
                onClick={() => setLocale('fr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${locale === 'fr' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-white/70 hover:text-white'}`}
            >
                FR
            </button>
            <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${locale === 'en' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-white/70 hover:text-white'}`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => setLocale('ar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${locale === 'ar' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-white/70 hover:text-white'}`}
            >
                عربي
            </button>
        </div>
    );
}