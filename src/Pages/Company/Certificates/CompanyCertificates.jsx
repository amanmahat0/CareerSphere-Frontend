import React, { useState, useEffect } from 'react';
import {
  Award, Plus, Download, Eye, FileText, ImageIcon,
  Loader2, AlertCircle, X, Upload, Search, Trash2,
} from 'lucide-react';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
  return url;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const isPdf = (cert) => cert.fileType === 'application/pdf';

export default function CompanyCertificates() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [applicants, setApplicants]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [preview, setPreview]           = useState(null);
  const [form, setForm] = useState({ recipientId: '', title: '', description: '', file: null });
  const [recipientSearch, setRecipientSearch] = useState('');
  const [formError, setFormError]       = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [certsRes, appsRes] = await Promise.all([
        api.getIssuedCertificates(),
        api.getCompanyApplications(),
      ]);
      setCertificates(certsRes.data || []);
      // Build unique applicant list from applications
      const seen = new Set();
      const list = (appsRes.data || []).reduce((acc, app) => {
        const uid = app.userId?._id;
        if (uid && !seen.has(uid)) {
          seen.add(uid);
          acc.push({ _id: uid, fullname: app.userId.fullname, email: app.userId.email });
        }
        return acc;
      }, []);
      setApplicants(list);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.recipientId || !form.title || !form.file) {
      setFormError('Recipient, title, and certificate file are required');
      return;
    }
    setSubmitting(true);
    setFormError('');
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
      setRecipientSearch('');
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (cert) => {
    const url = resolveUrl(cert.fileUrl);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = cert.fileName || cert.title;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const filteredCerts = certificates.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.recipientId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplicants = applicants.filter(a =>
    a.fullname?.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    a.email?.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const selectedApplicant = applicants.find(a => a._id === form.recipientId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <CompanySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        activePage="certificates"
      />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Company"
          dashboardPath="/company/dashboard"
          profilePath="/company/profile"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-blue-700" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Certificates</h1>
                  <p className="text-sm text-slate-500">Issue and manage certificates for your applicants</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus size={16} /> Issue Certificate
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Search */}
            {certificates.length > 0 && (
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or recipient..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            {/* Certificate grid */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : filteredCerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                <Award size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No certificates issued yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Issue Certificate" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCerts.map(cert => (
                  <div key={cert._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                    {/* Thumbnail */}
                    <div
                      className="h-36 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors group relative"
                      onClick={() => setPreview({ url: resolveUrl(cert.fileUrl), type: cert.fileType, name: cert.fileName || cert.title })}
                    >
                      {isPdf(cert) ? (
                        <FileText size={40} className="text-blue-300 group-hover:text-blue-400 transition-colors" />
                      ) : (
                        <>
                          <img
                            src={resolveUrl(cert.fileUrl)}
                            alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={20} className="text-white drop-shadow" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1">{cert.title}</h3>
                      {cert.description && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{cert.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-auto">
                        To: <span className="font-medium text-slate-700">{cert.recipientId?.fullname}</span>
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(cert.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => setPreview({ url: resolveUrl(cert.fileUrl), type: cert.fileType, name: cert.fileName || cert.title })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Issue Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award size={16} className="text-blue-700" /> Issue Certificate
              </h2>
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIssue} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{formError}</p>
                </div>
              )}

              {/* Recipient picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient <span className="text-red-500">*</span>
                </label>
                {selectedApplicant ? (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedApplicant.fullname}</p>
                      <p className="text-xs text-slate-500">{selectedApplicant.email}</p>
                    </div>
                    <button type="button" onClick={() => setForm(p => ({ ...p, recipientId: '' }))}
                      className="text-slate-400 hover:text-slate-600 p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search applicant by name or email..."
                        value={recipientSearch}
                        onChange={e => setRecipientSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    {recipientSearch && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                        {filteredApplicants.length === 0 ? (
                          <p className="text-xs text-slate-400 p-3 text-center">No applicants found</p>
                        ) : filteredApplicants.slice(0, 8).map(a => (
                          <button
                            key={a._id}
                            type="button"
                            onClick={() => { setForm(p => ({ ...p, recipientId: a._id })); setRecipientSearch(''); }}
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                          >
                            <p className="text-sm font-medium text-slate-800">{a.fullname}</p>
                            <p className="text-xs text-slate-400">{a.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Certificate of Completion, Internship Certificate"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional note about the certificate..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate File <span className="text-red-500">*</span>
                </label>
                {form.file ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-green-600 shrink-0" />
                      <span className="text-sm text-green-800 font-medium truncate">{form.file.name}</span>
                      <span className="text-xs text-green-600 shrink-0">({(form.file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setForm(p => ({ ...p, file: null }))}
                      className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors group">
                    <Upload size={22} className="text-slate-300 group-hover:text-blue-400 mb-2 transition-colors" />
                    <p className="text-sm text-slate-500 group-hover:text-blue-600 font-medium">Click to upload</p>
                    <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG — max 10 MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setForm(p => ({ ...p, file: e.target.files[0] || null }))}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <p className="font-semibold text-slate-800 text-sm truncate">{preview.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.open(preview.url, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <Download size={13} /> Download
                </button>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
              {preview.type === 'application/pdf' ? (
                <iframe src={preview.url} title="Certificate" className="w-full" style={{ height: '80vh' }} />
              ) : (
                <img src={preview.url} alt="Certificate" className="w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
