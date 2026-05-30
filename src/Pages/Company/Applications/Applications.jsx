import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Loader2, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import ViewDetails from './ViewDetails';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const STATUS_META = [
  { key: 'pending',     label: 'Pending',     fill: '#EAB308' },
  { key: 'shortlisted', label: 'Shortlisted', fill: '#3B82F6' },
  { key: 'accepted',    label: 'Accepted',    fill: '#16A34A' },
  { key: 'rejected',    label: 'Rejected',    fill: '#DC2626' },
  { key: 'withdrawn',   label: 'Withdrawn',   fill: '#EA580C' },
];

const getApplicationStatus = (app) => {
  if (app.interviewStep === 'withdrawn' || app.status === 'withdrawn') return 'withdrawn';
  if (app.interviewStep === 'rejected'  || app.status === 'rejected')  return 'rejected';
  if (app.status !== 'pending' && (app.interviewStep === 'shortlisted' || app.interviewStep === 'test')) return 'shortlisted';
  return app.status || 'pending';
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':     return 'bg-yellow-100 text-yellow-700';
    case 'shortlisted': return 'bg-blue-100 text-blue-700';
    case 'accepted':    return 'bg-green-100 text-green-700';
    case 'rejected':    return 'bg-red-100 text-red-700';
    case 'withdrawn':   return 'bg-orange-100 text-orange-700';
    default:            return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const STATUS_TABS = [
  { label: 'All',         value: 'all' },
  { label: 'Pending',     value: 'pending' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Accepted',    value: 'accepted' },
  { label: 'Rejected',    value: 'rejected' },
  { label: 'Withdrawn',   value: 'withdrawn' },
];

function Applications() {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [applications, setApplications]         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [searchTerm, setSearchTerm]             = useState('');
  const [statusFilter, setStatusFilter]         = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen]   = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCompanyApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      } else {
        setApplications([]);
        setError(response.message || 'Failed to load applications');
      }
    } catch (err) {
      setError(err.message || 'Failed to load applications. Please try again.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await api.request(`/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: { status: newStatus },
      });
      if (response.success) {
        setApplications(applications.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        setIsDetailsModalOpen(false);
        toast.success(`Application ${newStatus} successfully`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update application');
    }
  };

  // Chart data
  const statusCounts = useMemo(() => {
    const c = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    applications.forEach(app => {
      const s = getApplicationStatus(app);
      if (s in c) c[s]++;
    });
    return c;
  }, [applications]);

  const chartData = STATUS_META.map(({ key, label, fill }) => ({
    name: label, value: statusCounts[key], fill,
  })).filter(d => d.value > 0);

  // Filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'shortlisted')
      return app.status !== 'pending' && (app.interviewStep === 'shortlisted' || app.interviewStep === 'test');
    return (app.status === statusFilter);
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="applications" />
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

            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
              <p className="text-slate-500 text-xs mt-0.5">Review and manage job applicants</p>
            </div>

            {/* Chart */}
            {!loading && applications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-800">Application Breakdown</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{applications.length} total applications received</p>
                </div>
                <div className="p-4 flex flex-col sm:flex-row items-center gap-6">
                  <div style={{ width: 180, height: 160 }} className="shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                          {chartData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
                              <p className="font-semibold text-slate-700">{payload[0].name}</p>
                              <p style={{ color: payload[0].payload.fill }} className="font-bold">{payload[0].value}</p>
                            </div>
                          ) : null
                        } />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {STATUS_META.map(({ key, label, fill }) => {
                      const val = statusCounts[key];
                      const pct = applications.length ? Math.round((val / applications.length) * 100) : 0;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fill }} />
                          <span className="text-xs text-slate-600 font-medium w-24 truncate">{label}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: fill }} />
                          </div>
                          <span className="text-xs font-bold w-6 text-right" style={{ color: fill }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">Error loading applications</p>
                  <p className="text-red-700 text-xs mt-1">{error}</p>
                  <button onClick={fetchApplications} disabled={loading} className="mt-2 text-red-600 hover:text-red-800 text-xs font-semibold underline disabled:opacity-50">
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or job title..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors text-sm"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
              {/* Status tab chips */}
              <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                    {opt.value !== 'all' && statusCounts[opt.value] !== undefined && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        statusFilter === opt.value ? 'bg-white/20' : 'bg-slate-100'
                      }`}>
                        {statusCounts[opt.value] ?? 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-16 gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <p className="text-slate-500 text-sm">Loading applications...</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">S.N.</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">Applicant</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">Job Position</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">Applied Date</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">Status</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app, idx) => (
                          <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4 text-xs text-slate-400 font-medium">{idx + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                  <span className="text-slate-600 font-semibold text-xs">
                                    {app.userId?.fullname?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900 text-sm">{app.userId?.fullname || 'N/A'}</div>
                                  <div className="text-xs text-slate-500">{app.userId?.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">{app.jobId?.title || 'N/A'}</td>
                            <td className="px-5 py-4 text-sm text-slate-500">{formatDate(app.appliedDate)}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${getStatusStyles(getApplicationStatus(app))}`}>
                                {getApplicationStatus(app)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => { setSelectedApplication(app); setIsDetailsModalOpen(true); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs font-medium"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <BarChart2 size={24} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-slate-500 text-sm">
                              {applications.length === 0 ? 'No applications received yet.' : 'No applications match your filters.'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              {!loading && filteredApplications.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                  Showing {filteredApplications.length} of {applications.length} applications
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <ViewDetails
        application={selectedApplication}
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedApplication(null); }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

export default Applications;
