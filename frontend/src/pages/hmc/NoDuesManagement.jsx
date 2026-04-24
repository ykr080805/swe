import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { getAllNoDues } from '../../services/apiService';

// To support the new API signature if it has amount/remark, we'll override it here just for this file, or update apiService
// Since apiService expects (studentId, itemId), let's create a local helper
import api from '../../services/authService';
const clearItemWithDetails = (studentId, itemId, data) => api.patch(`/nodues/${studentId}/items/${itemId}/clear`, data);

export default function NoDuesManagement() {
  const [records, setRecords] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  
  // For clearing modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // { studentId, item }
  const [form, setForm] = useState({ amount: '', remark: '' });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = () => {
    getAllNoDues().then(r => setRecords(r.data)).catch(() => {});
  };

  const handleClearClick = (studentId, item) => {
    setSelectedItem({ studentId, item });
    setForm({ amount: '', remark: '' });
    setIsModalOpen(true);
  };

  const handleConfirmClear = async () => {
    try {
      await clearItemWithDetails(selectedItem.studentId, selectedItem.item._id, {
        amount: form.amount ? Number(form.amount) : undefined,
        remark: form.remark
      });
      fetchRecords();
      setIsModalOpen(false);
    } catch {
      alert('Failed to clear dues');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">No Dues Clearance</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and clear student dues across departments</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Student Name', 'Roll Number', 'Overall Status', 'Progress']}
          data={records}
          renderRow={(record) => {
            const clearedCount = record.items.filter(i => i.status === 'Cleared').length;
            const totalCount = record.items.length;
            const pct = totalCount === 0 ? 0 : (clearedCount / totalCount) * 100;
            
            return (
              <>
                <tr className="cursor-pointer hover:bg-gray-50 border-b border-gray-100" onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}>
                  <td className="px-6 py-4 font-bold text-gray-900">{record.student?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{record.student?.userId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.isFullyCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {record.isFullyCleared ? 'Fully Cleared' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{clearedCount}/{totalCount}</span>
                    </div>
                  </td>
                </tr>
                {expandedId === record._id && (
                  <tr>
                    <td colSpan="4" className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {record.items.map(item => (
                          <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-800 text-sm">{item.department}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.status === 'Cleared' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                {item.status}
                              </span>
                            </div>
                            
                            {item.status === 'Cleared' ? (
                              <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <p>Cleared: {new Date(item.clearedAt).toLocaleDateString()}</p>
                                {item.amount > 0 && <p>Amount: ₹{item.amount}</p>}
                                {item.remark && <p>Remark: {item.remark}</p>}
                              </div>
                            ) : (
                              <div className="mt-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); handleClearClick(record.student._id, item); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                                  Mark as Cleared
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          }}
        />
      </Card>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Clear Dues</h2>
            <p className="text-sm text-gray-500 mb-4">Department: <span className="font-bold text-gray-800">{selectedItem.item.department}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fine Amount (₹) - Optional</label>
                <input type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Remark - Optional</label>
                <input type="text" value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Paid in cash" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmClear}>Confirm Clear</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
