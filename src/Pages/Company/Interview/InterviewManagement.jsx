import React, { useState, useEffect, useMemo } from 'react';
import { Search, AlertCircle, Loader2, Users } from 'lucide-react';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import CandidateWizard from './Components/CandidateWizard';

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

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function InterviewManagement() {
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [candidates, setCandidates]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [searchTerm, setSearchTerm]               = useState('');
  const [stepFilter, setStepFilter]               = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCompanyApplications();
      if (response.success && response.data) {
        setCandidates(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpdate = (updated) => {
    setCandidates(prev => prev.map(c => c._id === updated._id ? updated : c));
    setSelectedCandidate(updated);
  };

  const filteredCandidates = useMemo(() => candidates.filter(c => {
    if (c.status === 'pending') return false;
    const matchesSearch =
      c.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const currentStatus = getApplicationStatus(c);
    const matchesStep = stepFilter === 'all' || currentStatus === stepFilter;
    return matchesSearch && matchesStep;
  }), [candidates, searchTerm, stepFilter]);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <CompanySidebar isOpen={false} onClose={() => {}} activePage="interviews" />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onMenuClick={() => {}} userRole="Company" />
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="interviews" />
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

        <main className="flex flex-1 overflow-hidden">

          {/* ── Left panel: candidate list ── */}
          <div className={`flex flex-col w-full lg:w-100 border-r border-slate-200 bg-white overflow-hidden shrink-0 ${selectedCandidate ? 'hidden lg:flex' : 'flex'}`}>

            <div className="p-4 border-b border-slate-100 shrink-0">
              <h1 className="text-base font-bold text-slate-900">Interview Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">{candidates.filter(c => c.status !== 'pending').length} candidates in pipeline</p>

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
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
            </div>

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
                filteredCandidates.map((c) => {
                  const status = getApplicationStatus(c);
                  const isSelected = selectedCandidate?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setSelectedCandidate(c)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-900' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {c.userId?.fullname?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{c.userId?.fullname}</p>
                            <p className="text-xs text-slate-400 truncate">{c.jobId?.title}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getStepColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
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
