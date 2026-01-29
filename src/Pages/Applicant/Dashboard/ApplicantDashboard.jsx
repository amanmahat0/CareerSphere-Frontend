import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ClipboardList, 
  Calendar, User, Bell, Menu, X, LogOut, Clock, CheckCircle2
} from 'lucide-react';
import Header from '../../../Components/Header';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual auth check
    setUser({
      name: 'Rajesh Kumar Sharma',
      role: 'Applicant',
      avatar: 'R',
      resumeComplete: false,
      notificationCount: 2
    });
  }, []);

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'My Applications', id: 'applications' },
    { icon: ClipboardList, label: 'Resume Builder', id: 'resume' },
    { icon: Calendar, label: 'Interview Schedule', id: 'interviews' },
    { icon: User, label: 'My Profile', id: 'profile' },
  ];

  const handleNavigation = (path) => {
    navigate(`/applicant/${path}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  // Mock Data
  const stats = [
    { label: "Total Applications", value: "8", icon: <FileText className="text-blue-600" />, color: "border-blue-600" },
    { label: "Upcoming Interviews", value: "3", icon: <Calendar className="text-blue-600" />, color: "border-blue-600" },
    { label: "Resume Status", value: user.resumeComplete ? "Complete" : "Incomplete", icon: <CheckCircle2 className={user.resumeComplete ? "text-green-600" : "text-slate-300"} />, color: "border-slate-300" },
  ];

  const applications = [
    { id: 1, title: 'Frontend Developer Intern', company: 'Leapfrog Technology', type: 'Internship', status: 'Shortlisted', date: '2025-10-15', statusColor: 'bg-blue-100 text-blue-600' },
    { id: 2, title: 'Data Analyst Intern', company: 'Verisk Nepal', type: 'Internship', status: 'Pending', date: '2025-10-10', statusColor: 'bg-slate-100 text-slate-600' },
    { id: 3, title: 'Mobile App Developer', company: 'F1Soft International', type: 'Job', status: 'Rejected', date: '2025-09-28', statusColor: 'bg-red-100 text-red-600' },
  ];

  const interviews = [
    { id: 1, role: "UI/UX Designer", company: "Yomari", date: "2025-11-25", time: "10:00 AM", type: "Virtual" },
    { id: 2, role: "Data Analyst Intern", company: "Verisk Nepal", date: "2025-11-28", time: "2:00 PM", type: "In-Person" },
    { id: 3, role: "UI/UX Designer", company: "Yomari", date: "2025-11-26", time: "3:00 PM", type: "Virtual" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed lg:static w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
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
              onClick={() => handleNavigation(item.id)}
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

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component - Public Navigation */}
        <Header isDashboard={true} user={user} onLogout={handleLogout} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
          {/* Hero Banner */}
          <section className="bg-blue-600 rounded-2xl p-10 text-white relative overflow-hidden shadow-lg shadow-blue-200">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
              <p className="mt-2 text-blue-100 max-w-md">Track your applications, prepare for interviews, and land your dream job.</p>
            </div>
            <div className="absolute -right-5 -top-5 opacity-10">
              <ClipboardList size={240} />
            </div>
          </section>

          {/* Warning Alert - Only show if resume incomplete */}
          {!user.resumeComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 mt-0.5">
                <ClipboardList size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900 text-sm">Action Required: Complete Your Resume!</p>
                <p className="text-amber-700 text-sm mt-0.5">You need to complete your resume before you can apply for opportunities.</p>
                <button onClick={() => handleNavigation('resume')} className="text-sm font-bold text-amber-900 underline mt-2 hover:text-amber-950 transition-colors">Build your resume now →</button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white p-6 rounded-xl border-l-4 ${stat.color} shadow-sm flex justify-between items-center`}>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">{stat.icon}</div>
              </div>
            ))}
          </section>

          {/* Recent Applications Table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">Recent Applications</h2>
              <button onClick={() => handleNavigation('applications')} className="text-xs font-bold text-blue-600 px-4 py-1.5 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-slate-400 text-[11px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-semibold">Job Title</th>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="text-sm hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{app.title}</td>
                        <td className="px-6 py-4 text-slate-500">{app.company}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">{app.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${app.statusColor}`}>{app.status}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{app.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No applications yet. Start applying for opportunities!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Upcoming Interviews Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Upcoming Interviews</h2>
              <button onClick={() => handleNavigation('interviews')} className="text-sm font-semibold text-slate-500 px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">View Schedule</button>
            </div>
            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((item) => (
                  <div key={item.id} className="relative flex items-center justify-between p-5 border border-slate-100 rounded-xl group hover:border-blue-200 transition-all shadow-sm">
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-600 rounded-r-full" />
                    <div className="flex items-center gap-5 ml-2">
                      <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                        {item.role.includes('UI') ? '🎨' : '📊'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{item.role}</h3>
                        <p className="text-sm text-slate-400 mb-2">{item.company}</p>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-300"/> {item.date}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-300"/> {item.time}</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500 tracking-normal">{item.type}</span>
                        </div>
                      </div>
                    </div>
                    {item.type === 'Virtual' && (
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                        Join Meeting
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No upcoming interviews scheduled.</div>
            )}
          </section>

          </div>
        </main>
      </div>
    </div>
  );
};

// Reusable Nav Component
const NavItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}>
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </div>
);

export default ApplicantDashboard;