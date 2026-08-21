import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { GraduationCap, CheckCircle2, XCircle, Clock, FileText, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/shared/Pagination';

const statusStyles = {
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-700',
};

const CollegeVerification = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/college/admin/all-colleges`, { params });
      setColleges(res.data.colleges);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchColleges(); }, [page]);

  const handleSearchEnter = (e) => {
    if (e.key !== 'Enter') return;
    setPage(1);
    if (page === 1) fetchColleges();
  };

  const act = async (collegeId, status) => {
    setActing(collegeId);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/college/admin/verify/${collegeId}`, { status });
      toast.success(`College marked as ${status}`);
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap size={20} className="text-emerald-600" /> College KYC Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Verify uploaded proof documents before a college's drives become publicly reachable.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchEnter} placeholder="Search by name or code..." className="pl-10 h-10 rounded-xl" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full" /></div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No colleges found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {colleges.map(c => (
            <div key={c._id} className="flex flex-col md:flex-row md:items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyles[c.verificationStatus] || statusStyles.pending}`}>{c.verificationStatus}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.code} · TPO: {c.tpoUser?.name} ({c.tpoUser?.email}) · {c.collegeEmail || '—'} · {c.collegePhone || '—'}</p>
                {c.proofDocumentUrl && (
                  <a
                    href={c.proofDocumentUrl.startsWith('http') ? c.proofDocumentUrl : `${import.meta.env.VITE_API_DOMAIN}${c.proofDocumentUrl}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline mt-1"
                  >
                    <FileText size={12} /> View Proof Document
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => navigate(`/admin/colleges/${c._id}`)} className="rounded-lg text-xs font-bold gap-1 h-9 text-slate-600 border-slate-200 hover:bg-slate-50">
                  <Eye size={13} /> View
                </Button>
                <Button size="sm" disabled={acting === c._id || c.verificationStatus === 'verified'} onClick={() => act(c._id, 'verified')} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 h-9">
                  <CheckCircle2 size={13} /> Verify
                </Button>
                <Button size="sm" variant="outline" disabled={acting === c._id || c.verificationStatus === 'rejected'} onClick={() => act(c._id, 'rejected')} className="rounded-lg text-xs font-bold gap-1 h-9 border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle size={13} /> Reject
                </Button>
                {c.verificationStatus !== 'pending' && (
                  <Button size="sm" variant="outline" disabled={acting === c._id} onClick={() => act(c._id, 'pending')} className="rounded-lg text-xs font-bold gap-1 h-9">
                    <Clock size={13} /> Reset
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} itemLabel="colleges" />
        </div>
      )}
    </div>
  );
};

export default CollegeVerification;
