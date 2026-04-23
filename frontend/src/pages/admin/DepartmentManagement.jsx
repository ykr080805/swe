import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import api from '../../services/authService';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/departments', form);
      fetchData();
      setIsModalOpen(false);
      setForm({ name: '', code: '' });
    } catch { alert('Failed to create department'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage academic departments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Department</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Code', 'Name', 'Head of Department']}
          data={departments}
          renderRow={(dept) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{dept.code}</td>
              <td className="px-6 py-4">{dept.name}</td>
              <td className="px-6 py-4">{dept.headOfDepartment || '--'}</td>
            </>
          )}
        />
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Department</h2>
            <div className="space-y-4">
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Department Code (e.g. CSE)" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Department Name" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900" />
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
