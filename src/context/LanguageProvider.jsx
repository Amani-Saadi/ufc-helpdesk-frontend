import { useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';

const translations = {
    en: {
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to access your dashboard',
        emailAddress: 'Email Address',
        email: 'Email',
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
        
        // File & Attachment translations
        fichierJoint: 'Attachment (File)',
        attachment: 'Attachment',
        attachments: 'Attachments',
        file: 'File',
        uploadFile: 'Upload a file',
        chooseFile: 'Choose file',
        noFileChosen: 'No file chosen',
        dragAndDropFile: 'Drag and drop your file here, or browse',
        download: 'Download',

        // Comments & Actions
        comments: 'Comments',
        writeComment: 'Write a comment...',
        sendComment: 'Send Comment',
        send: 'Send',
        closeTicket: 'Close Ticket',
        ticketClosedSuccessfully: 'Ticket closed successfully',
        noComments: 'No comments yet.',

        ticketHistory: 'My Tickets History',
        ticketHistorySubtitle: 'Check the progress of your requests',
        searchPlaceholder: 'Search by title or ID...',
        allStatuses: 'All statuses',
        allCategories: 'All categories',
        allDepartments: 'All departments',
        actions: 'Actions',
        details: 'Details',
        close: 'Close',
        successTicketCreated: 'Ticket created successfully!',
        errorGeneric: 'Unable to load your data.',
        technicianSpace: 'Technical Support',
        technicianTitle: 'Technician Space',
        technicianSubtitle: 'Supervise and process reported technical incidents',
        techSpace: 'Tech Space',
        TECHSPACE: 'Tech Space',
        adminSpace: 'Admin Space',
        ADMINSPACE: 'Admin Space',
        adminDashboardTitle: 'Administrator Dashboard',
        totalUsers: 'Total Users',
        resolvedTickets: 'Resolved Tickets',
        totalTickets: 'Total Tickets',
        toProcess: 'To Process / In Progress',
        resolved: 'Resolved',
        ticketQueue: 'Incident Queue',
        ticketQueueSubtitle: 'Manage the lifecycle of each technical ticket',
        noTicketsFound: 'No tickets found.',
        selectCategory: 'Select category',
        selectDepartment: 'Select department',
        selectPriority: 'Select priority',
        status: 'Status',
        id: 'ID',
        titlePlaceholder: 'Enter ticket title...',
        descriptionPlaceholder: 'Describe your issue in detail...',
        createdBy: 'Created by',

        // Notifications & Lists
        notifications: 'Notifications',
        markAllAsRead: 'Mark all as read',
        noNotifications: 'No notifications',
        usersListTitle: 'Users List',
        usersListSubtitle: 'Manage registered users and permissions',

        // User Management translations
        userManagementTitle: 'User Account Management',
        userManagementSubtitle: 'Enable or disable system employees and technicians',
        closeUserManagement: 'Close User Management',
        openUserManagement: 'Open User Management',
        employeeTechnicianList: 'List of Employees & Technicians',
        manageUserAccess: 'Manage user account access',
        registeredUsersCount: 'registered users',
        fullName: 'Full Name',
        role: 'Role',
        active: 'Active',
        disabled: 'Disabled',
        deactivate: 'Deactivate',
        activate: 'Activate',
        noUsersFound: 'No users found',

        // Roles
        ADMIN: 'Administrator',
        ADMINISTRATEUR: 'Administrator',
        TECHNICIEN: 'Technician',
        TECHNICIAN: 'Technician',
        TECHNICIEN_IT: 'IT Technician',
        TECHNICIAN_IT: 'IT Technician',
        EMPLOYE: 'Employee',
        EMPLOYEE: 'Employee',

        // Categories & Departments
        HARDWARE: 'Hardware',
        SOFTWARE: 'Software',
        WEBSITE: 'Website',
        SITE_WEB: 'Web Site',
        NETWORK: 'Network',
        NETWORKING: 'Networking',
        RESEAUX: 'Networks',
        RESEAU: 'Network',
        MAINTENANCE: 'Maintenance',
        MAINTENANCE_INFORMATIQUE: 'IT Maintenance',
        AUTRE: 'Other',
        OTHER: 'Other',

        // Departments & Custom Keys
        IT: 'IT Department',
        HR: 'Human Resources',
        FINANCE: 'Finance',
        SUPPORT: 'Support',
        UNCATEGORIZED: 'Uncategorized',
        DEPT_IT: 'IT & Network Department',
        DEPT_MAINTENANCE: 'Technical & Maintenance',
        DEPT_ADMINISTRATION: 'Administration & Academic Affairs',
        
        // Database Departments Translation
        'Administration': 'Administration',
        'Informatique': 'IT Department',
        'Technique': 'Technical Department',
        'TECHS': 'Technical',
        'TECH': 'Technical',
        'Ressources Humaines': 'Human Resources',

        // Statuses (French & English Enum Key Fallbacks)
        NOUVEAU_NON_VU: 'New (Unseen)',
        NOUVEAU_VU: 'New (Seen)',
        EN_COURS: 'In Progress',
        RESOLU: 'Resolved',
        FERME: 'Closed',
        NEW_UNSEEN: 'New (Unseen)',
        NEW_SEEN: 'New (Seen)',
        IN_PROGRESS: 'In Progress',
        RESOLVED: 'Resolved',
        CLOSED: 'Closed',

        // Priorities (French & English Enum Key Fallbacks)
        BASSE: 'Low',
        MOYENNE: 'Medium',
        HAUTE: 'High',
        URGENTE: 'Urgent',
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        URGENT: 'Urgent'
    },
    fr: {
        loginTitle: 'Bon Retour',
        loginSubtitle: 'Connectez-vous pour accéder à votre tableau de bord',
        emailAddress: 'Adresse e-mail',
        email: 'E-mail',
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
        
        // File & Attachment translations (French)
        fichierJoint: 'Pièce jointe',
        attachment: 'Pièce jointe',
        attachments: 'Pièces jointes',
        file: 'Fichier',
        uploadFile: 'Téléverser un fichier',
        chooseFile: 'Choisir un fichier',
        noFileChosen: 'Aucun fichier choisi',
        dragAndDropFile: 'Glissez-déposez votre fichier ici, ou parcourez',
        download: 'Télécharger',

        // Comments & Actions
        comments: 'Commentaires',
        writeComment: 'Écrire un commentaire...',
        sendComment: 'Envoyer le commentaire',
        send: 'Envoyer',
        closeTicket: 'Fermer le ticket',
        ticketClosedSuccessfully: 'Ticket fermé avec succès',
        noComments: 'Aucun commentaire pour le moment.',

        ticketHistory: 'Historique de mes Tickets',
        ticketHistorySubtitle: "Consultez l'état d'avancement de vos demandes",
        searchPlaceholder: 'Rechercher par titre ou ID...',
        allStatuses: 'Tous les statuts',
        allCategories: 'Toutes les catégories',
        allDepartments: 'Tous les départements',
        actions: 'Actions',
        details: 'Détails',
        close: 'Fermer',
        successTicketCreated: 'Ticket créé avec succès !',
        errorGeneric: 'Impossible de charger vos données.',
        technicianSpace: 'Support Technique',
        technicianTitle: 'Espace Technicien',
        technicianSubtitle: 'Supervisez et traitez les incidents techniques signalés',
        techSpace: 'Espace Tech',
        TECHSPACE: 'Espace Tech',
        adminSpace: 'Espace Admin',
        ADMINSPACE: 'Espace Admin',
        adminDashboardTitle: 'Tableau de bord Administrateur',
        totalUsers: 'Total Utilisateurs',
        resolvedTickets: 'Tickets Résolus',
        totalTickets: 'Total Tickets',
        toProcess: 'À Traiter / En Cours',
        resolved: 'Résolus',
        ticketQueue: "File d'Attente des Incidents",
        ticketQueueSubtitle: 'Gérez le cycle de vie de chaque ticket technique',
        noTicketsFound: 'Aucun ticket trouvé.',
        selectCategory: 'Sélectionner une catégorie',
        selectDepartment: 'Sélectionner un département',
        selectPriority: 'Sélectionner une priorité',
        status: 'Statut',
        id: 'ID',
        titlePlaceholder: 'Entrez le titre du ticket...',
        descriptionPlaceholder: 'Décrivez votre problème en détail...',
        createdBy: 'Créé par',

        // Notifications & Lists
        notifications: 'Notifications',
        markAllAsRead: 'Tout marquer comme lu',
        noNotifications: 'Aucune notification',
        usersListTitle: 'Liste des utilisateurs',
        usersListSubtitle: 'Gérez les utilisateurs enregistrés et leurs autorisations',

        // User Management translations
        userManagementTitle: 'Gestion des Comptes Utilisateurs',
        userManagementSubtitle: 'Activer ou désactiver les employés et techniciens du système',
        closeUserManagement: 'Fermer la gestion des utilisateurs',
        openUserManagement: 'Ouvrir la gestion des utilisateurs',
        employeeTechnicianList: 'Liste des Employés & Techniciens',
        manageUserAccess: "Gérez l'accès des comptes utilisateurs",
        registeredUsersCount: 'utilisateurs enregistrés',
        fullName: 'Nom & Prénom',
        role: 'Rôle',
        active: 'Actif',
        disabled: 'Désactivé',
        deactivate: 'Désactiver',
        activate: 'Activer',
        noUsersFound: 'Aucun utilisateur trouvé',

        // Roles
        ADMIN: 'Administrateur',
        ADMINISTRATEUR: 'Administrateur',
        TECHNICIEN: 'Technicien',
        TECHNICIAN: 'Technicien',
        TECHNICIEN_IT: 'Technicien_IT',
        TECHNICIAN_IT: 'Technicien_IT',
        EMPLOYE: 'Employé',
        EMPLOYEE: 'Employé',

        // Categories & Departments
        HARDWARE: 'Matériel',
        SOFTWARE: 'Logiciel',
        WEBSITE: 'Site Web',
        SITE_WEB: 'Site Web',
        NETWORK: 'Réseau',
        NETWORKING: 'Réseautage',
        RESEAUX: 'Réseaux',
        RESEAU: 'Réseau',
        MAINTENANCE: 'Maintenance',
        MAINTENANCE_INFORMATIQUE: 'Maintenance Informatique',
        AUTRE: 'Autre',
        OTHER: 'Autre',

        // Departments & Custom Keys
        IT: 'Informatique',
        HR: 'Ressources Humaines',
        FINANCE: 'Finance',
        SUPPORT: 'Support',
        UNCATEGORIZED: 'Non catégorisé',
        DEPT_IT: 'Département Informatique & Réseau',
        DEPT_MAINTENANCE: 'Technique & Maintenance',
        DEPT_ADMINISTRATION: 'Administration & Affaires Académiques',

        // Database Departments Translation
        'Administration': 'Administration',
        'Informatique': 'Informatique',
        'Technique': 'Technique',
        'TECHS': 'Technique',
        'TECH': 'Technique',
        'Ressources Humaines': 'Ressources Humaines',

        // Statuses (French & English Enum Key Fallbacks)
        NOUVEAU_NON_VU: 'Nouveau (Non vu)',
        NOUVEAU_VU: 'Nouveau (Vu)',
        EN_COURS: 'En cours',
        RESOLU: 'Résolu',
        FERME: 'Fermé',
        NEW_UNSEEN: 'Nouveau (Non vu)',
        NEW_SEEN: 'Nouveau (Vu)',
        IN_PROGRESS: 'En cours',
        RESOLVED: 'Résolu',
        CLOSED: 'Fermé',

        // Priorities (French & English Enum Key Fallbacks)
        BASSE: 'Basse',
        MOYENNE: 'Moyenne',
        HAUTE: 'Haute',
        URGENTE: 'Urgente',
        LOW: 'Basse',
        MEDIUM: 'Moyenne',
        HIGH: 'Haute',
        URGENT: 'Urgente'
    },
    ar: {
        loginTitle: 'مرحباً بك مجدداً',
        loginSubtitle: 'تسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك',
        emailAddress: 'البريد الإلكتروني',
        email: 'البريد الإلكتروني',
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
        
        // File & Attachment translations (Arabic)
        fichierJoint: 'الملف المرفق',
        attachment: 'مرفق',
        attachments: 'المرفقات',
        file: 'ملف',
        uploadFile: 'رفع ملف',
        chooseFile: 'اختر ملفاً',
        noFileChosen: 'لم يتم اختيار أي ملف',
        dragAndDropFile: 'قم بسحب وإفلات الملف هنا، أو تصفح الجهاز',
        download: 'تحميل',

        // Comments & Actions
        comments: 'التعليقات',
        writeComment: 'اكتب تعليقاً...',
        sendComment: 'إرسال التعليق',
        send: 'إرسال',
        closeTicket: 'إغلاق التذكرة',
        ticketClosedSuccessfully: 'تم إغلاق التذكرة بنجاح',
        noComments: 'لا توجد تعليقات حتى الآن.',
        
        ticketHistory: 'سجل تذاكري',
        ticketHistorySubtitle: 'تحقق من تقدم طلباتك',
        searchPlaceholder: 'البحث بالعنوان أو المعرف...',
        allStatuses: 'جميع الحالات',
        allCategories: 'جميع الفئات',
        allDepartments: 'جميع الأقسام',
        actions: 'الإجراءات',
        details: 'التفاصيل',
        close: 'إغلاق',
        successTicketCreated: 'تم إنشاء التذكرة بنجاح!',
        errorGeneric: 'تعذر تحميل بياناتك.',
        technicianSpace: 'الدعم الفني',
        technicianTitle: 'فضاء التقني',
        technicianSubtitle: 'الإشراف على الحوادث التقنية المبلغ عنها ومعالجتها',
        techSpace: 'الفضاء التقني',
        TECHSPACE: 'الفضاء التقني',
        adminSpace: 'فضاء المسؤول',
        ADMINSPACE: 'فضاء المسؤول',
        adminDashboardTitle: 'لوحة تحكم المسؤول',
        totalUsers: 'إجمالي المستخدمين',
        resolvedTickets: 'التذاكر المحلولة',
        totalTickets: 'إجمالي التذاكر',
        toProcess: 'قيد المعالجة / قيد التنفيذ',
        resolved: 'تم الحل',
        ticketQueue: 'قائمة انتظار الحوادث',
        ticketQueueSubtitle: 'إدارة دورة حياة كل تذكرة تقنية',
        noTicketsFound: 'لم يتم العثور على أي تذاكر.',
        selectCategory: 'اختر الفئة',
        selectDepartment: 'اختر القسم',
        selectPriority: 'اختر الأولوية',
        status: 'الحالة',
        id: 'المعرف',
        titlePlaceholder: 'أدخل عنوان التذكرة...',
        descriptionPlaceholder: 'صف مشكلتك بالتفصيل...',
        createdBy: 'أنشئت بواسطة',

        // Notifications & Lists
        notifications: 'الإشعارات',
        markAllAsRead: 'تحديد الكل كمقروء',
        noNotifications: 'لا توجد إشعارات',
        usersListTitle: 'قائمة المستخدمين',
        usersListSubtitle: 'إدارة المستخدمين المسجلين والصلاحيات',

        // User Management translations
        userManagementTitle: 'إدارة حسابات المستخدمين',
        userManagementSubtitle: 'تفعيل أو تعطيل موظفي وتقنيي النظام',
        closeUserManagement: 'إغلاق إدارة المستخدمين',
        openUserManagement: 'فتح إدارة المستخدمين',
        employeeTechnicianList: 'قائمة الموظفين والتقنيين',
        manageUserAccess: 'إدارة صلاحيات الوصول لحسابات المستخدمين',
        registeredUsersCount: 'مستخدم مسجل',
        fullName: 'الاسم الكامل',
        role: 'الدور',
        active: 'نشط',
        disabled: 'معطل',
        deactivate: 'تعطيل',
        activate: 'تفعيل',
        noUsersFound: 'لم يتم العثور على مستخدمين',

        // Roles
        ADMIN: 'مسؤول النظام',
        ADMINISTRATEUR: 'مسؤول النظام',
        TECHNICIEN: 'تقني',
        TECHNICIAN: 'تقني',
        TECHNICIEN_IT: 'تقني',
        TECHNICIAN_IT: 'تقني',
        EMPLOYE: 'موظف',
        EMPLOYEE: 'موظف',

        // Categories & Departments
        HARDWARE: 'أجهزة عتادية',
        SOFTWARE: 'برمجيات',
        WEBSITE: 'موقع إلكتروني',
        SITE_WEB: 'موقع إلكتروني',
        NETWORK: 'شبكات',
        NETWORKING: 'شبكات',
        RESEAUX: 'شبكات',
        RESEAU: 'شبكة',
        MAINTENANCE: 'صيانة',
        MAINTENANCE_INFORMATIQUE: 'صيانة الحاسوب والأنظمة',
        AUTRE: 'أخرى',
        OTHER: 'أخرى',

        // Departments & Custom Keys
        IT: 'تكنولوجيا المعلومات',
        HR: 'الموارد البشرية',
        FINANCE: 'المالية',
        SUPPORT: 'الدعم الفني',
        UNCATEGORIZED: 'غير مصنف',
        DEPT_IT: 'قسم تكنولوجيا المعلومات والشبكات',
        DEPT_MAINTENANCE: 'قسم التقنية والصيانة',
        DEPT_ADMINISTRATION: 'قسم الإدارة والشؤون الأكاديمية',

        // Database Departments Translation
        'Administration': 'الإدارة',
        'Informatique': 'الإعلام الآلي',
        'Technique': 'القسم التقني',
        'TECHS': 'القسم التقني',
        'TECH': 'القسم التقني',
        'Ressources Humaines': 'الموارد البشرية',

        // Statuses (French & English Enum Key Fallbacks)
        NOUVEAU_NON_VU: 'جديد (غير مرئي)',
        NOUVEAU_VU: 'جديد (مرئي)',
        EN_COURS: 'قيد التنفيذ',
        RESOLU: 'تم الحل',
        FERME: 'مغلق',
        NEW_UNSEEN: 'جديد (غير مرئي)',
        NEW_SEEN: 'جديد (مرئي)',
        IN_PROGRESS: 'قيد التنفيذ',
        RESOLVED: 'تم الحل',
        CLOSED: 'مغلق',

        // Priorities (French & English Enum Key Fallbacks)
        BASSE: 'منخفضة',
        MOYENNE: 'متوسطة',
        HAUTE: 'عالية',
        URGENTE: 'عاجلة',
        LOW: 'منخفضة',
        MEDIUM: 'متوسطة',
        HIGH: 'عالية',
        URGENT: 'عاجلة'
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
        const stringKey = key.toString().trim();
        const lowerKey = stringKey.toLowerCase();

        // 1. Check current locale (exact match)
        if (translations[locale]?.[stringKey] !== undefined) {
            return translations[locale][stringKey];
        }

        // 2. Check current locale (case-insensitive match)
        const currentDict = translations[locale];
        if (currentDict) {
            for (const dictKey in currentDict) {
                if (dictKey.toLowerCase() === lowerKey) {
                    return currentDict[dictKey];
                }
            }
        }

        // 3. Check English fallback (exact match)
        if (translations['en'][stringKey] !== undefined) {
            return translations['en'][stringKey];
        }

        // 4. Check English fallback (case-insensitive match)
        const enDict = translations['en'];
        if (enDict) {
            for (const dictKey in enDict) {
                if (dictKey.toLowerCase() === lowerKey) {
                    return enDict[dictKey];
                }
            }
        }

        return key;
    };

    const formatId = (id) => {
        if (!id) return '';
        if (locale === 'ar') {
            const num = Number(id);
            if (!isNaN(num)) {
                return num.toLocaleString('ar-EG');
            }
        }
        return id;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, formatId }}>
            {children}
        </LanguageContext.Provider>
    );
}

export default LanguageProvider;