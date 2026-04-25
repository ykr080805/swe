import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function AppShell({ children, role, navItems }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* IITG Header Bar */}
      <header className="bg-[#2c3e50] text-white px-6 py-2.5 flex items-center space-x-3 shadow-md z-50">
        <img src="/iitg-logo.svg" alt="IITG" className="w-7 h-7" />
        <span className="font-semibold text-sm tracking-wide">Indian Institute of Technology Guwahati</span>
        <span className="text-gray-400 text-xs ml-2">| IITG Affairs Portal</span>
      </header>

      <div className="flex flex-1 relative">
        {/* Hover trigger strip + Sidebar panel */}
        <div
          className="relative flex-shrink-0"
          style={{ width: sidebarOpen ? '224px' : '0px', transition: 'width 0.3s ease' }}
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          {/* Invisible hover-trigger strip on the left edge (always present) */}
          <div
            className="absolute top-0 left-0 h-full z-40"
            style={{ width: '16px' }}
            onMouseEnter={() => setSidebarOpen(true)}
          />

          {/* Sidebar panel that slides in */}
          <div
            className="absolute top-0 left-0 h-full z-30 overflow-hidden shadow-lg"
            style={{
              width: '224px',
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
              pointerEvents: sidebarOpen ? 'auto' : 'none',
            }}
          >
            <Sidebar role={role} navItems={navItems} />
          </div>
        </div>

        {/* Tab indicator arrow — always visible on the left edge */}
        <div
          className="fixed top-1/2 -translate-y-1/2 z-40 flex items-center cursor-pointer"
          style={{ left: sidebarOpen ? '220px' : '0px', transition: 'left 0.3s ease' }}
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          <div
            className="bg-[#2c3e50] text-white rounded-r-lg py-3 px-1 flex items-center justify-center shadow-md"
            style={{ opacity: sidebarOpen ? 0 : 1, transition: 'opacity 0.2s ease' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#e8f0fe] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
