import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

// ==========================================
// EMBEDDED NOTIFICATION BELL & HOOK
// ==========================================
function NotificationBell() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.status === 'success' || Array.isArray(res.data?.data) || Array.isArray(res.data)) {
        setNotifications(res.data.data || res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLue: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, estLue: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 6,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.estLue).length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 p-2.5 rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center"
        type="button"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={{
            top: `${coords.top}px`,
            right: `${coords.right}px`,
            transform: 'translateY(-100%)'
          }}
          className="fixed w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
        >
          <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                {t('markAllAsRead') || 'Tout marquer comme lu'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                {t('noNotifications') || 'Aucune notification'}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.estLue && markAsRead(n.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors ${
                    n.estLue ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50 font-medium'
                  }`}
                >
                  <p className="text-gray-800">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.dateEnvoi || n.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function AdminDashboard() {
    const { t, formatId } = useLanguage();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [showUserManagement, setShowUserManagement] = useState(true);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketComments, setTicketComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const navigate = useNavigate();

    const getDepartmentName = useCallback((ticket) => {
        const deptInput = ticket.departement || ticket.department || ticket.departement_id || ticket.departmentId || ticket.user?.departement || ticket.user?.service;
        if (!deptInput) return '';

        let deptObj = deptInput;
        
        if (deptInput && typeof deptInput !== 'object') {
            const found = centers.find(c => String(c.id || c._id) === String(deptInput));
            if (found) deptObj = found;
        }

        const rawName = typeof deptObj === 'object' 
            ? (deptObj.nom || deptObj.libelle || deptObj.name || deptObj.title || '') 
            : String(deptObj);

        const trimmedKey = rawName.trim();
        const translated = t(trimmedKey);
        return translated !== trimmedKey ? translated : trimmedKey;
    }, [centers, t]);

    const getCenterName = useCallback((ticket) => {
        const centerInput = ticket.centre || ticket.center || ticket.centre_id || ticket.centerId || ticket.user?.centre || ticket.user?.center;
        if (!centerInput) return t('N/A') || 'N/A';

        let rawName = '';
        if (typeof centerInput === 'object') {
            rawName = centerInput.nom || centerInput.libelle || centerInput.name || centerInput.code || '';
        } else {
            rawName = String(centerInput);
        }

        if (!rawName) return t('N/A') || 'N/A';

        const trimmedKey = rawName.trim();
        const translated = t(trimmedKey);
        return translated !== trimmedKey ? translated : trimmedKey;
    }, [t]);

    const fetchData = useCallback(async (isMounted = { current: true }) => {
        try {
            const [ticketRes, userRes, centerRes] = await Promise.all([
                api.get('/tickets'),
                api.get('/admin/users').catch(async () => {
                    return api.get('/users').catch(() => ({ data: [] }));
                }),
                api.get('/admin/centers').catch(async () => {
                    return api.get('/centers').catch(() => ({ data: [] }));
                })
            ]);

            if (!isMounted.current) return;

            setTickets(ticketRes.data.data || ticketRes.data || []);
            
            // Format user database objects
            const rawUsers = userRes.data.data || userRes.data.users || userRes.data || [];
            setUsers(Array.isArray(rawUsers) ? rawUsers : []);

            const centerData = centerRes.data.data || centerRes.data.centers || centerRes.data.centres || centerRes.data || [];
            setCenters(Array.isArray(centerData) ? centerData : []);

            setErrorMsg('');
        } catch {
            if (!isMounted.current) return;
            setErrorMsg(t('errorGeneric'));
        }
    }, [t]);

    useEffect(() => {
        const isMounted = { current: true };
        fetchData(isMounted);
        return () => { 
            isMounted.current = false; 
        };
    }, [fetchData]);

    useEffect(() => {
        if (!selectedTicket?.id) {
            setTicketComments([]);
            setNewStatus('');
            return;
        }
        setNewStatus(selectedTicket.statut || '');
        api.get(`/tickets/${selectedTicket.id}/commentaires`)
            .then(res => {
                setTicketComments(res.data.data || res.data || []);
            })
            .catch(() => {
                setTicketComments([]);
            });
    }, [selectedTicket]);

    const handleUpdateStatus = async (ticketId, statutValue) => {
        try {
            await api.patch(`/tickets/${ticketId}/statut`, { statut: statutValue });
            fetchData();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => ({ ...prev, statut: statutValue }));
            }
        } catch {
            alert(t('errorGeneric'));
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTicket?.id) return;
        
        try {
            const res = await api.post(`/tickets/${selectedTicket.id}/commentaires`, { 
                contenu: newComment,
                texte: newComment 
            });
            const addedComment = res.data.data || res.data;
            setTicketComments(prev => [...prev, addedComment]);
            setNewComment('');
        } catch (error) {
            console.error('Comment error:', error.response?.data || error);
            alert(t('errorGeneric'));
        }
    };

    const handleToggleDeactivateUser = async (userId) => {
        try {
            await api.patch(`/admin/users/${userId}/deactivate`).catch(() => api.patch(`/users/${userId}/toggle-active`));
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || t('errorGeneric'));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id?.toString().includes(searchTerm) ||
            getCenterName(ticket).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ticket.statut === statusFilter;

        return matchesSearch && matchesStatus;
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
                                <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                    {t('adminSpace') || 'Espace Administrateur'}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{t('adminDashboardTitle')}</h1>
                            <p className="text-sm text-gray-500">{t('adminDashboardSubtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
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
                        <div className="text-purple-600 text-xs font-bold uppercase tracking-wider">{t('totalUsers') || 'Comptes & Centres'}</div>
                        <div className="text-3xl font-black text-purple-600 mt-2">{users.length}</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-emerald-500 border-r border-y border-blue-100 shadow-xl">
                        <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">{t('resolvedTickets')}</div>
                        <div className="text-3xl font-black text-emerald-600 mt-2">
                            {tickets.filter(tItem => tItem.statut === 'RESOLU' || tItem.statut === 'FERME').length}
                        </div>
                    </div>
                </div>

                {/* SECTION TOGGLE BUTTON FOR USER & CENTER MANAGEMENT */}
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-blue-100 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{t('userManagementTitle') || 'Gestion des Comptes & Centres'}</h2>
                        <p className="text-xs text-gray-400">{t('userManagementSubtitle') || "Activer ou désactiver les comptes utilisateurs et centres"}</p>
                    </div>
                    <button
                        onClick={() => setShowUserManagement(!showUserManagement)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                        {showUserManagement ? (t('closeUserManagement') || 'Masquer la gestion des comptes') : (t('openUserManagement') || 'Afficher la gestion des comptes')}
                    </button>
                </div>

                {/* ACCOUNTS AND CENTRES TABLE */}
                {showUserManagement && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-purple-100 shadow-xl p-8 space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-md font-bold text-gray-900">{t('usersListTitle') || 'Tous les Comptes (Utilisateurs & Centres)'}</h3>
                                <p className="text-xs text-gray-400">{t('usersListSubtitle') || "Gérez l'accès de l'ensemble des comptes du système"}</p>
                            </div>
                            <span className="text-xs bg-purple-50 text-purple-800 font-semibold px-3 py-1.5 rounded-full border border-purple-200">
                                {users.length} {t('registeredUsersCount') || 'comptes enregistrés'}
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="p-4">{t('fullName') || 'Nom / Centre'}</th>
                                        <th className="p-4">{t('email') || 'Email'}</th>
                                        <th className="p-4">{t('role') || 'Rôle'}</th>
                                        <th className="p-4">{t('status') || 'Statut'}</th>
                                        <th className="p-4 text-right">{t('actions') || 'Activer / Désactiver'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {users.map((u, idx) => {
                                        // Detect if account is active from true / false database fields
                                        const isActive = u.statutActif !== undefined ? u.statutActif : (u.estActif !== undefined ? u.estActif : u.active !== false);
                                        
                                        // Detect center vs normal employee account
                                        const emailStr = (u.email || '').toLowerCase();
                                        const rawRole = (u.role || u.type || 'EMPLOYE').toUpperCase();
                                        const isCenter = emailStr.startsWith('centre') || u.nomCentre || (u.nom && u.nom.toLowerCase().includes('centre'));
                                        
                                        // Formatted Name Display
                                        const displayName = [u.nom, u.prenom].filter(Boolean).join(' ') || u.nomCentre || u.name || u.email;

                                        return (
                                            <tr key={u.id || u._id || idx} className="hover:bg-purple-50/25 transition-colors">
                                                <td className="p-4 font-semibold text-gray-900">
                                                    {displayName}
                                                </td>
                                                <td className="p-4 text-gray-600 font-mono text-xs">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                                        isCenter 
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                                            : 'bg-blue-50 text-blue-700 border-blue-200/50'
                                                    }`}>
                                                        {isCenter ? t('CENTRE') : (t(rawRole) || rawRole)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg inline-block ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                        {isActive ? (t('active') || 'Actif') : (t('deactivated') || 'Désactivé')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <label className="relative inline-flex items-center cursor-pointer select-none justify-end">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={Boolean(isActive)}
                                                            onChange={() => handleToggleDeactivateUser(u.id || u._id)}
                                                            className="sr-only peer" 
                                                        />
                                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                    </label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                                                {t('noUsersFound') || 'Aucun compte trouvé'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TICKETS MANAGEMENT SECTION */}
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

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder') || 'Rechercher par titre, ID ou centre...'}
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
                    </div>

                    {/* Tickets Table */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">{t('id')}</th>
                                    <th className="p-4">{t('ticketTitle')}</th>
                                    <th className="p-4">{t('centre') || 'Centre'}</th>
                                    <th className="p-4">{t('priority')}</th>
                                    <th className="p-4">{t('status')}</th>
                                    <th className="p-4 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredTickets.map(ticket => {
                                    const departmentName = getDepartmentName(ticket);
                                    const centerName = getCenterName(ticket);

                                    return (
                                        <tr 
                                            key={ticket.id || ticket._id} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-4 font-mono text-xs text-gray-400 font-semibold">#{formatId(ticket.id)}</td>
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900">{ticket.titre}</div>
                                                {departmentName && (
                                                    <div className="mt-1">
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-800 border border-purple-200/50">
                                                            {departmentName}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                                                    {centerName}
                                                </span>
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
                                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                                        <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                            {t('noTicketsFound')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Ticket Details & Comments Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <span className="text-xs font-mono font-bold text-gray-400">#{formatId(selectedTicket.id)}</span>
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{selectedTicket.titre}</h2>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('centre') || 'Centre'}</span>
                                    <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{getCenterName(selectedTicket)}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('department')}</span>
                                    <span className="font-medium text-gray-800">{getDepartmentName(selectedTicket) || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('priority')}</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getPriorityBadge(selectedTicket.priorite)}`}>
                                        {t(selectedTicket.priorite)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('status')}</span>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => {
                                            setNewStatus(e.target.value);
                                            handleUpdateStatus(selectedTicket.id, e.target.value);
                                        }}
                                        className="bg-white border border-gray-200 rounded-xl px-3 py-1 text-xs font-medium text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                                    >
                                        <option value="NOUVEAU_NON_VU">{t('NOUVEAU_NON_VU')}</option>
                                        <option value="NOUVEAU_VU">{t('NOUVEAU_VU')}</option>
                                        <option value="EN_COURS">{t('EN_COURS')}</option>
                                        <option value="RESOLU">{t('RESOLU')}</option>
                                        <option value="FERME">{t('FERME')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('description')}</span>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {selectedTicket.description}
                                </div>
                            </div>

                            {selectedTicket.fichier_joint && (
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('fichierJoint')}</span>
                                    <a 
                                        href={selectedTicket.fichier_joint} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-2xl transition-all"
                                    >
                                        <span>📎</span> {selectedTicket.fichier_joint.split('/').pop()}
                                    </a>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('comments') || 'Commentaires'}</h3>
                                
                                <div className="space-y-3">
                                    {ticketComments.map((comment, index) => (
                                        <div key={comment.id || index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-700">
                                                    {comment.auteur?.prenom && comment.auteur?.nom 
                                                        ? `${comment.auteur.prenom} ${comment.auteur.nom}` 
                                                        : (comment.auteur?.email || comment.user?.prenom || t('unknownUser') || 'Utilisateur')}
                                                </span>
                                                <span className="text-gray-400 font-mono">
                                                    {(comment.dateCreation || comment.createdAt) ? new Date(comment.dateCreation || comment.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800">{comment.contenu || comment.texte || comment.content}</p>
                                        </div>
                                    ))}
                                    {ticketComments.length === 0 && (
                                        <p className="text-xs text-gray-400 italic">{t('noComments') || 'Aucun commentaire pour le moment.'}</p>
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                                    <input
                                        type="text"
                                        placeholder={t('writeCommentPlaceholder') || 'Écrire un commentaire...'}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-sm transition-all shadow-md cursor-pointer shrink-0"
                                    >
                                        {t('send') || 'Envoyer'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                            >
                                {t('close') || 'Fermer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}