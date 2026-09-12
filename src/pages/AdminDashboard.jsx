import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

const getStatusBadge = (statut) => {
    switch (statut) {
        case 'NOUVEAU_NON_VU':
            return 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs';
        case 'NOUVEAU_VU':
            return 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs';
        case 'EN_COURS':
            return 'bg-sky-50 text-sky-700 border border-sky-200/60 shadow-2xs';
        case 'RESOLU':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs';
        case 'FERME':
            return 'bg-slate-100 text-slate-600 border border-slate-200/60 shadow-2xs';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

const getPriorityBadge = (priorite) => {
    switch (priorite) {
        case 'URGENTE':
            return 'bg-red-50 text-red-700 font-bold border border-red-200/60 shadow-2xs animate-pulse';
        case 'HAUTE':
            return 'bg-orange-50 text-orange-700 border border-orange-200/60 shadow-2xs';
        case 'MOYENNE':
            return 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs';
        case 'BASSE':
            return 'bg-slate-50 text-slate-600 border border-slate-200/60 shadow-2xs';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

const getCategoryBadge = (categorie) => {
    const name = (typeof categorie === 'object' ? (categorie?.nom || categorie?.libelle || '') : categorie).toUpperCase();
    if (name.includes('MAINTENANCE')) {
        return 'bg-amber-50 text-amber-800 border border-amber-200/50';
    }
    if (name.includes('RESEAU') || name.includes('NETWORK')) {
        return 'bg-blue-50 text-blue-800 border border-blue-200/50';
    }
    if (name.includes('SITE') || name.includes('WEB')) {
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200/50';
    }
    return 'bg-slate-50 text-slate-700 border border-slate-200/50';
};

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const navigate = useNavigate();

    const getCategoryName = (categorie) => {
        if (!categorie) return t('uncategorized');
        let rawCat = categorie;
        if (typeof categorie === 'object') {
            rawCat = categorie.nom || categorie.libelle || categorie.titre || 'other';
        }
        return t(rawCat);
    };

    const getDepartmentName = (ticket) => {
        const dept = ticket.departement || ticket.service || ticket.employe?.departement || ticket.employe?.service;
        if (!dept) return '';
        if (typeof dept === 'object') {
            return dept.nom || dept.libelle || '';
        }
        return dept;
    };

    const fetchData = async () => {
        try {
            const [ticketRes, userRes, catRes] = await Promise.all([
                api.get('/tickets'),
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/categories').catch(() => ({ data: [] }))
            ]);

            setTickets(ticketRes.data.data || ticketRes.data || []);
            setUsers(userRes.data.data || userRes.data || []);
            setCategories(catRes.data.data || catRes.data || []);
        } catch {
            setErrorMsg(t('errorGeneric'));
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const [ticketRes, userRes, catRes] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/users').catch(() => ({ data: [] })),
                    api.get('/categories').catch(() => ({ data: [] }))
                ]);
                if (!isMounted) return;

                setTickets(ticketRes.data.data || ticketRes.data || []);
                setUsers(userRes.data.data || userRes.data || []);
                setCategories(catRes.data.data || catRes.data || []);
            } catch {
                if (!isMounted) return;
                setErrorMsg(t('errorGeneric'));
            }
        };
        load();
        return () => { isMounted = false; };
    }, [t]);

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            await api.patch(`/tickets/${ticketId}/statut`, { statut: newStatus });
            fetchData();
        } catch {
            alert(t('errorGeneric'));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id?.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || ticket.statut === statusFilter;

        const rawCat = typeof ticket.categorie === 'object' ? (ticket.categorie?.nom || ticket.categorie?.libelle || '') : (ticket.categorie || '');
        const matchesCategory = categoryFilter === 'ALL' || rawCat.toUpperCase().includes(categoryFilter.toUpperCase());

        return matchesSearch && matchesStatus && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 md:p-10 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-t-4 border-t-blue-600 border-x border-b border-blue-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-md p-1 overflow-hidden">
                            <img src={logoUfc} alt="Logo UFC" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">{t('adminSpace')}</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{t('adminDashboardTitle')}</h1>
                            <p className="text-sm text-gray-500">{t('adminDashboardSubtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <button
                            onClick={handleLogout}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium px-4 py-2.5 rounded-2xl text-sm transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-2"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>

                {errorMsg && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium shadow-sm">{errorMsg}</div>}

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-blue-600 border-r border-y border-blue-100 shadow-xl">
                        <div className="text-blue-600 text-xs font-bold uppercase tracking-wider">{t('totalTickets')}</div>
                        <div className="text-3xl font-black text-gray-900 mt-2">{tickets.length}</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-purple-600 border-r border-y border-blue-100 shadow-xl">
                        <div className="text-purple-600 text-xs font-bold uppercase tracking-wider">{t('totalUsers')}</div>
                        <div className="text-3xl font-black text-purple-600 mt-2">{users.length}</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-emerald-500 border-r border-y border-blue-100 shadow-xl">
                        <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">{t('resolvedTickets')}</div>
                        <div className="text-3xl font-black text-emerald-600 mt-2">
                            {tickets.filter(tItem => tItem.statut === 'RESOLU' || tItem.statut === 'FERME').length}
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-xl p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{t('systemTickets')}</h2>
                            <p className="text-xs text-gray-400">{t('systemTicketsSubtitle')}</p>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                            {filteredTickets.length} {t('displayedCount')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                        >
                            <option value="ALL">{t('allStatuses')}</option>
                            <option value="NOUVEAU_NON_VU">{t('NOUVEAU_NON_VU')}</option>
                            <option value="NOUVEAU_VU">{t('NOUVEAU_VU')}</option>
                            <option value="EN_COURS">{t('EN_COURS')}</option>
                            <option value="RESOLU">{t('RESOLU')}</option>
                            <option value="FERME">{t('FERME')}</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                        >
                            <option value="ALL">{t('allCategories')}</option>
                            {categories.map(cat => {
                                const catVal = cat.nom || cat.libelle || cat;
                                return (
                                    <option key={cat.id || catVal} value={catVal}>
                                        {t(catVal)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">{t('ticketTitle')} & {t('category')}</th>
                                    <th className="p-4">{t('priority')}</th>
                                    <th className="p-4">{t('status')}</th>
                                    <th className="p-4 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredTickets.map(ticket => {
                                    const categoryName = getCategoryName(ticket.categorie);
                                    const departmentName = getDepartmentName(ticket);
                                    return (
                                        <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 font-mono text-xs text-gray-400 font-semibold">#{ticket.id}</td>
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900">{ticket.titre}</div>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${getCategoryBadge(ticket.categorie)}`}>
                                                        {categoryName}
                                                    </span>
                                                    {departmentName && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-800 border border-purple-200/50">
                                                            {departmentName}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs rounded-lg font-medium inline-block ${getPriorityBadge(ticket.priorite)}`}>
                                                    {t(ticket.priorite)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs rounded-lg font-medium inline-block ${getStatusBadge(ticket.statut)}`}>
                                                    {t(ticket.statut)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <select
                                                    value={ticket.statut}
                                                    onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                                                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                                                >
                                                    <option value="NOUVEAU_NON_VU">{t('NOUVEAU_NON_VU')}</option>
                                                    <option value="NOUVEAU_VU">{t('NOUVEAU_VU')}</option>
                                                    <option value="EN_COURS">{t('EN_COURS')}</option>
                                                    <option value="RESOLU">{t('RESOLU')}</option>
                                                    <option value="FERME">{t('FERME')}</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                                            {t('noTicketsFound')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}