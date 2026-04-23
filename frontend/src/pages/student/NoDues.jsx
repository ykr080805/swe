import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getMyNoDues } from '../../services/apiService';

export default function NoDues() {
  const [noDues, setNoDues] = useState(null);

  useEffect(() => {
    getMyNoDues().then(r => setNoDues(r.data)).catch(() => {});
  }, []);

  if (!noDues) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">No Dues Clearance</h1>
          <p className="text-gray-500 text-sm mt-1">Track your clearance status for graduation.</p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${noDues.isFullyCleared ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {noDues.isFullyCleared ? 'Eligible for Graduation' : 'Clearance Pending'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {noDues.items.map((dept) => (
          <Card key={dept._id} className="flex justify-between items-center p-5 border-l-4" style={{ borderLeftColor: dept.status === 'Cleared' ? '#10b981' : '#f43f5e' }}>
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dept.status === 'Cleared' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {dept.status === 'Cleared' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{dept.department}</h3>
                {dept.status === 'Cleared' ? (
                  <p className="text-xs text-gray-500">Cleared on {new Date(dept.clearedAt).toLocaleDateString()}</p>
                ) : (
                  <p className="text-xs text-rose-600">Action Required{dept.amount ? `: ${dept.amount}` : ''}{dept.remark ? `: ${dept.remark}` : ''}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
