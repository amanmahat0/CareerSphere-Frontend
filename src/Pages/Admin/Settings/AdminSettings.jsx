import React, { useState, useEffect } from 'react';
import {
  User, Lock, UserPlus, Loader2, Eye, EyeOff,
  Shield, Mail, Phone, Settings,
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const TABS = [
  { id: 'profile',  label: 'My Profile',       icon: User },
  { id: 'password', label: 'Change Password',   icon: Lock },
  { id: 'admin',    label: 'Create Admin',       icon: UserPlus },
];

const FieldRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800">{value || '—'}</span>
  </div>
);

const AdminSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState('profile');
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);

  // Profile tab
  const [profileForm, setProfileForm]   = useState({ fullname: '' });
  const [isEditing, setIsEditing]       = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password tab
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]             = useState({ current: false, newPw: false });
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Create admin tab
  const [adminForm, setAdminForm]   = useState({ fullname: '', email: '', phonenumber: '', password: '' });
  const [adminError, setAdminError] = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getAdminProfile();
        setProfile(res.data);
        setProfileForm({ fullname: res.data.fullname || '' });
      } catch (err) {
        toast.error('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    if (!profileForm.fullname.trim()) { setProfileError('Name cannot be empty'); return; }
    setSavingProfile(true);
    try {
      const res = await api.updateAdminProfile({ fullname: profileForm.fullname });
      setProfile(p => ({ ...p, fullname: res.data.fullname }));
      setIsEditing(false);
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
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    setSavingPassword(true);
    try {
      await api.updateAdminProfile({ currentPassword, newPassword });
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
      setAdminError('Full name, email, and password are required'); return;
    }
    if (adminForm.password.length < 6) { setAdminError('Password must be at least 6 characters'); return; }
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

  if (loading) return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar isOpen={false} onClose={() => {}} activePage="settings" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => {}} userRole="Admin" dashboardPath="/admin/dashboard" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="settings" />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(p => !p)} userRole="Admin" dashboardPath="/admin/dashboard" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl">

            {/* Page header */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your admin account</p>
            </div>

            {/* Profile card */}
            {profile && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0">
                  {profile.fullname?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{profile.fullname}</p>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold rounded-full uppercase">
                    <Shield size={10} /> Administrator
                  </span>
                </div>
              </div>
            )}

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-slate-200 mb-6">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-800">Profile Information</h2>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="p-6">
                  {!isEditing ? (
                    <div>
                      <FieldRow label="Full Name"  value={profile?.fullname} />
                      <FieldRow label="Email"      value={profile?.email} />
                      <FieldRow label="Role"       value="Administrator" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {profileError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{profileError}</div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={profileForm.fullname}
                          onChange={e => setProfileForm({ fullname: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                          disabled={savingProfile}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => { setIsEditing(false); setProfileError(null); setProfileForm({ fullname: profile?.fullname || '' }); }}
                          className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50" disabled={savingProfile}>
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2" disabled={savingProfile}>
                          {savingProfile && <Loader2 size={14} className="animate-spin" />}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ── Password Tab ── */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Lock size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Change Password</h2>
                </div>
                <div className="p-6">
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{passwordError}</div>
                  )}
                  <form onSubmit={handleSavePassword} className="space-y-4">
                    {/* Current password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Current Password *</label>
                      <div className="relative">
                        <input
                          type={showPw.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                          disabled={savingPassword}
                          placeholder="Enter current password"
                        />
                        <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    {/* New password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">New Password *</label>
                      <div className="relative">
                        <input
                          type={showPw.newPw ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                          disabled={savingPassword}
                          placeholder="Min 6 characters"
                        />
                        <button type="button" onClick={() => setShowPw(p => ({ ...p, newPw: !p.newPw }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPw.newPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                        disabled={savingPassword}
                        placeholder="Repeat new password"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2" disabled={savingPassword}>
                        {savingPassword && <Loader2 size={14} className="animate-spin" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── Create Admin Tab ── */}
            {activeTab === 'admin' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <UserPlus size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Create New Admin Account</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-5">
                    Create a new administrator account with full access to the CareerSphere admin panel.
                  </p>
                  {adminError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{adminError}</div>
                  )}
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'fullname', type: 'text', placeholder: 'Enter full name', required: true },
                      { label: 'Email', key: 'email', type: 'email', placeholder: 'Enter email address', required: true },
                      { label: 'Phone Number', key: 'phonenumber', type: 'tel', placeholder: 'Enter phone number (optional)', required: false },
                      { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters', required: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          {f.label} {f.required && '*'}
                        </label>
                        <input
                          type={f.type}
                          value={adminForm[f.key]}
                          onChange={e => setAdminForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                          disabled={creatingAdmin}
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                    <div className="pt-2">
                      <button type="submit" className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2" disabled={creatingAdmin}>
                        {creatingAdmin && <Loader2 size={14} className="animate-spin" />}
                        Create Admin Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
