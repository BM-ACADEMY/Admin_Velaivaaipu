// Grantable page permissions for a team-managed recruiter — mirrors the fixed key list
// enforced server-side (server/models/User.js teamPermissions enum). Drives both the
// invite/edit-permissions checkbox UI and the PrivateRoute/Sidebar filtering.
export const TEAM_PERMISSIONS = [
  { key: 'post_job', label: 'Post Job', routes: ['/company/jobs/new'] },
  { key: 'my_jobs', label: 'My Jobs', routes: ['/company/jobs'] },
  { key: 'candidate_search', label: 'Candidate Search', routes: ['/company/candidates'] },
  { key: 'messages', label: 'Messages', routes: ['/company/messages'] },
  { key: 'ats_pipeline', label: 'Applicants / ATS Pipeline', routes: ['/company/ats-pipeline', '/company/applicants'] },
  { key: 'analytics', label: 'Analytics', routes: ['/company/analytics'] },
  { key: 'bulk_messaging', label: 'Bulk Messaging', routes: ['/company/bulk-messaging'] },
  { key: 'bulk_applicant_management', label: 'Bulk Applicant Management', routes: ['/company/bulk-hiring'] },
  { key: 'interview_scheduling', label: 'Video Interview / Scheduling', routes: ['/company/video-interview', '/company/interview-scheduling'] },
  { key: 'ai_candidate_matching', label: 'AI Candidate Matching', routes: ['/company/ai-matching'] },
];

export const findPermissionKeyForPath = (path) => {
  const entry = TEAM_PERMISSIONS.find(p => p.routes.some(r => path === r || path.startsWith(r + '/')));
  return entry?.key || null;
};
