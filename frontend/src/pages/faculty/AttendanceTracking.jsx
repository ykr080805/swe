import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { getAttendanceSessions, markAttendance, getRoster } from '../../services/apiService';

export default function AttendanceTracking() {
  const [courseId, setCourseId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [date, setDate] = useState('');

  const fetchData = () => {
    if (!courseId) return;
    getAttendanceSessions(courseId).then(r => setSessions(r.data)).catch(() => {});
    getRoster(courseId).then(r => setRoster(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleMarkAll = async (status) => {
    if (!courseId || !date) return alert('Select course and date');
    const records = roster.map(e => ({ student: e.student?._id || e.student, status }));
    try {
      await markAttendance(courseId, { date, records });
      fetchData();
      alert('Attendance saved!');
    } catch { alert('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2c3e50]">Attendance Tracking</h1>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Course Offering ID</label>
            <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Paste ID" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button onClick={() => handleMarkAll('present')}>Mark All Present</Button>
          <Button variant="danger" onClick={() => handleMarkAll('absent')}>Mark All Absent</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-3">Enrolled Students ({roster.length})</h3>
        {roster.length === 0 ? <p className="text-gray-500 text-sm">No students found.</p> : (
          <div className="space-y-2">
            {roster.map((e, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{e.student?.name || 'Student'} ({e.student?.userId})</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-3">Session History ({sessions.length})</h3>
        {sessions.length === 0 ? <p className="text-gray-500 text-sm">No sessions recorded.</p> : (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span className="text-sm text-gray-900">{new Date(s.date).toLocaleDateString()}</span>
                <span className="text-sm text-gray-500">{s.records?.length || 0} records</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
