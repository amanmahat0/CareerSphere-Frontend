import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, 
  Briefcase, Loader2
} from 'lucide-react';
import PostJob from './PostJob';
import { api } from '../../../utils/api';
import CompanySidebar from '../Components/CompanySidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch jobs from backend
  const fetchJobs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getAllJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle job deletion
  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.deleteJob(id);
      setJobs(jobs.filter(job => job._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  // Handle successful job post
  const handleJobPostSuccess = (newJob) => {
    setEditingJob(null);
    fetchJobs(); // Refresh the list
  };

  // Handle edit job
  const handleEditJob = (job) => {
    console.log('Editing job:', job);
    setEditingJob(job);
    setTimeout(() => {
      setIsPostJobOpen(true);
    }, 0);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsPostJobOpen(false);
    setEditingJob(null);
  };

  // Filter jobs based on active tab and search
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'All' || 
      (activeTab.includes('Jobs') && job.type === 'Job') ||
      (activeTab.includes('Internships') && job.type === 'Internship') ||
      (activeTab.includes('Traineeships') && job.type === 'Traineeship');
    
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Calculate stats
  const totalJobs = jobs.filter(j => j.type === 'Job').length;
  const totalInternships = jobs.filter(j => j.type === 'Internship').length;
  const totalTraineeships = jobs.filter(j => j.type === 'Traineeship').length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userRole="Company"
        dashboardPath="/company/dashboard"
        profilePath="/company/profile"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="jobs" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Job & Internship Management</h1>
                <p className="text-slate-500 text-sm lg:text-base">Post and manage job opportunities</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  setIsPostJobOpen(true);
                }}
                className="bg-blue-900 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-950 transition-colors text-sm font-semibold shadow-md"
              >
                <Plus size={18} /> Post New Opportunity
              </button>
            </div>

            {/* PostJob Modal */}
            <PostJob 
              isOpen={isPostJobOpen} 
              onClose={handleModalClose} 
              onSuccess={handleJobPostSuccess}
              editJob={editingJob}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <MiniStat label="Total Postings" value={jobs.length.toString()} color="blue" />
              <MiniStat label="Active Jobs" value={totalJobs.toString()} color="indigo" />
              <MiniStat label="Active Internships" value={totalInternships.toString()} color="orange" />
              <MiniStat label="Traineeships" value={totalTraineeships.toString()} color="emerald" />
            </div>

            {/* Search and Tabs */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search jobs by title or company..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-transparent rounded-lg py-2.5 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex border-b border-slate-200 text-sm font-medium text-slate-500 overflow-x-auto">
                {[`All (${jobs.length})`, `Jobs (${totalJobs})`, `Internships (${totalInternships})`, `Traineeships (${totalTraineeships})`].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.split(' ')[0])}
                    className={`px-6 py-3 -mb-px transition-colors whitespace-nowrap ${
                      activeTab === tab.split(' ')[0]
                      ? 'text-blue-900 border-b-2 border-blue-900' 
                      : 'hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-500">Loading jobs...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                  <button 
                    onClick={fetchJobs}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No jobs found</p>
                  <p className="text-sm">Post your first job opportunity to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr className="text-slate-400 text-[11px] uppercase tracking-widest">
                        <th className="px-6 py-4 font-semibold">Position</th>
                        <th className="px-6 py-4 font-semibold">Company</th>
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold">Location</th>
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold">Deadline</th>
                        <th className="px-6 py-4 font-semibold">Salary</th>
                        <th className="px-6 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJobs.map((job) => (
                        <tr key={job._id} className="text-sm hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800">{job.title}</td>
                          <td className="px-6 py-4 text-slate-500">{job.company}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              job.type === 'Job' ? 'bg-blue-100 text-blue-600' :
                              job.type === 'Internship' ? 'bg-orange-100 text-orange-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                              {job.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{job.location}</td>
                          <td className="px-6 py-4 text-slate-500">{job.duration}</td>
                          <td className="px-6 py-4 text-slate-400">{job.deadline ? formatDate(job.deadline) : '-'}</td>
                          <td className="px-6 py-4 text-slate-500">{job.salary}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditJob(job);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5" 
                                title="Edit"
                              >
                                <Edit size={14}/> Edit
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteJob(job._id);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5" 
                                title="Delete"
                              >
                                <Trash2 size={14}/> Delete
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
        </main>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color = "blue" }) => {
  const colorMap = {
    blue: 'border-l-blue-500 bg-blue-50/30',
    indigo: 'border-l-indigo-500 bg-indigo-50/30',
    orange: 'border-l-orange-500 bg-orange-50/30',
    emerald: 'border-l-emerald-500 bg-emerald-50/30',
  };

  return (
    <div className={`bg-white p-5 lg:p-6 rounded-xl border border-slate-200 border-l-4 ${colorMap[color]} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <p className="text-slate-500 text-xs lg:text-sm mb-1 uppercase tracking-wider">{label}</p>
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</h2>
    </div>
  );
};

export default JobManagement;