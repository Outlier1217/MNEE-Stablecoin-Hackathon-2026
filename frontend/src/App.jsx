// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Products from "./Products";
import Admin from "./Admin";
import "./styles.css"; // Import the new styles

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          MNEE Marketplace
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Shop
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}