import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getRoster, submitGrades } from '../../services/apiService';

export default function GradeSubmission() {
  const [courseId, setCourseId] = useState('');
  const [roster, setRoster] = useState([]);
  const [grades, setGrades] = useState({});

  const fetchData = () => {
    if (!courseId) return;
    getRoster(courseId).then(r => {
      setRoster(r.data);
      const g = {};
      r.data.forEach(e => { g[e._id] = { grade: '', gradePoints: '' }; });
      setGrades(g);
    }).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleSubmit = async () => {
    const gradeList = Object.entries(grades)
      .filter(([_, v]) => v.grade)
      .map(([enrollmentId, v]) => ({ enrollmentId, grade: v.grade, gradePoints: parseFloat(v.gradePoints) || 0 }));
    if (gradeList.length === 0) return alert('Enter at least one grade');
    try {
      await submitGrades(courseId, gradeList);
      alert('Grades submitted!');
    } catch { alert('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2c3e50]">Grade Submission</h1>

      <Card>
        <label className="block text-sm font-medium text-gray-500 mb-1">Course Offering ID</label>
        <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Paste ID" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
      </Card>

      {roster.length === 0 && <Card><p className="text-gray-500 text-sm">No students enrolled.</p></Card>}

      {roster.length > 0 && (
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-500 uppercase px-1">
              <span>Student</span><span>ID</span><span>Grade</span><span>Points</span>
            </div>
            {roster.map(e => (
              <div key={e._id} className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-900">{e.student?.name}</span>
                <span className="text-sm text-gray-500">{e.student?.userId}</span>
                <input value={grades[e._id]?.grade || ''} onChange={ev => setGrades({...grades, [e._id]: {...grades[e._id], grade: ev.target.value}})} placeholder="A/B/C" className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 w-20" />
                <input type="number" value={grades[e._id]?.gradePoints || ''} onChange={ev => setGrades({...grades, [e._id]: {...grades[e._id], gradePoints: ev.target.value}})} placeholder="10" className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 w-20" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={handleSubmit}>Submit Grades</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
