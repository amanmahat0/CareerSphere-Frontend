import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Loader2, ArrowRight, Search, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Sidebar from '../Components/ApplicantSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

/* ─── constants ─────────────────────────────────────────── */
const STATUS_META = {
  pending:     { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Applied',     color: '#3B82F6' },
  shortlisted: { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Shortlisted', color: '#8B5CF6' },
  test:        { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Test',        color: '#F97316' },
  interview:   { bg: 'bg-cyan-100',    text: 'text-cyan-700',    label: 'Interview',   color: '#06B6D4' },
  offer:       { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Offer',       color: '#22C55E' },
  hired:       { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hired',       color: '#10B981' },
  rejected:    { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected',    color: '#EF4444' },
  withdrawn:   { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Withdrawn',   color: '#EF4444' },
};
const STATUS_FILTERS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];
const FILTER_KEY = { Applied: 'pending', Shortlisted: 'shortlisted', Interview: 'interview', Offer: 'offer', Rejected: 'rejected' };

/* ─── helpers ───────────────────────────────────────────── */
const statusMeta = (s) => STATUS_META[s] || { bg: 'bg-gray-100', text: 'text-gray-700', label: s, color: '#9CA3AF' };

// Mirror the rest of the app: derive the display status, hiding test/interview until actually assigned
const getStatus = (a) => {
  if (a.status === 'pending')    return 'pending';
  if (a.interviewStep === 'withdrawn' || a.status === 'withdrawn') return 'withdrawn';
  if (a.interviewStep === 'rejected'  || a.status === 'rejected')  return 'rejected';
  if (a.interviewStep === 'test'      && !a.testDeadline)          return 'shortlisted';
  if (a.interviewStep === 'interview' && !a.interviewDate)         return 'shortlisted';
  return a.interviewStep || a.status || 'pending';
};

const buildDonutData = (apps) => {
  const counts = {};
  apps.forEach((a) => { const s = getStatus(a); counts[s] = (counts[s] || 0) + 1; });
  return Object.entries(counts).map(([status, count]) => ({
    status, name: statusMeta(status).label, value: count, fill: statusMeta(status).color,
  }));
};

/* ─── main ───────────────────────────────────────────────── */
const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (!user?.id) return;
    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const res = await api.getAllApplications();
        if (res.data) {
          setApplications(res.data.sort((a, b) =>
            new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt)
          ));
        }
      } catch {} finally { setLoadingApps(false); }
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
      } catch {} finally { setLoadingInterviews(false); }
    };
    fetchApps();
    fetchInterviews();
  }, [user]);

  const filteredApps = useMemo(() => {
    let list = applications;
    if (activeFilter !== 'All') {
      const key = FILTER_KEY[activeFilter];
      list = list.filter((a) => getStatus(a) === key);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.jobId?.title?.toLowerCase().includes(q) || a.jobId?.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [applications, activeFilter, searchQuery]);

  const donutData = useMemo(() => buildDonutData(applications), [applications]);
  const statusCounts = useMemo(() => {
    const c = {};
    applications.forEach((a) => { const s = getStatus(a); c[s] = (c[s] || 0) + 1; });
    return c;
  }, [applications]);

  if (!user) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <Loader2 size={28} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="dashboard" />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Applicant"
          dashboardPath="/applicant/dashboard"
          profilePath="/applicant/profile"
        />

        <main className="flex-1 overflow-y-auto p-3 lg:p-5">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 text-xs mt-0.5">Overview of your job search activity.</p>
              </div>
              <button
                onClick={() => navigate('/opportunities')}
                className="hidden sm:flex items-center gap-2 bg-blue-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-blue-950 transition shadow-sm"
              >
                Browse Jobs
              </button>
            </div>

            {/* ── Resume warning ── */}
            {!user.resumeComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600 shrink-0">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">Your resume is incomplete</p>
                  <p className="text-xs text-amber-700">Complete it to start applying.</p>
                </div>
                <button
                  onClick={() => navigate('/applicant/resume')}
                  className="shrink-0 text-xs font-medium text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                >
                  Build now →
                </button>
              </div>
            )}

            {/* ── Charts ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Application Status Overview</h2>
              </div>

              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                  <BarChart2 size={26} className="mb-1.5 opacity-40" />
                  <p className="text-xs text-slate-500">No data yet — apply to see your analytics.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* Donut + Legend */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                    <div className="relative shrink-0 w-36 h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload;
                              const pct = Math.round((d.value / applications.length) * 100);
                              return (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5">
                                  <p className="text-xs font-semibold text-slate-700">{d.name}</p>
                                  <p className="text-xs font-bold mt-0.5" style={{ color: d.fill }}>{d.value} ({pct}%)</p>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-slate-900">{applications.length}</span>
                        <span className="text-xs text-slate-500">Total</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2">
                      {donutData.map((entry) => {
                        const pct = Math.round((entry.value / applications.length) * 100);
                        return (
                          <div key={entry.status} className="flex items-center gap-2">
                            <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-1">
                                <span className="text-xs font-medium text-slate-700 truncate">{entry.name}</span>
                                <span className="text-xs font-semibold shrink-0" style={{ color: entry.fill }}>{entry.value}</span>
                              </div>
                              <div className="mt-0.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: entry.fill }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-slate-500 mb-2">Applications by Status</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={donutData} barSize={22} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={18} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5">
                                <p className="text-xs font-semibold text-slate-700">{d.name}</p>
                                <p className="text-xs font-bold mt-0.5" style={{ color: d.fill }}>{d.value} applications</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* ── Applications Table ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-800">My Applications</h2>
                <button
                  onClick={() => navigate('/applicant/applications')}
                  className="text-xs font-medium text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {/* Filters + Search */}
              <div className="px-4 py-2.5 flex flex-wrap items-center gap-2 border-b border-slate-100">
                <div className="flex gap-1.5 flex-wrap">
                  {STATUS_FILTERS.map((f) => {
                    const count = f === 'All' ? applications.length : statusCounts[FILTER_KEY[f]] || 0;
                    return (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
                          activeFilter === f
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                        }`}
                      >
                        {f}
                        {f !== 'All' && count > 0 && (
                          <span className={`ml-1 ${activeFilter === f ? 'text-blue-200' : 'text-slate-400'}`}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="relative ml-auto">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search job or company…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 transition"
                  />
                </div>
              </div>

              {loadingApps ? (
                <div className="flex items-center justify-center p-8"><Loader2 size={26} className="text-blue-600 animate-spin" /></div>
              ) : filteredApps.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText size={28} className="mx-auto text-slate-300 mb-1.5" />
                  <p className="text-xs font-medium text-slate-500">No applications found</p>
                  {activeFilter === 'All' && !searchQuery && (
                    <button onClick={() => navigate('/opportunities')}
                      className="mt-2.5 px-4 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-medium hover:bg-blue-950 transition">
                      Browse Opportunities
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Job Title</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Company</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Type</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.slice(0, 10).map((app, idx) => {
                        const sm = statusMeta(getStatus(app));
                        return (
                          <tr key={app._id || app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-2.5 text-xs font-medium text-slate-800 whitespace-nowrap max-w-45 truncate">{app.jobId?.title || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{app.jobId?.company || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{app.jobId?.type || 'Job'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sm.bg} ${sm.text}`}>{sm.label}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Upcoming Interviews</h2>
                <button
                  onClick={() => navigate('/applicant/interviews')}
                  className="text-xs font-medium text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {loadingInterviews ? (
                <div className="flex items-center justify-center p-8"><Loader2 size={26} className="text-blue-600 animate-spin" /></div>
              ) : interviews.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar size={28} className="mx-auto text-slate-300 mb-1.5" />
                  <p className="text-xs font-medium text-slate-500">No upcoming interviews</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {interviews.map((interview) => {
                    const d = new Date(interview.scheduledDate);
                    return (
                      <div key={interview._id || interview.id} className="px-4 py-3 hover:bg-slate-50 transition-colors flex flex-wrap items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 leading-none">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-sm font-bold text-blue-800 leading-tight">{d.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{interview.jobTitle || '—'}</p>
                          <p className="text-xs text-slate-500">{interview.companyName || '—'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-slate-600">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <button className="mt-1 text-xs font-medium bg-blue-900 text-white px-3 py-1 rounded-lg hover:bg-blue-950 transition">Join</button>
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
