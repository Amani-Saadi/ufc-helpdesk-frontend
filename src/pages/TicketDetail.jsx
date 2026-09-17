import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoUfc from '../assets/logo-ufc.png';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, formatId } = useLanguage();

    const [ticket, setTicket] = useState(null);
    const [commentaires, setCommentaires] = useState([]);
    const [nouveauCommentaire, setNouveauCommentaire] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTicketData = async () => {
        try {
            const [ticketRes, commentRes] = await Promise.all([
                api.get('/tickets'), // Or individual endpoint if available, filtering locally or fetching all
                api.get(`/tickets/${id}/commentaires`).catch(() => ({ data: [] }))
            ]);

            const ticketsList = ticketRes.data.data || ticketRes.data || [];
            const currentTicket = ticketsList.find(t => String(t.id || t._id) === String(id));
            
            setTicket(currentTicket || null);

            const rawComments = commentRes.data.data || commentRes.data.commentaires || commentRes.data || [];
            setCommentaires(Array.isArray(rawComments) ? rawComments : []);
        } catch (err) {
            console.error("Error loading ticket details:", err);
            setErrorMsg(t('errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketData();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!nouveauCommentaire.trim()) return;

        try {
            await api.post(`/tickets/${id}/commentaires`, {
                contenu: nouveauCommentaire
            });
            setNouveauCommentaire('');
            fetchTicketData();
        } catch (err) {
            console.error("Error adding comment:", err);
            alert(t('errorGeneric'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center text-white">
                <p className="text-sm font-medium animate-pulse">{t('loading') || 'Loading...'}</p>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex flex-col items-center justify-center text-white space-y-4">
                <p className="text-lg font-bold">{t('errorGeneric') || 'Ticket not found'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                    {t('back') || 'Go Back'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 md:p-10 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100 p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-md p-1 overflow-hidden">
                            <img src={logoUfc} alt="Logo UFC" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                #{formatId(ticket.id)}
                            </span>
                            <h1 className="text-xl font-extrabold text-gray-900 mt-1">{ticket.titre}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-2xl text-sm transition shadow-sm cursor-pointer"
                        >
                            {t('back') || 'Back'}
                        </button>
                    </div>
                </div>

                {errorMsg && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">{errorMsg}</div>}

                {/* Ticket Details Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-xl p-8 space-y-4">
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                            {t('status')}: <strong className="text-gray-900">{t(ticket.statut)}</strong>
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                            {t('priority')}: <strong className="text-gray-900">{t(ticket.priorite)}</strong>
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('description')}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-2xl p-4">
                            {ticket.description}
                        </p>
                    </div>
                </div>

                {/* Comments / Discussion Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-xl p-8 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">{t('comments') || 'Discussion'}</h3>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {commentaires.map((comm, index) => (
                            <div key={comm.id || comm._id || index} className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4 space-y-1 shadow-2xs">
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span className="font-semibold text-blue-700">
                                        {comm.auteur?.nom || comm.auteur?.email || comm.user?.nom || t('user') || 'User'}
                                    </span>
                                    <span>{new Date(comm.createdAt || comm.date).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{comm.contenu || comm.message}</p>
                            </div>
                        ))}
                        {commentaires.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">{t('noComments') || 'No comments yet. Start the conversation below.'}</p>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-gray-100">
                        <textarea
                            rows="3"
                            required
                            placeholder={t('writeCommentPlaceholder') || 'Write your reply here...'}
                            value={nouveauCommentaire}
                            onChange={(e) => setNouveauCommentaire(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-2xl text-sm transition shadow-md cursor-pointer"
                            >
                                {t('sendReply') || 'Send Reply'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}