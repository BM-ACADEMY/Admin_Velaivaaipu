import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  RefreshCw, Search, ShieldCheck, Tag, CreditCard,
  User, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Pagination from '@/components/shared/Pagination';

const ManageBuyers = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState({ totalUniquePayers: 0, totalSpentAll: 0, avgOrderVal: 0 });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchBuyers();
  }, [roleFilter, page]);

  const setRoleFilterAndResetPage = (r) => { setRoleFilter(r); setPage(1); };

  const handleSearchEnter = (e) => {
    if (e.key !== 'Enter') return;
    setPage(1);
    if (page === 1) fetchBuyers();
  };

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 20 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get(`${API_BASE_URL}/payments/admin/buyers`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBuyers(res.data.buyers);
      setPages(res.data.pages);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to load buyers ledger data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && buyers.length === 0 && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Retrieving customer directory records...</p>
      </div>
    );
  }

  const { totalUniquePayers, totalSpentAll, avgOrderVal } = stats;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Buyers Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Audit customer purchase profiles, total lifetime spend, and purchase history.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        {/* Role filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/60 p-1 rounded-xl border border-slate-200/40 w-fit">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'jobseeker', label: 'Candidates' },
            { id: 'employer', label: 'Employers' },
            { id: 'college', label: 'Colleges' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilterAndResetPage(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                roleFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative group md:w-80 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search customers name or display ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchEnter}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:bg-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Unique Payers</p>
          <p className="text-2xl font-bold text-indigo-600">{totalUniquePayers}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime Billing Volume</p>
          <p className="text-2xl font-bold text-emerald-600">₹{totalSpentAll.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Customer Value (ACV)</p>
          <p className="text-2xl font-bold text-slate-900">₹{Math.round(avgOrderVal).toLocaleString()}</p>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Buyer Profile</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Spent</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Invoices</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Active Plan</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Order Date</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Transactions ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {buyers.length > 0 ? (
                buyers.map((b) => (
                  <tr key={b.user?._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-100">
                          <AvatarFallback className="text-slate-600 font-bold text-xs uppercase">
                            {b.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p 
                              onClick={() => b.user?._id && navigate(`/admin/subscriptions/buyers/${b.user._id}`)}
                              className="text-sm font-bold text-slate-900 leading-tight cursor-pointer hover:text-emerald-600 hover:underline transition-colors"
                            >
                              {b.user?.name || 'Deleted User'}
                            </p>
                            {b.user?.display_id && (
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1 rounded">
                                {b.user?.display_id}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">
                            {b.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">
                        ₹{b.totalSpent?.toLocaleString() || 0}
                      </p>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 rounded-md border-slate-100 text-slate-400 mt-1 w-fit">
                        Lifetime
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-800">
                        {b.transactionsCount} bills
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {b.lastPurchase?.plan?.name || 'N/A'}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 capitalize">
                          {b.user?.role || 'User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {b.lastPurchase ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {new Date(b.lastPurchase.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            by {b.lastPurchase.paymentMethod}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-[10px] text-slate-500">
                      {b.lastPurchase?.razorpay_payment_id || 'FREE'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <User size={28} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-semibold">No buyers match this filter query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={totalUniquePayers} onPageChange={setPage} itemLabel="buyers" />
      </div>
    </div>
  );
};

export default ManageBuyers;
