<<<<<<< HEAD
import { useState } from 'react';
import api from '../services/api';
=======
import React, { useState } from 'react';
>>>>>>> 61058dfd1d2917519c20e1a23674f6f04502e837
import { useLanguage } from '../hooks/useLanguage';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { t } = useLanguage();
<<<<<<< HEAD
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
=======
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  
  // States for toggling password visibility individually
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
>>>>>>> 61058dfd1d2917519c20e1a23674f6f04502e837

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch') || 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError(t('passwordTooShort') || 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Endpoint standard REST pour la mise à jour du mot de passe
      await api.patch('/auth/change-password', {
        ancienMotDePasse: currentPassword,
        nouveauMotDePasse: newPassword,
      }, authHeader);

      setSuccess(t('passwordChangedSuccessfully') || 'Mot de passe mis à jour avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Password change error:', err);
      setError(
        err.response?.data?.message || 
        t('errorGeneric') || 
        'Erreur lors de la modification du mot de passe.'
      );
=======
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/changer-mot-de-passe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe.');
      }

      setMessage(data.message || 'Mot de passe mis à jour avec succès.');
      setTimeout(() => {
        onClose();
        setAncienMotDePasse('');
        setNouveauMotDePasse('');
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.message);
>>>>>>> 61058dfd1d2917519c20e1a23674f6f04502e837
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            🔒 {t('changePasswordTitle') || 'Modifier le mot de passe'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('currentPassword') || 'Mot de passe actuel'}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('newPassword') || 'Nouveau mot de passe'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('confirmNewPassword') || 'Confirmer le nouveau mot de passe'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              {t('cancel') || 'Annuler'}
=======
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{t('changePassword')}</h2>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {message && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* Old Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('CurrentPassword')}</label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={ancienMotDePasse}
                onChange={(e) => setAncienMotDePasse(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showOldPassword ? (
                  /* Eye Off Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? (
                  /* Eye Off Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              {t('cancel')}
>>>>>>> 61058dfd1d2917519c20e1a23674f6f04502e837
            </button>
            <button
              type="submit"
              disabled={loading}
<<<<<<< HEAD
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Modification...</span>
                </>
              ) : (
                t('saveChanges') || 'Mettre à jour'
              )}
            </button>
          </div>
        </form>

=======
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '...' : t('save')}
            </button>
          </div>
        </form>
>>>>>>> 61058dfd1d2917519c20e1a23674f6f04502e837
      </div>
    </div>
  );
}