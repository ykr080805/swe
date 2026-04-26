import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService';

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*]/.test(pw)) score++;
  if (score <= 2) return { label: 'Weak', color: '#e74c3c', width: '25%' };
  if (score <= 4) return { label: 'Medium', color: '#f39c12', width: '55%' };
  return { label: 'Strong', color: '#27ae60', width: '100%' };
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(form.newPassword), [form.newPassword]);

  const checks = useMemo(() => ({
    len: form.newPassword.length >= 8 && form.newPassword.length <= 16,
    upper: /[A-Z]/.test(form.newPassword),
    lower: /[a-z]/.test(form.newPassword),
    digit: /[0-9]/.test(form.newPassword),
    special: /[!@#$%^&*]/.test(form.newPassword),
    match: form.newPassword && form.newPassword === form.confirmPassword,
  }), [form.newPassword, form.confirmPassword]);

  const handleChange = async (e) => {
    e.preventDefault();
    if (!form.userId) {
      setMsg('Username is required');
      return;
    }
    if (!checks.len || !checks.upper || !checks.lower || !checks.digit || !checks.special) {
      setMsg('Password does not meet all requirements');
      return;
    }
    if (!checks.match) { setMsg('Passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', form);
      setSuccess(true);
      setMsg('Password changed successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to change password'); }
  };

  const handleReset = () => {
    setForm({ userId: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setMsg('');
  };

  const Check = ({ ok, text }) => (
    <li className={`flex items-center text-xs space-x-1.5 ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
      <span>{ok ? '\u2713' : '\u2717'}</span><span>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2c3e50] text-white px-6 py-3 flex items-center space-x-3">
        <img src="/iitg-logo.svg" alt="IITG" className="w-8 h-8" />
        <span className="font-semibold text-sm">Indian Institute of Technology Guwahati</span>
        <span className="text-gray-400 text-xs ml-2">| IITG Affairs Portal</span>
      </header>

      <div className="max-w-5xl mx-auto mt-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-[#2c3e50] text-white px-5 py-3 rounded-t font-semibold text-sm">Change Password</div>
          <form onSubmit={handleChange} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} placeholder="Username" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#3498db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password (Current Password)</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} placeholder="Current Password" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 pr-14 focus:outline-none focus:border-[#3498db]" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">{showCurrent ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} placeholder="New Password" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 pr-14 focus:outline-none focus:border-[#3498db]" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">{showNew ? 'Hide' : 'Show'}</button>
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Strength:</span>
                    <span style={{ color: strength.color }} className="font-bold">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Re-type Password" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 pr-14 focus:outline-none focus:border-[#3498db]" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs">{showConfirm ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            {msg && <p className={`text-sm ${success ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded text-sm font-medium cursor-pointer">Change</button>
              <button type="button" onClick={handleReset} className="bg-[#e74c3c] hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-medium cursor-pointer">Reset</button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-[#2c3e50] text-white px-5 py-3 rounded-t font-semibold text-sm">Password Requirements</div>
          <div className="p-5 text-sm text-gray-700">
            <p className="mb-4 text-gray-500 text-xs">Your new password will be validated against the rules below. All checks must pass.</p>
            <ul className="space-y-2">
              <Check ok={checks.len} text="8-16 characters long" />
              <Check ok={checks.upper} text="At least one uppercase letter (A-Z)" />
              <Check ok={checks.lower} text="At least one lowercase letter (a-z)" />
              <Check ok={checks.digit} text="At least one digit (0-9)" />
              <Check ok={checks.special} text="At least one special character (!@#$%^&*)" />
              <Check ok={checks.match} text="New password and confirmation match" />
            </ul>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-3">
              <p className="font-bold text-xs mb-1 text-gray-600">Password must not:</p>
              <ul className="list-disc ml-4 text-xs text-gray-500 space-y-0.5">
                <li>Contain your username, login ID, or email</li>
                <li>Be a common dictionary word</li>
                <li>Be similar to previous passwords</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <button onClick={() => navigate('/login')} className="text-[#3498db] hover:underline text-sm cursor-pointer">Back to Login</button>
      </div>
      <footer className="text-center text-xs text-gray-500 mt-8 pb-6">2026 IIT Guwahati</footer>
    </div>
  );
}
