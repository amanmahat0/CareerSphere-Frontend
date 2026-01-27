import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Calendar, 
  Settings, Bell, Search, GraduationCap, BarChart3, 
  ShieldCheck, CheckSquare, Megaphone, FileCheck, LogOut, Menu, X,
  Download, Plus, Eye, Edit2, Trash2, ChevronDown, Filter
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock Data from your screenshot
  const applicants = [
    { id: 1, name: 'Suman Sharma', email: 'suman.sharma@example.com', roll: '075BCE001', dept: 'Computer Engineering', year: '4th Year', cgpa: '3.65', status: 'Placed', resume: true },
    { id: 2, name: 'Priya Shrestha', email: 'priya.shrestha@example.com', roll: '075BCE045', dept: 'Computer Science', year: '3rd Year', cgpa: '3.82', status: 'Active', resume: true },
    { id: 3, name: 'Rajesh Gautam', email: 'rajesh.gautam@example.com', roll: '074BCE089', dept: 'Software Engineering', year: '4th Year', cgpa: '3.45', status: 'Active', resume: true },
    { id: 4, name: 'Anita Karki', email: 'anita.karki@example.com', roll: '075BCE112', dept: 'Electronics Engineering', year: '3rd Year', cgpa: '3.71', status: 'Active', resume: false },
    { id: 5, name: 'Bibek Thapa', email: 'bibek.thapa@example.com', roll: '073BCE156', dept: 'Computer Engineering', year: '4th Year', cgpa: '3.58', status: 'Placed', resume: true },
    { id: 6, name: 'Sunita Rai', email: 'sunita.rai@example.com', roll: '075BCE203', dept: 'Information Technology', year: '2nd Year', cgpa: '3.92', status: 'Active', resume: true },
  ];

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', id: 'dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users', id: 'users' },
    { icon: Briefcase, label: 'Institution Management', path: '/admin/institutions', id: 'institutions' },
    { icon: FileText, label: 'Applications', path: '/admin/applications', id: 'applications' },
    { icon: Calendar, label: 'Interviews', path: '/admin/interviews', id: 'interviews' },
    { icon: FileCheck, label: 'Resumes & Certificates', path: '/admin/documents', id: 'documents' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications', id: 'notifications' },
    { icon: Users, label: 'User Directory', path: '/admin/directory', id: 'directory' },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports', id: 'reports' },
    { icon: ShieldCheck, label: 'Institution Verification', path: '/admin/verification', id: 'verification' },
    { icon: CheckSquare, label: 'Job Post Approval', path: '/admin/approvals', id: 'approvals' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements', id: 'announcements' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings', id: 'settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Filter applicants based on search and filters
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.roll.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || app.dept === filterDept;
    const matchesYear = filterYear === 'all' || app.year === filterYear;
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  });

  const stats = {
    total: applicants.length,
    active: applicants.filter(a => a.status === 'Active').length,
    placed: applicants.filter(a => a.status === 'Placed').length,
    resumed: applicants.filter(a => a.resume).length,
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside className={`fixed lg:static w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#1e3a8a] p-1.5 rounded-lg text-white">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-bold text-[#1e3a8a] tracking-tight">CareerSphere</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</div>
        
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => (
            <SideItem 
              key={item.id}
              icon={<item.icon size={18}/>} 
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 gap-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search applicants, jobs, companies..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-5 ml-auto">
            <div className="relative cursor-pointer">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-3 lg:pl-5">
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-[11px] text-slate-500 font-medium">Placement Officer</p>
              </div>
              <div className="w-9 h-9 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">AU</div>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between lg:items-start mb-6 gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">User Management</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage applicant profiles and placement status</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Download size={16} /> Export Data
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-shadow shadow-md">
                  <Plus size={16} /> Add User
                </button>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <MetricCard label="Total Users" value={stats.total} />
              <MetricCard label="Active Users" value={stats.active} />
              <MetricCard label="Placed Users" value={stats.placed} color="text-emerald-600" />
              <MetricCard label="Resume Uploaded" value={stats.resumed} />
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Table Filters */}
              <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="relative flex-1 w-full lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search by name, roll number, or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                  <FilterDropdown 
                    label="Department" 
                    value={filterDept}
                    onChange={setFilterDept}
                    options={['all', 'Computer Engineering', 'Computer Science', 'Software Engineering', 'Electronics Engineering', 'Information Technology']}
                  />
                  <FilterDropdown 
                    label="Year" 
                    value={filterYear}
                    onChange={setFilterYear}
                    options={['all', '1st Year', '2nd Year', '3rd Year', '4th Year']}
                  />
                  <FilterDropdown 
                    label="Status" 
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={['all', 'Active', 'Placed', 'Inactive']}
                  />
                </div>
              </div>

              {/* Actual Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-4 lg:px-6 py-4">Applicant</th>
                      <th className="px-4 py-4 hidden sm:table-cell">Roll No</th>
                      <th className="px-4 py-4 hidden md:table-cell">Department</th>
                      <th className="px-4 py-4 hidden lg:table-cell">Year</th>
                      <th className="px-4 py-4 hidden lg:table-cell">CGPA</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-4 py-4 text-center hidden sm:table-cell">Resume</th>
                      <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.length > 0 ? (
                      filteredApplicants.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <Users size={16} className="text-slate-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700">{app.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium truncate">{app.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 font-mono text-xs hidden sm:table-cell">{app.roll}</td>
                          <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-xs">{app.dept}</td>
                          <td className="px-4 py-4 text-slate-600 hidden lg:table-cell text-xs">{app.year}</td>
                          <td className="px-4 py-4 font-semibold text-slate-700 hidden lg:table-cell">{app.cgpa}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <StatusBadge status={app.status} />
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <div className="flex justify-center">
                              {app.resume ? (
                                <button className="flex items-center gap-1.5 px-2 lg:px-3 py-1 bg-[#1e3a8a] text-white text-[10px] font-bold rounded hover:bg-blue-900 uppercase transition-colors">
                                  <FileText size={10} /> Yes
                                </button>
                              ) : (
                                <span className="px-2 lg:px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded border border-orange-100 uppercase">No</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <ActionBtn icon={<Eye size={14} />} color="text-slate-400 hover:text-blue-600" title="View" />
                              <ActionBtn icon={<Edit2 size={14} />} color="text-slate-400 hover:text-emerald-600" title="Edit" />
                              <ActionBtn icon={<Trash2 size={14} />} color="text-slate-400 hover:text-red-500" title="Delete" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                          <p className="font-medium">No users found matching your filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fab for help */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#1e3a8a] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50" title="Help">
        <Megaphone size={20} />
      </button>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SideItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-lg transition-all text-sm font-medium ${
      active ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    {label}
  </button>
);

const MetricCard = ({ label, value, color = "text-slate-800" }) => (
  <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 lg:mb-4">{label}</p>
    <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const FilterDropdown = ({ label, value, onChange, options }) => (
  <div className="relative">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-[11px] lg:text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:border-blue-400 cursor-pointer appearance-none pr-8"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt === 'all' ? `All ${label}s` : opt}
        </option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

const StatusBadge = ({ status }) => {
  const isPlaced = status === 'Placed';
  return (
    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide inline-block ${
      isPlaced 
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
        : 'bg-white text-slate-600 border-slate-200'
    }`}>
      {status}
    </span>
  );
};

const ActionBtn = ({ icon, color, title }) => (
  <button 
    className={`p-1.5 rounded transition-colors ${color} hover:bg-slate-100`}
    title={title}
  >
    {icon}
  </button>
);

export default UserManagement;