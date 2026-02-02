import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Building2, Briefcase, Users, Calendar, 
  Award, Bell, Settings, LogOut, Search, MessageCircle, 
  PlusCircle, CalendarPlus, Upload, HelpCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Mock data for the chart
const chartData = [
  { name: 'Computer Eng.', shortlisted: 8, total: 15 },
  { name: 'Electronics Eng.', shortlisted: 4, total: 8 },
  { name: 'Software Eng.', shortlisted: 6, total: 12 },
  { name: 'IT', shortlisted: 5, total: 10 },
];

const Dashboard = () => {
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search applications, applicants..." 
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

        <div className="p-8 space-y-8">
          {/* Dashboard Header */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Leapfrog Technology Dashboard 🚀</h1>
            <p className="text-slate-500 text-sm lg:text-base">Manage your recruitment and placement activities</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard title="Active Job Postings" value="2" trend="Currently open" icon={<Briefcase className="text-blue-600"/>} color="blue" />
            <StatCard title="Total Applications" value="1" trend="+12 this week" icon={<Users className="text-blue-500"/>} color="indigo" />
            <StatCard title="Scheduled Interviews" value="0" trend="Upcoming" icon={<Calendar className="text-orange-500"/>} color="orange" />
            <StatCard title="Selected Candidates" value="0" trend="This season" icon={<Award className="text-emerald-500"/>} color="emerald" />
          </div>

          {/* Chart Section */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Department-wise Applications</h3>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}}/>
                  <Bar dataKey="shortlisted" fill="#10b981" radius={[4, 4, 0, 0]} name="Shortlisted" />
                  <Bar dataKey="total" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Total Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Upcoming Interviews Section */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-800">Upcoming Interviews</h3>
              <button className="text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">View Schedule</button>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 italic">
              No upcoming interviews
            </div>
          </section>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard 
              title="Post New Job" 
              description="Create a new job or internship posting" 
              icon={<Briefcase className="text-blue-900" size={20}/>} 
              color="blue"
            />
            <ActionCard 
              title="Schedule Interview" 
              description="Set up interview rounds for candidates" 
              icon={<CalendarPlus className="text-blue-600" size={20}/>} 
              color="indigo"
            />
            <ActionCard 
              title="Upload Offers" 
              description="Upload offer letters and certificates" 
              icon={<Upload className="text-emerald-600" size={20}/>} 
              color="emerald"
            />
          </div>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MessageCircle size={24} />
        </button>
        <button className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

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

const ActionCard = ({ title, description, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    orange: 'bg-orange-50',
    emerald: 'bg-emerald-50',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
      <div className={`${colorMap[color]} w-10 h-10 rounded-lg flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
};

export default Dashboard;