import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements, getMyAssignments, getMyAttendance } from '../../services/apiService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    getAnnouncements().then(r => setAnnouncements(r.data.slice(0, 3))).catch(() => {});
    getMyAssignments().then(r => setAssignments(r.data)).catch(() => {});
    getMyAttendance().then(r => setAttendance(r.data)).catch(() => {});
  }, []);

  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : '--';

  const pendingCount = assignments.filter(a => new Date(a.deadline) > new Date()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Welcome back, {user?.name || 'Student'}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your academic summary for Spring 2026.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">{avgAttendance}%</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Attendance</span>
        </Card>
        
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">{assignments.length}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Assignments</span>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full z-0"></div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2 z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 z-10">{pendingCount}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">Pending Assignments</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Announcements</h3>
          <div className="space-y-4">
            {announcements.length === 0 && <p className="text-gray-500 text-sm">No announcements yet.</p>}
            {announcements.map((a, i) => (
              <div key={a._id || i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 border-l-4 border-l-indigo-500">
                <h4 className="text-sm font-semibold text-gray-900">{a.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{a.content?.slice(0, 100)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {assignments.filter(a => new Date(a.deadline) > new Date()).slice(0, 3).map((a, i) => (
              <div key={a._id || i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{a.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Due: {new Date(a.deadline).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-bold text-rose-600">{Math.ceil((new Date(a.deadline) - new Date()) / 86400000)} days</span>
              </div>
            ))}
            {assignments.filter(a => new Date(a.deadline) > new Date()).length === 0 && (
              <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
