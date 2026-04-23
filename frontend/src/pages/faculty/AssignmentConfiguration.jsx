import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/authService';
import { createAssignment, getAssignments, publishAssignment } from '../../services/apiService';

export default function AssignmentConfiguration() {
  const [courseId, setCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', maxScore: 100 });

  const fetchAssignments = () => {
    if (!courseId) return;
    getAssignments(courseId).then(r => setAssignments(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAssignments(); }, [courseId]);

  const handleCreate = async () => {
    if (!courseId) return alert('Enter a Course Offering ID first');
    try {
      await createAssignment(courseId, form);
      fetchAssignments();
      setIsModalOpen(false);
      setForm({ title: '', description: '', deadline: '', maxScore: 100 });
    } catch { alert('Failed to create assignment'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Assignment Configuration</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage course assignments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ New Assignment</Button>
      </div>

      <Card>
        <label className="block text-sm font-medium text-gray-500 mb-1">Course Offering ID</label>
        <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Paste Course Offering ID" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
      </Card>

      {assignments.length === 0 && <Card><p className="text-gray-500 text-sm">No assignments. Enter a Course Offering ID and create one.</p></Card>}

      {assignments.map(a => (
        <Card key={a._id} className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">{a.title}</h3>
            <p className="text-sm text-gray-500">{a.description}</p>
            <p className="text-xs text-gray-400 mt-1">Deadline: {new Date(a.deadline).toLocaleString()} | Max: {a.maxScore}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${a.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {a.isPublished ? 'Published' : 'Draft'}
            </span>
            {!a.isPublished && (
              <Button onClick={async () => { await publishAssignment(a._id); fetchAssignments(); }}>Publish</Button>
            )}
          </div>
        </Card>
      ))}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Assignment</h2>
            <div className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 h-20 resize-none"></textarea>
              <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <input type="number" value={form.maxScore} onChange={e => setForm({...form, maxScore: +e.target.value})} placeholder="Max Score" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
