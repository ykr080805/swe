import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { createComplaint, getMyComplaints } from '../../services/apiService';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Maintenance', description: '', file: null });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    getMyComplaints().then(r => setComplaints(r.data)).catch(() => {});
  };

  const handleSubmit = async () => {
    try {
      let dataToSubmit = form;
      if (form.file) {
        const fd = new FormData();
        fd.append('category', form.category);
        fd.append('description', form.description);
        fd.append('attachment', form.file);
        dataToSubmit = fd;
      }
      
      await createComplaint(dataToSubmit);
      fetchComplaints();
      setIsModalOpen(false);
      setForm({ category: 'Maintenance', description: '', file: null });
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
          <Card key={comp._id} className="flex justify-between items-start p-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#{comp._id.substring(comp._id.length - 6).toUpperCase()}</span>
                <h3 className="font-bold text-gray-900">{comp.category}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
              {comp.attachment && (
                <div className="mt-3">
                  <a href={comp.attachment} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">View Attachment</a>
                </div>
              )}
              <span className="text-xs text-gray-400 mt-3 block">Filed on: {new Date(comp.createdAt).toLocaleDateString()}</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Photo Attachment (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setForm({...form, file: e.target.files[0]})} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.description.trim()}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
