import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import ViewDetails from './ViewDetails';
import { api } from '../../../utils/api';

// Helper function to determine status badge colors
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'shortlisted':
      return 'bg-blue-100 text-blue-700';
    case 'accepted':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function Applications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        setError('User not authenticated. Please login again.');
        setApplications([]);
        setLoading(false);
        return;
      }

      let userData = {};
      try {
        userData = JSON.parse(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      const companyName = userData?.companyname || userData?.company || '';
      
      if (!companyName) {
        console.warn('Company name not found in user data. Attempting to fetch anyway...');
      }

      const response = await api.getCompanyApplications();
      
      if (response.success && response.data) {
        setApplications(response.data);
      } else if (response.data) {
        setApplications(Array.isArray(response.data) ? response.data : []);
      } else {
        setApplications([]);
        setError(response.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications. Please try again.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setError(null);
      const response = await api.request(`/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: { status: newStatus },
      });

      if (response.success) {
        // Update local state
        setApplications(applications.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        setIsDetailsModalOpen(false);
        alert(`Application ${newStatus} successfully`);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedApplication(null);
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userRole="Company"
        dashboardPath="/company/dashboard"
        profilePath="/company/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="applications" />

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Applications</h1>
              <p className="text-slate-500 text-sm lg:text-base">Review and manage job applicants <span className="font-semibold text-slate-700">({applications.length} total)</span></p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error Loading Applications</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={fetchApplications}
                      disabled={loading}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold underline disabled:opacity-50"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded mt-2">
                  <p><strong>Debug Info:</strong> Make sure you are logged in as a company user and have posted jobs.</p>
                </div>
              </div>
            )}
      
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or job title..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  title="Refresh applications"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-pointer hover:bg-slate-100"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-600 mr-2" size={32} />
                    <p className="text-slate-600">Loading applications...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Applicant</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Job Position</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Applied Date</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                  <span className="text-slate-600 font-semibold">
                                    {app.userId?.fullname?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{app.userId?.fullname || 'N/A'}</div>
                                  <div className="text-sm text-slate-500">{app.userId?.email || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">{app.jobId?.title || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatDate(app.appliedDate)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize ${getStatusStyles(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleViewDetails(app)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-colors text-xs font-medium"
                                >
                                  <Eye size={15} />
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            {applications.length === 0 ? 'No applications received yet.' : 'No applications match your filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* View Details Modal */}
      <ViewDetails 
        application={selectedApplication}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}