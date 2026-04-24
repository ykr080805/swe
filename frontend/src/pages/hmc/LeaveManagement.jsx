import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { getAllLeaves, reviewLeave } from '../../services/apiService';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    getAllLeaves().then(r => setLeaves(r.data)).catch(() => {});
  };

  const handleReview = async (id, status) => {
    try {
      await reviewLeave(id, status);
      fetchLeaves();
    } catch {
      alert('Failed to update leave status');
    }
  };

  const filteredLeaves = leaves.filter(l => filter === 'All' || l.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Leave Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review student hostel leave requests</p>
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
          headers={['Student', 'Type', 'Reason', 'Dates', 'Status', 'Actions']}
          data={filteredLeaves}
          renderRow={(leave) => (
            <>
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">{leave.student?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{leave.student?.userId || 'N/A'}</p>
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{leave.type}</td>
              <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
              <td className="px-6 py-4 text-sm">
                <div>From: {new Date(leave.startDate).toLocaleDateString()}</div>
                <div>To: {new Date(leave.endDate).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                  {leave.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {leave.status === 'Pending' && (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleReview(leave._id, 'Approved')} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Approve</button>
                    <button onClick={() => handleReview(leave._id, 'Rejected')} className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                  </div>
                )}
              </td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
