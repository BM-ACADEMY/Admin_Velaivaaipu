import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Check, X, Star, MessageSquareQuote, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/Pagination';

const API = import.meta.env.VITE_API_BASE_URL;

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [filter, page]);

  const setFilterAndResetPage = (f) => { setFilter(f); setPage(1); };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      params.set('page', page);
      params.set('limit', 20);

      const res = await axios.get(`${API}/reviews/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setProcessing(id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/reviews/admin/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Review ${status}`);
      setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error('Failed to update review status');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Approve or reject user testimonials for the homepage.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-wrap gap-2 items-center">
        <Filter size={16} className="text-slate-400 ml-2" />
        <div className="flex gap-1 ml-2 bg-slate-100 p-1 rounded-xl">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilterAndResetPage(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-500">
            No reviews found matching your filter.
          </div>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col h-full relative overflow-hidden group">
              {/* Status Ribbon */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-bl-xl ${
                r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                r.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {r.status}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <img 
                  src={r.user?.avatar ? `${API}${r.user.avatar}` : `https://ui-avatars.com/api/?name=${r.user?.name}&background=0D8ABC&color=fff`} 
                  alt={r.user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${r.user?.name}&background=0D8ABC&color=fff` }}
                />
                <div>
                  <p className="font-bold text-sm text-slate-900">{r.user?.name || 'Unknown User'}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-semibold text-slate-500 capitalize">{r.user?.role?.name || 'User'}</p>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r.user?.display_id || 'ID N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>

              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                <MessageSquareQuote size={20} className="absolute top-2 right-2 text-slate-200" />
                <p className="text-sm text-slate-700 italic pr-4">{r.comment}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateStatus(r._id, 'rejected')}
                    disabled={processing === r._id || r.status === 'rejected'}
                    className="h-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <X size={14} className="mr-1" /> Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateStatus(r._id, 'approved')}
                    disabled={processing === r._id || r.status === 'approved'}
                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check size={14} className="mr-1" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} itemLabel="reviews" />
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
