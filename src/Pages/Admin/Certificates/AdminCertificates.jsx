import React, { useState, useEffect } from 'react';
import {
  Award, Plus, Trash2, Search, X, Loader2, FileText, ImageIcon,
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const resolveFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
  return url;
};

const AdminCertificates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ recipientId: '', title: '', description: '', file: null });
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [certsRes, usersRes] = await Promise.all([api.getAllCertificates(), api.getAllUsers()]);
      setCertificates(certsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.recipientId || !form.title || !form.file) {
      setError('Recipient, title, and certificate file are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('recipientId', form.recipientId);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('certificate', form.file);
      await api.issueCertificate(formData);
      toast.success('Certificate issued successfully');
      setShowModal(false);
      setForm({ recipientId: '', title: '', description: '', file: null });
      setUserSearch('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.deleteCertificate(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      toast.success('Certificate deleted');
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ recipientId: '', title: '', description: '', file: null });
    setUserSearch('');
    setError(null);
  };

  const filteredCerts = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    const recipientName = c.recipientId?.companyName || c.recipientId?.fullname || '';
    return (
      c.title?.toLowerCase().includes(term) ||
      recipientName.toLowerCase().includes(term) ||
      c.recipientId?.email?.toLowerCase().includes(term)
    );
  });

  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  const selectedUser = users.find((u) => u.id === form.recipientId);

  const stats = {
    total: certificates.length,
    applicants: certificates.filter((c) => c.recipientType === 'applicant').length,
    companies: certificates.filter((c) => c.recipientType === 'institution').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="certificates" />
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
                  <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Issue certificates to applicants and companies</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-shadow shadow-md"
                  >
                    <Plus size={16} /> Issue Certificate
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <MetricCard label="Total Certificates" value={loading ? '...' : stats.total} />
                <MetricCard label="Issued to Applicants" value={loading ? '...' : stats.applicants} color="text-blue-700" />
                <MetricCard label="Issued to Companies" value={loading ? '...' : stats.companies} color="text-purple-700" />
              </div>

              {/* Error Alert */}
              {error && !showModal && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="relative flex-1 w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search by title or recipient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 w-12">S.N</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Certificate</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Recipient</th>
                          <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 hidden lg:table-cell">Type</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 hidden lg:table-cell">Issued On</th>
                          <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">File</th>
                          <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCerts.length > 0 ? (
                          filteredCerts.map((cert, idx) => (
                            <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                              <td className="px-4 py-4 text-slate-600 text-xs font-medium">{idx + 1}</td>
                              <td className="px-4 lg:px-6 py-4">
                                <p className="font-semibold text-slate-700">{cert.title}</p>
                                {cert.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{cert.description}</p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-slate-700">
                                  {cert.recipientId?.companyName || cert.recipientId?.fullname || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-400">{cert.recipientId?.email}</p>
                              </td>
                              <td className="px-4 py-4 hidden lg:table-cell">
                                <div className="flex justify-center">
                                  <span className={`px-2 lg:px-3 py-1 text-[10px] font-bold rounded border uppercase ${
                                    cert.recipientType === 'institution'
                                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                                      : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {cert.recipientType === 'institution' ? 'Company' : 'Applicant'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-xs text-slate-500 hidden lg:table-cell">
                                {new Date(cert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex justify-center">
                                  <a
                                    href={resolveFileUrl(cert.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                                  >
                                    {cert.fileType === 'application/pdf'
                                      ? <FileText size={12} />
                                      : <ImageIcon size={12} />}
                                    View
                                  </a>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDelete(cert._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 ml-auto"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                              <p className="font-medium">
                                {certificates.length === 0 ? 'No certificates issued yet' : 'No certificates matching your search'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Issue Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Issue Certificate</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded" disabled={submitting}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleIssue}>
              <div className="space-y-3">
                {/* Recipient picker */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Recipient *</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={selectedUser ? selectedUser.name : userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setForm((f) => ({ ...f, recipientId: '' }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    disabled={submitting}
                  />
                  {userSearch && !form.recipientId && (
                    <div className="border border-slate-200 rounded mt-1 max-h-40 overflow-y-auto bg-white shadow-sm">
                      {filteredUsers.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-slate-500">No users found</p>
                      ) : (
                        filteredUsers.slice(0, 20).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, recipientId: u.id }));
                              setUserSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          >
                            <span className="font-medium text-slate-700">{u.name}</span>
                            <span className="text-xs text-slate-400">
                              {u.type === 'institution' ? 'Company' : 'Applicant'}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {selectedUser && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Selected: <strong>{selectedUser.name}</strong> ({selectedUser.type === 'institution' ? 'Company' : 'Applicant'})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Completion Certificate"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 resize-none"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Certificate File * <span className="text-slate-400 font-normal">(JPEG, PNG, or PDF · max 10 MB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] || null }))}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={submitting}
                  />
                  {form.file && <p className="text-xs text-slate-400 mt-1">{form.file.name}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, color = 'text-slate-800' }) => (
  <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 lg:mb-4">{label}</p>
    <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminCertificates;
