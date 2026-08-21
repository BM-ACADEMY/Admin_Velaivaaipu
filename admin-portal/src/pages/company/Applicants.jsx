import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageSOPBanner from '@/components/common/PageSOPBanner';
import {
  Users,
  ChevronLeft,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Download,
  MessageSquare,
  Lock,
  Sparkles,
  BadgeCheck,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from '../../context/AuthContext';
import { hasFeature } from '@/components/subscription/FeatureGate';

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [calculatingMatch, setCalculatingMatch] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [inviteModal, setInviteModal] = useState({ open: false, applicationIds: [] });
  const [inviteForm, setInviteForm] = useState({ skill: '', date: '', deadline: '', link: '' });
  const [sendingInvite, setSendingInvite] = useState(false);

  const canExport = hasFeature(user, 'hasCandidateDBExport');

  const toggleSelected = (applicationId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(applicationId)) next.delete(applicationId);
      else next.add(applicationId);
      return next;
    });
  };

  const openInviteModal = (applicationIds) => {
    setInviteForm({ skill: '', date: '', deadline: '', link: '' });
    setInviteModal({ open: true, applicationIds });
  };

  const handleSendInvite = async () => {
    if (!inviteForm.skill || !inviteForm.link) {
      toast.error('Skill/role and test link are required');
      return;
    }
    setSendingInvite(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/applications/invite-assessment`, {
        applicationIds: inviteModal.applicationIds,
        ...inviteForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg || `Invited ${res.data.sent} candidate(s)`);
      setInviteModal({ open: false, applicationIds: [] });
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCalculateMatch = async (applicationId) => {
    try {
      setCalculatingMatch(prev => ({ ...prev, [applicationId]: true }));
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/applications/${applicationId}/calculate-match`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplicants(prev => prev.map(app => 
        app._id === applicationId ? { ...app, matchAnalysis: res.data.matchAnalysis } : app
      ));
      toast.success('AI Match Analysis Complete');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to calculate match');
    } finally {
      setCalculatingMatch(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/applications/export/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applicants-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Applicants exported to CSV');
      
      // Refresh user context to update purchased features / usageLeft
      await refreshUser();
    } catch (err) {
      console.error('Export error details:', err);
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json.msg || 'Export failed');
        } catch (parseErr) {
          toast.error('Export failed');
        }
      } else {
        toast.error(err.response?.data?.msg || 'Export failed');
      }
    } finally {
      setExporting(false);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/applications/${applicationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg);
      setApplicants(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDownloadResume = async (app) => {
    if (!app.applicant?.profile?.resumeUrl) {
      toast.error("No resume uploaded by this applicant");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/applications/${app._id}/track-download`);
      if (res.data.downloadsUsed !== undefined) {
        updateUser({ downloadsUsed: res.data.downloadsUsed });
      }

      const url = app.applicant.profile.resumeUrl.startsWith('http')
        ? app.applicant.profile.resumeUrl
        : `${API_DOMAIN}${app.applicant.profile.resumeUrl}`;
      const filename = app.applicant.profile.resumeName || `${app.applicant.name || 'resume'}.pdf`;

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to download resume");
    }
  };

  const handleStartConversation = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/messages/conversation`,
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/company/messages', { state: { conversationId: res.data._id } });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        toast.error(err.response.data?.msg || 'Messaging not available on your plan. Upgrade to message candidates.');
      } else {
        toast.error('Failed to start conversation');
      }
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const configs = {
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-100",
      rejected: "bg-rose-50 text-rose-700 border-rose-100",
      reviewed: "bg-emerald-50 text-emerald-700 border-emerald-100"
    };
    return configs[status] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      <PageSOPBanner pageKey="applicants" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 p-0 rounded-xl border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Talent Pipeline</h1>
            <p className="text-base text-slate-500 font-medium">Reviewing {applicants.length} candidates for this position</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              onClick={() => openInviteModal(Array.from(selectedIds))}
              className="rounded-xl border-emerald-200 bg-emerald-50 gap-2 font-bold text-xs text-emerald-700 h-10 px-4 shrink-0"
            >
              <Send size={14} />
              Invite Selected ({selectedIds.size})
            </Button>
          )}
          {canExport ? (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-xl border-slate-200 bg-white gap-2 font-bold text-xs text-slate-600 h-10 px-4 shrink-0"
              title="Export applicants to CSV"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export CSV
            </Button>
          ) : (
            <Link to="/company/subscription">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-slate-50 gap-2 font-bold text-xs text-slate-400 h-10 px-4 shrink-0 cursor-pointer hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                title="Upgrade your plan to export applicants as CSV"
              >
                <Lock size={13} />
                Export CSV
                <Sparkles size={12} className="text-emerald-400" />
              </Button>
            </Link>
          )}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 bg-white text-sm focus:border-emerald-300 focus:ring-emerald-100 transition-all"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white gap-2 font-bold text-xs uppercase tracking-widest text-slate-600 h-10 px-4">
                <Filter size={14} />
                {filter === 'all' ? 'All Tiers' : filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 border-slate-200 shadow-xl">
              <DropdownMenuItem onClick={() => setFilter('all')} className="rounded-lg font-bold text-xs uppercase tracking-widest py-2.5">All Applicants</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')} className="rounded-lg font-bold text-xs uppercase tracking-widest text-amber-600 py-2.5">Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('shortlisted')} className="rounded-lg font-bold text-xs uppercase tracking-widest text-emerald-600 py-2.5">Shortlisted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('rejected')} className="rounded-lg font-bold text-xs uppercase tracking-widest text-rose-600 py-2.5">Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredApplicants.map((app) => (
          <Card key={app._id} className="rounded-[24px] border-slate-200 shadow-sm hover:border-emerald-100 transition-all group overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Applicant Profile */}
                <div className="flex gap-5 lg:w-[30%]">
                  <Checkbox
                    checked={selectedIds.has(app._id)}
                    onCheckedChange={() => toggleSelected(app._id)}
                    className="mt-1 shrink-0"
                    title="Select for bulk actions"
                  />
                  <Avatar className="w-14 h-14 rounded-xl border border-slate-200 group-hover:border-emerald-100 transition-all">
                    <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-lg">
                      {app.applicant?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight truncate">
                        {app.applicant?.name}
                      </h4>
                      {app.applicant?.profileVerificationStatus === 'Verified' && (
                        <BadgeCheck size={16} className="text-blue-500 shrink-0" title="Verified Profile" />
                      )}
                      {app.isPriority && (
                        <BadgeCheck size={16} className="text-blue-500 fill-blue-50 shrink-0" title="Priority Application" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs truncate">
                        <Mail size={12} className="text-slate-300" />
                        {app.applicant?.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tight">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {/* AI Match Section */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 rounded-2xl p-4 border border-emerald-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-500" />
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">AI Match Analysis</h5>
                      </div>
                      {app.matchAnalysis && app.matchAnalysis.matchPercentage !== undefined ? (
                        <Badge className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-widest border-none ${app.matchAnalysis.matchPercentage >= 75 ? 'bg-emerald-100 text-emerald-700' : app.matchAnalysis.matchPercentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {app.matchAnalysis.matchPercentage}% Match
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCalculateMatch(app._id)}
                          disabled={calculatingMatch[app._id]}
                          className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          {calculatingMatch[app._id] ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                          {calculatingMatch[app._id] ? 'Calculating...' : 'Calculate'}
                        </Button>
                      )}
                    </div>
                    {app.matchAnalysis && app.matchAnalysis.matchPercentage !== undefined && (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {app.matchAnalysis.verdict}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {app.matchAnalysis.matchedSkills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">✓ {skill}</span>
                          ))}
                          {app.matchAnalysis.missingSkills?.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-rose-100 text-rose-500 rounded-md text-[9px] font-bold uppercase tracking-wider">× {skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Answers Section */}
                  {app.answers?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                      {app.answers?.slice(0, 2).map((ans, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{ans.questionText}</p>
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">{Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div className="lg:w-1/4 flex flex-col justify-between items-end gap-4">
                  <Badge className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest border-none ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => updateStatus(app._id, 'rejected')}
                      className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Decline"
                    >
                      <XCircle size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => updateStatus(app._id, 'shortlisted')}
                      className="w-10 h-10 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                      title="Shortlist"
                    >
                      <CheckCircle size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleStartConversation(app.applicant?._id)}
                      className="w-10 h-10 rounded-xl text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                      title="Message Candidate"
                    >
                      <MessageSquare size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => openInviteModal([app._id])}
                      className="w-10 h-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Invite to Assessment"
                    >
                      <Send size={20} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 border-slate-200 shadow-xl">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/candidate/profile/${app.applicant?._id}`)}
                          className="rounded-lg font-bold text-xs uppercase tracking-widest gap-2 py-2.5"
                        >
                          <ExternalLink size={14} /> Full Dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDownloadResume(app)}
                          className="rounded-lg font-bold text-xs uppercase tracking-widest gap-2 py-2.5"
                        >
                          <Download size={14} /> Extract Resume
                        </DropdownMenuItem>
                        <div className="h-px bg-slate-100 my-1" />
                        <DropdownMenuItem onClick={() => updateStatus(app._id, 'reviewed')} className="rounded-lg font-bold text-xs uppercase tracking-widest gap-2 py-2.5 text-emerald-600">
                          <CheckCircle size={14} /> Mark Reviewed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApplicants.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-[24px] shadow-sm">
            <Users className="w-12 h-12 text-slate-200 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Pipeline Empty</h3>
              <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                No candidates match your current search or status criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={inviteModal.open} onOpenChange={(open) => setInviteModal(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Assessment</DialogTitle>
            <DialogDescription>
              Sending to {inviteModal.applicationIds.length} candidate{inviteModal.applicationIds.length !== 1 ? 's' : ''} via WhatsApp and email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-skill">Skill / Role</Label>
              <Input
                id="invite-skill"
                placeholder="e.g. React.js"
                value={inviteForm.skill}
                onChange={(e) => setInviteForm(prev => ({ ...prev, skill: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-date">Test Date</Label>
                <Input
                  id="invite-date"
                  type="date"
                  value={inviteForm.date}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-deadline">Deadline</Label>
                <Input
                  id="invite-deadline"
                  type="date"
                  value={inviteForm.deadline}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-link">Test Link</Label>
              <Input
                id="invite-link"
                placeholder="https://..."
                value={inviteForm.link}
                onChange={(e) => setInviteForm(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModal({ open: false, applicationIds: [] })}>Cancel</Button>
            <Button onClick={handleSendInvite} disabled={sendingInvite} className="gap-2">
              {sendingInvite ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applicants;
