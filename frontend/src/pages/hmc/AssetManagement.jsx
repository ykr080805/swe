import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { getAllAssets, createAsset, updateAsset, logMaintenance, deleteAsset } from '../../services/apiService';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  
  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // Forms
  const [assetForm, setAssetForm] = useState({ name: '', type: 'Furniture', location: '', condition: 'Good' });
  const [maintenanceForm, setMaintenanceForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', performedBy: '', cost: '', newCondition: 'Good' });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    getAllAssets().then(r => setAssets(r.data)).catch(() => {});
  };

  const handleAssetSubmit = async () => {
    try {
      if (selectedAsset) {
        await updateAsset(selectedAsset._id, assetForm);
      } else {
        await createAsset(assetForm);
      }
      fetchAssets();
      setIsAssetModalOpen(false);
    } catch {
      alert('Failed to save asset');
    }
  };

  const handleMaintenanceSubmit = async () => {
    try {
      await logMaintenance(selectedAsset._id, {
        ...maintenanceForm,
        cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : 0
      });
      fetchAssets();
      setIsMaintenanceModalOpen(false);
    } catch {
      alert('Failed to log maintenance');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id);
        fetchAssets();
      } catch {
        alert('Failed to delete asset');
      }
    }
  };

  const openNewAsset = () => {
    setSelectedAsset(null);
    setAssetForm({ name: '', type: 'Furniture', location: '', condition: 'Good' });
    setIsAssetModalOpen(true);
  };

  const openEditAsset = (asset) => {
    setSelectedAsset(asset);
    setAssetForm({ name: asset.name, type: asset.type, location: asset.location, condition: asset.condition });
    setIsAssetModalOpen(true);
  };

  const openMaintenance = (asset) => {
    setSelectedAsset(asset);
    setMaintenanceForm({ date: new Date().toISOString().split('T')[0], description: '', performedBy: '', cost: '', newCondition: asset.condition });
    setIsMaintenanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Asset Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track hostel inventory, conditions, and maintenance logs</p>
        </div>
        <Button onClick={openNewAsset}>+ Add Asset</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Asset', 'Location', 'Condition', 'Last Maintenance', 'Actions']}
          data={assets}
          renderRow={(asset) => (
            <>
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">{asset.name}</p>
                <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{asset.type}</span>
              </td>
              <td className="px-6 py-4 font-medium text-gray-700">{asset.location}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  asset.condition === 'Good' ? 'bg-emerald-50 text-emerald-600' : 
                  asset.condition === 'Fair' ? 'bg-blue-50 text-blue-600' : 
                  asset.condition === 'Damaged' ? 'bg-amber-50 text-amber-600' :
                  asset.condition === 'Disposed' ? 'bg-gray-100 text-gray-500' : 'bg-rose-50 text-rose-600'
                }`}>
                  {asset.condition}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate).toLocaleDateString() : 'Never'}
                {asset.maintenanceLog?.length > 0 && <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">({asset.maintenanceLog.length} logs)</span>}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => openMaintenance(asset)} className="text-amber-600 hover:text-amber-800 text-xs font-bold" title="Log Maintenance">🔧</button>
                  <button onClick={() => openEditAsset(asset)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold" title="Edit">✎</button>
                  <button onClick={() => handleDelete(asset._id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold" title="Delete">✕</button>
                </div>
              </td>
            </>
          )}
        />
      </Card>

      {/* Add / Edit Asset Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Asset Name</label>
                <input type="text" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Water Cooler" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <select value={assetForm.type} onChange={e => setAssetForm({...assetForm, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500">
                    <option>Furniture</option><option>Appliance</option><option>Infrastructure</option><option>Electronics</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                  <select value={assetForm.condition} onChange={e => setAssetForm({...assetForm, condition: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500">
                    <option>Good</option><option>Fair</option><option>Damaged</option><option>Under Repair</option><option>Disposed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <input type="text" value={assetForm.location} onChange={e => setAssetForm({...assetForm, location: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Lohit Block A Ground Floor" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsAssetModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssetSubmit} disabled={!assetForm.name || !assetForm.location}>Save Asset</Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {isMaintenanceModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Log Maintenance</h2>
            <p className="text-sm text-gray-500 mb-4">Asset: <span className="font-bold text-gray-800">{selectedAsset.name}</span></p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <input type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cost (₹)</label>
                  <input type="number" min="0" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Performed By</label>
                <input type="text" value={maintenanceForm.performedBy} onChange={e => setMaintenanceForm({...maintenanceForm, performedBy: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Electrician Team" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <textarea value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 h-20 resize-none" placeholder="What was done..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">New Condition</label>
                <select value={maintenanceForm.newCondition} onChange={e => setMaintenanceForm({...maintenanceForm, newCondition: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500">
                  <option>Good</option><option>Fair</option><option>Damaged</option><option>Under Repair</option><option>Disposed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)}>Cancel</Button>
              <Button onClick={handleMaintenanceSubmit} disabled={!maintenanceForm.description || !maintenanceForm.performedBy}>Log Maintenance</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
