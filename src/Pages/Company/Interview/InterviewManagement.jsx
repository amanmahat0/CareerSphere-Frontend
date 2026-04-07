import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, Loader2, Eye, CheckCircle } from 'lucide-react';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';
import StepDropdown from './Components/StepDropdown';
import StepPopup from './Components/StepPopup';

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

export default function InterviewManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stepFilter, setStepFilter] = useState('all');
  
  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCompanyApplications();
      if (response.success && response.data) {
        // Filter for shortlisted applications
        const shortlisted = response.data.filter(app => app.status === 'shortlisted');
        setCandidates(shortlisted);
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

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStep = stepFilter === 'all' || candidate.interviewStep === stepFilter;
    
    return matchesSearch && matchesStep;
  });

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userRole="Company" />
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
        userRole="Company"
        dashboardPath="/company/dashboard"
        profilePath="/company/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="interviews" />

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
                <p className="text-slate-600 mt-1">Track and manage your hiring workflow for shortlisted candidates</p>
              </div>
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
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Candidate</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Position</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Applied Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Current Step</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Interview Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          {candidates.length === 0 ? 'No shortlisted candidates yet' : 'No candidates match your filters'}
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <tr key={candidate._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{candidate.userId?.fullname}</div>
                            <div className="text-sm text-slate-600">{candidate.userId?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{candidate.jobId?.title}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatDate(candidate.appliedDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStepColor(candidate.interviewStep)}`}>
                              {candidate.interviewStep === 'shortlisted' ? '✓ Shortlisted' : candidate.interviewStep?.charAt(0).toUpperCase() + candidate.interviewStep?.slice(1)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-slate-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>
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
