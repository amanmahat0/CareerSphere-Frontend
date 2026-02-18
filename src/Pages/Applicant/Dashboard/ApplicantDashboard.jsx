import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, Clock
} from 'lucide-react';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || parsedUser.fullname || 'User',
          resumeComplete: false,
        });
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

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
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        userRole="Applicant"
        dashboardPath="/applicant/dashboard"
        profilePath="/applicant/profile"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="dashboard" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
          {/* Hero Banner */}
          <section className="bg-blue-900 rounded-xl p-8 text-white shadow-md">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-blue-100">Track your applications, prepare for interviews, and land your dream job.</p>
          </section>

          {/* Warning Alert - Only show if resume incomplete */}
          {!user.resumeComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 mt-0.5 shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 text-sm">Action Required: Complete Your Resume!</p>
                <p className="text-amber-700 text-sm mt-0.5">You need to complete your resume before you can apply for opportunities.</p>
                <button onClick={() => navigate('/applicant/resume')} className="text-sm font-bold text-amber-900 underline mt-2 hover:text-amber-950 transition-colors">Build your resume now →</button>
              </div>
            </div>
          )}

          {/* Recent Applications Table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold">Recent Applications</h2>
              <button onClick={() => navigate('/applicant/applications')} className="text-xs font-bold text-blue-600 px-4 py-1.5 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all">View All</button>
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
              <button onClick={() => navigate('/applicant/interviews')} className="text-sm font-semibold text-slate-500 px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">View Schedule</button>
            </div>
            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((item) => (
                  <div key={item.id} className="relative flex items-center justify-between p-5 border border-slate-100 rounded-xl group hover:border-blue-200 transition-all shadow-sm">
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-900 rounded-r-full" />
                    <div className="flex items-center gap-5 ml-2">
                      <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center text-xl">
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
                      <button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95">
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

// Reusable Stat Card Component
const StatCard = ({ title, value, trend, icon, color }) => {
  const colorMap = {
    blue: 'border-l-blue-500 bg-blue-50/30',
    indigo: 'border-l-indigo-500 bg-indigo-50/30',
    orange: 'border-l-orange-500 bg-orange-50/30',
    emerald: 'border-l-emerald-500 bg-emerald-50/30',
    slate: 'border-l-slate-300 bg-slate-50/30',
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

export default ApplicantDashboard;