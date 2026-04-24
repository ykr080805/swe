import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { getAllTransfers, reviewTransfer } from '../../services/apiService';

export default function TransferManagement() {
  const [transfers, setTransfers] = useState([]);
  const [filter, setFilter] = useState('Pending');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'Approved', reviewRemarks: '' });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = () => {
    getAllTransfers().then(r => setTransfers(r.data)).catch(() => {});
  };

  const handleReviewClick = (req) => {
    setSelectedReq(req);
    setReviewForm({ status: 'Approved', reviewRemarks: '' });
    setIsModalOpen(true);
  };

  const submitReview = async () => {
    try {
      await reviewTransfer(selectedReq._id, reviewForm);
      fetchTransfers();
      setIsModalOpen(false);
    } catch {
      alert('Failed to review transfer request');
    }
  };

  const filteredTransfers = transfers.filter(t => filter === 'All' || t.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Transfer Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review student room and hostel transfer requests</p>
      </div>

      <div className="flex gap-2">
        {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Student', 'Current', 'Preferred', 'Reason', 'Status', 'Actions']}
          data={filteredTransfers}
          renderRow={(req) => (
            <>
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">{req.student?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{req.student?.userId}</p>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                {req.currentHostel} - {req.currentRoom}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                {req.preferredHostel} - {req.preferredRoom || 'Any'}
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                  {req.status}
                </span>
                {req.reviewRemarks && <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[100px]" title={req.reviewRemarks}>Note: {req.reviewRemarks}</p>}
              </td>
              <td className="px-6 py-4 text-right">
                {req.status === 'Pending' && (
                  <Button onClick={() => handleReviewClick(req)}>Review</Button>
                )}
              </td>
            </>
          )}
        />
      </Card>

      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Transfer Request</h2>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm space-y-2">
              <p><span className="text-gray-500">Student:</span> <span className="font-semibold">{selectedReq.student?.name}</span></p>
              <p><span className="text-gray-500">Current:</span> <span className="font-semibold">{selectedReq.currentHostel} - {selectedReq.currentRoom}</span></p>
              <p><span className="text-gray-500">Preferred:</span> <span className="font-semibold">{selectedReq.preferredHostel} - {selectedReq.preferredRoom}</span></p>
              <p><span className="text-gray-500">Reason:</span> {selectedReq.reason}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Decision</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="Approved" checked={reviewForm.status === 'Approved'} onChange={e => setReviewForm({...reviewForm, status: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-gray-700">Approve</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="Rejected" checked={reviewForm.status === 'Rejected'} onChange={e => setReviewForm({...reviewForm, status: e.target.value})} className="text-rose-600 focus:ring-rose-500" />
                    <span className="text-sm font-medium text-gray-700">Reject</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Remarks (Optional)</label>
                <input type="text" value={reviewForm.reviewRemarks} onChange={e => setReviewForm({...reviewForm, reviewRemarks: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Approved for block A" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={submitReview}>Confirm {reviewForm.status}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
