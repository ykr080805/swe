import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';

export default function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Welcome, {user?.name || 'Faculty'}</h1>
        <p className="text-gray-500 text-sm mt-1">Course management and assessment engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <h2 className="text-3xl font-black text-indigo-600">—</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Courses</span>
          <p className="text-xs text-gray-400">Assign courses in admin panel</p>
        </Card>
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <h2 className="text-3xl font-black text-rose-600">—</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Submissions</span>
          <p className="text-xs text-gray-400">Will populate with assignments</p>
        </Card>
      </div>
    </div>
  );
}
