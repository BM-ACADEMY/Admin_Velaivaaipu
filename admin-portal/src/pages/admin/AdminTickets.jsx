import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Search, AlertCircle, CheckCircle2, RefreshCw,
  ChevronDown, ChevronUp, Save, X, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/shared/Pagination';

const API = import.meta.env.VITE_API_BASE_URL;

const CATEGORY_LABELS = {
  subscription_gating: 'Subscription & Plan Gating',
  payment_checkout: 'Payment Processing & Checkout',
  refunds_invoicing: 'Refunds & Invoicing',
  platform_errors: 'Core Features & Platform Errors',
  others: 'Others',
};

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed:      { label: 'Closed',      color: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const SEV_COLOR = { critical: 'text-red-600', major: 'text-amber-600', minor: 'text-blue-600' };

const AdminTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  // editState[ticketId] = { status, conclusion }
  const [editState, setEditState] = useState({});
  const [saving, setSaving] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, critical: 0 });

  useEffect(() => { fetchTickets(); }, [statusFilter, categoryFilter, severityFilter, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('limit', 20);
      const res = await axios.get(`${API}/tickets/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data.tickets);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setStats(res.data.stats);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Search only runs on Enter (not live-as-you-type); fetches page 1 directly rather than
  // relying on setPage(1) + the effect, since that would no-op (and skip the refetch) when
  // the user is already on page 1.
  const handleSearchEnter = (e) => {
    if (e.key !== 'Enter') return;
    setPage(1);
    if (page === 1) fetchTickets();
  };

  const setStatusFilterAndResetPage = (s) => { setStatusFilter(s); setPage(1); };
  const setCategoryFilterAndResetPage = (c) => { setCategoryFilter(c); setPage(1); };
  const setSeverityFilterAndResetPage = (sv) => { setSeverityFilter(sv); setPage(1); };

  // Open or create a conversation, auto-send ticket details, then navigate to messages
  const handleChat = async (ticket) => {
    const userId = ticket.user?._id;
    if (!userId) return;
    setChatLoading(userId);
    try {
      const token = localStorage.getItem('token');

      // 1. Get or create conversation
      const convRes = await axios.post(`${API}/messages/conversation`, { recipientId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conversationId = convRes.data._id;

      // 2. Build ticket summary message
      const sevEmoji = ticket.severity === 'critical' ? '🔴' : ticket.severity === 'major' ? '🟡' : '🔵';
      const statusLabel = STATUS_CONFIG[ticket.status]?.label || ticket.status;
      const raisedDate = new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      const diagLines = Object.entries(ticket.diagnostics || {})
        .filter(([, v]) => v)
        .map(([k, v]) => `  • ${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}`)
        .join('\n');

      const ticketSummary =
`📋 Ticket Reference: #${ticket._id.slice(-6).toUpperCase()}
──────────────────────────────
📁 Category: ${CATEGORY_LABELS[ticket.category] || ticket.category}
${sevEmoji} Severity: ${ticket.severity?.toUpperCase()}
🔖 Status: ${statusLabel}
📅 Raised On: ${raisedDate}
👤 Account: ${ticket.accountIdentity || '—'}
${
  diagLines
    ? `\n📊 Diagnostics Provided:\n${diagLines}`
    : ''
}
──────────────────────────────
Hi ${ticket.user?.name?.split(' ')[0] || 'there'}, our support team has reviewed your ticket. We're reaching out to assist you further. Please feel free to share any additional details here.`;

      // 3. Send the auto-message
      await axios.post(`${API}/messages`, {
        conversationId,
        content: ticketSummary
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. Navigate to messages with conversation pre-selected
      navigate('/admin/messages', { state: { conversationId } });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to open chat');
    } finally {
      setChatLoading(null);
    }
  };

  const handleUpdate = async (ticket) => {
    const edit = editState[ticket._id] || {};
    const newStatus = edit.status || ticket.status;
    const conclusion = edit.conclusion ?? ticket.conclusion ?? '';

    // Frontend validation: conclusion mandatory for resolve/close
    if (['resolved', 'closed'].includes(newStatus) && conclusion.trim().length < 10) {
      toast.error('Please provide a conclusion (min 10 characters) before resolving or closing this ticket.');
      return;
    }

    setSaving(ticket._id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/tickets/admin/${ticket._id}`, { status: newStatus, conclusion }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ticket updated');
      fetchTickets();
      setExpanded(null);
      setEditState(prev => { const n = { ...prev }; delete n[ticket._id]; return n; });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update ticket');
    } finally {
      setSaving(null);
    }
  };

  const setEdit = (id, field, value) =>
    setEditState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6 px-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and respond to all user-raised support requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets',  value: stats.total,      color: 'text-slate-800' },
          { label: 'Open',           value: stats.open,       color: 'text-blue-600' },
          { label: 'In Progress',    value: stats.inProgress, color: 'text-amber-600' },
          { label: 'Critical (P1)',  value: stats.critical,   color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
              placeholder="Search by name, email, ID…"
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
              <button key={s} onClick={() => setStatusFilterAndResetPage(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Severity */}
          <select value={severityFilter} onChange={e => setSeverityFilterAndResetPage(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="major">🟡 Major</option>
            <option value="minor">🔵 Minor</option>
          </select>

          {/* Category */}
          <select value={categoryFilter} onChange={e => setCategoryFilterAndResetPage(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No tickets match your filters.</p>
          </div>
        ) : tickets.map(t => {
          const isOpen = expanded === t._id;
          const edit = editState[t._id] || {};
          const stCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
          const currentStatus = edit.status || t.status;
          const needsConclusion = ['resolved', 'closed'].includes(currentStatus);
          const currentConclusion = edit.conclusion ?? t.conclusion ?? '';

          return (
            <div key={t._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : t._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${stCfg.color}`}>{stCfg.label}</span>
                    <span className={`text-[10px] font-bold uppercase ${SEV_COLOR[t.severity]}`}>
                      {t.severity === 'critical' ? '🔴' : t.severity === 'major' ? '🟡' : '🔵'} {t.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">#{t._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="font-bold text-sm text-slate-800">{CATEGORY_LABELS[t.category]}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-600">{t.user?.name || '—'}</span>
                    {t.user?.email && ` · ${t.user.email}`}
                    {' · '}{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {/* Show conclusion if already set */}
                  {t.conclusion && (
                    <p className="mt-2 text-xs text-slate-600 bg-emerald-50 rounded-lg px-3 py-1.5 border-l-2 border-emerald-400 w-fit max-w-full">
                      <span className="font-semibold text-emerald-700">Conclusion: </span>{t.conclusion}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Chat Button */}
                  {t.user?._id && (
                    <button
                      onClick={e => { e.stopPropagation(); handleChat(t); }}
                      disabled={chatLoading === t.user._id}
                      title={`Chat with ${t.user.name}`}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {chatLoading === t.user._id
                        ? <RefreshCw size={13} className="animate-spin" />
                        : <MessageCircle size={13} />
                      }
                      Chat
                    </button>
                  )}
                  <div className="text-slate-400 mt-0.5">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50/30">
                  {/* Diagnostics */}
                  {Object.keys(t.diagnostics || {}).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnostics Provided</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(t.diagnostics).map(([k, v]) => v ? (
                          <div key={k} className="bg-white rounded-xl border border-slate-200 p-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs font-semibold text-slate-700 break-words">{v}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Diagnostics Consent:</span> {t.diagnosticsConsent ? '✅ Granted' : '❌ Not Granted'}
                  </p>

                  {/* Admin Controls */}
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</label>
                      <select
                        value={currentStatus}
                        onChange={e => setEdit(t._id, 'status', e.target.value)}
                        className="w-full sm:w-56 h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    </div>

                    {/* Conclusion – always shown, required when resolving/closing */}
                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ${needsConclusion ? 'text-rose-500' : 'text-slate-400'}`}>
                        Conclusion Message{needsConclusion && <span className="ml-1 text-rose-500">* (required to resolve/close)</span>}
                      </label>
                      <textarea
                        value={currentConclusion}
                        onChange={e => setEdit(t._id, 'conclusion', e.target.value)}
                        placeholder={needsConclusion
                          ? 'Provide a clear resolution summary before marking as resolved or closed…'
                          : 'Optional conclusion or progress update…'}
                        rows={3}
                        className={`w-full p-3 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2 transition-all ${
                          needsConclusion && currentConclusion.trim().length < 10
                            ? 'border-rose-300 bg-rose-50 focus:ring-rose-400/20 focus:border-rose-400'
                            : 'border-slate-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
                        }`}
                      />
                      {needsConclusion && currentConclusion.trim().length < 10 && (
                        <p className="text-xs text-rose-500 font-medium">
                          {currentConclusion.trim().length === 0
                            ? 'Conclusion is required when resolving or closing.'
                            : `${10 - currentConclusion.trim().length} more characters needed.`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <Button variant="outline" size="sm"
                      onClick={() => { setExpanded(null); setEditState(prev => { const n = {...prev}; delete n[t._id]; return n; }); }}
                      className="rounded-xl">
                      <X size={13} className="mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate(t)} disabled={saving === t._id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      <Save size={13} className="mr-1" /> {saving === t._id ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} itemLabel="tickets" />
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
