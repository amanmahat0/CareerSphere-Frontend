import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  User,
  Calendar,
  LogOut,
  Briefcase,
  Bookmark,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Logo from '../../../Components/Logo/Logo';

const Sidebar = ({ isOpen, onClose, onOpen = () => {}, activePage = 'dashboard' }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // On desktop: expanded when not collapsed, OR when collapsed but hovered
  const expanded = !isCollapsed || isHovered;

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard',          id: 'dashboard',     path: '/applicant/dashboard' },
    { icon: Briefcase,       label: 'Opportunities',      id: 'opportunities', path: '/opportunities' },
    { icon: FileText,        label: 'My Applications',    id: 'applications',  path: '/applicant/applications' },
    { icon: Bookmark,        label: 'Saved Jobs',         id: 'saved',         path: '/applicant/saved-jobs' },
    { icon: FileText,        label: 'Resume Builder',     id: 'resume',        path: '/applicant/resume' },
    { icon: Calendar,        label: 'Interview Schedule', id: 'interviews',    path: '/applicant/interviews' },
    { icon: Award,           label: 'My Certificates',    id: 'certificates',  path: '/applicant/certificates' },
    { icon: User,            label: 'My Profile',         id: 'profile',       path: '/applicant/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed lg:static h-screen bg-white border-r border-slate-200 flex flex-col z-40
        transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${expanded ? 'w-64' : 'w-16'}
      `}
    >
      {/* Logo row */}
      <div className="h-16 flex items-center border-b border-slate-200 shrink-0 overflow-hidden px-3 gap-2">
        {/* Logo icon — always visible */}
        <div
          className="shrink-0 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Logo width={32} height={32} />
        </div>

        {/* Brand name — visible when expanded */}
        <span
          className={`text-lg font-bold text-slate-900 whitespace-nowrap cursor-pointer flex-1 transition-all duration-300 overflow-hidden ${
            expanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
          }`}
          onClick={() => navigate('/')}
        >
          CareerSphere
        </span>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className={`hidden lg:flex shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 ${
            expanded ? '' : 'mx-auto'
          }`}
          aria-label="Toggle sidebar"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto pt-4">
        {navigationItems.map((item) => (
          <NavItem
            key={item.id}
            icon={<item.icon size={20} />}
            label={item.label}
            active={item.id === activePage}
            expanded={expanded}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 mb-0.5 mt-auto border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`flex items-center bg-red-100 text-slate-600 hover:bg-red-200 rounded-lg transition-all duration-300 text-sm font-medium ${
            expanded ? 'w-full gap-3 px-3 py-2.5' : 'w-10 h-10 mx-auto justify-center'
          }`}
        >
          <LogOut size={20} className="text-red-600 shrink-0" />
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
            expanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, expanded, onClick }) => (
  <button
    onClick={onClick}
    title={!expanded ? label : undefined}
    className={`flex items-center rounded-lg transition-all duration-200 text-sm font-medium ${
      expanded ? 'w-full gap-3 px-3 py-2.5' : 'w-10 h-10 mx-auto justify-center'
    } ${
      active
        ? 'bg-blue-900 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
      expanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
    }`}>
      {label}
    </span>
  </button>
);

export default Sidebar;
