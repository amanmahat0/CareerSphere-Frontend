import React, { useState, useEffect } from "react";
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/applicant/dashboard")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                title="Go to Dashboard"
              >
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold leading-tight">{loggedInUser.name || "User"}</p>
                  <p className="text-xs text-slate-400">{userType || "applicant"}</p>
                </div>
              </button>
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
