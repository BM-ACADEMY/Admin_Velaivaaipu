import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  X, UserCheck, Loader2, AlertCircle, CheckCircle2, Send, Clock, Layout, Users, Star, Mic, ClipboardList,
  RefreshCw, Search, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const API = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

const TYPE_CONFIG = {
  counselling:    { label: 'Career Counselling', icon: Star,         color: 'bg-rose-50 text-rose-700 border-rose-200' },
  mock_interview: { label: 'Mock Interview',     icon: Mic,          color: 'bg-teal-50 text-teal-700 border-teal-200' },
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Assigned',  color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

/* ─── Assign Modal ──────────────────────────────────────────────────────────── */
const AssignModal = ({ request, onClose, onAssigned }) => {
  const [assignees, setAssignees]   = useState([]);
  const [search, setSearch]         = useState('');
  const [selectedPool, setSelectedPool] = useState([]);
  const [notes, setNotes]           = useState(request.adminNotes || '');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/requests/admin/assignees`, { headers: authHeader() })
      .then(r => setAssignees(r.data))
      .catch(() => toast.error('Failed to load assignees'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assignees.filter(a =>
    (a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.companyName?.toLowerCase().includes(search.toLowerCase())) &&
    a.role !== 'company'
  );

  const handleAssign = async () => {
    if (selectedPool.length === 0) { toast.error('Please select at least one recruiter or company'); return; }
    setSubmitting(true);
    try {
      await axios.patch(
        `${API}/requests/admin/${request._id}/assign`,
        { assignedToPool: selectedPool.map(s => s._id), adminNotes: notes },
        { headers: authHeader() }
      );
      toast.success(`Assigned to ${selectedPool.length} professional(s)`);
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to assign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Assign Request</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {request.user?.name} — {TYPE_CONFIG[request.type]?.label}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Seeker details summary */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600 space-y-0.5">
          {request.type === 'counselling' && (
            <>
              <p><span className="font-bold text-slate-700">Date:</span> {request.bookingDate} at {request.bookingTime}</p>
              <p><span className="font-bold text-slate-700">Phone:</span> {request.bookingPhone || '—'}</p>
              {request.qualification && <p><span className="font-bold text-slate-700">Edu:</span> {request.qualification} ({request.major})</p>}
              {request.workExperience && <p><span className="font-bold text-slate-700">Exp:</span> {request.workExperience}</p>}
              {request.notes && <p><span className="font-bold text-slate-700">Notes:</span> {request.notes}</p>}
            </>
          )}
          {request.type === 'mock_interview' && (
            <>
              <p><span className="font-bold text-slate-700">Skills:</span> {request.skills}</p>
              <p><span className="font-bold text-slate-700">Goal:</span> {request.careerGoal}</p>
              <p><span className="font-bold text-slate-700">Date:</span> {request.mockInterviewDate} at {request.mockInterviewTime}</p>
            </>
          )}
          {request.type === 'website_request' && (
            <>
              <p><span className="font-bold text-slate-700">Website Details:</span> {request.websiteDetails}</p>
              <p><span className="font-bold text-slate-700">Goal:</span> {request.websiteGoal}</p>
              <p><span className="font-bold text-slate-700">Audience:</span> {request.targetAudience}</p>
            </>
          )}
        </div>

        {/* Search assignees */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recruiters or companies…"
            className="pl-8 rounded-xl border-slate-200 text-sm h-9"
          />
        </div>

        {/* Assignee list */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-4 max-h-52 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-medium">No recruiters or companies found.</p>
          ) : (
            filtered.map(a => (
              <button
                key={a._id}
                onClick={() => setSelectedPool(prev => prev.find(p => p._id === a._id) ? prev.filter(p => p._id !== a._id) : [...prev, a])}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-slate-50 last:border-0 ${
                  selectedPool.find(p => p._id === a._id) ? 'bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  selectedPool.find(p => p._id === a._id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {a.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{a.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{a.companyName || a.email}</p>
                </div>
                <Badge className={`text-[9px] font-bold px-2 py-0 border-none shrink-0 ${
                  (a.role?.name || a.role) === 'company' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {a.role?.name || a.role}
                </Badge>
                {selectedPool.find(p => p._id === a._id) && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
              </button>
            ))
          )}
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
            Notes for Assignee (optional)
          </label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add context or instructions…"
            className="rounded-xl border-slate-200 text-sm resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl text-xs font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={submitting || selectedPool.length === 0}
            className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold gap-1.5"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {submitting ? 'Assigning…' : 'Assign'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Status / Notes modal ──────────────────────────────────────────────────── */
