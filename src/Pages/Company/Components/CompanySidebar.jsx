import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  Bell, 
  LogOut
} from 'lucide-react';

const CompanySidebar = ({ isOpen, onClose, activePage = 'dashboard' }) => {
  const navigate = useNavigate();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Briefcase, label: 'Job Management', id: 'jobs' },
    { icon: Users, label: 'Applications', id: 'applications' },
    { icon: Calendar, label: 'Interviews', id: 'interviews' },
    //{ icon: Award, label: 'Offers & Certificates', id: 'offers' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Building2, label: 'Profile', id: 'profile' },
  ];

  const handleNavigation = (id) => {
    navigate(`/company/${id}`);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <aside className={`fixed lg:static w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-6">
        {navigationItems.map((item) => (
          <NavItem 
            key={item.id}
            icon={<item.icon size={20}/>} 
            label={item.label}
            active={item.id === activePage}
            onClick={() => handleNavigation(item.id)}
          />
        ))}
      </nav>

      <div className="p-4 mb-16 mt-auto border-t border-slate-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-100 text-slate-600 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={20} className="text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
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

export default CompanySidebar;
