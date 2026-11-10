import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { SlidersHorizontal, Loader2, CalendarPlus, RotateCcw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// Admin: change ONE person's plan benefits (counts, switches, end date) without touching the plan or anyone else.
// Example: Sharmi bought Plus with 3 resumes; set her resume count to 5 here and only she gets 5.
// Every save is recorded with your name and the reason, and the person is told by email.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No end date');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const groupForRole = (role) => (role === 'jobseeker' ? 'Job seeker' : 'Employer');

const PlanBenefitsEditor = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [values, setValues] = useState({});
  const [extendDays, setExtendDays] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reset, setReset] = useState({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}/plan`, { headers: headers() });
      setData(res.data);
      setValues(Object.fromEntries(res.data.fields.map((f) => [f.key, f.value])));
      setExtendDays(''); setEndDate(''); setReset({}); setNote('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not load this person\'s plan.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const changed = useMemo(() => {
    if (!data) return {};
    const out = {};
    data.fields.forEach((f) => { if (values[f.key] !== f.value) out[f.key] = values[f.key]; });
    return out;
  }, [data, values]);
  const resetKeys = Object.keys(reset).filter((k) => reset[k]);
  const wantsDate = endDate !== '';
  const wantsDays = extendDays !== '';
  const nothingToSave = !Object.keys(changed).length && !wantsDate && !wantsDays && !resetKeys.length;

  const save = async () => {
    if (saving || !data) return;
    if (wantsDate && wantsDays) return toast.error('Use either "extend by days" or "end date", not both.');
    if (note.trim().length < 3) return toast.error('Please write a short reason. It is saved with your name.');
    const lines = [
      ...Object.keys(changed).map((k) => {
        const f = data.fields.find((x) => x.key === k);
        const show = (v) => (f.type === 'boolean' ? (v ? 'On' : 'Off') : String(v));
        return `${f.label}: ${show(f.value)} -> ${show(changed[k])}`;
      }),
      ...(wantsDays ? [`Valid until: add ${extendDays} days`] : []),
      ...(wantsDate ? [`Valid until: ${endDate}`] : []),
      ...resetKeys.map((k) => `${data.usage.find((u) => u.key === k).label}: reset to 0`),
    ];
    if (!window.confirm(`Save these changes for ${data.user.name} only?\n\n${lines.join('\n')}\n\nThey will be told by email.`)) return;
    setSaving(true);
    try {
      const body = { changes: changed, resetUsage: resetKeys, note: note.trim() };
      if (wantsDays) body.extendDays = Number(extendDays);
      if (wantsDate) body.expiry = endDate;
      const res = await axios.patch(`${API_BASE_URL}/admin/users/${userId}/plan`, body, { headers: headers() });
      toast.success(res.data.msg || 'Saved');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not save the change');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-white border border-slate-100 rounded-[24px] p-8 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin inline" /></div>;
  if (error) return <div className="bg-white border border-slate-100 rounded-[24px] p-6 text-sm text-slate-500">Plan benefits: {error}</div>;

  const mine = groupForRole(data.user.role);
  const visibleFields = data.fields.filter((f) => showAll || f.group === mine);

  return (
    <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><SlidersHorizontal size={18} /></div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Plan benefits for this person only</h2>
          <p className="text-xs text-slate-500 mt-0.5">Changes here apply to <strong>{data.user.name}</strong> alone. The {data.plan.name} plan and other buyers are not changed. They are told by email.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</p><p className="font-semibold text-slate-900">{data.plan.name} <span className="text-slate-400 font-normal">· ₹{Number(data.plan.price).toLocaleString('en-IN')} · {data.plan.duration}</span></p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valid until</p><p className="font-semibold text-slate-900">{data.plan.duration === 'Lifetime' || data.plan.price === 0 ? 'No end date' : fmtDate(data.expiry)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p><p className="font-semibold text-slate-900 truncate">{data.user.email}</p></div>
      </div>

      {/* Validity */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><CalendarPlus size={13} /> Validity</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-500">Extend by (days)
            <Input type="number" min="1" max="3650" value={extendDays} onChange={(e) => { setExtendDays(e.target.value); if (e.target.value) setEndDate(''); }} placeholder="For example 30" className="mt-1" />
          </label>
          <label className="text-xs font-semibold text-slate-500">Or set a new end date
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); if (e.target.value) setExtendDays(''); }} className="mt-1" />
          </label>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">Days are added from today, or from the current end date if that is later. An expired plan is extended from today.</p>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{showAll ? 'All settings' : `${mine} settings`}</h3>
          <button type="button" className="text-xs font-semibold text-emerald-700 hover:underline" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show only what applies' : 'Show every setting'}</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {visibleFields.map((f) => {
            const isChanged = changed[f.key] !== undefined;
            return (
              <div key={f.key} className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${isChanged ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-100'}`}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                  {f.type === 'number' && f.zeroMeans && <p className="text-[10px] text-slate-400">0 = {f.zeroMeans}</p>}
                  {isChanged && <p className="text-[10px] text-emerald-700 font-semibold">was {f.type === 'boolean' ? (f.value ? 'On' : 'Off') : String(f.value)}</p>}
                </div>
                {f.type === 'boolean' && <Switch checked={!!values[f.key]} onCheckedChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />}
                {f.type === 'number' && <Input type="number" min="0" className="w-24 text-right" value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value === '' ? '' : Number(e.target.value) }))} />}
                {f.type === 'select' && (
                  <select className="h-9 rounded-md border border-input bg-transparent px-2 text-sm" value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><RotateCcw size={13} /> Usage so far (tick to give a fresh allowance)</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {data.usage.map((u) => (
            <label key={u.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${u.value === 0 ? 'opacity-50' : ''} ${reset[u.key] ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-100'}`}>
              <span className="text-slate-700">{u.label}: <strong>{u.value}</strong></span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <input type="checkbox" disabled={u.value === 0} checked={!!reset[u.key]} onChange={(e) => setReset((s) => ({ ...s, [u.key]: e.target.checked }))} /> reset to 0
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reason and save */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <label className="text-xs font-semibold text-slate-500 block">Why are you changing this? (saved with your name and the time)
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: customer asked for one extra resume" className="mt-1" />
        </label>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || nothingToSave}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save for this person'}</Button>
          {nothingToSave && <span className="text-xs text-slate-400">Change something above first.</span>}
        </div>
      </div>

      {/* History */}
      {data.history.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><History size={13} /> Earlier changes</h3>
          <ul className="space-y-2">
            {data.history.map((h, i) => (
              <li key={i} className="text-xs text-slate-600 rounded-lg bg-slate-50 p-2.5">
                <p className="font-semibold text-slate-800">{fmtDateTime(h.at)} · {h.by}</p>
                <p>{[...h.changes.map((c) => `${c.label}: ${c.before} → ${c.after}`), ...(h.expiry ? [`Valid until: ${fmtDate(h.expiry.before)} → ${fmtDate(h.expiry.after)}`] : []), ...h.reset.map((k) => `${k} reset`)].join(' · ')}</p>
                <p className="text-slate-400">Reason: {h.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlanBenefitsEditor;
