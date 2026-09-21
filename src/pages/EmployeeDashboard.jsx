import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
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
      const dropdownWidth = 320;
      let leftPos = rect.left;
      
      if (leftPos + dropdownWidth > window.innerWidth - 20) {
        leftPos = window.innerWidth - dropdownWidth - 20;
      }

      setCoords({
        top: rect.bottom + 8,
        left: leftPos,
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

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[99999] overflow-hidden"
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
        </div>,
        document.body
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

export default function EmployeeDashboard() {
    const { t, formatId } = useLanguage();
    const [tickets, setTickets] = useState([]);
    const [centers, setCenters] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [priorite, setPriorite] = useState('MOYENNE');
    const [centerId, setCenterId] = useState('');
    const [fichierJoint, setFichierJoint] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketComments, setTicketComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const navigate = useNavigate();

    const extractLabel = (item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.nom || item.libelle || item.name || item.title || item.code || JSON.stringify(item);
    };

    const extractId = (item) => {
        if (!item) return '';
        if (typeof item !== 'object') return item;
        return item.id || item._id || item.code || item.nom || '';
    };

    const getCenterName = useCallback((ticketOrCenterInput) => {
        let centerInput = ticketOrCenterInput;
        if (ticketOrCenterInput && typeof ticketOrCenterInput === 'object') {
            centerInput = 
                ticketOrCenterInput.centre || 
                ticketOrCenterInput.center || 
                ticketOrCenterInput.employe?.centre || 
                ticketOrCenterInput.employe?.center || 
                ticketOrCenterInput.centreId || 
                ticketOrCenterInput.centerId || 
                ticketOrCenterInput.centre_id || 
                ticketOrCenterInput.center_id;
        }
        if (!centerInput) return '';

        let centerObj = centerInput;
        
        if (centerInput && typeof centerInput !== 'object') {
            const found = centers.find(c => String(c.id || c._id) === String(centerInput));
            if (found) centerObj = found;
        }

        const rawName = typeof centerObj === 'object' 
            ? (centerObj.nom || centerObj.libelle || centerObj.name || centerObj.title || '') 
            : String(centerObj);

        if (!rawName || (rawName === String(centerInput) && rawName.length > 20)) {
            return '';
        }

        const trimmedKey = rawName.trim();
        const translated = t(trimmedKey);
        return translated !== trimmedKey ? translated : trimmedKey;
    }, [centers, t]);

    const fetchData = useCallback(async () => {
        try {
            const ticketRes = await api.get('/tickets');
            setTickets(ticketRes.data.data || ticketRes.data || []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
        }

        try {
            let centerRes;
            try {
                centerRes = await api.get('/centers');
            } catch {
                try {
                    centerRes = await api.get('/centres');
                } catch {
                    centerRes = await api.get('/api/centers');
                }
            }

            const rawData = centerRes?.data;
            const centerList = Array.isArray(rawData) 
                ? rawData 
                : (rawData?.data || rawData?.centers || rawData?.centres || rawData?.list || []);
            
            setCenters(Array.isArray(centerList) ? centerList : []);
        } catch (err) {
            console.error("Error fetching centers:", err);
            setErrorMsg(t('errorGeneric'));
        }
    }, [t]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            await fetchData();
            if (!isMounted) return;
        };
        load();
        return () => { isMounted = false; };
    }, [fetchData]);

    useEffect(() => {
        if (!selectedTicket?.id) {
            setTicketComments([]);
            return;
        }
        api.get(`/tickets/${selectedTicket.id}/commentaires`)
            .then(res => {
                setTicketComments(res.data.data || res.data || []);
            })
            .catch(() => {
                setTicketComments([]);
            });
    }, [selectedTicket]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const formData = new FormData();
            formData.append('titre', titre);
            formData.append('description', description);
            formData.append('priorite', priorite);
            formData.append('centerId', centerId || '');

            if (fichierJoint) {
                formData.append('fichier', fichierJoint);
            }

            await api.post('/tickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessMsg(t('successTicketCreated'));
            setTitre('');
            setDescription('');
            setPriorite('MOYENNE');
            setCenterId('');
            setFichierJoint(null);
            fetchData();
        } catch (err) {
            console.error("Error creating ticket:", err.response?.data || err);
            setErrorMsg(t('errorGeneric'));
        }
    };

    const handleCloseTicket = async (ticketId) => {
        try {
            await api.patch(`/tickets/${ticketId}/statut`, { statut: 'FERME' });
            fetchData();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => ({ ...prev, statut: 'FERME' }));
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
        } catch (err) {
            console.error("Erreur lors de l'envoi du commentaire:", err.response?.data || err.message);
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
                                <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">{t('employeeSpace')}</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{t('dashboardTitle')}</h1>
                            <p className="text-sm text-gray-500">{t('dashboardSubtitle')}</p>
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
                {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium shadow-sm">{successMsg}</div>}

                {/* New Ticket Form */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-xl p-8 space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">{t('reportIncident')}</h2>
                    <form onSubmit={handleCreateTicket} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{t('ticketTitle')}</label>
                            <input
                                type="text"
                                required
                                placeholder={t('titlePlaceholder')}
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{t('center') || 'Center'}</label>
                            <select
                                required
                                value={centerId}
                                onChange={(e) => setCenterId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="">{t('selectCenter') || 'Select Center'}</option>
                                {centers.map((center, index) => {
                                    const centerVal = extractId(center);
                                    const centerLabel = extractLabel(center);
                                    return (
                                        <option key={centerVal || index} value={centerVal}>
                                            {t(centerLabel) !== centerLabel ? t(centerLabel) : centerLabel}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{t('priority')}</label>
                            <select
                                value={priorite}
                                onChange={(e) => setPriorite(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="BASSE">{t('BASSE')}</option>
                                <option value="MOYENNE">{t('MOYENNE')}</option>
                                <option value="HAUTE">{t('HAUTE')}</option>
                                <option value="URGENTE">{t('URGENTE')}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{t('description')}</label>
                            <textarea
                                required
                                rows="3"
                                placeholder={t('descriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{t('fichierJoint')}</label>
                            <input
                                type="file"
                                id="hidden-file-input"
                                className="hidden"
                                onChange={(e) => setFichierJoint(e.target.files[0])}
                            />
                            <label 
                                htmlFor="hidden-file-input"
                                className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
                            >
                                <span className="truncate">{fichierJoint ? fichierJoint.name : t('noFileChosen')}</span>
                                <span className="ml-2 py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 shrink-0">{t('chooseFile')}</span>
                            </label>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-2xl text-sm transition-all shadow-md cursor-pointer"
                            >
                                {t('sendTicket')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Ticket History & Filters */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-xl p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{t('ticketHistory')}</h2>
                            <p className="text-xs text-gray-400">{t('ticketHistorySubtitle')}</p>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                            {filteredTickets.length} {t('totalTickets') || 'tickets'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">{t('id')}</th>
                                    <th className="p-4">{t('ticketTitle')} & {t('center') || 'Center'}</th>
                                    <th className="p-4">{t('priority')}</th>
                                    <th className="p-4">{t('status')}</th>
                                    <th className="p-4 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredTickets.map(ticket => {
                                    const centerName = getCenterName(ticket);
                                    const displayStatus = ticket.statut === 'RESOLU' ? 'FERME' : ticket.statut;
                                    return (
                                        <tr 
                                            key={ticket.id || ticket._id} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-4 font-mono text-xs text-gray-400 font-semibold">#{formatId(ticket.id)}</td>
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900">{ticket.titre}</div>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                    {centerName && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-800 border border-purple-200/50">
                                                            {centerName}
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
                                                <span className={`px-2.5 py-1 text-xs rounded-lg font-medium inline-block ${getStatusBadge(displayStatus)}`}>
                                                    {t(displayStatus)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                {displayStatus !== 'FERME' && (
                                                    <button
                                                        onClick={() => handleCloseTicket(ticket.id)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                                                    >
                                                        {t('close')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                                            {t('noUsersFound') || 'No tickets found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Ticket Details Modal */}
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
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('center') || 'Center'}</span>
                                    <span className="font-medium text-gray-800">{getCenterName(selectedTicket) || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('priority')}</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getPriorityBadge(selectedTicket.priorite)}`}>
                                        {t(selectedTicket.priorite)}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('status')}</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusBadge(selectedTicket.statut)}`}>
                                        {t(selectedTicket.statut)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('description')}</span>
                                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">{selectedTicket.description}</p>
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
                            <div className="border-t border-gray-100 pt-6 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('comments') || 'Comments'}</h3>
                                
                                <div className="space-y-3">
                                    {ticketComments.map((comment, idx) => (
                                        <div key={comment.id || idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-800">
                                                    {comment.auteur?.nom || comment.user?.prenom || comment.author || t('user')}
                                                </span>
                                               {(comment.dateCreation || comment.createdAt) 
                            ? new Date(comment.dateCreation || comment.createdAt).toLocaleDateString() 
                            : ''}
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.contenu || comment.texte || comment.content}</p>
                                        </div>
                                    ))}
                                    {ticketComments.length === 0 && (
                                        <p className="text-xs text-gray-400 italic">{t('noComments') || 'No comments yet.'}</p>
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                                    <input
                                        type="text"
                                        placeholder={t('writeComment') || 'Write a comment...'}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-sm transition-all shadow-sm cursor-pointer shrink-0"
                                    >
                                        {t('send') || 'Resolution'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            {selectedTicket.statut !== 'FERME' && (
                                <button
                                    onClick={() => handleCloseTicket(selectedTicket.id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                                >
                                    {t('closeTicket') || 'Close Ticket'}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                            >
                                {t('close')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}