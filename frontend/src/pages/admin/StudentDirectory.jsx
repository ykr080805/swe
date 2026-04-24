import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import api from '../../services/authService';
import { getDepartments, getPrograms } from '../../services/apiService';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '', name: '', email: '', password: 'Welcome@123',
    department: '', rollNumber: '', batch: '', program: ''
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
    getDepartments().then(r => setDepartments(r.data)).catch(() => {});
    getPrograms().then(r => setPrograms(r.data)).catch(() => {});
  }, []);

  const fetchData = () =>
    api.get('/admin/students').then(r => setStudents(r.data)).catch(() => {});

  // Derive unique batch years from loaded data
  const batchYears = useMemo(() => {
    const years = [...new Set(students.map(s => s.batch).filter(Boolean))].sort((a, b) => b - a);
    return years;
  }, [students]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return students.filter(s => {
      const name = (s.user?.name || '').toLowerCase();
      const userId = (s.user?.userId || s.rollNumber || '').toLowerCase();
      const dept = (s.user?.department || '').toLowerCase();
      const programName = (s.program?.name || '').toLowerCase();

      if (search && !name.includes(search.toLowerCase()) && !userId.includes(search.toLowerCase())) return false;
      if (filterDept && dept !== filterDept.toLowerCase() && !dept.includes(filterDept.toLowerCase())) return false;
      if (filterYear && s.batch !== filterYear) return false;
      if (filterProgram && !programName.includes(filterProgram.toLowerCase()) && s.program?._id !== filterProgram) return false;
      if (filterStatus && s.academicStatus !== filterStatus) return false;
      return true;
    });
  }, [students, search, filterDept, filterYear, filterProgram, filterStatus]);

  const handleCreate = async () => {
    if (!form.userId || !form.name || !form.email) { setMsg('User ID, Name and Email are required'); return; }
    try {
      await api.post('/admin/students', form);
      fetchData();
      setIsModalOpen(false);
      setForm({ userId: '', name: '', email: '', password: 'Welcome@123', department: '', rollNumber: '', batch: '', program: '' });
      setMsg('');
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to create student'); }
  };

  const clearFilters = () => {
    setSearch(''); setFilterDept(''); setFilterYear('');
    setFilterProgram(''); setFilterStatus('');
  };
  const hasFilters = search || filterDept || filterYear || filterProgram || filterStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Student Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage student accounts and bulk imports.
            {hasFilters && <span className="ml-2 text-indigo-600 font-medium">Showing {filtered.length} of {students.length}</span>}
          </p>
        </div>
        <div className="flex space-x-3">
          <input type="file" accept=".csv" onChange={async (e) => {
            if (!e.target.files[0]) return;
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            try {
              const res = await api.post('/admin/students/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
              alert(res.data.message); fetchData();
            } catch { alert('Import failed'); }
          }} className="hidden" id="csv-upload" />
          <Button variant="secondary" onClick={() => document.getElementById('csv-upload').click()}>Upload CSV</Button>
          <Button onClick={() => setIsModalOpen(true)}>+ Add Student</Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Name / Roll No</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. John or 230101..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Department */}
          <div className="min-w-40">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d.code}>{d.code} — {d.name}</option>)}
            </select>
          </div>

          {/* Batch Year */}
          <div className="min-w-36">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Batch Year</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Years</option>
              {batchYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Program */}
          <div className="min-w-56">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Program</label>
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Programs</option>
              {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="min-w-36">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-indigo-400">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
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
          headers={['Roll No', 'Name', 'Department', 'Program', 'Batch', 'Status']}
          data={filtered}
          renderRow={(student) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{student.rollNumber || student.user?.userId}</td>
              <td className="px-6 py-4">{student.user?.name || student.name}</td>
              <td className="px-6 py-4">{student.user?.department || '--'}</td>
              <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">{student.program?.name || '--'}</td>
              <td className="px-6 py-4">{student.batch || '--'}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  student.academicStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                  student.academicStatus === 'graduated' ? 'bg-blue-50 text-blue-600' :
                  student.academicStatus === 'suspended' ? 'bg-rose-50 text-rose-600' :
                  'bg-gray-100 text-gray-500'}`}>
                  {student.academicStatus || 'active'}
                </span>
              </td>
            </>
          )}
        />
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            {hasFilters ? 'No students match the current filters.' : 'No students found. Add one to get started.'}
          </p>
        )}
      </Card>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#2c3e50] mb-4">Add New Student</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">User ID / Roll Number *</label>
                <input value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value, rollNumber: e.target.value })}
                  placeholder="e.g. 230101114"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john@iitg.ac.in"
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Year</label>
                  <input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Program</label>
                <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm bg-white">
                  <option value="">Select program...</option>
                  {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Default Password</label>
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm bg-amber-50" />
                <p className="text-[10px] text-amber-600 mt-1">Student must change this on first login.</p>
              </div>
            </div>
            {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
            <div className="mt-5 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => { setIsModalOpen(false); setMsg(''); }}>Cancel</Button>
              <Button onClick={handleCreate}>Create Student</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
