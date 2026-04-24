import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { getMyCourseOfferings } from '../services/apiService';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getMyCourseOfferings().then(r => setOfferings(r.data)).catch(() => {});
  }, []);

  const copyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // Quick-action buttons per course — stores offering id in sessionStorage then navigates
  const goTo = (path, offeringId) => {
    sessionStorage.setItem('selectedOfferingId', offeringId);
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Welcome, {user?.name || 'Faculty'}</h1>
        <p className="text-gray-500 text-sm mt-1">Your assigned courses and management tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">{offerings.length}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Courses</span>
        </Card>
        <Card className="flex flex-col justify-center items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">{user?.department || '--'}</h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</span>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-gray-900 mb-1">My Course Offerings</h3>
        <p className="text-xs text-gray-400 mb-4">Click a quick-action button to navigate directly to that course's section.</p>

        {offerings.length === 0 ? (
          <p className="text-gray-500 text-sm">No courses assigned yet. Contact admin to get assigned to a course offering.</p>
        ) : (
          <div className="space-y-3">
            {offerings.map(o => (
              <div key={o._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                {/* Course info row */}
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{o.course?.code}</span>
                      <span className="text-gray-400 text-sm">—</span>
                      <span className="text-sm text-gray-700">{o.course?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{o.semester} {o.year}</span>
                      <span>·</span>
                      <span>{o.credits || o.course?.credits} credits</span>
                      <span>·</span>
                      <span className="font-medium text-gray-700">{o.enrolled || 0}/{o.capacity} enrolled</span>
                      <span>·</span>
                      {/* Registration status badge — closed if flag is false OR capacity is full */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.isOpen && (o.enrolled || 0) < o.capacity ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                        Registration {o.isOpen && (o.enrolled || 0) < o.capacity ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{o._id}</span>
                      <button
                        onClick={() => copyId(o._id)}
                        className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        {copied === o._id ? 'Copied!' : 'Copy ID'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick-action navigation buttons */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => goTo('/faculty/attendance', o._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Attendance
                  </button>
                  <button
                    onClick={() => goTo('/faculty/assignments', o._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Assignments
                  </button>
                  <button
                    onClick={() => goTo('/faculty/submissions', o._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
                    Submissions
                  </button>
                  <button
                    onClick={() => goTo('/faculty/grading', o._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    Grading
                  </button>
                  <button
                    onClick={() => navigate('/faculty/feedback')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z"/></svg>
                    Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-3">Quick Guide</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
            <span className="text-indigo-600 font-bold">1.</span>
            <p>Click <span className="font-semibold">Attendance</span>, <span className="font-semibold">Assignments</span>, <span className="font-semibold">Submissions</span> or <span className="font-semibold">Grading</span> directly on a course row above — the offering will be pre-selected.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
            <span className="text-indigo-600 font-bold">2.</span>
            <p>You can also <span className="font-semibold">Copy ID</span> and paste it manually on any of those pages.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
            <span className="text-indigo-600 font-bold">3.</span>
            <p>The <span className="font-semibold">Registration Open/Closed</span> badge shows whether students can still enroll — it does not affect your ability to manage the course.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
