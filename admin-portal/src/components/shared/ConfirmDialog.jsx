import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * In-app replacement for window.confirm()/window.prompt(). Each caller owns its own
 * `open` state and passes the action-specific copy — this is intentionally not a global
 * singleton, so every confirmation reads like it belongs to the thing it's confirming.
 *
 * Plain confirm:
 *   <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete this job?"
 *     description="This cannot be undone." destructive confirmLabel="Delete"
 *     onConfirm={doDelete} loading={deleting} />
 *
 * Confirm with a reason (replaces window.prompt):
 *   <ConfirmDialog open={open} onOpenChange={setOpen} title="Reject this student?"
 *     destructive confirmLabel="Reject"
 *     reason={{ label: 'Reason (optional)', placeholder: 'Let them know why...' }}
 *     onConfirm={(reason) => doReject(reason)} loading={rejecting} />
 *
 * Confirm with extra custom content (e.g. a form/checkbox grid) via children — rendered
 * between the description and the footer buttons. onConfirm is still called with no args
 * in this case (the caller reads whatever state it's managing itself).
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  reason,
  onConfirm,
  children,
}) => {
  const [reasonValue, setReasonValue] = useState('');

  useEffect(() => {
    if (open) setReasonValue(reason?.defaultValue || '');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    if (reason?.required && !reasonValue.trim()) return;
    onConfirm(reason ? reasonValue.trim() : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
            )}
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          {description && <DialogDescription className="pt-1">{description}</DialogDescription>}
        </DialogHeader>

        {reason && (
          <div className="space-y-1.5">
            {reason.label && (
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{reason.label}</label>
            )}
            <Textarea
              value={reasonValue}
              onChange={(e) => setReasonValue(e.target.value)}
              placeholder={reason.placeholder}
              className="rounded-xl text-sm"
              rows={3}
              autoFocus
            />
          </div>
        )}

        {children}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={loading || (reason?.required && !reasonValue.trim())}
            onClick={handleConfirm}
            className={`rounded-xl font-bold gap-2 ${destructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
