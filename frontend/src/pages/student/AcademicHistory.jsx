import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { getAcademicRecord } from '../../services/apiService';

export default function AcademicHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getAcademicRecord().then(r => setRecords(r.data.records || r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Academic History</h1>
        <p className="text-gray-500 text-sm mt-1">Your complete academic transcript.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={['Course', 'Semester', 'Credits', 'Grade', 'Grade Points']}
          data={records}
          renderRow={(r) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{r.courseOffering?.course?.name || r.courseName || '--'}</td>
              <td className="px-6 py-4">{r.courseOffering?.semester || r.semester || '--'}</td>
              <td className="px-6 py-4">{r.courseOffering?.course?.credits || r.credits || 3}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${r.grade ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {r.grade || 'In Progress'}
                </span>
              </td>
              <td className="px-6 py-4">{r.gradePoints != null ? r.gradePoints.toFixed(1) : '--'}</td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
