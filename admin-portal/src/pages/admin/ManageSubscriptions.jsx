import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Plus, Trash2, Settings2, User, Users, Building2,
  ListPlus, X, Check, Pencil, ChevronDown, ChevronUp, Infinity,
  Tag, Hash, Clock, ToggleLeft, Zap, AlertCircle, RefreshCw, Percent, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const API = import.meta.env.VITE_API_BASE_URL;

const ROLES = [
  { id: 'jobseeker', label: 'Job Seekers', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'recruiter', label: 'Recruiters', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'company', label: 'Organizations', icon: Building2, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'college', label: 'Colleges', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
];

// Static schema fields per role — always present regardless of feature catalog
const STATIC_FEATURES = {
  jobseeker: [
    { key: 'hasResumeBuilder', label: 'Resume Builder', type: 'boolean' },
    { key: 'resumeBuilderCount', label: 'Resume Count', type: 'count', unit: 'resumes' },
    { key: 'jobAlerts', label: 'Job Alerts', type: 'select', options: ['None', 'Daily', 'Weekly', 'Monthly'] },
    { key: 'hasProfileBoost', label: 'Profile Boost', type: 'boolean' },
    { key: 'hasProfileViewInsights', label: 'Profile View Insights', type: 'boolean' },
    { key: 'hasCareerCounselling', label: 'Career Counselling', type: 'boolean' },
    { key: 'careerCounsellingCount', label: 'Counselling Sessions', type: 'count', unit: 'sessions' },
    { key: 'hasMockInterviews', label: 'Mock Interviews', type: 'boolean' },
    { key: 'hasMessageRecruiters', label: 'Messaging', type: 'boolean' },
    { key: 'hasPriorityBadge', label: 'Priority Badge', type: 'boolean' },
  ],
  recruiter: [
    { key: 'activeJobPostings', label: 'Active Job Postings', type: 'count', unit: 'jobs', hint: '0 = Unlimited' },
    { key: 'candidateSearchPerDay', label: 'Candidate Searches / Day', type: 'count', unit: '/day', hint: '0 = Unlimited' },
    { key: 'hasATSPipeline', label: 'ATS Pipeline', type: 'boolean' },
    { key: 'hasAnalyticsDashboard', label: 'Analytics Dashboard', type: 'boolean' },
    { key: 'hasCandidateDBExport', label: 'Candidate DB Export', type: 'boolean' },
    { key: 'hasBulkMessaging', label: 'Bulk Messaging', type: 'boolean' },
    { key: 'hasVideoInterview', label: 'Video Interview', type: 'boolean' },
    { key: 'hasPriorityListing', label: 'Priority Listing', type: 'boolean' },
    { key: 'hasAICandidateMatching', label: 'AI Candidate Matching', type: 'boolean' },
    { key: 'hasRequests', label: 'Service Requests', type: 'boolean' },
    { key: 'hasMessageRecruiters', label: 'Messaging', type: 'boolean' },
    { key: 'hasTeamCollaboration', label: 'Team Collaboration', type: 'boolean', hint: 'Auto-enabled if seats > 1' },
  ],
  company: [
    { key: 'userSeats', label: 'Team Seats', type: 'count', unit: 'seats' },
    { key: 'hasInterviewScheduling', label: 'Interview Scheduling', type: 'boolean' },
    { key: 'hasTeamCollaboration', label: 'Team Collaboration', type: 'boolean', hint: 'Auto-enabled if seats > 1' },
    { key: 'hasRequests', label: 'Service Requests', type: 'boolean' },
    { key: 'hasMessageRecruiters', label: 'Messaging', type: 'boolean' },
    { key: 'hasDedicatedOnboarding', label: 'Dedicated Onboarding', type: 'boolean' },
  ],
  // College plans have no core/static fields — every campus-specific capability (Student
  // Capacity, CSV Bulk Upload, Co-Branded Certificates, etc.) lives in the Dynamic Feature
  // Catalog instead. The 7 entries formerly here were copy-pasted from the company role and
  // didn't apply to colleges at all (team seats, bulk applicant management, ...).
  college: [],
};

const DEFAULT_FORM = {
  name: '', price: 0, duration: 'Monthly', role: 'jobseeker', isActive: true, isCustomPrice: false,
  hasResumeBuilder: false, resumeBuilderCount: 0, jobAlerts: 'None',
  hasProfileBoost: false, hasProfileViewInsights: false, hasMessageRecruiters: false,
  hasCareerCounselling: false, careerCounsellingCount: 0, hasMockInterviews: false, hasPriorityBadge: false,
  activeJobPostings: 0, candidateSearchPerDay: 0,
  hasATSPipeline: false, hasAnalyticsDashboard: false, hasCandidateDBExport: false,
  hasBulkMessaging: false, hasVideoInterview: false,
  userSeats: 1, companyProfileType: 'Basic',
  hasInterviewScheduling: false, hasDedicatedOnboarding: false,
  features: [],
  pricingOptions: [
    { quantity: 1, price: 0 },
    { quantity: 3, price: 0 },
    { quantity: 12, price: 0 }
  ],
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Sub-components ────────────────────────────────────────────────────────────

const Toggle = ({ value, onChange, size = 'md' }) => {
  const s = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const d = size === 'sm' ? 'w-3 h-3 top-0.5' : 'w-3.5 h-3.5 top-[3px]';
  return (
    <div
      onClick={() => onChange(!value)}
      className={`${s} rounded-full relative cursor-pointer transition-colors duration-200 ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute ${d} bg-white rounded-full shadow transition-all duration-200 ${value ? 'right-0.5' : 'left-0.5'}`} />
    </div>
  );
};

const TypeIcon = ({ type }) => {
  const icons = { boolean: ToggleLeft, count: Hash, duration: Clock };
  const Icon = icons[type] || Tag;
  return <Icon size={12} className="text-slate-400" />;
};

const FeatureTypeBadge = ({ type }) => {
  const styles = {
    boolean: 'bg-blue-50 text-blue-700',
    count: 'bg-amber-50 text-amber-700',
    duration: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${styles[type] || 'bg-slate-100 text-slate-500'}`}>
      {type}
    </span>
  );
};

// ── Feature Catalog Panel ─────────────────────────────────────────────────────
const FeatureCatalogPanel = ({ role, features, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'boolean', unit: '', defaultValue: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const roleFeatures = features.filter(f => f.role === role);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Feature name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        unit: form.unit.trim(),
        defaultValue: form.type === 'count' ? (parseInt(form.defaultValue) || 0)
          : form.type === 'duration' ? form.defaultValue
          : null,
        role,
      };
      if (editingId) {
        await axios.put(`${API}/subscriptions/features/${editingId}`, payload, { headers: authHeader() });
        toast.success('Feature updated — all plans refreshed');
      } else {
        await axios.post(`${API}/subscriptions/features`, payload, { headers: authHeader() });
        toast.success('Feature created & added to all existing plans (disabled)');
      }
      setForm({ name: '', type: 'boolean', unit: '', defaultValue: '' });
      setEditingId(null);
      setOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save feature');
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id, name) => setDeleteTarget({ id, name });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/subscriptions/features/${deleteTarget.id}`, { headers: authHeader() });
      toast.success('Feature deleted from all plans');
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (f) => {
    setForm({ name: f.name, type: f.type, unit: f.unit || '', defaultValue: String(f.defaultValue ?? '') });
    setEditingId(f._id);
    setOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <ListPlus size={16} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-800">Dynamic Feature Catalog</p>
          <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {roleFeatures.length} features
          </Badge>
        </div>
        <Button
          onClick={() => { setForm({ name: '', type: 'boolean', unit: '', defaultValue: '' }); setEditingId(null); setOpen(true); }}
          className="h-8 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 flex items-center gap-1.5"
        >
          <Plus size={13} /> Add Feature
        </Button>
      </div>

      {/* Feature list */}
      <div className="divide-y divide-slate-50">
        {roleFeatures.length === 0 ? (
          <div className="py-8 text-center">
            <Tag size={24} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No dynamic features yet.</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Add features — they auto-apply to all plans.</p>
          </div>
        ) : (
          roleFeatures.map(f => (
            <div key={f._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 group">
              <TypeIcon type={f.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <FeatureTypeBadge type={f.type} />
                  {f.unit && <span className="text-[10px] text-slate-400 font-medium">Unit: {f.unit}</span>}
                  {f.defaultValue !== null && f.defaultValue !== undefined && f.defaultValue !== '' && (
                    <span className="text-[10px] text-slate-400 font-medium">Default: {String(f.defaultValue)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(f)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(f._id, f.name)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info note */}
      <div className="px-5 py-3 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2.5">
        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          New features are <strong>auto-added (disabled)</strong> to all existing plans. Enable them individually per plan below.
        </p>
      </div>

      {/* Add/Edit Feature Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Feature' : 'New Dynamic Feature'}
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {editingId ? 'Changes propagate to all plan feature names.' : 'Will be added (disabled) to all current plans.'}
            </p>
          </DialogHeader>
          <div className="p-6 space-y-5 bg-white">
            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Feature Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Placement Support, Priority Interviews"
                className="h-11 rounded-xl border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v, defaultValue: '' }))}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">
                      <span className="flex items-center gap-2"><ToggleLeft size={14} /> On / Off toggle</span>
                    </SelectItem>
                    <SelectItem value="count">
                      <span className="flex items-center gap-2"><Hash size={14} /> Numeric count</span>
                    </SelectItem>
                    <SelectItem value="duration">
                      <span className="flex items-center gap-2"><Clock size={14} /> Duration / time</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Unit <span className="normal-case font-normal">(optional)</span>
                </Label>
                <Input
                  value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder={form.type === 'duration' ? 'months' : form.type === 'count' ? 'interviews' : ''}
                  className="h-11 rounded-xl border-slate-200 text-sm"
                />
              </div>
            </div>

            {form.type !== 'boolean' && (
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Default Value <span className="normal-case font-normal">(suggested when enabled on a plan)</span>
                </Label>
                <Input
                  value={form.defaultValue}
                  onChange={e => setForm(p => ({ ...p, defaultValue: e.target.value }))}
                  placeholder={form.type === 'count' ? '3' : '1 month'}
                  className="h-11 rounded-xl border-slate-200 text-sm"
                />
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
              <strong className="text-slate-700">Example:</strong>{' '}
              {form.type === 'boolean' && '"Placement Support" — shows as a checkmark (enabled/disabled per plan)'}
              {form.type === 'count' && `"Priority Interviews" with unit "interviews" and default "3" — admin sets count per plan`}
              {form.type === 'duration' && `"Mentorship Access" with unit "months" and default "1" — admin sets time per plan`}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 rounded-xl text-sm font-bold text-slate-500">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-10 px-6 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700">
              {saving ? <RefreshCw size={14} className="animate-spin mr-2" /> : null}
              {editingId ? 'Save Changes' : 'Create Feature'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete feature "${deleteTarget?.name}"?`}
        description="It will be removed from all plans."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, roleFeatures, onEdit, onDelete, onToggleDynamicFeature }) => {
  const [expanded, setExpanded] = useState(false);
  const staticFields = STATIC_FEATURES[plan.role] || [];

  const getParentKey = (key) => ({
    careerCounsellingCount: 'hasCareerCounselling',
    resumeBuilderCount: 'hasResumeBuilder',
    messageRecruitersCount: 'hasMessageRecruiters'
  }[key]);

  const enabledStaticCount = staticFields.filter(f => {
    const parentKey = getParentKey(f.key);
    if (parentKey && !plan[parentKey]) return false;

    if (f.type === 'boolean') return !!plan[f.key];
    if (f.type === 'count') return true;
    if (f.type === 'select') return plan[f.key] && plan[f.key] !== 'None';
    return false;
  }).length;

  const enabledDynCount = (plan.features || []).filter(f => f.isActive).length;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${plan.isActive ? 'border-slate-100 hover:border-emerald-100 hover:shadow-md' : 'border-dashed border-slate-200 opacity-60'}`}>
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-base truncate">{plan.name}</h3>
              <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none shrink-0 ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {plan.isActive ? 'Active' : 'Hidden'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                {plan.isCustomPrice ? 'Custom' : (plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`)}
              </span>
              {plan.price > 0 && (
                <span className="text-xs text-slate-400 font-semibold">/{plan.duration.toLowerCase()}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => onEdit(plan)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-500 flex items-center justify-center transition-all">
              <Settings2 size={14} />
            </button>
            <button onClick={() => onDelete(plan._id)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 flex items-center justify-center transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 flex-wrap">
          {staticFields.length > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {enabledStaticCount}/{staticFields.length} core
            </span>
          )}
          <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg">
            {enabledDynCount}/{roleFeatures.length} dynamic
          </span>
        </div>
      </div>

      {/* Expandable feature list */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-slate-50 bg-slate-50/60 hover:bg-slate-100/60 transition-colors text-left"
      >
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Feature Toggles</span>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-50 divide-y divide-slate-50">
          {/* Static features (read-only display) */}
          {staticFields.length > 0 && (
          <div className="px-5 py-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Core Features</p>
            <div className="space-y-2">
              {staticFields.map(f => {
                let enabled = false;
                let display = '';
                const parentKey = getParentKey(f.key);

                if (parentKey && !plan[parentKey]) {
                  enabled = false;
                } else if (f.type === 'boolean') { 
                  enabled = !!plan[f.key]; 
                } else if (f.type === 'count') {
                  const v = plan[f.key];
                  enabled = true; 
                  display = v === 0 ? 'Unlimited' : `${v}`;
                } else if (f.type === 'select') { 
                  enabled = plan[f.key] && plan[f.key] !== 'None'; 
                  display = plan[f.key]; 
                }
                
                return (
                  <div key={f.key} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                      {enabled ? <Check size={9} strokeWidth={3} /> : <X size={9} strokeWidth={3} />}
                    </div>
                    <span className={`text-[11px] font-semibold flex-1 ${enabled ? 'text-slate-700' : 'text-slate-400'}`}>{f.label}</span>
                    {enabled && display && display !== 'true' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {display === 'Unlimited' ? <Infinity size={10} /> : display} {f.unit || ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Dynamic features (toggleable inline) */}
          {roleFeatures.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Dynamic Features</p>
              <div className="space-y-2.5">
                {roleFeatures.map(gf => {
                  const featureInPlan = (plan.features || []).find(f => f.name === gf.name);
                  const isActive = !!featureInPlan?.isActive;
                  const currentValue = featureInPlan?.value ?? gf.defaultValue ?? '';

                  return (
                    <DynamicFeatureRow
                      key={gf._id}
                      gf={gf}
                      isActive={isActive}
                      currentValue={String(currentValue ?? '')}
                      onToggle={(v) => onToggleDynamicFeature(plan._id, gf.name, v, currentValue)}
                      onValueChange={(v) => onToggleDynamicFeature(plan._id, gf.name, isActive, v)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DynamicFeatureRow = ({ gf, isActive, currentValue, onToggle, onValueChange }) => {
  const [localVal, setLocalVal] = useState(currentValue);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setLocalVal(currentValue); }, [currentValue]);

  const handleValueSubmit = () => {
    onValueChange(localVal);
    setEditing(false);
  };

  return (
    <div className={`rounded-xl border p-3 transition-all ${isActive ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-center gap-2.5">
        <Toggle value={isActive} onChange={onToggle} size="sm" />
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold truncate ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{gf.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FeatureTypeBadge type={gf.type} />
            {gf.unit && <span className="text-[9px] text-slate-400 font-medium">{gf.unit}</span>}
          </div>
        </div>

        {/* Value editor for count/duration types */}
        {isActive && gf.type !== 'boolean' && (
          editing ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type={gf.type === 'count' ? 'number' : 'text'}
                value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                className="w-20 h-7 px-2 text-xs font-bold rounded-lg border border-emerald-300 outline-none focus:ring-2 focus:ring-emerald-200"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleValueSubmit()}
              />
              <button onClick={handleValueSubmit} className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Check size={11} />
              </button>
              <button onClick={() => setEditing(false)} className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              {localVal === '0' || localVal === 0 ? 'Unlimited' : (localVal || gf.defaultValue || '—')} {gf.unit}
              <Pencil size={9} />
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ── Plan Editor Modal ─────────────────────────────────────────────────────────
const PlanEditorModal = ({ open, onClose, editingPlan, onSaved, allFeatures }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      const opts = editingPlan.pricingOptions && editingPlan.pricingOptions.length === 3
        ? editingPlan.pricingOptions
        : [
            { quantity: 1, price: editingPlan.price || 0 },
            { quantity: 3, price: Math.round((editingPlan.price || 0) * 3 * 0.95) },
            { quantity: 12, price: Math.round((editingPlan.price || 0) * 12 * 0.80) }
          ];
      setForm({ ...DEFAULT_FORM, ...editingPlan, pricingOptions: opts, features: editingPlan.features || [] });
      setIsCustomDuration(!['Monthly', 'Quarterly', 'Yearly', 'Lifetime'].includes(editingPlan.duration));
    } else {
      setForm(DEFAULT_FORM);
      setIsCustomDuration(false);
    }
  }, [editingPlan, open]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleDynFeature = (gfName) => {
    const cur = (form.features || []).find(f => f.name === gfName);
    let next;
    if (cur) {
      next = form.features.map(f => f.name === gfName ? { ...f, isActive: !f.isActive } : f);
    } else {
      next = [...(form.features || []), { name: gfName, isActive: true, value: null }];
    }
    set('features', next);
  };

  const setDynValue = (gfName, val) => {
    const next = (form.features || []).map(f => f.name === gfName ? { ...f, value: val } : f);
    set('features', next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Plan name is required'); return; }
    setSaving(true);
    try {
      if (editingPlan) {
        await axios.put(`${API}/subscriptions/${editingPlan._id}`, form, { headers: authHeader() });
        toast.success('Plan updated');
      } else {
        await axios.post(`${API}/subscriptions`, form, { headers: authHeader() });
        toast.success('Plan created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const staticFields = STATIC_FEATURES[form.role] || [];
  const dynFields = allFeatures.filter(f => f.role === form.role && f.isActive !== false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none shadow-2xl">
        <DialogHeader className="px-7 py-5 border-b border-slate-100 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
          </DialogTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Configure pricing, role, and feature access.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7 bg-white">

            {/* Basics */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Plan Name *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pro Plan" className="h-11 rounded-xl border-slate-200 text-sm" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Price (₹)</Label>
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => set('isCustomPrice', !form.isCustomPrice)}>
                    <input type="checkbox" checked={form.isCustomPrice} readOnly className="w-3 h-3 rounded border-slate-300 text-emerald-600 focus:ring-0" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Custom</span>
                  </div>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={form.isCustomPrice ? '' : (form.price || '')}
                  onChange={e => set('price', Number(e.target.value) || 0)}
                  disabled={form.isCustomPrice}
                  className={`h-11 rounded-xl border-slate-200 text-sm ${form.isCustomPrice ? 'bg-slate-50 opacity-60' : ''}`}
                  required={!form.isCustomPrice}
                />
              </div>
              <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Billing Cycle</Label>
                <Select value={isCustomDuration ? 'Custom' : form.duration} onValueChange={v => {
                  if (v === 'Custom') { setIsCustomDuration(true); set('duration', ''); }
                  else { setIsCustomDuration(false); set('duration', v); }
                }}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                    <SelectItem value="Custom">Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomDuration && (
                  <Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 15 Days" className="h-11 rounded-xl border-slate-200 text-sm mt-2" required />
                )}
              </div>
            </div>

            {/* Pricing Options */}
            <div className="rounded-2xl border border-slate-100 p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">3 Purchase Options / Duration Pricing</Label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Required</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const qtyDefault = idx === 0 ? 1 : idx === 1 ? 3 : 12;
                  const option = form.pricingOptions?.[idx] || { quantity: qtyDefault, price: 0 };
                  
                  return (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Option {idx + 1}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase block">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={option.quantity}
                          onChange={e => {
                            const newOpts = [...(form.pricingOptions || [])];
                            newOpts[idx] = { ...option, quantity: Math.max(1, parseInt(e.target.value) || 0) };
                            set('pricingOptions', newOpts);
                          }}
                          className="h-9 rounded-lg text-xs"
                          placeholder={String(qtyDefault)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase block">Total Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={option.price || ''}
                          onChange={e => {
                            const newOpts = [...(form.pricingOptions || [])];
                            newOpts[idx] = { ...option, price: Number(e.target.value) || 0 };
                            set('pricingOptions', newOpts);
                          }}
                          className="h-9 rounded-lg text-xs"
                          placeholder={String(option.price || 0)}
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role */}
            <div>
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">For Role</Label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <div
                    key={r.id}
                    onClick={() => set('role', r.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.role === r.id ? `${r.bg} ${r.border} shadow-sm` : 'bg-white border-slate-100 hover:border-slate-200'}`}
                  >
                    <r.icon size={16} className={form.role === r.id ? r.color : 'text-slate-300'} />
                    <span className={`text-xs font-bold ${form.role === r.id ? r.color : 'text-slate-500'}`}>{r.label}</span>
                    {form.role === r.id && <Check size={13} className={`ml-auto ${r.color}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Static Features */}
            {staticFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-slate-400" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Features</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {staticFields.map(f => (
                    <StaticFeatureInput key={f.key} field={f} form={form} onChange={set} />
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Features from catalog */}
            {dynFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ListPlus size={13} className="text-slate-400" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dynamic Features (from catalog)</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {dynFields.map(gf => {
                    const fp = (form.features || []).find(f => f.name === gf.name);
                    const active = !!fp?.isActive;
                    return (
                      <div key={gf._id} className={`rounded-xl border p-3.5 transition-all ${active ? 'border-violet-100 bg-violet-50/30' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">{gf.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <FeatureTypeBadge type={gf.type} />
                              {gf.unit && <span className="text-[10px] text-slate-400">{gf.unit}</span>}
                            </div>
                          </div>
                          <Toggle value={active} onChange={() => toggleDynFeature(gf.name)} size="sm" />
                        </div>
                        {active && gf.type !== 'boolean' && (
                          <div className="mt-2">
                            <Input
                              type={gf.type === 'count' ? 'number' : 'text'}
                              value={fp?.value ?? gf.defaultValue ?? ''}
                              onChange={e => setDynValue(gf.name, gf.type === 'count' ? Number(e.target.value) : e.target.value)}
                              placeholder={`Value in ${gf.unit || 'units'}…`}
                              className="h-8 rounded-lg border-slate-200 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center justify-between py-3.5 px-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-800">Plan Visibility</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Active plans are visible to users on the subscription page</p>
              </div>
              <Toggle value={form.isActive} onChange={v => set('isActive', v)} />
            </div>
          </div>

          <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-sm text-slate-500">Cancel</Button>
            <Button type="submit" disabled={saving} className="h-11 px-8 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-700">
              {saving ? <RefreshCw size={14} className="animate-spin mr-2" /> : null}
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const StaticFeatureInput = ({ field, form, onChange }) => {
  const val = form[field.key];
  if (field.type === 'boolean') {
    return (
      <div
        onClick={() => onChange(field.key, !val)}
        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${val ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
      >
        <span className="text-[11px] font-bold text-slate-700">{field.label}</span>
        <Toggle value={!!val} onChange={v => onChange(field.key, v)} size="sm" />
      </div>
    );
  }
  if (field.type === 'count') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {field.label}
          {field.hint && <span className="normal-case font-normal text-slate-300">({field.hint})</span>}
        </Label>
        <Input
          type="number"
          min="0"
          value={val}
          onChange={e => onChange(field.key, Number(e.target.value))}
          className="h-10 rounded-xl border-slate-200 text-sm"
        />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</Label>
        <Select value={val} onValueChange={v => onChange(field.key, v)}>
          <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {field.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return null;
};

// ── GST Settings Panel ────────────────────────────────────────────────────────
const GstSettingsPanel = () => {
  const [gst, setGst] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API}/settings`).then(res => {
      setGst(String(res.data.gstPercentage ?? 0));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    const val = parseFloat(gst);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('GST must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(
        `${API}/settings`,
        { gstPercentage: val },
        { headers: authHeader() }
      );
      setGst(String(res.data.gstPercentage));
      toast.success('GST rate updated');
    } catch {
      toast.error('Failed to save GST rate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Percent size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">GST Rate</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Applied on top of plan base price at checkout</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={gst}
            onChange={e => setGst(e.target.value)}
            className="h-10 w-28 rounded-xl border-slate-200 text-sm pr-8 text-right font-bold"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest gap-2"
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
          Save
        </Button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ManageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [globalFeatures, setGlobalFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeRole, setActiveRole] = useState('jobseeker');

  const fetchAll = useCallback(async () => {
    try {
      const [subsRes, featRes] = await Promise.all([
        axios.get(`${API}/subscriptions`),
        axios.get(`${API}/subscriptions/features`),
      ]);
      setSubscriptions(subsRes.data);
      setGlobalFeatures(featRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleEdit = (plan) => { setEditingPlan(plan); setPlanModalOpen(true); };
  const handleNew = () => { setEditingPlan(null); setPlanModalOpen(true); };

  const [deletePlanTarget, setDeletePlanTarget] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const handleDelete = (id) => setDeletePlanTarget(id);

  const confirmDeletePlan = async () => {
    const id = deletePlanTarget;
    setDeletingPlan(true);
    try {
      await axios.delete(`${API}/subscriptions/${id}`, { headers: authHeader() });
      toast.success('Plan deleted');
      setSubscriptions(s => s.filter(x => x._id !== id));
      setDeletePlanTarget(null);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingPlan(false);
    }
  };

  const handleToggleDynFeature = async (planId, featureName, isActive, value) => {
    try {
      const res = await axios.patch(
        `${API}/subscriptions/${planId}/features/${encodeURIComponent(featureName)}`,
        { isActive, value },
        { headers: authHeader() }
      );
      setSubscriptions(s => s.map(p => p._id === planId ? res.data : p));
    } catch {
      toast.error('Failed to update feature');
    }
  };

  const roleFeatures = (role) => globalFeatures.filter(f => f.role === role);
  const rolePlans = (role) => subscriptions.filter(s => s.role === role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400 mr-3" />
        <p className="text-slate-500 font-semibold">Loading subscription data…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-2">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage plans, features, and pricing for all user roles.</p>
        </div>
        <Button
          onClick={handleNew}
          className="h-10 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={15} /> New Plan
        </Button>
      </div>

      {/* GST Settings */}
      <GstSettingsPanel />

      {/* Role Tabs */}
      <Tabs value={activeRole} onValueChange={setActiveRole} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
          {ROLES.map(r => (
            <TabsTrigger key={r.id} value={r.id} className="rounded-lg px-5 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
              <r.icon size={13} />
              {r.label}
              <span className="ml-1 text-[10px] bg-slate-200 data-[state=active]:bg-slate-100 px-1.5 py-0.5 rounded-full font-black">
                {rolePlans(r.id).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {ROLES.map(r => (
          <TabsContent key={r.id} value={r.id} className="mt-0 space-y-6">
            {/* Feature Catalog */}
            <FeatureCatalogPanel
              role={r.id}
              features={globalFeatures}
              onRefresh={fetchAll}
            />

            {/* Plans Grid */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {rolePlans(r.id).map(plan => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  roleFeatures={roleFeatures(r.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleDynamicFeature={handleToggleDynFeature}
                />
              ))}

              {/* Add Plan card */}
              <div
                onClick={() => { setEditingPlan(null); setPlanModalOpen(true); setActiveRole(r.id); }}
                className="min-h-[180px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                  <Plus size={26} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                  Add {r.label} Plan
                </p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Plan Editor Modal */}
      <PlanEditorModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        editingPlan={editingPlan}
        onSaved={fetchAll}
        allFeatures={globalFeatures}
      />

      <ConfirmDialog
        open={!!deletePlanTarget}
        onOpenChange={(open) => !open && setDeletePlanTarget(null)}
        title="Delete this plan?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deletingPlan}
        onConfirm={confirmDeletePlan}
      />
    </div>
  );
};

export default ManageSubscriptions;
