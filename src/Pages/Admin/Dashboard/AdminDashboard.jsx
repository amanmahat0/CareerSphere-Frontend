import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Calendar, 
  Settings, Bell, Search, GraduationCap, BarChart3, Menu, X, LogOut,
  FileCheck, ShieldCheck, CheckSquare, Megaphone
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// Mock Data for Charts
const barData = [
  { name: 'Computer Eng.', placed: 85, total: 120 },
  { name: 'Electronics Eng.', placed: 62, total: 95 },
  { name: 'Civil Eng.', placed: 48, total: 112 },
  { name: 'Mechanical Eng.', placed: 55, total: 105 },
  { name: 'Architecture', placed: 38, total: 60 },
  { name: 'Industrial Eng.', placed: 28, total: 45 },
];

const pieData = [
  { name: 'Jobs', value: 48, color: '#3B82F6' },
  { name: 'Internships', value: 37, color: '#1E3A8A' },
  { name: 'Traineeships', value: 15, color: '#10B981' },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
    // Clear auth token and redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed lg:static w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900 p-1.5 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold text-blue-900">CareerSphere</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.id}
              icon={<item.icon size={20}/>} 
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
            <LogOut size={20} className="text-red-600" />
            <span>Logout</span>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search applicants, jobs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-4 ml-auto">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold">3</span>
            </button>
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-slate-500">Placement Officer</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard 📊</h1>
              <p className="text-slate-500 text-sm lg:text-base">Placement & Internship Management Overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <StatCard 
                title="Total Jobs Posted" 
                value="156" 
                trend="+12% this month" 
                icon={<Briefcase className="text-blue-600"/>} 
                color="blue" 
              />
              <StatCard 
                title="Applicants Registered" 
                value="2,847" 
                trend="+8% this month" 
                icon={<Users className="text-blue-500"/>} 
                color="indigo" 
              />
              <StatCard 
                title="Internships Ongoing" 
                value="43" 
                trend="Active programs" 
                icon={<Calendar className="text-orange-500"/>} 
                color="orange" 
              />
              <StatCard 
                title="Placed Applicants" 
                value="284" 
                trend="+15% this year" 
                icon={<Users className="text-emerald-500"/>} 
                color="emerald" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Department-wise Placements</h3>
                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}
                      />
                      <Bar dataKey="placed" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Application Distribution</h3>
                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                      <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, onClick, active = false }) => (
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

const StatCard = ({ title, value, trend, icon, color }) => {
  const colorMap = {
    blue: 'border-l-blue-500 bg-blue-50/30',
    indigo: 'border-l-indigo-500 bg-indigo-50/30',
    orange: 'border-l-orange-500 bg-orange-50/30',
    emerald: 'border-l-emerald-500 bg-emerald-50/30',
  };

  return (
    <div className={`bg-white p-5 lg:p-6 rounded-xl border border-slate-200 border-l-4 ${colorMap[color]} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-xs lg:text-sm mb-1 truncate">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg ml-2 flex-shrink-0">{icon}</div>
      </div>
      <p className="text-xs font-medium text-emerald-600 whitespace-nowrap">{trend}</p>
    </div>
  );
};

export default Dashboard;