import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import api from '../../services/authService';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', credits: 3, description: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = () => api.get('/courses').then(r => setCourses(r.data)).catch(() => {});

  const handleCreate = async () => {
    try {
      await api.post('/courses', form);
      fetchData();
      setIsModalOpen(false);
      setForm({ code: '', name: '', credits: 3, description: '' });
    } catch (err) { alert(err.response?.data?.error || 'Failed to create course'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Course Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the master course catalog.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Course</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={['Code', 'Name', 'Credits', 'Department']} data={courses}
          renderRow={(c) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{c.code}</td>
              <td className="px-6 py-4">{c.name}</td>
              <td className="px-6 py-4">{c.credits}</td>
              <td className="px-6 py-4">{c.department?.name || c.department || '--'}</td>
            </>
          )}
        />
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Course</h2>
            <div className="space-y-4">
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Course Code (e.g. CS101)" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Course Name" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <input type="number" value={form.credits} onChange={e => setForm({...form, credits: +e.target.value})} placeholder="Credits" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 h-20 resize-none"></textarea>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Course</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
