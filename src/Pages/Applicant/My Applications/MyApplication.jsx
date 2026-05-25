import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Search, Eye, XCircle, Loader2, AlertCircle, FileText,
  CheckCircle2, UserCheck, X, ChevronUp, ChevronDown,
  ArrowUpRight, Briefcase, Info,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../Components/ApplicantSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import ApplicationDetailsModal from './ApplicationDetails';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

/* ─── constants ─────────────────────────────────────────── */
const STATUS_META = {
  pending:     { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Pending',     color: '#94A3B8', next: 'Awaiting review' },
  shortlisted: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Shortlisted', color: '#3B82F6', next: 'Test expected' },
  test:        { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Test',        color: '#8B5CF6', next: 'Complete the test' },
  interview:   { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Interview',   color: '#06B6D4', next: 'Attend interview' },
  offer:       { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Offer',       color: '#F59E0B', next: 'Decision pending' },
  hired:       { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Hired',       color: '#22C55E', next: 'Congratulations!' },
  rejected:    { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Rejected',    color: '#EF4444', next: 'Application closed' },
  withdrawn:   { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Withdrawn',   color: '#F97316', next: 'Withdrawn by you' },
};

const STEP_SEQ   = ['shortlisted', 'test', 'interview', 'offer', 'hired'];
const STEP_COLOR = { shortlisted: '#3B82F6', test: '#8B5CF6', interview: '#06B6D4', offer: '#F59E0B', hired: '#22C55E' };

const TAB_FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'active',      label: 'Active',      statuses: ['pending','shortlisted','test','interview','offer'] },
  { key: 'shortlisted', label: 'Shortlisted', statuses: ['shortlisted'] },
  { key: 'interview',   label: 'Interview',   statuses: ['interview'] },
  { key: 'offer',       label: 'Offer',       statuses: ['offer'] },
  { key: 'hired',       label: 'Hired',       statuses: ['hired'] },
  { key: 'rejected',    label: 'Rejected',    statuses: ['rejected'] },
  { key: 'withdrawn',   label: 'Withdrawn',   statuses: ['withdrawn'] },
];

/* ─── helpers ───────────────────────────────────────────── */
const smeta       = (s) => STATUS_META[s] || { bg: 'bg-slate-100', text: 'text-slate-600', label: s, color: '#94A3B8', next: '' };
const getStatus   = (a) => {
  if (a.status === 'pending') return 'pending';
  if (a.interviewStep === 'withdrawn' || a.status === 'withdrawn') return 'withdrawn';
  if (a.interviewStep === 'rejected'  || a.status === 'rejected')  return 'rejected';
  return a.interviewStep || a.status || 'pending';
};
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtDateShort= (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const buildDonutData = (apps) => {
  const c = {};
  apps.forEach((a) => { const s = getStatus(a); c[s] = (c[s]||0) + 1; });
  return Object.entries(c).map(([s, v]) => ({ status: s, name: smeta(s).label, value: v, fill: smeta(s).color }));
};

const getProgress = (currentStep) =>
  STEP_SEQ.map((step) => {
    const i = STEP_SEQ.indexOf(step), ci = STEP_SEQ.indexOf(currentStep || '');
    if (i < ci)          return STEP_COLOR[STEP_SEQ[0]];
    if (step === currentStep) return STEP_COLOR[step] || '#3B82F6';
    return null;
  });

/* ─── SortIcon ─────────────────────────────────────────── */
const SortIcon = ({ col, sortKey, dir }) => {
  if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300 ml-1" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-blue-500 ml-1" />
    : <ChevronDown size={12} className="text-blue-500 ml-1" />;
};

/* ─── StatusCell ────────────────────────────────────────── */
const StatusCell = ({ status }) => {
  const m = smeta(status);
  return (
    <div className="group relative inline-block">
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
        {m.label}
        <Info size={10} className="opacity-50" />
      </span>
      {/* tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap">
        <div className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg">
          <p className="font-semibold mb-0.5">{m.label}</p>
          <p className="text-slate-300">{m.next}</p>
        </div>
        <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  );
};

/* ─── ProgressDots ──────────────────────────────────────── */
const ProgressDots = ({ status }) => {
  const steps = getProgress(status);
  const isTerminal = ['rejected','withdrawn'].includes(status);
  return (
    <div className="flex items-center gap-1">
      {isTerminal ? (
        <span className="text-xs text-slate-400 italic">—</span>
      ) : (
        steps.map((fill, i) => (
          <div
            key={i}
            title={STEP_SEQ[i]}
            className="w-2 h-2 rounded-full transition-all"
            style={{ backgroundColor: fill || '#E2E8F0' }}
          />
        ))
      )}
    </div>
  );
};

/* ─── Empty State ───────────────────────────────────────── */
const EmptyState = ({ filtered, onClear }) => (
  <tr>
    <td colSpan={9} className="px-4 py-14 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
          <Briefcase size={22} className="text-slate-300" />
        </div>
        {filtered ? (
          <>
            <p className="text-sm font-semibold text-slate-600">No matching applications</p>
            <p className="text-xs text-slate-400">Try changing the filter or search term.</p>
            <button onClick={onClear} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
              Clear filters
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-600">No applications yet</p>
            <p className="text-xs text-slate-400 mb-2">Start applying to track your progress here.</p>
            <a
              href="/opportunities"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 px-4 py-2 rounded-lg transition"
            >
              Browse Opportunities <ArrowUpRight size={12} />
            </a>
          </>
        )}
      </div>
    </td>
  </tr>
);

/* ─── main ──────────────────────────────────────────────── */
const MyApplication = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);

  /* filters */
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('all');
  const [sortKey,    setSortKey]    = useState('date');
  const [sortDir,    setSortDir]    = useState('desc');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await api.getUserApplications();
        if (res.success) setApplications(res.data || []);
        else setError('Failed to load applications');
      } catch (err) { setError(err.message || 'Failed to load applications'); }
      finally { setLoading(false); }
    })();
  }, []);

  /* tab counts */
  const tabCounts = useMemo(() => {
    const c = { all: applications.length };
    TAB_FILTERS.slice(1).forEach(({ key, statuses }) => {
      c[key] = applications.filter(a => statuses.includes(getStatus(a))).length;
    });
    return c;
  }, [applications]);

  /* donut */
  const donutData = useMemo(() => buildDonutData(applications), [applications]);

  /* filtered + sorted list */
  const filtered = useMemo(() => {
    let list = [...applications];

    /* tab filter */
    const tab = TAB_FILTERS.find(t => t.key === activeTab);
    if (tab?.statuses) list = list.filter(a => tab.statuses.includes(getStatus(a)));

    /* search */
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(a =>
      a.jobId?.title?.toLowerCase().includes(q) ||
      a.jobId?.company?.toLowerCase().includes(q) ||
      a.jobId?.location?.toLowerCase().includes(q) ||
      a.jobId?.type?.toLowerCase().includes(q)
    );

    /* sort */
    list.sort((a, b) => {
      let va, vb;
      if (sortKey === 'date') {
        va = new Date(a.appliedDate || a.createdAt);
        vb = new Date(b.appliedDate || b.createdAt);
      } else if (sortKey === 'status') {
        va = getStatus(a); vb = getStatus(b);
      } else if (sortKey === 'title') {
        va = a.jobId?.title || ''; vb = b.jobId?.title || '';
      } else if (sortKey === 'company') {
        va = a.jobId?.company || ''; vb = b.jobId?.company || '';
      } else { va = 0; vb = 0; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [applications, activeTab, search, sortKey, sortDir]);

  const handleSort = useCallback((key) => {
    setSortDir(d => (sortKey === key && d === 'desc') ? 'asc' : 'desc');
    setSortKey(key);
  }, [sortKey]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    try {
      const res = await api.withdrawApplication(id, 'User initiated withdrawal');
      if (res.success) {
        setApplications(prev => prev.map(a =>
          a._id === id ? { ...a, status: 'withdrawn', interviewStep: 'withdrawn' } : a
        ));
        toast.success('Application withdrawn successfully');
      } else toast.error(res.message || 'Failed to withdraw');
    } catch (err) { toast.error(err.message || 'Failed to withdraw'); }
  };

  const clearFilters = () => { setSearch(''); setActiveTab('all'); };
  const isFiltered   = search.trim() || activeTab !== 'all';

  const ThCell = ({ col, label }) => (
    <th
      className="px-5 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer select-none hover:text-slate-700 transition"
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center">
        {label} <SortIcon col={col} sortKey={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="applications" />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Applicant"
          dashboardPath="/applicant/dashboard"
          profilePath="/applicant/profile"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  {loading ? 'Loading…' : `${applications.length} application${applications.length !== 1 ? 's' : ''} tracked`}
                </p>
              </div>
              <a
                href="/opportunities"
                className="shrink-0 hidden sm:inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-950 transition"
              >
                Browse Jobs <ArrowUpRight size={12} />
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* ── Analytics: Donut + Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Donut chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Application Status Overview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Breakdown of all applications by current status</p>
                </div>
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                    <FileText size={28} className="mb-2 opacity-40" />
                    <p className="text-sm">Apply to opportunities to see your analytics.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5">
                    <div className="relative shrink-0 w-44 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {donutData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload;
                              const pct = Math.round((d.value / applications.length) * 100);
                              return (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                                  <p className="font-semibold text-slate-700">{d.name}</p>
                                  <p style={{ color: d.fill }} className="font-bold mt-0.5">{d.value} ({pct}%)</p>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-extrabold text-slate-900">{applications.length}</span>
                        <span className="text-xs text-slate-400 font-medium">Total</span>
                      </div>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {donutData.map((e) => {
                        const pct = Math.round((e.value / applications.length) * 100);
                        return (
                          <div key={e.status} className="flex items-center gap-2">
                            <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.fill }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-1">
                                <span className="text-xs font-semibold text-slate-700 truncate">{e.name}</span>
                                <span className="text-xs font-bold shrink-0" style={{ color: e.fill }}>{e.value}</span>
                              </div>
                              <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: e.fill }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Pipeline funnel */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Application Status</h2>
                  <p className="text-xs text-slate-400 mt-0.5">How far your applications have progressed</p>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    { label: 'Applied',     key: ['pending'],                          color: '#94A3B8' },
                    { label: 'Shortlisted', key: ['shortlisted'],                      color: '#3B82F6' },
                    { label: 'In Progress', key: ['test','interview'],                 color: '#8B5CF6' },
                    { label: 'Offer',       key: ['offer'],                            color: '#F59E0B' },
                    { label: 'Hired',       key: ['hired'],                            color: '#22C55E' },
                    { label: 'Rejected',    key: ['rejected'],                         color: '#EF4444' },
                  ].map(({ label, key, color }) => {
                    const count = applications.filter(a => key.includes(getStatus(a))).length;
                    const pct   = applications.length ? Math.round((count / applications.length) * 100) : 0;
                    return (
                      <div key={label} className="flex items-center gap-2.5">
                        <span className="w-20 text-xs text-slate-600 font-medium shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-xs font-bold w-5 text-right shrink-0" style={{ color }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Applications Table ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

              {/* Table header row */}
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Applications</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isFiltered ? `${filtered.length} of ${applications.length} shown` : `${applications.length} total`}
                  </p>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, company…"
                    className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition"
                  />
                </div>
              </div>

              {/* Tab filter chips */}
              <div className="px-4 py-2.5 flex gap-1.5 flex-wrap border-b border-slate-100 bg-slate-50/60">
                {TAB_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                      activeTab === key
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {label}
                    {tabCounts[key] > 0 && (
                      <span className={`ml-1.5 text-xs ${activeTab === key ? 'text-blue-200' : 'text-slate-400'}`}>
                        {tabCounts[key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 size={26} className="text-blue-600 animate-spin" />
                  <span className="ml-2 text-sm text-slate-500">Loading applications…</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                        <ThCell col="title"   label="Job Title" />
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                        <ThCell col="company" label="Company" />
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Location</th>
                        <ThCell col="date"    label="Applied" />
                        <ThCell col="status"  label="Status" />
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Progress</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Next Step</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.length === 0 ? (
                        <EmptyState filtered={isFiltered} onClear={clearFilters} />
                      ) : (
                        filtered.map((app, idx) => {
                          const status     = getStatus(app);
                          const m          = smeta(status);
                          const canWith    = ['pending','shortlisted','test'].includes(status);
                          return (
                            <tr
                              key={app._id}
                              onClick={() => setSelected(app)}
                              className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="px-4 py-3 text-xs font-medium text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors truncate max-w-44">
                                  {app.jobId?.title || '—'}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{app.jobId?.type || '—'}</td>
                              <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{app.jobId?.company || '—'}</td>
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{app.jobId?.location || '—'}</td>
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                {fmtDateShort(app.appliedDate || app.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                <StatusCell status={status} />
                              </td>
                              <td className="px-4 py-3">
                                <ProgressDots status={status} />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-slate-500 italic">{m.next}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelected(app)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition text-xs font-medium"
                                  >
                                    <Eye size={12} /> View
                                  </button>
                                  {canWith && (
                                    <button
                                      onClick={() => handleWithdraw(app._id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-xs font-medium"
                                    >
                                      <XCircle size={12} /> Withdraw
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ApplicationDetailsModal application={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplication;
