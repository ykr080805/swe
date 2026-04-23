import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getSubmissions, gradeSubmission } from '../../services/apiService';

export default function SubmissionReview() {
  const [assignmentId, setAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const fetchData = () => {
    if (!assignmentId) return;
    getSubmissions(assignmentId).then(r => setSubmissions(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [assignmentId]);

  const handleGrade = async (submissionId, score, feedback) => {
    try {
      await gradeSubmission(submissionId, { score: parseInt(score), feedback });
      fetchData();
    } catch { alert('Failed to grade'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2c3e50]">Submission Review</h1>

      <Card>
        <label className="block text-sm font-medium text-gray-500 mb-1">Assignment ID</label>
        <input value={assignmentId} onChange={e => setAssignmentId(e.target.value)} placeholder="Paste Assignment ID" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
      </Card>

      {submissions.length === 0 && <Card><p className="text-gray-500 text-sm">No submissions yet.</p></Card>}

      {submissions.map(sub => (
        <Card key={sub._id} className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{sub.student?.name || 'Student'}</h3>
              <p className="text-sm text-gray-500">File: {sub.fileName}</p>
              <p className="text-xs text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}{sub.isLate ? ' (Late)' : ''}</p>
            </div>
            {sub.score != null && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600">
                Score: {sub.score}
              </span>
            )}
          </div>
          {sub.score == null && (
            <div className="flex items-center space-x-3">
              <input type="number" placeholder="Score" id={`score-${sub._id}`} className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm" />
              <input type="text" placeholder="Feedback" id={`fb-${sub._id}`} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm" />
              <Button onClick={() => {
                const score = document.getElementById(`score-${sub._id}`).value;
                const feedback = document.getElementById(`fb-${sub._id}`).value;
                handleGrade(sub._id, score, feedback);
              }}>Grade</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
