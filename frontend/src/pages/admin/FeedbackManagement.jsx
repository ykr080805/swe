import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllFeedback, openFeedbackWindow, closeFeedbackWindow, getAdminOfferings, getFeedbackResults } from '../../services/apiService';

const StarDisplay = ({ rating }) => {
  if (!rating) return <span className="text-gray-400 text-xs">—</span>;
  const filled = Math.round(parseFloat(rating));
  return (
    <span className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`text-sm ${s <= filled ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{parseFloat(rating).toFixed(1)}</span>
    </span>
  );
};

function ResponsesPanel({ offeringId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackResults(offeringId)
      .then(r => setResults(r.data))
      .catch(() => setResults({ error: true }))
      .finally(() => setLoading(false));
  }, [offeringId]);

  if (loading) return <p className="text-xs text-gray-400 py-2">Loading responses...</p>;
  if (results?.error || !results) return <p className="text-xs text-gray-400 py-2">No responses yet.</p>;
  if (results.totalResponses === 0) return <p className="text-xs text-gray-400 py-2">No responses submitted.</p>;

  return (
    <div className="mt-3 space-y-4 border-t border-gray-100 pt-4">
      {/* Summary row */}
      <div className="flex gap-6 text-xs text-gray-600">
        <span><strong className="text-gray-900">{results.totalResponses}</strong> total responses</span>
        <span className="flex items-center gap-1">
          Avg overall: <StarDisplay rating={results.averageRating} />
        </span>
      </div>

      {/* Per-question breakdown in a 2-col grid */}
      {results.questionResults?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.questionResults.map(qr => (
            <div key={qr.questionIndex} className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-indigo-600 mb-1">
                Q{qr.questionIndex + 1}. {qr.questionText}
              </p>
              {qr.averageRating && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <StarDisplay rating={qr.averageRating} />
                    <span className="text-xs text-gray-500">({qr.responseCount} ratings)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${(parseFloat(qr.averageRating) / 5) * 100}%` }} />
                  </div>
                </>
              )}
              {/* Anonymous text responses */}
              {qr.textResponses?.length > 0 && (
                <div className="space-y-1 mt-2">
                  {qr.textResponses.map((t, i) => (
                    <p key={i} className="text-xs text-gray-600 italic bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                      "{t}"
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Anonymous additional comments */}
      {results.comments?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Additional Comments ({results.comments.length})</p>
          <div className="space-y-1">
            {results.comments.map((c, i) => (
              <p key={i} className="text-xs text-gray-700 italic bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                "{c}"
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ offeringId: '', startDate: '', endDate: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // windowId -> bool

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    getAllFeedback().then(r => setFeedback(r.data)).catch(() => {});
    getAdminOfferings().then(r => setOfferings(r.data || [])).catch(() => {});
  };

  const selectedOffering = offerings.find(o => o._id === form.offeringId);

  const toggleExpanded = (windowId) =>
    setExpanded(prev => ({ ...prev, [windowId]: !prev[windowId] }));

  const handleOpen = async () => {
    if (!form.offeringId) { setMsg('Please select a course offering'); return; }
    if (!form.startDate || !form.endDate) { setMsg('Start and End dates are required'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { setMsg('End date must be after start date'); return; }
    setLoading(true); setMsg('');
    try {
      await openFeedbackWindow(form.offeringId, { startDate: form.startDate, endDate: form.endDate });
      setOpenModal(false);
      setForm({ offeringId: '', startDate: '', endDate: '' });
      loadAll();
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to open feedback window'); }
    setLoading(false);
  };

  const handleClose = async (windowId) => {
    if (!confirm('Close this feedback window? Students will no longer be able to submit.')) return;
    try { await closeFeedbackWindow(windowId); loadAll(); }
    catch { alert('Failed to close window'); }
  };

  const activeCount = feedback.filter(f => f.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Feedback Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Open end-of-semester feedback windows. All individual responses shown anonymously.
          </p>
        </div>
        <Button onClick={() => { setOpenModal(true); setMsg(''); setForm({ offeringId: '', startDate: '', endDate: '' }); }}>
          + Open Feedback Window
        </Button>
      </div>

      {activeCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-emerald-500 text-xl">🟢</span>
          <p className="text-sm font-semibold text-emerald-700">
            {activeCount} active feedback window{activeCount > 1 ? 's' : ''} — students can currently submit.
          </p>
        </div>
      )}

      {feedback.length === 0 && (
        <Card><p className="text-gray-500 text-sm">No feedback windows yet. Click "+ Open Feedback Window" to start.</p></Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {feedback.map(f => (
          <div key={f._id}
            className={`bg-white border rounded-2xl shadow-sm ${f.isActive ? 'border-emerald-300' : 'border-gray-200'}`}>
            {/* Header row */}
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {f.isActive ? 'Active' : 'Closed'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {f.courseOffering?.course?.code || '—'} — {f.courseOffering?.course?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-400">{f.courseOffering?.semester} {f.courseOffering?.year}</span>
                </div>
                <p className="text-xs text-gray-400">
                  📅 {new Date(f.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  {' → '}
                  {new Date(f.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  {' · '}{f.openedBy?.name || 'Admin'}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    📋 {f.totalResponses} response{f.totalResponses !== 1 ? 's' : ''}
                  </span>
                  {f.averageRating && <StarDisplay rating={f.averageRating} />}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                {f.totalResponses > 0 && (
                  <button
                    onClick={() => toggleExpanded(f._id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition">
                    {expanded[f._id] ? '▲ Hide Responses' : '▼ View Responses'}
                  </button>
                )}
                {f.isActive && (
                  <button onClick={() => handleClose(f._id)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-50 transition">
                    Close Window
                  </button>
                )}
              </div>
            </div>

            {/* Expandable anonymous responses */}
            {expanded[f._id] && f.courseOffering?._id && (
              <div className="px-5 pb-5">
                <ResponsesPanel offeringId={f.courseOffering._id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Open Feedback Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Open Feedback Window</h2>
            <p className="text-sm text-gray-500 mb-5">Select a course offering and set the feedback dates.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Course Offering *</label>
                {offerings.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                    No offerings found. Create one in the Course Catalog first.
                  </p>
                ) : (
                  <select value={form.offeringId} onChange={e => setForm({ ...form, offeringId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm bg-white focus:outline-none focus:border-indigo-400">
                    <option value="">— Select a course offering —</option>
                    {offerings.map(o => (
                      <option key={o._id} value={o._id}>
                        {o.course?.code} — {o.course?.name} ({o.semester} {o.year})
                        {o.faculty?.name ? ` · ${o.faculty.name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {selectedOffering && (
                  <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs text-indigo-700 space-y-0.5">
                    <p><strong>{selectedOffering.course?.code}</strong> — {selectedOffering.course?.name}</p>
                    <p>Semester: {selectedOffering.semester} {selectedOffering.year} · Enrolled: {selectedOffering.enrolled}/{selectedOffering.capacity}</p>
                    <p>Instructor: {selectedOffering.faculty?.name || '—'}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <p className="font-semibold mb-1">📋 Default questions will be used (all anonymous):</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Overall course quality (★ rating)</li>
                  <li>Teaching methodology effectiveness (★ rating)</li>
                  <li>Course material organization (★ rating)</li>
                  <li>Instructor availability &amp; helpfulness (★ rating)</li>
                  <li>Additional comments (text)</li>
                </ul>
              </div>
            </div>

            {msg && <p className="text-red-500 text-xs mt-3">{msg}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button onClick={handleOpen} disabled={loading || offerings.length === 0}>
                {loading ? 'Opening...' : 'Open Feedback Window'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
