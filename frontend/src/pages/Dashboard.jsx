import Sidebar from '../components/Sidebar';
import BonafideCertificate from './BonafideCertificate';

export default function Dashboard() {
  return (
    <div className="flex bg-[#f3f4f6] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-red-500 text-xs border border-gray-200">
               IITG
             </div>
          </div>
          <div className="flex flex-col items-end text-sm text-blue-900 font-medium">
            <span>Indian Institute of Technology</span>
            <span className="text-blue-600 text-xs">Guwahati</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          <BonafideCertificate />
        </main>
      </div>
    </div>
  );
}
