import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  RefreshCw, Search, Filter, ShieldCheck, Clock, AlertTriangle, Calendar,
  User, CheckCircle, XCircle, Award
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/shared/Pagination';

const ManageRenewals = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ active: 0, expiringSoon: 0, expired: 0, autoRenew: 0 });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchRenewals();
  }, [statusFilter, page]);

  useEffect(() => {
    setSelectedUserIds([]);
  }, [statusFilter, searchTerm]);

  const setStatusFilterAndResetPage = (s) => { setStatusFilter(s); setPage(1); };

  const handleSearchEnter = (e) => {
    if (e.key !== 'Enter') return;
    setPage(1);
    if (page === 1) fetchRenewals();
  };

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get(`${API_BASE_URL}/payments/admin/renewals`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setRenewals(res.data.renewals);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching renewals:', error);
      toast.error('Failed to load renewals data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(renewals.map(r => r._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendReminder = async () => {
    if (selectedUserIds.length === 0) return;
    setSendingReminder(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/payments/admin/renewals/send-reminder`, {
        userIds: selectedUserIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg || 'Reminders sent successfully');
      setSelectedUserIds([]);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send reminders');
    } finally {
      setSendingReminder(false);
    }
  };

  const getStatus = (expiry) => {
    if (!expiry) return 'lifetime';
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / 86400000);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'expiring_soon';
    return 'active';
  };

  const handleExtend = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/admin/users/${selectedUser._id}/extend-subscription`, {
        days: Number(extendDays)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Subscription extended successfully by ${extendDays} days`);
      setSelectedUser(null);
      fetchRenewals();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to extend subscription');
    } finally {
      setSaving(false);
    }
  };

  if (loading && renewals.length === 0 && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Retrieving active renewals ledger...</p>
      </div>
    );
  }

  const { active: activeCount, expiringSoon: expiringCount, expired: expiredCount, autoRenew: autoRenewCount } = stats;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Renewals & Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor upcoming renewals, active expiries, and auto-renew preferences.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group md:w-80 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search user or plan name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchEnter}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['all', 'active', 'expiring_soon', 'expired'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilterAndResetPage(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'all' && 'All'}
                {status === 'active' && `Active (${activeCount})`}
                {status === 'expiring_soon' && `Expiring (${expiringCount})`}
                {status === 'expired' && `Expired (${expiredCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Premium Users</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expiring Soon (7 Days)</p>
          <p className="text-2xl font-bold text-amber-500">{expiringCount}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expired (Needs Renewal)</p>
          <p className="text-2xl font-bold text-rose-500">{expiredCount}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auto-Renew Enabled</p>
          <p className="text-2xl font-bold text-indigo-600">
            {autoRenewCount}
          </p>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Details</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Plan</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Auto-Renew</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Time Left</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expiration Date</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renewals.length > 0 ? (
                renewals.map((r) => {
                  const status = getStatus(r.subscriptionExpiry);
                  const expiryDate = r.subscriptionExpiry ? new Date(r.subscriptionExpiry) : null;
                  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / 86400000) : null;

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-100">
                            <AvatarFallback className="text-slate-600 font-bold text-xs uppercase">
                              {r.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-slate-900 leading-tight">
                                {r.name}
                              </p>
                              {r.display_id && (
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-155 px-1 rounded">
                                  {r.display_id}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">
                              {r.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {r.subscription?.name || 'No Plan'}
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 capitalize">
                            {r.role?.name || r.role || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {r.autoRenew ? (
                          <Badge className="bg-indigo-50 text-indigo-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
                            <RefreshCw size={10} className="animate-spin duration-[4s]" /> Enabled
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-400 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
                            <XCircle size={10} /> Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {status === 'lifetime' ? (
                          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                            <Award size={13} /> Lifetime
                          </span>
                        ) : daysLeft !== null && daysLeft < 0 ? (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle size={13} /> Expired
                          </span>
                        ) : daysLeft !== null && daysLeft <= 7 ? (
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                            <Clock size={13} /> {daysLeft} days left
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-700">
                            {daysLeft} days
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {expiryDate ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {expiryDate.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              at {expiryDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button 
                          onClick={() => setSelectedUser(r)}
                          className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest inline-flex items-center gap-1.5"
                        >
                          <Calendar size={13} /> Extend
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <RefreshCw size={28} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-semibold">No renewal history matched</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} itemLabel="renewals" />
      </div>

      {/* Extension Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-6 bg-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Extend Expiry: {selectedUser.name}
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Extend subscription for {selectedUser.subscription?.name}.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Days to Extend</Label>
                <Input
                  type="number"
                  value={extendDays}
                  onChange={e => setExtendDays(e.target.value)}
                  min="1"
                  className="h-11 rounded-xl border-slate-200 text-sm font-bold"
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 font-medium leading-relaxed">
                The user's subscription will be extended from their current expiry date (or from today if expired).
              </div>
            </div>
            <DialogFooter className="mt-6 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setSelectedUser(null)} className="h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500">
                Cancel
              </Button>
              <Button onClick={handleExtend} disabled={saving} className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest">
                {saving && <RefreshCw size={13} className="animate-spin mr-1.5" />}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageRenewals;
