import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, Calendar, 
  Search, Menu
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

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

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userRole="Admin"
        dashboardPath="/admin/dashboard"
        profilePath="/admin/profile"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="dashboard" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard </h1>
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
    </div>
  );
};

// Sub-components
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

export default AdminDashboard;