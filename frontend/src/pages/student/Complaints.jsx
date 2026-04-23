import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { createComplaint, getMyComplaints } from '../../services/apiService';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Maintenance', description: '' });

  useEffect(() => {
    getMyComplaints().then(r => setComplaints(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    try {
      await createComplaint(form);
      const res = await getMyComplaints();
      setComplaints(res.data);
      setIsModalOpen(false);
      setForm({ category: 'Maintenance', description: '' });
    } catch {
      alert('Failed to file complaint');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Hostel Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">File and track maintenance and welfare issues.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ File Complaint</Button>
      </div>

      {complaints.length === 0 && <Card><p className="text-gray-500 text-sm">No complaints filed.</p></Card>}

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((comp) => (
          <Card key={comp._id} className="flex justify-between items-center p-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-bold text-gray-900">{comp.category}</h3>
              </div>
              <p className="text-sm text-gray-500">{comp.description}</p>
              <span className="text-xs text-gray-500 mt-2 block">Filed on: {new Date(comp.createdAt).toLocaleDateString()}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${comp.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : comp.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              {comp.status}
            </span>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">File a Complaint</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500">
                  <option>Maintenance</option>
                  <option>Electrical</option>
                  <option>Network</option>
                  <option>Cleanliness</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Describe the issue..."></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
