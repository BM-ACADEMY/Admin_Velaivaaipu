import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  RefreshCw, Search, CheckCircle, XCircle, AlertTriangle, Shield,
  User, DollarSign, Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const ManageRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/payments/admin/refunds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefunds(res.data);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('Failed to load refunds data');
    } finally {
      setLoading(false);
    }
  };

  const [confirmAction, setConfirmAction] = useState(null); // { id, type: 'approve' | 'reject' }

  const handleApprove = (id) => setConfirmAction({ id, type: 'approve' });
  const handleReject = (id) => setConfirmAction({ id, type: 'reject' });

  const runConfirmedAction = async () => {
    const { id, type } = confirmAction;
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/payments/admin/refunds/${id}/${type}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(type === 'approve' ? 'Refund approved and subscription revoked' : 'Refund request rejected');
      setConfirmAction(null);
      fetchRefunds();
    } catch (error) {
      toast.error(error.response?.data?.msg || `Failed to ${type} refund`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRefunds = refunds.filter(r => {
    const nameMatch = r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!nameMatch) return false;

    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Retrieving refunds ledger...</p>
      </div>
    );
  }

  const pendingCount = refunds.filter(r => r.status === 'refund_pending').length;
  const refundedCount = refunds.filter(r => r.status === 'refunded').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refund / Approvals Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Review, approve, or reject pending subscription refund requests.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group md:w-80 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search user, plan, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['all', 'refund_pending', 'refunded'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'all' && 'All'}
                {status === 'refund_pending' && `Pending (${pendingCount})`}
                {status === 'refunded' && `Refunded (${refundedCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Refunded</p>
          <p className="text-2xl font-bold text-emerald-600">{refundedCount}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Refunded Amount</p>
          <p className="text-2xl font-bold text-slate-900">
            ₹{refunds.filter(r => r.status === 'refunded').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">User / Account</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan Purchased</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction ID</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Refund Amount</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-100">
                          <AvatarFallback className="text-slate-600 font-bold text-xs uppercase">
                            {r.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {r.user?.name || 'Deleted User'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">
                            {r.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {r.plan?.name || 'N/A'}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 capitalize">
                          {r.user?.role || 'User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                          {r.razorpay_payment_id || 'FREE'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Method: {r.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">
                        ₹{r.amount?.toLocaleString() || 0}
                      </p>
                      <span className="text-[9px] text-slate-400 font-medium uppercase">INR</span>
                    </td>
                    <td className="px-6 py-5">
                      {r.status === 'refund_pending' ? (
                        <Badge className="bg-amber-50 text-amber-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> Pending Approval
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
                          <CheckCircle size={10} /> Refunded
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {r.status === 'refund_pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleReject(r._id)}
                            disabled={processingId === r._id}
                            variant="outline"
                            className="h-9 px-3 rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprove(r._id)}
                            disabled={processingId === r._id}
                            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                          >
                            {processingId === r._id && <RefreshCw size={12} className="animate-spin mr-1" />}
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end text-right">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            Approved
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            {new Date(r.updatedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={28} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-semibold">No refund request matches found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === 'approve' ? 'Approve this refund request?' : 'Reject this refund request?'}
        description={
          confirmAction?.type === 'approve'
            ? 'This will mark the transaction as refunded and set the user back to the Free plan.'
            : 'This will mark the transaction as completed again.'
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        destructive={confirmAction?.type === 'reject'}
        loading={processingId === confirmAction?.id}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
};

export default ManageRefunds;
