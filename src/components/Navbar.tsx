// src/components/Navbar.tsx
import React from 'react';

export default function Navbar(): React.ReactElement {
  return (
    <nav className="main-nav">
      <div className="nav-container">

        {/* Left: Logo */}
        <div className="logo-section">
          <span className="mortarboard">🎓</span>
          <span className="logo-text">FutureBridge</span>
        </div>

        {/* Center: Links */}
        <div className="nav-links">
          <div className="nav-link">
            <span>📋</span> Browse Colleges
          </div>
          <div className="nav-link">
            <span>♡</span> AI CAP Recommendations
          </div>
        </div>

        {/* Right: Auth Buttons */}
        <div className="nav-auth">
          <button className="login-btn">👤 Login</button>
          <button className="register-btn">Register</button>
        </div>

      </div>
    </nav>
  );
}
