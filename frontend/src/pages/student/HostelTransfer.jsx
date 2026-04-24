import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { createTransferRequest, getMyTransfers } from '../../services/apiService';

export default function HostelTransfer() {
  const [transfers, setTransfers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ currentHostel: '', currentRoom: '', preferredHostel: '', preferredRoom: '', reason: '' });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = () => {
    getMyTransfers().then(r => setTransfers(r.data)).catch(() => {});
  };

  const handleSubmit = async () => {
    try {
      await createTransferRequest(form);
      fetchTransfers();
      setIsModalOpen(false);
      setForm({ currentHostel: '', currentRoom: '', preferredHostel: '', preferredRoom: '', reason: '' });
    } catch {
      alert('Failed to submit transfer request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Hostel Transfer Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Apply for a change of hostel or room.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Request Transfer</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Current', 'Preferred', 'Reason', 'Status', 'Remarks', 'Applied On']}
          data={transfers}
          renderRow={(req) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{req.currentHostel} - {req.currentRoom}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{req.preferredHostel} - {req.preferredRoom}</td>
              <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                  {req.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm">{req.reviewRemarks || '-'}</td>
              <td className="px-6 py-4 text-gray-500 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
            </>
          )}
        />
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Hostel Transfer</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Hostel</label>
                  <input type="text" value={form.currentHostel} onChange={e => setForm({...form, currentHostel: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Lohit" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Room</label>
                  <input type="text" value={form.currentRoom} onChange={e => setForm({...form, currentRoom: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. A-102" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Hostel</label>
                  <input type="text" value={form.preferredHostel} onChange={e => setForm({...form, preferredHostel: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Umiam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Room</label>
                  <input type="text" value={form.preferredRoom} onChange={e => setForm({...form, preferredRoom: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Reason for Transfer</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Provide details..."></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.currentHostel || !form.currentRoom || !form.preferredHostel || !form.reason}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
