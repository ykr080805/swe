import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import api from '../services/authService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ departments: 0, students: 0, faculty: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/departments').catch(() => ({ data: [] })),
      api.get('/admin/students').catch(() => ({ data: [] })),
      api.get('/admin/faculty').catch(() => ({ data: [] })),
    ]).then(([depts, students, faculty]) => {
      setStats({
        departments: depts.data.length || 0,
        students: students.data.length || 0,
        faculty: faculty.data.length || 0,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview and core management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <h2 className="text-3xl font-black text-indigo-600">{stats.departments}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</span>
        </Card>
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <h2 className="text-3xl font-black text-emerald-600">{stats.students}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</span>
        </Card>
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <h2 className="text-3xl font-black text-amber-600">{stats.faculty}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faculty Members</span>
        </Card>
      </div>
    </div>
  );
}
