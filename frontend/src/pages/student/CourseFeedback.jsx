import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getActiveFeedback, submitFeedback } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/authService';

const STARS = [1, 2, 3, 4, 5];
const STORAGE_KEY = (userId) => `feedback_submitted_${userId}`;

export default function CourseFeedback() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [windows, setWindows] = useState({});
  const [modal, setModal] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load persisted submitted set from localStorage (survives refresh)
  const [submitted, setSubmitted] = useState(() => {
    try {
      const userId = user?._id || user?.userId || 'guest';
      const stored = localStorage.getItem(STORAGE_KEY(userId));
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // Re-read localStorage once user object is available
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY(user._id || user.userId));
      if (stored) setSubmitted(new Set(JSON.parse(stored)));
    } catch {}
  }, [user?._id, user?.userId]);

  useEffect(() => {
    api.get('/enrollment').then(r => {
      const active = r.data.filter(e => e.status === 'enrolled');
      setEnrollments(active);
      active.forEach(e => checkFeedbackWindow(e.courseOffering?._id || e.courseOffering));
    }).catch(() => {});
  }, []);

  const checkFeedbackWindow = async (offeringId) => {
    if (!offeringId) return;
    setWindows(prev => ({ ...prev, [offeringId]: 'loading' }));
    try {
      const res = await getActiveFeedback(offeringId);
      setWindows(prev => ({ ...prev, [offeringId]: res.data }));
    } catch {
      setWindows(prev => ({ ...prev, [offeringId]: null }));
    }
  };

  const openFeedback = (enrollment, window) => {
    const blank = window.questions.map((_, i) => ({ questionIndex: i, rating: 0, text: '' }));
    setAnswers(blank);
    setOverallRating(0);
    setComments('');
    setModal({ offering: enrollment.courseOffering, window });
  };

  const setRating = (qIdx, rating) => {
    setAnswers(prev => prev.map((a, i) => i === qIdx ? { ...a, rating } : a));
  };

  const setText = (qIdx, text) => {
    setAnswers(prev => prev.map((a, i) => i === qIdx ? { ...a, text } : a));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) return alert('Please set an overall rating before submitting.');

    // Validate: all rating-type questions must have a star selected
    const questions = modal.window.questions || [];
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].type === 'rating' && (!answers[i]?.rating || answers[i].rating === 0)) {
        return alert(`Please rate Question ${i + 1}: "${questions[i].text}"`);
      }
    }

    const offeringId = modal.offering?._id || modal.offering;
    setSubmitting(true);
    try {
      await submitFeedback(offeringId, { answers, overallRating, comments });

      // Persist to localStorage so the submitted badge survives page refresh
      setSubmitted(prev => {
        const next = new Set([...prev, offeringId]);
        try {
          const userId = user?._id || user?.userId || 'guest';
          localStorage.setItem(STORAGE_KEY(userId), JSON.stringify([...next]));
        } catch {}
        return next;
      });

      setModal(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  };

  const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {STARS.map(s => (
        <button key={s} onClick={() => onChange(s)}
          className={`text-2xl transition ${s <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}>
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Course Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">Submit anonymous end-of-semester feedback for your enrolled courses.</p>
      </div>

      {enrollments.length === 0 && (
        <Card><p className="text-gray-500 text-sm">You are not currently enrolled in any courses.</p></Card>
      )}

      <div className="space-y-3">
        {enrollments.map(e => {
          const offeringId = e.courseOffering?._id || e.courseOffering;
          const win = windows[offeringId];
          const alreadySubmitted = submitted.has(offeringId);
          const course = e.courseOffering?.course;

          return (
            <div key={e._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold text-gray-900">
                  {course?.code} — {course?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{e.semester} {e.year}</p>
              </div>

              <div>
                {alreadySubmitted ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    ✓ Submitted
                  </span>
                ) : win === 'loading' ? (
                  <span className="text-xs text-gray-400">Checking...</span>
                ) : win ? (
                  <Button onClick={() => openFeedback(e, win)}>Give Feedback</Button>
                ) : (
                  <span className="text-xs text-gray-400 italic">No active feedback window</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feedback Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Feedback — {modal.offering?.course?.code || ''}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Anonymous · Your identity is not recorded</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overall Rating */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Overall Course Rating *</p>
                <StarRating value={overallRating} onChange={setOverallRating} />
              </div>

              {/* Per-question */}
              {modal.window.questions.map((q, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-800 mb-2">{i + 1}. {q.text}</p>
                  {q.type === 'rating' ? (
                    <StarRating value={answers[i]?.rating || 0} onChange={r => setRating(i, r)} />
                  ) : (
                    <textarea
                      value={answers[i]?.text || ''}
                      onChange={e => setText(i, e.target.value)}
                      placeholder="Your response..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 h-20 resize-none"
                    />
                  )}
                </div>
              ))}

              {/* Additional comments */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Additional Comments</p>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Any other thoughts or suggestions..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 h-24 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
