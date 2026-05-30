import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Calendar, UserCheck,
  Loader2, ArrowRight, CalendarPlus, BarChart2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

/* ─── project-consistent status palette ─────────────────── */
const STATUS_META = {
  pending:     { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Applied',     color: '#3B82F6' },
  shortlisted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shortlisted', color: '#8B5CF6' },
  test:        { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Test',        color: '#06B6D4' },
  interview:   { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Interview',   color: '#F59E0B' },
  offer:       { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Offer',       color: '#22C55E' },
  hired:       { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Hired',       color: '#10B981' },
  rejected:    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected',    color: '#EF4444' },
  withdrawn:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Withdrawn',   color: '#EF4444' },
};
const smeta = (s) => STATUS_META[s] || { bg: 'bg-slate-100', text: 'text-slate-600', label: s || 'Applied', color: '#94A3B8' };

/* ─── StatPill ─────────────────────────────────────────── */
const StatPill = ({ label, value, icon: Icon, accent }) => (
  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
    <div className={`p-2 rounded-lg ${accent}`}>
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 leading-none mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

/* ─── main ──────────────────────────────────────────────── */
const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [jobs, setJobs]                 = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes] = await Promise.all([
          api.getAllJobs(),
          api.getCompanyApplications(),
        ]);
        setJobs(jobsRes.jobs || []);
        setApplications(appsRes.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!applications.length) return;
    const today = new Date(); today.setHours(0,0,0,0);
    setInterviews(
      applications
        .filter(a => {
          const d = new Date(a.interviewDate || a.testDeadline);
          return (a.interviewDate || a.testDeadline) && d >= today &&
            ['test','interview','offer'].includes(a.interviewStep);
        })
        .sort((a, b) => new Date(a.interviewDate || a.testDeadline) - new Date(b.interviewDate || b.testDeadline))
        .slice(0, 5)
    );
  }, [applications]);

  /* donut: status distribution */
  const donutData = useMemo(() => {
    const c = {};
    applications.forEach(a => {
      const s = a.status === 'pending' ? 'pending' : (a.interviewStep || a.status || 'pending');
      c[s] = (c[s]||0) + 1;
    });
    return Object.entries(c).map(([s, v]) => ({ status: s, name: smeta(s).label, value: v, fill: smeta(s).color }));
  }, [applications]);

  /* pipeline funnel bars */
  const pipeline = useMemo(() => {
    const get = (...keys) => applications.filter(a => a.status !== 'pending' && keys.includes(a.interviewStep || a.status)).length;
    return [
      { label: 'Applied',     value: applications.length,      fill: '#3B82F6' },
      { label: 'Shortlisted', value: get('shortlisted'),        fill: '#8B5CF6' },
      { label: 'Test',        value: get('test'),               fill: '#06B6D4' },
      { label: 'Interview',   value: get('interview'),          fill: '#F59E0B' },
      { label: 'Offer',       value: get('offer'),              fill: '#22C55E' },
      { label: 'Hired',       value: get('hired'),              fill: '#10B981' },
    ];
  }, [applications]);

  const counts = useMemo(() => ({
    jobs:        jobs.length,
    apps:        applications.length,
    shortlisted: applications.filter(a => a.status !== 'pending' && ['shortlisted','test'].includes(a.interviewStep)).length,
    interview:   applications.filter(a => a.status !== 'pending' && ['interview','offer'].includes(a.interviewStep)).length,
    hired:       applications.filter(a => a.status !== 'pending' && a.interviewStep === 'hired').length,
  }), [jobs, applications]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="dashboard" />
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
                <p className="text-slate-500 text-xs mt-0.5">Manage your recruitment and placement activities.</p>
              </div>
              <button
                onClick={() => navigate('/company/jobs')}
                className="hidden sm:inline-flex bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-950 transition"
              >
                Post a Job
              </button>
            </div>

            {/* ── Analytics: Donut + Pipeline ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Donut */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Application Status Distribution</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Breakdown of all incoming applications by stage</p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                    <BarChart2 size={28} className="mb-2 opacity-40" />
                    <p className="text-sm">No applications yet.</p>
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

              {/* Hiring Pipeline Funnel */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Hiring Details</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Candidate progression through stages</p>
                </div>
                <div className="p-4 space-y-2.5">
                  {pipeline.map(({ label, value, fill }) => {
                    const pct = applications.length ? Math.round((value / applications.length) * 100) : 0;
                    return (
                      <div key={label} className="flex items-center gap-2.5">
                        <span className="w-20 text-xs font-medium text-slate-600 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: fill }} />
                        </div>
                        <span className="text-xs font-bold w-6 text-right shrink-0" style={{ color: fill }}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Recent Applications ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Recent Applications</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{applications.length} total received</p>
                </div>
                <button
                  onClick={() => navigate('/company/applications')}
                  className="text-xs font-bold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 size={26} className="text-blue-600 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-10 text-center">
                  <Users size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No applications received yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 w-10">S.N.</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Candidate</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Position</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Applied</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.slice(0, 8).map((app, idx) => {
                        const m = smeta(app.status === 'pending' ? 'pending' : (app.interviewStep || app.status));
                        return (
                          <tr key={app._id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{app.userId?.fullname || '—'}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{app.jobId?.title || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
                                {m.label}
                              </span>
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
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Upcoming Interviews & Tests</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Scheduled within the coming days</p>
                </div>
                <button
                  onClick={() => navigate('/company/interviews')}
                  className="text-xs font-bold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {interviews.length === 0 ? (
                <div className="p-10 text-center">
                  <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No upcoming interviews scheduled.</p>
                  <button
                    onClick={() => navigate('/company/interviews')}
                    className="mt-3 text-xs font-semibold text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    Schedule Interview
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {interviews.map((iv) => {
                    const d = new Date(iv.interviewDate || iv.testDeadline);
                    const m = smeta(iv.interviewStep);
                    return (
                      <div key={iv._id} className="px-5 py-4 hover:bg-slate-50 transition-colors flex flex-wrap items-center gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-blue-700 leading-none">
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-extrabold text-blue-800 leading-tight">{d.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{iv.userId?.fullname || '—'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{iv.jobId?.title || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
                            {m.label}
                          </span>
                          <button
                            onClick={() => navigate('/company/interviews')}
                            className="text-xs font-semibold bg-blue-900 text-white px-3 py-1.5 rounded-lg hover:bg-blue-950 transition"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Post New Job', desc: 'Create a job or internship posting', icon: Briefcase, accent: 'bg-blue-50', iconColor: 'text-blue-700', path: '/company/jobs' },
                { label: 'Schedule Interview', desc: 'Set up interview rounds for candidates', icon: CalendarPlus, accent: 'bg-cyan-50', iconColor: 'text-cyan-700', path: '/company/interviews' },
              ].map(({ label, desc, icon: Icon, accent, iconColor, path }) => (
                <div
                  key={label}
                  onClick={() => navigate(path)}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className={`${accent} p-3 rounded-xl shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
