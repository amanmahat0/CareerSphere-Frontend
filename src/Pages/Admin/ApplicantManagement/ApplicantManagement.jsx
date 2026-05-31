import React, { useState, useEffect } from 'react';
import {
  Users, Search, X, Plus, Edit2, Trash2, Loader2, Eye,
  Mail, Phone, FileText, Calendar, User, CheckCircle, AlertCircle,
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const ApplicantManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [applicants, setApplicants]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Add / Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [formData, setFormData]         = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState(null);

  // View modal
  const [viewApplicant, setViewApplicant] = useState(null);
  const [confirm, setConfirm]             = useState(null);

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllApplicants();
      if (response.success) setApplicants(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Name, email, and phone are required');
      return;
    }
    if (!editingId && !formData.password) {
      setFormError('Password is required for new applicants');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        const updateData = { fullname: formData.name, email: formData.email, phonenumber: formData.phone };
        if (formData.password) updateData.password = formData.password;
        await api.updateApplicant(editingId, updateData);
        toast.success('Applicant updated');
      } else {
        await api.createApplicant({ fullname: formData.name, email: formData.email, phonenumber: formData.phone, password: formData.password });
        toast.success('Applicant created');
      }
      await fetchApplicants();
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save applicant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      title: 'Delete Applicant',
      message: 'This will permanently delete the applicant account and all associated data. This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await api.deleteApplicant(id);
        toast.success('Applicant deleted');
        await fetchApplicants();
      },
    });
  };

  const openEdit = (id) => {
    const ap = applicants.find(a => a.id === id);
    if (!ap) return;
    setFormData({ name: ap.name, email: ap.email, phone: ap.phone, password: '' });
    setEditingId(id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setFormError(null);
  };

  const filtered = applicants.filter(a => {
    const t = searchTerm.toLowerCase();
    return a.name?.toLowerCase().includes(t) || a.email?.toLowerCase().includes(t) || a.phone?.toLowerCase().includes(t);
  });

  if (loading) return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar isOpen={false} onClose={() => {}} activePage="applicants" />
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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="applicants" />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(p => !p)} userRole="Admin" dashboardPath="/admin/dashboard" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Applicant Management</h1>
                <p className="text-slate-500 text-sm mt-0.5">View, add, edit, and remove applicant accounts</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition shadow-sm"
              >
                <Plus size={16} /> Add Applicant
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <span className="text-xs text-slate-400 shrink-0">{filtered.length} of {applicants.length} applicants</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-medium text-slate-500 w-10">S.N.</th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-500">Applicant</th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Phone</th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">Joined</th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">Resume</th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                          <Users size={28} className="mx-auto text-slate-200 mb-2" />
                          <p className="text-slate-400 text-sm">{applicants.length === 0 ? 'No applicants yet' : 'No results match your search'}</p>
                        </td>
                      </tr>
                    ) : filtered.map((ap, i) => (
                      <tr key={ap.id} className="hover:bg-slate-50/60 transition-colors text-sm">
                        <td className="px-5 py-4 text-xs text-slate-400 font-medium">{i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-xs shrink-0">
                              {ap.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{ap.name}</p>
                              <p className="text-xs text-slate-400 truncate">{ap.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs hidden md:table-cell">{ap.phone || '—'}</td>
                        <td className="px-5 py-4 text-slate-400 text-xs hidden lg:table-cell">{fmtDate(ap.createdAt)}</td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border ${
                            ap.resumeStatus === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {ap.resumeStatus === 'completed' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                            {ap.resumeStatus === 'completed' ? 'Complete' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => setViewApplicant(ap)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                              <Eye size={11} /> View
                            </button>
                            <button onClick={() => openEdit(ap.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition">
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={() => handleDelete(ap.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 transition">
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">{editingId ? 'Edit Applicant' : 'Add Applicant'}</h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg" disabled={submitting}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>
              )}
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter full name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'Enter email address' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: 'Enter phone number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label} *</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    disabled={submitting}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password {editingId ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? 'New password (optional)' : 'Min 6 characters'}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50" disabled={submitting}>
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2" disabled={submitting}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {editingId ? 'Update' : 'Save Applicant'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />

      {/* ── View Applicant Modal ── */}
      {viewApplicant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Applicant Details</h3>
              <button onClick={() => setViewApplicant(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center text-white text-xl font-extrabold shrink-0">
                  {viewApplicant.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{viewApplicant.name}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border mt-1 ${
                    viewApplicant.resumeStatus === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {viewApplicant.resumeStatus === 'completed' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                    Resume {viewApplicant.resumeStatus === 'completed' ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                {[
                  { icon: Mail,     label: 'Email',        value: viewApplicant.email },
                  { icon: Phone,    label: 'Phone',        value: viewApplicant.phone || '—' },
                  { icon: User,     label: 'Type',         value: viewApplicant.applicantType || 'Student' },
                  { icon: Calendar, label: 'Joined',       value: fmtDate(viewApplicant.createdAt) },
                  { icon: FileText, label: 'Resume',       value: viewApplicant.resumeStatus === 'completed' ? 'Completed' : 'Not completed' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <row.icon size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-medium">{row.label}</span>
                      <span className="text-slate-800 font-semibold text-xs text-right">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => { setViewApplicant(null); openEdit(viewApplicant.id); }} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => setViewApplicant(null)} className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantManagement;
