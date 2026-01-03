import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./Buttons/button";
import Logo from "./Logo/Logo";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "#" },
  { label: "Internships", path: "#" },
  { label: "Jobs", path: "#" },
  { label: "Contact", path: "#" },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
          <Button size="sm" onClick={() => navigate("/applicant-signup")}>Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
