import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, Search, Circle, Loader2, Smile, Paperclip, X, FileText, Download, Image as ImageIcon, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import axios from 'axios';

const getOtherParticipant = (participants, currentUserId) => {
  const id = currentUserId?.toString();
  return (
    participants.find(p => {
      const pid = p._id?.toString() || p.id?.toString() || p?.toString();
      return pid !== id;
    }) || participants.find(p => p) || participants[0]
  );
};

const displayName = (participant) =>
  participant?.role === 'admin' ? 'Velaivaaipu Support' : (participant?.name || 'Unknown');

const displayRole = (participant) =>
  participant?.role === 'admin' ? 'Platform Support' : (participant?.role || 'User');

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredConv, setHoveredConv] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😊', '😂', '👍', '🔥', '❤️', '🙌', '💡', '✅', '🚀', '⭐', '🤝', '🎉'];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setConversations(data);
        const counts = {};
        data.forEach(c => { if (c.unreadCount > 0) counts[c._id] = c.unreadCount; });
        setUnreadCounts(counts);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Handle selecting conversation from navigation state
  useEffect(() => {
    const targetId = location.state?.conversationId;
    if (targetId && conversations.length > 0) {
      const target = conversations.find(c => c._id === targetId);
      if (target) {
        setActive(target);
        // Clear state to avoid re-selecting on other updates if not intended
        window.history.replaceState({}, document.title);
      }
    }
  }, [conversations, location.state]);

  useEffect(() => {
    if (active) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/messages/${active._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(Array.isArray(res.data) ? res.data : []);
          
          if (socket) {
            socket.emit('join_room', active._id);
          }
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };
      fetchMessages();
    }
  }, [active, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        const currentUserId = user?._id || user?.id;
        if (active && data.roomId === active._id) {
          // Own messages are already shown via optimistic update — skip to avoid duplicates
          if (data.senderId?.toString() === currentUserId?.toString()) return;
          setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            sender: data.senderId,
            content: data.content,
            attachment: data.attachment || null,
            createdAt: data.timestamp
          }]);
        } else {
          // Increment unread count for conversations not currently open
          setUnreadCounts(prev => ({
            ...prev,
            [data.roomId]: (prev[data.roomId] || 0) + 1
          }));
        }

        // Update conversation last message in sidebar
        setConversations(prev => (Array.isArray(prev) ? prev : []).map(c =>
          c._id === data.roomId
            ? { ...c, lastMessage: { content: data.content }, updatedAt: data.timestamp }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      });

      return () => socket.off('receive_message');
    }
  }, [socket, active]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const selectConversation = (c) => {
    setActive(c);
    setUnreadCounts(prev => ({ ...prev, [c._id]: 0 }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!msg.trim() && !selectedFile) || !active) return;

    const content = msg;
    const currentUserId = user?._id || user?.id;
    let attachment = null;

    // Upload file first if one is selected
    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/messages/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        attachment = res.data;
      } catch (err) {
        console.error('Upload error:', err);
        setUploading(false);
        return;
      }
    }

    // Optimistic update — show immediately for the sender
    setMessages(prev => [...prev, {
      _id: `temp-${Date.now()}`,
      sender: currentUserId,
      content,
      attachment,
      createdAt: new Date().toISOString()
    }]);

    // Reset input state right away
    setMsg('');
    setSelectedFile(null);
    setUploading(false);
    setShowEmojis(false);

    const messageData = {
      roomId: active._id,
      content,
      attachment,
      senderId: currentUserId,
      timestamp: new Date()
    };

    // Emit via socket for real-time delivery to the other participant
    if (socket) {
      socket.emit('send_message', messageData);
    }

    // Persist to DB
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/messages`, {
        conversationId: active._id,
        content,
        attachment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-[65vh] flex items-center justify-center bg-white rounded-2xl border border-slate-100">
        <Loader2 className="text-emerald-500 animate-spin" size={32} />
      </div>
    );
  }

  const Content = (
    <>
    <div className="flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all bg-white shadow-sm"
          title="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <MessageCircle size={16} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Direct Messaging</h1>
          <p className="text-sm text-slate-500">Chat with {user.role === 'jobseeker' ? 'recruiters and hiring managers' : 'candidates and teammates'}.</p>
        </div>
        </div>
      </div>

      {/* Recruiter message limit banner for jobseekers */}
      {user.role === 'jobseeker' && (() => {
        const limit = user?.subscription?.messageRecruitersCount ?? 0;
        const used = user?.messagesUsed ?? 0;
        const unlimited = limit === 0;
        if (unlimited) return null;
        const remaining = Math.max(0, limit - used);
        const atLimit = remaining === 0;
        return (
          <div className={`mb-4 shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium ${
            atLimit
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={13} className="shrink-0" />
              {atLimit
                ? `You've reached your limit of ${limit} recruiter conversation${limit > 1 ? 's' : ''}. Upgrade to message more.`
                : `${remaining} of ${limit} recruiter conversation${limit > 1 ? 's' : ''} remaining on your plan.`
              }
            </div>
            {atLimit && (
              <Link to="/candidate/subscription" className="flex items-center gap-1 shrink-0 font-bold hover:underline">
                <Sparkles size={11} /> Upgrade
              </Link>
            )}
          </div>
        );
      })()}

      <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm flex-1 min-h-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/30 h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-100 text-xs outline-none focus:border-emerald-300" placeholder="Search conversations..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {!Array.isArray(conversations) || conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-400 font-medium">No conversations yet.</p>
                </div>
              ) : (
                conversations.map(c => {
                  const currentUserId = user?._id?.toString() || user?.id?.toString();
                  const recipient = getOtherParticipant(c.participants, currentUserId);
                  const rName = displayName(recipient);
                  const rRole = displayRole(recipient);
                  return (
                    <button
                      key={c._id}
                      onClick={() => selectConversation(c)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ top: rect.top, left: rect.right + 8 });
                        setHoveredConv({ id: c._id, recipient, rName, rRole });
                      }}
                      onMouseLeave={() => setHoveredConv(null)}
                      className={`w-full text-left p-4 border-b border-slate-50 hover:bg-white transition-all ${active?._id === c._id ? 'bg-white shadow-sm z-10' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {recipient?.avatar ? <img src={recipient.avatar} alt={rName} className="w-full h-full object-cover" /> : rName[0]}
                          </div>
                          <Circle size={8} className="absolute -bottom-0.5 -right-0.5 fill-emerald-500 text-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate ${unreadCounts[c._id] > 0 ? 'font-extrabold text-slate-900' : 'font-bold text-slate-900'}`}>{rName}</p>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {unreadCounts[c._id] > 0 && (
                                <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                                  {unreadCounts[c._id] > 99 ? '99+' : unreadCounts[c._id]}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400">
                                {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 ${unreadCounts[c._id] > 0 ? 'font-semibold text-slate-700' : 'font-medium text-slate-500'}`}>
                            {c.lastMessage?.content || 'Started a conversation'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {active ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
                  {(() => {
                    const currentUserId = user?._id?.toString() || user?.id?.toString();
                    const recipient = getOtherParticipant(active.participants, currentUserId);
                    const rName = displayName(recipient);
                    const rRole = displayRole(recipient);
                    return (
                      <>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                          {recipient?.avatar ? <img src={recipient.avatar} alt={rName} className="w-full h-full object-cover" /> : rName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{rName}</p>
                          <p className="text-[11px] text-slate-500 truncate font-medium capitalize">{rRole}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                  {Array.isArray(messages) && messages.map(m => {
                    const currentUserId = user?._id || user?.id;
                    const isMe = m.sender?.toString() === currentUserId?.toString();
                    return (
                    <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-3 rounded-2xl text-xs font-medium shadow-sm ${
                          isMe
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                        }`}>
                          {m.attachment && (
                            <div className="mb-2 overflow-hidden rounded-lg">
                              {m.attachment.fileType?.startsWith('image/') ? (
                                <img 
                                  src={`${import.meta.env.VITE_API_DOMAIN}${m.attachment.url}`} 
                                  alt={m.attachment.name} 
                                  className="max-w-full h-auto max-h-60 object-cover cursor-pointer"
                                  onClick={() => window.open(`${import.meta.env.VITE_API_DOMAIN}${m.attachment.url}`, '_blank')}
                                />
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-emerald-600/20 border-emerald-400/30' : 'bg-slate-50 border-slate-100'}`}>
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-emerald-400' : 'bg-white shadow-sm'}`}>
                                    <FileText size={20} className={isMe ? 'text-white' : 'text-slate-400'} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-[10px] font-bold truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>{m.attachment.name}</p>
                                    <p className={`text-[9px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>File Attachment</p>
                                  </div>
                                  <a 
                                    href={`${import.meta.env.VITE_API_DOMAIN}${m.attachment.url}`} 
                                    download={m.attachment.name}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isMe ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-white hover:bg-slate-50 shadow-sm border border-slate-100'}`}
                                  >
                                    <Download size={14} className={isMe ? 'text-white' : 'text-emerald-600'} />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          {m.content && <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>}
                          <p className={`text-[9px] mt-1.5 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )})}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-slate-100 space-y-4 bg-white">
                  {selectedFile && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        {selectedFile.type.startsWith('image/') ? <ImageIcon size={20} className="text-emerald-500" /> : <FileText size={20} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-900 truncate">{selectedFile.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-tight">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedFile(null)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setShowEmojis(!showEmojis)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showEmojis ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                          <Smile size={20} />
                        </button>
                        {showEmojis && (
                          <div className="absolute bottom-12 left-0 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-1 z-50 min-w-[160px] animate-in slide-in-from-bottom-2">
                            {emojis.map(emoji => (
                              <button 
                                key={emoji} 
                                type="button"
                                onClick={() => { setMsg(prev => prev + emoji); setShowEmojis(false); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-lg transition-all"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                      >
                        <Paperclip size={20} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect} 
                      />
                    </div>

                    <input
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      className="flex-1 h-11 px-4 rounded-xl bg-slate-50 text-xs outline-none border border-slate-100 focus:border-emerald-300 focus:bg-white transition-all"
                      placeholder="Type your message here..."
                    />
                    <button 
                      type="submit"
                      disabled={(!msg.trim() && !selectedFile) || uploading}
                      className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle size={32} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">Select a conversation</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Choose someone to start chatting with.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {hoveredConv && createPortal(
      <div
        className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 pointer-events-none"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
          {hoveredConv.recipient?.avatar
            ? <img src={hoveredConv.recipient.avatar} alt={hoveredConv.rName} className="w-full h-full object-cover" />
            : hoveredConv.rName?.[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 whitespace-nowrap">{hoveredConv.rName}</p>
          <p className="text-[11px] text-slate-500 capitalize whitespace-nowrap">{hoveredConv.rRole}</p>
        </div>
      </div>,
      document.body
    )}
    </>
  );

  return Content;
};

export default Messages;
