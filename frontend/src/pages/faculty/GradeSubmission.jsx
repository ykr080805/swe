import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getRoster, submitGrades } from '../../services/apiService';

const GRADE_POINTS = { AA: 10, AB: 9, BB: 8, BC: 7, CC: 6, CD: 5, DD: 4, fail: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

export default function GradeSubmission() {
  const [courseId, setCourseId] = useState('');
  const [roster, setRoster] = useState([]);
  const [grades, setGrades] = useState({});

  const fetchData = () => {
    if (!courseId) return;
    getRoster(courseId).then(r => {
      setRoster(r.data);
      const g = {};
      r.data.forEach(e => { g[e._id] = ''; });
      setGrades(g);
    }).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleGradeChange = (enrollmentId, grade) => {
    setGrades(prev => ({ ...prev, [enrollmentId]: grade }));
  };

  const handleSubmit = async () => {
    const gradeList = Object.entries(grades)
      .filter(([_, grade]) => grade)
      .map(([enrollmentId, grade]) => ({
        enrollmentId,
        grade,
        gradePoints: GRADE_POINTS[grade] ?? 0
      }));
    if (gradeList.length === 0) return alert('Select at least one grade');
    try {
      await submitGrades(courseId, gradeList);
      alert('Grades submitted successfully!');
    } catch { alert('Failed to submit grades'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2c3e50]">Grade Submission</h1>

      <Card>
        <label className="block text-sm font-medium text-gray-500 mb-1">Course Offering ID</label>
        <input
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          placeholder="Paste Course Offering ID"
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900"
        />
      </Card>

      {roster.length === 0 && courseId && (
        <Card><p className="text-gray-500 text-sm">No students enrolled.</p></Card>
      )}

      {roster.length > 0 && (
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 uppercase px-1">
              <span>Student</span>
              <span>Roll No.</span>
              <span>Grade</span>
            </div>
            {roster.map(e => (
              <div key={e._id} className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-900">{e.student?.name}</span>
                <span className="text-sm text-gray-500">{e.student?.userId}</span>
                <select
                  value={grades[e._id] || ''}
                  onChange={ev => handleGradeChange(e._id, ev.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 bg-white"
                >
                  <option value="">-- Select --</option>
                  {GRADE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">
              Grade scale: AA=10, AB=9, BB=8, BC=7, CC=6, CD=5, DD=4, fail=0
            </p>
            <Button onClick={handleSubmit}>Submit Grades</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
