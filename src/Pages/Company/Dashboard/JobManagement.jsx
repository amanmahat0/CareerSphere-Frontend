import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, PauseCircle, 
  Briefcase, Users, FileText, Monitor,
  LayoutGrid, Building2, Calendar, Award, Bell, Settings, LogOut
} from 'lucide-react';
import PostJob from './PostJob';

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const jobs = [
    { id: 1, position: 'Frontend Developer Intern', company: 'Leapfrog Technology', type: 'Internship', location: 'Kathmandu', posted: '2025-10-15', deadline: '2025-11-15', applicants: 45, status: 'Active' },
    { id: 2, position: 'Mobile App Developer', company: 'F1Soft International', type: 'Job', location: 'Kathmandu', posted: '2025-10-18', deadline: '2025-11-20', applicants: 32, status: 'Active' },
    { id: 3, position: 'Data Analyst Intern', company: 'Verisk Nepal', type: 'Internship', location: 'Kathmandu', posted: '2025-10-05', deadline: '2025-11-10', applicants: 28, status: 'Active' },
    { id: 4, position: 'UI/UX Designer', company: 'Yomari', type: 'Job', location: 'Kathmandu', posted: '2025-10-20', deadline: '2025-11-25', applicants: 18, status: 'Active' },
  ];

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
      <PostJob isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MiniStat label="Total Postings" value="8" color="blue" />
        <MiniStat label="Active Jobs" value="4" color="indigo" />
        <MiniStat label="Active Internships" value="4" color="orange" />
        <MiniStat label="Total Applications" value="252" color="emerald" />
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search jobs by title or company..." 
            className="w-full bg-slate-100 border-transparent rounded-lg py-2.5 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex border-b border-slate-200 text-sm font-medium text-slate-500">
          {['All (8)', 'Jobs (4)', 'Internships (4)'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 -mb-px transition-colors ${
                activeTab === tab 
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
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-[11px] uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Position</th>
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Posted Date</th>
              <th className="px-6 py-4 font-semibold">Deadline</th>
              <th className="px-6 py-4 font-semibold">Applicants</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="text-sm hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{job.position}</td>
                <td className="px-6 py-4 text-slate-500">{job.company}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                    {job.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{job.location}</td>
                <td className="px-6 py-4 text-slate-400">{job.posted}</td>
                <td className="px-6 py-4 text-slate-400">{job.deadline}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1.5 text-slate-500">
                      <Users size={14} className="text-slate-400" /> {job.applicants}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <button className="hover:text-slate-600 transition-colors" title="Pause"><PauseCircle size={18}/></button>
                    <button className="hover:text-blue-600 transition-colors" title="Edit"><Edit size={18}/></button>
                    <button className="hover:text-red-600 transition-colors" title="Delete"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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