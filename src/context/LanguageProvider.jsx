import { useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';

const translations = {
    en: {
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to access your dashboard',
        emailAddress: 'Email Address',
        password: 'Password',
        signIn: 'Sign In',
        logout: 'Logout',
        errorCredentials: 'Incorrect credentials',
        employeeSpace: 'Employee Space',
        dashboardTitle: 'Dashboard',
        dashboardSubtitle: 'Submit and track your claims and incidents',
        reportIncident: 'Report a New Incident',
        ticketTitle: 'Title',
        category: 'Category',
        department: 'Department',
        priority: 'Priority',
        description: 'Description',
        sendTicket: 'Send Ticket',
        ticketHistory: 'My Tickets History',
        ticketHistorySubtitle: 'Check the progress of your requests',
        searchPlaceholder: 'Search by title or ID...',
        allStatuses: 'All statuses',
        allCategories: 'All categories',
        actions: 'Actions',
        close: 'Close',
        successTicketCreated: 'Ticket created successfully!',
        errorGeneric: 'Unable to load your data.',
        technicianSpace: 'Technical Support',
        technicianTitle: 'Technician Space',
        technicianSubtitle: 'Supervise and process reported technical incidents',
        totalTickets: 'Total Tickets',
        toProcess: 'To Process / In Progress',
        resolved: 'Resolved',
        ticketQueue: 'Incident Queue',
        ticketQueueSubtitle: 'Manage the lifecycle of each technical ticket',
        selectCategory: 'Select category',
        selectDepartment: 'Select department',
        selectPriority: 'Select priority',
        status: 'Status',
        id: 'ID',
        titlePlaceholder: 'Enter ticket title...',
        descriptionPlaceholder: 'Describe your issue in detail...',

        // Categories & Departments
        HARDWARE: 'Hardware',
        SOFTWARE: 'Software',
        WEBSITE: 'Website',
        NETWORK: 'Network',
        NETWORKING: 'Networking',
        MAINTENANCE: 'Maintenance',
        MAINTENANCE_INFORMATIQUE: 'IT Maintenance',
        AUTRE: 'Other',
        OTHER: 'Other',
        IT: 'IT Department',
        HR: 'HR',
        FINANCE: 'Finance',
        SUPPORT: 'Support',
        UNCATEGORIZED: 'Uncategorized',

        NOUVEAU_NON_VU: 'New (Unseen)',
        NOUVEAU_VU: 'New (Seen)',
        EN_COURS: 'In Progress',
        RESOLU: 'Resolved',
        FERME: 'Closed',
        BASSE: 'Low',
        MOYENNE: 'Medium',
        HAUTE: 'High',
        URGENTE: 'Urgent'
    },
    fr: {
        loginTitle: 'Bon Retour',
        loginSubtitle: 'Connectez-vous pour accéder à votre tableau de bord',
        emailAddress: 'Adresse e-mail',
        password: 'Mot de passe',
        signIn: 'Se connecter',
        logout: 'Déconnexion',
        errorCredentials: 'Identifiants incorrects',
        employeeSpace: 'Espace Employé',
        dashboardTitle: 'Tableau de Bord',
        dashboardSubtitle: 'Soumettez et suivez vos réclamations et incidents',
        reportIncident: 'Signaler un Nouvel Incident',
        ticketTitle: 'Titre',
        category: 'Catégorie',
        department: 'Département',
        priority: 'Priorité',
        description: 'Description',
        sendTicket: 'Envoyer le Ticket',
        ticketHistory: 'Historique de mes Tickets',
        ticketHistorySubtitle: "Consultez l'état d'avancement de vos demandes",
        searchPlaceholder: 'Rechercher par titre ou ID...',
        allStatuses: 'Tous les statuts',
        allCategories: 'Toutes les catégories',
        actions: 'Actions',
        close: 'Fermer',
        successTicketCreated: 'Ticket créé avec succès !',
        errorGeneric: 'Impossible de charger vos données.',
        technicianSpace: 'Support Technique',
        technicianTitle: 'Espace Technicien',
        technicianSubtitle: 'Supervisez et traitez les incidents techniques signalés',
        totalTickets: 'Total Tickets',
        toProcess: 'À Traiter / En Cours',
        resolved: 'Résolus',
        ticketQueue: "File d'Attente des Incidents",
        ticketQueueSubtitle: 'Gérez le cycle de vie de chaque ticket technique',
        selectCategory: 'Sélectionner une catégorie',
        selectDepartment: 'Sélectionner un département',
        selectPriority: 'Sélectionner une priorité',
        status: 'Statut',
        id: 'ID',
        titlePlaceholder: 'Entrez le titre du ticket...',
        descriptionPlaceholder: 'Décrivez votre problème en détail...',

        // Categories & Departments
        HARDWARE: 'Matériel',
        SOFTWARE: 'Logiciel',
        WEBSITE: 'Site Web',
        NETWORK: 'Réseau',
        NETWORKING: 'Réseautage',
        MAINTENANCE: 'Maintenance',
        MAINTENANCE_INFORMATIQUE: 'Maintenance Informatique',
        AUTRE: 'Autre',
        OTHER: 'Autre',
        IT: 'Informatique',
        HR: 'Ressources Humaines',
        FINANCE: 'Finance',
        SUPPORT: 'Support',
        UNCATEGORIZED: 'Non catégorisé',

        NOUVEAU_NON_VU: 'Nouveau (Non vu)',
        NOUVEAU_VU: 'Nouveau (Vu)',
        EN_COURS: 'En cours',
        RESOLU: 'Résolu',
        FERME: 'Fermé',
        BASSE: 'Basse',
        MOYENNE: 'Moyenne',
        HAUTE: 'Haute',
        URGENTE: 'Urgente'
    },
    ar: {
        loginTitle: 'مرحباً بك مجدداً',
        loginSubtitle: 'تسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك',
        emailAddress: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        signIn: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        errorCredentials: 'بيانات الاعتماد غير صحيحة',
        employeeSpace: 'فضاء الموظف',
        dashboardTitle: 'لوحة التحكم',
        dashboardSubtitle: 'قم بتقديم ومتابعة طلباتك بلاغاتك',
        reportIncident: 'الإبلاغ عن حادث جديد',
        ticketTitle: 'العنوان',
        category: 'الفئة',
        department: 'القسم',
        priority: 'الأولوية',
        description: 'الوصف',
        sendTicket: 'إرسال التذكرة',
        ticketHistory: 'سجل تذاكري',
        ticketHistorySubtitle: 'تحقق من تقدم طلباتك',
        searchPlaceholder: 'البحث بالعنوان أو المعرف...',
        allStatuses: 'جميع الحالات',
        allCategories: 'جميع الفئات',
        actions: 'الإجراءات',
        close: 'إغلاق',
        successTicketCreated: 'تم إنشاء التذكرة بنجاح!',
        errorGeneric: 'تعذر تحميل بياناتك.',
        technicianSpace: 'الدعم الفني',
        technicianTitle: 'فضاء التقني',
        technicianSubtitle: 'الإشراف على الحوادث التقنية المبلغ عنها ومعالجتها',
        totalTickets: 'إجمالي التذاكر',
        toProcess: 'قيد المعالجة / قيد التنفيذ',
        resolved: 'تم الحل',
        ticketQueue: 'قائمة انتظار الحوادث',
        ticketQueueSubtitle: 'إدارة دورة حياة كل تذكرة تقنية',
        selectCategory: 'اختر الفئة',
        selectDepartment: 'اختر القسم',
        selectPriority: 'اختر الأولوية',
        status: 'الحالة',
        id: 'المعرف',
        titlePlaceholder: 'أدخل عنوان التذكرة...',
        descriptionPlaceholder: 'صف مشكلتك بالتفصيل...',

        // Categories & Departments
        HARDWARE: 'أجهزة عتادية',
        SOFTWARE: 'برمجيات',
        WEBSITE: 'موقع إلكتروني',
        NETWORK: 'شبكات',
        NETWORKING: 'شبكات',
        MAINTENANCE: 'صيانة',
        MAINTENANCE_INFORMATIQUE: 'صيانة الحاسوب والأنظمة',
        AUTRE: 'أخرى',
        OTHER: 'أخرى',
        IT: 'تكنولوجيا المعلومات',
        HR: 'الموارد البشرية',
        FINANCE: 'المالية',
        SUPPORT: 'الدعم الفني',
        UNCATEGORIZED: 'غير مصنف',

        NOUVEAU_NON_VU: 'جديد (غير مرئي)',
        NOUVEAU_VU: 'جديد (مرئي)',
        EN_COURS: 'قيد التنفيذ',
        RESOLU: 'تم الحل',
        FERME: 'مغلق',
        BASSE: 'منخفضة',
        MOYENNE: 'متوسطة',
        HAUTE: 'عالية',
        URGENTE: 'عاجلة'
    }
};

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState(() => localStorage.getItem('app_lang') || 'fr');

    useEffect(() => {
        localStorage.setItem('app_lang', locale);
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
    }, [locale]);

    const t = (key) => {
        if (!key) return '';

        // Convert to uppercase and replace spaces/hyphens with underscores (e.g. "maintenance informatique" -> "MAINTENANCE_INFORMATIQUE")
        const normalizedKey = key.toString().trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');

        return translations[locale]?.[key] ||
            translations[locale]?.[normalizedKey] ||
            translations['en'][key] ||
            translations['en'][normalizedKey] ||
            key;
    };

    const formatId = (id) => {
        if (!id) return '';
        if (locale === 'ar') {
            return Number(id).toLocaleString('ar-EG');
        }
        return id;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, formatId }}>
            {children}
        </LanguageContext.Provider>
    );
}