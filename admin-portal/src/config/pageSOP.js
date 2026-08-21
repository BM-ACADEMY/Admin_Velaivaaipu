// Central content for the per-page "what this is / how it works" dismissible banner
// (see components/common/PageSOPBanner.jsx). Keyed by a short, stable page identifier —
// pass the matching key as the `pageKey` prop wherever the banner is rendered.
export const PAGE_SOP = {
  // ── Job Seeker ──────────────────────────────────────────────────────────
  jobseekerDashboard: {
    title: 'Your Job Seeker Dashboard',
    whatItIs: 'Your home base — personalized job recommendations, quick stats, and shortcuts to the rest of the platform.',
    howItWorks: [
      'Recommendations are generated from your profile skills, preferences, and experience.',
      'A more complete profile (Settings) means more accurate matches.',
      'Use the sidebar to jump to Applications, Saved Jobs, Messages, and premium tools.'
    ]
  },
  jobseekerSettings: {
    title: 'Profile & Account Settings',
    whatItIs: 'Manage your public profile, resume, contact details, and account preferences.',
    howItWorks: [
      'Fill in skills, experience, and job preferences to improve match quality.',
      'Upload or update your resume — recruiters see this when you apply.',
      'Changes save immediately and affect matching right away.'
    ]
  },
  savedJobs: {
    title: 'Saved Jobs',
    whatItIs: 'Jobs you have bookmarked to review or apply to later.',
    howItWorks: [
      'Tap the save icon on any job listing to add it here.',
      'Apply directly from this list, or remove jobs you are no longer interested in.'
    ]
  },
  jobseekerPublicProfile: {
    title: 'Your Public Profile',
    whatItIs: 'This is how recruiters and companies see your profile when you apply or when they search candidates.',
    howItWorks: [
      'Keep this updated — it is your first impression to recruiters.',
      'Visibility of contact details depends on your privacy settings.'
    ]
  },
  jobseekerSubscription: {
    title: 'Subscription Plans',
    whatItIs: 'Compare and purchase plans that unlock premium job-search tools like messaging, resume builder, and AI matching.',
    howItWorks: [
      'Pick a plan and complete payment via Razorpay.',
      'Plans renew automatically unless auto-renew is turned off in Settings.',
      'All payments are final — see our Terms & Conditions for the no-refund policy.'
    ]
  },
  myApplications: {
    title: 'My Applications',
    whatItIs: 'Track every job you have applied to and its current status.',
    howItWorks: [
      'Status updates (Reviewed, Shortlisted, Interview, Offer) come from the recruiter and notify you by email/WhatsApp.',
      'You can withdraw an application while it is still pending or under review.'
    ]
  },
  jobseekerCampusDrives: {
    title: 'Campus Drives',
    whatItIs: 'Placement drives run by your registered college that you are eligible to participate in.',
    howItWorks: [
      'Join your college using its code from your Settings page first.',
      'Register for a drive, then track your round-by-round status here as the college updates it.'
    ]
  },
  resumeBuilder: {
    title: 'AI Resume Builder',
    whatItIs: 'Build a professional, ATS-friendly resume using guided templates and AI-assisted content suggestions.',
    howItWorks: [
      'Fill in each section (summary, experience, skills) or let AI draft suggestions from your profile.',
      'Choose a template and export/download your finished resume.'
    ]
  },
  jobAlerts: {
    title: 'Job Alerts',
    whatItIs: 'Automatic notifications when new jobs matching your saved search criteria are posted.',
    howItWorks: [
      'Set up a search (role, location, skills) and save it as an alert.',
      'You will be notified when a new matching job goes live.'
    ]
  },
  profileInsights: {
    title: 'Profile Insights',
    whatItIs: 'See who is viewing your profile and how it performs versus other candidates.',
    howItWorks: [
      'Recruiter/company profile views appear here as they happen.',
      'Use the insights to identify what to improve in your profile.'
    ]
  },
  careerCounselling: {
    title: 'Career Counselling',
    whatItIs: 'Book a one-on-one session with a career counsellor for guidance on your job search or career path.',
    howItWorks: [
      'Choose an available time slot and confirm your booking.',
      'Session usage counts against your plan\'s counselling quota.'
    ]
  },
  interviewPrep: {
    title: 'Interview Preparation',
    whatItIs: 'Practice common interview questions and get AI feedback tailored to your target role.',
    howItWorks: [
      'Pick a role or skill area to practice.',
      'Answer practice questions and review AI-generated feedback on your responses.'
    ]
  },
  skillTests: {
    title: 'Skill Assessments',
    whatItIs: 'Take short skill tests to earn verified badges that appear on your profile.',
    howItWorks: [
      'Choose a skill and difficulty level, then complete the timed test.',
      'A passing score adds a badge to your profile, visible to recruiters.'
    ]
  },
  salaryBenchmarking: {
    title: 'Salary Benchmarking',
    whatItIs: 'See how compensation for your role and experience level compares across the market.',
    howItWorks: [
      'Enter your role, location, and experience to get a benchmark range.',
      'Use this to negotiate offers or evaluate new opportunities.'
    ]
  },
  aiResumeReview: {
    title: 'AI Resume Review',
    whatItIs: 'Get an AI-generated critique of your uploaded resume with specific improvement suggestions.',
    howItWorks: [
      'Upload your resume (PDF).',
      'Review the AI feedback and update your resume accordingly.'
    ]
  },

  // ── Recruiter / Company ─────────────────────────────────────────────────
  companyDashboard: {
    title: 'Company Dashboard',
    whatItIs: 'Overview of your hiring activity — active jobs, applicants, and quick access to core recruiting tools.',
    howItWorks: [
      'Post jobs, review applicants, and track pipeline health from here.',
      'Stats reflect real-time data across all your posted jobs.'
    ]
  },
  recruiterSettings: {
    title: 'Company & Account Settings',
    whatItIs: 'Manage your company profile, admin account details, and organization information.',
    howItWorks: [
      'Complete your company profile before posting jobs or inviting team members.',
      'Changes here are visible on your public company profile.'
    ]
  },
  postJob: {
    title: 'Post a Job',
    whatItIs: 'Create a new job listing visible to matching candidates on the platform.',
    howItWorks: [
      'Fill in role details, requirements, salary, and location.',
      'Your subscription plan determines how many active job postings you can have at once.',
      'Once published, candidates can discover and apply to it immediately.'
    ]
  },
  applicants: {
    title: 'Applicants',
    whatItIs: 'All candidates who have applied to a specific job posting.',
    howItWorks: [
      'Review each applicant\'s profile and resume.',
      'Change their status (Reviewed, Shortlisted, Interview, Offer) to notify them automatically.'
    ]
  },
  companySubscription: {
    title: 'Subscription Plans',
    whatItIs: 'Compare and purchase plans that unlock premium recruiting features like ATS, Analytics, and Bulk Messaging.',
    howItWorks: [
      'Pick a plan and complete payment via Razorpay.',
      'Plans renew automatically unless auto-renew is turned off.',
      'All payments are final — see our Terms & Conditions for the no-refund policy.'
    ]
  },
  assignedRequests: {
    title: 'Requests',
    whatItIs: 'Recruiters requesting to join your organization, and your own requests to join other organizations.',
    howItWorks: [
      'As a company admin, review incoming join requests and accept as Employee or Recruiter (with page permissions).',
      'As a recruiter, search for a company and send a request to join their team.'
    ]
  },
  companyProfileManagement: {
    title: 'Company Profile Management',
    whatItIs: 'Manage the detailed company profile shown to candidates — culture, perks, tech stack, and media.',
    howItWorks: [
      'Fill in each section to build a compelling profile for candidates evaluating your company.',
      'A complete profile improves candidate trust and application rates.'
    ]
  },
  atsPipeline: {
    title: 'ATS Pipeline',
    whatItIs: 'A visual, drag-and-drop board for moving candidates through your hiring stages.',
    howItWorks: [
      'Drag candidate cards between stages (Applied → Interview → Offer, etc.) as they progress.',
      'Status changes here notify the candidate automatically.'
    ]
  },
  analytics: {
    title: 'Hiring Analytics',
    whatItIs: 'Funnel metrics and trends across all your job postings and hiring activity.',
    howItWorks: [
      'View conversion rates at each pipeline stage and time-to-hire trends.',
      'Use this data to identify where candidates are dropping off.'
    ]
  },
  bulkMessaging: {
    title: 'Bulk Messaging',
    whatItIs: 'Send the same message to multiple shortlisted candidates in one action.',
    howItWorks: [
      'Select recipients from your candidate list.',
      'Compose one message — it is delivered as a platform message and, where available, WhatsApp.'
    ]
  },
  myTeam: {
    title: 'My Team',
    whatItIs: 'Manage who has access to your organization — Employees and Recruiters — and what pages they can use.',
    howItWorks: [
      'Invite a new team member by email, choosing Employee or Recruiter.',
      'For Recruiters, grant access to specific pages (Post Job, Applicants, Analytics, etc.).',
      'Check the Activity tab to see what each recruiter has done.'
    ]
  },
  teamRoster: {
    title: 'My Team',
    whatItIs: 'Everyone with access to your organization’s recruiting workspace, and whether their seat is active.',
    howItWorks: [
      'This is a read-only view — invites, removals, and permission changes are managed by your organization admin.',
      'A member without an active seat has limited access until the admin reassigns one.'
    ]
  },
  videoInterview: {
    title: 'Video Interview',
    whatItIs: 'Conduct live video interviews with candidates directly on the platform.',
    howItWorks: [
      'Schedule an interview from a candidate\'s application.',
      'Join the video call at the scheduled time from your Interviews list.'
    ]
  },
  teamCollaboration: {
    title: 'Team Collaboration',
    whatItIs: 'Internal chat and coordination space for your hiring team — separate from candidate messaging.',
    howItWorks: [
      'Create a group, add teammates, and discuss candidates or hiring plans.',
      'Schedule internal calls directly from a chat group.'
    ]
  },
  interviewScheduling: {
    title: 'Interview Scheduling',
    whatItIs: 'Set up and manage upcoming interviews across all your open roles.',
    howItWorks: [
      'Pick a candidate, date, time, and mode (video/in-person).',
      'The candidate is notified automatically by email and WhatsApp.'
    ]
  },
  aiCandidateMatching: {
    title: 'AI Candidate Matching',
    whatItIs: 'AI-ranked candidates for a specific job, based on skill and profile fit.',
    howItWorks: [
      'Run matching on a job posting to generate a ranked candidate list.',
      'Match scores are an estimate — always review the full profile before deciding.'
    ]
  },
  bulkApplicantManagement: {
    title: 'Bulk Applicant Management',
    whatItIs: 'Take the same action (status change, export) on many applicants at once.',
    howItWorks: [
      'Select multiple applicants using the checkboxes.',
      'Apply a bulk status update or export the selection to CSV.'
    ]
  },
  myJobs: {
    title: 'My Jobs',
    whatItIs: 'All job postings you have created, with applicant counts and status at a glance.',
    howItWorks: [
      'Edit, close, or clone a job posting from this list.',
      'Click into a job to view its full applicant pipeline.'
    ]
  },
  candidateSearch: {
    title: 'Candidate Search',
    whatItIs: 'Search the candidate database directly by skills, experience, and location.',
    howItWorks: [
      'Enter search filters to find candidates matching your criteria.',
      'Your plan determines how many searches or profile views you get per day.'
    ]
  },
  driveRequests: {
    title: 'Campus Drive Requests',
    whatItIs: 'Invitations from colleges asking your company to participate in a campus placement drive.',
    howItWorks: [
      'Review each invite\'s drive details, then Accept or Reject.',
      'Once accepted, you can message the college directly to coordinate logistics.'
    ]
  },

  // ── College / TPO ───────────────────────────────────────────────────────
  collegeDashboard: {
    title: 'College Dashboard',
    whatItIs: 'Overview of your institution\'s placement activity — students, drives, and verification status.',
    howItWorks: [
      'Your college must be verified by our admin team before drives become visible to companies and students.',
      'Use the sidebar to manage students, drives, and reports.'
    ]
  },
  collegeStudents: {
    title: 'Students',
    whatItIs: 'The full roster of students registered under your college, with verification and placement status.',
    howItWorks: [
      'Import students in bulk via CSV, or let them self-register with your college code.',
      'Verify each student\'s ID before they can fully participate in drives.'
    ]
  },
  collegeDrives: {
    title: 'Campus Drives',
    whatItIs: 'Create and manage placement drives — the core tool for running your college\'s hiring events.',
    howItWorks: [
      'Create a drive with eligibility criteria and share the registration QR/link with students.',
      'Invite registered companies to participate (email/WhatsApp), or add companies manually.',
      'Move students through rounds and post announcements as the drive progresses.'
    ]
  },
  collegeSettings: {
    title: 'Settings & Verification Proof',
    whatItIs: 'Manage your college profile and upload the authorization document needed for platform verification.',
    howItWorks: [
      'Upload your proof document — our admin team reviews it to verify your institution.',
      'Unverified colleges cannot have drives or students visible to companies.'
    ]
  },
  collegeReports: {
    title: 'Reports & Passkey',
    whatItIs: 'Generate placement performance reports and a shareable executive summary link for your Principal/Management.',
    howItWorks: [
      'Generate a report to see placement stats (placed/total, package trends).',
      'Create a Principal Passkey to share a secure, no-login summary link with leadership.'
    ]
  },
  collegeVerification: {
    title: 'ID Verification',
    whatItIs: 'Approve or reject student ID/document verification requests.',
    howItWorks: [
      'Review each pending student\'s submitted documents.',
      'Approve to unlock full drive participation, or reject with a reason for resubmission.',
      'Your plan may cap how many students you can verify — check your Subscription page.'
    ]
  },

  // ── Admin / Subadmin ────────────────────────────────────────────────────
  adminDashboard: {
    title: 'Admin Dashboard',
    whatItIs: 'Platform-wide overview — total users, jobs, companies, and system health at a glance.',
    howItWorks: ['Use the sidebar to manage users, jobs, subscriptions, and platform settings.']
  },
  manageUsers: {
    title: 'Manage Users',
    whatItIs: 'View, search, and manage every user account on the platform.',
    howItWorks: [
      'Search by name, email, or role.',
      'Suspend, verify, or view full profile details for any account.'
    ]
  },
  adminUserProfile: {
    title: 'User Profile',
    whatItIs: 'Full detail view of a single user account, including subscription, activity, and history.',
    howItWorks: ['Use this to investigate support requests or verify account activity.']
  },
  manageJobs: {
    title: 'Manage Jobs',
    whatItIs: 'Review and moderate every job posting across the platform.',
    howItWorks: [
      'Remove listings that violate platform policy.',
      'Search and filter by company, status, or date posted.'
    ]
  },
  manageSubscriptions: {
    title: 'Manage Subscription Plans',
    whatItIs: 'Configure the pricing, features, and limits for every subscription tier on the platform.',
    howItWorks: [
      'Edit a plan\'s price, feature flags, and limits.',
      'Changes apply to new purchases; existing subscribers keep their terms until renewal.'
    ]
  },
  manageRenewals: {
    title: 'Manage Renewals',
    whatItIs: 'Track upcoming and failed subscription renewals across all paying accounts.',
    howItWorks: ['Send manual renewal reminders and monitor accounts at risk of downgrade after failed payments.']
  },
  manageRefunds: {
    title: 'Manage Refunds',
    whatItIs: 'Review and process exceptional refund requests (outside the standard no-refund policy).',
    howItWorks: ['Refunds are only issued in exceptional, approved cases — see the platform\'s Terms & Conditions.']
  },
  manageBuyers: {
    title: 'Manage Buyers',
    whatItIs: 'List of all paying customers across subscriptions and pay-per-feature purchases.',
    howItWorks: ['Click into any buyer to see their full payment history and account details.']
  },
  buyerDetails: {
    title: 'Buyer Details',
    whatItIs: 'Full payment and subscription history for a single buyer account.',
    howItWorks: ['Use this for billing support or dispute investigation.']
  },
  managePayPer: {
    title: 'Manage Pay-Per-Feature',
    whatItIs: 'Configure one-time/credit-based feature purchases available outside full subscriptions.',
    howItWorks: ['Edit pricing and credit limits for each pay-per-feature offering.']
  },
  adminSettings: {
    title: 'Admin Settings',
    whatItIs: 'Platform-level configuration and your own admin account settings.',
    howItWorks: ['Changes here can affect platform-wide behavior — proceed carefully.']
  },
  adminPaymentHistory: {
    title: 'Payment History',
    whatItIs: 'Complete log of every payment transaction processed on the platform.',
    howItWorks: ['Filter by date, subscriber type, or status to audit transactions.']
  },
  manageRequests: {
    title: 'Manage Requests',
    whatItIs: 'Oversight view of join requests and organizational assignments across all companies.',
    howItWorks: ['Use this to investigate or resolve disputes between recruiters and companies.']
  },
  adminTickets: {
    title: 'Support Tickets',
    whatItIs: 'All support tickets raised by users across the platform.',
    howItWorks: [
      'Respond to and resolve tickets, or escalate as needed.',
      'Status updates notify the user who raised the ticket.'
    ]
  },
  manageReviews: {
    title: 'Manage Reviews',
    whatItIs: 'Moderate company/platform reviews submitted by users.',
    howItWorks: ['Approve genuine reviews or remove ones that violate content guidelines.']
  },
  adminCollegeVerification: {
    title: 'College Verification',
    whatItIs: 'Approve or reject college registration and their submitted authorization proof documents.',
    howItWorks: [
      'Review each college\'s uploaded proof document.',
      'Approving makes their drives and students visible to companies and candidates; rejecting notifies them to resubmit.'
    ]
  },
  subAdminDashboard: {
    title: 'Sub-Admin Dashboard',
    whatItIs: 'A scoped-down admin view for moderation and support tasks delegated by the platform admin.',
    howItWorks: ['Use the sidebar to access the moderation and reporting tools assigned to your role.']
  },

  // ── Shared / Other ──────────────────────────────────────────────────────
  messages: {
    title: 'Messages',
    whatItIs: 'Direct conversations between you and other users on the platform (candidates, recruiters, colleges, companies).',
    howItWorks: [
      'Select a conversation from the list to view and reply.',
      'New messages trigger an email and, where a phone number is on file, a WhatsApp notification.'
    ]
  },
  raiseTicket: {
    title: 'Raise a Support Ticket',
    whatItIs: 'Get help from our support team for account, billing, or technical issues.',
    howItWorks: [
      'Describe your issue clearly and submit.',
      'Track responses and status under My Tickets.'
    ]
  },
  myTickets: {
    title: 'My Tickets',
    whatItIs: 'All support tickets you have raised and their current status.',
    howItWorks: ['Open a ticket to see the full conversation with our support team.']
  },
  writeReview: {
    title: 'Write a Review',
    whatItIs: 'Share your experience with a company or the platform to help other users.',
    howItWorks: ['Submit a rating and written review — it is moderated before appearing publicly.']
  },
  employeeDashboard: {
    title: 'Employee Dashboard',
    whatItIs: 'Your view as an Employee of an organization — access is limited to what your admin has assigned.',
    howItWorks: ['Use the sidebar for the specific tools your organization has enabled for your role.']
  },
  manageDrive: {
    title: 'Manage Drive',
    whatItIs: 'Your view as a Drive In-Charge, managing a specific campus drive on behalf of the college.',
    howItWorks: [
      'You can manage this drive\'s companies, rounds, and announcements as assigned by the college.',
      'Access is scoped to only the drive(s) you have been invited to manage.'
    ]
  },
  paymentHistory: {
    title: 'Payment History',
    whatItIs: 'Your complete record of subscription and pay-per-feature payments.',
    howItWorks: ['Each entry links to the plan or feature purchased, amount, and date — useful for expense records.']
  },
  payPerFeatures: {
    title: 'Pay-Per-Feature',
    whatItIs: 'One-time or credit-based purchases for a single feature, without committing to a full subscription.',
    howItWorks: [
      'Buy a credit pack for the feature you need.',
      'Credits are consumed as you use the feature and do not roll over unless stated otherwise.'
    ]
  },
};
