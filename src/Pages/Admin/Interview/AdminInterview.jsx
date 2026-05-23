import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, Loader2, Eye, CheckCircle, Trash2, ChevronRight, Briefcase, UserCheck, Calendar } from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';
import StepDropdown from '../../Company/Interview/Components/StepDropdown';
import StepPopup from '../../Company/Interview/Components/StepPopup';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'in progress':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-slate-100 text-slate-700';
    case 'skipped':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const getStepColor = (step) => {
  switch (step?.toLowerCase()) {
    case 'screening':
      return 'bg-blue-100 text-blue-700';
    case 'test':
      return 'bg-purple-100 text-purple-700';
    case 'interview':
      return 'bg-orange-100 text-orange-700';
    case 'offer':
      return 'bg-yellow-100 text-yellow-700';
    case 'hired':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getApplicationStatus = (app) => {
  // Prioritize explicit status field over interviewStep
  if (app.status === 'withdrawn') return 'withdrawn';
  if (app.status === 'rejected') return 'rejected';
  if (app.status === 'accepted') return 'accepted';
  if (app.status === 'pending') return 'pending';
  
  // If status is something else, use interviewStep
  return app.interviewStep || 'pending';
};

export default function AdminInterview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stepFilter, setStepFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [companies, setCompanies] = useState([]);
  
  // Bulk action states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch all candidates and companies
  useEffect(() => {
    fetchCandidates();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.getAllCompanies();
      if (response.success && response.data) {
        setCompanies(response.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all applications from the system
      const response = await api.request('/applications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.success && response.data) {
        // Show all applications regardless of status
        setCandidates(response.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpdate = (updatedCandidate) => {
    setCandidates(candidates.map(c =>
      c._id === updatedCandidate._id ? updatedCandidate : c
    ));
    setSelectedCandidate(null);
    setShowPopup(false);
  };

  // Toggle checkbox selection
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select/deselect all visible candidates
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c._id)));
    }
  };

  // Bulk reject with sequential calls
  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    
    if (!window.confirm(`Reject ${selectedIds.size} selected candidates? They will be notified.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const rejectionReason = prompt('Enter optional rejection feedback for applicants:', '');
      
      for (const id of selectedIds) {
        const candidate = candidates.find(c => c._id === id);
        if (candidate) {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          await api.updateInterviewStep(id, {
            interviewStep: 'rejected',
            interviewFeedback: rejectionReason || '',
          });
        }
      }

      await fetchCandidates();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} candidates rejected successfully`);
    } catch (error) {
      console.error('Error in bulk reject:', error);
      setError('Failed to reject some candidates: ' + error.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStep = stepFilter === 'all' || candidate.interviewStep === stepFilter;
    const matchesCompany = companyFilter === 'all' || candidate.jobId?.company === companyFilter;
    
    return matchesSearch && matchesStep && matchesCompany;
  });

  // Check for duplicates (same userId + jobId)
  const getDuplicateWarning = (candidate) => {
    const duplicateCount = candidates.filter(
      c => c.userId._id === candidate.userId._id && c.jobId._id === candidate.jobId._id
    ).length;
    return duplicateCount > 1 ? duplicateCount : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <DashboardHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          userRole="Admin"
          dashboardPath="/admin/dashboard"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Admin"
        dashboardPath="/admin/dashboard"
        profilePath="/admin/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="interviews" />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Interview Management</h1>
                <p className="text-slate-600 mt-1">Track and manage the hiring workflow for all candidates across all companies</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <StatCard 
                label="Total Candidates" 
                value={candidates.length.toString()} 
                icon={<Briefcase className="text-blue-600" />} 
              />
              <StatCard 
                label="Shortlisted" 
                value={candidates.filter(c => c.interviewStep === 'shortlisted').length.toString()} 
                icon={<UserCheck className="text-purple-600" />} 
              />
              <StatCard 
                label="Test Phase" 
                value={candidates.filter(c => c.interviewStep === 'test').length.toString()} 
                icon={<Briefcase className="text-orange-600" />} 
              />
              <StatCard 
                label="Interview Phase" 
                value={candidates.filter(c => c.interviewStep === 'interview').length.toString()} 
                icon={<Calendar className="text-indigo-600" />} 
              />
              <StatCard 
                label="Offer Sent" 
                value={candidates.filter(c => c.interviewStep === 'offer').length.toString()} 
                icon={<CheckCircle className="text-amber-600" />} 
              />
              <StatCard 
                label="Hired" 
                value={candidates.filter(c => c.interviewStep === 'hired').length.toString()} 
                icon={<CheckCircle className="text-green-600" />} 
              />
            </div>

            {/* Error alert */}
            {error && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidates, jobs, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Company filter */}
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:min-w-40"
                >
                  <option value="all">All Companies</option>
                  {companies.map(company => (
                    <option key={company._id} value={company.companyName}>{company.companyName}</option>
                  ))}
                </select>

                {/* Step filter */}
                <select
                  value={stepFilter}
                  onChange={(e) => setStepFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:min-w-40"
                >
                  <option value="all">All Steps</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="test">Test</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Candidate</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Position</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Company</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Applied Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Current Step</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Interview Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                          {candidates.length === 0 ? 'No applications yet' : 'No candidates match your filters'}
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => {
                        const duplicateCount = getDuplicateWarning(candidate);
                        return (
                          <tr key={candidate._id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${selectedIds.has(candidate._id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(candidate._id)}
                                onChange={() => toggleSelection(candidate._id)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-slate-900">{candidate.userId?.fullname}</div>
                                <div className="text-sm text-slate-600">{candidate.userId?.email}</div>
                                {duplicateCount > 1 && (
                                  <div className="mt-1">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                      Duplicate ({duplicateCount})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{candidate.jobId?.title}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{candidate.jobId?.company}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatDate(candidate.appliedDate)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStepColor(getApplicationStatus(candidate))}`}>
                                {getApplicationStatus(candidate)?.charAt(0).toUpperCase() + getApplicationStatus(candidate)?.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.interviewStatus)}`}>
                                {candidate.interviewStatus?.charAt(0).toUpperCase() + candidate.interviewStatus?.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setShowPopup(true);
                                }}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-slate-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">
                    {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="px-4 py-2 border border-slate-300 hover:border-slate-400 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkActionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {bulkActionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Reject Selected
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Step Popup Modal */}
      {showPopup && selectedCandidate && (
        <StepPopup
          candidate={selectedCandidate}
          onClose={() => {
            setShowPopup(false);
            setSelectedCandidate(null);
          }}
          onUpdate={handleStepUpdate}
        />
      )}
    </div>
  );
}

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-xs mb-1 truncate">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg ml-2 shrink-0">{icon}</div>
      </div>
    </div>
  );
}
