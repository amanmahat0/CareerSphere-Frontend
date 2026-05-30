import React, { useState, useEffect } from 'react';
import { Bell, Send, Search, Loader2, Users, Building2, GraduationCap } from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const AdminNotifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getAllUsers();
        setUsers(res.data || []);
      } catch (err) {
        toast.error('Failed to load users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = recipientSearch.toLowerCase();
    const typeMatch =
      filterType === 'all' ||
      u.type === filterType ||
      (filterType === 'institution' && u.type === 'institution');
    return typeMatch && (u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
  });

  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedRecipient) {
      setError('Please select a recipient');
      return;
    }
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }
    setSending(true);
    try {
      await api.sendAdminNotification(selectedRecipient.id, message.trim());
      toast.success(`Notification sent to ${selectedRecipient.name}`);
      setSelectedRecipient(null);
      setRecipientSearch('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const stats = {
    applicants: users.filter((u) => u.type === 'applicant').length,
    companies: users.filter((u) => u.type === 'institution').length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar isOpen={false} onClose={() => {}} activePage="notifications" />
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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="notifications" />
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
                  <h1 className="text-2xl font-bold text-slate-900">Send Notification</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Send a custom in-app notification to any user or company</p>
                </div>
              </div>


              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Compose panel */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <Bell size={16} className="text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-800">Compose Notification</h2>
                    </div>
                    <div className="p-6">
                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSend}>
                        <div className="space-y-4">

                          {/* Filter tabs */}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Filter Recipients By</label>
                            <div className="flex gap-2">
                              {[
                                { label: 'All Users', value: 'all' },
                                { label: 'Applicants', value: 'applicant' },
                                { label: 'Companies', value: 'institution' },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setFilterType(opt.value)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
                                    filterType === opt.value
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Recipient search */}
                          <div className="relative">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Recipient *</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                              <input
                                type="text"
                                value={selectedRecipient ? selectedRecipient.name : recipientSearch}
                                onChange={(e) => {
                                  setRecipientSearch(e.target.value);
                                  setSelectedRecipient(null);
                                  setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search by name or email..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                disabled={sending}
                              />
                            </div>

                            {showDropdown && !selectedRecipient && (
                              <div className="absolute z-10 w-full border border-slate-200 rounded mt-1 bg-white shadow-md max-h-48 overflow-y-auto">
                                {filteredUsers.length === 0 ? (
                                  <p className="px-4 py-3 text-sm text-slate-500">No users found</p>
                                ) : (
                                  filteredUsers.slice(0, 30).map((u) => (
                                    <button
                                      key={u.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedRecipient(u);
                                        setRecipientSearch('');
                                        setShowDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                    >
                                      <span className="font-semibold text-slate-700">{u.name}</span>
                                      <span className="text-xs text-slate-400">
                                        {u.type === 'institution' ? 'Company' : 'Applicant'}
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected recipient badge */}
                          {selectedRecipient && (
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${selectedRecipient.type === 'institution' ? 'bg-purple-600' : 'bg-blue-900'}`}>
                                  {selectedRecipient.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{selectedRecipient.name}</p>
                                  <p className="text-xs text-slate-400">{selectedRecipient.type === 'institution' ? 'Company' : 'Applicant'} · {selectedRecipient.email}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setSelectedRecipient(null); setRecipientSearch(''); }}
                                className="text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2 py-0.5 rounded"
                              >
                                Change
                              </button>
                            </div>
                          )}

                          {/* Message */}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Message *</label>
                            <textarea
                              rows={5}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type your notification message here..."
                              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 resize-none"
                              disabled={sending}
                            />
                            <p className="text-xs text-slate-400 mt-1">{message.length} characters</p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            disabled={sending || !selectedRecipient || !message.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Send Notification
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Right panel — recipient summary */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                      <Users size={15} className="text-slate-500" />
                      <h2 className="text-sm font-bold text-slate-800">Recipients Overview</h2>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                          <GraduationCap size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Applicants</p>
                          <p className="text-xl font-bold text-slate-900">{stats.applicants}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center shrink-0">
                          <Building2 size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Companies</p>
                          <p className="text-xl font-bold text-slate-900">{stats.companies}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-9 h-9 bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                          <Users size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Total Users</p>
                          <p className="text-xl font-bold text-slate-900">{users.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Tips</p>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                      <li>Use the filter tabs to narrow down recipients by type</li>
                      <li>Notifications appear in the recipient's bell icon</li>
                      <li>Keep messages concise and action-oriented</li>
                    </ul>
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

export default AdminNotifications;
