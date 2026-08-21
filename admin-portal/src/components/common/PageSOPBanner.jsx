import React, { useState } from 'react';
import { Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PAGE_SOP } from '../../config/pageSOP';

// Dismissible "what this page is / how it works" banner shown at the top of a page.
// Dismissal is remembered per page (localStorage) so it doesn't nag on every visit —
// resettable only by clearing site data, matching how a one-time onboarding tip should behave.
const PageSOPBanner = ({ pageKey }) => {
  const entry = PAGE_SOP[pageKey];
  const storageKey = `sop_dismissed_${pageKey}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === 'true'; } catch { return false; }
  });
  const [expanded, setExpanded] = useState(false);

  if (!entry || dismissed) return null;

  const { title, whatItIs, howItWorks = [] } = entry;

  const handleDismiss = () => {
    try { localStorage.setItem(storageKey, 'true'); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-100/60 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      <div className="flex gap-3 pr-8">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Info size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-emerald-900">{title}</h3>
          <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">{whatItIs}</p>
          {howItWorks.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
              >
                How it works {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expanded && (
                <ol className="mt-2 space-y-1 list-decimal pl-4">
                  {howItWorks.map((step, i) => (
                    <li key={i} className="text-xs text-emerald-800/90">{step}</li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageSOPBanner;
