import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, MapPin, Copy,
  CheckCircle2, Loader2, AlertCircle, FileText,
  Link as LinkIcon, BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import { toast } from '../../../utils/toast';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

/* ─── sub-components ─────────────────────────────────────── */
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

/* ─── main component ─────────────────────────────────────── */
const InterviewDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingSubmitted, setMarkingSubmitted] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await api.getUserApplications();
      if (res.success && res.data) setApplications(res.data);
    } catch (err) { setError(err.message || 'Failed to load schedule'); }
    finally { setLoading(false); }
  };

  const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

  const testApps      = applications.filter(a => a.interviewStep === 'test');
  const upcomingApps  = applications.filter(a =>
    a.interviewDate && new Date(a.interviewDate) >= today && a.interviewStep === 'interview'
  ).sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
  const pastApps      = applications.filter(a =>
    a.interviewStep === 'interview' && a.interviewDate && new Date(a.interviewDate) < today
  ).sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate));

  const chartData = [
    { label: 'Pending Tests',   value: testApps.length,     fill: '#F59E0B' },
    { label: 'Upcoming',        value: upcomingApps.length, fill: '#3B82F6' },
    { label: 'Past',            value: pastApps.length,     fill: '#94A3B8' },
  ];

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).replace(/\//g, '-');
  };

  const formatCountdown = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Deadline passed';
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleMarkSubmitted = async (id) => {
    if (!window.confirm('Mark your test as submitted?')) return;
    setMarkingSubmitted(id);
    try {
      const res = await api.markTestSubmitted(id);
      if (res.success) {
        setApplications(prev => prev.map(a =>
          a._id === id ? { ...a, testSubmittedAt: new Date().toISOString() } : a
        ));
      }
    } catch (err) { toast.error(err.message || 'Failed to mark as submitted'); }
    finally { setMarkingSubmitted(null); }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userRole="Applicant" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="interviews" />

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Banner ── */}
            <div className="bg-linear-to-r from-blue-900 to-blue-700 rounded-2xl px-6 py-5 text-white shadow-md">
              <h1 className="text-xl font-bold mb-0.5">Interview Schedule</h1>
              <p className="text-blue-200 text-sm">Your tests, upcoming interviews, and past interviews in one place.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* ── Stat Pills ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatPill label="Pending Tests"      value={testApps.length}     icon={FileText}    accent="bg-amber-500" />
              <StatPill label="Upcoming Interviews" value={upcomingApps.length} icon={Calendar}    accent="bg-blue-600" />
              <StatPill label="Past Interviews"     value={pastApps.length}     icon={CheckCircle2} accent="bg-slate-500" />
            </div>

            {/* ── Bar Chart ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Interview Activity Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Summary of your tests and interview stages</p>
              </div>

              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                  <BarChart2 size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No interview data yet.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5">
                  {/* Bar chart */}
                  <div className="w-full sm:w-72 h-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                                <p className="font-semibold text-slate-700">{label}</p>
                                <p style={{ color: payload[0].payload.fill }} className="font-bold mt-0.5">
                                  {payload[0].value}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 w-full space-y-3">
                    {chartData.map((entry) => {
                      const total = chartData.reduce((s, d) => s + d.value, 0) || 1;
                      const pct   = Math.round((entry.value / total) * 100);
                      return (
                        <div key={entry.label} className="flex items-center gap-2.5">
                          <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-700">{entry.label}</span>
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

            {/* ── Test Schedule ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Pending Tests</h2>
                <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {testApps.length}
                </span>
              </div>

              {testApps.length === 0 ? (
                <div className="p-10 text-center">
                  <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No pending tests</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {testApps.map((app) => (
                    <div key={app._id} className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                          {app.jobId?.title?.substring(0, 2).toUpperCase() || 'JB'}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{app.jobId?.title || 'Unknown Position'}</h3>
                          <p className="text-xs text-slate-500">{app.jobId?.company || 'Unknown Company'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs text-slate-600">
                        {app.testType && (
                          <span className="flex items-center gap-1.5">
                            <FileText size={13} className="text-slate-400" />
                            <span className="capitalize">{app.testType.replace(/_/g, ' ')}</span>
                          </span>
                        )}
                        {app.testDeadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            Deadline: {formatDate(app.testDeadline)}
                            {formatCountdown(app.testDeadline) && (
                              <span className="text-amber-600 font-semibold ml-1">({formatCountdown(app.testDeadline)})</span>
                            )}
                          </span>
                        )}
                        {app.testMode === 'online'  && <span className="flex items-center gap-1.5"><Video  size={13} className="text-slate-400" />Online</span>}
                        {app.testMode === 'offline' && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />In-person</span>}
                      </div>

                      {app.testMode === 'online' && app.testLink && (
                        <div className="flex gap-2 mb-3">
                          <a
                            href={app.testLink} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-2 px-4 rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <LinkIcon size={13} /> Open Test Platform
                          </a>
                          <button
                            onClick={() => copyToClipboard(app.testLink)}
                            className="px-3 py-2 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-50 text-xs transition flex items-center gap-1"
                          >
                            <Copy size={13} /> Copy
                          </button>
                        </div>
                      )}
                      {app.testMode === 'offline' && app.testLocation && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs flex items-start gap-2">
                          <MapPin size={13} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-500 mb-0.5">Test Venue</p>
                            <p className="text-slate-700">{app.testLocation}</p>
                          </div>
                        </div>
                      )}

                      {app.testSubmittedAt ? (
                        <div className="flex items-center gap-2 text-green-700 text-xs font-semibold">
                          <CheckCircle2 size={14} /> Submitted on {formatDate(app.testSubmittedAt)}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkSubmitted(app._id)}
                          disabled={markingSubmitted === app._id}
                          className="flex items-center gap-2 text-xs px-4 py-2 border border-green-400 text-green-700 hover:bg-green-50 rounded-lg transition font-semibold disabled:opacity-50"
                        >
                          {markingSubmitted === app._id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <CheckCircle2 size={13} />}
                          Mark as Submitted
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Upcoming Interviews ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Upcoming Interviews</h2>
                <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {upcomingApps.length}
                </span>
              </div>

              {upcomingApps.length === 0 ? (
                <div className="p-10 text-center">
                  <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No upcoming interviews scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingApps.map((app) => {
                    const d = new Date(app.interviewDate);
                    return (
                      <div key={app._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Date bubble */}
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 leading-none">
                              {d.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-extrabold text-blue-800 leading-tight">{d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{app.jobId?.title || '—'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{app.jobId?.company || '—'}</p>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                              {app.interviewTime && (
                                <span className="flex items-center gap-1"><Clock size={12} />{app.interviewTime}</span>
                              )}
                              {app.interviewType === 'online'
                                ? <span className="flex items-center gap-1"><Video size={12} />Virtual</span>
                                : <span className="flex items-center gap-1"><MapPin size={12} />In Person</span>
                              }
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col gap-1.5 items-end">
                            {app.interviewType === 'online' && app.meetingLink ? (
                              <>
                                <a
                                  href={app.meetingLink} target="_blank" rel="noopener noreferrer"
                                  className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                                >
                                  <Video size={12} /> Join
                                </a>
                                <button
                                  onClick={() => copyToClipboard(app.meetingLink)}
                                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                                >
                                  <Copy size={12} /> Copy link
                                </button>
                              </>
                            ) : app.interviewLocation ? (
                              <div className="text-right text-xs text-slate-600 max-w-32">
                                <p className="font-semibold text-slate-500 mb-0.5">Venue</p>
                                <p>{app.interviewLocation}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Past Interviews ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">Past Interviews</h2>
                <span className="ml-auto text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {pastApps.length}
                </span>
              </div>

              {pastApps.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No completed interviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pastApps.map((app) => {
                    const d = new Date(app.interviewDate);
                    return (
                      <div key={app._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                              {app.jobId?.title?.substring(0, 2).toUpperCase() || '—'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{app.jobId?.title || '—'}</p>
                              <p className="text-xs text-slate-500">{app.jobId?.company || '—'}</p>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(app.interviewDate)}</span>
                                {app.interviewTime && <span className="flex items-center gap-1"><Clock size={12} />{app.interviewTime}</span>}
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        </div>
                        {app.interviewFeedback && (
                          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                            <p className="font-semibold text-slate-500 mb-1">Feedback</p>
                            <p className="text-slate-700">{app.interviewFeedback}</p>
                          </div>
                        )}
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

export default InterviewDashboard;
