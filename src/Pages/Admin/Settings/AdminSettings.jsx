import React, { useState, useEffect } from 'react';
import { User, Lock, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const AdminSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ fullname: '' });
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [adminForm, setAdminForm] = useState({ fullname: '', email: '', phonenumber: '', password: '' });
  const [adminError, setAdminError] = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getAdminProfile();
        setProfile(res.data);
        setProfileForm({ fullname: res.data.fullname || '' });
      } catch (err) {
        toast.error('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    if (!profileForm.fullname.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.updateAdminProfile({ fullname: profileForm.fullname });
      setProfile((p) => ({ ...p, fullname: res.data.fullname }));
      toast.success('Name updated successfully');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.updateAdminProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminForm.fullname || !adminForm.email || !adminForm.password) {
      setAdminError('Full name, email, and password are required');
      return;
    }
    if (adminForm.password.length < 6) {
      setAdminError('Password must be at least 6 characters');
      return;
    }
    setCreatingAdmin(true);
    try {
      await api.createAdminAccount(adminForm);
      setAdminForm({ fullname: '', email: '', phonenumber: '', password: '' });
      toast.success('Admin account created successfully');
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar isOpen={false} onClose={() => {}} activePage="settings" />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onMenuClick={() => {}} userRole="Admin" dashboardPath="/admin/dashboard" />
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="settings" />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          userRole="Admin"
          dashboardPath="/admin/dashboard"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col lg:flex-row justify-between lg:items-start mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage your admin account and create new admins</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left column: profile info + change name */}
                <div className="space-y-6">

                  {/* Current profile card */}
                  {profile && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {profile.fullname?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{profile.fullname}</p>
                          <p className="text-sm text-slate-500">{profile.email}</p>
                          <span className="mt-1 inline-flex px-2 py-0.5 text-[10px] font-bold rounded border bg-blue-50 text-blue-700 border-blue-100 uppercase">
                            Administrator
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Update name */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <User size={16} className="text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-800">Update Name</h2>
                    </div>
                    <div className="p-6">
                      {profileError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          {profileError}
                        </div>
                      )}
                      <form onSubmit={handleSaveProfile}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={profileForm.fullname}
                              onChange={(e) => setProfileForm({ fullname: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={savingProfile}
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {savingProfile && <Loader2 size={14} className="animate-spin" />}
                            Save Name
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Change password */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <Lock size={16} className="text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-800">Change Password</h2>
                    </div>
                    <div className="p-6">
                      {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          {passwordError}
                        </div>
                      )}
                      <form onSubmit={handleSavePassword}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Current Password *</label>
                            <div className="relative">
                              <input
                                type={showCurrentPw ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                                disabled={savingPassword}
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">New Password *</label>
                            <div className="relative">
                              <input
                                type={showNewPw ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                                disabled={savingPassword}
                                placeholder="Min 6 characters"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password *</label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={savingPassword}
                              placeholder="Repeat new password"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            disabled={savingPassword}
                            className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {savingPassword && <Loader2 size={14} className="animate-spin" />}
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Right column: create new admin */}
                <div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <UserPlus size={16} className="text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-800">Create New Admin Account</h2>
                    </div>
                    <div className="p-6">
                      {adminError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          {adminError}
                        </div>
                      )}
                      <form onSubmit={handleCreateAdmin}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={adminForm.fullname}
                              onChange={(e) => setAdminForm((f) => ({ ...f, fullname: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={creatingAdmin}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                            <input
                              type="email"
                              value={adminForm.email}
                              onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={creatingAdmin}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              value={adminForm.phonenumber}
                              onChange={(e) => setAdminForm((f) => ({ ...f, phonenumber: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={creatingAdmin}
                              placeholder="Enter phone number (optional)"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
                            <input
                              type="password"
                              value={adminForm.password}
                              onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                              disabled={creatingAdmin}
                              placeholder="Enter password (min 6 characters)"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            disabled={creatingAdmin}
                            className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {creatingAdmin && <Loader2 size={14} className="animate-spin" />}
                            Create Admin
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
