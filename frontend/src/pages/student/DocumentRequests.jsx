import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getDocumentRequests, createDocumentRequest } from '../../services/apiService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export default function DocumentRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getDocumentRequests().then(r => setRequests(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Document Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Request official transcripts and certificates.</p>
        </div>
        <Button onClick={async () => {
          try {
            await createDocumentRequest({ type: 'Bonafide Certificate' });
            const res = await getDocumentRequests();
            setRequests(res.data);
          } catch { alert('Failed'); }
        }}>+ New Request</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table 
          headers={['Type', 'Date Requested', 'Status']}
          data={requests}
          renderRow={(req) => (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{req.type || req.documentType || 'Document'}</td>
              <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${req.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {req.status || 'Processing'}
                </span>
              </td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
