import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Calendar, CheckCircle2, Loader2, BarChart2,
  TrendingUp, Shield, Search, ChevronUp, ChevronDown, ChevronLeft,
  ChevronRight, AlertTriangle, Bell, Building2, UserCheck, XCircle,
  ArrowRight, Eye, Trash2, BadgeCheck, Ban,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

/* ─── palette ───────────────────────────────────────────── */
const TYPE_COLORS = { Job: '#3B82F6', Internship: '#8B5CF6', Traineeship: '#06B6D4', Other: '#94A3B8' };

const APP_STATUS = {
  pending:     { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Applied',     color: '#3B82F6' },
  shortlisted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shortlisted', color: '#8B5CF6' },
  test:        { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Test',        color: '#06B6D4' },
  interview:   { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Interview',   color: '#F59E0B' },
  offer:       { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Offer',       color: '#22C55E' },
  hired:       { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Hired',       color: '#10B981' },
  rejected:    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected',    color: '#EF4444' },
  withdrawn:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Withdrawn',   color: '#EF4444' },
};
const VERIFY_STATUS = {
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Verified' },
  pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Pending' },
  rejected: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected' },
};

const smeta  = (s) => APP_STATUS[s]    || { bg: 'bg-slate-100', text: 'text-slate-600', label: s || 'Applied', color: '#94A3B8' };
const vmeta  = (s) => VERIFY_STATUS[s] || { bg: 'bg-slate-100', text: 'text-slate-600', label: s || 'Unverified' };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const PAGE_SIZE = 8;

/* ─── reusable components ───────────────────────────────── */
const StatPill = ({ label, value, icon: Icon, accent, sub, alert }) => (
  <div className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm ${alert ? 'border-amber-300' : 'border-slate-200'}`}>
    <div className={`p-2 rounded-lg shrink-0 ${accent}`}>
      <Icon size={15} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 leading-none mb-0.5 truncate">{label}</p>
      <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ meta, size = 'sm' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold ${size === 'xs' ? 'text-xs' : 'text-xs'} ${meta.bg} ${meta.text}`}>
    {meta.label}
  </span>
);

const SortTh = ({ col, label, sortKey, sortDir, onSort }) => (
  <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer select-none hover:text-slate-700 whitespace-nowrap" onClick={() => onSort(col)}>
    <span className="inline-flex items-center gap-0.5">
      {label}
      {sortKey === col
        ? sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />
        : <ChevronUp size={11} className="text-slate-300" />}
    </span>
  </th>
);

const Pagination = ({ page, total, pageSize, onChange }) => {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
      <span>{Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition">
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = pages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= pages - 2 ? pages - 4 + i : page - 2 + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-6 h-6 rounded text-xs font-semibold transition ${p === page ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === pages} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const EmptyRow = ({ cols, msg = 'No data found' }) => (
  <tr><td colSpan={cols} className="px-4 py-12 text-center text-slate-400 text-sm">{msg}</td></tr>
);

const ChartCard = ({ title, sub, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const TipBox = ({ label, value, color }) => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
    <p className="font-semibold text-slate-700">{label}</p>
    <p style={{ color }} className="font-bold">{value}</p>
  </div>
);

const DonutLegend = ({ items, total }) => (
  <div className="w-full space-y-2">
    {items.map((e) => {
      const pct = total ? Math.round((e.value / total) * 100) : 0;
      return (
        <div key={e.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.fill }} />
          <span className="text-xs text-slate-600 font-medium flex-1 truncate">{e.name}</span>
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.fill }} />
          </div>
          <span className="text-xs font-bold w-6 text-right" style={{ color: e.fill }}>{e.value}</span>
        </div>
      );
    })}
  </div>
);

const ChartEmpty = ({ msg = 'No data yet' }) => (
  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
    <BarChart2 size={24} className="mb-1 opacity-40" />
    <p className="text-xs">{msg}</p>
  </div>
);

/* ─── main component ─────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [jobs, setJobs]               = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies]     = useState([]);
  const [applicants, setApplicants]   = useState([]);
  const [verifying, setVerifying]     = useState(null);

  /* table state */
  const [activeTab,    setActiveTab]    = useState('applications');
  const [search,       setSearch]       = useState({ applications: '', jobs: '', companies: '', applicants: '' });
  const [statusFilter, setStatusFilter] = useState({ applications: 'all', companies: 'all' });
  const [sortCfg,      setSortCfg]      = useState({ key: 'date', dir: 'desc' });
  const [page,         setPage]         = useState({ applications: 1, jobs: 1, companies: 1, applicants: 1 });

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const auth = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [jobsRes, appsRes, companiesRes, applicantsRes] = await Promise.allSettled([
          api.getAllJobs(),
          api.getAdminApplications(),
          api.getAllCompanies(),
          api.getAllApplicants(),
        ]);
        if (jobsRes.status === 'fulfilled')        setJobs(jobsRes.value.jobs || []);
        if (appsRes.status === 'fulfilled')        setApplications(appsRes.value.success ? appsRes.value.data : []);
        if (companiesRes.status === 'fulfilled')   setCompanies(companiesRes.value.success ? (companiesRes.value.data || companiesRes.value.companies || []) : []);
        if (applicantsRes.status === 'fulfilled')  setApplicants(applicantsRes.value.success ? (applicantsRes.value.data || []) : []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const get = (...keys) => applications.filter(a => a.status !== 'pending' && keys.includes(a.interviewStep || a.status)).length;
    return {
      jobs:        jobs.length,
      companies:   companies.filter(c => c.verificationStatus === 'approved').length,
      applicants:  applicants.length,
      applications: applications.length,
      shortlisted: get('shortlisted', 'test'),
      interviews:  get('interview'),
      offers:      get('offer'),
      hired:       get('hired'),
      rejected:    get('rejected', 'withdrawn'),
      pending:     companies.filter(c => c.verificationStatus === 'pending').length,
    };
  }, [jobs, applications, companies, applicants]);

  /* ── charts ── */
  const typeDonut = useMemo(() => {
    const c = {};
    applications.forEach(a => { const t = a.jobId?.type || 'Other'; c[t] = (c[t]||0)+1; });
    return Object.entries(c).map(([name, value]) => ({ name, value, fill: TYPE_COLORS[name] || '#94A3B8' }));
  }, [applications]);

  const pipelineBar = useMemo(() => {
    const get = (...keys) => applications.filter(a => a.status !== 'pending' && keys.includes(a.interviewStep || a.status)).length;
    return [
      { label: 'Applied',     value: applications.length,  fill: '#3B82F6' },
      { label: 'Shortlisted', value: get('shortlisted'),   fill: '#8B5CF6' },
      { label: 'Test',        value: get('test'),          fill: '#06B6D4' },
      { label: 'Interview',   value: get('interview'),     fill: '#F59E0B' },
      { label: 'Offer',       value: get('offer'),         fill: '#22C55E' },
      { label: 'Hired',       value: get('hired'),         fill: '#10B981' },
    ];
  }, [applications]);

  const appsTrend = useMemo(() => {
    const counts = {};
    const latest = {};
    applications.forEach(a => {
      const d = new Date(a.appliedDate || a.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[key] = (counts[key] || 0) + 1;
      if (!latest[key] || d > latest[key]) latest[key] = d;
    });
    return Object.entries(counts)
      .sort((a, b) => latest[a[0]] - latest[b[0]])
      .slice(-14)
      .map(([date, count]) => ({ date, count }));
  }, [applications]);

  const statusDonut = useMemo(() => {
    const counts = {};
    applications.forEach(a => {
      const s = a.status === 'pending' ? 'pending' : (a.interviewStep || a.status || 'pending');
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill:  APP_STATUS[name]?.color || '#94A3B8',
      label: APP_STATUS[name]?.label || name,
    }));
  }, [applications]);

  const userRoleDonut = useMemo(() => [
    { name: 'Applicants', value: applicants.length, fill: '#3B82F6' },
    { name: 'Companies',  value: companies.length,  fill: '#8B5CF6' },
  ], [applicants.length, companies.length]);

  const verifyDonut = useMemo(() => [
    { name: 'Verified', value: companies.filter(c => c.verificationStatus === 'approved').length, fill: '#10B981' },
    { name: 'Pending',  value: companies.filter(c => c.verificationStatus === 'pending').length,  fill: '#F59E0B' },
    { name: 'Rejected', value: companies.filter(c => c.verificationStatus === 'rejected').length, fill: '#EF4444' },
  ], [companies]);

  const topCompanies = useMemo(() => {
    const counts = {};
    jobs.forEach(j => { if (j.company) counts[j.company] = (counts[j.company] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [jobs]);

  const topSkills = useMemo(() => {
    const counts = {};
    jobs.forEach(j => (j.skills || []).forEach(s => { if (s) counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }, [jobs]);

  /* ── table helpers ── */
  const handleSort = useCallback((key) => {
    setSortCfg(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  }, []);

  const setTabPage = (tab, p) => setPage(prev => ({ ...prev, [tab]: p }));
  const setTabSearch = (tab, v) => { setSearch(prev => ({ ...prev, [tab]: v })); setTabPage(tab, 1); };
  const setTabFilter = (tab, v) => { setStatusFilter(prev => ({ ...prev, [tab]: v })); setTabPage(tab, 1); };

  /* ── filtered / sorted / paginated data ── */
  const filteredApps = useMemo(() => {
    let list = [...applications];
    const q = search.applications.toLowerCase();
    if (q) list = list.filter(a =>
      a.userId?.fullname?.toLowerCase().includes(q) ||
      a.jobId?.title?.toLowerCase().includes(q) ||
      a.jobId?.company?.toLowerCase().includes(q)
    );
    if (statusFilter.applications !== 'all')
      list = list.filter(a => (a.status === 'pending' ? 'pending' : (a.interviewStep || a.status)) === statusFilter.applications);
    list.sort((a, b) => {
      let va, vb;
      if (sortCfg.key === 'date') { va = new Date(a.appliedDate||a.createdAt); vb = new Date(b.appliedDate||b.createdAt); }
      else if (sortCfg.key === 'status') { va = a.status === 'pending' ? 'pending' : (a.interviewStep||a.status||''); vb = b.status === 'pending' ? 'pending' : (b.interviewStep||b.status||''); }
      else { va = a.userId?.fullname||''; vb = b.userId?.fullname||''; }
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortCfg.dir === 'asc' ? 1 : -1);
    });
    return list;
  }, [applications, search.applications, statusFilter.applications, sortCfg]);

  const filteredJobs = useMemo(() => {
    const q = search.jobs.toLowerCase();
    let list = q ? jobs.filter(j =>
      j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.type?.toLowerCase().includes(q)
    ) : [...jobs];
    list.sort((a, b) => {
      const va = sortCfg.key === 'date' ? new Date(a.postDate||a.createdAt) : (a.title||'');
      const vb = sortCfg.key === 'date' ? new Date(b.postDate||b.createdAt) : (b.title||'');
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortCfg.dir === 'asc' ? 1 : -1);
    });
    return list;
  }, [jobs, search.jobs, sortCfg]);

  const filteredCompanies = useMemo(() => {
    const q = search.companies.toLowerCase();
    let list = companies.filter(c =>
      (!q || c.companyName?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)) &&
      (statusFilter.companies === 'all' || c.verificationStatus === statusFilter.companies)
    );
    return list;
  }, [companies, search.companies, statusFilter.companies]);

  const filteredApplicants = useMemo(() => {
    const q = search.applicants.toLowerCase();
    return q ? applicants.filter(a => a.fullname?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)) : applicants;
  }, [applicants, search.applicants]);

  /* ── actions ── */
  const handleVerify = async (id) => {
    setVerifying(id + '_verify');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res  = await api.verifyCompany(id, user.id || user._id, '');
      if (res.success) {
        setCompanies(prev => prev.map(c => c._id === id ? { ...c, verificationStatus: 'approved' } : c));
        toast.success('Company verified successfully');
      }
    } catch { toast.error('Failed to verify company'); }
    finally { setVerifying(null); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    setVerifying(id + '_reject');
    try {
      const res = await api.rejectCompany(id, reason, '');
      if (res.success) {
        setCompanies(prev => prev.map(c => c._id === id ? { ...c, verificationStatus: 'rejected', rejectionReason: reason } : c));
        toast.success('Company rejected');
      }
    } catch { toast.error('Failed to reject company'); }
    finally { setVerifying(null); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      const res = await api.deleteJob(id);
      if (res.success) {
        setJobs(prev => prev.filter(j => j._id !== id));
        toast.success('Job deleted');
      }
    } catch { toast.error('Failed to delete job'); }
  };

  /* ── activity feed ── */
  const recentActivity = useMemo(() => [
    ...applications.slice(0, 5).map(a => ({
      id:   a._id,
      type: 'application',
      msg:  `${a.userId?.fullname || 'Someone'} applied for ${a.jobId?.title || 'a position'}`,
      time: a.appliedDate || a.createdAt,
      color: 'bg-blue-100 text-blue-600',
      icon: Users,
    })),
    ...companies.filter(c => c.verificationStatus === 'pending').slice(0, 3).map(c => ({
      id:   c._id,
      type: 'verification',
      msg:  `${c.companyName || 'A company'} is awaiting verification`,
      time: c.createdAt,
      color: 'bg-amber-100 text-amber-600',
      icon: Building2,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8), [applications, companies]);

  /* ── pagination slice ── */
  const paginate = (list, tab) => list.slice((page[tab]-1)*PAGE_SIZE, page[tab]*PAGE_SIZE);

  const TABS = [
    { key: 'applications', label: 'Applications', count: applications.length },
    { key: 'jobs',         label: 'Jobs',         count: jobs.length },
    { key: 'companies',    label: 'Companies',     count: companies.length },
    { key: 'applicants',  label: 'Applicants',    count: applicants.length },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="dashboard" />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Admin"
          dashboardPath="/admin/dashboard"
          profilePath="/admin/profile"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 text-xs mt-0.5">Platform-wide placement & internship management.</p>
              </div>
              <div className="flex items-center gap-2">
                {stats.pending > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <AlertTriangle size={12} /> {stats.pending} pending approval{stats.pending > 1 ? 's' : ''}
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <TrendingUp size={12} />
                  Hire rate: {loading ? '…' : stats.applications > 0 ? `${((stats.hired / stats.applications) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>

            {/* ── Stats Grid 2×5 ── */}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={28} className="animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-500">Loading dashboard…</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <StatPill label="Total Jobs"        value={stats.jobs}         icon={Briefcase}    accent="bg-blue-600"    sub="Active listings" />
                  <StatPill label="Verified Companies" value={stats.companies}   icon={Building2}    accent="bg-indigo-600"  sub={`${stats.pending} pending`} alert={stats.pending > 0} />
                  <StatPill label="Applicants"         value={stats.applicants}  icon={Users}        accent="bg-purple-600"  sub="Registered users" />
                  <StatPill label="Applications"       value={stats.applications} icon={BarChart2}   accent="bg-cyan-600"    sub="All time" />
                  <StatPill label="Pending Approvals"  value={stats.pending}     icon={AlertTriangle} accent={stats.pending > 0 ? 'bg-amber-500' : 'bg-slate-400'} alert={stats.pending > 0} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatPill label="Shortlisted"  value={stats.shortlisted} icon={UserCheck}    accent="bg-purple-500" />
                  <StatPill label="Interviews"   value={stats.interviews}  icon={Calendar}     accent="bg-amber-500" />
                  <StatPill label="Offers Sent"  value={stats.offers}      icon={CheckCircle2} accent="bg-green-600" />
                  <StatPill label="Hired"        value={stats.hired}       icon={BadgeCheck}   accent="bg-emerald-600" />
                </div>

                {/* ── Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* Donut — type distribution */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-800">Applications by Type</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Job · Internship · Traineeship</p>
                    </div>
                    {typeDonut.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                        <BarChart2 size={24} className="mb-1 opacity-40" /><p className="text-xs">No data yet</p>
                      </div>
                    ) : (
                      <div className="p-4 flex flex-col items-center gap-4">
                        <div className="relative w-36 h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={typeDonut} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {typeDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                              </Pie>
                              <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                const pct = Math.round((d.value / applications.length) * 100);
                                return (
                                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                                    <p className="font-semibold text-slate-700">{d.name}</p>
                                    <p style={{ color: d.fill }} className="font-bold">{d.value} ({pct}%)</p>
                                  </div>
                                );
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-extrabold text-slate-900">{applications.length}</span>
                            <span className="text-xs text-slate-400">Total</span>
                          </div>
                        </div>
                        <div className="w-full space-y-2">
                          {typeDonut.map((e) => {
                            const pct = Math.round((e.value / applications.length) * 100);
                            return (
                              <div key={e.name} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.fill }} />
                                <span className="text-xs text-slate-600 font-medium flex-1">{e.name}</span>
                                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.fill }} />
                                </div>
                                <span className="text-xs font-bold w-6 text-right" style={{ color: e.fill }}>{e.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bar — hiring pipeline */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-800">Hiring Pipeline</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Candidates at each stage</p>
                    </div>
                    <div className="p-4">
                      <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pipelineBar} margin={{ top: 2, right: 4, left: -22, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                                  <p className="font-semibold text-slate-700">{label}</p>
                                  <p style={{ color: payload[0].payload.fill }} className="font-bold">{payload[0].value}</p>
                                </div>
                              );
                            }} />
                            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                              {pipelineBar.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {pipelineBar.map(({ label, value, fill }) => {
                          const pct = applications.length ? Math.round((value / applications.length) * 100) : 0;
                          return (
                            <div key={label} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: fill }} />
                              <span className="text-xs text-slate-500 w-16 shrink-0">{label}</span>
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: fill }} />
                              </div>
                              <span className="text-xs font-bold w-5 text-right" style={{ color: fill }}>{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Area — applications trend */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-800">Application Trend</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Daily applications (last 14 days)</p>
                    </div>
                    <div className="p-4 h-52">
                      {appsTrend.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <BarChart2 size={24} className="mb-1 opacity-40" /><p className="text-xs">No trend data yet</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={appsTrend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                            <defs>
                              <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                                  <p className="font-semibold text-slate-700">{label}</p>
                                  <p className="font-bold text-blue-600">{payload[0].value} applications</p>
                                </div>
                              );
                            }} />
                            <Area type="monotone" dataKey="count" name="Applications" stroke="#3B82F6" strokeWidth={2} fill="url(#aG)" dot={{ r: 2, fill: '#3B82F6' }} activeDot={{ r: 4 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Row 2: Status Breakdown · User Roles · Verification ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* Application Status Breakdown */}
                  <ChartCard title="Application Status" sub="Distribution across all stages">
                    {statusDonut.length === 0 ? <ChartEmpty /> : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-36 h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={statusDonut} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {statusDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                              </Pie>
                              <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                const pct = applications.length ? Math.round((d.value / applications.length) * 100) : 0;
                                return <TipBox label={d.label} value={`${d.value} (${pct}%)`} color={d.fill} />;
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-extrabold text-slate-900">{applications.length}</span>
                            <span className="text-xs text-slate-400">Total</span>
                          </div>
                        </div>
                        <DonutLegend items={statusDonut.map(e => ({ ...e, name: e.label }))} total={applications.length} />
                      </div>
                    )}
                  </ChartCard>

                  {/* Users by Role */}
                  <ChartCard title="Users by Role" sub="Applicants vs Companies on platform">
                    {userRoleDonut.every(d => d.value === 0) ? <ChartEmpty /> : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-36 h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={userRoleDonut} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {userRoleDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                              </Pie>
                              <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                const total = userRoleDonut.reduce((s, x) => s + x.value, 0);
                                const pct = total ? Math.round((d.value / total) * 100) : 0;
                                return <TipBox label={d.name} value={`${d.value} (${pct}%)`} color={d.fill} />;
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-extrabold text-slate-900">{userRoleDonut.reduce((s, x) => s + x.value, 0)}</span>
                            <span className="text-xs text-slate-400">Users</span>
                          </div>
                        </div>
                        <DonutLegend items={userRoleDonut} total={userRoleDonut.reduce((s, x) => s + x.value, 0)} />
                      </div>
                    )}
                  </ChartCard>

                  {/* Company Verification Status */}
                  <ChartCard title="Verification Status" sub="Institution approval breakdown">
                    {companies.length === 0 ? <ChartEmpty /> : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-36 h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={verifyDonut} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {verifyDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                              </Pie>
                              <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                const pct = companies.length ? Math.round((d.value / companies.length) * 100) : 0;
                                return <TipBox label={d.name} value={`${d.value} (${pct}%)`} color={d.fill} />;
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-extrabold text-slate-900">{companies.length}</span>
                            <span className="text-xs text-slate-400">Total</span>
                          </div>
                        </div>
                        <DonutLegend items={verifyDonut} total={companies.length} />
                      </div>
                    )}
                  </ChartCard>
                </div>

                {/* ── Row 3: Placement Funnel (full width visual) ── */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Placement Funnel</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Drop-off at each hiring stage</p>
                  </div>
                  <div className="p-5">
                    {applications.length === 0 ? <ChartEmpty /> : (
                      <div className="flex flex-col gap-2">
                        {pipelineBar.map(({ label, value, fill }, i) => {
                          const maxVal = pipelineBar[0].value || 1;
                          const pct = Math.round((value / maxVal) * 100);
                          const dropPct = i > 0 && pipelineBar[i-1].value > 0
                            ? Math.round(((pipelineBar[i-1].value - value) / pipelineBar[i-1].value) * 100)
                            : null;
                          return (
                            <div key={label} className="flex items-center gap-3">
                              <span className="w-20 shrink-0 text-xs font-semibold text-slate-600 text-right">{label}</span>
                              <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden">
                                <div
                                  className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                                  style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: fill }}
                                >
                                  <span className="text-white text-xs font-bold">{value}</span>
                                </div>
                              </div>
                              <div className="w-16 shrink-0 text-right">
                                {dropPct !== null && dropPct > 0 ? (
                                  <span className="text-xs text-red-500 font-semibold">−{dropPct}%</span>
                                ) : (
                                  <span className="text-xs text-slate-400">{pct}%</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          Overall placement rate: <strong className="text-emerald-600">
                            {pipelineBar[0].value > 0 ? `${Math.round((pipelineBar[pipelineBar.length-1].value / pipelineBar[0].value) * 100)}%` : '0%'}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Row 4: Top Institutions · Top Skills ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Top Recruiting Institutions */}
                  <ChartCard title="Top Recruiting Institutions" sub="Companies by number of job postings">
                    {topCompanies.length === 0 ? <ChartEmpty msg="No job postings yet" /> : (
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topCompanies} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} axisLine={false} />
                            <Tooltip content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return <TipBox label={payload[0].payload.name} value={`${payload[0].value} posting${payload[0].value !== 1 ? 's' : ''}`} color="#3B82F6" />;
                            }} />
                            <Bar dataKey="count" fill="#3B82F6" radius={[0, 3, 3, 0]} maxBarSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </ChartCard>

                  {/* Top Skills in Demand */}
                  <ChartCard title="Top Skills in Demand" sub="Most requested skills across all postings">
                    {topSkills.length === 0 ? <ChartEmpty msg="No skills data yet" /> : (
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} axisLine={false} />
                            <Tooltip content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return <TipBox label={payload[0].payload.skill} value={`${payload[0].value} posting${payload[0].value !== 1 ? 's' : ''}`} color="#8B5CF6" />;
                            }} />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[0, 3, 3, 0]} maxBarSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </ChartCard>
                </div>

                {/* ── Pending Approvals Alert ── */}
                {stats.pending > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-900">
                        {stats.pending} company verification{stats.pending > 1 ? 's' : ''} pending
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">Review and approve or reject company registrations.</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('companies'); setTabFilter('companies', 'pending'); }}
                      className="shrink-0 text-xs font-semibold text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition flex items-center gap-1"
                    >
                      Review <ArrowRight size={11} />
                    </button>
                  </div>
                )}

                {/* ── Management Tables ── */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Tab bar */}
                  <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-100 overflow-x-auto">
                    {TABS.map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all -mb-px ${
                          activeTab === key
                            ? 'border-blue-600 text-blue-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Toolbar */}
                  <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search…"
                        value={search[activeTab]}
                        onChange={e => setTabSearch(activeTab, e.target.value)}
                        className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 transition"
                      />
                    </div>

                    {/* Status filter - applications */}
                    {activeTab === 'applications' && (
                      <select
                        value={statusFilter.applications}
                        onChange={e => setTabFilter('applications', e.target.value)}
                        className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="all">All Statuses</option>
                        {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    )}

                    {/* Verification filter - companies */}
                    {activeTab === 'companies' && (
                      <select
                        value={statusFilter.companies}
                        onChange={e => setTabFilter('companies', e.target.value)}
                        className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}

                    <span className="ml-auto text-xs text-slate-400">
                      {activeTab === 'applications' && `${filteredApps.length} result${filteredApps.length !== 1 ? 's' : ''}`}
                      {activeTab === 'jobs'          && `${filteredJobs.length} result${filteredJobs.length !== 1 ? 's' : ''}`}
                      {activeTab === 'companies'     && `${filteredCompanies.length} result${filteredCompanies.length !== 1 ? 's' : ''}`}
                      {activeTab === 'applicants'   && `${filteredApplicants.length} result${filteredApplicants.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {/* ── Applications Table ── */}
                  {activeTab === 'applications' && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                              <SortTh col="name"   label="Candidate"  sortKey={sortCfg.key} sortDir={sortCfg.dir} onSort={handleSort} />
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Position</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Company</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                              <SortTh col="date"   label="Applied"    sortKey={sortCfg.key} sortDir={sortCfg.dir} onSort={handleSort} />
                              <SortTh col="status" label="Status"     sortKey={sortCfg.key} sortDir={sortCfg.dir} onSort={handleSort} />
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginate(filteredApps, 'applications').length === 0 ? <EmptyRow cols={8} msg="No applications found" /> :
                              paginate(filteredApps, 'applications').map((app, idx) => {
                                const m = smeta(app.status === 'pending' ? 'pending' : (app.interviewStep || app.status));
                                return (
                                  <tr key={app._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-3 py-2.5 text-xs text-slate-400">{(page.applications - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{app.userId?.fullname || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap max-w-36 truncate">{app.jobId?.title || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{app.jobId?.company || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{app.jobId?.type || '—'}</td>
                                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{fmtDate(app.appliedDate || app.createdAt)}</td>
                                    <td className="px-3 py-2.5"><Badge meta={m} /></td>
                                    <td className="px-3 py-2.5">
                                      <button onClick={() => navigate('/admin/applications')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition font-medium">
                                        <Eye size={11} /> View
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination page={page.applications} total={filteredApps.length} pageSize={PAGE_SIZE} onChange={p => setTabPage('applications', p)} />
                    </>
                  )}

                  {/* ── Jobs Table ── */}
                  {activeTab === 'jobs' && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                              <SortTh col="title" label="Job Title"  sortKey={sortCfg.key} sortDir={sortCfg.dir} onSort={handleSort} />
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Company</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Location</th>
                              <SortTh col="date"  label="Posted"    sortKey={sortCfg.key} sortDir={sortCfg.dir} onSort={handleSort} />
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Deadline</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginate(filteredJobs, 'jobs').length === 0 ? <EmptyRow cols={8} msg="No jobs found" /> :
                              paginate(filteredJobs, 'jobs').map((job, idx) => {
                                const typeColor = TYPE_COLORS[job.type] || '#94A3B8';
                                return (
                                  <tr key={job._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-3 py-2.5 text-xs text-slate-400">{(page.jobs - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap max-w-40 truncate">{job.title}</td>
                                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{job.company}</td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: typeColor + '20', color: typeColor }}>
                                        {job.type}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{job.location}</td>
                                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{fmtDate(job.postDate || job.createdAt)}</td>
                                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{job.deadline || '—'}</td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => navigate(`/opportunities/${job._id}`)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition font-medium">
                                          <Eye size={11} /> View
                                        </button>
                                        <button onClick={() => handleDeleteJob(job._id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg border border-red-200 transition font-medium">
                                          <Trash2 size={11} /> Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination page={page.jobs} total={filteredJobs.length} pageSize={PAGE_SIZE} onChange={p => setTabPage('jobs', p)} />
                    </>
                  )}

                  {/* ── Companies Table ── */}
                  {activeTab === 'companies' && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Company</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Industry</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Size</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Email</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Joined</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginate(filteredCompanies, 'companies').length === 0 ? <EmptyRow cols={8} msg="No companies found" /> :
                              paginate(filteredCompanies, 'companies').map((co, idx) => {
                                const vm = vmeta(co.verificationStatus);
                                const isPending  = co.verificationStatus === 'pending';
                                return (
                                  <tr key={co._id} className={`transition-colors ${isPending ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-blue-50/30'}`}>
                                    <td className="px-3 py-2.5 text-xs text-slate-400">{(page.companies - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-2">
                                        {co.profilePicture
                                          ? <img src={co.profilePicture} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200" />
                                          : <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><Building2 size={13} className="text-slate-400" /></div>
                                        }
                                        <span className="font-semibold text-slate-900 whitespace-nowrap">{co.companyName || co.fullname || '—'}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{co.industry || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{co.companySize || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{co.email}</td>
                                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{fmtDate(co.createdAt)}</td>
                                    <td className="px-3 py-2.5"><Badge meta={vm} /></td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-1">
                                        {isPending && (
                                          <>
                                            <button
                                              onClick={() => handleVerify(co._id)}
                                              disabled={verifying === co._id + '_verify'}
                                              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 transition font-medium disabled:opacity-50"
                                            >
                                              {verifying === co._id + '_verify' ? <Loader2 size={10} className="animate-spin" /> : <BadgeCheck size={11} />} Verify
                                            </button>
                                            <button
                                              onClick={() => handleReject(co._id)}
                                              disabled={verifying === co._id + '_reject'}
                                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg border border-red-200 transition font-medium disabled:opacity-50"
                                            >
                                              {verifying === co._id + '_reject' ? <Loader2 size={10} className="animate-spin" /> : <Ban size={11} />} Reject
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => navigate('/admin/companies')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition font-medium">
                                          <Eye size={11} /> View
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination page={page.companies} total={filteredCompanies.length} pageSize={PAGE_SIZE} onChange={p => setTabPage('companies', p)} />
                    </>
                  )}

                  {/* ── Applicants Table ── */}
                  {activeTab === 'applicants' && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Name</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Email</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Joined</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginate(filteredApplicants, 'applicants').length === 0 ? <EmptyRow cols={6} msg="No applicants found" /> :
                              paginate(filteredApplicants, 'applicants').map((ap, idx) => (
                                <tr key={ap._id} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-3 py-2.5 text-xs text-slate-400">{(page.applicants - 1) * PAGE_SIZE + idx + 1}</td>
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      {ap.profilePicture
                                        ? <img src={ap.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                                        : <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">{(ap.fullname||'?')[0].toUpperCase()}</div>
                                      }
                                      <span className="font-semibold text-slate-900 whitespace-nowrap">{ap.fullname || '—'}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{ap.email}</td>
                                  <td className="px-3 py-2.5 text-xs">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{ap.applicantType || 'Student'}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{fmtDate(ap.createdAt)}</td>
                                  <td className="px-3 py-2.5">
                                    <button onClick={() => navigate('/admin/applicants')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition font-medium">
                                      <Eye size={11} /> View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination page={page.applicants} total={filteredApplicants.length} pageSize={PAGE_SIZE} onChange={p => setTabPage('applicants', p)} />
                    </>
                  )}
                </div>

                {/* ── Recent Activity Feed ── */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Bell size={15} className="text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                    <span className="ml-auto text-xs text-slate-400">{recentActivity.length} events</span>
                  </div>
                  {recentActivity.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No recent activity.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentActivity.map((ev, i) => {
                        const Icon = ev.icon;
                        return (
                          <div key={ev.id + i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${ev.color}`}>
                              <Icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 font-medium leading-snug">{ev.msg}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{fmtDate(ev.time)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
