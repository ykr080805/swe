import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getMyCourseOfferings, getFeedbackResults } from '../../services/apiService';

const StarBar = ({ rating, size = 'md' }) => {
  const filled = Math.round(parseFloat(rating) || 0);
  const cls = size === 'lg' ? 'text-2xl' : 'text-base';
  return (
    <span className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`${cls} ${s <= filled ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  );
};


export default function CourseFeedbackResults() {
  const [offerings, setOfferings] = useState([]);
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyCourseOfferings().then(r => setOfferings(r.data)).catch(() => {});
  }, []);

  const loadResults = async (offeringId) => {
    setSelected(offeringId);
    setResults(null);
    setLoading(true);
    try {
      const res = await getFeedbackResults(offeringId);
      setResults(res.data);
    } catch { setResults({ error: 'No feedback data available for this course.' }); }
    setLoading(false);
  };

  const selectedOffering = offerings.find(o => o._id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Course Feedback Results</h1>
        <p className="text-gray-500 text-sm mt-1">All responses are completely anonymous — no student identity is stored.</p>
      </div>

      {/* Course selector */}
      <Card>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select Course</label>
        {offerings.length === 0 && <p className="text-sm text-gray-400">No courses assigned yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {offerings.map(o => (
            <button key={o._id} onClick={() => loadResults(o._id)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                selected === o._id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-300'}`}>
              <span className="font-semibold">{o.course?.code}</span> — {o.course?.name}
              <span className="ml-2 text-xs text-gray-400">{o.semester} {o.year}</span>
            </button>
          ))}
        </div>
      </Card>

      {loading && <Card><p className="text-gray-400 text-sm animate-pulse">Loading feedback data...</p></Card>}
      {results?.error && <Card><p className="text-gray-500 text-sm">{results.error}</p></Card>}

      {results && !results.error && (
        <div className="space-y-5">
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Responses</p>
              <p className="text-4xl font-black text-indigo-600">{results.totalResponses}</p>
              <p className="text-xs text-gray-400 mt-1">Anonymous submissions</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Overall Average</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-4xl font-black text-amber-500">{results.averageRating || '—'}</p>
                {results.averageRating && <StarBar rating={results.averageRating} size="lg" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">out of 5.0</p>
            </Card>
          </div>

          {/* ── Per-question breakdown ── */}
          {results.questionResults?.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Question Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.questionResults.map(qr => {
                  const pct = qr.averageRating ? (parseFloat(qr.averageRating) / 5) * 100 : 0;
                  return (
                    <div key={qr.questionIndex} className="border border-gray-100 bg-gray-50 rounded-2xl p-4">
                      {/* Question text from API */}
                      <p className="text-sm font-semibold text-gray-800 mb-3">
                        <span className="text-indigo-500 mr-1.5">Q{qr.questionIndex + 1}.</span>
                        {qr.questionText || `Question ${qr.questionIndex + 1}`}
                      </p>

                      {/* Rating row — only for rating-type questions */}
                      {qr.averageRating ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <StarBar rating={qr.averageRating} />
                            <span className="text-sm font-bold text-gray-700">{qr.averageRating}
                              <span className="text-xs text-gray-400 font-normal ml-1">/ 5.0 ({qr.responseCount})</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full bg-amber-400 transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Open text question</p>
                      )}

                      {/* Anonymous text responses */}
                      {qr.textResponses?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Responses ({qr.textResponses.length})
                          </p>
                          {qr.textResponses.map((t, i) => (
                            <div key={i} className="flex gap-2 items-start bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <span className="text-gray-300 text-lg leading-none mt-0.5">"</span>
                              <p className="text-sm text-gray-700 italic flex-1">{t}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── Anonymous additional comments ── */}
          {results.comments?.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-1">Additional Comments</h3>
              <p className="text-xs text-gray-400 mb-4">
                🔒 {results.comments.length} anonymous comment{results.comments.length !== 1 ? 's' : ''} — no student identity is stored
              </p>
              <div className="space-y-2">
                {results.comments.map((c, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-800 italic">"{c}"</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* If no responses at all */}
          {results.totalResponses === 0 && (
            <Card>
              <p className="text-gray-400 text-sm text-center py-4">
                No feedback has been submitted for this course yet.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
