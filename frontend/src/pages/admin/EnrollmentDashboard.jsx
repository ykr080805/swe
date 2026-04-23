import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import api from '../../services/authService';

export default function EnrollmentDashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/admin/enrollments').then(r => setEnrollments(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Enrollment Oversight</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage all enrollment records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <h2 className="text-3xl font-black text-indigo-600">{enrollments.length}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Enrollments</span>
        </Card>
        <Card className="text-center">
          <h2 className="text-3xl font-black text-emerald-600">{enrollments.filter(e => e.status === 'enrolled').length}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase">Active</span>
        </Card>
        <Card className="text-center">
          <h2 className="text-3xl font-black text-rose-600">{enrollments.filter(e => e.status === 'dropped').length}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase">Dropped</span>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={['Student', 'Course', 'Status', 'Grade']} data={enrollments}
          renderRow={(e) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{e.student?.name || e.student?.userId || '--'}</td>
              <td className="px-6 py-4">{e.courseOffering?.course?.name || '--'}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${e.status === 'enrolled' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{e.status}</span>
              </td>
              <td className="px-6 py-4">{e.grade || '--'}</td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
