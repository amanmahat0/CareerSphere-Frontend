import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, X, Loader2, Eye, ArrowUpDown,
  CheckCircle, FileText, Mail, User
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

const Applications = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, company, status
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  // Fetch applications and companies from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsResponse, companiesResponse] = await Promise.all([
        api.getAdminApplications(),
        api.getAllCompanies()
      ]);
      
      setApplications(appsResponse.data || []);
      setCompanies(companiesResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search applications
  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const companyName = app.jobId?.company || 'N/A';
    const applicantName = app.userId?.fullname || app.userId?.name || app.applicantName || '';
    const applicantEmail = app.userId?.email || app.email || '';
    const jobTitle = app.jobId?.title || '';
    
    // Search filter
    const matchesSearch = 
      companyName.toLowerCase().includes(term) ||
      applicantName.toLowerCase().includes(term) ||
      applicantEmail.toLowerCase().includes(term) ||
      jobTitle.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Company filter
    if (selectedCompany && companyName !== selectedCompany) return false;

    // Status filter
    if (selectedStatus && getDisplayStatus(app) !== selectedStatus) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt);
    } else if (sortBy === 'company') {
      return (a.jobId?.company || '').localeCompare(b.jobId?.company || '');
    } else if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });


  const getDisplayStatus = (app) => {
    if (app.status === 'pending')   return 'pending';
    if (app.status === 'withdrawn') return 'withdrawn';
    if (app.status === 'rejected')  return 'rejected';
    return app.interviewStep || app.status || 'pending';
  };

  const getStatusBadge = (key) => {
    const statusMap = {
      'pending':     { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Applied' },
      'shortlisted': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shortlisted' },
      'test':        { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Test' },
      'interview':   { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Interview' },
      'offer':       { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Offer' },
      'hired':       { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Hired' },
      'rejected':    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected' },
      'withdrawn':   { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Withdrawn' },
    };
    return statusMap[key] || { bg: 'bg-gray-100', text: 'text-gray-700', label: key };
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    companies: [...new Set(applications.map(a => a.jobId?.company))].length
  };

  const statusOptions = ['pending', 'shortlisted', 'test', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar isOpen={false} onClose={() => {}} activePage="applications" />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onMenuClick={() => {}} userRole="Admin" dashboardPath="/admin/dashboard" />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="applications" />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Admin"
          dashboardPath="/admin/dashboard"
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Applications Management</h1>
              <p className="text-slate-500 text-xs mt-0.5">View and manage all applications from applicants</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Applications</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <FileText size={28} className="text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Applied</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.applied}</p>
                  </div>
                </div>
              </div>
              <div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Company, applicant name, email, job..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter by Company */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    {[...new Set(applications.map(a => a.jobId?.company))].map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'date'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sort by Date
                </button>
                <button
                  onClick={() => setSortBy('company')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'company'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sort by Company
                </button>
                <button
                  onClick={() => setSortBy('status')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'status'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sort by Status
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {filteredApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">No applications found</p>
                  <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Company</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Applicant</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Email</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Job Position</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Applied Date</th>
                        <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-slate-400" />
                              <span className="font-medium text-slate-900">{app.jobId?.company || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-slate-400" />
                              <span className="text-slate-900">{app.userId?.fullname || app.userId?.name || app.applicantName || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-slate-400" />
                              <span className="text-slate-600 text-sm">{app.userId?.email || app.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-slate-900">{app.jobId?.title || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(getDisplayStatus(app)).bg} ${getStatusBadge(getDisplayStatus(app)).text}`}>
                              {getStatusBadge(getDisplayStatus(app)).label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-slate-600 text-sm">
                              {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => navigate(`/admin/dashboard/application/${app.id}`)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Result count */}
            <div className="mt-4 text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredApplications.length}</span> of <span className="font-semibold text-slate-900">{applications.length}</span> applications
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Applications;
