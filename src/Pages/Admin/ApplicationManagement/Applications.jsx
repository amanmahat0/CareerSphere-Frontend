import React, { useState, useEffect } from 'react';
import {
  Building2, Search, X, Loader2, Eye,
  FileText, Mail, User, Calendar, Briefcase,
  CheckCircle, XCircle, Clock, Download, AlertCircle,
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_MAP = {
  pending:     { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Applied' },
  shortlisted: { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Shortlisted' },
  test:        { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Test' },
  interview:   { bg: 'bg-cyan-100',    text: 'text-cyan-700',    label: 'Interview' },
  offer:       { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Offer' },
  hired:       { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hired' },
  rejected:    { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected' },
  withdrawn:   { bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Withdrawn' },
};

const statusMeta = (key) => STATUS_MAP[key] || { bg: 'bg-gray-100', text: 'text-gray-700', label: key };

const getDisplayStatus = (app) => {
  if (app.status === 'pending')   return 'pending';
  if (app.status === 'withdrawn') return 'withdrawn';
  if (app.status === 'rejected')  return 'rejected';
  return app.interviewStep || app.status || 'pending';
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

/* ─── Detail Modal ────────────────────────────────────────── */
const ApplicationModal = ({ app, onClose }) => {
  if (!app) return null;
  const status = getDisplayStatus(app);
  const sm = statusMeta(status);
  const contractUrl = app.contractFile
    ? (app.contractFile.startsWith('/uploads') ? `${BACKEND_URL}${app.contractFile}` : app.contractFile)
    : null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value || '—'}</p>
      </div>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 first:mt-0">{children}</p>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{app.jobId?.title || 'Application'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{app.jobId?.company}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sm.bg} ${sm.text}`}>{sm.label}</span>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">

          <SectionTitle>Applicant</SectionTitle>
          <InfoRow icon={User}     label="Name"   value={app.userId?.fullname} />
          <InfoRow icon={Mail}     label="Email"  value={app.userId?.email} />
          <InfoRow icon={Calendar} label="Applied" value={fmt(app.appliedDate || app.createdAt)} />

          <SectionTitle>Job</SectionTitle>
          <InfoRow icon={Briefcase}  label="Position" value={app.jobId?.title} />
          <InfoRow icon={Building2}  label="Company"  value={app.jobId?.company} />
          <InfoRow icon={FileText}   label="Type"     value={app.jobId?.type} />

          {/* Pipeline stages */}
          {['shortlisted','test','interview','offer','hired'].includes(status) && (
            <>
              <SectionTitle>Pipeline Details</SectionTitle>

              {/* Test */}
              {(app.testDeadline || app.testType) && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-semibold text-slate-700 text-xs">Test</p>
                  {app.testType     && <p className="text-xs text-slate-600">Type: {app.testType.replace(/_/g,' ')}</p>}
                  {app.testDeadline && <p className="text-xs text-slate-600">Deadline: {fmt(app.testDeadline)}</p>}
                  {app.testResult   && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${app.testResult === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {app.testResult === 'pass' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {app.testResult === 'pass' ? 'Passed' : 'Failed'}
                    </span>
                  )}
                </div>
              )}

              {/* Interview */}
              {app.interviewDate && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-semibold text-slate-700 text-xs">Interview</p>
                  <p className="text-xs text-slate-600">Date: {fmt(app.interviewDate)} {app.interviewTime && `at ${app.interviewTime}`}</p>
                  <p className="text-xs text-slate-600">Mode: {(app.interviewType || '').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  {app.meetingLink && (
                    <a href={app.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline">Meeting Link</a>
                  )}
                  {app.interviewResult && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${app.interviewResult === 'selected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {app.interviewResult === 'selected' ? 'Selected' : 'Not Selected'}
                    </span>
                  )}
                  {app.interviewFeedback && (
                    <p className="text-xs text-slate-500 italic">"{app.interviewFeedback}"</p>
                  )}
                </div>
              )}

              {/* Offer / Contract */}
              {(status === 'offer' || status === 'hired') && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2">
                  <p className="font-semibold text-slate-700 text-xs">Offer</p>
                  {app.offerResponse && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      app.offerResponse === 'accepted' ? 'bg-green-100 text-green-700'
                      : app.offerResponse === 'rejected' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.offerResponse === 'accepted' ? <CheckCircle size={10} /> : app.offerResponse === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                      {app.offerResponse === 'accepted' ? 'Accepted' : app.offerResponse === 'rejected' ? 'Declined' : 'Awaiting Response'}
                    </span>
                  )}
                  {contractUrl ? (
                    <a href={contractUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition w-fit">
                      <Download size={12} /> View / Download Contract
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">No contract uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Hired */}
              {status === 'hired' && app.startDate && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-800">Hired — Start Date: {fmt(app.startDate)}</p>
                  {app.hiringSummary && <p className="text-xs text-emerald-700 mt-1">{app.hiringSummary}</p>}
                </div>
              )}
            </>
          )}

          {/* Rejection */}
          {status === 'rejected' && (
            <>
              <SectionTitle>Rejection</SectionTitle>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{app.interviewFeedback || app.rejectionReason || 'No reason provided.'}</p>
              </div>
            </>
          )}

          {/* Withdrawal */}
          {status === 'withdrawn' && (
            <>
              <SectionTitle>Withdrawal</SectionTitle>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">{app.withdrawalReason || 'No reason provided.'}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main page ───────────────────────────────────────────── */
const Applications = () => {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [applications, setApplications]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [sortBy, setSortBy]                 = useState('date');
  const [viewApp, setViewApp]               = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminApplications();
      setApplications(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const term  = searchTerm.toLowerCase();
    const match =
      (app.jobId?.company || '').toLowerCase().includes(term) ||
      (app.userId?.fullname || '').toLowerCase().includes(term) ||
      (app.userId?.email || '').toLowerCase().includes(term) ||
      (app.jobId?.title || '').toLowerCase().includes(term);
    if (!match) return false;
    if (selectedStatus && getDisplayStatus(app) !== selectedStatus) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date')    return new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt);
    if (sortBy === 'company') return (a.jobId?.company || '').localeCompare(b.jobId?.company || '');
    if (sortBy === 'status')  return getDisplayStatus(a).localeCompare(getDisplayStatus(b));
    return 0;
  });

  const statusOptions = ['pending','shortlisted','test','interview','offer','hired','rejected','withdrawn'];

  if (loading) return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar isOpen={false} onClose={() => {}} activePage="applications" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => {}} userRole="Admin" dashboardPath="/admin/dashboard" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <ApplicationModal app={viewApp} onClose={() => setViewApp(null)} />

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="applications" />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(p => !p)} userRole="Admin" dashboardPath="/admin/dashboard" />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">

            {/* Page header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
              <p className="text-slate-500 text-xs mt-0.5">View and monitor all job applications</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search company, applicant, email, position…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{statusMeta(s).label}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                >
                  <option value="date">Sort: Date</option>
                  <option value="company">Sort: Company</option>
                  <option value="status">Sort: Status</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start justify-between">
                <p className="text-red-700 text-sm">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-3"><X size={16} /></button>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={36} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Applicant</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Company</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Position</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Applied</th>
                        <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((app) => {
                        const ds = getDisplayStatus(app);
                        const sm = statusMeta(ds);
                        return (
                          <tr key={app._id || app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0">
                                  {(app.userId?.fullname || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800 truncate text-xs">{app.userId?.fullname || '—'}</p>
                                  <p className="text-slate-400 text-xs truncate">{app.userId?.email || '—'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">{app.jobId?.company || '—'}</td>
                            <td className="px-5 py-3 text-xs text-slate-800 whitespace-nowrap">{app.jobId?.title || '—'}</td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${sm.bg} ${sm.text}`}>
                                {sm.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(app.appliedDate || app.createdAt)}</td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => setViewApp(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
                              >
                                <Eye size={13} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{applications.length}</span> applications
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Applications;
