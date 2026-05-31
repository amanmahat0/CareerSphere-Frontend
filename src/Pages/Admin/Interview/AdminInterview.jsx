import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, AlertCircle, Loader2, Users,
  Briefcase, UserCheck, Calendar, CheckCircle, Trash2,
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import CandidateWizard from '../../Company/Interview/Components/CandidateWizard';

const STEP_TABS = [
  { label: 'All',         value: 'all' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Test',        value: 'test' },
  { label: 'Interview',   value: 'interview' },
  { label: 'Offer',       value: 'offer' },
  { label: 'Hired',       value: 'hired' },
];

const getStepColor = (step) => {
  switch (step?.toLowerCase()) {
    case 'shortlisted': return 'bg-blue-100 text-blue-700';
    case 'test':        return 'bg-purple-100 text-purple-700';
    case 'interview':   return 'bg-orange-100 text-orange-700';
    case 'offer':       return 'bg-yellow-100 text-yellow-700';
    case 'hired':       return 'bg-green-100 text-green-700';
    case 'rejected':    return 'bg-red-100 text-red-700';
    case 'withdrawn':   return 'bg-orange-100 text-orange-600';
    default:            return 'bg-slate-100 text-slate-700';
  }
};

const getApplicationStatus = (app) => {
  if (app.status === 'withdrawn') return 'withdrawn';
  if (app.status === 'rejected')  return 'rejected';
  if (app.status === 'accepted')  return 'accepted';
  return app.interviewStep || 'shortlisted';
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="min-w-0 flex-1">
        <p className="text-slate-500 text-xs mb-1 truncate">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg ml-2 shrink-0">{icon}</div>
    </div>
  </div>
);

export default function AdminInterview() {
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [candidates, setCandidates]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [searchTerm, setSearchTerm]               = useState('');
  const [stepFilter, setStepFilter]               = useState('all');
  const [companyFilter, setCompanyFilter]         = useState('all');
  const [companies, setCompanies]                 = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Bulk reject
  const [selectedIds, setSelectedIds]             = useState(new Set());
  const [bulkLoading, setBulkLoading]             = useState(false);
  const [confirm, setConfirm]                     = useState(null);
  const [bulkReason, setBulkReason]               = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchCompanies();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminApplications();
      if (res.success) setCandidates(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.getAllCompanies();
      if (res.success) setCompanies(res.data);
    } catch (_) {}
  };

  const handleStepUpdate = (updated) => {
    setCandidates(prev => prev.map(c => c._id === updated._id ? updated : c));
    setSelectedCandidate(updated);
  };

  const filteredCandidates = useMemo(() => candidates.filter(c => {
    if (c.status === 'pending') return false;
    const matchesSearch =
      c.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getApplicationStatus(c);
    const matchesStep    = stepFilter    === 'all' || status === stepFilter;
    const matchesCompany = companyFilter === 'all' || c.jobId?.company === companyFilter;
    return matchesSearch && matchesStep && matchesCompany;
  }), [candidates, searchTerm, stepFilter, companyFilter]);

  const toggleSelection = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0
      ? new Set()
      : new Set(filteredCandidates.map(c => c._id)));

  const handleBulkReject = () => {
    if (!selectedIds.size) return;
    setBulkReason('');
    setConfirm({
      title: `Reject ${selectedIds.size} Candidate${selectedIds.size > 1 ? 's' : ''}`,
      message: 'All selected candidates will be rejected and notified. You can optionally provide a reason.',
      confirmLabel: 'Reject All',
      onConfirm: async () => {
        setBulkLoading(true);
        const reason = bulkReason.trim();
        for (const id of selectedIds) {
          await api.updateInterviewStep(id, { interviewStep: 'rejected', status: 'rejected', interviewFeedback: reason });
        }
        toast.success(`${selectedIds.size} candidate(s) rejected`);
        setSelectedIds(new Set());
        fetchCandidates();
        setBulkLoading(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar isOpen={false} onClose={() => {}} activePage="interviews" />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onMenuClick={() => {}} userRole="Admin" dashboardPath="/admin/dashboard" />
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <ConfirmDialog config={confirm} onClose={() => setConfirm(null)}>
        {confirm?.title?.startsWith('Reject') && (
          <textarea
            value={bulkReason}
            onChange={e => setBulkReason(e.target.value)}
            placeholder="Rejection reason (optional)..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400 resize-none"
          />
        )}
      </ConfirmDialog>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="interviews" />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Admin"
          dashboardPath="/admin/dashboard"
          profilePath="/admin/profile"
        />

        <main className="flex flex-1 overflow-hidden">

          {/* ── Left panel: candidate list ── */}
          <div className={`flex flex-col w-full lg:w-120 border-r border-slate-200 bg-white overflow-hidden shrink-0 ${selectedCandidate ? 'hidden lg:flex' : 'flex'}`}>

            {/* Stats */}
            <div className="p-4 border-b border-slate-100 shrink-0 space-y-3">
              <div>
                <h1 className="text-base font-bold text-slate-900">Interview Management</h1>
                <p className="text-xs text-slate-400 mt-0.5">{candidates.length} candidates across all companies</p>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, position, company..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Company filter */}
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">All Companies</option>
                {companies.map(c => (
                  <option key={c._id} value={c.companyName}>{c.companyName}</option>
                ))}
              </select>

              {/* Step filter tabs */}
              <div className="flex flex-wrap gap-1.5">
                {STEP_TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setStepFilter(tab.value)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-colors ${
                      stepFilter === tab.value
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                    {tab.value !== 'all' && (
                      <span className={`ml-1 text-[10px] ${stepFilter === tab.value ? 'opacity-70' : 'text-slate-400'}`}>
                        {candidates.filter(c => c.status !== 'pending' && c.interviewStep === tab.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk select/reject */}
              {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-red-700">{selectedIds.size} selected</span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
                    <button onClick={handleBulkReject} disabled={bulkLoading}
                      className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1 disabled:opacity-50">
                      {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      Reject All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="m-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-48">
                  <Users className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">
                    {candidates.length === 0 ? 'No candidates yet' : 'No candidates match filters'}
                  </p>
                </div>
              ) : (
                filteredCandidates.map(c => {
                  const status = getApplicationStatus(c);
                  const isSelected = selectedCandidate?._id === c._id;
                  return (
                    <div
                      key={c._id}
                      className={`flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-900' : ''}`}
                    >
                      <div className="pl-3 pr-1 py-3 shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c._id)}
                          onChange={() => toggleSelection(c._id)}
                          onClick={e => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-slate-300"
                        />
                      </div>
                      <button
                        className="flex-1 text-left px-3 py-3"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {c.userId?.fullname?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{c.userId?.fullname}</p>
                              <p className="text-xs text-slate-400 truncate">{c.jobId?.title} · {c.jobId?.company}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStepColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 shrink-0">
              Showing {filteredCandidates.length} of {candidates.length}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className={`flex-1 overflow-hidden ${selectedCandidate ? 'flex' : 'hidden lg:flex'} flex-col`}>
            {!selectedCandidate ? (
              <div className="flex flex-col h-full items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 mb-1">Select a candidate</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Pick a candidate from the list to manage their interview pipeline.
                </p>
              </div>
            ) : (
              <CandidateWizard
                candidate={selectedCandidate}
                onUpdate={handleStepUpdate}
                onBack={() => setSelectedCandidate(null)}
              />
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
