import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getMyAttendance } from '../../services/apiService';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    getMyAttendance().then(r => setAttendance(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Attendance Summary</h1>
        <p className="text-gray-500 text-sm mt-1">Your attendance across all enrolled courses.</p>
      </div>

      {attendance.length === 0 && <Card><p className="text-gray-500 text-sm">No attendance data available yet.</p></Card>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendance.map((record) => {
          const co = record.courseOffering;
          const courseName = co?.course?.name || co?.name || 'Unknown Course';
          const courseCode = co?.course?.code || co?.code || '';
          const coId = co?._id || co;
          return (
            <Card key={coId} className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{courseCode ? `${courseCode} — ${courseName}` : courseName}</h2>
                <p className="text-gray-500 text-sm">Classes Attended: <strong className="text-gray-900">{record.attended}</strong> / {record.total}</p>
              </div>
              <div className="text-center">
                <span className={`text-2xl font-bold ${record.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {record.percentage}%
                </span>
                {record.percentage < 75 && <p className="text-xs text-rose-600 mt-1">Low attendance</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
