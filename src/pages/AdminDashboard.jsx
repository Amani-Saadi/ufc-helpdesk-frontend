import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ResponseTimeBadge from '../components/ResponseTimeBadge';
import { RESPONSE_LIMIT_MS, formatDurationInMs, getTicketResponse } from '../utils/responseTime';

// Helper for Authorization Headers
const getAuthHeader = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Average response time (ms) for ALL tickets in a list.
// Resolved/closed tickets use creation -> resolution/closure.
// Open tickets use creation -> now, so every technician always has a value.
const computeDayStats = (ticketList) => {
  const now = Date.now();
  const responses = ticketList
    .map(tk => getTicketResponse(tk, now))
    .filter(Boolean);

  const durations = responses.map(response => Math.max(response.ms, 0));
  const avgMs = durations.length
    ? durations.reduce((acc, ms) => acc + ms, 0) / durations.length
    : 0;

  const resolved = responses.filter(response => response.done).length;
  const open = responses.filter(response => !response.done).length;

  return {
    total: ticketList.length,
    resolved,
    open,
    measured: durations.length,
    avgMs,
    avgFormatted: formatDurationInMs(avgMs) || '0.0 h'
  };
};

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'NOUVEAU_NON_VU': return 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs';
    case 'NOUVEAU_VU': return 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs';
    case 'EN_COURS': return 'bg-sky-50 text-sky-700 border border-sky-200/60 shadow-2xs';
    case 'RESOLU': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs';
    case 'FERME': return 'bg-slate-100 text-slate-600 border border-slate-200/60 shadow-2xs';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getPriorityBadge = (priorite) => {
  switch (priorite) {
    case 'URGENTE': return 'bg-red-50 text-red-700 font-bold border border-red-200/60 shadow-2xs animate-pulse';
    case 'HAUTE': return 'bg-orange-50 text-orange-700 border border-orange-200/60 shadow-2xs';
    case 'MOYENNE': return 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs';
    case 'BASSE': return 'bg-slate-50 text-slate-600 border border-slate-200/60 shadow-2xs';
    default: return 'bg-slate-100 text-slate-700';
  }
};

