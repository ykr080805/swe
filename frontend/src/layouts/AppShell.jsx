import Sidebar from '../components/Sidebar';

export default function AppShell({ children, role, navItems }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* IITG Header Bar */}
      <header className="bg-[#2c3e50] text-white px-6 py-2.5 flex items-center space-x-3 shadow-md z-50">
        <img src="/iitg-logo.svg" alt="IITG" className="w-7 h-7" />
        <span className="font-semibold text-sm tracking-wide">Indian Institute of Technology Guwahati</span>
        <span className="text-gray-400 text-xs ml-2">| Academic Affairs Portal</span>
      </header>
      
      <div className="flex flex-1">
        <Sidebar role={role} navItems={navItems} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#e8f0fe] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
