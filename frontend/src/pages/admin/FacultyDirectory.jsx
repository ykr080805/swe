import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import api from '../../services/authService';
import { getDepartments } from '../../services/apiService';

const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty'];

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '', employeeId: '', name: '', email: '',
    password: 'Faculty@123', department: '', designation: ''
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
    getDepartments().then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  const fetchData = () =>
    api.get('/admin/faculty').then(r => setFaculty(r.data)).catch(() => {});

  // Client-side filtering
  const filtered = useMemo(() => {
    return faculty.filter(f => {
      const name = (f.user?.name || '').toLowerCase();
      const userId = (f.user?.userId || f.employeeId || '').toLowerCase();
      const dept = (f.user?.department || '').toLowerCase();
      const desig = (f.designation || '').toLowerCase();

      if (search && !name.includes(search.toLowerCase()) && !userId.includes(search.toLowerCase())) return false;
      if (filterDept && !dept.includes(filterDept.toLowerCase())) return false;
      if (filterDesignation && !desig.includes(filterDesignation.toLowerCase())) return false;
      return true;
    });
  }, [faculty, search, filterDept, filterDesignation]);

  const handleCreate = async () => {
    if (!form.userId || !form.name || !form.email) { setMsg('User ID, Name and Email are required'); return; }
    try {
      await api.post('/admin/faculty', form);
      fetchData();
      setIsModalOpen(false);
      setForm({ userId: '', employeeId: '', name: '', email: '', password: 'Faculty@123', department: '', designation: '' });
      setMsg('');
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to create faculty'); }
  };

  const clearFilters = () => { setSearch(''); setFilterDept(''); setFilterDesignation(''); };
  const hasFilters = search || filterDept || filterDesignation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Faculty Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage faculty accounts and course assignments.
            {hasFilters && <span className="ml-2 text-indigo-600 font-medium">Showing {filtered.length} of {faculty.length}</span>}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Faculty</Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Name / Faculty ID</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. Dr. Kumar or prof_kumar..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Department */}
          <div className="min-w-52">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d.code}>{d.code} — {d.name}</option>)}
            </select>
          </div>

          {/* Designation */}
          <div className="min-w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Designation</label>
            <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Designations</option>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters}
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 rounded-xl hover:bg-rose-50 transition whitespace-nowrap">
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Faculty ID', 'Name', 'Department', 'Designation', 'Status']}
          data={filtered}
          renderRow={(f) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{f.user?.userId || f.employeeId}</td>
              <td className="px-6 py-4">{f.user?.name || f.name}</td>
              <td className="px-6 py-4">{f.user?.department || '--'}</td>
              <td className="px-6 py-4">{f.designation || '--'}</td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600">Active</span>
              </td>
            </>
          )}
        />
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            {hasFilters ? 'No faculty match the current filters.' : 'No faculty found. Add one to get started.'}
          </p>
        )}
      </Card>

      {/* Add Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-[#2c3e50] mb-4">Add New Faculty</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Faculty ID *</label>
                <input value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value, employeeId: e.target.value })}
                  placeholder="e.g. prof_kumar"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Amit Kumar"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. amit@iitg.ac.in"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm bg-white">
                    <option value="">Select dept...</option>
                    {departments.map(d => <option key={d._id} value={d.code}>{d.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
                  <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm bg-white">
                    <option value="">Select...</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Default Password</label>
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm bg-amber-50" />
                <p className="text-[10px] text-amber-600 mt-1">Faculty must change this on first login.</p>
              </div>
            </div>
            {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
            <div className="mt-5 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => { setIsModalOpen(false); setMsg(''); }}>Cancel</Button>
              <Button onClick={handleCreate}>Create Faculty</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