const UpdateModal = ({ request, onClose, onUpdated }) => {
  const [status, setStatus]         = useState(request.status);
  const [notes, setNotes]           = useState(request.adminNotes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await axios.patch(
        `${API}/requests/admin/${request._id}`,
        { status, adminNotes: notes },
        { headers: authHeader() }
      );
      toast.success('Request updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-900">Update Request</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 text-sm h-9 px-3 focus:outline-none focus:border-emerald-400"
            >
              <option value="pending">Pending</option>
              <option value="approved">Assigned / Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes visible to the seeker…"
              className="rounded-xl border-slate-200 text-sm resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl text-xs font-bold">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'all',             label: 'All' },
  { key: 'counselling',     label: 'Career Counselling' },
  { key: 'mock_interview',  label: 'Mock Interviews' },
];

const STATUS_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'approved',  label: 'Assigned' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ManageRequests = () => {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [typeTab, setTypeTab]       = useState('all');
  const [statusTab, setStatusTab]   = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [assignTarget, setAssignTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [viewReq, setViewReq] = useState(null);
  const [viewPoolReq, setViewPoolReq] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeTab !== 'all') params.type = typeTab;
      if (statusTab !== 'all') params.status = statusTab;
      const res = await axios.get(`${API}/requests/admin`, { headers: authHeader(), params });
      setRequests(res.data);
      setPage(1);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [typeTab, statusTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      r.bookingName?.toLowerCase().includes(q) ||
      r.skills?.toLowerCase().includes(q) ||
      r.websiteDetails?.toLowerCase().includes(q) ||
      r.jobId?.title?.toLowerCase().includes(q) ||
      r.companyName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = {
    pending:   requests.filter(r => r.status === 'pending').length,
    approved:  requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Modals */}
      {assignTarget && (
        <AssignModal
          request={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={fetchRequests}
        />
      )}
      {updateTarget && (
        <UpdateModal
          request={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchRequests}
        />
      )}

      {/* View Details Modal */}
      {viewReq && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Request Details</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">User Name</p>
                  <p className="font-medium">{viewReq.user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="font-medium truncate" title={viewReq.user?.email}>{viewReq.user?.email}</p>
                </div>
              </div>
              
              {viewReq.type === 'counselling' && (
                <div className="space-y-2">
                  <p><span className="font-bold">Date & Time:</span> {viewReq.bookingDate} at {viewReq.bookingTime}</p>
                  {viewReq.bookingPhone && <p><span className="font-bold">Phone:</span> {viewReq.bookingPhone}</p>}
                  {viewReq.qualification && <p><span className="font-bold">Qualification:</span> {viewReq.qualification}</p>}
                  {viewReq.major && <p><span className="font-bold">Major:</span> {viewReq.major}</p>}
                  {viewReq.workExperience && <p><span className="font-bold">Work Exp:</span> {viewReq.workExperience}</p>}
                  {viewReq.notes && (
                    <div>
                      <p className="font-bold mb-1">Notes / Goals:</p>
                      <div className="bg-slate-50 p-3 rounded-xl text-xs">{viewReq.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {viewReq.type === 'mock_interview' && (
                <div className="space-y-2">
                  <p><span className="font-bold">Skills:</span> {viewReq.skills}</p>
                  {viewReq.careerGoal && <p><span className="font-bold">Career Goal:</span> {viewReq.careerGoal}</p>}
                  <p><span className="font-bold">Date & Time:</span> {viewReq.mockInterviewDate} at {viewReq.mockInterviewTime}</p>
                </div>
              )}

              {viewReq.adminNotes && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800">
                  <p className="font-bold text-xs mb-1">Additional Notes / Instructions:</p>
                  <p className="whitespace-pre-wrap">{viewReq.adminNotes}</p>
                </div>
              )}

              {viewReq.status === 'approved' && !viewReq.selectedSlot && viewReq.slot1Date && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                  <p className="font-bold text-xs mb-2">Suggested Slots (Awaiting Seeker Selection):</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="p-2 bg-white rounded border border-amber-100">
                      <span className="font-bold">Slot 1:</span> {viewReq.slot1Date} at {viewReq.slot1StartTime} - {viewReq.slot1EndTime}
                    </div>
                    {viewReq.slot2Date && (
                      <div className="p-2 bg-white rounded border border-amber-100">
                        <span className="font-bold">Slot 2:</span> {viewReq.slot2Date} at {viewReq.slot2StartTime} - {viewReq.slot2EndTime}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewReq.status === 'approved' && viewReq.selectedSlot && viewReq.meetingDate && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                  <p className="font-bold text-xs mb-2">Confirmed Meeting Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-bold block text-emerald-700">Date</span>{viewReq.meetingDate}</div>
                    <div><span className="font-bold block text-emerald-700">Time</span>{viewReq.meetingStartTime} - {viewReq.meetingEndTime}</div>
                    {viewReq.meetingLink && (
                      <div className="col-span-2">
                        <span className="font-bold block text-emerald-700">Meeting Link</span>
                        <a href={viewReq.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{viewReq.meetingLink}</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewReq(null)} variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Pool Modal */}
      {viewPoolReq && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Invited Professionals</h3>
            <p className="text-xs text-slate-500 mb-4">The following professionals have been invited to accept this request.</p>
            <div className="space-y-2">
              {viewPoolReq.assignedToPool.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase truncate max-w-[200px]">{p.display_id || p.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white">Invited</Badge>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewPoolReq(null)} variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Session Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Career counselling and mock interview requests from seekers.</p>
        </div>
        <button
          onClick={fetchRequests}
          className="self-start sm:self-auto text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-100"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'pending',   label: 'Pending',   color: 'bg-amber-50 border-amber-100',    text: 'text-amber-700',   icon: Clock },
          { key: 'approved',  label: 'Assigned',  color: 'bg-blue-50 border-blue-100',      text: 'text-blue-700',    icon: UserCheck },
          { key: 'completed', label: 'Completed', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
          { key: 'cancelled', label: 'Cancelled', color: 'bg-red-50 border-red-100',         text: 'text-red-700',     icon: AlertCircle },
        ].map(({ key, label, color, text, icon: Icon }) => (
          <div key={key} className={`rounded-xl border ${color} px-4 py-3 flex items-center gap-3`}>
            <Icon size={16} className={text} />
            <div>
              <p className={`text-lg font-bold ${text}`}>{counts[key]}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTypeTab(t.key); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                typeTab === t.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status tabs + search */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {STATUS_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setStatusTab(t.key); setPage(1); }}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  statusTab === t.key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-52 shrink-0">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search seeker…"
              className="pl-8 rounded-xl border-slate-200 text-xs h-8"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">No requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Seeker</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Details</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                  <th className="text-left py-2.5 px-3 font-bold text-slate-500 uppercase tracking-widest">Submitted</th>
                  <th className="py-2.5 px-3" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map(r => {
                  const typeCfg   = TYPE_CONFIG[r.type]   || TYPE_CONFIG.counselling;
                  const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  const TypeIcon  = typeCfg.icon;
                  return (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      {/* Seeker */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 truncate max-w-[120px]">{r.user?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{r.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeCfg.color}`}>
                          <TypeIcon size={9} /> {typeCfg.label}
                        </span>
                      </td>
                      {/* Details */}
                      <td className="py-3 px-3 text-slate-600 max-w-[200px]">
                        {r.type === 'counselling' && (
                          <>
                            <span className="truncate block font-semibold">{r.bookingDate} at {r.bookingTime}</span>
                            {r.qualification && <span className="truncate block text-[10px]">Edu: {r.qualification}</span>}
                            {r.workExperience && <span className="truncate block text-[10px]">Exp: {r.workExperience}</span>}
                          </>
                        )}
                        {r.type === 'mock_interview' && (
                          <span className="truncate block">{r.skills} - {r.mockInterviewDate} {r.mockInterviewTime}</span>
                        )}
                        {r.type === 'website_request' && (
                          <span className="truncate block">{r.websiteDetails}</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      {/* Assigned To */}
                      <td className="py-3 px-3">
                        {r.assignedTo ? (
                          <div>
                            <p className="font-bold text-slate-700 truncate max-w-[130px]">{r.assignedTo.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase">{r.assignedTo.display_id || ''}</p>
                          </div>
                        ) : r.assignedToPool?.length > 0 ? (
                          <button onClick={() => setViewPoolReq(r)} className="text-blue-500 hover:text-blue-600 hover:underline italic text-[10px] font-medium">Pending (Pool: {r.assignedToPool.length})</button>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      {/* Submitted */}
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewReq(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                          >
                            <Eye size={11} /> View
                          </button>
                          {r.status !== 'cancelled' && r.status !== 'completed' && (
                            <button
                              onClick={() => setAssignTarget(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              <UserCheck size={11} /> {r.assignedTo ? 'Reassign' : 'Assign'}
                            </button>
                          )}
                          <button
                            onClick={() => setUpdateTarget(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${
                    n === safePage ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRequests;
