import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getResources } from '../../services/apiService';

export default function ResourceLibrary() {
  const [courseId, setCourseId] = useState('');
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    getResources(courseId).then(r => setResources(r.data)).catch(() => {});
  }, [courseId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Resource Library</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and download course materials.</p>
      </div>

      <Card>
        <label className="block text-sm font-medium text-gray-500 mb-1">Course Offering ID</label>
        <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Enter Course Offering ID to browse" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
      </Card>

      {resources.length === 0 && <Card><p className="text-gray-500 text-sm">No resources available. Enter a course ID above.</p></Card>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map(r => (
          <Card key={r._id}>
            <h3 className="font-bold text-gray-900">{r.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{r.description || 'No description'}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-400">{r.category} · {new Date(r.createdAt).toLocaleDateString()}</span>
              <a href={`/api/resources/download/${r._id}`} className="text-indigo-600 text-sm font-medium hover:underline">Download</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
