import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, PauseCircle, 
  Briefcase, Users, FileText, Monitor,
  LayoutGrid, Building2, Calendar, Award, Bell, Settings, LogOut, Loader2
} from 'lucide-react';
import PostJob from './PostJob';
import { api } from '../../../utils/api';

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/company/dashboard' },
    { icon: Building2, label: 'Institution Profile', path: '/company/profile' },
    { icon: Briefcase, label: 'Job Management', path: '/company/jobs' },
    { icon: Users, label: 'Applicant Management', path: '/company/applicants' },
    { icon: Calendar, label: 'Interview Management', path: '/company/interviews' },
    { icon: Award, label: 'Offers & Certificates', path: '/company/offers' },
    { icon: Bell, label: 'Notifications', path: '/company/notifications' },
    { icon: Settings, label: 'Settings', path: '/company/settings' },
  ];

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
    fetchJobs(); // Refresh the list
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-blue-900 p-1.5 rounded-lg text-white">
            <Briefcase size={20} />
          </div>
          <span className="text-xl font-bold text-blue-900">CareerSphere</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.path}
              icon={<item.icon size={18}/>} 
              label={item.label}
              onClick={() => handleNavigation(item.path)}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} className="text-red-600" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search jobs, applicants..." 
              className="w-full bg-slate-100 border-transparent rounded-lg py-2 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3 lg:gap-4 ml-auto">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold">3</span>
            </button>
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-semibold">Leapfrog Technology</p>
                <p className="text-xs text-slate-500">Recruiter</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                L
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Job & Internship Management</h1>
              <p className="text-slate-500 text-sm lg:text-base">Post and manage job opportunities</p>
            </div>
            <button 
              onClick={() => setIsPostJobOpen(true)}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-950 transition-colors text-sm font-semibold shadow-md"
            >
              <Plus size={18} /> Post New Opportunity
            </button>
          </div>

      {/* PostJob Modal */}
      <PostJob 
        isOpen={isPostJobOpen} 
        onClose={() => setIsPostJobOpen(false)} 
        onSuccess={handleJobPostSuccess}
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

        <div className="flex border-b border-slate-200 text-sm font-medium text-slate-500">
          {[`All (${jobs.length})`, `Jobs (${totalJobs})`, `Internships (${totalInternships})`, `Traineeships (${totalTraineeships})`].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.split(' ')[0])}
              className={`px-6 py-3 -mb-px transition-colors ${
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
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-[11px] uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Position</th>
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Duration</th>
              <th className="px-6 py-4 font-semibold">Posted Date</th>
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
                <td className="px-6 py-4 text-slate-400">{formatDate(job.postDate)}</td>
                <td className="px-6 py-4 text-slate-500">{job.salary}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <button className="hover:text-blue-600 transition-colors" title="Edit"><Edit size={18}/></button>
                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      className="hover:text-red-600 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
      active 
        ? 'bg-blue-900 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

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