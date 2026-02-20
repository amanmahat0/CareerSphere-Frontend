import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import Logo from './Logo/Logo';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DashboardHeader = ({ 
  onMenuClick, 
  userRole = 'Applicant',
  dashboardPath = '/applicant/dashboard',
  profilePath = '/applicant/profile'
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || parsedUser.fullname || parsedUser.companyName || 'User',
          role: userRole,
          avatar: (parsedUser.name || parsedUser.fullname || parsedUser.companyName || 'U').charAt(0).toUpperCase(),
          profilePicture: parsedUser.profilePicture,
          notificationCount: 2
        });
      } catch (error) {
        console.error('Error parsing user:', error);
        // Set default user on error
        setUser({
          name: userRole === 'Admin' ? 'Admin User' : 'User',
          role: userRole,
          avatar: userRole === 'Admin' ? 'A' : 'U',
          profilePicture: null,
          notificationCount: 0
        });
      }
    } else {
      // Set default user when no user in localStorage
      setUser({
        name: userRole === 'Admin' ? 'Admin User' : 'User',
        role: userRole,
        avatar: userRole === 'Admin' ? 'A' : 'U',
        profilePicture: null,
        notificationCount: 0
      });
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const getProfilePictureUrl = () => {
    if (!user?.profilePicture) return null;
    if (user.profilePicture.startsWith('/uploads')) {
      return `${API_BASE_URL.replace('/api', '')}${user.profilePicture}`;
    }
    return user.profilePicture;
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center z-50">
      {/* Logo Section - Aligned with Sidebar (w-64 = 256px) */}
      <div className="w-64 h-full hidden lg:flex items-center px-6 border-r border-slate-200 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <Logo />
          <span className="text-lg font-bold text-slate-900">CareerSphere</span>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="lg:hidden h-full flex items-center px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo />
          <span className="text-base font-bold text-slate-900">CareerSphere</span>
        </div>
      </div>

      {/* Right Section - Aligned with Dashboard Content */}
      <div className="flex-1 h-full flex items-center justify-between px-4 lg:px-20">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        {/* Empty space for desktop */}
        <div className="hidden lg:block"></div>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} className="text-slate-500" />
            {user.notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {user.notificationCount}
              </span>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white font-bold shadow-md">
                {getProfilePictureUrl() ? (
                  <img src={getProfilePictureUrl()} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.avatar
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button 
                    onClick={() => { navigate(dashboardPath); setProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { navigate(profilePath); setProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Profile
                  </button>
                  <hr className="my-2 border-slate-200" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
