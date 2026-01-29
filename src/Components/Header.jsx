import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./Buttons/button";
import Logo from "./Logo/Logo";
import { Bell, LogOut } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "#" },
  { label: "Internships", path: "#" },
  { label: "Jobs", path: "#" },
  { label: "Contact", path: "#" },
];

export const Header = ({ isDashboard = false, user = null, onLogout = null }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Public mode - shows login/signup buttons
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button size="sm" onClick={() => navigate("/applicant/signup")}>Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