// ==========================================
// EMBEDDED NOTIFICATION BELL
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
      const res = await api.get('/notifications', getAuthHeader());
      if (res.data?.status === 'success' || Array.isArray(res.data?.data) || Array.isArray(res.data)) {
        setNotifications(res.data.data || res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {}, getAuthHeader());
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLue: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {}, getAuthHeader());
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

      setCoords({ top: rect.bottom + 8, left: leftPos });
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
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                {t('markAllAsRead') || 'Tout marquer comme lu'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">{t('noNotifications') || 'Aucune notification'}</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.estLue && markAsRead(n.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors ${n.estLue ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50 font-medium'}`}
                >
                  <p className="text-gray-800">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.dateEnvoi || n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function AdminDashboard() {
  const { t, formatId } = useLanguage();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showTechStats, setShowTechStats] = useState(true);
  const [showCentersSection, setShowCentersSection] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedCenterDetail, setSelectedCenterDetail] = useState(null);
  const [selectedCenterToAdd, setSelectedCenterToAdd] = useState('');
  const [newCenterForm, setNewCenterForm] = useState({ nom: '', codeBureau: '' });

  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, targetType: '', targetId: '', targetName: '' });
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState('');

  const [creatingUser, setCreatingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  const [newUserForm, setNewUserForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'TECHNICIEN_IT', specialite: '', centreId: ''
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketComments, setTicketComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getDepartmentName = useCallback((ticket) => {
    const deptInput = ticket.departement || ticket.department || ticket.departement_id || ticket.departmentId || ticket.user?.departement || ticket.user?.service;
    if (!deptInput) return '';

    let deptObj = deptInput;
    if (typeof deptInput !== 'object') {
      const found = centers.find(c => String(c.id || c._id) === String(deptInput));
      if (found) deptObj = found;
    }

    const rawName = typeof deptObj === 'object' ? (deptObj.nom || deptObj.libelle || deptObj.name || deptObj.title || '') : String(deptObj);
    const trimmedKey = rawName.trim();
    const translated = t(trimmedKey);
    return translated !== trimmedKey ? translated : trimmedKey;
  }, [centers, t]);

  const getCenterName = useCallback((ticket) => {
    const centerInput = ticket.centre || ticket.center || ticket.centre_id || ticket.centerId || ticket.user?.centre || ticket.user?.center;
    if (!centerInput) return t('N/A') || 'N/A';

    const rawName = typeof centerInput === 'object' 
      ? (centerInput.nom || centerInput.libelle || centerInput.name || centerInput.code || '') 
      : String(centerInput);

    if (!rawName) return t('N/A') || 'N/A';
    const trimmedKey = rawName.trim();
    const translated = t(trimmedKey);
    return translated !== trimmedKey ? translated : trimmedKey;
  }, [t]);

  // Does this ticket belong to the given center? Checks every place the backend
  // may put the center (object, id fields, creator's center) and compares by id,
  // name or code, so it works whatever shape the ticket payload has.
  const ticketBelongsToCenter = useCallback((ticket, center) => {
    if (!ticket || !center) return false;
    const norm = (v) => (v === undefined || v === null ? '' : String(v).trim().toLowerCase());

    const centerIds = [center.id, center._id].map(norm).filter(Boolean);
    const centerNames = [center.nom, center.name, center.libelle].map(norm).filter(Boolean);
    const centerCodes = [center.codeCentre, center.codeBureau, center.code].map(norm).filter(Boolean);

    const creator = ticket.createur || ticket.creator || ticket.auteur || ticket.user || ticket.utilisateur || {};
    const candidates = [
      ticket.centre, ticket.center, ticket.centreId, ticket.centerId, ticket.centre_id, ticket.center_id,
      creator.centre, creator.center, creator.centreId, creator.centerId, creator.centre_id
    ];

    return candidates.some((c) => {
      if (c === undefined || c === null || c === '') return false;
      if (typeof c === 'object') {
        const ids = [c.id, c._id].map(norm).filter(Boolean);
        const names = [c.nom, c.name, c.libelle].map(norm).filter(Boolean);
        const codes = [c.codeCentre, c.codeBureau, c.code].map(norm).filter(Boolean);
        return ids.some(v => centerIds.includes(v)) ||
               names.some(v => centerNames.includes(v)) ||
               codes.some(v => centerCodes.includes(v));
      }
      const v = norm(c);
      return centerIds.includes(v) || centerNames.includes(v) || centerCodes.includes(v);
    });
  }, []);

  const fetchData = useCallback(async (isMounted = { current: true }) => {
    try {
      const authHeader = getAuthHeader();
      const ticketRes = await api.get('/tickets', authHeader).catch(() => ({ data: [] }));

      let rawUsers = [];
      try {
        const userRes = await api.get('/admin/users', authHeader);
        rawUsers = userRes.data.data || userRes.data.users || userRes.data || [];
      } catch {
        try {
          const fallbackUserRes = await api.get('/users', authHeader);
          rawUsers = fallbackUserRes.data.data || fallbackUserRes.data || [];
        } catch { rawUsers = []; }
      }

      let centerData = [];
      try {
        const centerRes = await api.get('/admin/centers', authHeader);
        centerData = centerRes.data.data || centerRes.data.centers || centerRes.data.centres || centerRes.data || [];
      } catch {
        try {
          const fallbackCenterRes = await api.get('/centers', authHeader);
          centerData = fallbackCenterRes.data.data || fallbackCenterRes.data || [];
        } catch { centerData = []; }
      }

      if (!isMounted.current) return;

      setTickets(ticketRes.data.data || ticketRes.data || []);
      setUsers(Array.isArray(rawUsers) ? rawUsers : []);
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
    const interval = setInterval(() => fetchData(isMounted), 60000);
    return () => { isMounted.current = false; clearInterval(interval); };
  }, [fetchData]);

  useEffect(() => {
    if (!selectedTicket?.id) {
      setTicketComments([]);
      setNewStatus('');
      return;
    }
    setNewStatus(selectedTicket.statut || '');
    api.get(`/tickets/${selectedTicket.id}/commentaires`, getAuthHeader())
      .then(res => setTicketComments(res.data.data || res.data || []))
      .catch(() => setTicketComments([]));
  }, [selectedTicket]);

  const handleUpdateStatus = async (ticketId, statutValue) => {
    try {
      await api.patch(`/tickets/${ticketId}/statut`, { statut: statutValue }, getAuthHeader());
      fetchData();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, statut: statutValue }));
      }
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleAssignTicketTech = async (ticketId, techId) => {
    try {
      const authHeader = getAuthHeader();
      const res = await api.patch(`/admin/tickets/${ticketId}/assign`, { technicienId: techId ? parseInt(techId, 10) : null }, authHeader);
      const updated = res.data?.data;
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, technicienId: updated?.technicienId ?? null, technicien: updated?.technicien ?? null }));
      }
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm(t('confirmDeleteTicket') || "Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?")) return;
    try {
      const authHeader = getAuthHeader();
      await api.delete(`/admin/tickets/${ticketId}`, authHeader);
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket?.id) return;
    try {
      const res = await api.post(`/tickets/${selectedTicket.id}/commentaires`, { 
        contenu: newComment,
        texte: newComment 
      }, getAuthHeader());
      setTicketComments(prev => [...prev, res.data.data || res.data]);
      setNewComment('');
    } catch {
      alert(t('errorGeneric'));
    }
  };

  const handleToggleDeactivateUser = async (userId, e) => {
    if (e) e.stopPropagation();
    try {
      const authHeader = getAuthHeader();
      await api.patch(`/admin/users/${userId}/deactivate`, {}, authHeader);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleDeleteUser = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(t('confirmDeleteUser') || "Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?")) return;
    try {
      const authHeader = getAuthHeader();
      await api.delete(`/admin/users/${userId}`, authHeader);
      setSelectedTech(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleToggleDeactivateCenter = async (centerId, e) => {
    if (e) e.stopPropagation();
    try {
      const authHeader = getAuthHeader();
      await api.patch(`/admin/centers/${centerId}/deactivate`, {}, authHeader);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleAddCenter = async (e) => {
    e.preventDefault();
    if (!newCenterForm.nom.trim()) return;
    try {
      await api.post('/admin/centers', { nom: newCenterForm.nom.trim(), codeBureau: newCenterForm.codeBureau.trim() || null }, getAuthHeader());
      setNewCenterForm({ nom: '', codeBureau: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleDeleteCenter = async (centerId) => {
    if (!window.confirm(t('confirmDeleteCenter') || "Êtes-vous sûr de vouloir supprimer définitivement ce centre ?")) return;
    try {
      const authHeader = getAuthHeader();
      await api.delete(`/admin/centers/${centerId}`, authHeader);
      setSelectedCenterDetail(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleAssignCenterToTech = async (techId, centerId) => {
    if (!centerId) return;
    try {
      const res = await api.post(`/admin/technicians/${techId}/centers`, { centreId: parseInt(centerId, 10) }, getAuthHeader());
      const updatedCenters = res.data?.data?.centres || [];
      setSelectedTech(prev => prev ? { ...prev, centres: updatedCenters } : prev);
      setSelectedCenterToAdd('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleRemoveCenterFromTech = async (techId, centerIdToRemove) => {
    try {
      const res = await api.delete(`/admin/technicians/${techId}/centers/${centerIdToRemove}`, getAuthHeader());
      const updatedCenters = res.data?.data?.centres || [];
      setSelectedTech(prev => prev ? { ...prev, centres: updatedCenters } : prev);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleSavePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPasswordValue || !resetPasswordModal.targetId) return;

    try {
      const endpoint = resetPasswordModal.targetType === 'tech' 
        ? `/admin/users/${resetPasswordModal.targetId}/password` 
        : `/admin/centers/${resetPasswordModal.targetId}/password`;

      await api.patch(endpoint, { nouveauMotDePasse: newPasswordValue, password: newPasswordValue }, getAuthHeader());
      setPasswordResetSuccess(t('passwordUpdatedSuccessfully') || 'Mot de passe mis à jour avec succès !');
      
      timeoutRef.current = setTimeout(() => {
        setPasswordResetSuccess('');
        setNewPasswordValue('');
        setResetPasswordModal({ isOpen: false, targetType: '', targetId: '', targetName: '' });
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || t('errorGeneric'));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setCreatingUser(true);

    try {
      const payload = {
        ...newUserForm,
        centreId: newUserForm.centreId ? parseInt(newUserForm.centreId, 10) : null,
      };

      await api.post('/admin/users', payload, getAuthHeader());
      setShowCreateModal(false);
      setNewUserForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'TECHNICIEN_IT', specialite: '', centreId: '' });
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || t('errorGeneric') || t('errorCreatingUser') || 'Erreur lors de la création.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const technicians = users.filter(u => {
    const rawRole = (u.role || u.type || '').toUpperCase();
    return rawRole === 'TECHNICIEN_IT' || rawRole === 'TECHNICIEN';
  });

  const techStatsMap = technicians.map(tech => {
    const techId = String(tech.id || tech._id);
    const assignedTickets = tickets.filter(tItem => {
      const tTechId = String(tItem.technicienId || tItem.technicianId || tItem.technicien?.id || tItem.technician?.id || '');
      return tTechId === techId;
    });

    const resolvedTickets = assignedTickets.filter(tItem => tItem.statut === 'RESOLU' || tItem.statut === 'FERME');
    const resolvedCount = resolvedTickets.length;
    const pendingCount = assignedTickets.filter(tItem => tItem.statut !== 'RESOLU' && tItem.statut !== 'FERME').length;

    // Technician-level response KPI: average response time across all resolved/closed
    // tickets assigned to this technician.
    const overallStats = computeDayStats(assignedTickets);

    return { ...tech, totalAssigned: assignedTickets.length, resolvedCount, pendingCount, overallStats };
  });

  const centerTickets = selectedCenterDetail
    ? tickets.filter(tItem => ticketBelongsToCenter(tItem, selectedCenterDetail))
    : [];

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
              onClick={() => setShowPasswordModal(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 p-2.5 rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center"
              title={t('changePassword') || 'Modifier mon mot de passe'}
            >
              🔑
            </button>
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
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-sky-600 border-r border-y border-blue-100 shadow-xl">
            <div className="text-sky-600 text-xs font-bold uppercase tracking-wider">{t('techniciansCount') || 'Techniciens Actifs'}</div>
            <div className="text-3xl font-black text-sky-600 mt-2">{technicians.length}</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-l-4 border-l-emerald-500 border-r border-y border-blue-100 shadow-xl">
            <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">{t('resolvedTickets')}</div>
            <div className="text-3xl font-black text-emerald-600 mt-2">
              {tickets.filter(tItem => tItem.statut === 'RESOLU' || tItem.statut === 'FERME').length}
            </div>
          </div>
        </div>

        {/* ADMIN NAVIGATION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowTechStats(prev => !prev)}
            className={`p-5 rounded-3xl border transition-all shadow-lg flex items-center justify-between cursor-pointer ${showTechStats ? 'bg-sky-600 text-white border-sky-500 shadow-sky-600/30' : 'bg-white/95 text-gray-800 border-sky-100 hover:bg-sky-50/50'}`}
          >
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">{t('section01')}</span>
              <h3 className="text-md font-bold mt-0.5">🛠️ {t('techsButtonTitle') || 'Gestion Techniciens'}</h3>
              <p className="text-xs opacity-80 mt-1">{technicians.length} {t('techniciansRegistered') || 'techniciens'}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${showTechStats ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-700'}`}>
              {showTechStats ? (t('active') || 'Actif') : (t('show') || 'Afficher')}
            </span>
          </button>

          <button
            onClick={() => setShowCentersSection(prev => !prev)}
            className={`p-5 rounded-3xl border transition-all shadow-lg flex items-center justify-between cursor-pointer ${showCentersSection ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30' : 'bg-white/95 text-gray-800 border-amber-100 hover:bg-amber-50/50'}`}
          >
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">{t('section02')}</span>
              <h3 className="text-md font-bold mt-0.5">🏢 {t('centersButtonTitle') || 'Gestion Centres'}</h3>
              <p className="text-xs opacity-80 mt-1">{centers.length} {t('centersRegistered') || 'centres'}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${showCentersSection ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
              {showCentersSection ? (t('active') || 'Actif') : (t('show') || 'Afficher')}
            </span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-3xl border border-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">{t('section03')}</span>
              <h3 className="text-md font-bold mt-0.5">👤 {t('createUserButtonTitle') || 'Créer Utilisateur'}</h3>
              <p className="text-xs opacity-80 mt-1">{t('techniciansAndEmployees') || 'Techniciens & Employés'}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20 text-white">
              {t('nouveau') || '+ Nouveau'}
            </span>
          </button>
        </div>

        {/* TECHNICIANS VIEW */}
        {showTechStats && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">📊 {t('techPerformanceTitle') || "Rapports d'activité des Techniciens"}</h3>
                <p className="text-xs text-gray-400">{t('techPerformanceSubtitle') || "Cliquez sur un technicien pour gérer ses centres, ses temps de réponse et son mot de passe"}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-sky-50 text-sky-800 font-semibold px-3 py-1.5 rounded-full border border-sky-200">
                  {technicians.length} {t('techniciansRegistered') || 'techniciens enregistrés'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">{t('technician') || 'Technicien'}</th>
                    <th className="p-4">{t('email') || 'Email'}</th>
                    <th className="p-4">{t('responseTime') || 'Temps de réponse'}</th>
                    <th className="p-4 text-center">{t('assignedTicketsCount') || 'Tickets Assignés'}</th>
                    <th className="p-4 text-center">{t('resolvedTicketsCount') || 'Résolus / Fermés'}</th>
                    <th className="p-4 text-center">{t('pendingTicketsCount') || 'En cours'}</th>
                    <th className="p-4 text-right">{t('status') || 'État / Activer-Désactiver'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {techStatsMap.map((tech, idx) => {
                    const isActive = tech.statutActif !== undefined ? tech.statutActif : (tech.estActif !== undefined ? tech.estActif : tech.active !== false);
                    const displayName = [tech.nom, tech.prenom].filter(Boolean).join(' ') || tech.name || tech.email;

                    return (
                      <tr 
                        key={tech.id || tech._id || idx} 
                        onClick={() => setSelectedTech(tech)}
                        className="hover:bg-sky-50/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-semibold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                            {(tech.prenom?.[0] || tech.nom?.[0] || 'T').toUpperCase()}
                          </span>
                          {displayName}
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{tech.email}</td>
                        <td className="p-4 text-xs font-medium">
                          {tech.overallStats.avgFormatted ? (
                            <span className={`px-2.5 py-1 rounded-lg font-mono font-bold inline-flex items-center gap-1 shadow-2xs border ${tech.overallStats.avgMs > RESPONSE_LIMIT_MS ? 'bg-red-50 text-red-700 border-red-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                              {tech.overallStats.avgMs > RESPONSE_LIMIT_MS ? '⚠️' : '⏱️'} {tech.overallStats.avgFormatted}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">--</span>
                          )}
                          <span className="block text-[10px] text-gray-400 mt-1">
                            {tech.overallStats.resolved} {t('resolvedShort') || 'résolus / fermés'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            {tech.totalAssigned}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {tech.resolvedCount}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            {tech.pendingCount}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              {isActive ? (t('active') || 'Actif') : (t('deactivated') || 'Désactivé')}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={Boolean(isActive)}
                                onChange={(e) => handleToggleDeactivateUser(tech.id || tech._id, e)}
                                className="sr-only peer" 
                              />
                              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {technicians.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
                        {t('noTechniciansFound') || 'Aucun compte technicien trouvé'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CENTERS VIEW */}
        {showCentersSection && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-100 shadow-xl p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🏢 {t('centersManagementTitle') || 'Liste des Centres & Tickets Créés'}</h3>
                <p className="text-xs text-gray-400">{t('centersManagementSubtitle') || "Cliquez sur un centre pour voir ses détails, modifier son mot de passe ou le supprimer"}</p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                {centers.length} {t('centersRegistered') || 'centres enregistrés'}
              </span>
            </div>

            <form onSubmit={handleAddCenter} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={newCenterForm.nom}
                onChange={(e) => setNewCenterForm({ ...newCenterForm, nom: e.target.value })}
                placeholder={t('centreName') || 'Nom du Centre'}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none"
              />
              <input
                type="text"
                value={newCenterForm.codeBureau}
                onChange={(e) => setNewCenterForm({ ...newCenterForm, codeBureau: e.target.value })}
                placeholder={t('codeCentre') || 'Code Centre'}
                className="sm:w-40 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none"
              />
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer">
                + {t('addCenter') || 'Ajouter un centre'}
              </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">{t('centreName') || 'Nom du Centre'}</th>
                    <th className="p-4">{t('codeCentre') || 'Code Centre'}</th>
                    <th className="p-4">{t('technicianAssigned') || 'Technicien Référent'}</th>
                    <th className="p-4 text-center">{t('ticketsCreatedCount') || 'Tickets Créés'}</th>
                    <th className="p-4 text-right">{t('status') || 'État / Activer-Désactiver'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {centers.map((center, idx) => {
                    const isActive = center.statutActif !== undefined ? center.statutActif : true;
                    const createdCount = tickets.filter(tk => ticketBelongsToCenter(tk, center)).length || center.totalTickets || 0;
                    
                    const assignedTech = technicians.find(tech => (tech.centres || []).some(c => String(c.id) === String(center.id || center._id)));

                    const techDisplayName = assignedTech 
                      ? ([assignedTech.nom, assignedTech.prenom].filter(Boolean).join(' ') || assignedTech.email) 
                      : (center.technicien ? ([center.technicien.nom, center.technicien.prenom].filter(Boolean).join(' ') || center.technicien.email) : null);

                    return (
                      <tr 
                        key={center.id || center._id || idx} 
                        onClick={() => setSelectedCenterDetail(center)}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-semibold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                            {(center.nom?.[0] || 'C').toUpperCase()}
                          </span>
                          {center.nom}
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{center.codeCentre || center.codeBureau || 'N/A'}</td>
                        <td className="p-4 text-gray-700 font-medium text-xs">
                          {techDisplayName ? (
                            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 inline-block font-semibold">
                              🛠 {techDisplayName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">{t('none') || 'Aucun'} 🛠️</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            {createdCount}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              {isActive ? (t('active') || 'Actif') : (t('deactivated') || 'Désactivé')}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={Boolean(isActive)}
                                onChange={(e) => handleToggleDeactivateCenter(center.id || center._id, e)}
                                className="sr-only peer" 
                              />
                              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {centers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                        {t('noCentersFound') || 'Aucun centre trouvé'}
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

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">{t('id')}</th>
                  <th className="p-4">{t('ticketTitle')}</th>
                  <th className="p-4">{t('centre') || 'Centre'}</th>
                  <th className="p-4">{t('priority')}</th>
                  <th className="p-4">{t('status')}</th>
                  <th className="p-4">{t('responseTime') || 'Temps de réponse'}</th>
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
                      <td className="p-4"><ResponseTimeBadge ticket={ticket} /></td>
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
                    <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">{t('noTicketsFound')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">👤 {t('createNewUser') || 'Créer un nouvel utilisateur'}</h3>
              <button 
                onClick={() => { setShowCreateModal(false); setModalError(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">{modalError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('lastName') || 'Nom'}</label>
                  <input type="text" required value={newUserForm.nom} onChange={(e) => setNewUserForm({ ...newUserForm, nom: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('firstName') || 'Prénom'}</label>
                  <input type="text" required value={newUserForm.prenom} onChange={(e) => setNewUserForm({ ...newUserForm, prenom: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('email') || 'Email'}</label>
                <input type="email" required value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('temporaryPassword') || 'Mot de passe provisoire'}</label>
                <input type="password" required minLength={6} value={newUserForm.motDePasse} onChange={(e) => setNewUserForm({ ...newUserForm, motDePasse: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('role') || 'Rôle'}</label>
                  <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none cursor-pointer">
                    <option value="TECHNICIEN_IT">{t('roleTechnician') || 'Technicien IT'}</option>
                    <option value="EMPLOYE">{t('roleCenter') || 'Centre'}</option>
                    <option value="ADMINISTRATEUR">{t('roleAdmin') || 'Administrateur'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('associatedCenter') || 'Centre associé'}</label>
                  <select value={newUserForm.centreId} onChange={(e) => setNewUserForm({ ...newUserForm, centreId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:bg-white outline-none cursor-pointer">
                    <option value="">{t('noCenter') || 'Aucun centre'}</option>
                    {centers.map(c => (<option key={c.id || c._id} value={c.id || c._id}>{c.nom}</option>))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-xs cursor-pointer">{t('cancel') || 'Annuler'}</button>
                <button type="submit" disabled={creatingUser} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs cursor-pointer">{t('createUserSubmit') || "Créer l'utilisateur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL (Admin Profile) */}
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

      {/* RESET PASSWORD MODAL (For Tech or Center) */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">🔑 {t('changePasswordFor') || 'Changer le mot de passe'} : {resetPasswordModal.targetName}</h3>
              <button onClick={() => setResetPasswordModal({ isOpen: false, targetType: '', targetId: '', targetName: '' })} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSavePasswordReset} className="space-y-4">
              {passwordResetSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">{passwordResetSuccess}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('newPassword') || 'Nouveau mot de passe'}</label>
                <input type="password" required minLength={6} placeholder={t('newPasswordPlaceholder') || 'Entrez le nouveau mot de passe'} value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResetPasswordModal({ isOpen: false, targetType: '', targetId: '', targetName: '' })} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-xs cursor-pointer">{t('cancel') || 'Annuler'}</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer">{t('save') || 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TECHNICIAN DETAILS MODAL */}
      {selectedTech && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-sky-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span>🛠</span> {[selectedTech.nom, selectedTech.prenom].filter(Boolean).join(' ') || selectedTech.email}
              </h3>
              <button onClick={() => setSelectedTech(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('email') || 'Email'}</span>
                  <span className="font-mono text-xs text-gray-800">{selectedTech.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('password') || 'Mot de passe'}</span>
                    <button 
                      onClick={() => setResetPasswordModal({ isOpen: true, targetType: 'tech', targetId: selectedTech.id || selectedTech._id, targetName: selectedTech.nom || selectedTech.email })}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {t('changePasswordButton') || 'Changer le mot de passe'} 🔑
                    </button>
                  </div>
                </div>
              </div>

              {/* CENTER ASSIGNMENT MANAGEMENT FOR TECH */}
              <div className="space-y-3 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  {t('assignedCentersToTech') || 'Centres assignés à ce technicien'}
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const assignedList = selectedTech?.centres || [];
                    
                    if (assignedList.length === 0) {
                      return <p className="text-xs text-gray-400 italic">{t('noCenterAttached') || 'Aucun centre rattaché pour le moment.'}</p>;
                    }

                    return assignedList.map(c => (
                      <span key={c.id || c._id} className="bg-white text-blue-800 border border-blue-200 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                        <span>🏢 {c.nom}</span>
                        <button 
                          onClick={() => handleRemoveCenterFromTech(selectedTech.id || selectedTech._id, c.id || c._id)}
                          className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                          title={t('removeCenterTooltip') || 'Retirer ce centre'}
                        >
                          ✕
                        </button>
                      </span>
                    ));
                  })()}
                </div>

                <div className="pt-2 flex gap-2">
                  <select 
                    value={selectedCenterToAdd}
                    onChange={(e) => setSelectedCenterToAdd(e.target.value)}
                    className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="">{t('selectCenterToAssign') || 'Sélectionner un centre à assigner...'}</option>
                    {centers.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.nom}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleAssignCenterToTech(selectedTech.id || selectedTech._id, selectedCenterToAdd)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {t('assignButton') || 'Attribuer'}
                  </button>
                </div>
              </div>

              {/* TICKETS & RESPONSE TIME */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('assignedTicketsAndTime') || 'Tickets assignés & Temps de réponse'}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tickets.filter(tItem => String(tItem.technicienId || tItem.technicianId || tItem.technicien?.id || tItem.technician?.id) === String(selectedTech.id || selectedTech._id)).map(ticket => {
                    return (
                      <div key={ticket.id || ticket._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <span className="font-bold text-gray-800">#{formatId(ticket.id)} - {ticket.titre}</span>
                          <span className="block text-gray-400 mt-0.5">{t('centre') || 'Centre'} : {getCenterName(ticket)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ResponseTimeBadge ticket={ticket} />
                          <span className={`px-2.5 py-1 rounded-md font-medium ${getStatusBadge(ticket.statut)}`}>
                            {t(ticket.statut)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {tickets.filter(tItem => String(tItem.technicienId || tItem.technicianId || tItem.technicien?.id || tItem.technician?.id) === String(selectedTech.id || selectedTech._id)).length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">{t('noAssignedTickets') || 'Aucun ticket assigné pour le moment.'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={(e) => handleDeleteUser(selectedTech.id || selectedTech._id, e)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                🗑️ {t('deleteUser') || 'Supprimer le technicien'}
              </button>
              <button onClick={() => setSelectedTech(null)} className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer">{t('close') || 'Fermer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CENTER DETAILS MODAL */}
      {selectedCenterDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span>🏢</span> {selectedCenterDetail.nom}
              </h3>
              <button onClick={() => setSelectedCenterDetail(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('codeCentre') || 'Code Centre'}</span>
                  <span className="font-mono text-xs text-gray-800">{selectedCenterDetail.codeCentre || selectedCenterDetail.codeBureau || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('centerPassword') || 'Mot de passe du Centre'}</span>
                  <button 
                    onClick={() => setResetPasswordModal({ isOpen: true, targetType: 'center', targetId: selectedCenterDetail.id || selectedCenterDetail._id, targetName: selectedCenterDetail.nom })}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    {t('changePasswordButton') || 'Changer le mot de passe'} 🔑
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('ticketsCreatedByCenter') || 'Tickets émis par ce centre'} ({centerTickets.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {centerTickets.map(ticket => (
                    <div key={ticket.id || ticket._id} onClick={() => { setSelectedCenterDetail(null); setSelectedTicket(ticket); }} className="p-3 bg-gray-50 hover:bg-blue-50/40 rounded-xl border border-gray-100 flex justify-between items-center text-xs cursor-pointer transition-colors">
                      <div>
                        <span className="font-bold text-gray-800">#{formatId(ticket.id)} - {ticket.titre}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-medium ${getStatusBadge(ticket.statut)}`}>
                        {t(ticket.statut)}
                      </span>
                    </div>
                  ))}
                  {centerTickets.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">{t('noTicketsForCenter') || 'Aucun ticket enregistré pour ce centre.'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={() => handleDeleteCenter(selectedCenterDetail.id || selectedCenterDetail._id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                🗑 {t('deleteCenterButton') || 'Supprimer le centre'}
              </button>
              <button onClick={() => setSelectedCenterDetail(null)} className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer">{t('close') || 'Fermer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details & Comments Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="text-xs font-mono font-bold text-gray-400">#{formatId(selectedTicket.id)}</span>
              <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.titre}</h2>
                <ResponseTimeBadge ticket={tickets.find(tk => tk.id === selectedTicket.id) || selectedTicket} />
              </div>

              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('centre') || 'Centre'}</span>
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{getCenterName(selectedTicket)}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('status') || 'Statut'}</span>
                  <select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      handleUpdateStatus(selectedTicket.id, e.target.value);
                    }}
                    className="bg-white border border-gray-200 rounded-xl px-2 py-1 text-xs font-medium text-gray-800 outline-none cursor-pointer w-full"
                  >
                    <option value="NOUVEAU_NON_VU">{t('NOUVEAU_NON_VU')}</option>
                    <option value="NOUVEAU_VU">{t('NOUVEAU_VU')}</option>
                    <option value="EN_COURS">{t('EN_COURS')}</option>
                    <option value="RESOLU">{t('RESOLU')}</option>
                    <option value="FERME">{t('FERME')}</option>
                  </select>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('assignedTechnician') || 'Technicien'}</span>
                  <select
                    value={selectedTicket.technicienId || selectedTicket.technicianId || selectedTicket.technicien?.id || ''}
                    onChange={(e) => handleAssignTicketTech(selectedTicket.id, e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-2 py-1 text-xs font-medium text-gray-800 outline-none cursor-pointer w-full"
                  >
                    <option value="">{t('unassigned') || 'Non assigné'}</option>
                    {technicians.map(tech => (
                      <option key={tech.id || tech._id} value={tech.id || tech._id}>
                        {[tech.nom, tech.prenom].filter(Boolean).join(' ') || tech.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">{t('description') || 'Description'}</span>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('comments') || 'Commentaires'}</h3>
                <div className="space-y-3">
                  {ticketComments.map((comment, index) => (
                    <div key={comment.id || index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700">
                          {comment.auteur?.prenom && comment.auteur?.nom ? `${comment.auteur.prenom} ${comment.auteur.nom}` : (t('user') || 'Utilisateur')}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {comment.dateCreation ? new Date(comment.dateCreation).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{comment.contenu || comment.texte}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder={t('writeCommentPlaceholder') || 'Écrire un commentaire...'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 outline-none"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-sm cursor-pointer">{t('send') || 'Envoyer'}</button>
                </form>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                🗑️ {t('deleteTicket') || 'Supprimer le ticket'}
              </button>
              <button onClick={() => setSelectedTicket(null)} className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer">{t('close') || 'Fermer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}