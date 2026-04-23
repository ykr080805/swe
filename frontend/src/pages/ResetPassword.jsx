import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService';

function genCaptcha() {
  return { a: Math.floor(Math.random() * 9) + 1, b: Math.floor(Math.random() * 9) + 1 };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: '', confirmUserId: '', emailDomain: '' });
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [msg, setMsg] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptcha(genCaptcha());
    setCaptchaAnswer('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.userId !== form.confirmUserId) { setMsg('Usernames do not match'); refreshCaptcha(); return; }
    if (parseInt(captchaAnswer) !== captcha.a + captcha.b) { setMsg('Incorrect verification code'); refreshCaptcha(); return; }
    if (!form.emailDomain) { setMsg('Please select an email domain'); return; }
    try {
      await api.post('/auth/forgot-password', { userId: form.userId, email: form.userId + '@' + form.emailDomain });
      setMsg('OTP sent to your IITG email! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to send OTP');
      refreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2c3e50] text-white px-6 py-3 flex items-center space-x-3">
        <img src="/iitg-logo.svg" alt="IITG" className="w-8 h-8" />
        <span className="font-semibold text-sm">Indian Institute of Technology Guwahati</span>
        <span className="text-gray-400 text-xs ml-2">| Academic Affairs Portal</span>
      </header>

      <div className="max-w-2xl mx-auto mt-16 px-4">
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-[#2c3e50] text-white px-5 py-3 rounded-t font-semibold text-sm flex items-center justify-between">
            <span>Reset Password (Internet/ERP User Account)</span>
            <span className="text-red-400 text-xs cursor-pointer hover:underline" onClick={() => alert('Contact CCC helpdesk for assistance.')}>Help</span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#3498db]" />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Confirm Username</label>
              <input value={form.confirmUserId} onChange={e => setForm({...form, confirmUserId: e.target.value})} className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#3498db]" />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Select IITG Email Domain</label>
              <select value={form.emailDomain} onChange={e => setForm({...form, emailDomain: e.target.value})} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-[#3498db]">
                <option value="">Select...</option>
                <option value="iitg.ac.in">iitg.ac.in</option>
                <option value="iitg.ernet.in">iitg.ernet.in</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-lg font-mono tracking-wider text-gray-700">
                  {captcha.a} + {captcha.b} =
                </div>
                <button type="button" onClick={refreshCaptcha} className="text-gray-400 hover:text-[#3498db] cursor-pointer" title="Refresh captcha">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
              </div>
              <input value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)} placeholder="Verification Code" className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#3498db]" />
            </div>
            {msg && <p className={`text-sm ${msg.includes('OTP sent') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
            <button type="submit" className="w-full bg-[#e74c3c] hover:bg-red-600 text-white py-2.5 rounded text-sm font-semibold cursor-pointer">
              Send OTP to IITG Email Id
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/login')} className="text-[#3498db] hover:underline text-sm cursor-pointer">Back to Login</button>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-500 mt-12 pb-6">2026 IIT Guwahati</footer>
    </div>
  );
}
