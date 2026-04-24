import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { getInbox, getSentMessages, sendMessage, markMessageRead, getThread } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function MessagingInbox() {
  const { user } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [form, setForm] = useState({ recipient: '', subject: '', body: '' });

  // View / thread state
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    getInbox().then(r => setInbox(r.data)).catch(() => {});
    getSentMessages().then(r => setSent(r.data)).catch(() => {});
  };

  const handleSend = async () => {
    try {
      await sendMessage(form);
      fetchData();
      setIsComposing(false);
      setForm({ recipient: '', subject: '', body: '' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send message';
      alert(msg);
    }
  };

  const handleMarkRead = async (id) => {
    await markMessageRead(id);
    fetchData();
  };

  // Open a message: mark read + load thread
  const openMessage = async (msg) => {
    setSelectedMsg(msg);
    setReplyBody('');
    setReplying(false);
    setThread([]);

    // Mark as read if inbox and unread
    if (tab === 'inbox' && !msg.isRead) {
      await markMessageRead(msg._id).catch(() => {});
      fetchData();
    }

    // Load thread
    if (msg.threadId) {
      setThreadLoading(true);
      try {
        const res = await getThread(msg.threadId);
        setThread(res.data);
      } catch {
        setThread([msg]);
      } finally {
        setThreadLoading(false);
      }
    } else {
      setThread([msg]);
    }
  };

  const closeMessage = () => {
    setSelectedMsg(null);
    setThread([]);
    setReplyBody('');
    setReplying(false);
  };

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setReplying(true);
    try {
      // Determine who to reply to
      const replyTo = selectedMsg.sender?.userId || selectedMsg.sender?._id;
      await sendMessage({
        recipient: replyTo,
        subject: selectedMsg.subject.startsWith('Re: ')
          ? selectedMsg.subject
          : `Re: ${selectedMsg.subject}`,
        body: replyBody,
        threadId: selectedMsg.threadId || selectedMsg._id,
      });
      setReplyBody('');
      // Reload thread
      const res = await getThread(selectedMsg.threadId || selectedMsg._id);
      setThread(res.data);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send reply';
      alert(msg);
    } finally {
      setReplying(false);
    }
  };

  const messages = tab === 'inbox' ? inbox : sent;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Academic messaging between peers and faculty.</p>
        </div>
        <Button onClick={() => setIsComposing(true)}>+ Compose</Button>
      </div>

      <div className="flex space-x-2">
        <button onClick={() => setTab('inbox')} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${tab === 'inbox' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
          Inbox ({inbox.filter(m => !m.isRead).length})
        </button>
        <button onClick={() => setTab('sent')} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${tab === 'sent' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
          Sent
        </button>
      </div>

      {messages.length === 0 && <Card><p className="text-gray-500 text-sm">No messages.</p></Card>}

      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg._id}
            onClick={() => openMessage(msg)}
            className={`bg-white shadow-sm border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 ${!msg.isRead && tab === 'inbox' ? 'border-l-4 border-l-indigo-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm ${!msg.isRead && tab === 'inbox' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.subject}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {tab === 'inbox' ? `From: ${msg.sender?.name || 'Unknown'}` : `To: ${msg.recipient?.name || 'Unknown'}`}
                </p>
                <p className="text-sm text-gray-600 mt-2 truncate">{msg.body?.slice(0, 100)}{msg.body?.length > 100 ? '…' : ''}</p>
              </div>
              <div className="flex flex-col items-end ml-4 gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                <span className="text-xs text-indigo-500 font-medium hover:underline">View →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Message View Modal ── */}
      {selectedMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedMsg.subject}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {tab === 'inbox'
                    ? `From: ${selectedMsg.sender?.name || 'Unknown'} (${selectedMsg.sender?.userId || ''})`
                    : `To: ${selectedMsg.recipient?.name || 'Unknown'} (${selectedMsg.recipient?.userId || ''})`}
                  &nbsp;·&nbsp;{new Date(selectedMsg.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={closeMessage} className="text-gray-400 hover:text-gray-700 text-xl font-bold ml-4 cursor-pointer">✕</button>
            </div>

            {/* Thread Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {threadLoading ? (
                <p className="text-gray-500 text-sm">Loading thread…</p>
              ) : (
                thread.map((m, i) => {
                  const isMe = m.sender?._id === user?._id || m.sender?.userId === user?.userId;
                  return (
                    <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {isMe ? 'You' : (m.sender?.name || 'Unknown')}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-indigo-300' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Box — only show for inbox messages (so you can reply to the sender) */}
            {tab === 'inbox' && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  placeholder="Write a reply…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 h-20 resize-none text-sm bg-white"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleReply} disabled={replying || !replyBody.trim()}>
                    {replying ? 'Sending…' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Compose Modal ── */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Message</h2>
            <div className="space-y-4">
              <input value={form.recipient} onChange={e => setForm({...form, recipient: e.target.value})} placeholder="Recipient User ID (e.g. 230101120)" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" />
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Subject" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" />
              <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Write your message..." className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 h-28 resize-none"></textarea>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsComposing(false)}>Cancel</Button>
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
