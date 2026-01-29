import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Calendar, 
  Settings, Bell, Search, GraduationCap, BarChart3, 
  ShieldCheck, CheckSquare, Megaphone, FileCheck, LogOut, Menu, X,
  Download, Plus, Edit2, Trash2
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', college: '', phone: '' });
  const [applicants, setApplicants] = useState([
    { id: 1, name: 'Suman Sharma', email: 'suman.sharma@example.com', college: 'Pulchowk Engineering Campus', phone: '9841234567', resume: true },
    { id: 2, name: 'Priya Shrestha', email: 'priya.shrestha@example.com', college: 'Kathmandu University', phone: '9842234567', resume: true },
    { id: 3, name: 'Rajesh Gautam', email: 'rajesh.gautam@example.com', college: 'Tribhuvan University', phone: '9843234567', resume: true },
    { id: 4, name: 'Anita Karki', email: 'anita.karki@example.com', college: 'Pulchowk Engineering Campus', phone: '9844234567', resume: false },
    { id: 5, name: 'Bibek Thapa', email: 'bibek.thapa@example.com', college: 'Kathmandu University', phone: '9845234567', resume: true },
    { id: 6, name: 'Sunita Rai', email: 'sunita.rai@example.com', college: 'Tribhuvan University', phone: '9846234567', resume: true },
  ]);

  const handleAddApplicant = () => {
    if (!formData.name || !formData.email || !formData.college || !formData.phone) return;
    const newApplicant = {
      id: applicants.length + 1,
      ...formData,
      resume: false,
    };
    setApplicants((prev) => [...prev, newApplicant]);
    setFormData({ name: '', email: '', college: '', phone: '' });
    setShowAddModal(false);
  };

  const handleDeleteApplicant = (id) => {
    setApplicants((prev) => prev.filter((app) => app.id !== id));
  };

  const handleEditApplicant = (id) => {
    const applicant = applicants.find((app) => app.id === id);
    if (!applicant) return;
    setFormData({
      name: applicant.name,
      email: applicant.email,
      college: applicant.college,
      phone: applicant.phone,
    });
    setShowAddModal(true);
  };

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

  // Filter applicants based on search
  const filteredApplicants = applicants.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.name.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.college.toLowerCase().includes(term) ||
      app.phone.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: applicants.length,
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
              placeholder="Search applicants by name, email, college, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-shadow shadow-md">
                  <Plus size={16} /> Add Applicant
                </button>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
              <MetricCard label="Total Applicants" value={stats.total} />
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
                    placeholder="Search by name, email, college, or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Actual Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-4 lg:px-6 py-4">Name</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4 hidden md:table-cell">College</th>
                      <th className="px-4 py-4 hidden lg:table-cell">Phone</th>
                      <th className="px-4 py-4 text-center">Resume</th>
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
                              <p className="font-semibold text-slate-700">{app.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 text-xs">{app.email}</td>
                          <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-xs">{app.college}</td>
                          <td className="px-4 py-4 text-slate-600 hidden lg:table-cell text-xs">{app.phone}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              {app.resume ? (
                                <span className="px-2 lg:px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase">Yes</span>
                              ) : (
                                <span className="px-2 lg:px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded border border-orange-100 uppercase">No</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleEditApplicant(app.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200">
                                <Edit2 size={12} /> Edit User
                              </button>
                              <button onClick={() => handleDeleteApplicant(app.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200">
                                <Trash2 size={12} /> Delete User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add Applicant</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="College"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleAddApplicant} className="px-4 py-2 text-sm font-medium bg-[#1e3a8a] text-white rounded hover:bg-blue-900">
                Save Applicant
              </button>
            </div>
          </div>
        </div>
      )}

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

export default UserManagement;