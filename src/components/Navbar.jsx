import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useRescue } from "../context/RescueContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats } = useRescue();
  const navigate = useNavigate();

  return (
    <header className="navbar-container">
      <div className="navbar-inner">

        {/* Brand */}
        <Link
          to="/"
          className="brand-logo"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="logo-icon-wrap">
            <span className="logo-emoji">🍃</span>
          </div>

          <div className="brand-text-wrap">
            <span className="brand-title">FoodRescue</span>
            <span className="brand-subtitle">
              Smart Food Recovery Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/organizations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">🏢</span>
            Organizations
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">📜</span>
            Rescue History
          </NavLink>

        </nav>

        {/* Right Side */}
        <div className="navbar-right">

          {/* Active Rescues */}
          <div
            className="live-radar-badge"
            title="Active food rescue opportunities"
          >
            <span className="live-dot"></span>
            <span className="live-text">
              {stats.activeRescuesCount} Active Rescues
            </span>
          </div>

          {/* SINGLE REPORT BUTTON */}
          <button
            className="navbar-report-btn"
            onClick={() => navigate("/report")}
            title="Post surplus food for rescue"
          >
            + Report Surplus Food
          </button>

          {/* Profile */}
          <div className="profile-placeholder" title="Demo Operator">
            <div className="avatar-circle">FR</div>

            <div className="profile-details">
              <span className="profile-name">Rescue Hub</span>
              <span className="profile-role">Demo Operator</span>
            </div>
          </div>

          {/* Mobile Menu */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "mobile-link active" : "mobile-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/organizations"
            className={({ isActive }) =>
              isActive ? "mobile-link active" : "mobile-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            🏢 Partner Organizations
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? "mobile-link active" : "mobile-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            📜 Rescue Impact History
          </NavLink>

        </div>
      )}
    </header>
  );
}