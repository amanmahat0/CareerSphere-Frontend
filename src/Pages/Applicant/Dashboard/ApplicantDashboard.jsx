import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Search,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

/* ─── constants ─────────────────────────────────────────── */
const STATUS_META = {
  applied:     { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Applied',      color: '#3B82F6' },
  shortlisted: { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Shortlisted',  color: '#8B5CF6' },
  test:        { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Test',         color: '#F97316' },
  interview:   { bg: 'bg-cyan-100',    text: 'text-cyan-700',    label: 'Interview',    color: '#06B6D4' },
  offer:       { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Offer',        color: '#22C55E' },
  rejected:    { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected',     color: '#EF4444' },
  withdrawn:   { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Withdrawn',    color: '#EF4444' },
  completed:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed',    color: '#10B981' },
};
const STATUS_FILTERS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

/* ─── helpers ───────────────────────────────────────────── */
const statusMeta = (status) => STATUS_META[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, color: '#9CA3AF' };

const buildDonutData = (apps) => {
  const counts = {};
  apps.forEach((a) => {
    const s = a.status || 'applied';
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({
    status,
    name: statusMeta(status).label,
    value: count,
    fill: statusMeta(status).color,
    bg: statusMeta(status).bg,
    text: statusMeta(status).text,
  }));
};

/* ─── sub-components ─────────────────────────────────────── */
const StatPill = ({ label, value, icon: Icon, accent }) => (
  <div className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm`}>
    <div className={`p-2 rounded-lg ${accent}`}>
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 leading-none mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);


/* ─── main component ─────────────────────────────────────── */
const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  /* filter / search state */
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  /* ── load user ── */
  useEffect(() => {
    const load = async () => {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        let resumeComplete = false;
        try {
          const res = await api.getResume();
          resumeComplete = res.success && res.data?.isComplete;
          localStorage.setItem('resumeComplete', JSON.stringify(resumeComplete));
        } catch {
          const stored = localStorage.getItem('resumeComplete');
          resumeComplete = stored ? JSON.parse(stored) : false;
        }
        setUser({ id: parsed.id, name: parsed.name || parsed.fullname || 'User', resumeComplete });
      } catch {}
    };
    load();
  }, []);

  /* ── fetch data ── */
  useEffect(() => {
    if (!user?.id) return;

    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const res = await api.getAllApplications();
        if (res.data) {
          setApplications(
            res.data.sort((a, b) =>
              new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt)
            )
          );
        }
      } catch {}
      finally { setLoadingApps(false); }
    };

    const fetchInterviews = async () => {
      setLoadingInterviews(true);
      try {
        const res = await api.getInterviewSchedule();
        if (res.data) {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          setInterviews(
            res.data
              .filter((i) => new Date(i.scheduledDate) >= today && i.status !== 'completed')
              .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
              .slice(0, 5)
          );
        }
      } catch {}
      finally { setLoadingInterviews(false); }
    };

    fetchApps();
    fetchInterviews();
  }, [user]);

  /* ── derived data ── */
  const filteredApps = useMemo(() => {
    let list = applications;
    if (activeFilter !== 'All') list = list.filter((a) => a.status?.toLowerCase() === activeFilter.toLowerCase());
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.jobId?.title?.toLowerCase().includes(q) ||
        a.jobId?.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [applications, activeFilter, searchQuery]);

  const donutData = useMemo(() => buildDonutData(applications), [applications]);

  const statusCounts = useMemo(() => {
    const c = {};
    applications.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [applications]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Applicant"
        dashboardPath="/applicant/dashboard"
        profilePath="/applicant/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="dashboard" />

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Welcome Banner ── */}
            <div className="bg-linear-to-r from-blue-900 to-blue-700 rounded-2xl px-6 py-5 text-white flex items-center justify-between gap-4 shadow-md">
              <div>
                <h1 className="text-xl font-bold mb-0.5">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-blue-200 text-sm">Here's an overview of your job search activity.</p>
              </div>
              <div className="shrink-0 hidden sm:flex gap-2">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="bg-white text-blue-800 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Browse Jobs
                </button>
              </div>
            </div>

            {/* ── Resume warning ── */}
            {!user.resumeComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600 shrink-0">
                  <FileText size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-900 text-sm">Your resume is incomplete</p>
                  <p className="text-xs text-amber-700 mt-0.5">Complete it to start applying for opportunities.</p>
                </div>
                <button
                  onClick={() => navigate('/applicant/resume')}
                  className="shrink-0 text-xs font-semibold text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                >
                  Build now →
                </button>
              </div>
            )}

            {/* ── Stat Pills ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatPill label="Total Applications" value={applications.length} icon={FileText}    accent="bg-blue-600" />
              <StatPill label="Upcoming Interviews" value={interviews.length}  icon={Calendar}    accent="bg-cyan-600" />
              <StatPill label="Shortlisted"         value={statusCounts.shortlisted || 0}         icon={TrendingUp}   accent="bg-purple-600" />
              <StatPill label="Resume"              value={user.resumeComplete ? 'Complete' : 'Incomplete'} icon={CheckCircle2} accent={user.resumeComplete ? 'bg-emerald-600' : 'bg-slate-400'} />
            </div>

            {/* ── Application Status Donut Chart ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Application Status Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Breakdown of all your applications by current status</p>
              </div>

              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                  <BarChart2 size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No data yet — apply to see your analytics.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5">
                  {/* Donut */}
                  <div className="relative shrink-0 w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {donutData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            const pct = Math.round((d.value / applications.length) * 100);
                            return (
                              <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                                <p className="font-semibold text-slate-700">{d.name}</p>
                                <p style={{ color: d.fill }} className="font-bold mt-0.5">
                                  {d.value} ({pct}%)
                                </p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-extrabold text-slate-900">{applications.length}</span>
                      <span className="text-xs text-slate-400 font-medium">Total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 w-full grid grid-cols-2 gap-x-6 gap-y-3">
                    {donutData.map((entry) => {
                      const pct = Math.round((entry.value / applications.length) * 100);
                      return (
                        <div key={entry.status} className="flex items-center gap-2.5">
                          <span
                            className="shrink-0 w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.fill }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-700 truncate">{entry.name}</span>
                              <span className="text-xs font-bold shrink-0" style={{ color: entry.fill }}>{entry.value}</span>
                            </div>
                            <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: entry.fill }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Applications Table ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900">Applications</h2>
                <button
                  onClick={() => navigate('/applicant/applications')}
                  className="text-xs font-bold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {/* Filters + Search */}
              <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 border-b border-slate-100">
                <div className="flex gap-1 flex-wrap">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-all border ${
                        activeFilter === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {f}
                      {f !== 'All' && statusCounts[f.toLowerCase()] > 0 && (
                        <span className={`ml-1.5 ${activeFilter === f ? 'text-blue-200' : 'text-slate-400'}`}>
                          {statusCounts[f.toLowerCase()]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative ml-auto">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search job or company…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 transition"
                  />
                </div>
              </div>

              {/* Table */}
              {loadingApps ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 size={28} className="text-blue-600 animate-spin" />
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="p-10 text-center">
                  <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No applications found</p>
                  {activeFilter === 'All' && !searchQuery && (
                    <button
                      onClick={() => navigate('/opportunities')}
                      className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition font-semibold"
                    >
                      Browse Opportunities
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-10">S.N.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Job Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.slice(0, 10).map((app, idx) => {
                        const sm = statusMeta(app.status);
                        return (
                          <tr
                            key={app._id || app.id}
                            className="hover:bg-blue-50/40 transition-colors cursor-default"
                          >
                            <td className="px-4 py-3 text-xs font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap max-w-45 truncate">
                              {app.jobId?.title || '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{app.jobId?.company || '—'}</td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{app.jobId?.type || 'Job'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sm.bg} ${sm.text}`}>
                                {sm.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                              {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Upcoming Interviews ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Upcoming Interviews</h2>
                <button
                  onClick={() => navigate('/applicant/interviews')}
                  className="text-xs font-bold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {loadingInterviews ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 size={28} className="text-blue-600 animate-spin" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="p-10 text-center">
                  <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No upcoming interviews</p>
                  <p className="text-slate-400 text-xs mt-1">They will appear here once scheduled.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {interviews.map((interview) => {
                    const d = new Date(interview.scheduledDate);
                    return (
                      <div key={interview._id || interview.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Date bubble */}
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 leading-none">
                              {d.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-extrabold text-blue-800 leading-tight">
                              {d.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{interview.jobTitle || '—'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{interview.companyName || '—'}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-semibold text-slate-700">
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <button className="mt-1 text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                              Join
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
