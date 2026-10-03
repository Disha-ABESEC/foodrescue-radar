import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { RescueProvider } from "./context/RescueContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ReportFood from "./pages/ReportFood";
import Organizations from "./pages/Organizations";
import RescueHistory from "./pages/RescueHistory";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-root">
      <Navbar />

      <main className="main-viewport">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<ReportFood />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/history" element={<RescueHistory />} />
        </Routes>
      </main>

      <footer className="platform-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="logo-emoji">🍃</span>
              <span className="footer-brand-name">FoodRescue <span className="green-accent">Radar</span></span>
            </div>
            <p className="footer-desc">
              Algorithmic surplus-food rescue infrastructure connecting hotels, caterers, and canteens directly with verified local relief shelters.
            </p>
            <div className="footer-status-pill">
              <span className="pulse-green"></span>
              <span>Autonomous Matching Radar: Online</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <Link to="/">Dashboard</Link>
            <Link to="/report">Report Food</Link>
            <Link to="/organizations">Organizations</Link>
            <Link to="/history">Rescue History</Link>
          </div>

          <div className="footer-links-col">
            <h4>Algorithm Weighting</h4>
            <span>🚨 Urgency (35%)</span>
            <span>📍 Proximity (25%)</span>
            <span>🍽️ Capacity Fit (25%)</span>
            <span>🍱 Category Support (15%)</span>
          </div>

          <div className="footer-links-col">
            <h4>Platform Notes</h4>
            <p className="footer-demo-text">
              Fully client-side prototype with persistent localStorage state. Sample network data pre-loaded for demonstration.
            </p>
            <span className="footer-tech-note">React + Vite • No backend required</span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} FoodRescue Radar. Eliminating food waste through intelligent logistics.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <RescueProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </RescueProvider>
  );
}