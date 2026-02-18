import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./Buttons/button";
import Logo from "./Logo/Logo";
import { Bell, LogOut, ChevronDown } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Internships", path: "/internships" },
  { label: "Jobs", path: "/jobs" },
  { label: "Contact", path: "/contact" },
];

export const Header = ({ isDashboard = false, user = null, onLogout = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location.pathname]);

  // Dashboard mode - shows user profile and notifications
  if (isDashboard && user) {
    return (
      <header className="header">
        <div className="header__inner">
          <div className="header__brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <Logo />
            <div className="header__title">CareerSphere</div>
          </div>

          <nav className="hidden md:block">
            <ul className="header__nav">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      if (item.path !== "#") {
                        e.preventDefault();
                        navigate(item.path);
                      }
                    }}
                    className={`header__nav-link ${location.pathname === item.path ? "is-active" : ""}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-full transition-colors">
                <Bell size={20} className="text-slate-400" />
                {user.notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white font-bold">
                    {user.notificationCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user.avatar}
                </div>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public mode - shows profile for logged in applicant or login/signup buttons
  // Check if applicant is logged in
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getProfilePictureUrl = () => {
    if (!loggedInUser?.profilePicture) return null;
    if (loggedInUser.profilePicture.startsWith('/uploads')) {
      return `${API_BASE_URL.replace('/api', '')}${loggedInUser.profilePicture}`;
    }
    return loggedInUser.profilePicture;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setLoggedInUser(null);
    setUserType(null);
    navigate('/');
  };

  if (loggedInUser && userType === "applicant") {
    return (
      <header className="header">
        <div className="header__inner">
          <div className="header__brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <Logo />
            <div className="header__title">CareerSphere</div>
          </div>

          <nav>
            <ul className="header__nav">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      if (item.path !== "#") {
                        e.preventDefault();
                        navigate(item.path);
                      }
                    }}
                    className={`header__nav-link ${location.pathname === item.path ? "is-active" : ""}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} className="text-slate-500" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  2
                </span>
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
                      (loggedInUser.name || loggedInUser.fullname || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{loggedInUser.name || loggedInUser.fullname || "User"}</p>
                    <p className="text-xs text-slate-500">Applicant</p>
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
                        onClick={() => { navigate('/applicant/dashboard'); setProfileDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { navigate('/applicant/profile'); setProfileDropdownOpen(false); }}
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
        </div>
      </header>
    );
  }

  // Non-logged in mode - shows login/signup buttons
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <Logo />
          <div className="header__title">CareerSphere</div>
        </div>

        <nav>
          <ul className="header__nav">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.path}
                  onClick={(e) => {
                    if (item.path !== "#") {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                  className={`header__nav-link ${location.pathname === item.path ? "is-active" : ""}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <Button variant="ghost" size="sm" onClick={() => navigate("/applicant/login")}>
            Login
          </Button>
          <Button size="sm" onClick={() => navigate("/applicant/signup")}>Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
