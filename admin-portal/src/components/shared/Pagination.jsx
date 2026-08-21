import React from 'react';
import { Button } from '@/components/ui/button';

// Shared footer for server-paginated admin lists: "Page X of Y (N total)" + Prev/Next.
// Renders nothing when there's only one page, matching the reference pattern in college/Students.jsx.
const Pagination = ({ page, pages, total, onPageChange, itemLabel = 'total' }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
      <p className="text-xs text-slate-500 font-medium">Page {page} of {pages} ({total} {itemLabel})</p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg text-xs h-8">Prev</Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="rounded-lg text-xs h-8">Next</Button>
      </div>
    </div>
  );
};

export default Pagination;
