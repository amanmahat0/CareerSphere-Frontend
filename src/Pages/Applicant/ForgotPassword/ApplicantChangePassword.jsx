import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { api } from '../../../utils/api';

const ApplicantChangePassword = ({ profileData }) => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.request('/applicant/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: passwordData
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      // Clear form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            Change Password
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {profileData?.isGoogleAuth && !profileData?.password ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> You signed up using Google authentication. 
              Password change is not available for Google-authenticated accounts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="max-w-md">
            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
                  <Lock className="text-slate-400" size={16} />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
                  <Lock className="text-slate-400" size={16} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
                  <Lock className="text-slate-400" size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={passwordLoading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 6}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Change Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicantChangePassword;
