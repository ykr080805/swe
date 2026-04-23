import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getMyAssignments, submitAssignment, getMySubmissions } from '../../services/apiService';

export default function AssignmentUpload() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    getMyAssignments().then(r => setAssignments(r.data)).catch(() => {});
    getMySubmissions().then(r => setSubmissions(r.data)).catch(() => {});
  }, []);

  const handleUpload = async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await submitAssignment(assignmentId, formData);
      const res = await getMySubmissions();
      setSubmissions(res.data);
      alert('Submitted successfully!');
    } catch {
      alert('Submission failed');
    }
  };

  const getSubmission = (assignmentId) => submissions.find(s => s.assignment?._id === assignmentId || s.assignment === assignmentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">My Assignments</h1>
        <p className="text-gray-500 text-sm mt-1">View and submit your coursework.</p>
      </div>

      {assignments.length === 0 && <Card><p className="text-gray-500 text-sm">No assignments available.</p></Card>}

      {assignments.map((assignment) => {
        const sub = getSubmission(assignment._id);
        const isPastDue = new Date(assignment.deadline) < new Date();
        return (
          <Card key={assignment._id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{assignment.title}</h2>
                <p className="text-sm text-gray-500">{assignment.description}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${isPastDue ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {isPastDue ? 'Past Due' : 'Open'}
              </span>
            </div>
            <p className="text-sm text-gray-500">Deadline: <span className="text-gray-900 font-medium">{new Date(assignment.deadline).toLocaleString()}</span> | Max Score: {assignment.maxScore}</p>

            {sub ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900 font-medium">✅ Submitted: {sub.fileName}</p>
                {sub.score !== undefined && sub.score !== null && (
                  <p className="text-sm text-gray-500 mt-1">Score: <strong className="text-gray-900">{sub.score}/{assignment.maxScore}</strong></p>
                )}
                {sub.feedback && <p className="text-sm text-gray-500 mt-1">Feedback: {sub.feedback}</p>}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  onChange={(e) => e.target.files[0] && handleUpload(assignment._id, e.target.files[0])}
                  className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
