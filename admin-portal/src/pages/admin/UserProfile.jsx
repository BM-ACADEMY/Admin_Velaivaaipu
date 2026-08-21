import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, User as UserIcon,
  FileText, ExternalLink, Globe, GraduationCap, Building2,
  Calendar, Loader2, ShieldCheck, ShieldAlert, Layers, Star,
  MessageSquare, Clock, DollarSign, Target, BadgeCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Field = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{label}</Label>
      <div className="flex items-center gap-3 py-2 border-b border-slate-100 group">
        <Icon size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
        <span className="text-sm font-semibold text-slate-700">{value}</span>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6">{children}</h3>
);

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Strip /api suffix from base URL to get the server root
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const openFile = (e, url) => {
  e.preventDefault();
  const resolved = resolveUrl(url);
  if (resolved) window.open(resolved, '_blank', 'noopener,noreferrer');
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleOpenApplications = () => {
    const el = document.getElementById('applications-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        if (res.data.role?.name === 'jobseeker') {
          fetchApplications();
        }
      } catch (err) {
        toast.error('Failed to load user profile');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleToggleBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.msg);
      setUser(prev => ({ ...prev, isAdminBlocked: res.data.isAdminBlocked }));
    } catch {
      toast.error('Failed to update block status');
    }
  };

  const handleStartConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/messages/conversation`,
        { recipientId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/messages', { state: { conversationId: res.data._id } });
    } catch (err) {
      console.error('Start conversation error:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to start conversation';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const role = user.role?.name;
  const isJobseeker = role === 'jobseeker';
  const isRecruiter = role === 'recruiter' || role === 'company';
  const p = user.profile || {};
  const rp = user.recruiterProfile || {};

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Back nav */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Identity Directory
      </button>

      {/* Hero card */}
      <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-10 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Avatar className="h-24 w-24 rounded-[20px] border-2 border-white shadow-md bg-white p-1">
                <AvatarImage src={user.avatar} className="rounded-[16px]" />
                <AvatarFallback className="bg-emerald-50 text-emerald-600 text-3xl font-bold rounded-[16px] uppercase">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                  {user?.profileVerificationStatus === 'Verified' && (
                    <BadgeCheck size={20} className="text-blue-500 shrink-0" title="Verified Profile" />
                  )}
                  {user.display_id && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black tracking-wider px-2 py-0.5">
                      {user.display_id}
                    </Badge>
                  )}
                  {user.isAdminBlocked && (
                    <Badge className="bg-red-50 text-red-600 border-red-100 text-[9px] font-bold uppercase">Blocked</Badge>
                  )}
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold uppercase">
                    {role}
                  </Badge>
                  <Badge className={user.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'}>
                    <span className="text-[9px] font-bold uppercase">{user.isVerified ? 'Verified' : 'Pending'}</span>
                  </Badge>
                </div>
                {p.headline && <p className="text-sm font-medium text-slate-500">{p.headline}</p>}
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Mail size={13} className="text-slate-400" /> {user.email}
                  </span>
                  {p.location && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <MapPin size={13} className="text-slate-400" /> {p.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Calendar size={13} className="text-slate-400" />
                    Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isJobseeker && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenApplications}
                  className="rounded-xl h-10 px-5 font-bold text-xs border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all gap-2"
                >
                  <Briefcase size={14} /> Applied Jobs
                </Button>
              )}
              {isRecruiter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/jobs?recruiter=${id}`)}
                  className="rounded-xl h-10 px-5 font-bold text-xs border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all gap-2"
                >
                  <Briefcase size={14} /> Posted Jobs
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartConversation}
                className="rounded-xl h-10 px-5 font-bold text-xs border-slate-200 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all gap-2"
              >
                <MessageSquare size={14} /> Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBlock}
                className={`rounded-xl h-10 px-5 font-bold text-xs transition-all gap-2 ${
                  user.isAdminBlocked
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                }`}
              >
                {user.isAdminBlocked ? <><ShieldCheck size={14} /> Unblock</> : <><ShieldAlert size={14} /> Block</>}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile completion bar */}
        {p.profileCompletion > 0 && (
          <div className="px-10 py-4 border-b border-slate-50 flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Profile Completion</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${p.profileCompletion}%` }} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 tabular-nums">{p.profileCompletion}%</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Information */}
          <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
            <SectionTitle>Personal Information</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field icon={UserIcon} label="Full Name" value={user.name} />
              <Field icon={Mail} label="Email" value={user.email} />
              <Field icon={Phone} label="Phone" value={p.phone} />
              <Field icon={MapPin} label="Location" value={p.location} />
              {isRecruiter && <Field icon={Phone} label="Recruiter Phone" value={rp.phone} />}
              {isRecruiter && <Field icon={MapPin} label="Recruiter Location" value={rp.location} />}
              {isRecruiter && <Field icon={Briefcase} label="Job Title" value={rp.jobTitle} />}
            </div>
            {(p.bio || rp.bio) && (
              <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Bio</Label>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{p.bio || rp.bio}</p>
              </div>
            )}
          </Card>

          {/* Skills */}
          {(p.skills?.length > 0 || rp.skills?.length > 0) && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {(p.skills?.length > 0 ? p.skills : rp.skills).map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Qualification */}
          {p.qualification?.length > 0 && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-5">
                {p.qualification.map((q, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{q.degree}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{q.institution}</p>
                      {q.year && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">{q.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Experience */}
          {(p.experience?.length > 0 || rp.experience?.length > 0) && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
              <SectionTitle>Experience</SectionTitle>
              <div className="space-y-5">
                {(p.experience?.length > 0 ? p.experience : rp.experience).map((exp, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{exp.role || exp.position}</p>
                        {exp.duration && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{exp.duration}</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{exp.company}</p>
                      {exp.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Job Preferences - jobseeker only */}
          {isJobseeker && p.jobPreferences && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
              <SectionTitle>Job Preferences</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {p.jobPreferences.jobTitles?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Target size={11} /> Desired Roles</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {p.jobPreferences.jobTitles.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {p.jobPreferences.locationTypes?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><MapPin size={11} /> Work Mode</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {p.jobPreferences.locationTypes.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {p.jobPreferences.employmentTypes?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Briefcase size={11} /> Employment Type</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {p.jobPreferences.employmentTypes.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {p.jobPreferences.expectedSalary && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><DollarSign size={11} /> Expected Salary</Label>
                    <p className="text-sm font-bold text-slate-700">{p.jobPreferences.expectedSalary}</p>
                  </div>
                )}
                {p.jobPreferences.noticePeriod && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Clock size={11} /> Notice Period</Label>
                    <p className="text-sm font-bold text-slate-700">{p.jobPreferences.noticePeriod}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recruiter experience summary */}
          {isRecruiter && (rp.currentExp > 0 || rp.totalExp > 0) && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white">
              <SectionTitle>Recruiter Experience</SectionTitle>
              <div className="grid grid-cols-3 gap-6">
                {rp.currentExp > 0 && (
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-2xl font-bold text-slate-900">{rp.currentExp}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Current Exp (yrs)</p>
                  </div>
                )}
                {rp.previousExp > 0 && (
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-2xl font-bold text-slate-900">{rp.previousExp}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Previous Exp (yrs)</p>
                  </div>
                )}
                {rp.totalExp > 0 && (
                  <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{rp.totalExp}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mt-1">Total Exp (yrs)</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Job Applications Inline Section */}
          {isJobseeker && (
            <Card className="p-8 rounded-[24px] border-slate-200 shadow-sm bg-white" id="applications-section">
              <SectionTitle>Job Applications</SectionTitle>
              {appsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-medium text-slate-500">This user hasn't applied to any jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-emerald-200 hover:bg-white transition-all group">
                      <div className="flex items-start gap-4">
                        {app.job?.company?.logo_url ? (
                          <img src={app.job.company.logo_url} alt="logo" className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                            <Building2 size={20} className="text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{app.job?.title || 'This job has been removed'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-semibold text-slate-500">{app.job?.company?.name || 'Unknown Company'}</p>
                            {app.job?.display_id && (
                              <Badge className="bg-slate-100 text-slate-500 text-[9px] uppercase hover:bg-slate-100 font-bold px-1.5 py-0 border-slate-200">
                                {app.job.display_id}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {app.job?.location && <span className="flex items-center gap-1"><MapPin size={10} /> {app.job.location}</span>}
                            {app.job?.workMode && <span className="flex items-center gap-1"><Globe size={10} /> {app.job.workMode}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2 shrink-0">
                        <Badge className={
                          app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          app.status === 'shortlisted' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }>
                          <span className="text-[10px] font-bold uppercase">{app.status}</span>
                        </Badge>
                        {app.job ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-bold w-full md:w-auto hover:bg-slate-100"
                            onClick={() => navigate(`/job/${app.job._id}`)}
                          >
                            View Job <ExternalLink size={12} className="ml-1" />
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100 mt-1 uppercase">Job Removed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Account meta */}
          <Card className="p-6 rounded-[24px] border-slate-200 shadow-sm bg-white space-y-5">
            <SectionTitle>Account</SectionTitle>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Role</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold uppercase">{role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Status</span>
                <Badge className={user.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}>
                  <span className="text-[9px] font-bold uppercase">{user.isVerified ? 'Verified' : 'Pending'}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Access</span>
                <Badge className={user.isAdminBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                  <span className="text-[9px] font-bold uppercase">{user.isAdminBlocked ? 'Blocked' : 'Active'}</span>
                </Badge>
              </div>
              <div className="pt-2 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Registered</p>
                <p className="text-xs font-semibold text-slate-700">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>

          {/* Company info - Hidden for now */}
          {/* {user.company && (
            <Card className="p-6 rounded-[24px] border-slate-200 shadow-sm bg-white space-y-4">
              <SectionTitle>Organization</SectionTitle>
              <div className="flex items-center gap-3 mb-4">
                {user.company.logo ? (
                  <img src={user.company.logo} alt="logo" className="w-10 h-10 rounded-xl border border-slate-200 object-contain bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.company.name}</p>
                  {user.company.industry && <p className="text-[10px] font-bold text-slate-400 uppercase">{user.company.industry}</p>}
                </div>
              </div>
              {user.company.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={12} className="text-slate-400" /> {user.company.location}
                </div>
              )}
              {user.company.website && (
                <a href={user.company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
                  <Globe size={12} /> {user.company.website}
                </a>
              )}
            </Card>
          )} */}

          {/* Documents */}
          {(p.resumeUrl || p.portfolioUrl) && (
            <Card className="p-6 rounded-[24px] border-slate-200 shadow-sm bg-white space-y-4">
              <SectionTitle>Documents</SectionTitle>
              {p.resumeUrl && (
                <a href={resolveUrl(p.resumeUrl)} onClick={(e) => openFile(e, p.resumeUrl)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText size={15} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{p.resumeName || 'Resume'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">View Document</p>
                  </div>
                  <ExternalLink size={13} className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </a>
              )}
              {p.portfolioUrl && (
                <a href={resolveUrl(p.portfolioUrl)} onClick={(e) => openFile(e, p.portfolioUrl)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                    <Globe size={15} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">Portfolio</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Open Link</p>
                  </div>
                  <ExternalLink size={13} className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </a>
              )}
            </Card>
          )}

          {/* Interested domains */}
          {p.interestedDomain?.length > 0 && (
            <Card className="p-6 rounded-[24px] border-slate-200 shadow-sm bg-white space-y-4">
              <SectionTitle>Interested Domains</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {p.interestedDomain.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{d}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
