import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2,
  Briefcase, Loader2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import PostJob from './PostJob';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

const TYPE_COLORS = { Job: '#1E3A8A', Internship: '#EA580C', Traineeship: '#059669' };

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [editingJob, setEditingJob]       = useState(null);
  const [jobs, setJobs]                   = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isVerified, setIsVerified]       = useState(null);
  const [confirm, setConfirm]             = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getMyJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    api.getCompanyVerificationStatus()
      .then(res => setIsVerified(res.data?.isVerified ?? false))
      .catch(() => setIsVerified(false));
  }, []);

  const handleDeleteJob = (id) => {
    setConfirm({
      title: 'Delete Job Posting',
      message: 'This will permanently remove the job listing and all associated applications. This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await api.deleteJob(id);
        setJobs(prev => prev.filter(job => job._id !== id));
        toast.success('Job deleted successfully');
      },
    });
  };

  const handleOpenPostJob = () => {
    if (isVerified === false) {
      toast.error('Your company must be verified before you can post jobs. Please upload your documents from the Profile page.');
      return;
    }
    setIsPostJobOpen(true);
  };

  const handleJobPostSuccess = () => {
    setEditingJob(null);
    fetchJobs();
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setTimeout(() => setIsPostJobOpen(true), 0);
  };

  const handleModalClose = () => {
    setIsPostJobOpen(false);
    setEditingJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Jobs' && job.type === 'Job') ||
      (activeTab === 'Internships' && job.type === 'Internship') ||
      (activeTab === 'Traineeships' && job.type === 'Traineeship');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  // Chart data
  const typeDonut = useMemo(() => {
    const c = { Job: 0, Internship: 0, Traineeship: 0 };
    jobs.forEach(j => { if (c[j.type] !== undefined) c[j.type]++; });
    return Object.entries(c)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, fill: TYPE_COLORS[name] }));
  }, [jobs]);

  const monthlyBar = useMemo(() => {
    const counts = {};
    jobs.forEach(j => {
      const d = new Date(j.postDate || j.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).slice(-8).map(([month, count]) => ({ month, count }));
  }, [jobs]);

  const totalJobs = jobs.filter(j => j.type === 'Job').length;
  const totalInternships = jobs.filter(j => j.type === 'Internship').length;
  const totalTraineeships = jobs.filter(j => j.type === 'Traineeship').length;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const TABS = [
    { key: 'All',         label: `All (${jobs.length})` },
    { key: 'Jobs',        label: `Jobs (${totalJobs})` },
    { key: 'Internships', label: `Internships (${totalInternships})` },
    { key: 'Traineeships',label: `Traineeships (${totalTraineeships})` },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="jobs" />
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* Unverified warning banner */}
              {isVerified === false && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Company not verified</p>
                    <p className="text-xs text-amber-700 mt-0.5">Your company account must be verified by an admin before you can post jobs. Go to <strong>Profile → Verification Documents</strong> to upload your documents.</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Job & Internship Management</h1>
                  <p className="text-slate-500 text-xs mt-0.5">Post and manage your job opportunities</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingJob(null); handleOpenPostJob(); }}
                  className="bg-blue-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-950 transition-colors text-sm font-semibold shadow-sm shrink-0"
                >
                  <Plus size={16} /> Post New Opportunity
                </button>
              </div>

              {/* Charts Row */}
              {!isLoading && jobs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Donut — by type */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-800">Postings by Type</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Breakdown across job categories</p>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-36 h-36 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={typeDonut}
                              cx="50%" cy="50%"
                              innerRadius={44} outerRadius={68}
                              paddingAngle={3} dataKey="value" strokeWidth={0}
                            >
                              {typeDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                const pct = jobs.length ? Math.round((d.value / jobs.length) * 100) : 0;
                                return (
                                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                                    <p className="font-semibold text-slate-700">{d.name}</p>
                                    <p style={{ color: d.fill }} className="font-bold">{d.value} ({pct}%)</p>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-extrabold text-slate-900">{jobs.length}</span>
                          <span className="text-xs text-slate-400">Total</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-2.5">
                        {typeDonut.map((e) => {
                          const pct = jobs.length ? Math.round((e.value / jobs.length) * 100) : 0;
                          return (
                            <div key={e.name} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.fill }} />
                              <span className="text-xs font-semibold text-slate-600 w-24 shrink-0">{e.name}</span>
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.fill }} />
                              </div>
                              <span className="text-xs font-bold w-6 text-right" style={{ color: e.fill }}>{e.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bar — postings per month */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-800">Postings Over Time</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Jobs posted per month</p>
                    </div>
                    <div className="p-4 h-52">
                      {monthlyBar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Briefcase size={24} className="mb-1 opacity-40" />
                          <p className="text-xs">No timeline data</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyBar} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                                    <p className="font-semibold text-slate-700">{label}</p>
                                    <p className="font-bold text-blue-900">{payload[0].value} posting{payload[0].value !== 1 ? 's' : ''}</p>
                                  </div>
                                );
                              }}
                            />
                            <Bar dataKey="count" fill="#1E3A8A" radius={[3, 3, 0, 0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PostJob Modal */}
              <PostJob
                isOpen={isPostJobOpen}
                onClose={handleModalClose}
                onSuccess={handleJobPostSuccess}
                editJob={editingJob}
              />

              {/* Search and Tabs */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    <input
                      type="text"
                      placeholder="Search by title or company…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 transition"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {isLoading ? '…' : `${filteredJobs.length} result${filteredJobs.length !== 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Tab chips */}
                <div className="px-4 py-2.5 flex gap-1.5 flex-wrap border-b border-slate-100 bg-slate-50/60">
                  {TABS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                        activeTab === key
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Table */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-500">Loading jobs…</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500 text-sm">
                    <p>{error}</p>
                    <button onClick={fetchJobs} className="mt-2 text-blue-600 hover:underline text-xs">Try again</button>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-14 text-slate-500">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-sm">No jobs found</p>
                    <p className="text-xs mt-1">Post your first opportunity to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 w-8">S.N.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Position</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Deadline</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Salary</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredJobs.map((job, idx) => (
                          <tr key={job._id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap max-w-52 truncate">{job.title}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                job.type === 'Job'        ? 'bg-blue-100 text-blue-800' :
                                job.type === 'Internship' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-emerald-100 text-emerald-700'
                              }`}>
                                {job.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{job.location || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{job.duration || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(job.deadline)}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{job.salary || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleEditJob(job); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit size={12} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobManagement;
