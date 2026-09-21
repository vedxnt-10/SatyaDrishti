import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';

export const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="flex flex-col min-h-[100dvh] relative transition-colors duration-500">
          {/* Ambient background — always behind all content */}
          <div className="mesh-gradient animate-mesh-drift" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />

          {/* Navigation */}
          <Navbar />

          {/* Page content */}
          <main className="flex-grow flex flex-col relative z-10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
