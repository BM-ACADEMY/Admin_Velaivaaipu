import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusStyles = {
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-700',
};

const CollegeKycDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchCollege = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/college/admin/colleges/${id}`);
      setCollege(res.data);
    } catch {
      toast.error('College not found');
      navigate('/admin/colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollege(); }, [id]);

  const act = async (status) => {
    setActing(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/college/admin/verify/${college._id}`, { status });
      toast.success(`College marked as ${status}`);
      setCollege({ ...college, verificationStatus: status });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!college) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 py-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/colleges')} className="w-10 h-10 p-0 rounded-xl border-slate-200">
          <ArrowLeft size={18} className="text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-emerald-600" /> College KYC Details
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Review and verify college documents</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{college.name}</h2>
            <p className="text-sm text-slate-500 mt-1">Code: {college.code}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${statusStyles[college.verificationStatus] || statusStyles.pending}`}>
            {college.verificationStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TPO Contact</p>
            <p className="text-sm font-semibold text-slate-800">{college.tpoUser?.name}</p>
            <p className="text-sm text-slate-500">{college.tpoUser?.email}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">College Contact</p>
            <p className="text-sm font-semibold text-slate-800">{college.collegeEmail || '—'}</p>
            <p className="text-sm text-slate-500">{college.collegePhone || '—'}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">University</p>
            <p className="text-sm font-semibold text-slate-800">{college.university || '—'}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</p>
            <p className="text-sm font-semibold text-slate-800">{college.location || '—'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Proof Document</h3>
          {college.proofDocumentUrl ? (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <FileText size={48} className="text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Document Uploaded</p>
                <p className="text-xs text-slate-500 mt-1">Review the document to verify the college's authenticity.</p>
              </div>
              <a
                href={college.proofDocumentUrl.startsWith('http') ? college.proofDocumentUrl : `${import.meta.env.VITE_API_DOMAIN}${college.proofDocumentUrl}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <FileText size={16} /> Open Document
              </a>
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic bg-slate-50 p-8 rounded-xl text-center border border-dashed border-slate-200">
              No proof document uploaded yet
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
          <Button disabled={acting || college.verificationStatus === 'verified'} onClick={() => act('verified')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold gap-2 px-6 h-11">
            <CheckCircle2 size={16} /> Verify College
          </Button>
          <Button variant="outline" disabled={acting || college.verificationStatus === 'rejected'} onClick={() => act('rejected')} className="rounded-xl text-sm font-bold gap-2 px-6 h-11 border-red-200 text-red-600 hover:bg-red-50">
            <XCircle size={16} /> Reject
          </Button>
          {college.verificationStatus !== 'pending' && (
            <Button variant="outline" disabled={acting} onClick={() => act('pending')} className="rounded-xl text-sm font-bold gap-2 px-6 h-11">
              <Clock size={16} /> Reset Status
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeKycDetails;
