import React from 'react';
import { HardwareSection } from './components/HardwareSection.jsx';

export default function App() {
  return (
    <div className="container">
      <header className="header" role="banner">
        <h1>WiFi DensePose</h1>
        <p className="subtitle">Hardware Configuration</p>
        <div className="header-info">
          <a href="observatory.html" className="nav-tab" style={{ textDecoration: 'none' }}>
            Observatory
          </a>
        </div>
      </header>

      <section id="hardware" className="tab-content active" role="tabpanel" aria-labelledby="hardware" aria-hidden="false">
        <h2>Hardware Configuration</h2>
        <HardwareSection />
        <div style={{ marginTop: '1.5rem' }}>
          <a href="observatory.html" className="nav-tab" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Open Observatory →
          </a>
        </div>
      </section>
    </div>
  );
}
